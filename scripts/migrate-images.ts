import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'

dotenv.config()
process.stdout.setEncoding('utf8')

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

interface ImageRecord {
  id: string
  prompt_id: string
  order_index: number
  url: string
  storage_path: string | null
  created_at: string
}

interface ImageMapping {
  id: string
  prompt_id: string
  order_index: number
  old_url: string
  new_url: string
  status: 'success' | 'failed' | 'skipped'
  error?: string
}

function generateFileName(promptId: string, index: number): string {
  return `${promptId}-${index}.jpg`
}

function downloadImageOnce(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout (120s)'))
    }, 120000)

    https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
          'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'cache-control': 'max-age=0',
          'priority': 'u=1, i',
          'sec-ch-ua': '"Microsoft Edge";v="143", "Chromium";v="143", "Not.A/Brand";v="8"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'image',
          'sec-fetch-mode': 'no-cors',
          'sec-fetch-site': 'cross-site',
        },
      },
      (res) => {
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303 || res.statusCode === 307 || res.statusCode === 308) {
          const redirectUrl = res.headers.location
          if (redirectUrl) {
            https.get(redirectUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0' }}, (redirectRes) => {
              const chunks: Buffer[] = []
              redirectRes.on('data', (chunk) => chunks.push(chunk))
              redirectRes.on('end', () => { clearTimeout(timeout); resolve(Buffer.concat(chunks)) })
              redirectRes.on('error', (err) => { clearTimeout(timeout); reject(err) })
            })
            return
          }
        }

        const chunks: Buffer[] = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => { clearTimeout(timeout); resolve(Buffer.concat(chunks)) })
        res.on('error', (err) => { clearTimeout(timeout); reject(err) })
      }
    ).on('error', (err) => { clearTimeout(timeout); reject(err) })
  })
}

async function downloadImage(imageUrl: string, retries: number = 3): Promise<Buffer> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await downloadImageOnce(imageUrl)
    } catch (error) {
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
      } else {
        throw error
      }
    }
  }
  throw new Error('Download failed')
}

async function uploadImageToStorage(buffer: Buffer, filePath: string): Promise<string> {
  const { error } = await supabase.storage.from('prompt-images').upload(filePath, buffer, {
    contentType: 'image/jpeg',
    upsert: true,
  })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  return supabase.storage.from('prompt-images').getPublicUrl(filePath).data.publicUrl
}

async function saveImageLocally(buffer: Buffer, promptId: string, index: number): Promise<void> {
  const localDir = path.join(__dirname, '../downloaded-images', promptId)
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true })
  }
  const fileName = generateFileName(promptId, index)
  fs.writeFileSync(path.join(localDir, fileName), buffer)
}

async function processRecord(
  record: ImageRecord,
  idx: number,
  total: number,
  existingMapping: Record<string, ImageMapping>,
  imageMapping: ImageMapping[],
  mappingPath: string,
  updateSqlLines: string[]
): Promise<{ success: number; failed: number; skipped: number }> {
  const result = { success: 0, failed: 0, skipped: 0 }

  if (existingMapping[record.id]) {
    console.log(`[${idx + 1}/${total}] SKIP: ${record.prompt_id}/${record.order_index}`)
    result.skipped++
    result.success = existingMapping[record.id].status === 'success' ? 1 : 0
    result.failed = existingMapping[record.id].status === 'failed' ? 1 : 0
    return result
  }

  try {
    if (record.url && record.url.includes('supabase.co')) {
      console.log(`[${idx + 1}/${total}] SKIP (storage): ${record.prompt_id}/${record.order_index}`)
      imageMapping.push({ id: record.id, prompt_id: record.prompt_id, order_index: record.order_index, old_url: record.url, new_url: record.url, status: 'skipped' })
      fs.writeFileSync(mappingPath, JSON.stringify(imageMapping, null, 2), 'utf-8')
      result.success++
      result.skipped++
      return result
    }

    console.log(`[${idx + 1}/${total}] DOWNLOAD: ${record.prompt_id}/${record.order_index}`)

    let imageBuffer: Buffer
    try {
      imageBuffer = await downloadImage(record.url)
    } catch (downloadError) {
      const downloadErrorMsg = downloadError instanceof Error ? downloadError.message : String(downloadError)
      console.log(`  FAILED: ${downloadErrorMsg}`)
      imageMapping.push({ id: record.id, prompt_id: record.prompt_id, order_index: record.order_index, old_url: record.url, new_url: '', status: 'failed', error: downloadErrorMsg })
      fs.writeFileSync(mappingPath, JSON.stringify(imageMapping, null, 2), 'utf-8')
      result.failed++
      return result
    }

    await saveImageLocally(imageBuffer, record.prompt_id, record.order_index)

    const fileName = generateFileName(record.prompt_id, record.order_index)
    const filePath = `images/${fileName}`

    console.log(`  UPLOAD...`)
    const newUrl = await uploadImageToStorage(imageBuffer, filePath)

    imageMapping.push({ id: record.id, prompt_id: record.prompt_id, order_index: record.order_index, old_url: record.url, new_url: newUrl, status: 'success' })
    fs.writeFileSync(mappingPath, JSON.stringify(imageMapping, null, 2), 'utf-8')

    updateSqlLines.push(`UPDATE images SET url = '${newUrl}', storage_path = '${filePath}' WHERE id = '${record.id}';`)
    
    const sqlPath = path.join(__dirname, 'update-images-urls.sql')
    fs.writeFileSync(sqlPath, ['-- SQL update script for image URLs', `-- Last updated: ${new Date().toISOString()}`, '-- Execute this in Supabase Dashboard SQL Editor\n', ...updateSqlLines].join('\n'), 'utf-8')

    console.log(`  OK`)
    result.success++
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    imageMapping.push({ id: record.id, prompt_id: record.prompt_id, order_index: record.order_index, old_url: record.url, new_url: '', status: 'failed', error: errorMsg })
    fs.writeFileSync(mappingPath, JSON.stringify(imageMapping, null, 2), 'utf-8')
    console.log(`  ERROR: ${errorMsg}`)
    result.failed++
  }

  return result
}

async function migrateImages() {
  const dataPath = path.join(__dirname, 'images-data.json')
  if (!fs.existsSync(dataPath)) {
    console.error('images-data.json not found. Run: npx tsx scripts/query-images.ts')
    process.exit(1)
  }

  const imageRecords: ImageRecord[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  console.log(`Loaded ${imageRecords.length} records`)

  let existingMapping: Record<string, ImageMapping> = {}
  const mappingPath = path.join(__dirname, 'image-mapping.json')
  let imageMapping: ImageMapping[] = []

  if (fs.existsSync(mappingPath)) {
    imageMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'))
    imageMapping.forEach((item) => { existingMapping[item.id] = item })
    console.log(`Found ${Object.keys(existingMapping).length} existing items`)
  }

  console.log('\nStarting migration...')

  let totalSuccess = 0, totalFailed = 0, totalSkipped = 0
  const updateSqlLines: string[] = []
  const concurrencyLimit = 5

  for (let idx = 0; idx < imageRecords.length; idx += concurrencyLimit) {
    const batch = imageRecords.slice(idx, Math.min(idx + concurrencyLimit, imageRecords.length))
    console.log(`\n[Batch ${Math.floor(idx / concurrencyLimit) + 1}/${Math.ceil(imageRecords.length / concurrencyLimit)}] Processing ${batch.length} images...`)

    const promises = batch.map((record, batchIdx) =>
      processRecord(record, idx + batchIdx, imageRecords.length, existingMapping, imageMapping, mappingPath, updateSqlLines)
    )

    const results = await Promise.all(promises)
    results.forEach((r) => { totalSuccess += r.success; totalFailed += r.failed; totalSkipped += r.skipped })
  }

  console.log('\n' + '='.repeat(50))
  console.log(`Total: ${imageRecords.length}`)
  console.log(`Success: ${totalSuccess} | Failed: ${totalFailed} | Skipped: ${totalSkipped}`)
  console.log(`Success rate: ${((totalSuccess / imageRecords.length) * 100).toFixed(2)}%`)
  console.log('='.repeat(50))
  console.log('\nFiles generated:')
  console.log(`- ${mappingPath}`)
  console.log(`- ${path.join(__dirname, 'update-images-urls.sql')}`)
  console.log(`- ${path.join(__dirname, '../downloaded-images')}`)

  process.exit(0)
}

migrateImages().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
