# AI Prompt Gallery

一个现代化的 AI 提示词分享平台，展示精选的 AI 艺术创作提示词和创作者作品集。

## ✨ 功能特性

- 🎨 **瀑布流展示** - 响应式瀑布流布局，优雅展示作品
- 🔍 **智能搜索** - 实时搜索提示词、标签和创作者
- 🏷️ **标签筛选** - 按分类、风格、主题筛选内容
- 👤 **创作者页面** - 展示创作者个人作品集和资料
- 📱 **响应式设计** - 完美适配桌面端和移动端
- ⚡ **快速加载** - 基于 Vite 构建，秒级启动
- 🖼️ **图片存储** - Supabase Storage 托管，CDN 加速

## 🛠️ 技术栈

### 前端框架
- **React 18** - 现代化 UI 框架
- **Vite 5** - 极速构建工具
- **TypeScript** - 类型安全的 JavaScript
- **React Router 6** - 声明式路由管理

### UI 设计
- **TailwindCSS 3** - 原子化 CSS 框架
- **Radix UI** - 无障碍 UI 组件原语
- **Lucide Icons** - 优雅的图标库
- **自定义瀑布流** - 性能优化的布局组件

### 后端服务
- **Supabase** - 开源 Firebase 替代方案
  - PostgreSQL 数据库
  - Storage API 图片存储
  - 实时数据订阅（可选）

## 🚀 快速开始

### 前置要求

- Node.js 18+ 
- npm 或 pnpm
- Supabase 账号

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd aipic
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填入你的 Supabase 凭证：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

> 💡 从 Supabase Dashboard → Settings → API 获取凭证

### 4. 设置数据库

在 Supabase Dashboard 的 SQL Editor 中执行数据库脚本（位于 `archive/old-sql/` 文件夹）。

主要表结构：
- `prompts` - 提示词主表
- `images` - 图片表（关联 Storage）
- `authors` - 创作者表
- `tags` - 标签表
- `prompt_tags` - 提示词标签关联表
- `prompt_contents` - 提示词内容（JSON）

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

### 6. 构建生产版本

```bash
npm run build
npm run preview  # 预览构建结果
```

## 📁 项目结构

```
aipic/
├── src/
│   ├── components/         # React 组件
│   │   ├── ui/            # Radix UI 基础组件
│   │   ├── MasonryGrid.tsx    # 瀑布流布局
│   │   ├── MasonryCard.tsx    # 卡片组件
│   │   ├── SearchBar.tsx      # 搜索栏
│   │   ├── CategoryFilter.tsx # 分类筛选
│   │   └── PromptDetailModal.tsx # 详情弹窗
│   ├── pages/             # 页面组件
│   │   ├── CreatorsPage.tsx        # 创作者列表
│   │   ├── CreatorDetailPage.tsx   # 创作者详情
│   │   └── AboutPage.tsx           # 关于页面
│   ├── lib/               # 工具库
│   │   ├── api.ts        # API 封装层
│   │   ├── supabase.ts   # Supabase 客户端
│   │   ├── types.ts      # TypeScript 类型定义
│   │   └── utils.ts      # 工具函数
│   ├── App.tsx           # 主应用组件
│   └── main.tsx          # 应用入口
├── scripts/              # 工具脚本
│   ├── migrate-images.ts      # 图片迁移脚本
│   ├── query-images.ts        # 查询图片数据
│   └── regenerate-sql.ts      # 生成 SQL 更新语句
├── public/               # 静态资源
└── archive/              # 归档文件（不上传 Git）
```

## 🔧 可用脚本

```bash
# 开发
npm run dev              # 启动开发服务器

# 构建
npm run build           # TypeScript 编译 + Vite 构建
npm run preview         # 预览构建结果

# 代码质量
npm run lint            # ESLint 检查

# 数据脚本（需配置 SERVICE_ROLE_KEY）
npm run query-images    # 查询数据库图片数据
npm run migrate-images  # 迁移图片到 Supabase Storage
```

## 📊 数据库设计

### 核心表

**prompts** - 提示词主表
- 关联 `authors`（创作者）
- 关联 `images`（多图）
- 关联 `prompt_tags`（标签）
- 包含 `prompt_contents`（JSON 格式内容）

**images** - 图片表
- `url` - Supabase Storage 公开链接
- `storage_path` - Storage 中的路径
- `order_index` - 显示顺序

**authors** - 创作者表
- 个人资料、头像、作品统计

**tags** - 标签表
- 分类、风格、主题标签

## 🖼️ 图片存储

项目使用 Supabase Storage 存储图片：

- **Bucket**: `prompt-images`（公开访问）
- **路径**: `images/{promptId}-{index}.jpg`
- **限制**: 单文件 5MB，支持 jpg/png/webp/gif
- **CDN**: 自动 CDN 加速

迁移脚本支持：
- 并发下载（5个并发）
- 自动重试（3次）
- 本地备份
- 批量上传

## 🌐 部署

### Vercel（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### Netlify

```bash
# Build command
npm run build

# Publish directory
dist
```

### 其他平台
- Cloudflare Pages
- GitHub Pages
- Railway
- Render

> ⚠️ 部署前记得在平台配置环境变量（VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY）

## 📝 开发说明

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.tsx` 添加路由
3. 在 `src/lib/api.ts` 添加数据获取函数

### API 调用规范

```typescript
// 推荐：使用封装的 API 函数
import { fetchPrompts } from '@/lib/api'
const prompts = await fetchPrompts()

// 避免：直接使用 Supabase 客户端
// const { data } = await supabase.from('prompts').select('*')
```

### 样式规范

- 使用 TailwindCSS 实用类
- 复杂组件使用 `class-variance-authority` 管理变体
- 使用 `@/lib/utils.ts` 中的 `cn()` 合并类名

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License - 自由使用和修改
