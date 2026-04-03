import request from '@/utils/request';

export const getFun = params => {
  return request({
    url: '/xxx',
    method: 'post',
    params
  })
}

// 算法盒子
export const getBoxList = params => {
  return request({
    url: '/busin/box/listPage',
    method: 'post',
    params
  })
}
export const getBoxDetailById = params => {
  return request({
    url: '/busin/box/getInfoById',
    method: 'post',
    params
  })
}
export const updateBox = data => {
  return request({
    url: '/busin/box/saveOrUpdate',
    method: 'post',
    data
  })
}
export const deleteBox = params => {
  return request({
    url: '/busin/box/delete',
    method: 'post',
    params
  })
}

export const box = {
  list: getBoxList,
  detail: getBoxDetailById,
  update: updateBox,
  delete: deleteBox
}