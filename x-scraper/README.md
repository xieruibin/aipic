# X.com AI 提示词抓取器

专门用于抓取 X.com 上的 AI 图像生成提示词的浏览器插件，支持 Midjourney、Stable Diffusion、DALL-E、Flux 等主流 AI 模型。

## 🎯 设计目标

本插件专为 **AI Prompt Gallery** 项目设计，用于从 X.com 收集高质量的 AI 图像生成提示词内容。

## ✨ 功能特性

- 🤖 **智能识别** - 自动识别包含 AI 提示词的推文（Midjourney, Stable Diffusion, DALL-E 等）
- 🖼️ **高清图片** - 自动获取原图链接，支持多图抓取
- 🏷️ **标签提取** - 自动提取标签和分类信息
- 📝 **内容清洗** - 自动清理和格式化提示词文本
- 🔍 **智能过滤** - 只抓取包含 AI 关键词和图片的推文
- 📊 **互动数据** - 抓取点赞、转发、回复等互动数据
- 💾 **格式适配** - 导出数据直接适配项目所需格式
- 🔄 **自动滚动** - 自动滚动加载更多内容
- 💿 **本地存储** - 支持本地存储和断点续传

## 安装步骤

### Chrome / Edge

1. 打开浏览器，进入扩展管理页面：
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

2. 启用"开发者模式"（右上角开关）

3. 点击"加载已解压的扩展程序"

4. 选择 `x-scraper` 文件夹

5. 插件安装完成！

### Firefox

1. 打开 `about:debugging#/runtime/this-firefox`

2. 点击"临时加载附加组件"

3. 选择 `manifest.json` 文件

4. 插件安装完成！

## 📖 使用方法

1. **访问目标页面**
   - 打开 X.com 搜索 AI 提示词相关话题（如 #Midjourney #StableDiffusion）
   - 或访问 AI 艺术家的个人主页
   - 或浏览 AI 相关话题列表

2. **启动抓取**
   - 点击浏览器工具栏中的插件图标
   - 在弹出窗口中点击"开始抓取"

3. **自动收集**
   - 插件会自动滚动页面
   - 智能识别包含 AI 提示词的推文
   - 过滤掉不相关的内容

4. **导出数据**
   - 抓取完成后点击"导出 JSON"
   - 数据格式已适配项目需求，可直接使用

## 🎨 支持的 AI 模型

插件会自动识别包含以下关键词的推文：

- **图像生成**: Midjourney, Stable Diffusion, DALL-E, Flux, Leonardo, Firefly, Nano Banana Pro
- **工具平台**: ComfyUI, ControlNet, LoRA, Checkpoint
- **视频生成**: Sora, Runway
- **文本生成**: ChatGPT, Claude, Gemini, Grok
- **中文关键词**: 提示词, 咒语, AI生成, AI绘画, 模型 等

## 数据格式

导出的 JSON 数据格式如下：

\`\`\`json
[
  {
    "id": "username_timestamp",
    "author": "作者名称",
    "username": "用户名",
    "text": "推文内容",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "likes": 100,
    "retweets": 50,
    "replies": 25,
    "images": ["图片URL1", "图片URL2"],
    "videos": ["视频URL"],
    "url": "推文链接",
    "extractedAt": "抓取时间"
  }
]
\`\`\`

## ⚠️ 注意事项

- ✅ 请遵守 X.com 的使用条款和服务协议
- ✅ 建议合理控制抓取频率，避免账号受限
- ✅ 尊重原创者版权，标注内容来源
- ✅ 抓取的数据仅供学习和个人项目使用
- ✅ 定期导出和备份数据
- ✅ 插件会自动过滤非 AI 提示词内容，提高数据质量

## 🔍 过滤规则

插件会自动过滤掉以下内容：
- ❌ 不包含 AI 相关关键词的推文
- ❌ 没有图片的推文
- ❌ 纯文本推文
- ❌ 转发但无原创内容的推文

只保留：
- ✅ 包含 AI 模型关键词的推文
- ✅ 附带高质量图片的推文
- ✅ 包含提示词内容的推文

## 技术栈

- Manifest V3
- Chrome Extension API
- Vanilla JavaScript
- Chrome Storage API

## 文件结构

\`\`\`
x-scraper/
├── manifest.json      # 插件配置文件
├── popup.html         # 弹出窗口界面
├── popup.css          # 样式文件
├── popup.js           # 弹出窗口逻辑
├── content.js         # 内容脚本（AI 提示词抓取）
├── background.js      # 后台服务脚本
└── icons/            # 图标文件夹（需要添加）
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
\`\`\`

## 🔗 与项目集成

导出的数据可以直接导入到 AI Prompt Gallery 项目：

```bash
# 1. 将导出的 JSON 文件放到项目 data 目录
cp ai-prompts-*.json /path/to/aipic/data/

# 2. 使用项目的导入脚本（如果有）
npm run import-data

# 3. 或手动合并到 aiart-prompts.json
```

## 🚀 待添加功能

- [ ] 自定义关键词过滤规则
- [ ] 批量下载高清图片到本地
- [ ] 提示词质量评分
- [ ] 重复内容检测
- [ ] 导出 CSV 格式
- [ ] 数据统计和可视化
- [ ] 定时自动抓取
- [ ] 与 Supabase 直接同步

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

如果你在使用过程中发现：
- 某些 AI 模型关键词没有被识别
- 数据格式需要调整
- 有更好的过滤规则建议

请随时提出！

## 📄 许可证

MIT License - 自由使用和修改

## 🔗 相关链接

- [AI Prompt Gallery 项目](../README.md)
- [Supabase 文档](https://supabase.com/docs)
