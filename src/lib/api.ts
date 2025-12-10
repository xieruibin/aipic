import { supabase, type DbPrompt, type Author } from './supabase';

export interface PromptWithAuthor extends DbPrompt {
  author?: Author | null;
  prompts?: string[];
}

export interface FetchPromptsOptions {
  page?: number;
  limit?: number;
  authorId?: string;
  categoryId?: string;
  search?: string;
  featured?: boolean;
}

export interface FetchPromptsResponse {
  data: PromptWithAuthor[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * 获取所有作者（带提示词计数）
 */
export async function fetchAuthors(options?: {
  limit?: number
  offset?: number
  sortBy?: 'prompts_count' | 'name' | 'created_at'
  order?: 'asc' | 'desc'
}) {
  try {
    if (!supabase) throw new Error('Supabase not initialized')
    
    // 先获取作者列表
    let query = supabase
      .from('authors')
      .select('*', { count: 'exact' })

    // 排序
    const sortBy = options?.sortBy || 'prompts_count';
    const order = options?.order || 'desc';
    query = query.order(sortBy, { ascending: order === 'asc' });

    // 分页
    if (options?.limit) {
      query = query.limit(options.limit);
      if (options?.offset) {
        query = query.range(options.offset, options.offset + options.limit - 1);
      }
    }

    const { data: authors, error, count } = await query;

    if (error) throw error;

    // 为每个作者获取前4张图片
    const authorsWithImages = await Promise.all(
      (authors || []).map(async (author: any) => {
        if (!supabase) return { ...author, images: [] };
        
        const { data: prompts } = await supabase
          .from('prompts')
          .select('images(url)')
          .eq('author_id', author.id)
          .eq('status', 'published')
          .limit(4);

        const images = (prompts || [])
          .flatMap((p: any) => (p.images || []).map((img: any) => img.url))
          .slice(0, 4);

        return {
          ...author,
          images
        };
      })
    );

    return {
      data: authorsWithImages,
      total: count || 0,
    };
  } catch (error) {
    console.error('获取作者失败:', error);
    return { data: [], total: 0 };
  }
}

/**
 * 通过用户名获取作者及其所有提示词
 */
export async function fetchAuthorByUsername(username: string) {
  try {
    if (!supabase) throw new Error('Supabase not initialized')

    

    // 获取作者信息
    const { data: author, error: authorError } = await supabase
      .from('authors')
      .select('*')
      .eq('username', username)
      .single();

    

    if (authorError) throw authorError;
    if (!author) return null;

    // 获取作者的所有提示词（包括内容、图片、标签）
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select(`
        *,
        images(url, order_index),
        prompt_tags(tags(name)),
        prompt_contents(content, order_index)
      `)
      .eq('author_id', author.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    

    if (promptsError) throw promptsError;

    // 格式化 prompts 数据，确保 images 与内容按 order_index 排序
    const formattedPrompts = (prompts || []).map((p: any) => ({
      ...p,
      prompts: (p.prompt_contents || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((pc: any) => pc.content)
        .filter(Boolean),
      images: (p.images || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((img: any) => ({
          url: img.url,
          order_index: img.order_index
        })),
      tags: (p.prompt_tags || [])
        .map((pt: any) => pt.tags?.name)
        .filter(Boolean)
    }));

    

    // 打印首个 prompt 的 prompts 字段样例，便于确认前端能拿到 content
    

    return {
      ...author,
      prompts: formattedPrompts,
    };
  } catch (error) {
    console.error(`获取作者 ${username} 失败:`, error);
    return null;
  }
}

/**
 * 获取提示词列表（分页）
 */
export async function fetchPrompts(
  options: FetchPromptsOptions = {}
): Promise<FetchPromptsResponse> {
  try {
    if (!supabase) throw new Error('Supabase not initialized')
    
    const {
      page = 1,
      limit = 20,
      authorId,
      categoryId,
      search,
      featured,
    } = options

    const offset = (page - 1) * limit

    let query = supabase
      .from('prompts')
      .select(
        `
        *,
        authors (*),
        prompt_contents(content),
        images(url, order_index),
        prompt_tags(tags(name))
      `,
        { count: 'exact' }
      )
      .eq('status', 'published');

    // 过滤条件
    if (authorId) {
      query = query.eq('author_id', authorId);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (featured) {
      query = query.eq('featured', true);
    }

    // 搜索（简单的模糊搜索）
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(
        `title_zh.ilike.${searchTerm},description_zh.ilike.${searchTerm},title_en.ilike.${searchTerm},description_en.ilike.${searchTerm}`
      );
    }

    // 排序和分页
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const prompts = (data || []).map((p: any) => ({
      ...p,
      author: p.authors,
      prompts: (p.prompt_contents || []).map((pc: any) => pc.content || ''),
      images: (p.images || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((img: any) => ({
          url: img.url,
          order_index: img.order_index
        })),
      tags: (p.prompt_tags || [])
        .map((pt: any) => pt.tags?.name)
        .filter(Boolean)
    }));

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: prompts,
      total: count || 0,
      page,
      totalPages,
    };
  } catch (error) {
    console.error('获取提示词列表失败:', error);
    return {
      data: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }
}

/**
 * 通过 ID 获取单个提示词详情（包括内容、图片、标签）
 */
export async function fetchPromptById(promptId: string): Promise<PromptWithAuthor | null> {
  try {
    if (!supabase) throw new Error('Supabase not initialized')
    
    // 获取提示词基本信息
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select(
        `
        *,
        authors (*)
      `
      )
      .eq('id', promptId)
      .single();

    if (promptError) throw promptError;
    if (!prompt) return null;

    // 获取内容
    const { data: contents, error: contentsError } = await supabase
      .from('prompt_contents')
      .select('content')
      .eq('prompt_id', promptId)
      .order('order_index', { ascending: true });

    if (contentsError) throw contentsError;

    // 获取图片
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('*')
      .eq('prompt_id', promptId)
      .order('order_index', { ascending: true });

    if (imagesError) throw imagesError;

    // 获取标签
    const { data: tagRelations, error: tagsError } = await supabase
      .from('prompt_tags')
      .select('tags(name)')
      .eq('prompt_id', promptId);

    if (tagsError) throw tagsError;

    const tags = tagRelations?.map((t: any) => t.tags?.name).filter(Boolean) || [];

    return {
      ...prompt,
      author: prompt.authors,
      prompts: contents?.map((c: any) => c.content) || [],
      images: images || [],
      tags,
    };
  } catch (error) {
    console.error(`获取提示词 ${promptId} 详情失败:`, error);
    return null;
  }
}

/**
 * 获取分类列表
 */
export async function fetchCategories() {
  try {
    if (!supabase) throw new Error('Supabase not initialized')
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
    return []
  }
}

/**
 * 获取热门标签
 */
export async function fetchPopularTags(limit: number = 20) {
  try {
    if (!supabase) throw new Error('Supabase not initialized')
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('获取热门标签失败:', error);
    return [];
  }
}

/**
 * 获取推荐的提示词
 */
export async function fetchFeaturedPrompts(limit: number = 10) {
  try {
    if (!supabase) throw new Error('Supabase not initialized')
    const { data, error } = await supabase
      .from('prompts')
      .select(
        `
        *,
        authors (*),
        prompt_contents(content)
      `
      )
      .eq('featured', true)
      .eq('status', 'published')
      .order('likes_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((p: any) => ({
      ...p,
      author: p.authors,
      prompts: (p.prompt_contents || []).map((pc: any) => pc.content || ''),
    }));
  } catch (error) {
    console.error('获取推荐提示词失败:', error);
    return [];
  }
}

/**
 * 增加提示词浏览次数
 */
export async function incrementPromptViews(promptId: string) {
  try {
    if (!supabase) throw new Error('Supabase not initialized')
    const { error } = await supabase.rpc('increment_views', {
      prompt_id: promptId,
    });

    if (error && error.code !== 'PGRST204') {
      // PGRST204 = function not found, 如果函数不存在就跳过
      console.warn('增加浏览次数失败:', error);
    }
  } catch (error) {
    console.error('增加浏览次数失败:', error);
  }
}

/**
 * 获取用户喜欢的提示词（需要认证）
 */
export async function fetchUserLikedPrompts(_userId: string) {
  try {
    // 这个功能需要添加 user_likes 表和认证逻辑
    // 暂时返回空数组
    return [];
  } catch (error) {
    console.error('获取用户喜欢的提示词失败:', error);
    return [];
  }
}

/**
 * 切换提示词的点赞状态（需要认证）
 */
export async function togglePromptLike(_promptId: string, _userId: string) {
  try {
    // 这个功能需要添加 user_likes 表和认证逻辑
    // 暂时只返回 false
    return false;
  } catch (error) {
    console.error('切换点赞状态失败:', error);
    return false;
  }
}

/**
 * 搜索提示词和作者
 */
export async function searchPrompts(query: string, options?: {
  limit?: number
  includeAuthors?: boolean
}) {
  try {
    if (!supabase) throw new Error('Supabase not initialized')
    const limit = options?.limit || 10
    const searchTerm = `%${query}%`

    // 搜索提示词
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('*,authors(*),prompt_contents(content)')
      .or(
        `title_zh.ilike.${searchTerm},description_zh.ilike.${searchTerm},title_en.ilike.${searchTerm},description_en.ilike.${searchTerm}`
      )
      .eq('status', 'published')
      .limit(limit);

    if (promptsError) throw promptsError;

    let authors = [];

    // 搜索作者
    if (options?.includeAuthors) {
      const { data: authorData, error: authorsError } = await supabase
        .from('authors')
        .select('*')
        .or(`name.ilike.${searchTerm},username.ilike.${searchTerm}`)
        .limit(limit);

      if (authorsError) throw authorsError;
      authors = authorData || [];
    }

    return {
      prompts: prompts || [],
      authors,
    };
  } catch (error) {
    console.error('搜索失败:', error);
    return {
      prompts: [],
      authors: [],
    };
  }
}
