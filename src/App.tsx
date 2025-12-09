import { useState, useEffect } from 'react'
import { SearchBar } from './components/SearchBar'
import { PromptGrid } from './components/PromptGrid'
import { MasonryGrid } from './components/MasonryGrid'
import { AddPromptDialog } from './components/AddPromptDialog'
import { PromptDetailModal } from './components/PromptDetailModal'
import { CategoryFilter } from './components/CategoryFilter'
import { CreatorsPage } from './pages/CreatorsPage'
import { AboutPage } from './pages/AboutPage'
import { CreatorDetailPage } from './pages/CreatorDetailPage'
import { Grid2x2, Columns, ArrowUp, Github, Globe, Sun, Moon } from 'lucide-react'
import type { Prompt } from './lib/types'
import type { Language } from './lib/i18n'
import { t } from './lib/i18n'
import { fetchPrompts as fetchPromptsFromAPI } from './lib/api'
import './index.css'

function App() {
  const [activePage, setActivePage] = useState<'home' | 'creators' | 'about' | 'creator-detail'>('home')
  const [selectedAuthorUsername, setSelectedAuthorUsername] = useState<string>('')
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [displayedPrompts, setDisplayedPrompts] = useState<Prompt[]>([])
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language | null
    return saved || 'zh'
  })
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
    return saved || 'system'
  })
  const ITEMS_PER_PAGE = 20

  // 保存语言设置到localStorage
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  // 保存主题设置到localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme)
    const htmlElement = document.documentElement
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      htmlElement.classList.toggle('dark', prefersDark)
    } else {
      htmlElement.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  const tr = t(language)

  const fetchPrompts = async () => {
    try {
      setLoading(true)
      // 从 Supabase 获取所有提示词
      const response = await fetchPromptsFromAPI({ 
        page: 1, 
        limit: 1000 // 一次获取足够多的数据
      })
      
      const data = (response.data || []).map((p: any) => ({
        ...p,
        id: p.id,
        title: p.title_zh || p.title_en || '',
        description: p.description_zh || p.description_en || '',
        category: { name: p.category_name || '' },
        content: (p.prompts || []).join('\n') || '',
        likes_count: p.likes_count || 0,
        views_count: p.views_count || 0,
        images: (p.images || []).map((img: any, idx: number) => ({
          image_url: img.url,
          is_cover: idx === 0
        })),
        tags: p.tags || [],
        author: p.author || { username: 'Unknown' }
      }))
      
      setPrompts(data)
      setFilteredPrompts(data)
      setDisplayedPrompts(data.slice(0, ITEMS_PER_PAGE))
      setCurrentPage(1)
    } catch (error) {
      console.error('Error loading prompts:', error)
      // 失败时回退到空数组
      setPrompts([])
      setFilteredPrompts([])
      setDisplayedPrompts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrompts()
  }, [])

  // 监听滚动加载更多
  useEffect(() => {
    const handleScroll = () => {
      if (loading) return
      
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      
      // 显示/隐藏回到顶部按钮
      setShowBackToTop(scrollTop > 400)
      
      // 距离底部 500px 时加载
      if (scrollTop + clientHeight >= scrollHeight - 500) {
        const nextPage = currentPage + 1
        const startIndex = (nextPage - 1) * ITEMS_PER_PAGE
        const endIndex = nextPage * ITEMS_PER_PAGE
        
        if (startIndex < filteredPrompts.length) {
          setDisplayedPrompts(prev => [
            ...prev,
            ...filteredPrompts.slice(startIndex, endIndex)
          ])
          setCurrentPage(nextPage)
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentPage, filteredPrompts, loading])

  useEffect(() => {
    if (!searchQuery.trim() && !selectedCategory && selectedTags.length === 0 && selectedAuthors.length === 0) {
      setFilteredPrompts(prompts)
      setDisplayedPrompts(prompts.slice(0, ITEMS_PER_PAGE))
      setCurrentPage(1)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = prompts.filter((prompt) => {
      // 分类过滤
      if (selectedCategory) {
        const promptCategoryName = prompt.category?.name
        if (promptCategoryName !== selectedCategory) {
          return false
        }
      }

      // 标签过滤（全部标签都需命中）
      if (selectedTags.length > 0) {
        const promptTags = (prompt.tags || []).map((t: any) => typeof t === 'string' ? t.toLowerCase() : '')
        if (!selectedTags.every((tag) => promptTags.includes(tag.toLowerCase()))) {
          return false
        }
      }

      // 作者过滤
      if (selectedAuthors.length > 0) {
        const authorUsername = prompt.author?.username?.toLowerCase() || ''
        if (!selectedAuthors.some(author => authorUsername === author.toLowerCase())) {
          return false
        }
      }

      // 搜索过滤
      if (query.trim()) {
        const titleMatch = prompt.title?.toLowerCase().includes(query) || false
        const contentMatch = prompt.content?.toLowerCase().includes(query) || false
        const descriptionMatch = prompt.description?.toLowerCase().includes(query) || false
        const tagsMatch = prompt.tags?.some((tag) => 
          (typeof tag === 'string' ? tag.toLowerCase() : '').includes(query)
        ) || false
        const authorMatch = prompt.author?.username?.toLowerCase().includes(query) || false
        
        return titleMatch || contentMatch || descriptionMatch || tagsMatch || authorMatch
      }

      return true
    })
    setFilteredPrompts(filtered)
    setDisplayedPrompts(filtered.slice(0, ITEMS_PER_PAGE))
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, prompts, selectedTags, selectedAuthors])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCardClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedPrompt(null), 300)
  }

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev : [...prev, tag])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleClearTags = () => {
    setSelectedTags([])
  }

  const handleAuthorClick = (author: string) => {
    setSelectedAuthors((prev) => prev.includes(author) ? prev : [...prev, author])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRemoveAuthor = (author: string) => {
    setSelectedAuthors((prev) => prev.filter((a) => a !== author))
  }

  const handleClearAuthors = () => {
    setSelectedAuthors([])
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-xl font-bold">AI PROMPT GALLEY</span>
              </a>
              
              {/* Navigation Menu */}
              <nav className="hidden md:flex items-center gap-6">
                <a 
                  href="#browse-section" 
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    setActivePage('home')
                  }}
                >
                  {tr('promptLibrary')}
                </a>
                <a 
                  href="#creators" 
                  className={`text-sm font-medium transition-colors ${
                    activePage === 'creators'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    setActivePage('creators')
                  }}
                >
                  {tr('creators')}
                </a>
                <a 
                  href="#about" 
                  className={`text-sm font-medium transition-colors ${
                    activePage === 'about'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    setActivePage('about')
                  }}
                >
                  {tr('about')}
                </a>
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-card border border-border rounded-lg p-1">
                <button
                  onClick={() => setLanguage('zh')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    language === 'zh'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    language === 'en'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  English
                </button>
              </div>
              
              {/* Mobile Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                className="sm:hidden inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                title={language === 'zh' ? 'Switch to English' : '切换为中文'}
              >
                <Globe size={18} />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => {
                  const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
                  const currentIndex = themes.indexOf(theme)
                  const nextTheme = themes[(currentIndex + 1) % themes.length]
                  setTheme(nextTheme)
                }}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                title={`Current theme: ${theme}`}
              >
                {theme === 'light' && <Sun size={20} />}
                {theme === 'dark' && <Moon size={20} />}
                {theme === 'system' && <Globe size={20} />}
              </button>
              
              <a
                href="https://github.com/xieruibin/aipic"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                title="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://gitee.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center"
                title="Gitee"
                aria-label="Gitee"
              >
                <img
                  src="/logo-black.0c964084.svg"
                  alt="Gitee"
                  className="h-6 object-contain opacity-70 hover:opacity-100 transition-opacity"
                />
              </a>
              <AddPromptDialog onPromptAdded={fetchPrompts} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8" id="browse-section">
        {activePage === 'creator-detail' ? (
          <CreatorDetailPage 
            username={selectedAuthorUsername}
            language={language}
            onBack={() => setActivePage('creators')}
          />
        ) : activePage === 'creators' ? (
          <CreatorsPage 
            language={language}
            onSelectAuthor={(username) => {
              setSelectedAuthorUsername(username)
              setActivePage('creator-detail')
            }}
          />
        ) : activePage === 'about' ? (
          <AboutPage language={language} />
        ) : (
          <div className="space-y-8">
            {/* Search Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center space-y-2 mb-4">
                <h2 className="text-3xl font-bold tracking-tight">
                  {tr('aiPromptLibrary')}
                </h2>
                <p className="text-muted-foreground">
                  {tr('libraryDescription')}
                </p>
              </div>
              <SearchBar onSearch={handleSearch} language={language} />
              {/* 已选标签和作者区域 */}
              {(selectedTags.length > 0 || selectedAuthors.length > 0) && (
                <div className="w-full max-w-2xl mx-auto mt-2 mb-2 flex flex-wrap items-center gap-2 bg-card border border-border rounded-xl px-4 py-3">
                  <span className="text-muted-foreground mr-2">{tr('selectedFilters')}</span>
                  {selectedTags.map((tag) => (
                    <span key={`tag-${tag}`} className="inline-flex items-center px-3 py-1 rounded-full bg-slate-600 text-white text-sm font-medium gap-1">
                      #{tag}
                      <button
                        className="ml-1 text-xs text-white/80 hover:text-red-400"
                        onClick={() => handleRemoveTag(tag)}
                        title="移除标签"
                      >×</button>
                    </span>
                  ))}
                  {selectedAuthors.map((author) => (
                    <span key={`author-${author}`} className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-medium gap-1">
                      @{author}
                      <button
                        className="ml-1 text-xs text-white/80 hover:text-red-400"
                        onClick={() => handleRemoveAuthor(author)}
                        title="移除作者"
                      >×</button>
                    </span>
                  ))}
                  <button
                    className="ml-auto text-xs text-red-500 hover:underline"
                    onClick={() => {
                      handleClearTags()
                      handleClearAuthors()
                    }}
                  >{tr('clearAll')}</button>
                </div>
              )}
            </div>

            {/* Category Filter and View Mode Toggle */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              {/* Category Filter */}
              <div className="w-full xl:w-auto">
                <CategoryFilter 
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  language={language}
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-card hover:bg-accent text-muted-foreground hover:text-foreground border border-border'
                  }`}
                  title="卡片视图"
                >
                  <Grid2x2 size={16} />
                  <span>{tr('cardView')}</span>
                </button>
                <button
                  onClick={() => setViewMode('masonry')}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'masonry'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-card hover:bg-accent text-muted-foreground hover:text-foreground border border-border'
                  }`}
                  title="瀑布流视图"
                >
                  <Columns size={16} />
                  <span>{tr('masonryView')}</span>
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="mt-8">
              {(searchQuery || selectedCategory) && (
                <p className="text-sm text-muted-foreground mb-4">
                  {tr('foundResults')} {filteredPrompts.length} {tr('results')}
                </p>
              )}
              {viewMode === 'grid' ? (
                <PromptGrid 
                  prompts={displayedPrompts} 
                  loading={loading}
                  onCardClick={handleCardClick}
                  onTagClick={handleTagClick}
                  onAuthorClick={handleAuthorClick}
                />
              ) : (
                <MasonryGrid 
                  prompts={displayedPrompts} 
                  loading={loading}
                  onCardClick={handleCardClick}
                  onTagClick={handleTagClick}
                  onAuthorClick={handleAuthorClick}
                />
              )}
              
              {/* 加载更多提示 */}
              {displayedPrompts.length < filteredPrompts.length && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{tr('loadingMore')}</p>
                </div>
              )}
              {displayedPrompts.length === filteredPrompts.length && filteredPrompts.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{tr('allLoaded')} {filteredPrompts.length} {tr('items')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <PromptDetailModal
        prompt={selectedPrompt}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onTagClick={handleTagClick}
        onAuthorClick={handleAuthorClick}
        language={language}
      />

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>{tr('footerText')}</p>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 animate-in fade-in zoom-in"
          aria-label={tr('backToTop')}
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}

export default App
