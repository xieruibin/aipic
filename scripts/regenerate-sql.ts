import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
  const ext = 'jpg'
  return `${promptId}-${index}.${ext}`
}

const mappingPath = path.join(__dirname, 'image-mapping.json')

if (!fs.existsSync(mappingPath)) {
  console.error('image-mapping.json not found')
  process.exit(1)
}

const imageMapping: ImageMapping[] = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'))

console.log(`Found ${imageMapping.length} items in mapping file`)

const updateSqlLines: string[] = []

for (const item of imageMapping) {
  if (item.status === 'success' && item.old_url !== item.new_url) {
    const storageFile = `images/${generateFileName(item.prompt_id, item.order_index)}`
    updateSqlLines.push(
      `UPDATE images SET url = '${item.new_url}', storage_path = '${storageFile}' WHERE id = '${item.id}';`
    )
  }
}

const sqlPath = path.join(__dirname, 'update-images-urls.sql')
const sqlContent = [
  '-- SQL update script for image URLs',
  `-- Generated at: ${new Date().toISOString()}`,
  `-- Total success items: ${updateSqlLines.length}`,
  '-- Execute this in Supabase Dashboard SQL Editor\n',
  ...updateSqlLines,
]

fs.writeFileSync(sqlPath, sqlContent.join('\n'), 'utf-8')

console.log(`Generated ${updateSqlLines.length} UPDATE statements`)
console.log(`Saved to: ${sqlPath}`)
