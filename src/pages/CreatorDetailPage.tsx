import { useState, useEffect } from 'react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import type { Language } from '../lib/i18n'
import { PromptDetailModal } from '../components/PromptDetailModal'
import type { Prompt } from '../lib/types'
import { fetchAuthorByUsername } from '../lib/api'

interface Author {
  id?: string
  username: string
  name: string
  url: string
  avatar_url: string
  platform: string
  prompts_count: number
}

interface CreatorDetailPageProps {
  username: string
  language: Language
  onBack: () => void
}

export function CreatorDetailPage({ username, language, onBack }: CreatorDetailPageProps) {
  const isZh = language === 'zh'
  const [author, setAuthor] = useState<Author | null>(null)
  const [prompts, setPrompts] = useState<any[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const loadAuthorData = async () => {
      try {
        const data = await fetchAuthorByUsername(username)
        
        if (!data) {
          setAuthor(null)
          return
        }

        setAuthor({
          ...data,
          avatar: data.avatar_url
        } as any)

        // 转换提示词数据
        const authorPrompts = (data.prompts || []).map((p: any, idx: number) => ({
          id: p.id || String(idx),
          title: p.title_zh || p.title_en || '',
          description: p.description_zh || p.description_en || '',
          // 从后端返回的 p.prompts（数组）或 p.content 填充 content，保证弹窗能显示文本
          content: (p.prompts && p.prompts.length) ? p.prompts.join('\n') : (p.content || ''),
          author_id: p.author_id || '',
          likes_count: p.likes_count || 0,
          views_count: p.views_count || 0,
          featured: p.featured || false,
          status: p.status || 'published',
          created_at: p.created_at || new Date().toISOString(),
          updated_at: p.updated_at || new Date().toISOString(),
          author: data,
          tags: p.tags || [],
          images: (p.images || []).map((img: any, imgIdx: number) => ({
            image_url: img.url,
            is_cover: imgIdx === 0
          })),
          is_liked: false,
          // 将后端已格式化的 prompts 数组直接保留，供弹窗使用
          prompts: p.prompts || []
        }))
        setPrompts(authorPrompts)
      } catch (error) {
        console.error('Failed to load author data:', error)
      }
    }

    loadAuthorData()
  }, [username])

  if (!author) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{isZh ? '加载中...' : 'Loading...'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            title={isZh ? '返回' : 'Back'}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={author.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + author.username}
              alt={author.name}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + author.username
              }}
              className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-semibold truncate">{author.name || author.username}</h1>
              <p className="text-sm text-muted-foreground truncate">@{author.username}</p>
            </div>
          </div>
          <a
            href={author.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
            title={`Visit on ${author.platform}`}
          >
            <ExternalLink size={20} />
          </a>
        </div>
      </div>

      {/* Author Info Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <img
                src={author.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + author.username}
                alt={author.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + author.username
                }}
                className="w-24 h-24 rounded-full object-cover border-2 border-border flex-shrink-0"
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{author.name || author.username}</h1>
                <p className="text-lg text-muted-foreground mb-4">@{author.username}</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {author.platform.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary-foreground text-sm font-medium">
                    {author.prompts_count} {isZh ? '图片' : 'images'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prompts Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">
            {isZh ? '所有作品' : 'All Works'} ({prompts.length})
          </h2>

          {prompts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{isZh ? '暂无作品' : 'No prompts yet'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {prompts.map((prompt, idx) => (
                <div
                  key={`${author.username}-${idx}`}
                  className="group overflow-hidden rounded-lg border border-border bg-card hover:shadow-lg transition-all cursor-pointer flex flex-col h-full"
                  onClick={() => {
                    setSelectedPrompt(prompt)
                    setIsModalOpen(true)
                  }}
                >
                  {/* Image Section */}
                  {prompt.images && prompt.images.length > 0 ? (
                    <div className="relative w-full aspect-[3/4] bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={prompt.images[0].image_url}
                        alt={prompt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Image Count Badge */}
                      {prompt.images.length > 1 && (
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-semibold bg-black/70 text-white">
                          +{prompt.images.length - 1}
                        </div>
                      )}

                      {/* Prompt Count Badge */}
                      {prompt.content && (
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/90 text-primary-foreground">
                          {prompt.content.split('\n').length} {isZh ? '提示词' : 'prompts'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full aspect-[3/4] bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-muted-foreground text-xs">{isZh ? '无图片' : 'No Image'}</span>
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    {/* Title */}
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground">
                      {prompt.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {prompt.description}
                    </p>

                    {/* Tags */}
                    {prompt.tags && prompt.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {prompt.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Hover Button */}
                  <div className="px-4 pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
                      {isZh ? '查看提示词' : 'View Prompts'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Prompts Modal */}
      <PromptDetailModal
        prompt={selectedPrompt}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPrompt(null)
        }}
        language={language}
      />
    </div>
  )
}
