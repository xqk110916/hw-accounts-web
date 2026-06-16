/**
 * 容器颜色工具函数
 * 根据容器状态和物料代码生成颜色
 */

/**
 * 获取容器颜色
 * @param {string|number} status - 容器状态：'2'=占用锁定
 * @param {string} materialCode - 物料代码，非空表示有物料
 * @returns {string} hex颜色值
 */
export function getContainerColor(status, materialCode) {
  if (String(status) === '2') return '#E6A23C'  // 🟡 占用锁定 - 黄色
  if (materialCode) return '#67C23A'             // 🟢 有物料 - 绿色
  return '#409EFF'                               // 🔵 空闲 - 蓝色
}

/**
 * 根据日期字符串生成颜色（已废弃，保留兼容）
 * @deprecated 请使用 getContainerColor
 */
export function getColorByDate(dateString) {
  return getContainerColor('', dateString ? 'has' : '')
}

/**
 * 区域编号（areaCode）配色方案
 * 仅老库房（warehouseType === '2'）按 areaCode 做区域区分时使用。
 * A-F 固定 6 色，刻意避开容器状态色（绿 #67C23A / 蓝 #409EFF / 黄 #E6A23C），
 * 自定义区域编号 fallback 到 AREA_FALLBACK_PALETTE，按 areaCode 排序取色。
 */
const AREA_FIXED_COLORS = {
  A: '#5B5FC7', // 靛蓝紫
  B: '#D6336C', // 洋红
  C: '#0CA678', // 青绿松
  D: '#E8590C', // 橙红
  E: '#5C7CFA', // 石板蓝
  F: '#2B8A3E'  // 深绿松
};

// 自定义区域编号的兜底调色板（避开固定色与状态色）
const AREA_FALLBACK_PALETTE = [
  '#9C36B5', // 紫
  '#1098AD', // 蓝青
  '#E67700', // 琥珀
  '#A61E4D', // 玫红
  '#3B5BDB', // 宝蓝
  '#087F5B', // 墨绿
  '#C2255C', // 桃红
  '#6741D9'  // 深紫
];

/**
 * 标准化 areaCode：空值兜底为 'A'，统一大写去空格
 * @param {string} areaCode
 * @returns {string}
 */
export function normalizeAreaCode(areaCode) {
  const code = String(areaCode == null ? '' : areaCode).trim();
  return code ? code.toUpperCase() : 'A';
}

/**
 * 根据区域编号集合构建 areaCode -> 颜色 的映射表。
 * A-F 用固定色；其余自定义编号按字典序排序后依次从兜底调色板取色。
 * @param {Array<string>} areaCodes - 当前库房出现过的区域编号集合
 * @returns {Object} { [areaCode]: hexColor }
 */
export function buildAreaColorMap(areaCodes = []) {
  const unique = [...new Set((areaCodes || []).map(normalizeAreaCode))];
  const map = {};
  // 自定义编号（非 A-F）按排序取兜底色
  const customCodes = unique.filter(code => !AREA_FIXED_COLORS[code]).sort();
  let fallbackIdx = 0;
  unique.forEach(code => {
    if (AREA_FIXED_COLORS[code]) {
      map[code] = AREA_FIXED_COLORS[code];
    }
  });
  customCodes.forEach(code => {
    map[code] = AREA_FALLBACK_PALETTE[fallbackIdx % AREA_FALLBACK_PALETTE.length];
    fallbackIdx++;
  });
  return map;
}

/**
 * 获取单个区域编号的颜色（无映射表时的便捷方法，A-F 命中固定色，其余取兜底首色）
 * @param {string} areaCode
 * @returns {string} hex颜色值
 */
export function getAreaColor(areaCode) {
  const code = normalizeAreaCode(areaCode);
  return AREA_FIXED_COLORS[code] || AREA_FALLBACK_PALETTE[0];
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
