import request from '@/utils/request'

// 1. 分页查询实物盘存列表
export const getInventoryPageList = data => {
  return request({
    url: '/busin/inventory/page/list',
    method: 'post',
    data,
  })
}

// 2. 获取货物清单（生成任务）
export const getGoodsList = data => {
  return request({
    url: '/busin/inventory/goods/list',
    method: 'post',
    data,
  })
}

// 3. 提交/暂存任务
export const submitInventory = data => {
  return request({
    url: '/busin/inventory/submit',
    method: 'post',
    data,
  })
}

// 4. 录入盘存结果
export const submitInventoryResult = data => {
  return request({
    url: '/busin/inventory/result/submit',
    method: 'post',
    data,
  })
}

// 5. 查询盘存任务详情
export const getInventoryDetail = id => {
  return request({
    url: `/busin/inventory/detail/${id}`,
    method: 'get',
  })
}

// 6. 编辑盘存任务
export const editInventory = data => {
  return request({
    url: '/busin/inventory/edit',
    method: 'post',
    data,
  })
}

// 7. 审核盘存任务
export const auditInventory = data => {
  return request({
    url: '/busin/inventory/audit',
    method: 'post',
    data,
  })
}

// 8. 删除盘存任务
export const deleteInventory = params => {
  return request({
    url: '/busin/inventory/delete',
    method: 'get',
    params,
  })
}

// 9. 导出盘存清单
export const exportInventory = params => {
  return request({
    url: '/busin/inventory/export',
    method: 'get',
    params,
    responseType: 'blob',
  })
}

// 10. 导出到PAD
export const exportToPad = params => {
  return request({
    url: '/busin/inventory/exportToPad',
    method: 'get',
    params,
  })
}

// 10.1 下载PAD盘存数据
export const exportToPadStream = params => {
  return request({
    url: '/busin/inventory/exportToPad/stream',
    method: 'get',
    params,
    responseType: 'blob',
  })
}

// 11. 标记异常
export const markError = data => {
  return request({
    url: '/busin/inventory/markError',
    method: 'post',
    data,
  })
}

export const inventory = {
  list: getInventoryPageList,
  detail: getInventoryDetail,
  submit: submitInventory,
  edit: editInventory,
  delete: deleteInventory,
  audit: auditInventory,
}
