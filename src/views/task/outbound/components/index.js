import { getAllocationList } from '@/views/task/inbound/components/api.js'

export const statusOptions = [
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '变更审核中', value: 'auditing' },
  { label: '变更审核通过', value: 'approved' },
  { label: '变更审核拒绝', value: 'rejected' },
]

export const secretLevelOptions = [
  { label: '普通', value: 'normal' },
  { label: '秘密', value: 'secret' },
  { label: '机密', value: 'confidential' },
]

export const config = {
  table: [
    { label: '任务编号', prop: 'taskNo', isTitle: true },
    { label: '调拨依据', prop: 'allocationBasis' },
    { label: '出库时间', prop: 'outboundTime' },
    { label: '库房', prop: 'warehouseName' },
    { label: '收方单位', prop: 'inboundUnit' },
    { label: '状态', prop: 'status', type: 'slot' },
  ],
  search: [
    { label: '任务编号', prop: 'taskNo', type: 'text', col: 4 },
    { label: '生产单位', prop: 'inboundUnit', type: 'text', col: 4 },
    {
      label: '库房',
      prop: 'warehouseName',
      type: 'select',
      col: 4,
      option: statusOptions,
    },
    { label: '出库时间', prop: 'outboundTime', type: 'daterange', col: 8 },
    { label: '调拨依据', prop: 'allocationBasis', type: 'text', col: 4 },
    { label: '容器号', prop: 'xxx', type: 'text', col: 4 },
    { label: '收方单位', prop: 'qqq', type: 'text', col: 4 },
    {
      label: '状态',
      prop: 'status',
      type: 'select',
      col: 4,
      option: statusOptions,
    },
  ],
  detail: [
    {
      label: '任务编号',
      prop: 'taskNo',
      type: 'text',
      required: true,
      defaultValue: '',
    },
    {
      label: '调拨依据',
      prop: 'allocationBasisId',
      type: 'cascader',
      showMaintenance: true,
      option: getAllocationList().then(res => {
        return (res.data.list || []).map(item => ({
          label: item.name,
          value: item.id,
        }))
      }),
      required: true,
    },
    {
      label: '出库人',
      prop: 'outboundPerson',
      type: 'text',
      required: true,
    },
    {
      label: '出库时间',
      prop: 'outboundTime',
      type: 'date',
      required: false,
      defaultValue: new Date(),
    },
    {
      label: '收方单位',
      prop: 'inboundUnit',
      type: 'text',
      required: false,
    },
    {
      label: '密级',
      prop: 'secretLevel',
      type: 'select',
      option: secretLevelOptions,
      required: true,
    },
    {
      label: '备注',
      prop: 'remark',
      type: 'textarea',
      required: false,
      full: true,
    },
  ],
}

export const btns = {
  operation: [
    { label: '添加任务', type: 'primary', execute: 'add' },
    { label: '调拨依据管理', type: 'primary', fn: null },
    { label: '导出', type: 'primary', fn: null },
  ],
  table: [
    { label: '详情', type: 'text', execute: 'view' },
    { label: '编辑', type: 'text', execute: 'update' },
    { label: '审核', type: 'text', execute: 'audit' },
    { label: '删除', type: 'text', execute: 'delete' },
  ],
}

import { outbound } from './api.js'
export const requestFun = outbound

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
