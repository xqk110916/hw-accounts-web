import { listChangeReport } from './api.js'

export const configDetail = {
  table: [
    { label: '类型', prop: 'type', type: 'slot' },
    { label: '材料代码', prop: 'materialCode' },
    { label: '材料名称', prop: 'materialName' },
    { label: '时间', prop: 'time' },
    { label: '变化量', prop: 'changeAmount', type: 'slot' },
    { label: '库位', prop: 'stockLocation' }
  ],
  search: [
    { label: '入库时间', prop: 'timeRange', type: 'daterange', col: 6 },
    { label: '账目类别', prop: 'accountType', type: 'select', col: 6, option: [{label: '类别A', value: 'a'}] },
    { label: '材料代码', prop: 'materialCode', type: 'select', col: 6, option: [] },
    { label: '存库位置', prop: 'stockLocation', type: 'select', col: 6, option: [] },
    { label: '仅看零库存', prop: 'zeroStock', type: 'select', col: 6, option: [{label: '是', value: 'yes'}, {label: '否', value: 'no'}] },
  ]
}

export const requestFun = {
  list: listChangeReport
}
export const getDefaultOptions = async () => {}
