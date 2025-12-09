import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AddPromptDialogProps {
  onPromptAdded: () => void
}

export function AddPromptDialog({ onPromptAdded }: AddPromptDialogProps) {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || !supabase) return

    setLoading(true)
    try {
      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag)

      const { error } = await supabase!.from('prompts').insert([
        {
          prompt: prompt.trim(),
          tags: tagsArray.length > 0 ? tagsArray : null,
        },
      ])

      if (error) throw error

      setPrompt('')
      setTags('')
      setOpen(false)
      onPromptAdded()
    } catch (error) {
      console.error('Error adding prompt:', error)
      alert('添加提示词失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="border border-border bg-card text-muted-foreground hover:text-foreground"
          aria-label="添加提示词"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>添加新提示词</DialogTitle>
            <DialogDescription>
              分享你的创意提示词，帮助更多人创作
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="prompt" className="text-sm font-medium">
                提示词内容
              </label>
              <Textarea
                id="prompt"
                placeholder="输入提示词内容..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px]"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">
                标签（可选）
              </label>
              <Input
                id="tags"
                placeholder="使用逗号分隔多个标签，如：人物,风景,抽象"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? '提交中...' : '提交'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
