import request from '@/utils/request'

export const listSummaryQuery = data => {
  return request({ url: '/busin/statist/summary/query', method: 'post', data })
}

export const exportSummaryQuery = data => {
  return request({ url: '/busin/statist/summary/export', method: 'post', data, responseType: 'blob' })
}
