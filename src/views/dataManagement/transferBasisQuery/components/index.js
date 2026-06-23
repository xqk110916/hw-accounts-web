import { listTransferBasisQuery } from './api.js'
import { listAllMaterialCode } from '@/views/dataManagement/materialManagement/components/api.js'
import { getAllTransferBasisList } from '@/views/task/inbound/components/api.js'

// 列表列配置：数量/重量列可点击，查看容器明细
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

// 初始化下拉选项：调拨依据(调出) + 材料
export const getDefaultOptions = async vm => {
  const [transferRes, materialRes] = await Promise.all([
    getAllTransferBasisList().catch(() => ({ data: [] })),
    listAllMaterialCode().catch(() => ({ data: [] })),
  ])

  const transferData = Array.isArray(transferRes.data)
    ? transferRes.data
    : (transferRes.data && transferRes.data.list) || []
  const transferOptions = transferData.map(item => ({
    label: item.documentNo || item.name || item.id,
    value: item.id,
  }))

  const materialOptions = (materialRes.data || []).map(item => ({
    label: `${item.goodCode} - ${item.goodName}`,
    value: item.goodCode,
  }))

  vm.search.options.forEach(opt => {
    if (opt.prop === 'outTransferId') vm.$set(opt, 'option', transferOptions)
    if (opt.prop === 'goodCodes') vm.$set(opt, 'option', materialOptions)
  })
}

// 组装查询参数
export const buildQueryParams = params => {
  const data = { currentPage: params.currentPage, pageSize: params.pageSize }
  if (params.outTransferId) data.outTransferId = params.outTransferId
  if (params.goodCodes && params.goodCodes.length) data.goodCodes = params.goodCodes
  if (params.dateRange && params.dateRange.length === 2) {
    data.startDate = params.dateRange[0]
    data.endDate = params.dateRange[1]
  }
  return data
}

export const handleTbaleMap = data => data
