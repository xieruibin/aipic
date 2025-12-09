export type Language = 'zh' | 'en'

export const translations = {
  zh: {
    // Header
    promptLibrary: '提示词库',
    creators: '创作者',
    about: '关于',
    
    // Main Content
    aiPromptLibrary: 'AI 图像生成提示词库',
    libraryDescription: '灵感库 · 包含 1000+ ChatGPT、Midjourney、Stable Diffusion 提示词、设计、绘画工具等',
    selectedFilters: '已选筛选',
    clearAll: '清除全部',
    cardView: '卡片',
    masonryView: '瀑布流',
    foundResults: '找到',
    results: '个结果',
    loadingMore: '滚动加载更多...',
    allLoaded: '已加载全部',
    items: '条内容',
    
    // Search & Filter
    searchPlaceholder: '搜索提示词、作者或标签...',
    featured: '精选',
    allCategories: '全部',
    
    // Modal
    copy: '复制提示词',
    copySuccess: '已复制到剪贴板',
    copyError: '复制失败',
    backToTop: '回到顶部',
    
    // Footer
    footerText: '© 2025 AI Prompt Gallery. 极简风格，专注创意。',
    
    // Dialog
    addPrompt: '添加提示词',
    submit: '提交',
    cancel: '取消',
    creatorsPageTitle: '创作者',
    creatorsPageDesc: '发现优秀创作者分享的 AI 艺术提示词',
    searchCreators: '搜索创作者...',
    sortByPrompts: '按提示词数',
    sortByName: '按名称',
    creatorsCount: '位创作者',
    totalPrompts: '个提示词',
    averagePrompts: '条平均提示词',
    noCreatorsFound: '没有找到匹配的创作者',
  },
  en: {
    // Header
    promptLibrary: 'Prompt Library',
    creators: 'Creators',
    about: 'About',
    
    // Main Content
    aiPromptLibrary: 'AI Image Generation Prompt Library',
    libraryDescription: 'Inspiration Gallery · 1000+ ChatGPT, Midjourney, Stable Diffusion Prompts & Tools',
    selectedFilters: 'Selected Filters',
    clearAll: 'Clear All',
    cardView: 'Cards',
    masonryView: 'Masonry',
    foundResults: 'Found',
    results: 'results',
    loadingMore: 'Loading more...',
    allLoaded: 'All',
    items: 'items loaded',
    
    // Search & Filter
    searchPlaceholder: 'Search prompts, creators or tags...',
    featured: 'Featured',
    allCategories: 'All',
    
    // Modal
    copy: 'Copy Prompt',
    copySuccess: 'Copied to clipboard',
    copyError: 'Failed to copy',
    backToTop: 'Back to Top',
    
    // Footer
    footerText: '© 2025 AI Prompt Gallery. Minimalist. Focused on Creativity.',
    
    // Dialog
    addPrompt: 'Add Prompt',
    submit: 'Submit',
    cancel: 'Cancel',
    creatorsPageTitle: 'Creators',
    creatorsPageDesc: 'Discover AI art prompts from amazing creators',
    searchCreators: 'Search creators...',
    sortByPrompts: 'By Prompts',
    sortByName: 'By Name',
    creatorsCount: 'Creators',
    totalPrompts: 'Total Prompts',
    averagePrompts: 'Avg Prompts',
    noCreatorsFound: 'No creators found',
  }
}

export const getTranslation = (language: Language, key: keyof typeof translations.zh): string => {
  return translations[language][key] || translations.zh[key]
}

export const t = (language: Language) => (key: keyof typeof translations.zh): string => {
  return getTranslation(language, key)
}
