import request from '@/utils/request';

export function getDictionaryList(params) {
  return request({ url: '/base/dictionary/list', method: 'get', params });
}

export function addDictionary(data) {
  return request({ url: '/base/dictionary', method: 'post', data });
}

export function updateDictionary(id, data) {
  return request({ url: `/base/dictionary/${id}`, method: 'put', data });
}

export function deleteDictionary(id) {
  return request({ url: `/base/dictionary/${id}`, method: 'delete' });
}

export function getDictionaryDetail(id) {
  return request({ url: `/base/dictionary/${id}`, method: 'get' });
}

/**
 * 获取单位信息字典列表
 * 数据结构：{ unitName: 单位名称, unitCode: 单位代号, licenseNo: 许可证号 }
 */
export async function getUnitDictionaryList() {
  // 1. 查询父级分类
  const parentRes = await getDictionaryList({ keyword: '单位信息' });
  const parentList = (parentRes.data?.list || parentRes.list || []);
  const parent = parentList.find(item => item.fullName === '单位信息' && item.parentId === '0');
  if (!parent) return [];

  // 2. 查询子项
  const childRes = await getDictionaryList({ parentId: parent.id });
  const childList = (childRes.data?.list || childRes.list || []);

  // 3. 解析 description: "单位代号|许可证号"
  return childList.map(item => {
    const description = item.description || '';
    const parts = description.split('|');
    return {
      id: item.id,
      unitName: item.fullName,
      unitCode: parts[0] || '',
      licenseNo: parts[1] || '',
      raw: item,
    };
  });
}
