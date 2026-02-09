import request from '@/utils/request';

/**
 * 获取库房列表
 */
export function getWarehouseList(params) {
  return request({
    url: '/location/warehouse/list',
    method: 'get',
    params
  });
}

/**
 * 获取库房详情（包含货架、容器信息）
 */
export function getWarehouseDetail(warehouseId) {
  return request({
    url: `/location/warehouse/${warehouseId}`,
    method: 'get'
  });
}

/**
 * 获取货架信息
 */
export function getShelfInfo(shelfId) {
  return request({
    url: `/location/shelf/${shelfId}`,
    method: 'get'
  });
}

/**
 * 获取容器入库信息
 */
export function getContainerInfo(containerId) {
  return request({
    url: `/location/container/${containerId}`,
    method: 'get'
  });
}

/**
 * 导出位置图
 */
export function exportLocationMap(params) {
  return request({
    url: '/location/export',
    method: 'post',
    data: params,
    responseType: 'blob'
  });
}

/**
 * 获取库房库存统计
 */
export function getWarehouseStatistics(warehouseId) {
  return request({
    url: `/location/warehouse/${warehouseId}/statistics`,
    method: 'get'
  });
}
