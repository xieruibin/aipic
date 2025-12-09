/**
 * 检查 Supabase 数据库状态
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('🔍 检查 Supabase 数据库状态...\n')
  console.log(`📡 连接到: ${supabaseUrl}\n`)

  const tables = ['authors', 'categories', 'prompts', 'prompt_contents', 'images', 'tags', 'prompt_tags']

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`❌ 表 '${table}': 不存在或无法访问`)
        console.log(`   错误: ${error.message}`)
      } else {
        console.log(`✅ 表 '${table}': 存在 (${count || 0} 条记录)`)
      }
    } catch (err: any) {
      console.log(`❌ 表 '${table}': 检查失败`)
      console.log(`   错误: ${err.message}`)
    }
  }

  console.log('\n📋 建议:')
  console.log('如果看到表不存在，请在 Supabase Dashboard 的 SQL Editor 中执行:')
  console.log('  supabase/schema.sql')
}

checkDatabase()
