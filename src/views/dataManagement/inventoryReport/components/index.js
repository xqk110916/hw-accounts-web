import { listStockSummary, listStockDetail, getStockStatistics, exportStockSummary, exportStockDetail } from './api.js'
import { listAllMaterialCode } from '@/views/dataManagement/materialManagement/components/api.js'
import { getLocationHierarchy } from '@/views/task/inbound/components/api.js'

export const configSummary = {
  table: [
    { label: '库房', prop: 'warehouseName', minWidth: 120 },
    { label: '材料代码', prop: 'goodsCode', minWidth: 120 },
    { label: '批号', prop: 'taskNum', minWidth: 120 },
    { label: '生产单位', prop: 'productionUnit', minWidth: 120 },
    { label: '入库时间', prop: 'inboundTime', minWidth: 140 },
    { label: '数量', prop: 'containerCount', minWidth: 80 },
    { label: '毛重', prop: 'totalGrossWeight', minWidth: 100 },
    { label: '皮重', prop: 'totalTareWeight', minWidth: 100 },
    { label: '净重', prop: 'totalNetWeight', minWidth: 100 },
  ],
}

export const configDetail = {
  table: [
    { label: '库房', prop: 'warehouseName', minWidth: 120 },
    { label: '容器号', prop: 'containerCode', minWidth: 120 },
    { label: '材料代码', prop: 'goodsCode', minWidth: 120 },
    { label: '批号', prop: 'taskNum', minWidth: 120 },
    { label: '生产单位', prop: 'productionUnit', minWidth: 120 },
    { label: '入库时间', prop: 'inboundTime', minWidth: 140 },
    { label: '位置', prop: 'locationDisplay', minWidth: 140 },
    { label: '封记编码', prop: 'sealCode1', minWidth: 120 },
    { label: '毛重', prop: 'grossWeight', minWidth: 100 },
    { label: '皮重', prop: 'tareWeight', minWidth: 100 },
    { label: '净重', prop: 'netWeight', minWidth: 100 },
  ],
}

export const searchConfig = [
  { label: '库房', prop: 'warehouseNames', type: 'select', col: 6, multiple: true, option: [] },
  { label: '材料代码', prop: 'materialType', type: 'select', col: 6, option: [] },
  { label: '生产单位', prop: 'productionUnit', type: 'text', col: 6 },
  { label: '入库时间', prop: 'inboundTimeRange', type: 'daterange', col: 7 },
]

export const requestFun = {
  summaryList: listStockSummary,
  detailList: listStockDetail,
  summaryStatistics: getStockStatistics,
  summaryExport: exportStockSummary,
  detailExport: exportStockDetail,
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
    if (opt.prop === 'warehouseNames') vm.$set(opt, 'option', warehouseOptions)
    if (opt.prop === 'materialType') vm.$set(opt, 'option', materialOptions)
  })
}

export const buildQueryParams = (params) => {
  const data = { currentPage: params.currentPage, pageSize: params.pageSize }
  if (params.warehouseNames && params.warehouseNames.length) data.warehouseNames = params.warehouseNames
  if (params.materialType) data.materialType = params.materialType
  if (params.productionUnit) data.productionUnit = params.productionUnit
  if (params.inboundTimeRange && params.inboundTimeRange.length === 2) {
    data.inboundStartTime = params.inboundTimeRange[0]
    data.inboundEndTime = params.inboundTimeRange[1]
  }
  return data
}

export const handleTbaleMap = (data) => data

export const formatLocationDisplay = row => {
  const location = row.location || row.position || ''
  if (!location) return ''
  const warehouseCode = row.warehouseCode || row.warehouseName || ''
  return warehouseCode ? `${warehouseCode} - ${location}` : location
}
