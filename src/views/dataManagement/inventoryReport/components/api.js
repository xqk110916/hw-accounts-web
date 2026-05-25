import request from '@/utils/request'

export const listStockSummary = data => {
  return request({ url: '/busin/statist/stock/summary', method: 'post', data })
}

export const listStockDetail = data => {
  return request({ url: '/busin/statist/stock/detail', method: 'post', data })
}

export const getStockStatistics = data => {
  return request({ url: '/busin/statist/stock/summary/statistics', method: 'post', data })
}

export const exportStockSummary = data => {
  return request({ url: '/busin/statist/stock/summary/export', method: 'post', data, responseType: 'blob' })
}

export const exportStockDetail = data => {
  return request({ url: '/busin/statist/stock/detail/export', method: 'post', data, responseType: 'blob' })
}

export const getStockSummaryDetail = (goodsCode, data) => {
  return request({ url: `/busin/statist/stock/summary/detail/${goodsCode}`, method: 'post', data })
}
