import { useEffect, useState } from 'react'
import type { Language } from '../lib/i18n'
import { t } from '../lib/i18n'
import * as db from '../lib/db'

interface CategoryFilterProps {
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  language?: Language
  prompts?: Array<{ category?: { name: string } }>
}

const CATEGORY_COLORS: Record<string, string> = {
  'All': '',
  'Nano Banana Pro': 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
  'Midjourney': 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900',
  'Grok': 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900'
}

export function CategoryFilter({ selectedCategory, onCategoryChange, language = 'zh', prompts = [] }: CategoryFilterProps) {
  const tr = t(language)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const result = await db.listCategories()
        let allCategories = result && result.length > 0 ? result : [
          { id: '1', name: 'Nano Banana Pro' },
          { id: '2', name: 'Midjourney' },
          { id: '3', name: 'Grok' }
        ]
        
        // 根据 prompts 计数，只保留有内容的分类
        const categoryCounts = new Map<string, number>()
        prompts.forEach(p => {
          const catName = p.category?.name
          if (catName) {
            categoryCounts.set(catName, (categoryCounts.get(catName) || 0) + 1)
          }
        })
        
        const filteredCategories = allCategories.filter(cat =>
          (categoryCounts.get(cat.name) || 0) > 0
        )
        
        setCategories(filteredCategories)
      } catch (error) {
        console.error('获取分类失败:', error)
        setCategories([
          { id: '1', name: 'Nano Banana Pro' },
          { id: '2', name: 'Midjourney' },
          { id: '3', name: 'Grok' }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [prompts])

  if (loading) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button
        onClick={() => onCategoryChange(null)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          selectedCategory === null
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-card hover:bg-accent text-muted-foreground hover:text-foreground border border-border'
        }`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        {tr('featured')}
      </button>
      
      {categories.map((category) => {
        const isSelected = selectedCategory === category.name
        const colorClass = CATEGORY_COLORS[category.name] || ''
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.name)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              isSelected
                ? 'bg-primary text-primary-foreground shadow-sm border-transparent'
                : `${colorClass} hover:shadow-sm`
            }`}
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}
