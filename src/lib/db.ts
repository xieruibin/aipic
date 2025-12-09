import { createClient } from '@supabase/supabase-js'
import type {
  Author,
  Category,
  Prompt,
  PromptImage,
  Comment,
  ListOptions
} from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============= 作者操作 =============
export async function getAuthor(id: string): Promise<Author | null> {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('获取作者失败:', error)
    return null
  }
  return data
}

export async function getAuthorByUsername(username: string): Promise<Author | null> {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('username', username)
    .single()

  if (error) return null
  return data
}

export async function listAuthors(limit = 50): Promise<Author[]> {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .order('followers_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('获取作者列表失败:', error)
    return []
  }
  return data || []
}

export async function createAuthor(author: Partial<Author>): Promise<Author | null> {
  const { data, error } = await supabase
    .from('authors')
    .insert([author])
    .select()
    .single()

  if (error) {
    console.error('创建作者失败:', error)
    return null
  }
  return data
}

// ============= 分类操作 =============
export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('获取分类列表失败:', error)
    return []
  }
  return data || []
}

export async function getCategory(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

// ============= 提示词操作 =============
export async function listPrompts(options: ListOptions = {}): Promise<{
  prompts: Prompt[]
  total: number
}> {
  const {
    page = 1,
    pageSize = 20,
    orderBy = 'latest',
    categoryId,
    authorId,
    searchQuery,
    featured
  } = options

  let query = supabase
    .from('prompts')
    .select(
      `*,
       author:author_id(id, username, avatar_url, bio, followers_count),
       category:category_id(id, name, slug, icon, color),
       images:prompt_images(image_url, alt_text),
       tags:prompt_tags(tag_name)`,
      { count: 'exact' }
    )
    .eq('status', 'published')

  // 应用过滤条件
  if (categoryId) query = query.eq('category_id', categoryId)
  if (authorId) query = query.eq('author_id', authorId)
  if (featured) query = query.eq('featured', true)

  // 搜索
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
  }

  // 排序
  switch (orderBy) {
    case 'popular':
      query = query.order('views_count', { ascending: false })
      break
    case 'likes':
      query = query.order('likes_count', { ascending: false })
      break
    case 'latest':
    default:
      query = query.order('created_at', { ascending: false })
  }

  // 分页
  const offset = (page - 1) * pageSize
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('获取提示词列表失败:', error)
    return { prompts: [], total: 0 }
  }

  // 转换数据格式
  const prompts = (data || []).map((item: any) => ({
    ...item,
    tags: item.tags?.map((t: any) => t.tag_name) || []
  }))

  return { prompts, total: count || 0 }
}

export async function getPrompt(id: string): Promise<Prompt | null> {
  const { data, error } = await supabase
    .from('prompts')
    .select(
      `*,
       author:author_id(id, username, avatar_url, bio, followers_count),
       category:category_id(id, name, slug, icon, color),
       tags:prompt_tags(tag_name),
       images:prompt_images(id, image_url, alt_text, display_order)`
    )
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error) {
    console.error('获取提示词失败:', error)
    return null
  }

  if (!data) return null

  return {
    ...data,
    tags: data.tags?.map((t: any) => t.tag_name) || [],
    images: data.images || []
  }
}

export async function createPrompt(prompt: Partial<Prompt>): Promise<Prompt | null> {
  const { data, error } = await supabase
    .from('prompts')
    .insert([prompt])
    .select()
    .single()

  if (error) {
    console.error('创建提示词失败:', error)
    return null
  }
  return data
}

export async function updatePrompt(
  id: string,
  updates: Partial<Prompt>
): Promise<Prompt | null> {
  const { data, error } = await supabase
    .from('prompts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('更新提示词失败:', error)
    return null
  }
  return data
}

// ============= 提示词标签操作 =============
export async function addPromptTag(promptId: string, tagName: string): Promise<boolean> {
  const { error } = await supabase
    .from('prompt_tags')
    .insert([{ prompt_id: promptId, tag_name: tagName }])

  if (error) {
    console.error('添加标签失败:', error)
    return false
  }
  return true
}

export async function removePromptTag(promptId: string, tagName: string): Promise<boolean> {
  const { error } = await supabase
    .from('prompt_tags')
    .delete()
    .eq('prompt_id', promptId)
    .eq('tag_name', tagName)

  if (error) return false
  return true
}

export async function getPromptTags(promptId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('prompt_tags')
    .select('tag_name')
    .eq('prompt_id', promptId)

  if (error) return []
  return data?.map(t => t.tag_name) || []
}

// ============= 提示词配图操作 =============
export async function addPromptImage(
  promptId: string,
  imageUrl: string,
  altText?: string
): Promise<PromptImage | null> {
  const { data, error } = await supabase
    .from('prompt_images')
    .insert([{ prompt_id: promptId, image_url: imageUrl, alt_text: altText }])
    .select()
    .single()

  if (error) {
    console.error('添加提示词配图失败:', error)
    return null
  }
  return data
}

export async function getPromptImages(promptId: string): Promise<PromptImage[]> {
  const { data, error } = await supabase
    .from('prompt_images')
    .select('*')
    .eq('prompt_id', promptId)
    .order('display_order', { ascending: true })

  if (error) return []
  return data || []
}

// ============= 点赞操作 =============
export async function likePrompt(promptId: string, userIp: string): Promise<boolean> {
  const { error } = await supabase
    .from('prompt_likes')
    .insert([{ prompt_id: promptId, user_ip: userIp }])

  if (error) {
    console.error('点赞失败:', error)
    return false
  }

  // 更新点赞计数
  const { data: prompt } = await supabase
    .from('prompts')
    .select('likes_count')
    .eq('id', promptId)
    .single()

  if (prompt) {
    await supabase
      .from('prompts')
      .update({ likes_count: (prompt.likes_count || 0) + 1 })
      .eq('id', promptId)
  }

  return true
}

export async function unlikePrompt(promptId: string, userIp: string): Promise<boolean> {
  const { error } = await supabase
    .from('prompt_likes')
    .delete()
    .eq('prompt_id', promptId)
    .eq('user_ip', userIp)

  if (error) {
    console.error('取消点赞失败:', error)
    return false
  }

  // 更新点赞计数
  const { data: prompt } = await supabase
    .from('prompts')
    .select('likes_count')
    .eq('id', promptId)
    .single()

  if (prompt) {
    await supabase
      .from('prompts')
      .update({ likes_count: Math.max(0, (prompt.likes_count || 1) - 1) })
      .eq('id', promptId)
  }

  return true
}

export async function isPromptLiked(promptId: string, userIp: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('prompt_likes')
    .select('id')
    .eq('prompt_id', promptId)
    .eq('user_ip', userIp)
    .single()

  if (error) return false
  return !!data
}

// ============= 评论操作 =============
export async function listComments(promptId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(
      `*,
       author:author_id(id, username, avatar_url, bio, followers_count)`
    )
    .eq('prompt_id', promptId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('获取评论失败:', error)
    return []
  }
  return data || []
}

export async function addComment(
  promptId: string,
  authorId: string,
  content: string
): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ prompt_id: promptId, author_id: authorId, content }])
    .select(
      `*,
       author:author_id(id, username, avatar_url, bio, followers_count)`
    )
    .single()

  if (error) {
    console.error('添加评论失败:', error)
    return null
  }
  return data
}

// ============= 统计数据 =============
export async function incrementPromptViews(promptId: string): Promise<boolean> {
  const { data: prompt, error: readError } = await supabase
    .from('prompts')
    .select('views_count')
    .eq('id', promptId)
    .single()

  if (readError) return false

  const { error: updateError } = await supabase
    .from('prompts')
    .update({ views_count: (prompt?.views_count || 0) + 1 })
    .eq('id', promptId)

  return !updateError
}

// ============= 搜索与统计 =============
export async function searchPrompts(query: string, limit = 10): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from('prompts')
    .select(
      `*,
       author:author_id(id, username, avatar_url),
       tags:prompt_tags(tag_name)`
    )
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .eq('status', 'published')
    .limit(limit)

  if (error) return []

  return (data || []).map((item: any) => ({
    ...item,
    tags: item.tags?.map((t: any) => t.tag_name) || []
  }))
}

export async function getPromptStats(): Promise<{
  totalPrompts: number
  totalAuthors: number
  totalCategories: number
}> {
  const [promptsRes, authorsRes, categoriesRes] = await Promise.all([
    supabase.from('prompts').select('id', { count: 'exact' }).eq('status', 'published'),
    supabase.from('authors').select('id', { count: 'exact' }),
    supabase.from('categories').select('id', { count: 'exact' })
  ])

  return {
    totalPrompts: promptsRes.count || 0,
    totalAuthors: authorsRes.count || 0,
    totalCategories: categoriesRes.count || 0
  }
}
