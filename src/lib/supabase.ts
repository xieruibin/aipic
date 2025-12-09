import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using fallback to local JSON data.')
}

// 创建 Supabase 客户端
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null

// 数据库类型定义
export interface Author {
  id: string
  username: string
  name: string
  avatar_url: string | null
  url: string | null
  platform: string
  prompts_count: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface DbPrompt {
  id: string
  slug: string
  title_zh: string | null
  title_en: string | null
  description_zh: string | null
  description_en: string | null
  author_id: string | null
  category_id: string | null
  category_name: string | null
  likes_count: number
  views_count: number
  featured: boolean
  status: string
  created_at: string
  updated_at: string
}

export interface PromptContent {
  id: string
  prompt_id: string
  content: string
  order_index: number
  created_at: string
}

export interface DbImage {
  id: string
  prompt_id: string
  url: string
  storage_path: string | null
  is_cover: boolean
  order_index: number
  width: number | null
  height: number | null
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  usage_count: number
  created_at: string
}

export interface PromptTag {
  prompt_id: string
  tag_id: string
  created_at: string
}

// 完整提示词视图类型
export interface PromptFull extends DbPrompt {
  author_username: string | null
  author_name: string | null
  author_avatar: string | null
  author_url: string | null
  author_platform: string | null
  images: Array<{
    id: string
    url: string
    storage_path: string | null
    is_cover: boolean
    order_index: number
    width: number | null
    height: number | null
  }> | null
  tags: string[] | null
  contents: string[] | null
}

// Storage bucket 名称
export const STORAGE_BUCKETS = {
  PROMPT_IMAGES: 'prompt-images',
  AUTHOR_AVATARS: 'author-avatars',
} as const

// 获取公开文件URL
export function getPublicUrl(bucket: string, path: string): string {
  if (!supabase) return ''
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// 上传文件到Storage
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { cacheControl?: string; upsert?: boolean }
) {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      upsert: options?.upsert || false,
    })

  if (error) throw error
  return data
}

// 删除Storage中的文件
export async function deleteFile(bucket: string, path: string) {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

