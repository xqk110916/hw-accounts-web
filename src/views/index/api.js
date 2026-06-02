import request from '@/utils/request'

export const getAuditTaskList = data => {
  return request({
    url: '/busin/form/audit/task/list',
    method: 'post',
    data,
  })
}
