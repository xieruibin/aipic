/**
 * Supabase 数据类型定义
 */

export interface Author {
  id: string
  username: string
  avatar_url?: string
  bio?: string
  followers_count: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  description?: string
  color?: string
  display_order: number
  created_at: string
}

export interface Prompt {
  id: string
  title: string
  description?: string
  content: string
  author_id: string
  category_id?: string
  likes_count: number
  views_count: number
  featured: boolean
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
  author?: Author
  category?: Category
  tags?: string[]
  images?: PromptImage[]
  is_liked?: boolean
}

export interface PromptImage {
  id: string
  prompt_id: string
  image_url: string
  alt_text?: string
  display_order: number
  created_at: string
}

export interface PromptTag {
  id: string
  prompt_id: string
  tag_name: string
  created_at: string
}

export interface Comment {
  id: string
  prompt_id: string
  author_id: string
  content: string
  likes_count: number
  status: 'published' | 'archived'
  created_at: string
  updated_at: string
  author?: Author
}

export interface PromptLike {
  id: string
  prompt_id: string
  user_ip: string
  created_at: string
}

export interface ListOptions {
  page?: number
  pageSize?: number
  orderBy?: 'latest' | 'popular' | 'likes'
  categoryId?: string
  authorId?: string
  searchQuery?: string
  featured?: boolean
}
