import request from '@/utils/request'

// 标签数据管理
export const addLabelData = data => {
  return request({
    url: '/busin/label/data/add',
    method: 'post',
    data,
  })
}

export const deleteLabelData = id => {
  return request({
    url: `/busin/label/data/delete/${id}`,
    method: 'delete',
  })
}

export const getLabelDataDetail = id => {
  return request({
    url: `/busin/label/data/detail/${id}`,
    method: 'get',
  })
}

export const exportLabelDataTemplate = params => {
  return request({
    url: '/busin/label/data/exportTemplate',
    method: 'get',
    params,
    responseType: 'blob',
  })
}

export const importLabelData = (file, templateId, remark) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('templateId', templateId)
  if (remark) formData.append('remark', remark)
  return request({
    url: '/busin/label/data/import',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const listLabelData = params => {
  return request({
    url: '/busin/label/data/list',
    method: 'get',
    params,
  })
}

export const refreshLabelQrcode = id => {
  return request({
    url: `/busin/label/data/refreshQrcode/${id}`,
    method: 'post',
  })
}

export const updateLabelData = data => {
  return request({
    url: '/busin/label/data/update',
    method: 'put',
    data,
  })
}

// 标签模板管理
export const addTemplate = data => {
  return request({
    url: '/busin/label/template/add',
    method: 'post',
    data,
  })
}

export const deleteTemplate = id => {
  return request({
    url: `/busin/label/template/delete/${id}`,
    method: 'delete',
  })
}

export const getTemplateDetail = id => {
  return request({
    url: `/busin/label/template/detail/${id}`,
    method: 'get',
  })
}

export const listTemplate = params => {
  return request({
    url: '/busin/label/template/list',
    method: 'get',
    params,
  })
}

export const listAllTemplate = () => {
  return request({
    url: '/busin/label/template/listAll',
    method: 'get',
  })
}

export const updateTemplate = data => {
  return request({
    url: '/busin/label/template/update',
    method: 'put',
    data,
  })
}
