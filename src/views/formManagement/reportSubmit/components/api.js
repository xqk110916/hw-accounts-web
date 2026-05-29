import request from '@/utils/request'

const reportBase = '/busin/form/report'

const getReportList = code => params => {
  const listPath = code === 'r01' ? 'listAll' : 'list'
  return request({
    url: `${reportBase}/${code}/${listPath}`,
    method: 'get',
    params,
  })
}

const getReportDetail = code => id => request({
  url: `${reportBase}/${code}/detail/${id}`,
  method: 'get',
})

const exportReport = code => id => request({
  url: `${reportBase}/${code}/export/${id}`,
  method: 'get',
  responseType: 'blob',
})

const saveReport = code => data => request({
  url: `${reportBase}/${code}/save`,
  method: 'post',
  data,
})

const queryReport = code => data => request({
  url: `${reportBase}/${code}/query`,
  method: 'post',
  data,
})

export const listR01History = getReportList('r01')
export const getR01Detail = getReportDetail('r01')
export const exportR01 = exportReport('r01')
export const saveR01 = saveReport('r01')

export const queryR03Data = data => request({
  url: '/busin/form/quarter/list',
  method: 'post',
  data,
})
export const listR03History = getReportList('r03')
export const getR03Detail = getReportDetail('r03')
export const exportR03 = exportReport('r03')
export const saveR03 = saveReport('r03')

export const queryR04Data = queryReport('r04')
export const listR04History = getReportList('r04')
export const getR04Detail = getReportDetail('r04')
export const exportR04 = exportReport('r04')
export const saveR04 = saveReport('r04')

export const listR05History = getReportList('r05')
export const getR05Detail = getReportDetail('r05')
export const exportR05 = exportReport('r05')
export const saveR05 = saveReport('r05')
export const queryR05Data = queryReport('r05')

export const listR06History = getReportList('r06')
export const getR06Detail = getReportDetail('r06')
export const exportR06 = exportReport('r06')
export const saveR06 = saveReport('r06')
export const queryR06Data = queryReport('r06')

export const queryR08Data = queryReport('r08')
export const listR08History = getReportList('r08')
export const getR08Detail = getReportDetail('r08')
export const exportR08 = exportReport('r08')
export const saveR08 = saveReport('r08')

export const queryR09Data = queryReport('r09')
export const listR09History = getReportList('r09')
export const getR09Detail = getReportDetail('r09')
export const exportR09 = exportReport('r09')
export const saveR09 = saveReport('r09')

export const listTaskForReport = data => request({
  url: '/busin/form/task/list',
  method: 'post',
  data,
})

export const getTaskDetailForReport = data => request({
  url: '/busin/form/task/detail',
  method: 'post',
  data,
})
