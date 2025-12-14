// X.com AI 提示词抓取脚本（防重复加载）
if (window.__X_SCRAPER_LOADED__) {
  console.log('X.com AI 提示词抓取器已存在，跳过重复初始化');
} else {
  window.__X_SCRAPER_LOADED__ = true;
  console.log('X.com AI 提示词抓取器初始化');

  let isScrapting = false;
  let scrapedPosts = [];
  let observer = null;
  let lastScrapeTime = 0;
  let lastMessageTime = 0;

// 频率控制配置
const RATE_LIMITS = {
  autoScroll: 2000,        // 自动滚动间隔（毫秒）
  scrapeCheck: 1000,       // 抓取检查间隔（毫秒）
  messageDelay: 500,       // 消息发送延迟（毫秒）
  observerThrottle: 800,   // 监听器节流（毫秒）
  maxRequestsPerMinute: 10 // 每分钟最大消息数
};

// AI 提示词相关关键词
const AI_KEYWORDS = [
  'midjourney', 'stable diffusion', 'dall-e', 'dalle', 'sd', 'mj',
  'prompt', '提示词', '咒语', 'ai art', 'ai生成', 'ai绘画',
  'comfyui', 'controlnet', 'lora', 'checkpoint', '模型',
  'flux', 'sora', 'runway', 'leonardo', 'firefly',
  'chatgpt', 'claude', 'gemini', 'grok', '生成式ai',
  // Nano Banana 相关
  'nano banana', 'nano banana pro', 'nana banana pro'
];

// 带频率控制的消息发送
function sendMessageThrottled(message) {
  const now = Date.now();
  if (now - lastMessageTime < RATE_LIMITS.messageDelay) {
    return; // 忽略过于频繁的请求
  }
  lastMessageTime = now;
  
  try {
    chrome.runtime.sendMessage(message).catch(() => {
      // 连接断开，忽略
    });
  } catch (error) {
    console.warn('消息发送失败:', error);
  }
}

// 发送日志到 popup
function sendLog(message) {
  sendMessageThrottled({
    action: 'log',
    message: message
  });
}

// 检查推文是否包含 AI 提示词相关内容
function isAIPromptTweet(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  
  // 排除明显的非提示词内容
  const excludePatterns = [
    /^(breaking news|breaking:|just dropped|now (available|live)|incredible|wow,|Wow)/i,
    /prompt in (the )?alt|alt text/i,
    /^(Steps:|\\d+\\.|Check out)/i,
  ];
  
  if (excludePatterns.some(pattern => pattern.test(text))) {
    return false;
  }
  
  // 必须包含 AI 关键词
  return AI_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

// 提取标签
function extractTags(text) {
  if (!text) return [];
  const hashtagRegex = /#[\u4e00-\u9fa5a-zA-Z0-9_]+/g;
  const matches = text.match(hashtagRegex) || [];
  return matches.map(tag => tag.substring(1));
}

// 提取分类（根据关键词）
function extractCategory(text) {
  if (!text) return 'Other';
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('midjourney') || lowerText.includes('mj')) return 'Midjourney';
  if (lowerText.includes('stable diffusion') || lowerText.includes('sd')) return 'Stable Diffusion';
  if (lowerText.includes('dall-e') || lowerText.includes('dalle')) return 'DALL-E';
  if (lowerText.includes('flux')) return 'Flux';
  if (lowerText.includes('sora')) return 'Sora';
  if (lowerText.includes('runway')) return 'Runway';
  if (lowerText.includes('leonardo')) return 'Leonardo';
  if (lowerText.includes('comfyui')) return 'ComfyUI';
  if (lowerText.includes('nano banana') || lowerText.includes('nano banana pro') || lowerText.includes('nana banana pro')) return 'Nano Banana Pro';
  
  return 'AI Art';
}

// 清理和格式化提示词文本
function cleanPromptText(text) {
  if (!text) return '';
  // 移除 URL
  text = text.replace(/https?:\/\/[^\s]+/g, '');
  // 移除多余空白
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

// 提取推文数据（专注于 AI 提示词）
function extractTweetData(article) {
  try {
    const data = {
      id: null,
      title: null,
      description: null,
      content: null,
      author: null,
      username: null,
      authorAvatar: null,
      authorUrl: null,
      category: null,
      timestamp: null,
      likes: null,
      retweets: null,
      replies: null,
      images: [],
      videos: [],
      tags: [],
      url: null,
      featured: false,
      extractedAt: new Date().toISOString()
    };

    // 提取作者信息
    const authorLink = article.querySelector('a[role="link"][href^="/"]');
    if (authorLink) {
      const href = authorLink.getAttribute('href');
      data.username = href.split('/')[1];
      if (data.username) {
        data.authorUrl = `https://x.com/${data.username}`;
      }
      
      // 构建推文链接（需要推文ID）
      const tweetLink = article.querySelector('a[href*="/status/"]');
      if (tweetLink) {
        data.url = `https://x.com${tweetLink.getAttribute('href')}`;
      }
    }

    const authorName = article.querySelector('[data-testid="User-Name"] span');
    if (authorName) {
      data.author = authorName.textContent;
    }

    // 提取作者头像
    const avatarImg = article.querySelector('[data-testid="Tweet-User-Avatar"] img, a[role="link"][href^="/"] img');
    if (avatarImg) {
      const avatarSrc = avatarImg.getAttribute('src');
      if (avatarSrc && !avatarSrc.includes('emoji')) {
        // 使用原图或较大尺寸
        data.authorAvatar = avatarSrc.replace(/&name=\w+/, '&name=200x200');
      }
    }

    // 提取推文文本
    const tweetText = article.querySelector('[data-testid="tweetText"]');
    let fullText = '';
    if (tweetText) {
      fullText = tweetText.textContent;
      data.content = cleanPromptText(fullText);
    }
    
    // 检查是否为 AI 提示词推文
    if (!isAIPromptTweet(fullText)) {
      return null; // 不是 AI 提示词相关，跳过
    }
    
    // 提取标题（取前50个字符或第一行）
    const firstLine = fullText.split('\n')[0];
    data.title = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
    data.description = data.title;
    
    // 质量检查：内容长度最少 30 字符
    if (data.content.length < 30) {
      sendLog(`[质量检查] 内容过短，已过滤: "${data.title}"`);
      return null;
    }
    
    // 提取标签和分类
    data.tags = extractTags(fullText);
    data.category = extractCategory(fullText);

    // 提取时间戳
    const timeElement = article.querySelector('time');
    if (timeElement) {
      data.timestamp = timeElement.getAttribute('datetime');
    }

    // 提取互动数据
    const likeButton = article.querySelector('[data-testid="like"]');
    if (likeButton) {
      const likeText = likeButton.getAttribute('aria-label');
      const likeMatch = likeText?.match(/(\d+)/);
      data.likes = likeMatch ? parseInt(likeMatch[1]) : 0;
    }

    const retweetButton = article.querySelector('[data-testid="retweet"]');
    if (retweetButton) {
      const retweetText = retweetButton.getAttribute('aria-label');
      const retweetMatch = retweetText?.match(/(\d+)/);
      data.retweets = retweetMatch ? parseInt(retweetMatch[1]) : 0;
    }

    const replyButton = article.querySelector('[data-testid="reply"]');
    if (replyButton) {
      const replyText = replyButton.getAttribute('aria-label');
      const replyMatch = replyText?.match(/(\d+)/);
      data.replies = replyMatch ? parseInt(replyMatch[1]) : 0;
    }

    // 提取图片（获取原图链接）
    const images = article.querySelectorAll('img[src*="media"]');
    images.forEach(img => {
      let src = img.getAttribute('src');
      if (src && !src.includes('profile_images') && !src.includes('emoji')) {
        // 转换为原图链接
        src = src.replace(/&name=\w+/, '&name=orig');
        if (!data.images.includes(src)) {
          data.images.push(src);
        }
      }
    });
    
    // 如果没有图片，可能不是有效的提示词内容
    if (data.images.length === 0) {
      return null;
    }

    // 提取视频
    const videos = article.querySelectorAll('video');
    videos.forEach(video => {
      const src = video.getAttribute('src');
      if (src) {
        data.videos.push(src);
      }
    });

    // 生成唯一 ID
    data.id = `${data.username}_${data.timestamp}`;
    
    // 添加质量标记
    data.quality = data.content.length > 100 && data.images.length > 0 ? 'high' : 'medium';

    return data;
  } catch (error) {
    console.error('提取推文数据时出错:', error);
    return null;
  }
}

// 带频率控制的抓取
function scrapVisibleTweets() {
  const now = Date.now();
  if (now - lastScrapeTime < RATE_LIMITS.scrapeCheck) {
    return 0; // 抓取过于频繁，跳过
  }
  lastScrapeTime = now;

  const articles = document.querySelectorAll('article[data-testid="tweet"]');
  let newCount = 0;
  let skippedCount = 0;

  articles.forEach(article => {
    const tweetData = extractTweetData(article);
    if (tweetData && tweetData.id) {
      // 检查是否已经抓取过
      const exists = scrapedPosts.find(post => post.id === tweetData.id);
      if (!exists) {
        scrapedPosts.push(tweetData);
        newCount++;
      }
    } else {
      skippedCount++;
    }
  });

  if (newCount > 0) {
    sendLog(`发现 ${newCount} 条新 AI 提示词，总计 ${scrapedPosts.length} 条（已过滤 ${skippedCount} 条非提示词推文）`);
    
    // 发送数据到 popup（使用节流）
    sendMessageThrottled({
      action: 'updateData',
      data: scrapedPosts
    });
  }

  return newCount;
}

// 自动滚动以加载更多内容
function autoScroll() {
  if (!isScrapting) return;

  // 滚动到页面底部
  window.scrollTo(0, document.body.scrollHeight);

  // 等待内容加载后继续抓取（使用可配置的频率）
  setTimeout(() => {
    scrapVisibleTweets();
    if (isScrapting) {
      autoScroll();
    }
  }, RATE_LIMITS.autoScroll);
}

// 监听新加载的内容（带节流）
function startObserver() {
  const targetNode = document.querySelector('main');
  if (!targetNode) {
    sendLog('未找到主容器');
    return;
  }

  let observerTimeout = null;
  
  observer = new MutationObserver((mutations) => {
    if (!isScrapting) return;
    
    // 节流监听器触发（防止过于频繁的抓取）
    if (observerTimeout) {
      clearTimeout(observerTimeout);
    }
    
    observerTimeout = setTimeout(() => {
      scrapVisibleTweets();
    }, RATE_LIMITS.observerThrottle);
  });

  observer.observe(targetNode, {
    childList: true,
    subtree: true
  });

  sendLog('开始监听页面变化');
}

// 开始抓取
function startScraping(options) {
  if (isScrapting) {
    sendLog('抓取已在进行中');
    return;
  }

  isScrapting = true;
  scrapedPosts = [];
  lastScrapeTime = 0;
  lastMessageTime = 0;
  
  sendLog('开始抓取 X.com AI 提示词内容...');
  sendLog(`将自动过滤包含以下关键词的推文: ${AI_KEYWORDS.slice(0, 5).join(', ')} 等`);
  sendLog(`频率设置: 滚动${RATE_LIMITS.autoScroll}ms | 抓取${RATE_LIMITS.scrapeCheck}ms | 消息${RATE_LIMITS.messageDelay}ms`);
  
  // 首次抓取当前可见内容
  scrapVisibleTweets();
  
  // 启动观察器
  startObserver();
  
  // 开始自动滚动
  setTimeout(() => autoScroll(), RATE_LIMITS.autoScroll);
}

// 停止抓取
function stopScraping() {
  isScrapting = false;
  
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  sendLog(`抓取已停止，共抓取 ${scrapedPosts.length} 条`);
  
  chrome.runtime.sendMessage({
    action: 'scrapingComplete',
    count: scrapedPosts.length
  });
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 健康检查：同步回复，确认 content script 存在
  if (message.action === 'ping') {
    sendResponse({ ok: true, status: 'content-script-ready' });
    return; // 同步响应，不返回 true
  }
  if (message.action === 'startScraping') {
    startScraping(message.options);
    sendResponse({ success: true });
  } else if (message.action === 'stopScraping') {
    stopScraping();
    sendResponse({ success: true });
  }
  // 仅在需要异步响应时返回 true，这里不需要
});

// 页面加载完成时的通知
sendLog('Content script 已就绪');
}
