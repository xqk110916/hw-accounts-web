import request from '@/utils/request'

export const getOutboundList = params => {
  return request({
    url: '/task/outbound/listPage',
    method: 'post',
    params,
  })
}

export const getOutboundDetail = params => {
  return request({
    url: '/task/outbound/getInfoById',
    method: 'post',
    params,
  })
}

export const saveOrUpdateOutbound = data => {
  return request({
    url: '/task/outbound/saveOrUpdate',
    method: 'post',
    data,
  })
}

export const deleteOutbound = params => {
  return request({
    url: '/task/outbound/delete',
    method: 'post',
    params,
  })
}

export const auditOutbound = data => {
  return request({
    url: '/task/outbound/audit',
    method: 'post',
    data,
  })
}

// 确认出库数据
export const confirmOutbound = data => {
  return request({
    url: '/busin/outbound/confirm',
    method: 'post',
    data,
  })
}

// 审核通过执行更新
export const executeAuditedOutboundUpdate = data => {
  return request({
    url: '/busin/outbound/executeAuditedUpdate',
    method: 'post',
    data,
  })
}

export const outbound = {
  list: getOutboundList,
  detail: getOutboundDetail,
  update: saveOrUpdateOutbound,
  delete: deleteOutbound,
}
