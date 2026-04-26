const STORAGE_KEY = 'hw_location_map_extra_layout';

export const SHELF_TYPE_PARENT_ID = '2046473482554638338';

function safeParse(value, fallback = null) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function getStore() {
  try {
    return safeParse(localStorage.getItem(STORAGE_KEY), {}) || {};
  } catch (error) {
    return {};
  }
}

function setStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store || {}));
  } catch (error) {
    console.error('保存本地位置图布局失败', error);
  }
}

export function normalizeExtra(extra) {
  const parsed = safeParse(extra, {});
  return parsed && typeof parsed === 'object' ? parsed : {};
}

export function getLocalExtra(warehouseId) {
  const store = getStore();
  return normalizeExtra(store[String(warehouseId)] || {});
}

export function saveLocalExtra(warehouseId, extra) {
  if (!warehouseId) return;
  const store = getStore();
  store[String(warehouseId)] = normalizeExtra(extra);
  setStore(store);
}

export function resolveLayoutExtra(warehouseDetail) {
  const detailExtra = normalizeExtra(warehouseDetail && warehouseDetail.extra);
  if (detailExtra.layout2d) return detailExtra;
  return getLocalExtra(warehouseDetail && warehouseDetail.id);
}

export function parseShelfType(value) {
  const parts = String(value || '').split('-').map(item => Number(item));
  return {
    rowCount: parts[0] || 1,
    levelCount: parts[1] || 1,
    length: parts[2] || 2,
    width: parts[3] || 10,
    bizCode: value || ''
  };
}

export function normalizeShelfTypeOptions(list = []) {
  return list.map(item => ({
    ...item,
    label: item.fullName || item.label || item.dictValue || item.bizCode,
    value: item.dictValue || item.value || item.bizCode,
    bizCode: item.bizCode || item.dictValue || item.value
  }));
}
