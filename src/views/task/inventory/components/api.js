import request from '@/utils/request'

export const getInventoryList = params => {
  return request({
    url: '/task/inventory/listPage',
    method: 'post',
    params,
  })
}

export const getInventoryDetail = params => {
  return request({
    url: '/task/inventory/getInfoById',
    method: 'post',
    params,
  })
}

export const saveOrUpdateInventory = data => {
  return request({
    url: '/task/inventory/saveOrUpdate',
    method: 'post',
    data,
  })
}

export const deleteInventory = params => {
  return request({
    url: '/task/inventory/delete',
    method: 'post',
    params,
  })
}

export const auditInventory = data => {
  return request({
    url: '/task/inventory/audit',
    method: 'post',
    data,
  })
}

export const inventory = {
  list: getInventoryList,
  detail: getInventoryDetail,
  update: saveOrUpdateInventory,
  delete: deleteInventory,
}
