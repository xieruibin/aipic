import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'

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

async function queryAndSaveImages() {
  console.log('Querying images table from database...')
  
  const { data, error } = await supabase.from('images').select('*')

  if (error) {
    console.error('Database query failed:', error)
    process.exit(1)
  }

  const images = (data as ImageRecord[]) || []
  console.log(`Found ${images.length} image records`)

  // Save to file
  const outputPath = path.join(__dirname, 'images-data.json')
  fs.writeFileSync(outputPath, JSON.stringify(images, null, 2), 'utf-8')
  console.log(`\nSaved to: ${outputPath}`)

  // Show summary
  console.log('\nSummary:')
  console.log(`Total records: ${images.length}`)
  
  const withoutStorage = images.filter(img => !img.storage_path).length
  const withStorage = images.filter(img => img.storage_path).length
  
  console.log(`Already in storage: ${withStorage}`)
  console.log(`Need migration: ${withoutStorage}`)

  // Show sample
  console.log('\nSample records (first 3):')
  images.slice(0, 3).forEach((img, idx) => {
    console.log(`\n[${idx + 1}] ID: ${img.id}`)
    console.log(`    Prompt: ${img.prompt_id}/${img.order_index}`)
    console.log(`    URL: ${img.url.substring(0, 60)}...`)
    console.log(`    Storage Path: ${img.storage_path || 'none'}`)
  })
}

queryAndSaveImages()
