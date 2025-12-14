// 状态管理
let isScrapting = false;
let scrapedData = [];
let lastLogTime = 0;
let logBuffer = [];

// 频率控制配置
const POPUP_RATE_LIMITS = {
  logDisplay: 100,  // 日志显示最小间隔（毫秒）
  updateCount: 200, // 计数更新最小间隔（毫秒）
  autoSave: 1000    // 自动保存最小间隔（毫秒）
};
const startBtn = document.getElementById('startScrape');
const stopBtn = document.getElementById('stopScrape');
const exportBtn = document.getElementById('exportJson');
const clearBtn = document.getElementById('clearData');
const statusText = document.getElementById('statusText');
const resultsCount = document.getElementById('resultsCount');
const logContainer = document.getElementById('logContainer');

// 检查是否在支持的域名
function isSupportedUrl(url) {
  if (!url) return false;
  return /https?:\/\/(x\.com|twitter\.com)\//.test(url);
}

// 确保注入内容脚本（Edge/Chrome MV3 兼容）
async function ensureContentScript(tabId) {
  try {
    // 尝试 ping content script
    await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    return true; // 已存在
  } catch (e) {
    // 注入脚本
    addLog('未检测到页面脚本，尝试注入...');
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
    // 再次确认
    try {
      await chrome.tabs.sendMessage(tabId, { action: 'ping' });
      addLog('页面脚本注入成功');
      return true;
    } catch (err) {
      addLog('页面脚本注入失败：' + (err?.message || err));
      return false;
    }
  }
}

// 添加日志（带频率控制）
function addLog(message) {
  const logEntry = document.createElement('div');
  logEntry.className = 'log-entry';
  logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;
  
  // 防止过多的日志条目占用内存（保留最多50条）
  const logs = logContainer.querySelectorAll('.log-entry');
  if (logs.length > 50) {
    logs[0].remove();
  }
}

// 更新状态
function updateStatus(status) {
  statusText.textContent = status;
  addLog(status);
}

// 更新结果计数
function updateCount(count) {
  resultsCount.textContent = `已抓取: ${count} 条`;
}

// 加载已保存的数据
async function loadSavedData() {
  const result = await chrome.storage.local.get(['scrapedData']);
  if (result.scrapedData) {
    scrapedData = result.scrapedData;
    updateCount(scrapedData.length);
    addLog(`加载了 ${scrapedData.length} 条已保存的数据`);
  }
}

// 开始抓取
startBtn.addEventListener('click', async () => {
  if (isScrapting) return;
  
  isScrapting = true;
  updateStatus('正在抓取...');
  
  // 获取选项
  const options = {
    includeImages: document.getElementById('includeImages').checked,
    includeText: document.getElementById('includeText').checked,
    includeMetadata: document.getElementById('includeMetadata').checked
  };

  // 获取当前标签页
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) {
    updateStatus('错误：未找到活动标签页');
    isScrapting = false;
    return;
  }
  if (!isSupportedUrl(tab.url)) {
    updateStatus('请在 x.com 或 twitter.com 页面上使用插件');
    isScrapting = false;
    return;
  }
  
  // 确保内容脚本已注入
  const injected = await ensureContentScript(tab.id);
  if (!injected) {
    updateStatus('错误：无法注入页面脚本');
    isScrapting = false;
    return;
  }
  
  // 向 content script 发送消息
  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'startScraping',
      options: options
    });
    addLog('已发送抓取命令到页面');
  } catch (error) {
    addLog('发送消息失败，尝试重新注入并重试...');
    const reinjected = await ensureContentScript(tab.id);
    if (reinjected) {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'startScraping', options });
        addLog('重试成功，开始抓取');
      } catch (e2) {
        updateStatus('错误：消息发送失败 - ' + (e2?.message || e2));
        isScrapting = false;
      }
    } else {
      updateStatus('错误：页面脚本不可用');
      isScrapting = false;
    }
  }
});

// 停止抓取
stopBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !isSupportedUrl(tab.url)) {
    updateStatus('请在 x.com 或 twitter.com 页面上停止抓取');
    return;
  }
  
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'stopScraping' });
    isScrapting = false;
    updateStatus('已停止抓取');
  } catch (error) {
    addLog('停止消息失败，尝试注入并重试...');
    const reinjected = await ensureContentScript(tab.id);
    if (reinjected) {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'stopScraping' });
        isScrapting = false;
        updateStatus('已停止抓取');
      } catch (e2) {
        updateStatus('停止失败：' + (e2?.message || e2));
      }
    } else {
      updateStatus('停止失败：页面脚本不可用');
    }
  }
});

// 导出 JSON
exportBtn.addEventListener('click', () => {
  if (scrapedData.length === 0) {
    addLog('没有数据可导出');
    return;
  }

  // 转换为项目所需格式
  const formattedData = scrapedData.map(item => ({
    title: item.title || item.content?.substring(0, 50) || 'Untitled',
    description: item.description || item.content?.substring(0, 100) || '',
    content: item.content || '',
    author: item.author || item.username || 'Unknown',
    authorAvatar: item.authorAvatar || '',
    authorUrl: item.authorUrl || (item.username ? `https://x.com/${item.username}` : ''),
    category: item.category || 'AI Art',
    image: item.images?.[0] || '',
    images: item.images || [],
    tags: item.tags || [],
    likesCount: item.likes || 0,
    featured: false,
    sourceUrl: item.url || '',
    extractedAt: item.extractedAt
  }));

  const dataStr = JSON.stringify(formattedData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-prompts-${Date.now()}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  addLog(`已导出 ${scrapedData.length} 条 AI 提示词数据`);
});

// 清除数据
clearBtn.addEventListener('click', async () => {
  if (confirm('确定要清除所有数据吗？')) {
    scrapedData = [];
    await chrome.storage.local.set({ scrapedData: [] });
    updateCount(0);
    addLog('已清除所有数据');
  }
});

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateData') {
    scrapedData = message.data;
    updateCount(scrapedData.length);
    
    // 节流保存（避免频繁的存储操作）
    chrome.storage.local.set({ scrapedData: scrapedData }).catch(() => {
      // 存储写入失败，继续运行
    });
  } else if (message.action === 'scrapingComplete') {
    isScrapting = false;
    updateStatus(`抓取完成，共 ${message.count} 条`);
  } else if (message.action === 'log') {
    addLog(message.message);
  }
});

// 初始化
loadSavedData();
addLog('插件已就绪');
