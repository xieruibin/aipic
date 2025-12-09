import { useState } from 'react'
import { Input } from './ui/input'
import { Search } from 'lucide-react'
import type { Language } from '../lib/i18n'
import { t } from '../lib/i18n'

interface SearchBarProps {
  onSearch: (query: string) => void
  language?: Language
}

export function SearchBar({ onSearch, language = 'zh' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const tr = t(language)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
      <Input
        type="text"
        placeholder={tr('searchPlaceholder')}
        value={query}
        onChange={handleChange}
        className="pl-10 h-12 text-base"
      />
    </div>
  )
}
