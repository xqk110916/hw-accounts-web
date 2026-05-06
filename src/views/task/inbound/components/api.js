import request from '@/utils/request'

// 1. 分页查询入库管理列表
export const getInboundList = data => {
  return request({
    url: '/busin/inbound/manage/pageList',
    method: 'post',
    data,
  })
}

// 2. 查询入库管理详情
export const getInboundDetail = id => {
  return request({
    url: `/busin/inbound/manage/detail/${id}`,
    method: 'get',
  })
}

// 3. 提交或保存数据 (新增)
export const submitInbound = data => {
  return request({
    url: '/busin/inbound/submit',
    method: 'post',
    data,
  })
}

// 4. 编辑入库数据 (更新)
export const updateInbound = data => {
  return request({
    url: '/busin/inbound/updateData',
    method: 'put',
    data,
  })
}

// 5. 确认数据
export const confirmInbound = params => {
  return request({
    url: '/busin/inbound/confirm',
    method: 'post',
    params,
  })
}

// 6. 下载导入模板
export const downloadTemplate = params => {
  return request({
    url: '/busin/inbound/downTemplate',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 7. 审核通过执行更新
export const executeAuditedUpdate = params => {
  return request({
    url: '/busin/inbound/executeAuditedUpdate',
    method: 'post',
    params,
  })
}

export const cancelInboundApply = params => {
  return request({
    url: '/busin/inbound/cancelApply',
    method: 'get',
    params,
  })
}

// 8. 导入 Excel 文件
export const importExcel = data => {
  return request({
    url: '/busin/excelImport/import',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 8. 根据节点类型查询节点列表（查询库房）
export const getLocationHierarchy = nodeType => {
  return request({
    url: `/busin/locationMap/hierarchy/listByNodeType/${nodeType}`,
    method: 'get',
  })
}

// 9. 查看位置图（根据库房查询位置）
export const getPositionMap = data => {
  return request({
    url: '/busin/locationMap/positionMap',
    method: 'post',
    data,
  })
}

// 查询所有材料编码（下拉选择用）
export const getMaterialCodeListAll = () => {
  return request({
    url: '/busin/material-code/listAll',
    method: 'get',
  })
}

// 10. 新增调拨依据
export const addTransferBasis = data => {
  return request({
    url: '/busin/transfer-basis/add',
    method: 'post',
    data,
  })
}

// 11. 删除调拨依据
export const deleteTransferBasis = params => {
  return request({
    url: '/busin/transfer-basis/delete',
    method: 'post',
    params,
  })
}

// 12. 查询调拨依据详情
export const getTransferBasisDetail = id => {
  return request({
    url: '/busin/transfer-basis/get',
    method: 'get',
    params: typeof id === 'object' ? id : { id },
  })
}

// 13. 分页查询调拨依据列表
export const getTransferBasisPageList = data => {
  return request({
    url: '/busin/transfer-basis/list',
    method: 'post',
    data,
  })
}

// 14. 查询所有调拨依据列表（下拉选择用）
export const getAllTransferBasisList = () => {
  return request({
    url: '/busin/transfer-basis/list-all',
    method: 'get',
  })
}

// 15. 修改调拨依据
export const updateTransferBasis = data => {
  return request({
    url: '/busin/transfer-basis/update',
    method: 'post',
    data,
  })
}
// 16. 新增文号
export const addDocNumber = data => {
  return request({
    url: '/busin/doc-number/add',
    method: 'post',
    data,
  })
}

// 17. 删除文号
export const deleteDocNumber = data => {
  return request({
    url: '/busin/doc-number/delete',
    method: 'post',
    data, // 参数 id
  })
}

// 18. 分页查询文号列表
export const getDocNumberPageList = params => {
  return request({
    url: '/busin/doc-number/list',
    method: 'get',
    params,
  })
}

// 19. 查询所有文号列表
export const getAllDocNumberList = () => {
  return request({
    url: '/busin/doc-number/list-all',
    method: 'get',
  })
}

// 20. 修改文号
export const updateDocNumber = data => {
  return request({
    url: '/busin/doc-number/update',
    method: 'post',
    data,
  })
}

export const inbound = {
  list: getInboundList,
  detail: getInboundDetail,
  submit: submitInbound,
  update: updateInbound,
  confirm: confirmInbound,
  downloadTemplate,
  executeAuditedUpdate,
  cancelInboundApply,
  getLocationHierarchy,
  getPositionMap,
  getMaterialCodeListAll,
  addTransferBasis,
  deleteTransferBasis,
  getTransferBasisDetail,
  getTransferBasisPageList,
  getAllTransferBasisList,
  updateTransferBasis,
  addDocNumber,
  deleteDocNumber,
  getDocNumberPageList,
  getAllDocNumberList,
  updateDocNumber
}
