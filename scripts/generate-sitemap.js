import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

interface SitemapUrl {
  loc: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

async function generateSitemap() {
  const baseUrl = 'https://aipic-iota.vercel.app'
  const urls: SitemapUrl[] = []

  // 添加静态页面
  urls.push({
    loc: `${baseUrl}/`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 1.0
  })

  urls.push({
    loc: `${baseUrl}/creators`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.8
  })

  urls.push({
    loc: `${baseUrl}/about`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.6
  })

  try {
    // 获取所有创作者
    const { data: authors, error: authorsError } = await supabase
      .from('authors')
      .select('username, updated_at')
      .order('username')

    if (authorsError) {
      console.error('Error fetching authors:', authorsError)
    } else if (authors) {
      authors.forEach(author => {
        urls.push({
          loc: `${baseUrl}/creator/${author.username}`,
          lastmod: author.updated_at ? new Date(author.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.7
        })
      })
    }

    // 可选：添加热门 prompts（如果有详情页）
    // const { data: prompts } = await supabase
    //   .from('prompts')
    //   .select('id, updated_at')
    //   .limit(1000)
    // ...

  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  // 生成 XML
  const xml = generateSitemapXml(urls)

  // 写入文件
  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml')
  fs.writeFileSync(outputPath, xml, 'utf-8')

  console.log(`✅ Sitemap generated successfully with ${urls.length} URLs`)
  console.log(`📝 File saved to: ${outputPath}`)
}

function generateSitemapXml(urls: SitemapUrl[]): string {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`

  const urlEntries = urls.map(url => `
  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`).join('')

  return `${header}${urlEntries}
</urlset>`
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// 运行脚本
generateSitemap().catch(console.error)
