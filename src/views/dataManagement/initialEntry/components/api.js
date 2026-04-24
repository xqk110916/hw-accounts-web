import request from '@/utils/request'

// 1. 列表查询
export const listInitialEntry = data => {
  return request({
    url: '/busin/initial/list',
    method: 'post',
    data,
  })
}

// 2. 详情查询
export const detailInitialEntry = id => {
  return request({
    url: '/busin/initial/detail',
    method: 'get',
    params: { id },
  })
}

// 3. 编辑初始录入
export const editInitialEntry = data => {
  return request({
    url: '/busin/initial/edit',
    method: 'post',
    data,
  })
}

// 4. 删除初始录入
export const deleteInitialEntry = id => {
  return request({
    url: '/busin/initial/delete',
    method: 'post',
    data: { id },
  })
}

// 5. 提交审核
export const submitInitialEntry = id => {
  return request({
    url: '/busin/initial/submit',
    method: 'post',
    data: { id },
  })
}

// 6. 审核
export const auditInitialEntry = data => {
  return request({
    url: '/busin/initial/audit',
    method: 'post',
    data, // { id, approved }
  })
}

// 7. 导入初始录入
export const importInitialEntry = (file, dataId) => {
  const formData = new FormData()
  formData.append('file', file)
  if (dataId) formData.append('dataId', dataId)
  return request({
    url: '/busin/initial/import',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// 8. 获取导入详情
export const getImportDetail = params => {
  return request({
    url: '/busin/initial/import-detail',
    method: 'get',
    params, // { currentPage, pageSize, id }
  })
}
