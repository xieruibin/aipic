import { MasonryCard } from './MasonryCard'
import type { Prompt } from '@/lib/types'

interface MasonryGridProps {
  prompts: Prompt[]
  loading?: boolean
  onCardClick?: (prompt: Prompt) => void
  onTagClick?: (tag: string) => void
  onAuthorClick?: (author: string) => void
}

export function MasonryGrid({ prompts, loading, onCardClick, onTagClick, onAuthorClick }: MasonryGridProps) {
  if (loading) {
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-muted animate-pulse rounded-lg break-inside-avoid h-64"
          />
        ))}
      </div>
    )
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">暂无提示词</p>
      </div>
    )
  }

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {prompts.map((prompt) => (
        <div key={prompt.id} className="break-inside-avoid">
          <MasonryCard
            prompt={prompt}
            onClick={() => onCardClick?.(prompt)}
            onTagClick={onTagClick}
            onAuthorClick={onAuthorClick}
          />
        </div>
      ))}
    </div>
  )
}
