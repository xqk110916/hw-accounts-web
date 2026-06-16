import {
  addSealRecord,
  batchDeleteSealRecord,
  deleteSealRecord,
  getInboundGoodsPageList,
  getSealRecordDetail,
  importSealRecord,
  listSealRecord,
  updateSealRecord,
} from './api.js'

export const statusOptions = [
  { label: '完好', value: 0 },
  { label: '破损', value: 1 },
]

export const config = {
  table: [
    { label: '容器', prop: 'containerDisplay', minWidth: 180 },
    { label: '封记1', prop: 'seal1Display', type: 'slot', minWidth: 160 },
    { label: '封记2', prop: 'seal2Display', type: 'slot', minWidth: 160 },
    { label: '登记时间', prop: 'registerTime', minWidth: 160 },
    { label: '状态', prop: 'sealStatus', type: 'slot', width: 100 },
  ],
  search: [
    { label: '封记编码', prop: 'sealCode', type: 'text', col: 4 },
    { label: '封记类型', prop: 'sealType', type: 'select', col: 4, option: [] },
    { label: '封记状态', prop: 'sealStatus', type: 'select', col: 4, option: statusOptions },
    { label: '登记时间', prop: 'registerTimeRange', type: 'daterange', col: 7 },
    { label: '容器', prop: 'containerCode', type: 'select', col: 4, option: [] },
  ],
}

export const btns = {
  operation: [
    { label: '新增', type: 'primary', execute: 'add' },
    { label: '导入', type: 'default', execute: 'import' },
    { label: '删除', type: 'default', execute: 'batchDelete' },
  ],
  table: [
    { label: '详情', type: 'text', execute: 'view' },
    { label: '编辑', type: 'text', execute: 'update' },
    { label: '删除', type: 'text', execute: 'delete' },
  ],
}

export const requestFun = {
  add: addSealRecord,
  batchDelete: batchDeleteSealRecord,
  delete: deleteSealRecord,
  detail: getSealRecordDetail,
  import: importSealRecord,
  list: listSealRecord,
  update: updateSealRecord,
}

export const loadContainerOptions = async () => {
  const res = await getInboundGoodsPageList({ currentPage: 1, pageSize: 999 })
  const list = (res && res.data && res.data.list) || []
  const map = {}
  list.forEach(item => {
    if (!item || !item.containerCode || map[item.containerCode]) return
    map[item.containerCode] = {
      label: item.containerCode,
      value: item.containerCode,
    }
  })
  return Object.values(map)
}

export const handleSearchParams = params => {
  const data = {
    currentPage: params.currentPage,
    pageSize: params.pageSize,
  }
    ;['containerCode', 'sealCode', 'sealType', 'sealStatus'].forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') data[key] = params[key]
    })
  if (params.registerTimeRange && params.registerTimeRange.length === 2) {
    data.starTime = `${params.registerTimeRange[0]} 00:00:00`
    data.endTime = `${params.registerTimeRange[1]} 23:59:59`
  }
  return data
}

export const buildSealDisplay = (code, typeName) => {
  if (!code && !typeName) return '-'
  if (!typeName || typeName === '-') return code || '-'
  return `${code || '-'}【${typeName}】`
}

export const normalizeSealRecord = (row, formatSealType) => {
  const sealTypeName1 = formatSealType(row.sealType1)
  const sealTypeName2 = formatSealType(row.sealType2)
  return {
    ...row,
    containerDisplay: row.containerDisplay || [row.containerCode, row.containerName, row.containerLocation].filter(Boolean).join(' | '),
    seal1Display: buildSealDisplay(row.sealCode1, sealTypeName1),
    seal2Display: buildSealDisplay(row.sealCode2, sealTypeName2),
    sealStatusName: row.sealStatusName || (Number(row.sealStatus) === 0 ? '完好' : Number(row.sealStatus) === 1 ? '破损' : '-'),
  }
}
