# 频率控制 (Rate Limiting) 配置指南

## 概述

浏览器插件内置频率控制机制，防止对X.com的过度请求，降低被检测和封禁的风险。

## 核心配置

### content.js 中的频率设置

```javascript
const RATE_LIMITS = {
  autoScroll: 2000,        // 自动滚动间隔（毫秒）
  scrapeCheck: 1000,       // 抓取检查间隔（毫秒）
  messageDelay: 500,       // 消息发送延迟（毫秒）
  observerThrottle: 800,   // 监听器节流（毫秒）
  maxRequestsPerMinute: 30 // 每分钟最大消息数
};
```

## 工作流程

### 1. 自动滚动 (autoScroll: 2000ms)
- **触发**: 用户点击"开始抓取"后自动启动
- **功能**: 每 2 秒滚动页面一次，加载更多推文
- **作用**: 模拟真实用户行为，避免过快请求

```
时间轴：
0s ── 滚动 ── 2s ── 抓取检查 ── 滚动 ── 4s ── 抓取检查 ── ...
```

### 2. 抓取检查 (scrapeCheck: 1000ms)
- **触发**: 自动滚动完成或 DOM 变化
- **功能**: 检测新加载的推文并提取数据
- **防护**: 避免重复快速扫描同一批推文

### 3. 消息发送 (messageDelay: 500ms)
- **触发**: 发现新推文或日志输出
- **功能**: 将数据发送到 popup UI
- **防护**: 避免消息发送过于频繁导致通道阻塞

```
时间轴（消息发送）：
发送消息 ── 500ms ── 下次消息可发 ── 500ms ── 可发 ── ...
```

### 4. 监听器节流 (observerThrottle: 800ms)
- **触发**: DOM 变化时
- **功能**: 防止 MutationObserver 过于敏感
- **防护**: 减少不必要的抓取操作

```
DOM变化触发 → 延迟800ms → 执行抓取
         ↑__________________|
             期间的其他变化会被合并
```

## 实际效果

### 原始速率（无控制）
```
速率：         请求数/分钟 = 很高（容易被检测）
间隔：         毫秒级
特征：         非常规机器行为
风险：         账户限制、IP 封禁
```

### 应用频率控制后
```
速率：         请求数/分钟 ≈ 8-12（相对较低）
间隔：         秒级
特征：         接近真实用户行为
风险：         大大降低 ✅
```

## 计算示例

假设用户持续抓取 1 小时，期间：

1. **滚动请求**：3600s ÷ 2000ms = ~1800 次滚动
2. **抓取操作**：只有新内容时触发，实际 ~600 次
3. **消息发送**：受 500ms 节流，实际 ~120 次
4. **每分钟平均**：600 ÷ 60 = **10 次请求**

✅ 远低于风险阈值（通常 100+ 次/分钟）

## 自定义频率

### 场景1：快速抓取（但增加风险）
```javascript
const RATE_LIMITS = {
  autoScroll: 1000,        // 更快滚动
  scrapeCheck: 500,        // 更快检查
  messageDelay: 200,       // 更快消息
  observerThrottle: 400,   // 更快响应
};
```

### 场景2：谨慎抓取（降低风险）
```javascript
const RATE_LIMITS = {
  autoScroll: 4000,        // 更慢滚动
  scrapeCheck: 2000,       // 更慢检查
  messageDelay: 1000,      // 更慢消息
  observerThrottle: 1500,  // 更慢响应
};
```

### 场景3：极低频率（最安全）
```javascript
const RATE_LIMITS = {
  autoScroll: 5000,        // 5 秒滚动
  scrapeCheck: 3000,       // 3 秒检查
  messageDelay: 1500,      // 1.5 秒消息
  observerThrottle: 2000,  // 2 秒响应
};
```

## 最佳实践

### ✅ 推荐做法
- 使用默认设置（平衡速度和安全）
- 在网络连接稳定时运行
- 避免 24/7 连续抓取
- 定期检查日志中的"已过滤"数量

### ❌ 避免做法
- 将频率设置得过低（< 500ms）
- 在多个标签页同时运行
- 使用代理或 VPN 时不调整频率
- 忽略日志警告信息

## 监控指标

### 日志输出示例
```
[10:30:45] 开始抓取 X.com AI 提示词内容...
[10:30:45] 频率设置: 滚动2000ms | 抓取1000ms | 消息500ms
[10:30:47] 发现 5 条新 AI 提示词，总计 5 条（已过滤 12 条非提示词推文）
[10:30:49] 发现 3 条新 AI 提示词，总计 8 条（已过滤 8 条非提示词推文）
```

### 健康指标
| 指标 | 健康值 | 警告值 | 危险值 |
|------|--------|--------|---------|
| 消息频率 | < 2/秒 | 2-5/秒 | > 5/秒 |
| 抓取成功率 | > 30% | 15-30% | < 15% |
| DOM 变化频率 | < 10/秒 | 10-20/秒 | > 20/秒 |

## 故障排查

### 问题：抓取速度太慢
**原因**：频率间隔设置过长
**解决**：逐步减小 `autoScroll` 和 `scrapeCheck` 值（每次 -200ms）

### 问题：经常看到"已过滤"消息
**原因**：页面大量非提示词推文
**解决**：这是正常的，说明过滤器在正常工作

### 问题：抓取中途停止
**原因**：连接超时或频率过高触发限制
**解决**：增加 `RATE_LIMITS` 中的延迟值，重新开始

## 技术细节

### 节流实现（Throttling）
```javascript
function sendMessageThrottled(message) {
  const now = Date.now();
  if (now - lastMessageTime < RATE_LIMITS.messageDelay) {
    return; // 跳过
  }
  lastMessageTime = now;
  chrome.runtime.sendMessage(message);
}
```

### 防抖实现（Debouncing）
```javascript
let observerTimeout = null;

observer = new MutationObserver(() => {
  clearTimeout(observerTimeout);
  observerTimeout = setTimeout(() => {
    scrapVisibleTweets();
  }, RATE_LIMITS.observerThrottle);
});
```

## 法律和道德考虑

⚠️ **重要提示**：
- 遵守 X.com 的服务条款和爬虫协议
- 不要用于大规模商业数据采集
- 尊重他人隐私和知识产权
- 频率控制是为了负责任的使用，不是为了绕过限制

---

最后更新：2025-12-12
