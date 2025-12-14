// 后台服务工作脚本
console.log('X.com 抓取器后台脚本已启动');

// 监听插件安装
chrome.runtime.onInstalled.addListener(() => {
  console.log('插件已安装');
  
  // 初始化存储
  chrome.storage.local.set({
    scrapedData: [],
    settings: {
      autoScroll: true,
      scrollDelay: 2000,
      maxPosts: 1000
    }
  });
});

// 处理消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('收到消息:', message);
  
  // 可以在这里添加额外的后台处理逻辑
  if (message.action === 'saveData') {
    chrome.storage.local.set({ scrapedData: message.data }, () => {
      console.log('数据已保存');
      sendResponse({ success: true });
    });
    return true;
  }
});

// 监听存储变化
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.scrapedData) {
    console.log('数据已更新:', changes.scrapedData.newValue?.length || 0, '条');
  }
});
