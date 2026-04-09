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
