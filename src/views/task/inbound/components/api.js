import request from '@/utils/request'

// 入库任务列表
export const getInboundList = params => {
  return request({
    url: '/task/inbound/listPage',
    method: 'post',
    params,
  })
}

// 入库任务详情
export const getInboundDetail = params => {
  return request({
    url: '/task/inbound/getInfoById',
    method: 'post',
    params,
  })
}

// 入库任务新增/编辑
export const saveOrUpdateInbound = data => {
  return request({
    url: '/task/inbound/saveOrUpdate',
    method: 'post',
    data,
  })
}

// 入库任务删除
export const deleteInbound = params => {
  return request({
    url: '/task/inbound/delete',
    method: 'post',
    params,
  })
}

// 入库任务审核
export const auditInbound = data => {
  return request({
    url: '/task/inbound/audit',
    method: 'post',
    data,
  })
}

// 入库任务导入
export const importInbound = data => {
  return request({
    url: '/task/inbound/import',
    method: 'post',
    data,
  })
}

// 提交变更审核
export const submitChangeAudit = data => {
  return request({
    url: '/task/inbound/submitChangeAudit',
    method: 'post',
    data,
  })
}

// 生成任务编号
export const generateTaskNo = params => {
  return request({
    url: '/task/generateNo',
    method: 'post',
    params,
  })
}

// 调拨依据列表
export const getAllocationList = params => {
  return request({
    url: '/allocation/listPage',
    method: 'post',
    params,
  })
}

export const inbound = {
  list: getInboundList,
  detail: getInboundDetail,
  update: saveOrUpdateInbound,
  delete: deleteInbound,
}
