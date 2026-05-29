import request from '@/utils/request';

export function getWarehouseListByBalanceArea(data) {
  return request({ url: '/busin/warehouse/listByBalanceArea', method: 'post', data });
}

export function getWarehouseCapacity(balanceAreaId) {
  return request({ url: `/busin/warehouse/capacity/${balanceAreaId}`, method: 'get' });
}

export function getProductStatistics(data) {
  return request({ url: '/busin/warehouse/product/statistic', method: 'post', data });
}

export function getInOutStatistics(data) {
  return request({ url: '/busin/form/stat/in-out', method: 'post', data });
}
