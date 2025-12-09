import { PromptCard } from './PromptCard'
import type { Prompt } from '@/lib/types'

interface PromptGridProps {
  prompts: Prompt[]
  loading?: boolean
  onCardClick?: (prompt: Prompt) => void
  onTagClick?: (tag: string) => void
  onAuthorClick?: (author: string) => void
}

export function PromptGrid({ prompts, loading, onCardClick, onTagClick, onAuthorClick }: PromptGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] bg-muted animate-pulse rounded-lg"
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onClick={() => onCardClick?.(prompt)}
          onTagClick={onTagClick}
          onAuthorClick={onAuthorClick}
        />
      ))}
    </div>
  )
}
