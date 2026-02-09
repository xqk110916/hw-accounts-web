/**
 * 颜色生成工具函数
 * 根据入库日期生成一致的颜色
 */

// 字符串哈希函数
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash);
}

/**
 * 根据日期字符串生成颜色
 * @param {string} dateString - 日期字符串，格式如 '2026-01-15'
 * @returns {string} HSL颜色值
 */
export function getColorByDate(dateString) {
  if (!dateString) {
    return 'hsl(0, 0%, 80%)'; // 默认灰色
  }
  const hash = hashCode(dateString);
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

/**
 * 预定义的颜色调色板（备用方案）
 */
export const colorPalette = [
  '#FF6B6B', // 红色
  '#4ECDC4', // 青色
  '#45B7D1', // 蓝色
  '#96CEB4', // 绿色
  '#FFEAA7', // 黄色
  '#DDA0DD', // 紫色
  '#98D8C8', // 薄荷绿
  '#F7DC6F', // 金色
  '#BB8FCE', // 淡紫
  '#85C1E9', // 天蓝
  '#F8B500', // 橙色
  '#82E0AA', // 浅绿
];

/**
 * 根据索引获取调色板颜色
 * @param {number} index - 索引
 * @returns {string} 颜色值
 */
export function getColorByIndex(index) {
  return colorPalette[index % colorPalette.length];
}

/**
 * 生成日期到颜色的映射
 * @param {Array} dates - 日期数组
 * @returns {Object} 日期到颜色的映射对象
 */
export function generateDateColorMap(dates) {
  const uniqueDates = [...new Set(dates)].sort();
  const colorMap = {};
  uniqueDates.forEach((date, index) => {
    colorMap[date] = getColorByIndex(index);
  });
  return colorMap;
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date|string} date - 日期对象或字符串
 * @returns {string} 格式化的日期字符串
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
