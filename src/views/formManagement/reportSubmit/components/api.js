import request from '@/utils/request'

// R01
export const listR01Data = data => request({ url: '/busin/report/r01/list', method: 'post', data })
export const exportR01 = data => request({ url: '/busin/report/r01/export', method: 'post', data, responseType: 'blob' })
export const saveR01 = data => request({ url: '/busin/report/r01/save', method: 'post', data })

// R03
export const listR03Data = data => request({ url: '/busin/report/r03/list', method: 'post', data })
export const exportR03 = data => request({ url: '/busin/report/r03/export', method: 'post', data, responseType: 'blob' })
export const saveR03 = data => request({ url: '/busin/report/r03/save', method: 'post', data })

// R04
export const listR04Data = data => request({ url: '/busin/report/r04/list', method: 'post', data })
export const exportR04 = data => request({ url: '/busin/report/r04/export', method: 'post', data, responseType: 'blob' })
export const saveR04 = data => request({ url: '/busin/report/r04/save', method: 'post', data })

// R05
export const listR05Data = data => request({ url: '/busin/report/r05/list', method: 'post', data })
export const exportR05 = data => request({ url: '/busin/report/r05/export', method: 'post', data, responseType: 'blob' })
export const saveR05 = data => request({ url: '/busin/report/r05/save', method: 'post', data })

// R06
export const listR06Data = data => request({ url: '/busin/report/r06/list', method: 'post', data })
export const exportR06 = data => request({ url: '/busin/report/r06/export', method: 'post', data, responseType: 'blob' })
export const saveR06 = data => request({ url: '/busin/report/r06/save', method: 'post', data })

// R08
export const listR08Data = data => request({ url: '/busin/report/r08/list', method: 'post', data })
export const exportR08 = data => request({ url: '/busin/report/r08/export', method: 'post', data, responseType: 'blob' })
export const saveR08 = data => request({ url: '/busin/report/r08/save', method: 'post', data })

// R09
export const listR09Data = data => request({ url: '/busin/report/r09/list', method: 'post', data })
export const exportR09 = data => request({ url: '/busin/report/r09/export', method: 'post', data, responseType: 'blob' })
export const saveR09 = data => request({ url: '/busin/report/r09/save', method: 'post', data })

// 通用：历史记录列表
export const listHistory = data => request({ url: '/busin/report/history/list', method: 'post', data })
// 通用：任务列表（R01 用）
export const listTaskForReport = data => request({ url: '/busin/report/task/list', method: 'post', data })
