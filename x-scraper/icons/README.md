# 图标说明

插件需要以下尺寸的图标：

- `icon16.png` - 16x16 像素（工具栏小图标）
- `icon48.png` - 48x48 像素（扩展管理页面）
- `icon128.png` - 128x128 像素（Chrome 商店）

## 快速生成图标

### 方法 1: 使用在线工具

访问 [favicon.io](https://favicon.io/) 或类似工具：
1. 上传一个 PNG 图片或使用文字生成
2. 下载生成的图标包
3. 将对应尺寸的图标重命名并放到 `icons/` 目录

### 方法 2: 使用设计工具

使用 Figma / Photoshop / Canva：
1. 创建 128x128 的画布
2. 设计你的图标（建议主题：AI、艺术、提示词）
3. 导出为 PNG
4. 使用在线工具调整到不同尺寸

### 方法 3: 使用 emoji 快速制作

临时方案，快速创建基础图标：

```html
<!-- 创建一个 HTML 文件，在浏览器中打开 -->
<!DOCTYPE html>
<html>
<head>
  <style>
    .icon {
      width: 128px;
      height: 128px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 64px;
    }
  </style>
</head>
<body>
  <div class="icon">🎨</div>
  <!-- 右键保存为图片，然后调整尺寸 -->
</body>
</html>
```

## 推荐图标主题

- 🎨 调色板（艺术创作）
- 🤖 机器人（AI）
- ✨ 魔法棒（生成）
- 💡 灯泡（灵感）
- 🖼️ 画框（图片）
- 📝 笔记本（提示词）

## 配色建议

```css
/* Midjourney 风格 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Stable Diffusion 风格 */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

/* 简约蓝色 */
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

/* 渐变紫色 */
background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
```

## 临时使用

在图标文件准备好之前，可以暂时注释掉 manifest.json 中的图标配置：

```json
{
  // "action": {
  //   "default_icon": {
  //     "16": "icons/icon16.png",
  //     "48": "icons/icon48.png",
  //     "128": "icons/icon128.png"
  //   }
  // },
  // "icons": {
  //   "16": "icons/icon16.png",
  //   "48": "icons/icon48.png",
  //   "128": "icons/icon128.png"
  // }
}
```

插件仍然可以正常工作，只是没有自定义图标显示。

## AI 生成图标

也可以使用 AI 工具生成：

**提示词示例**：
```
A modern, minimalist icon for a browser extension about AI art prompts.
Features: Colorful gradient background, simple geometric shapes, 
professional design, suitable for 128x128 pixels.
Style: Flat design, vibrant colors (purple and blue gradient)
Elements: Paint brush, sparkles, or abstract AI symbol
```

使用 Midjourney、DALL-E 或 Stable Diffusion 生成后，调整尺寸即可使用。
