import { useState } from 'react'
import { Card } from './ui/card'
import type { Prompt } from '@/lib/types'

interface PromptCardProps {
  prompt: Prompt
  onClick: (prompt: Prompt) => void
  onTagClick?: (tag: string) => void
  onAuthorClick?: (author: string) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  'Nano Banana Pro': 'bg-neutral-900 text-white',
  'Midjourney': 'bg-neutral-900 text-white',
  'Grok': 'bg-neutral-900 text-white'
}

export function PromptCard({ prompt, onClick, onTagClick, onAuthorClick }: PromptCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const mainImage = prompt.images?.[currentImageIndex]?.image_url || (prompt as any).image
  const hasMultipleImages = prompt.images && prompt.images.length > 1
  const categoryNameRaw = (typeof prompt.category === 'string' ? prompt.category : prompt.category?.name) || ''
  const categoryName = categoryNameRaw || 'Nano Banana Pro'
  const categoryColor = CATEGORY_COLORS[categoryName] || 'bg-gray-700 text-white'
  
  // 优先使用 name，其次是 username
  const authorDisplayName = prompt.author?.name || prompt.author?.username || (prompt as any).author || 'Unknown'
  const authorUsername = prompt.author?.username
  const authorUrl = (prompt as any).authorUrl || (prompt.author as any)?.url || (prompt.author as any)?.homepage_url
  const tags = ((prompt as any).tags || []).filter((t: any) => typeof t === 'string' && !t.startsWith('@')).slice(0, 3)

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAuthorClick) {
      // 用 username 作为过滤键
      onAuthorClick(authorUsername || authorDisplayName)
    } else if (authorUrl) {
      window.open(authorUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? prompt.images!.length - 1 : prev - 1))
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === prompt.images!.length - 1 ? 0 : prev + 1))
  }

  return (
    <Card
      className="group overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col h-full bg-card border border-border"
      onClick={() => onClick(prompt)}
    >
      {/* Image Section */}
      {mainImage ? (
        <div className="relative w-full aspect-[3/4] bg-muted overflow-hidden flex-shrink-0 group">
          <img
            src={mainImage}
            alt={prompt.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Category Badge - Top Left */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-tight shadow-md ${categoryColor}`}>
            {categoryName}
          </div>

          {/* Image Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              
              {/* Image Indicator Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {prompt.images?.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentImageIndex ? 'bg-white w-3' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="relative w-full aspect-[3/4] bg-muted flex items-center justify-center flex-shrink-0">
          <span className="text-muted-foreground text-xs">No Image</span>
        </div>
      )}

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Title */}
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground">
          {prompt.title}
        </h3>

        {/* Author */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">by</span>
          <button
            onClick={handleAuthorClick}
            className="font-medium text-foreground hover:text-primary hover:underline cursor-pointer"
            title={authorUsername ? `@${authorUsername}` : authorDisplayName}
          >
            {authorDisplayName}
            {authorUsername && authorDisplayName !== authorUsername && (
              <span className="text-muted-foreground ml-1">@{authorUsername}</span>
            )}
          </button>
          {authorUrl && (
            <a
              href={authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-primary transition-colors"
              title="View author profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-external-link"
              >
                <path d="M15 3h6v6"></path>
                <path d="M10 14 21 3"></path>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              </svg>
            </a>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onTagClick?.(tag)
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

