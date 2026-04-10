import request from '@/utils/request'

export const getMoveList = params => {
  return request({
    url: '/task/move/listPage',
    method: 'post',
    params,
  })
}

export const getMoveDetail = params => {
  return request({
    url: '/task/move/getInfoById',
    method: 'post',
    params,
  })
}

export const saveOrUpdateMove = data => {
  return request({
    url: '/task/move/saveOrUpdate',
    method: 'post',
    data,
  })
}

export const deleteMove = params => {
  return request({
    url: '/task/move/delete',
    method: 'post',
    params,
  })
}

export const auditMove = data => {
  return request({
    url: '/task/move/audit',
    method: 'post',
    data,
  })
}

export const move = {
  list: getMoveList,
  detail: getMoveDetail,
  update: saveOrUpdateMove,
  delete: deleteMove,
}
