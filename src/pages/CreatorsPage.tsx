import { useState, useEffect } from 'react'
import { ExternalLink, Search, Users } from 'lucide-react'
import type { Language } from '../lib/i18n'
import { fetchAuthors } from '../lib/api'

interface Author {
  id?: string
  username: string
  name: string
  url: string
  avatar_url: string
  platform: string
  prompts_count: number
}

type AuthorWithImages = Author & { images: string[] }

interface CreatorsPageProps {
  language: Language
  onSelectAuthor?: (username: string) => void
}

export function CreatorsPage({ language, onSelectAuthor }: CreatorsPageProps) {
  const [authors, setAuthors] = useState<AuthorWithImages[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredAuthors, setFilteredAuthors] = useState<AuthorWithImages[]>([])
  const [displayedAuthors, setDisplayedAuthors] = useState<AuthorWithImages[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<'count' | 'name'>('count')
  const [totalAuthors, setTotalAuthors] = useState(0)
  const ITEMS_PER_PAGE = 12

  // 从 Supabase 加载作者数据
  useEffect(() => {
    const loadAuthors = async () => {
      try {
        const { data, total } = await fetchAuthors({ 
          limit: 1000,
          sortBy: 'prompts_count',
          order: 'desc'
        })
        
        const enriched = (data || []).map((a: any) => ({
          ...a,
          avatar: a.avatar_url,
          images: a.images || [] // 使用 API 返回的图片
        }))

        setAuthors(enriched)
        setFilteredAuthors(enriched)
        setTotalAuthors(total)
      } catch (error) {
        console.error('Failed to load authors:', error)
      }
    }

    loadAuthors()
  }, [])

  useEffect(() => {
    let filtered = authors.filter((author) => {
      const query = searchQuery.toLowerCase()
      return (
        author.username.toLowerCase().includes(query) ||
        author.name.toLowerCase().includes(query)
      )
    })

    // 排序
    if (sortBy === 'count') {
      filtered.sort((a, b) => b.prompts_count - a.prompts_count)
    } else {
      filtered.sort((a, b) => (a.name || a.username).localeCompare(b.name || b.username))
    }

    setFilteredAuthors(filtered)
    setDisplayedAuthors(filtered.slice(0, ITEMS_PER_PAGE))
    setCurrentPage(1)
  }, [searchQuery, authors, sortBy])

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      
      if (scrollTop + clientHeight >= scrollHeight - 500) {
        const nextPage = currentPage + 1
        const startIndex = (nextPage - 1) * ITEMS_PER_PAGE
        const endIndex = nextPage * ITEMS_PER_PAGE
        
        if (startIndex < filteredAuthors.length) {
          setDisplayedAuthors(prev => [
            ...prev,
            ...filteredAuthors.slice(startIndex, endIndex)
          ])
          setCurrentPage(nextPage)
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentPage, filteredAuthors])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8" />
            <h1 className="text-3xl font-bold">{language === 'zh' ? '创作者' : 'Creators'}</h1>
          </div>
          <p className="text-muted-foreground">
            {language === 'zh'
              ? `发现 ${totalAuthors} 位优秀创作者分享的 AI 艺术提示词`
              : `Discover AI art prompts from ${totalAuthors} amazing creators`}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={language === 'zh' ? '搜索创作者...' : 'Search creators...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('count')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'count'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {language === 'zh' ? '按提示词数' : 'By Prompts'}
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'name'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {language === 'zh' ? '按名称' : 'By Name'}
            </button>
          </div>
        </div>

        {/* Authors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedAuthors.map((author: AuthorWithImages) => (
            <div
              key={author.username}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => onSelectAuthor?.(author.username)}>
                  <img
                    src={author.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + author.username}
                    alt={author.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + author.username
                    }}
                    className="w-12 h-12 rounded-full object-cover border border-border"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground leading-tight hover:text-primary transition-colors truncate">{author.name || author.username}</div>
                    <div className="text-sm text-muted-foreground leading-tight truncate">@{author.username}</div>
                  </div>
                </div>
                <a
                  href={author.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                  title={`Visit ${author.name || author.username} on ${author.platform}`}
                >
                  <ExternalLink size={18} />
                </a>
              </div>

              {/* Media grid */}
              <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden mb-3 bg-muted/30">
                {(author.images && author.images.length > 0 ? author.images : [undefined, undefined, undefined, undefined]).slice(0, 4).map((img: string | undefined, idx: number) => (
                  <div key={idx} className="aspect-[4/3] bg-muted/50">
                    {img ? (
                      <img src={img} alt={`${author.username}-${idx}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {author.platform.toUpperCase()}
                </span>
                <span className="font-semibold text-foreground">{author.prompts_count} {language === 'zh' ? '提示词' : 'prompts'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Loading more indicator */}
        {displayedAuthors.length < filteredAuthors.length && (
          <div className="text-center py-8 text-muted-foreground">
            <p>{language === 'zh' ? '滚动加载更多...' : 'Scroll for more...'}</p>
          </div>
        )}
        
        {displayedAuthors.length === filteredAuthors.length && filteredAuthors.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>{language === 'zh' ? '已加载全部' : 'All loaded'} {filteredAuthors.length} {language === 'zh' ? '位创作者' : 'creators'}</p>
          </div>
        )}

        {/* Empty state */}
        {filteredAuthors.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {language === 'zh' ? '加载中...' : 'Loading...'}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 pt-8 border-t border-border flex justify-center gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-foreground">{authors.length}</div>
            <div className="text-sm text-muted-foreground">
              {language === 'zh' ? '创作者' : 'Creators'}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">
              {authors.reduce((sum, a) => sum + a.prompts_count, 0)}
            </div>
            <div className="text-sm text-muted-foreground">
              {language === 'zh' ? '个提示词' : 'Total Prompts'}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">
              {Math.round(authors.reduce((sum, a) => sum + a.prompts_count, 0) / authors.length)}
            </div>
            <div className="text-sm text-muted-foreground">
              {language === 'zh' ? '平均提示词' : 'Avg Prompts'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
