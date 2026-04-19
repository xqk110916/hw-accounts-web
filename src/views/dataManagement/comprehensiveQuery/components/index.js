import { listComprehensiveQuery } from './api.js'

export const config = {
  table: [
    { label: '位置', prop: 'location' },
    { label: '容器', prop: 'containerId' },
    { label: '入库信息', prop: 'inInfo', type: 'slot' },
    { label: '出库信息', prop: 'outInfo', type: 'slot' },
    { label: '材料名称', prop: 'materialName' },
    { label: '封记信息', prop: 'sealInfo' },
    { label: '调拨依据', prop: 'allocateBase' },
  ],
  search: [
    { label: '容器号', prop: 'containerId', type: 'text', col: 6 },
    { label: '生产单位', prop: 'producer', type: 'text', col: 6 },
    { label: '收方单位', prop: 'receiver', type: 'text', col: 6 },
    { label: '材料代码', prop: 'materialCode', type: 'select', col: 6, option: [{label: '1', value: '1'}] },
    { label: '入库时间', prop: 'inboundTime', type: 'daterange', col: 6 },
    { label: '出库时间', prop: 'outboundTime', type: 'daterange', col: 6 },
    { label: '位置', prop: 'location', type: 'select', col: 6, option: [] },
    { label: '调拨依据', prop: 'allocateBase', type: 'select', col: 6, option: [{label: '1', value: '1'}] },
    { label: '封记号', prop: 'sealNo', type: 'text', col: 6 },
    { 
      label: '类型', 
      prop: 'type', 
      type: 'radioGroup', 
      col: 8,
      option: [
        { label: '全部', value: 'all' },
        { label: '已出库', value: 'out' },
        { label: '库存', value: 'stock' }
      ]
    },
  ],
  detail: [],
}

export const btns = {
  operation: [
    { label: '导出', type: 'default', execute: 'export' },
    { label: '列头管理', type: 'default', execute: 'columnManage' },
  ],
  table: [
    { label: '详情', type: 'text', execute: 'view' }
  ]
}

export const requestFun = {
  list: listComprehensiveQuery
}

export const getDefaultOptions = async () => {}
export const beforeSubmit = async (data) => { return data }
export const beforeRecurrence = (data) => { return data }
export const handleTbaleMap = (data) => { return data }
