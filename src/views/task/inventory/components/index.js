export const statusOptions = [
  { label: '未开始', value: 'notStarted' },
  { label: '盘存中', value: 'inProgress' },
  { label: '已完成', value: 'completed' },
]

export const inventoryStatusOptions = [
  { label: '正常', value: 'normal' },
  { label: '不正常', value: 'abnormal' },
]

export const config = {
  table: [
    { label: '任务编号', prop: 'taskNo', isTitle: true },
    { label: '库房', prop: 'warehouseName' },
    { label: '状态', prop: 'status', type: 'slot' },
    { label: '创建时间', prop: 'createTime' },
  ],
  search: [
    { label: '任务编号', prop: 'taskNo', type: 'text', col: 5 },
    { label: '库房', prop: 'warehouseName', type: 'text', col: 5 },
    {
      label: '状态',
      prop: 'status',
      type: 'select',
      col: 5,
      option: statusOptions,
    },
    { label: '创建时间', prop: 'createTime', type: 'daterange', col: 5 },
  ],
  detail: [
    {
      label: '任务编号',
      prop: 'taskNo',
      type: 'text',
      disabled: true,
      required: true,
    },
    {
      label: '库房',
      prop: 'warehouseName',
      type: 'text',
      required: true,
    },
    {
      label: '创建人',
      prop: 'creator',
      type: 'text',
      isAdd: false,
      isUpdate: false,
      required: false,
    },
    {
      label: '创建时间',
      prop: 'createTime',
      type: 'text',
      isAdd: false,
      isUpdate: false,
      required: false,
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

import { inventory } from './api.js'
export const requestFun = inventory

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
