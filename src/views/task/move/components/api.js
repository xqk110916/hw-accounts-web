import request from '@/utils/request'

export const getMoveList = data => {
  return request({
    url: '/busin/move/list',
    method: 'post',
    data,
  })
}

export const getMoveDetail = id => {
  return request({
    url: `/busin/move/detail/${id}`,
    method: 'get',
  })
}

export const submitMove = data => {
  return request({
    url: '/busin/move/submit',
    method: 'post',
    data,
  })
}

export const updateMove = data => {
  return request({
    url: '/busin/move/update',
    method: 'post',
    data,
  })
}

export const deleteMove = params => {
  return request({
    url: '/busin/move/deleteByIds',
    method: 'get',
    params,
  })
}

export const confirmMove = data => {
  return request({
    url: '/busin/move/confirm',
    method: 'post',
    data,
  })
}

export const executeAuditedMove = params => {
  return request({
    url: '/busin/move/executeAudited',
    method: 'post',
    params,
  })
}

export const cancelMoveApply = params => {
  return request({
    url: '/busin/move/cancelApply',
    method: 'get',
    params,
  })
}

export const getLocationHierarchy = nodeType => {
  return request({
    url: `/busin/locationMap/hierarchy/listByNodeType/${nodeType}`,
    method: 'get',
  })
}

export const getPositionMap = data => {
  return request({
    url: '/busin/locationMap/positionMap',
    method: 'post',
    data,
  })
}

export const getContainerInfo = (containerCode) => {
  return request({
    url: '/busin/inbound/getByContainerCode',
    method: 'get',
    params: { containerCode },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

// 下载导入模板（tempType=5 为移库模板，复用入库通用模板接口）
export const downloadMoveTemplate = params => {
  return request({
    url: '/busin/inbound/downTemplate',
    method: 'get',
    params,
    responseType: 'blob',
  })
}

// 导入移库明细
export const importMove = data => {
  return request({
    url: '/busin/move/import',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const move = {
  list: getMoveList,
  detail: getMoveDetail,
  submit: submitMove,
  update: updateMove,
  delete: deleteMove,
}
