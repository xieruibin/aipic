import { supabase } from './supabase'

/**
 * 初始化 Supabase 数据库表
 * 此模块检查所有必要的表是否存在，如果不存在则提示用户。
 */

export async function initializeSupabase(): Promise<boolean> {
  try {
    console.log('🔄 检查 Supabase 数据库表...')

    // 检查所有必需的表
    const requiredTables = [
      'authors',
      'categories',
      'prompts',
      'prompt_tags',
      'prompt_images',
      'prompt_likes',
      'comments',
    ]

    const missingTables: string[] = []

    for (const table of requiredTables) {
      const exists = await checkTableExists(table)
      if (exists) {
        console.log(`✓ ${table} 表存在`)
      } else {
        console.warn(`✗ ${table} 表不存在`)
        missingTables.push(table)
      }
    }

    if (missingTables.length > 0) {
      console.warn(
        `\n⚠️ 缺少 ${missingTables.length} 个表: ${missingTables.join(', ')}`
      )
      console.warn(
        '\n📋 请在 Supabase Dashboard SQL Editor 中执行 SUPABASE_SCHEMA_FIXED.sql 中的 SQL'
      )
      console.warn('详见：README.md 中的"Supabase 设置"部分\n')
      return false
    }

    console.log('✅ 所有 Supabase 表已准备就绪！')
    return true
  } catch (error) {
    console.error('❌ 检查 Supabase 失败:', error)
    return false
  }
}

/**
 * 检查表是否存在
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName).select('id').limit(1)

    // 如果没有错误，表存在
    if (!error) return true

    // 如果错误信息包含"relation"不存在，表不存在
    if (
      error.message.includes('relation') ||
      error.message.includes('does not exist')
    ) {
      return false
    }

    // 其他类型的错误也表示表不存在
    return false
  } catch {
    return false
  }
}

/**
 * 检查存储桶
 */
/**
 * 获取存储桶的公开 URL
 */
export function getImageUrl(bucketName: string, filePath: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`
}

/**
 * 上传图片到存储桶
 */
export async function uploadImage(
  file: File,
  fileName?: string
): Promise<string> {
  const name = fileName || `${Date.now()}-${file.name}`

  const { error } = await supabase.storage
    .from('prompt-images')
    .upload(name, file)

  if (error) throw error

  return getImageUrl('prompt-images', name)
}
