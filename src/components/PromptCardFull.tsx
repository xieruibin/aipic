import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Share2, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Prompt } from '@/lib/types'

interface PromptCardProps {
  prompt: Prompt
  onClick?: () => void
}

export function PromptCardFull({ prompt, onClick }: PromptCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(prompt.likes_count)

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  const mainImage = prompt.images?.[0]?.image_url

  return (
    <Link
      to={`/prompt/${prompt.id}`}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        {/* 图片 */}
        {mainImage && (
          <div className="relative w-full aspect-video bg-muted overflow-hidden">
            <img
              src={mainImage}
              alt={prompt.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {prompt.featured && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                ⭐ 精选
              </div>
            )}
          </div>
        )}

        <CardContent className="flex-1 flex flex-col p-4 space-y-3">
          {/* 分类和标签 */}
          <div className="flex items-center gap-2 flex-wrap">
            {prompt.category && (
              <Link
                to={`/category/${prompt.category.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs px-2 py-1 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
              >
                {prompt.category.name}
              </Link>
            )}
            {prompt.tags?.slice(0, 2).map((tag) => (
              <Link
                key={tag}
                to={`/search?tag=${encodeURIComponent(tag)}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs px-2 py-1 bg-muted rounded-full hover:bg-muted/80 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>

          {/* 标题 */}
          <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
            {prompt.title}
          </h3>

          {/* 描述 */}
          {prompt.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {prompt.description}
            </p>
          )}

          {/* 内容预览 */}
          <p className="text-xs text-muted-foreground line-clamp-2 italic">
            "{prompt.content}"
          </p>

          {/* 作者信息 */}
          {prompt.author && (
            <Link
              to={`/author/${prompt.author.username}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 pt-2 border-t hover:opacity-70 transition-opacity"
            >
              {prompt.author.avatar_url && (
                <img
                  src={prompt.author.avatar_url}
                  alt={prompt.author.username}
                  className="w-6 h-6 rounded-full bg-muted"
                />
              )}
              <span className="text-xs font-medium truncate">
                @{prompt.author.username}
              </span>
            </Link>
          )}

          {/* 互动统计 */}
          <div className="flex items-center gap-4 pt-2 border-t text-xs text-muted-foreground">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 hover:text-foreground transition-colors ${
                isLiked ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {likes}
            </button>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {prompt.views_count}
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              评论
            </div>
            <button className="ml-auto hover:text-foreground transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default PromptCardFull
