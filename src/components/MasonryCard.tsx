import { useState } from 'react'
import { Card } from './ui/card'
import type { Prompt } from '@/lib/types'

interface MasonryCardProps {
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

export function MasonryCard({ prompt, onClick, onTagClick, onAuthorClick }: MasonryCardProps) {
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
      className="group relative overflow-hidden hover:shadow-lg transition-all cursor-pointer"
      onClick={() => onClick(prompt)}
    >
      {mainImage ? (
        <div className="relative w-full bg-muted overflow-hidden group">
          <img
            src={mainImage}
            alt={prompt.title}
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Gradient overlay to ensure readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Category Badge - Top Left */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-tight shadow-md ${categoryColor}`}>
            {categoryName}
          </div>

          {/* Image Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              
              {/* Image Indicator Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
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

          {/* Hover overlay with title + author */}
          <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-white space-y-1 drop-shadow-sm flex-1">
              <p className="text-sm font-semibold leading-snug line-clamp-2">{prompt.title}</p>
              <button
                onClick={handleAuthorClick}
                className="text-xs text-slate-200 hover:text-white hover:underline cursor-pointer"
                title={authorUsername ? `@${authorUsername}` : authorDisplayName}
              >
                {authorDisplayName}
                {authorUsername && authorDisplayName !== authorUsername && (
                  <span className="ml-1">@{authorUsername}</span>
                )}
              </button>
            </div>
          </div>

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
      ) : (
        <div className="relative w-full bg-muted flex items-center justify-center py-32">
          <span className="text-muted-foreground text-xs">No Image</span>
        </div>
      )}
    </Card>
  )
}
