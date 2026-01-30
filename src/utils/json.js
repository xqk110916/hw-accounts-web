/*
 * @Author: wangguixing 1163260785@qq.com
 * @Date: 2023-03-24 09:58:45
 * @LastEditors: wangguixing
 * @LastEditTime: 2023-04-12 16:32:01
 * @FilePath: \src\utils\json.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

/**
 * @description: 判断是否是json字符串
 * @param {*} str
 * @return {*} Boolean
 */
export function isJsonString(str) {
  try {
    if (typeof JSON.parse(str) == 'object') {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}
export function filterEmptyObjOrArray(obj) {
  for (let key in obj) {
    if (obj[key] === null || (typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0)) {
      obj[key] = '';
    }
    if (typeof obj[key] === 'object' && Object.keys(obj[key]).length) {
      obj[key] = JSON.stringify(obj[key]);
    }
  }
  return obj;
}
