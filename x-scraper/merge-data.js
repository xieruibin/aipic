/**
 * 合并 AI 提示词数据脚本
 * 用于将浏览器插件抓取的数据合并到项目主数据文件
 */

const fs = require('fs');
const path = require('path');

// 配置路径
const DATA_DIR = path.join(__dirname, '..', 'data');
const MAIN_DATA_FILE = path.join(DATA_DIR, 'aiart-prompts.json');

/**
 * 读取 JSON 文件
 */
function readJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`, error.message);
    return null;
  }
}

/**
 * 写入 JSON 文件
 */
function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`写入文件失败: ${filePath}`, error.message);
    return false;
  }
}

/**
 * 生成唯一 ID
 */
function generateId(item) {
  const timestamp = item.extractedAt || new Date().toISOString();
  const titleHash = (item.title || '').substring(0, 20).replace(/\s/g, '-');
  return `${titleHash}-${Date.parse(timestamp)}`;
}

/**
 * 数据去重
 */
function deduplicateData(data) {
  const seen = new Map();
  const unique = [];

  data.forEach(item => {
    // 使用多个字段组合判断重复
    const key = item.sourceUrl || 
                item.image || 
                `${item.author}-${item.title}`;
    
    if (!seen.has(key)) {
      seen.set(key, true);
      unique.push(item);
    }
  });

  return unique;
}

/**
 * 评估数据质量
 */
function assessQuality(item) {
  let score = 0;
  
  // 内容长度（权重：25%）
  const contentLen = (item.content || '').length;
  if (contentLen > 150) score += 25;
  else if (contentLen > 80) score += 15;
  else if (contentLen > 30) score += 8;
  
  // 图片数量（权重：25%）
  const imgCount = (item.images || []).length;
  if (imgCount >= 2) score += 25;
  else if (imgCount === 1) score += 15;
  
  // 标签数量（权重：20%）
  const tagCount = (item.tags || []).length;
  if (tagCount >= 3) score += 20;
  else if (tagCount >= 1) score += 10;
  
  // 互动数据（权重：20%）
  const engagement = (item.likes || 0) + (item.retweets || 0);
  if (engagement > 100) score += 20;
  else if (engagement > 10) score += 10;
  
  // 作者信息（权重：10%）
  if (item.author && item.author !== 'Unknown') score += 10;
  
  return Math.min(100, score);
}

/**
 * 数据清洗和标准化
 */
function cleanData(data) {
  return data.map(item => {
    const qualityScore = assessQuality(item);
    return {
      id: generateId(item),
      title: item.title || 'Untitled',
      description: item.description || item.title || '',
      content: item.content || '',
      author: item.author || 'Unknown',
      authorAvatar: item.authorAvatar || '',
      authorUrl: item.authorUrl || '',
      category: item.category || 'AI Art',
      image: item.image || (item.images && item.images[0]) || '',
      images: item.images || [],
      tags: item.tags || [],
      likesCount: item.likesCount || 0,
      featured: item.featured || false,
      sourceUrl: item.sourceUrl || '',
      extractedAt: item.extractedAt || new Date().toISOString(),
      quality: item.quality || (qualityScore > 50 ? 'high' : 'medium'),
      qualityScore: qualityScore
    };
  });
}

/**
 * 合并数据
 */
function mergeData(existingFile, newFile) {
  console.log('🚀 开始合并数据...\n');

  // 读取现有数据
  console.log(`📖 读取主数据文件: ${existingFile}`);
  const existing = readJSON(existingFile);
  if (!existing) {
    console.error('❌ 无法读取主数据文件');
    return false;
  }
  console.log(`✅ 现有数据: ${existing.length} 条\n`);

  // 读取新数据
  console.log(`📖 读取新数据文件: ${newFile}`);
  const newData = readJSON(newFile);
  if (!newData) {
    console.error('❌ 无法读取新数据文件');
    return false;
  }
  console.log(`✅ 新数据: ${newData.length} 条\n`);

  // 清洗新数据
  console.log('🧹 清洗和标准化数据...');
  const cleanedNew = cleanData(newData);
  
  // 质量统计
  const qualityStats = {
    high: cleanedNew.filter(item => item.quality === 'high').length,
    medium: cleanedNew.filter(item => item.quality === 'medium').length,
    low: cleanedNew.filter(item => item.qualityScore < 30).length
  };
  console.log(`📊 质量分布: 优[${qualityStats.high}] | 中[${qualityStats.medium}] | 低[${qualityStats.low}]`);

  // 合并数据
  console.log('🔄 合并数据...');
  const merged = [...existing, ...cleanedNew];

  // 去重
  console.log('🔍 去重处理...');
  const unique = deduplicateData(merged);
  const duplicatesRemoved = merged.length - unique.length;
  console.log(`✅ 去除重复: ${duplicatesRemoved} 条\n`);

  // 创建备份
  const backupFile = existingFile.replace('.json', `.backup.${Date.now()}.json`);
  console.log(`💾 创建备份: ${backupFile}`);
  if (writeJSON(backupFile, existing)) {
    console.log('✅ 备份创建成功\n');
  }

  // 保存合并结果
  console.log(`💾 保存合并结果: ${existingFile}`);
  if (writeJSON(existingFile, unique)) {
    console.log('✅ 保存成功\n');
    
    // 显示统计
    console.log('📊 合并统计:');
    console.log(`   原有数据: ${existing.length} 条`);
    console.log(`   新增数据: ${newData.length} 条`);
    console.log(`   去除重复: ${duplicatesRemoved} 条`);
    console.log(`   最终数据: ${unique.length} 条`);
    console.log(`   净增加: ${unique.length - existing.length} 条`);
    
    // 质量统计
    const finalQualityStats = {
      high: unique.filter(item => item.quality === 'high').length,
      medium: unique.filter(item => item.quality === 'medium').length,
      low: unique.filter(item => (item.qualityScore || 0) < 30).length
    };
    console.log(`\n📈 最终质量分布: 优[${finalQualityStats.high}] | 中[${finalQualityStats.medium}] | 低[${finalQualityStats.low}]`);
    console.log(`\n💡 建议: 质量评分<30的条目建议手动审查\n`);
    
    return true;
  } else {
    console.error('❌ 保存失败');
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法: node merge-data.js <新数据文件路径>');
    console.log('例如: node merge-data.js ai-prompts-1702345678901.json');
    console.log('\n或直接将文件拖到此脚本上运行');
    process.exit(1);
  }

  const newFile = path.resolve(args[0]);
  
  if (!fs.existsSync(newFile)) {
    console.error(`❌ 文件不存在: ${newFile}`);
    process.exit(1);
  }

  if (!fs.existsSync(MAIN_DATA_FILE)) {
    console.error(`❌ 主数据文件不存在: ${MAIN_DATA_FILE}`);
    process.exit(1);
  }

  const success = mergeData(MAIN_DATA_FILE, newFile);
  
  if (success) {
    console.log('✨ 数据合并完成！');
    process.exit(0);
  } else {
    console.error('❌ 数据合并失败');
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { mergeData, cleanData, deduplicateData };
