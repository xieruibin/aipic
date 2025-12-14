import { Copy, Languages, Users, Image as ImageIcon } from 'lucide-react'
import type { Language } from '../lib/i18n'

interface AboutPageProps {
  language: Language
}

export function AboutPage({ language }: AboutPageProps) {
  const isZh = language === 'zh'

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {isZh ? '探索 AI 艺术的' : 'Explore the'} <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {isZh ? '无限可能' : 'Infinite Possibilities'}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isZh
                ? 'AIPics 是一个致力于分享高质量 AI 绘画提示词的社区平台。无论你是初学者还是经验丰富的艺术家，在这里都能找到属于你的灵感缪斯。'
                : 'AIPics is a community platform dedicated to sharing high-quality AI art prompts. Whether you\'re a beginner or an experienced artist, you\'ll find your muse here.'}
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
              <ImageIcon size={32} />
            </div>
            <h3 className="text-lg font-semibold">{isZh ? '精选图库' : 'Curated Gallery'}</h3>
            <p className="text-sm text-muted-foreground">
              {isZh
                ? '收录各种风格、主题的高质量提示词，激发你的创作灵感。'
                : 'High-quality prompts in various styles and themes to inspire your creativity.'}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
              <Copy size={32} />
            </div>
            <h3 className="text-lg font-semibold">{isZh ? '一键复制' : 'One-Click Copy'}</h3>
            <p className="text-sm text-muted-foreground">
              {isZh
                ? '轻松复制提示词，无缝对接 Gemini、Midjourney、Stable Diffusion 等工具。'
                : 'Easily copy prompts for seamless integration with Gemini, Midjourney, Stable Diffusion, and more.'}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
              <Languages size={32} />
            </div>
            <h3 className="text-lg font-semibold">{isZh ? '多语言支持' : 'Multi-Language'}</h3>
            <p className="text-sm text-muted-foreground">
              {isZh
                ? '支持中英文界面，连接全球 AI 艺术爱好者。'
                : 'Supports Chinese and English to connect AI art enthusiasts worldwide.'}
            </p>
          </div>

          {/* Feature 4 */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-semibold">{isZh ? '创作者展示' : 'Creator Showcase'}</h3>
            <p className="text-sm text-muted-foreground">
              {isZh
                ? '展示优秀创作者及其作品，鼓励社区分享与交流。'
                : 'Showcase talented creators and their works, encouraging community sharing and collaboration.'}
            </p>
          </div>
        </div>
      </div>

      {/* Author Section */}
      <div className="border-t bg-card">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold">{isZh ? '关注作者' : 'Follow the Author'}</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {/* Author Support */}
              <div className="space-y-4">
                <img
                  src="public/xrb.jpg"
                  alt="Author Support"
                  className="w-48 h-48 object-contain mx-auto rounded-xl border border-border"
                />
                <p className="text-sm text-muted-foreground">
                  {isZh ? '关注作者' : 'Follow Author'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                {isZh
                  ? '关注创作者们获取更多 AI 艺术灵感和项目更新。'
                  : 'Follow creators for more AI art inspiration and project updates.'}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://x.com/i/lists/1980178021136130174"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  {isZh ? '一键关注创作者' : 'Follow All Creators'}
                </a>
                <a
                  href="https://x.com/xie_ruibin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-accent transition-colors"
                >
                  @xie_ruibin
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-wrap justify-center gap-12 text-center">
            <div>
              <div className="text-4xl font-bold text-foreground">1000+</div>
              <div className="text-sm text-muted-foreground mt-2">
                {isZh ? '精选提示词' : 'Curated Prompts'}
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground">200+</div>
              <div className="text-sm text-muted-foreground mt-2">
                {isZh ? '优秀创作者' : 'Talented Creators'}
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground">50+</div>
              <div className="text-sm text-muted-foreground mt-2">
                {isZh ? '艺术风格' : 'Art Styles'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
