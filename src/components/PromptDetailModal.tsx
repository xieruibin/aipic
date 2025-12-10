import { useState, useEffect } from 'react'
import { X, Copy, Check, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Prompt } from '@/lib/types'
import type { Language } from '../lib/i18n'
import { t } from '../lib/i18n'

interface PromptDetailModalProps {
  prompt: Prompt | null
  isOpen: boolean
  onClose: () => void
  onTagClick?: (tag: string) => void
  onAuthorClick?: (author: string) => void
  language?: Language
}

export function PromptDetailModal({
  prompt,
  isOpen,
  onClose,
  onTagClick,
  onAuthorClick,
  language = 'zh',
}: PromptDetailModalProps) {
  const tr = t(language)
  const [copied, setCopied] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showPrompts, setShowPrompts] = useState(false)

  // 当打开/切换 prompt 时重置图片索引
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [prompt])

  if (!isOpen || !prompt) return null

  const images = prompt.images || []
  const currentImage = images[currentImageIndex]?.image_url || images[0]?.image_url
  const authorName = prompt.author?.username || 'Unknown'
  const authorUrl = (prompt.author as any)?.url
  const authorAvatar = (prompt.author as any)?.avatar
  const tags = ((prompt as any).tags || []).filter((t: any) => typeof t === 'string')
  const prompts = (prompt as any).prompts || []
  const promptText = Array.isArray(prompts) ? prompts.join('\n') : (prompt.content || '')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(promptText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onTagClick?.(tag)
    onClose()
  }

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAuthorClick) {
      onAuthorClick(authorName)
      onClose()
    } else if (authorUrl) {
      window.open(authorUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* 桌面端布局 */}
      <div
        className="hidden md:flex bg-slate-900 rounded-2xl max-w-7xl w-full h-[85vh] overflow-hidden shadow-2xl flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors text-white"
        >
          <X className="h-6 w-6" />
        </button>

        {/* 左侧图片区域 */}
        <div className="w-full md:w-[55%] bg-black flex flex-col relative">
          {/* 图片展示 */}
          <div className="flex-1 flex items-center justify-center relative">
            {currentImage ? (
              <>
                <img
                  src={currentImage}
                  alt={prompt.title}
                  className="w-full h-full object-contain"
                />

                {/* 图片导航 */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* 图片计数 */}
                    <div className="absolute bottom-6 right-6 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                      {currentImageIndex + 1}/{images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-white/50 text-center">
                <p className="text-lg">暂无图片</p>
              </div>
            )}
          </div>

          {/* 缩略图条：支持横向滚动与点击选择 */}
          {images.length > 1 && (
            <div className="flex gap-2 px-3 py-2 overflow-x-auto bg-black/20">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-14 rounded-md overflow-hidden border ${currentImageIndex === idx ? 'ring-2 ring-offset-1 ring-white' : 'border-transparent'}`}
                >
                  <img src={(img as any).image_url || (img as any).url} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* 左下角作者信息 */}
          <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3">
            {authorAvatar && (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-10 h-10 rounded-full border-2 border-white/20"
              />
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAuthorClick}
                className="text-white font-medium hover:text-blue-400 transition-colors cursor-pointer"
              >
                @{authorName}
              </button>
              {authorUrl && (
                <a
                  href={authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 右侧信息面板 */}
        <div className="w-full md:w-[45%] bg-slate-800 flex flex-col">
          {/* 头部：分类标签 */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-700">
            {prompt.category && (
              <span className="inline-block px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg uppercase tracking-wider">
                {(prompt.category as any).name || prompt.category}
              </span>
            )}
          </div>

          {/* 标题 */}
          <div className="px-6 py-4 border-b border-slate-700">
            <h1 className="text-2xl font-bold text-white leading-tight">
              {prompt.title}
            </h1>
          </div>

          {/* 可滚动内容区域 */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* 描述 */}
            {prompt.description && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Description</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {prompt.description}
                </p>
              </div>
            )}

            {/* 提示词 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Prompts</h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      {tr('copySuccess')}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {tr('copy')}
                    </>
                  )}
                </button>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                <pre className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {promptText}
                </pre>
              </div>
            </div>

            {/* 标签 */}
            {tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string, index: number) => (
                    <button
                      key={index}
                      onClick={(e) => handleTagClick(tag, e)}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 手机端布局 */}
      <div
        className="md:hidden w-full max-w-md h-[90vh] bg-black rounded-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 图片展示区域 */}
        <div className={`${showPrompts ? 'h-48' : 'flex-1'} flex items-center justify-center relative bg-black transition-all duration-300`}>
          {currentImage ? (
            <>
              <img
                src={currentImage}
                alt={prompt.title}
                className="w-full h-full object-contain"
              />

              {/* 图片导航 */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* 图片计数 */}
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {currentImageIndex + 1}/{images.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-white/50 text-center">
              <p>暂无图片</p>
            </div>
          )}
        </div>

        {/* 手机端缩略图（小屏） */}
        {images.length > 1 && (
          <div className="md:hidden flex gap-2 px-3 py-2 overflow-x-auto bg-black/10">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border ${currentImageIndex === idx ? 'ring-2 ring-offset-1 ring-white' : 'border-transparent'}`}
              >
                <img src={(img as any).image_url || (img as any).url} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* 底部栏：作者 + 按钮 */}
        <div className="bg-slate-900 border-t border-slate-700 px-4 py-3 flex items-center justify-between gap-3">
          {/* 左侧：作者信息 */}
          <button
            onClick={handleAuthorClick}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            {authorAvatar && (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-8 h-8 rounded-full border border-white/20 flex-shrink-0"
              />
            )}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-white font-medium text-sm truncate">@{authorName}</span>
              {authorUrl && (
                <ExternalLink className="h-3.5 w-3.5 text-white/60 flex-shrink-0" />
              )}
            </div>
          </button>

          {/* 右侧：显示提示词按钮 */}
          <button
            onClick={() => setShowPrompts(!showPrompts)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
          >
            {showPrompts ? '关闭' : '提示词'}
          </button>
        </div>

        {/* 提示词详情面板（手机端展开） */}
        {showPrompts && (
          <div className="bg-slate-800 border-t border-slate-700 flex flex-col flex-1 overflow-hidden">
            {/* 标题和分类 */}
            <div className="px-4 py-3 border-b border-slate-700 bg-slate-900">
              <p className="text-white font-semibold text-sm mb-2 line-clamp-2">{prompt.title}</p>
              {prompt.category && (
                <span className="inline-block px-2 py-1 bg-slate-800 text-white text-xs font-semibold rounded uppercase tracking-wider">
                  {(prompt.category as any).name || prompt.category}
                </span>
              )}
            </div>

            {/* 可滚动的提示词内容 */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {/* 描述 */}
              {prompt.description && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-slate-400 mb-1.5 uppercase">Description</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {prompt.description}
                  </p>
                </div>
              )}

              {/* 提示词 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase">Prompts</h3>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        复制
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                  <pre className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono break-words">
                    {promptText}
                  </pre>
                </div>
              </div>

              {/* 标签 */}
              {tags.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag: string, index: number) => (
                      <button
                        key={index}
                        onClick={(e) => handleTagClick(tag, e)}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
