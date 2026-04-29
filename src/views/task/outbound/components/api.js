import request from '@/utils/request'

export const getOutboundList = data => {
  return request({
    url: '/busin/outbound/list',
    method: 'post',
    data,
  })
}

export const getOutboundDetail = id => {
  return request({
    url: `/busin/outbound/detail/${id}`,
    method: 'get',
  })
}

export const submitOutbound = data => {
  return request({
    url: '/busin/outbound/submit',
    method: 'post',
    data,
  })
}

export const updateOutbound = data => {
  return request({
    url: '/busin/outbound/updateData',
    method: 'post',
    data,
  })
}

export const deleteOutbound = params => {
  return request({
    url: '/busin/outbound/delete',
    method: 'post',
    params,
  })
}

export const executeAuditedOutboundUpdate = data => {
  return request({
    url: '/busin/outbound/executeAudited',
    method: 'post',
    data,
  })
}

export const autoWeightPickPlan = data => {
  return request({
    url: '/busin/pick/auto-weight',
    method: 'post',
    data,
  })
}

export const getInboundGoodsPageList = data => {
  return request({
    url: '/busin/inbound/goodsPageList',
    method: 'post',
    data,
  })
}

export const getInboundTaskListAll = () => {
  return request({
    url: '/busin/inbound/inListAll',
    method: 'get',
  })
}

export const getMaterialCodeListAll = () => {
  return request({
    url: '/busin/material-code/listAll',
    method: 'get',
  })
}

export const getInboundGoodsList = () => {
  return request({
    url: '/busin/inbound/getGoodsList',
    method: 'get',
  })
}

export const getLocationHierarchy = nodeType => {
  return request({
    url: `/busin/locationMap/hierarchy/listByNodeType/${nodeType}`,
    method: 'get',
  })
}

export const getLocationChildren = parentId => {
  return request({
    url: `/busin/locationMap/hierarchy/listByParentId/${parentId}`,
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

export const outbound = {
  list: getOutboundList,
  detail: getOutboundDetail,
  submit: submitOutbound,
  update: updateOutbound,
  delete: deleteOutbound,
}
