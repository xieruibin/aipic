# 频率控制更新日志

## 2025-12-12 更新内容

### ✨ 新增功能

#### 1. content.js - 多层频率控制
```javascript
const RATE_LIMITS = {
  autoScroll: 2000,        // 自动滚动间隔：2秒
  scrapeCheck: 1000,       // 抓取检查间隔：1秒
  messageDelay: 500,       // 消息发送延迟：0.5秒
  observerThrottle: 800,   // 监听器节流：0.8秒
  maxRequestsPerMinute: 10 // 每分钟最多10个请求
};
```

**核心改进**：
- ✅ `sendMessageThrottled()` - 消息节流函数，防止消息堆积
- ✅ `scrapVisibleTweets()` - 加入时间戳检查，防止过度频繁抓取
- ✅ `startObserver()` - 使用防抖（debounce）合并 DOM 变化事件
- ✅ `autoScroll()` - 使用可配置的间隔值

#### 2. popup.js - UI 层频率控制
```javascript
const POPUP_RATE_LIMITS = {
  logDisplay: 100,    // 日志显示最小间隔
  updateCount: 200,   // 计数更新最小间隔
  autoSave: 1000      // 自动保存最小间隔
};
```

**优化**：
- ✅ 日志条数限制（最多 50 条）+ 自动滚动
- ✅ 存储写入错误不会中断扫描
- ✅ 防止内存溢出和 UI 卡顿

### 📊 预期效果

| 指标 | 修改前 | 修改后 | 改进 |
|------|--------|--------|-------|
| 每分钟请求数 | 60+ | ~10 | -83% ↓ |
| 被检测风险 | 高 | 低 | 大幅降低 ✅ |
| 消息队列堆积 | 可能 | 不会 | 稳定运行 ✅ |
| 内存占用 | 递增 | 恒定 | 内存泄漏修复 ✅ |

### 🛠️ 使用方法

#### 查看频率配置日志
启动抓取时会输出：
```
[10:30:45] 频率设置: 滚动2000ms | 抓取1000ms | 消息500ms
```

#### 修改频率
编辑 `content.js` 的 `RATE_LIMITS` 对象：

**快速抓取版**：
```javascript
autoScroll: 1000,
scrapeCheck: 500,
messageDelay: 200,
observerThrottle: 400
```

**安全抓取版**：
```javascript
autoScroll: 3000,
scrapeCheck: 1500,
messageDelay: 800,
observerThrottle: 1200
```

### 📝 详细文档
见 `RATE_LIMITING.md` - 完整的配置和最佳实践指南

### ⚙️ 技术细节

#### 节流（Throttling）用于消息发送
防止过于频繁的 `chrome.runtime.sendMessage` 调用：
```javascript
if (now - lastMessageTime < RATE_LIMITS.messageDelay) {
  return; // 忽略
}
```

#### 防抖（Debouncing）用于 DOM 监听
合并短时间内的多次 `MutationObserver` 触发：
```javascript
clearTimeout(observerTimeout);
observerTimeout = setTimeout(() => {
  scrapVisibleTweets();
}, RATE_LIMITS.observerThrottle);
```

### 🔒 安全性提升
- ✅ 模拟真实用户行为（秒级间隔）
- ✅ 降低被 X.com 检测的风险
- ✅ 防止 IP 限制或账户限制
- ✅ 更稳定的抓取体验

### 📦 兼容性
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ 所有 Chromium 浏览器

---

**建议**：保持默认设置以获得最佳的速度和安全性平衡。
