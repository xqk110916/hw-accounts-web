import { listInventoryReport } from './api.js'

export const config = {
  table: [
    { label: '明细', prop: 'detail' },
    { label: '材料代码', prop: 'materialCode' },
    { label: '材料名称', prop: 'materialName' },
    { label: '存量', prop: 'stock', type: 'slot' },
    { label: '单位', prop: 'unit' },
    { label: '总重', prop: 'totalWeight', type: 'slot' },
  ],
  search: [
    { label: '账目类别', prop: 'accountType', type: 'select', col: 6, option: [{label: '类别A', value: '1'}] },
    { label: '存库位置', prop: 'stockLocation', type: 'select', col: 6, option: [{label: '位置A', value: '1'}] },
    { label: '是否显示零库存', prop: 'showZero', type: 'select', col: 6, option: [{label: '是', value: 'yes'}, {label: '否', value: 'no'}] },
  ],
  detail: [],
}

export const btns = {
  operation: [
    { label: '导出', type: 'default', execute: 'export' },
  ],
  table: []
}

export const requestFun = {
  list: listInventoryReport
}

export const getDefaultOptions = async () => {}
export const beforeSubmit = async (data) => { return data }
export const handleTbaleMap = (data) => { return data }
