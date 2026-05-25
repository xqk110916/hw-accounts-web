import request from '@/utils/request'

export const listChangeSummary = data => {
  return request({ url: '/busin/statist/change/summary', method: 'post', data })
}

export const listChangeDetail = data => {
  return request({ url: '/busin/statist/change/detail', method: 'post', data })
}

export const getChangeStatistics = data => {
  return request({ url: '/busin/statist/change/summary/statistics', method: 'post', data })
}

export const exportChangeSummary = data => {
  return request({ url: '/busin/statist/change/summary/export', method: 'post', data, responseType: 'blob' })
}

export const exportChangeDetail = data => {
  return request({ url: '/busin/statist/change/detail/export', method: 'post', data, responseType: 'blob' })
}

export const getChangeSummaryDetail = (goodsCode, data) => {
  return request({ url: `/busin/statist/change/summary/detail/${goodsCode}`, method: 'post', data })
}
