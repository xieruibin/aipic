// AI 提示词抓取器配置文件

// AI 模型和平台关键词
export const AI_KEYWORDS = {
  // 图像生成模型
  imageModels: [
    'midjourney', 'mj', 'v6', 'v5',
    'stable diffusion', 'sd', 'sdxl', 'sd3',
    'dall-e', 'dalle', 'dalle-3',
    'flux', 'flux.1', 'flux pro',
    'leonardo', 'leonardo.ai',
    'adobe firefly', 'firefly',
    'imagen', 'imagen 3',
    'ideogram', 'playground',
    'niji', 'niji journey',
    // Nano Banana 系列
    'nano banana', 'nano banana pro', 'nana banana pro'
  ],
  
  // 视频生成模型
  videoModels: [
    'sora', 'runway', 'gen-2', 'gen-3',
    'pika', 'pika labs',
    'stable video', 'animate diff',
    'kling', 'hailuo', '海螺'
  ],
  
  // 文本生成模型
  textModels: [
    'chatgpt', 'gpt-4', 'gpt-4o',
    'claude', 'claude 3', 'sonnet',
    'gemini', 'gemini pro',
    'grok', 'grok-2',
    'llama', 'mistral'
  ],
  
  // 工具和技术
  tools: [
    'comfyui', 'automatic1111',
    'controlnet', 'ipadapter',
    'lora', 'checkpoint', 'embedding',
    'inpainting', 'outpainting',
    'img2img', 'txt2img',
    'upscale', 'face restore'
  ],
  
  // 中文关键词
  chinese: [
    '提示词', '咒语', 'prompt',
    'ai生成', 'ai绘画', 'ai艺术',
    'ai图片', 'ai作图', 'ai画图',
    '人工智能', '生成式ai', '文生图',
    '图生图', '模型', '参数'
  ],
  
  // 社区和平台
  platforms: [
    'civitai', 'huggingface',
    'openart', 'prompthero',
    'lexica', 'arthub'
  ]
};

// 合并所有关键词为一个数组
export function getAllKeywords() {
  return Object.values(AI_KEYWORDS).flat();
}

// 分类映射规则
export const CATEGORY_MAPPING = {
  'midjourney': 'Midjourney',
  'mj': 'Midjourney',
  'stable diffusion': 'Stable Diffusion',
  'sd': 'Stable Diffusion',
  'sdxl': 'Stable Diffusion',
  'dall-e': 'DALL-E',
  'dalle': 'DALL-E',
  'flux': 'Flux',
  'leonardo': 'Leonardo',
  'firefly': 'Adobe Firefly',
  'sora': 'Sora',
  'runway': 'Runway',
  'comfyui': 'ComfyUI',
  'niji': 'Niji Journey',
  'imagen': 'Imagen',
  'ideogram': 'Ideogram',
  'playground': 'Playground',
  // Nano Banana 映射
  'nano banana': 'Nano Banana Pro',
  'nano banana pro': 'Nano Banana Pro',
  'nana banana pro': 'Nano Banana Pro'
};

// 获取默认分类
export function getDefaultCategory() {
  return 'AI Art';
}

// 抓取配置
export const SCRAPING_CONFIG = {
  // 自动滚动延迟（毫秒）
  scrollDelay: 2000,
  
  // 每次滚动距离（像素）
  scrollDistance: 1000,
  
  // 最大抓取数量（0 = 无限制）
  maxItems: 0,
  
  // 是否需要图片
  requireImages: true,
  
  // 最小图片数量
  minImages: 1,
  
  // 是否过滤转发
  filterRetweets: false,
  
  // 最小文本长度
  minTextLength: 10,
  
  // 是否抓取视频
  includeVideos: false
};

// 数据清洗配置
export const CLEANING_CONFIG = {
  // 移除 URL
  removeUrls: true,
  
  // 移除 @提及
  removeMentions: false,
  
  // 移除多余空白
  trimWhitespace: true,
  
  // 标题最大长度
  maxTitleLength: 100,
  
  // 描述最大长度
  maxDescriptionLength: 200
};

export default {
  AI_KEYWORDS,
  getAllKeywords,
  CATEGORY_MAPPING,
  getDefaultCategory,
  SCRAPING_CONFIG,
  CLEANING_CONFIG
};
