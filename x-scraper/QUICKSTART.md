# 快速开始指南

## 📦 安装插件

### Chrome / Edge 浏览器

1. 打开扩展管理页面
   - Chrome: 地址栏输入 `chrome://extensions/`
   - Edge: 地址栏输入 `edge://extensions/`

2. 启用"开发者模式"（页面右上角的开关）

3. 点击"加载已解压的扩展程序"

4. 选择 `x-scraper` 文件夹

5. ✅ 安装完成！插件图标会出现在浏览器工具栏

### Firefox 浏览器

1. 打开 `about:debugging#/runtime/this-firefox`

2. 点击"临时加载附加组件"

3. 选择 `manifest.json` 文件

4. ✅ 安装完成！

## 🎯 第一次使用

### 步骤 1: 访问 X.com

打开以下任一页面：

```
# 搜索 Midjourney 提示词
https://x.com/search?q=%23Midjourney&f=live

# 搜索 Stable Diffusion
https://x.com/search?q=stable%20diffusion%20prompt&f=live

# 搜索中文 AI 提示词
https://x.com/search?q=AI提示词&f=live

# 或访问某个 AI 艺术家主页
https://x.com/username
```

### 步骤 2: 启动插件

1. 点击浏览器工具栏的插件图标 🎨

2. 在弹出窗口中点击 **"开始抓取"** 按钮

3. 观察状态：
   - ✅ 看到 "正在抓取..." 表示已启动
   - 📊 "已抓取: X 条" 实时显示进度
   - 📝 日志窗口显示详细信息

### 步骤 3: 等待收集

- 插件会自动向下滚动页面
- 自动识别包含 AI 提示词的推文
- 过滤掉不相关的内容
- 建议滚动 5-10 页（约 50-100 条推文）

### 步骤 4: 导出数据

1. 看到足够数据后，点击 **"停止"**

2. 点击 **"导出 JSON"** 按钮

3. 文件会自动下载，命名格式：`ai-prompts-1702345678901.json`

## 📂 导入到项目

### 方式 1: 使用自动合并脚本（推荐）

```bash
# 在项目根目录运行
cd g:/code/aipic

# 执行合并脚本
node x-scraper/merge-data.js 下载/ai-prompts-1702345678901.json

# 脚本会：
# 1. 自动备份原数据
# 2. 合并新数据
# 3. 去除重复
# 4. 输出统计信息
```

### 方式 2: 手动合并

```bash
# 1. 将导出的文件复制到 data 目录
cp 下载/ai-prompts-*.json data/

# 2. 打开项目数据文件
# data/aiart-prompts.json

# 3. 手动复制粘贴数组内容，注意保持 JSON 格式正确
```

### 方式 3: 使用 VS Code

1. 在 VS Code 中打开 `data/aiart-prompts.json`
2. 同时打开导出的 `ai-prompts-*.json`
3. 复制粘贴数组内容
4. 使用 VS Code 的 JSON 格式化功能（Shift+Alt+F）

## ✅ 验证数据

```bash
# 检查 JSON 格式是否正确
node -e "console.log(JSON.parse(require('fs').readFileSync('data/aiart-prompts.json')).length)"

# 输出应该是数字，表示数据条数
```

## 🎨 查看效果

```bash
# 启动开发服务器
npm run dev

# 打开浏览器访问
http://localhost:5173

# 应该能看到新抓取的提示词卡片
```

## 🔧 自定义配置

### 修改关键词

编辑 `x-scraper/config.js`:

```javascript
export const AI_KEYWORDS = {
  imageModels: [
    'midjourney',
    'stable diffusion',
    '你的新模型', // 添加这里
  ],
  // ...
};
```

### 调整抓取速度

```javascript
export const SCRAPING_CONFIG = {
  scrollDelay: 3000, // 改为 3 秒，降低频率
  maxItems: 100, // 限制最多抓取 100 条
  // ...
};
```

重新加载插件：
1. 到扩展管理页面
2. 点击刷新按钮 🔄
3. 配置生效

## 💡 使用技巧

### 1. 精确搜索

```
# 组合关键词
Midjourney prompt architecture

# 排除某些词
AI art -NFT

# 指定账号
(from:username) Midjourney

# 指定时间
since:2024-12-01 until:2024-12-10

# 高互动度
min_faves:100 AI prompt
```

### 2. 分批抓取

- 不要一次抓太多，容易卡顿
- 建议每次 50-100 条
- 导出后清除数据，继续下一批

### 3. 质量控制

- 关注高质量创作者
- 使用 "Top" 标签而非 "Latest"
- 手动审核导出的数据
- 删除低质量或重复内容

### 4. 定期更新

```bash
# 建立定期抓取计划
# 例如：每周抓取一次新内容

# 1. 周一：搜索 #Midjourney
# 2. 周二：搜索 #StableDiffusion  
# 3. 周三：搜索热门创作者
# 4. 周四：合并和清理数据
# 5. 周五：更新到生产环境
```

## 🐛 常见问题

### Q: 插件不工作？
1. 刷新页面重试
2. 检查是否在 x.com 域名
3. 查看浏览器控制台错误（F12）
4. 重新加载插件

### Q: 没有抓取到数据？
1. 确认页面有符合条件的推文
2. 尝试不同的搜索关键词
3. 检查日志窗口的提示
4. 可能关键词不匹配，查看 config.js

### Q: 数据格式错误？
1. 检查导出的 JSON 文件是否完整
2. 使用在线 JSON 验证工具
3. 查看 popup.js 的 formattedData 函数

## 📚 下一步

- 📖 阅读 [完整文档](README.md)
- 🔧 查看 [配置选项](config.js)
- 💡 学习 [高级用法](USAGE.md)
- 🤝 参与 [项目贡献](../README.md)

---

**享受收集 AI 提示词的乐趣！** ✨
