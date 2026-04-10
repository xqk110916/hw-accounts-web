export const statusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '审核中', value: 'auditing' },
  { label: '审核通过', value: 'approved' },
  { label: '审核拒绝', value: 'rejected' },
]

export const config = {
  table: [
    { label: '任务编号', prop: 'taskNo', isTitle: true },
    { label: '状态', prop: 'status', type: 'slot' },
    { label: '原库房', prop: 'sourceWarehouse' },
    { label: '原位置', prop: 'sourcePosition' },
    { label: '目标库房', prop: 'targetWarehouse' },
    { label: '目标位置', prop: 'targetPosition' },
    { label: '操作时间', prop: 'operateTime' },
  ],
  search: [
    { label: '任务编号', prop: 'taskNo', type: 'text', col: 5 },
    {
      label: '状态',
      prop: 'status',
      type: 'select',
      col: 5,
      option: statusOptions,
    },
    { label: '库房', prop: 'warehouse', type: 'text', col: 5 },
  ],
  detail: [
    {
      label: '任务编号',
      prop: 'taskNo',
      type: 'text',
      isAdd: false,
      isUpdate: false,
      required: true,
    },
    {
      label: '原库房',
      prop: 'sourceWarehouse',
      type: 'text',
      required: true,
    },
    {
      label: '原位置',
      prop: 'sourcePosition',
      type: 'text',
      required: true,
    },
    {
      label: '目标库房',
      prop: 'targetWarehouse',
      type: 'text',
      required: true,
    },
    {
      label: '目标位置',
      prop: 'targetPosition',
      type: 'text',
      required: true,
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
    { label: '添加', type: 'primary', execute: 'add' },
    { label: '导出', type: 'primary', fn: null },
  ],
  table: [
    { label: '详情', type: 'text', execute: 'view' },
    { label: '修改', type: 'text', execute: 'update' },
    { label: '审核', type: 'text', execute: 'audit' },
  ],
}

import { move } from './api.js'
export const requestFun = move

export const getDefaultOptions = async () => {}

export const beforeSubmit = async data => {
  console.log('beforeSubmit', data)
  return data
}

export const beforeRecurrence = (data, that) => {
  return data
}

export const handleTbaleMap = data => {
  return data
}
