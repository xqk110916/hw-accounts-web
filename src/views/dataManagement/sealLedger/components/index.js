import { listSealLedger, batchDeleteSeal } from './api.js'

export const config = {
  table: [
    { label: '材料代码', prop: 'materialCode' },
    { label: '材料名称', prop: 'materialName' },
    { label: '状态', prop: 'status', type: 'slot' },
    { label: '数量', prop: 'amount' },
  ],
  search: [
    { label: '材料代码', prop: 'materialCode', type: 'text', col: 6 },
    { label: '材料名称', prop: 'materialName', type: 'text', col: 6 },
    { label: '状态', prop: 'status', type: 'select', col: 6, option: [{label: '完整', value: 'normal'}, {label: '破损', value: 'damaged'}] },
  ],
  detail: [],
}

export const btns = {
  operation: [
    { label: '批量删除', type: 'default', execute: 'batchDelete' },
    { label: '导出', type: 'default', execute: 'export' },
  ],
  table: [
    { label: '详情', type: 'text', execute: 'view' }
  ]
}

export const requestFun = {
  list: listSealLedger,
  batchDelete: batchDeleteSeal
}

export const getDefaultOptions = async () => {}
export const beforeSubmit = async (data) => { return data }
export const handleTbaleMap = (data) => { return data }
