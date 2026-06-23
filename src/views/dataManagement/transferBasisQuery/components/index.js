import { listTransferBasisQuery } from './api.js'
import { listAllMaterialCode } from '@/views/dataManagement/materialManagement/components/api.js'
import { getAllTransferBasisList } from '@/views/task/inbound/components/api.js'

// 列表列配置：数量/重量列可点击，查看容器明细
// prop 为界面展示字段，由 handleTbaleMap 从后端 TransferStatisticsVO 映射而来
export const allTableColumns = [
  { label: '调拨依据', prop: 'transferBasis', minWidth: 160 },
  { label: '年份', prop: 'year', minWidth: 100 },
  { label: '材料', prop: 'goodName', minWidth: 140 },
  { label: '数量', prop: 'quantity', minWidth: 100, clickable: true },
  { label: '重量', prop: 'weight', minWidth: 120, clickable: true },
]

// 搜索项配置：调拨依据(调出) / 日期区间 / 材料(多选)
export const config = {
  table: allTableColumns,
  search: [
    { label: '调拨依据', prop: 'outTransferId', type: 'select', col: 6, option: [] },
    { label: '日期', prop: 'dateRange', type: 'daterange', col: 8 },
    { label: '材料', prop: 'goodCodes', type: 'select', col: 6, multiple: true, option: [] },
  ],
}

export const btns = {
  operation: [],
  table: [],
}

export const requestFun = {
  list: listTransferBasisQuery,
}

// 初始化下拉选项：调拨依据(调出) + 材料，并建立 goodCode -> goodName 映射供列表/明细使用
export const getDefaultOptions = async vm => {
  const [transferRes, materialRes] = await Promise.all([
    // 调拨依据查询为「调出」维度，type=1 仅查询调出类型调拨依据
    getAllTransferBasisList({ type: '1' }).catch(() => ({ data: [] })),
    listAllMaterialCode().catch(() => ({ data: [] })),
  ])

  const transferData = Array.isArray(transferRes.data)
    ? transferRes.data
    : (transferRes.data && transferRes.data.list) || []
  const transferOptions = transferData.map(item => ({
    label: item.documentNo || item.name || item.id,
    value: item.id,
  }))

  const materialList = materialRes.data || []
  const materialOptions = materialList.map(item => ({
    label: `${item.goodCode} - ${item.goodName}`,
    value: item.goodCode,
  }))
  // 后端统计/明细仅返回 goodCode，建立 goodCode -> goodName 映射兜底展示
  const goodCodeNameMap = {}
  materialList.forEach(item => {
    goodCodeNameMap[item.goodCode] = item.goodName
  })
  vm.goodCodeNameMap = goodCodeNameMap

  vm.search.options.forEach(opt => {
    if (opt.prop === 'outTransferId') vm.$set(opt, 'option', transferOptions)
    if (opt.prop === 'goodCodes') vm.$set(opt, 'option', materialOptions)
  })
}

// 组装查询参数：对齐后端 TransferStatisticsQueryDTO
export const buildQueryParams = params => {
  const data = { currentPage: params.currentPage, pageSize: params.pageSize }
  if (params.outTransferId) data.transferId = params.outTransferId
  if (params.goodCodes && params.goodCodes.length) data.goodCodes = params.goodCodes
  if (params.dateRange && params.dateRange.length === 2) {
    data.startTime = params.dateRange[0]
    data.endTime = params.dateRange[1]
  }
  return data
}

// 后端 TransferStatisticsVO -> 界面展示字段映射
// 数量取 count（容器数量），重量取 grossWeight（毛重）作为统计口径
export const handleTbaleMap = (data, vm) => {
  const goodCodeNameMap = (vm && vm.goodCodeNameMap) || {}
  return (data || []).map(item => ({
    // 保留后端主键，供容器明细下钻使用
    transferId: item.transferId,
    goodCode: item.goodCode,
    // 界面展示字段
    transferBasis: item.documentNo,
    year: item.outYear,
    goodName: item.goodName || goodCodeNameMap[item.goodCode] || item.goodCode,
    quantity: item.count,
    weight: item.grossWeight,
  }))
}
