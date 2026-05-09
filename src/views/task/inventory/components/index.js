import { inventory } from './api.js'
import { getLocationHierarchy } from '@/views/task/outbound/components/api.js'

export const statusOptions = [
  { label: '待提交', value: 4 },
  { label: '待审核', value: 0 },
  { label: '审核通过', value: 1 },
  { label: '审核拒绝', value: 2 },
]

export const selectTypeOptions = [
  { label: '全部库房', value: 'all' },
  { label: '指定库房', value: 'selected' },
]

export const resultOptions = [
  { label: '正常', value: '0' },
  { label: '盘亏', value: '1' },
  { label: '盘盈', value: '2' },
]

export const config = {
  table: [
    { label: '任务编号', prop: 'taskNum', isTitle: true },
    { label: '盘存时间', prop: 'inventoryTime' },
    { label: '库房数量', prop: 'warehouseCount' },
    { label: '库房名称', prop: 'warehouseNames' },
    { label: '状态', prop: 'status', type: 'slot' },
    { label: '创建时间', prop: 'createTime' },
  ],
  search: [
    { label: '任务编号', prop: 'taskNum', type: 'text', col: 5 },
    { label: '库房名称', prop: 'warehouseName', type: 'text', col: 5 },
    { label: '盘存时间', prop: 'inventoryTime', type: 'daterange', col: 5 },
  ],
  detail: [
    {
      label: '任务编号',
      prop: 'taskNum',
      type: 'text',
      disabled: true,
      required: true,
    },
    {
      label: '盘存方式',
      prop: 'selectType',
      type: 'select',
      option: selectTypeOptions,
      required: true,
      defaultValue: 'all',
    },
    {
      label: '备注',
      prop: 'remark',
      type: 'textarea',
      required: false,
    },
  ],
}

export const btns = {
  operation: [
    { label: '添加任务', type: 'primary', execute: 'add' },
  ],
  table: [],
}

export const requestFun = inventory

export const getDefaultOptions = async () => {}

export const beforeSubmit = async data => {
  return data
}

export const beforeRecurrence = (data, that) => {
  return data
}

export const handleSearchParams = params => {
  const p = { ...params }
  if (p.inventoryTime && p.inventoryTime.length === 2) {
    p.startTime = p.inventoryTime[0]
    p.endTime = p.inventoryTime[1]
  }
  delete p.inventoryTime
  return p
}

export const handleTbaleMap = data => {
  return data
}
