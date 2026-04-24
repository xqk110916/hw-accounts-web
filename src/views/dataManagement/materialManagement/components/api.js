import request from '@/utils/request'

// 1. 新增材料代码
export const addMaterialCode = data => {
  return request({
    url: '/busin/material-code/add',
    method: 'post',
    data,
  })
}

// 2. 删除材料代码
export const deleteMaterialCode = id => {
  return request({
    url: `/busin/material-code/delete/${id}`,
    method: 'delete',
  })
}

// 3. 获取材料代码详情
export const getMaterialCodeDetail = id => {
  return request({
    url: `/busin/material-code/detail/${id}`,
    method: 'get',
  })
}

// 4. 分页查询材料代码
export const listMaterialCode = params => {
  return request({
    url: '/busin/material-code/list',
    method: 'get',
    params,
  })
}

// 5. 获取所有材料代码
export const listAllMaterialCode = () => {
  return request({
    url: '/busin/material-code/listAll',
    method: 'get',
  })
}

// 6. 更新材料代码
export const updateMaterialCode = data => {
  return request({
    url: '/busin/material-code/update',
    method: 'put',
    data,
  })
}

