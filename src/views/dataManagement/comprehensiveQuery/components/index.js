import { listSummaryQuery } from './api.js'
import { listAllMaterialCode } from '@/views/dataManagement/materialManagement/components/api.js'
import { getLocationHierarchy } from '@/views/task/inbound/components/api.js'
import { getAllTransferBasisList } from '@/views/task/inbound/components/api.js'

export const allTableColumns = [
  { label: '容器号', prop: 'containerCode', minWidth: 120 },
  { label: '材料名称', prop: 'goodName', minWidth: 120 },
  { label: '入库信息', prop: 'inboundInfo', minWidth: 200, type: 'slot' },
  { label: '出库信息', prop: 'outboundInfo', minWidth: 200, type: 'slot' },
  { label: '位置', prop: 'location', minWidth: 120 },
  { label: '封记类型1', prop: 'sealType1', minWidth: 100 },
  { label: '封记编码1', prop: 'sealCode1', minWidth: 120 },
  { label: '封记类型2', prop: 'sealType2', minWidth: 100 },
  { label: '封记编码2', prop: 'sealCode2', minWidth: 120 },
  { label: '状态', prop: 'statusName', minWidth: 80 },
  { label: '调拨依据', prop: 'transferBasis', minWidth: 120 },
  { label: '库房', prop: 'warehouseName', minWidth: 120 },
]

export const config = {
  table: allTableColumns,
  search: [
    { label: '容器号', prop: 'containerCode', type: 'text', col: 6 },
    { label: '生产单位', prop: 'productionUnit', type: 'text', col: 6 },
    { label: '收方单位', prop: 'receiveUnit', type: 'text', col: 6 },
    { label: '材料代码', prop: 'goodCode', type: 'select', col: 6, option: [] },
    { label: '库房', prop: 'warehouseId', type: 'select', col: 6, option: [] },
    { label: '调拨依据', prop: 'transferId', type: 'select', col: 6, option: [] },
    {
      label: '类型',
      prop: 'type',
      type: 'select',
      col: 6,
      option: [
        { label: '已出库', value: 1 },
        { label: '库存', value: 2 },
      ],
    },
    { label: '封记号', prop: 'sealCode', type: 'text', col: 6 },
    { label: '入库时间', prop: 'inboundTimeRange', type: 'daterange', col: 8 },
    { label: '出库时间', prop: 'outboundTimeRange', type: 'daterange', col: 8 },
  ],
}

export const btns = {
  operation: [
    { label: '导出', type: 'default', execute: 'export' },
    { label: '列头管理', type: 'default', execute: 'columnManage' },
  ],
  table: [
    { label: '详情', type: 'text', execute: 'view' },
  ],
}

export const requestFun = {
  list: listSummaryQuery,
}

export const getDefaultOptions = async (vm) => {
  const [materialRes, warehouseRes, transferRes] = await Promise.all([
    listAllMaterialCode().catch(() => ({ data: [] })),
    getLocationHierarchy(2).catch(() => ({ data: [] })),
    getAllTransferBasisList().catch(() => ({ data: [] })),
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

  const transferData = Array.isArray(transferRes.data) ? transferRes.data : ((transferRes.data && transferRes.data.list) || [])
  const transferOptions = transferData.map(item => ({
    label: item.documentNo || item.name || item.id,
    value: item.id,
  }))

  vm.search.options.forEach(opt => {
    if (opt.prop === 'goodCode') vm.$set(opt, 'option', materialOptions)
    if (opt.prop === 'warehouseId') vm.$set(opt, 'option', warehouseOptions)
    if (opt.prop === 'transferId') vm.$set(opt, 'option', transferOptions)
  })
}

export const buildQueryParams = (params) => {
  const data = { currentPage: params.currentPage, pageSize: params.pageSize }
  if (params.containerCode) data.containerCode = params.containerCode
  if (params.productionUnit) data.productionUnit = params.productionUnit
  if (params.receiveUnit) data.receiveUnit = params.receiveUnit
  if (params.goodCode) data.goodCode = params.goodCode
  if (params.warehouseId) data.warehouseId = params.warehouseId
  if (params.sealCode) data.sealCode = params.sealCode
  if (params.transferId) data.transferId = params.transferId
  if (params.type) data.type = params.type
  if (params.inboundTimeRange && params.inboundTimeRange.length === 2) {
    data.inboundStartTime = params.inboundTimeRange[0]
    data.inboundEndTime = params.inboundTimeRange[1]
  }
  if (params.outboundTimeRange && params.outboundTimeRange.length === 2) {
    data.outboundStartTime = params.outboundTimeRange[0]
    data.outboundEndTime = params.outboundTimeRange[1]
  }
  return data
}

export const handleTbaleMap = (data) => data
