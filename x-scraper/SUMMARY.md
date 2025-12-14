# X.com AI 提示词抓取器 - 项目总结

## 📋 已创建的文件

```
x-scraper/
├── manifest.json          # Chrome 插件配置
├── popup.html            # 插件界面
├── popup.css             # 插件样式
├── popup.js              # 插件逻辑
├── content.js            # 页面内容抓取脚本（核心）
├── background.js         # 后台服务
├── config.js             # 配置文件（关键词、规则等）
├── merge-data.js         # 数据合并脚本
├── README.md             # 完整文档
├── QUICKSTART.md         # 快速开始指南
└── USAGE.md              # 详细使用示例
```

## 🎯 核心功能

### 1. 智能识别 AI 提示词
- 支持 20+ AI 模型关键词识别
- 包含中英文关键词
- 自动分类（Midjourney, Stable Diffusion, DALL-E 等）

### 2. 内容过滤
✅ **只抓取**:
- 包含 AI 关键词的推文
- 附带图片的推文（至少1张）
- 有实质内容的推文

❌ **自动过滤**:
- 纯文本推文（无图片）
- 不包含 AI 关键词
- 低质量内容

### 3. 数据提取
- 标题、描述、完整内容
- 作者信息
- 多图片支持（原图质量）
- 标签自动提取
- 互动数据（点赞、转发、回复）
- 分类自动识别
- 时间戳和来源链接

### 4. 数据格式
完全适配 `aipic` 项目的数据结构：
```json
{
  "title": "提示词标题",
  "description": "描述",
  "content": "完整内容",
  "author": "作者",
  "category": "AI模型分类",
  "image": "主图",
  "images": ["图1", "图2"],
  "tags": ["标签"],
  "likesCount": 0,
  "featured": false,
  "sourceUrl": "来源链接"
}
```

## 🚀 使用流程

### 快速上手（5分钟）
```
1. 安装插件 → Chrome扩展管理 → 加载x-scraper文件夹
2. 访问 X.com → 搜索 #Midjourney
3. 点击插件 → 开始抓取
4. 等待滚动 → 导出 JSON
5. 运行合并脚本 → node x-scraper/merge-data.js ai-prompts-*.json
```

### 完整流程
```
准备阶段:
1. 阅读 QUICKSTART.md
2. 根据需求修改 config.js（可选）
3. 安装插件到浏览器

抓取阶段:
1. 访问目标页面（搜索/用户主页/列表）
2. 启动插件开始抓取
3. 观察日志和计数
4. 达到目标数量后停止
5. 导出 JSON 文件

数据处理:
1. 运行 merge-data.js 合并数据
2. 脚本自动备份、去重、标准化
3. 验证数据正确性
4. 启动开发服务器查看效果

优化阶段:
1. 审核数据质量
2. 手动清理低质量内容
3. 补充标签和分类
4. 更新到生产环境
```

## 📊 支持的 AI 模型

### 图像生成 (主要)
- Midjourney (v5, v6, niji)
- Stable Diffusion (SD, SDXL, SD3)
- DALL-E 2/3
- Flux / Flux.1 Pro
- Leonardo.ai
- Adobe Firefly
- Imagen 3
- Ideogram
- Playground

### 视频生成
- Sora
- Runway Gen-2/3
- Pika Labs
- Stable Video
- Kling
- Hailuo (海螺)

### 工具平台
- ComfyUI
- Automatic1111
- ControlNet
- LoRA / Checkpoint
- IPAdapter

### 文本生成
- ChatGPT / GPT-4
- Claude / Sonnet
- Gemini
- Grok

## 🔧 配置选项

### 关键词配置 (config.js)
```javascript
AI_KEYWORDS = {
  imageModels: [...],  // 图像模型
  videoModels: [...],  // 视频模型
  tools: [...],        // 工具
  chinese: [...],      // 中文词
  platforms: [...]     // 平台
}
```

### 抓取配置
```javascript
SCRAPING_CONFIG = {
  scrollDelay: 2000,      // 滚动延迟
  requireImages: true,    // 必须有图
  minImages: 1,           // 最少图片数
  minTextLength: 10,      // 最短文本
  filterRetweets: false   // 过滤转发
}
```

### 清洗配置
```javascript
CLEANING_CONFIG = {
  removeUrls: true,         // 移除链接
  trimWhitespace: true,     // 清理空白
  maxTitleLength: 100,      // 标题长度
  maxDescriptionLength: 200 // 描述长度
}
```

## 📈 数据质量保证

### 自动化
1. **关键词匹配** - 只抓取相关内容
2. **图片验证** - 必须包含图片
3. **文本清洗** - 移除 URL、多余空白
4. **去重处理** - 基于 URL 和内容去重
5. **格式标准化** - 统一数据结构

### 手动审核（建议）
1. 定期检查导出数据
2. 删除低质量内容
3. 补充完善标签
4. 调整分类归属
5. 优化描述文本

## 🎨 与主项目集成

### 数据流
```
X.com 推文
    ↓
浏览器插件抓取
    ↓
导出 JSON 文件
    ↓
merge-data.js 合并
    ↓
data/aiart-prompts.json
    ↓
项目导入脚本
    ↓
Supabase 数据库
    ↓
网站展示
```

### 兼容性
- ✅ 数据结构完全匹配 `src/lib/types.ts`
- ✅ 字段命名与数据库 schema 一致
- ✅ 支持多图片存储
- ✅ 标签数组格式正确
- ✅ 可直接导入无需转换

## 🛠️ 技术栈

- **Chrome Extension Manifest V3** - 现代插件标准
- **Vanilla JavaScript** - 无依赖，轻量高效
- **Chrome Storage API** - 本地数据持久化
- **Content Scripts** - 页面内容注入
- **Message Passing** - 组件间通信

## 📝 文档结构

- **README.md** - 完整功能说明、安装步骤、注意事项
- **QUICKSTART.md** - 5分钟快速上手指南
- **USAGE.md** - 详细使用场景和最佳实践
- **config.js** - 配置选项和示例
- **merge-data.js** - 数据合并脚本（带注释）

## 🔮 未来扩展

### 计划功能
- [ ] 批量下载图片到本地
- [ ] 与 Supabase 直接同步
- [ ] 提示词质量评分算法
- [ ] 自定义过滤规则 UI
- [ ] 导出多种格式（CSV, Excel）
- [ ] 数据统计和可视化面板
- [ ] 定时自动抓取任务
- [ ] 浏览器书签同步

### 技术优化
- [ ] 使用 TypeScript 重写
- [ ] 添加单元测试
- [ ] 性能监控和优化
- [ ] 错误追踪和日志
- [ ] 国际化支持

## 🤝 贡献指南

欢迎提交：
- 🐛 Bug 报告
- 💡 功能建议
- 📝 文档改进
- 🔧 代码优化
- 🎨 UI 改进

提交前请：
1. 测试功能正常
2. 遵循代码风格
3. 更新相关文档
4. 说明改动原因

## 📄 许可证

MIT License - 可自由使用、修改、分发

## 🙏 致谢

- X.com (Twitter) - 数据来源
- Chrome Extension - 插件平台
- AI Prompt Gallery 项目 - 主项目

---

**如有问题或建议，欢迎提 Issue！** 🎉
