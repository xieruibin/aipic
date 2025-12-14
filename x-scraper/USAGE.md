# 使用示例

## 场景 1: 抓取 Midjourney 提示词

1. 在 X.com 搜索框输入: `#Midjourney`
2. 切换到"最新"标签页
3. 点击插件图标，开始抓取
4. 等待滚动和收集（建议滚动5-10页）
5. 导出数据

**预期结果**: 获取包含 Midjourney 关键词和图片的提示词推文

## 场景 2: 抓取特定作者的 AI 作品

1. 访问目标作者主页，例如: `https://x.com/username`
2. 确保该作者发布 AI 艺术相关内容
3. 点击插件开始抓取
4. 插件会自动过滤非 AI 相关推文
5. 导出数据

**预期结果**: 获取该作者所有 AI 提示词相关推文

## 场景 3: 抓取多个 AI 模型的内容

1. 搜索综合关键词: `AI art OR prompt OR 提示词`
2. 或使用列表功能创建 AI 艺术家列表
3. 访问列表页面
4. 开始抓取
5. 插件会识别所有支持的 AI 模型

**预期结果**: 获取混合各种 AI 模型的提示词数据

## 数据导入到项目

### 方法 1: 直接合并 JSON

```bash
# 1. 导出的文件: ai-prompts-1702345678901.json

# 2. 打开现有数据文件
# g:\code\aipic\data\aiart-prompts.json

# 3. 合并数据（使用 jq 工具或手动）
jq -s '.[0] + .[1]' aiart-prompts.json ai-prompts-*.json > merged.json

# 4. 替换原文件
mv merged.json aiart-prompts.json
```

### 方法 2: 使用 Node.js 脚本

```javascript
// merge-prompts.js
const fs = require('fs');

// 读取原有数据
const existing = JSON.parse(
  fs.readFileSync('data/aiart-prompts.json', 'utf8')
);

// 读取新数据
const newData = JSON.parse(
  fs.readFileSync('ai-prompts-1702345678901.json', 'utf8')
);

// 合并并去重（基于 title 或 sourceUrl）
const merged = [...existing];
const existingUrls = new Set(existing.map(p => p.sourceUrl));

newData.forEach(item => {
  if (!existingUrls.has(item.sourceUrl)) {
    merged.push(item);
  }
});

// 保存
fs.writeFileSync(
  'data/aiart-prompts.json',
  JSON.stringify(merged, null, 2)
);

console.log(`合并完成！新增 ${merged.length - existing.length} 条数据`);
```

运行：
```bash
node merge-prompts.js
```

## 自定义关键词

如需添加或修改 AI 关键词，编辑 `config.js`:

```javascript
// 添加新的 AI 模型
export const AI_KEYWORDS = {
  imageModels: [
    'midjourney', 'stable diffusion',
    'your-new-model', // 添加你的模型
  ],
  // ...
};
```

## 最佳实践

### 1. 分批次抓取
- 不要一次性抓取过多内容
- 建议每次滚动 5-10 页后暂停
- 导出数据并清空，然后继续

### 2. 使用搜索过滤
```
// 推荐搜索词
#Midjourney prompt
#StableDiffusion (from:username)
AI art since:2024-01-01
```

### 3. 时间段抓取
- 使用 X.com 高级搜索指定日期范围
- `since:2024-01-01 until:2024-01-31`

### 4. 质量控制
- 定期检查导出的数据质量
- 删除重复或低质量内容
- 手动补充缺失的标签和分类

## 常见问题

### Q: 为什么有些推文没被抓取？
A: 可能原因：
- 推文不包含 AI 关键词
- 推文没有图片
- 推文是纯转发（无原创内容）
- 网络加载延迟，尚未出现在页面

### Q: 如何提高抓取质量？
A: 
- 使用更精确的搜索关键词
- 关注高质量 AI 艺术家
- 在 `config.js` 中调整过滤规则
- 手动筛选导出后的数据

### Q: 数据格式不匹配怎么办？
A: 
- 检查 `popup.js` 中的 `formattedData` 函数
- 根据项目数据库 schema 调整字段映射
- 参考 `src/lib/types.ts` 中的类型定义

### Q: 如何批量下载图片？
A: 目前版本只提取图片 URL，批量下载功能计划添加。
临时方案：使用脚本或工具批量下载 JSON 中的图片 URL。

## 性能优化

### 减少内存占用
```javascript
// 在 content.js 中设置最大缓存
const MAX_CACHE = 500;
if (scrapedPosts.length > MAX_CACHE) {
  // 导出数据提示
  sendLog('已达到缓存上限，请导出数据');
}
```

### 调整滚动速度
```javascript
// 在 config.js 中修改
export const SCRAPING_CONFIG = {
  scrollDelay: 3000, // 增加延迟，降低服务器压力
  // ...
};
```

## 下一步

1. 查看 [README.md](README.md) 了解完整功能
2. 阅读 [config.js](config.js) 自定义配置
3. 访问项目主目录了解数据如何在 AI Prompt Gallery 中展示
