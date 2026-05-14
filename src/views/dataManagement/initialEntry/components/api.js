import request from '@/utils/request'

export const listInitialEntry = data => {
  return request({
    url: '/busin/initial/page/list',
    method: 'post',
    data,
  })
}

export const detailInitialEntry = data => {
  return request({
    url: '/busin/initial/detail',
    method: 'post',
    data,
  })
}

export const getImportDetail = params => {
  return request({
    url: '/busin/initial/import-detail',
    method: 'get',
    params,
  })
}

export const importInitialEntry = (file, dataId) => {
  const formData = new FormData()
  if (file) formData.append('file', file)
  if (dataId) formData.append('dataId', dataId)
  return request({
    url: '/busin/initial/import',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const submitInitialEntry = data => {
  return request({
    url: '/busin/initial/submit',
    method: 'post',
    data,
  })
}

export const editInitialEntry = data => {
  return request({
    url: '/busin/initial/edit',
    method: 'post',
    data,
  })
}

export const submitInitialEntryById = id => {
  return request({
    url: '/busin/initial/submitById',
    method: 'post',
    params: { id },
  })
}

export const auditInitialEntry = params => {
  return request({
    url: '/busin/initial/audit',
    method: 'post',
    params,
  })
}

export const deleteInitialEntry = id => {
  return request({
    url: '/busin/initial/delete',
    method: 'post',
    params: { id },
  })
}

// 下载导入模板
export const downloadInitialTemplate = params => {
  return request({
    url: '/busin/inbound/downTemplate',
    method: 'get',
    params,
    responseType: 'blob',
  })
}
