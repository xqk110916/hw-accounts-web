import * as api from './api.js'
import { reportConfigs } from './reportConfigs.js'

export { reportCards, reportConfigs, templateConfigs } from './reportConfigs.js'

export const requestFun = {
  R01: { list: api.listR01Data, export: api.exportR01, save: api.saveR01 },
  R02: null,
  R03: { list: api.listR03Data, export: api.exportR03, save: api.saveR03 },
  R04: { list: api.listR04Data, export: api.exportR04, save: api.saveR04 },
  R05: { list: api.listR05Data, export: api.exportR05, save: api.saveR05 },
  R06: { list: api.listR06Data, export: api.exportR06, save: api.saveR06 },
  R07: null,
  R08: { list: api.listR08Data, export: api.exportR08, save: api.saveR08 },
  R09: { list: api.listR09Data, export: api.exportR09, save: api.saveR09 },
}

export const buildQueryParams = (code, params) => {
  const config = reportConfigs[code]
  if (!config) return params
  const data = { currentPage: params.currentPage || 1, pageSize: params.pageSize || 20 }
  config.search.forEach(item => {
    if (item.type === 'daterange' && params[item.prop] && params[item.prop].length === 2) {
      data.startTime = params[item.prop][0]
      data.endTime = params[item.prop][1]
    } else if (item.type === 'year' && params[item.prop]) {
      data.year = params[item.prop]
    } else if (item.multiple && params[item.prop] && params[item.prop].length) {
      data[item.prop] = params[item.prop]
    } else if (!item.multiple && params[item.prop] !== '' && params[item.prop] !== null && params[item.prop] !== undefined) {
      data[item.prop] = params[item.prop]
    }
  })
  return data
}
