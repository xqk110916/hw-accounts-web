import request from '@/utils/request';

export function getHierarchyTree() {
  return request({ url: '/busin/locationMap/hierarchy/tree', method: 'get' });
}

export function getHierarchyTreeByBalanceArea(balanceAreaId) {
  return request({ url: `/busin/locationMap/hierarchy/treeByBalanceArea/${balanceAreaId}`, method: 'get' });
}

export function getHierarchyPageList(data) {
  return request({ url: '/busin/locationMap/hierarchy/pageList', method: 'post', data });
}

export function getHierarchyListByParentId(parentId) {
  return request({ url: `/busin/locationMap/hierarchy/listByParentId/${parentId}`, method: 'get' });
}

export function getHierarchyListByNodeType(nodeType) {
  return request({ url: `/busin/locationMap/hierarchy/listByNodeType/${nodeType}`, method: 'get' });
}

export function getHierarchyDetail(id) {
  return request({ url: `/busin/locationMap/hierarchy/detail/${id}`, method: 'get' });
}

export function addHierarchyNode(data) {
  return request({ url: '/busin/locationMap/hierarchy/add', method: 'post', data });
}

export function updateHierarchyNode(data) {
  return request({ url: '/busin/locationMap/hierarchy/update', method: 'post', data });
}

export function deleteHierarchyNode(id) {
  return request({ url: `/busin/locationMap/hierarchy/delete/${id}`, method: 'post' });
}

export function batchCreateShelf(data) {
  return request({ url: '/busin/locationMap/hierarchy/batchCreateShelf', method: 'post', data });
}

export function getPositionMap(data) {
  return request({ url: '/busin/locationMap/positionMap', method: 'post', data });
}

// 位置信息管理
export function getPositionPageList(data) {
  return request({ url: '/busin/locationMap/position/pageList', method: 'post', data });
}

export function getFreePositions() {
  return request({ url: '/busin/locationMap/position/listFreePositions', method: 'get' });
}

export function getPositionListByShelfId(shelfId) {
  return request({ url: `/busin/locationMap/position/listByShelfId/${shelfId}`, method: 'get' });
}

export function getPositionDetail(id) {
  return request({ url: `/busin/locationMap/position/detail/${id}`, method: 'get' });
}

export function addPosition(data) {
  return request({ url: '/busin/locationMap/position/add', method: 'post', data });
}

export function updatePosition(data) {
  return request({ url: '/busin/locationMap/position/update', method: 'post', data });
}

export function deletePosition(id) {
  return request({ url: `/busin/locationMap/position/delete/${id}`, method: 'post' });
}

export function lockPosition(positionId) {
  return request({ url: `/busin/locationMap/position/lock/${positionId}`, method: 'post' });
}

export function unlockPosition(positionId) {
  return request({ url: `/busin/locationMap/position/unlock/${positionId}`, method: 'post' });
}
