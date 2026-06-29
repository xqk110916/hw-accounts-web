import { listLedger, listLedgerSummary, listLedgerDetail, exportLedger, exportLedgerSummary, exportLedgerDetail } from './api.js'
import { listAllMaterialCode } from '@/views/dataManagement/materialManagement/components/api.js'
import { getLocationHierarchy } from '@/views/task/inbound/components/api.js'

// Tab 1: 总账
export const tab1Config = {
  search: [
    { label: '年份', prop: 'year', type: 'year', col: 6 },
    { label: '材料代码', prop: 'goodsCodes', type: 'select', col: 6, multiple: true, option: [] },
    { label: '库房', prop: 'warehouseName', type: 'select', col: 6, option: [] },
  ],
  table: [
    { label: '材料代码', prop: 'goodsCode', minWidth: 120 },
    { label: '生产单位', prop: 'productionUnit', minWidth: 120 },
    { label: '库房', prop: 'warehouseName', minWidth: 120 },
    { label: '件数', prop: 'count', minWidth: 80 },
    { label: '毛重', prop: 'totalGrossWeight', minWidth: 100 },
    { label: '皮重', prop: 'totalTareWeight', minWidth: 100 },
    { label: '净重', prop: 'totalNetWeight', minWidth: 100 },
  ],
  requestFn: listLedger,
  exportFn: exportLedger,
}

// Tab 2-5: 明细账（共用表格结构）
export const detailTableColumns = [
  { label: '任务编号', prop: 'taskNum', minWidth: 140 },
  { label: '容器号', prop: 'containerCode', minWidth: 120 },
  { label: '材料代码', prop: 'goodsCode', minWidth: 120 },
  { label: '生产单位', prop: 'productionUnit', minWidth: 120 },
  { label: '出入库时间', prop: 'changeTime', minWidth: 140 },
  { label: '位置', prop: 'location', minWidth: 120 },
  { label: '封记编码1', prop: 'sealCode1', minWidth: 120 },
  { label: '封记编码2', prop: 'sealCode2', minWidth: 120 },
  { label: '毛重', prop: 'grossWeight', minWidth: 100 },
  { label: '皮重', prop: 'tareWeight', minWidth: 100 },
  { label: '净重', prop: 'netWeight', minWidth: 100 },
]

// Tab 2: 总账明细
export const tab2Config = {
  search: [
    { label: '时间区间', prop: 'timeRange', type: 'daterange', col: 7 },
    { label: '材料代码', prop: 'goodsCodes', type: 'select', col: 6, multiple: true, option: [] },
    { label: '库房', prop: 'warehouseName', type: 'select', col: 6, option: [] },
  ],
  titleTemplate: (params) => `总账明细`,
}

// Tab 3: 库房账明细
export const tab3Config = {
  search: [
    { label: '时间区间', prop: 'timeRange', type: 'daterange', col: 7 },
    { label: '材料代码', prop: 'goodsCodes', type: 'select', col: 6, multiple: true, option: [] },
    { label: '库房', prop: 'warehouseName', type: 'select', col: 6, option: [] },
  ],
  titleTemplate: (params) => {
    const opt = [].concat(params.warehouseOptions || [])
    const selected = opt.find(o => o.value === params.warehouseName)
    return selected ? `${selected.label}库房总账` : '库房账明细'
  },
}

// Tab 4: 生产单位明细账
export const tab4Config = {
  search: [
    { label: '时间区间', prop: 'timeRange', type: 'daterange', col: 7 },
    { label: '材料代码', prop: 'goodsCodes', type: 'select', col: 6, multiple: true, option: [] },
    { label: '生产单位', prop: 'productionUnit', type: 'text', col: 6 },
  ],
  titleTemplate: (params) => params.productionUnit ? `${params.productionUnit}生产单位总账` : '生产单位明细账',
}

// Tab 5: 材料账明细
export const tab5Config = {
  search: [
    { label: '时间区间', prop: 'timeRange', type: 'daterange', col: 7 },
    { label: '材料代码', prop: 'goodsCodes', type: 'select', col: 6, multiple: true, option: [] },
  ],
  titleTemplate: () => '材料账明细',
}

export const tabConfigs = {
  tab1: tab1Config,
  tab2: tab2Config,
  tab3: tab3Config,
  tab4: tab4Config,
  tab5: tab5Config,
}

export const requestFun = {
  ledgerList: listLedger,
  ledgerSummary: listLedgerSummary,
  ledgerDetail: listLedgerDetail,
  ledgerExport: exportLedger,
  summaryExport: exportLedgerSummary,
  detailExport: exportLedgerDetail,
}

export const getDefaultOptions = async (vm) => {
  const [materialRes, warehouseRes] = await Promise.all([
    listAllMaterialCode().catch(() => ({ data: [] })),
    getLocationHierarchy(2).catch(() => ({ data: [] })),
  ])

  const materialOptions = (materialRes.data || []).map(item => ({
    label: `${item.goodCode} - ${item.goodName}`,
    value: item.goodCode,
  }))

  const warehouseData = warehouseRes.data || []
  const warehouseOptions = warehouseData.map(item => ({
    label: item.warehouseName,
    value: item.warehouseName,
  }))

  vm.search.options.forEach(opt => {
    if (opt.prop === 'goodsCodes') vm.$set(opt, 'option', materialOptions)
    if (opt.prop === 'warehouseName') vm.$set(opt, 'option', warehouseOptions)
  })

  vm.warehouseOptions = warehouseOptions
}

export const buildQueryParams = (params) => {
  const data = { currentPage: params.currentPage, pageSize: params.pageSize }
  if (params.year) data.year = params.year
  if (params.goodsCodes && params.goodsCodes.length) data.goodsCodes = params.goodsCodes
  if (params.warehouseName) data.warehouseName = params.warehouseName
  if (params.productionUnit) data.productionUnit = params.productionUnit
  if (params.timeRange && params.timeRange.length === 2) {
    data.startTime = params.timeRange[0]
    data.endTime = params.timeRange[1]
  }
  return data
}
