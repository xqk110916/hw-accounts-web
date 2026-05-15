import request from '@/utils/request'

export const addSealRecord = data => {
  return request({
    url: '/busin/seal/record/add',
    method: 'post',
    data,
  })
}

export const batchDeleteSealRecord = idList => {
  return request({
    url: '/busin/seal/record/batchDelete',
    method: 'post',
    data: idList,
  })
}

export const deleteSealRecord = id => {
  return request({
    url: `/busin/seal/record/delete/${id}`,
    method: 'delete',
  })
}

export const getSealRecordDetail = id => {
  return request({
    url: `/busin/seal/record/detail/${id}`,
    method: 'get',
  })
}

export const importSealRecord = file => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/busin/seal/record/import',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const downloadSealTemplate = params => {
  return request({
    url: '/busin/inbound/downTemplate',
    method: 'get',
    params,
    responseType: 'blob',
  })
}

export const listSealRecord = data => {
  return request({
    url: '/busin/seal/record/list',
    method: 'post',
    data,
  })
}

export const listAllSealRecord = () => {
  return request({
    url: '/busin/seal/record/listAll',
    method: 'get',
  })
}

export const updateSealRecord = data => {
  return request({
    url: '/busin/seal/record/update',
    method: 'put',
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
