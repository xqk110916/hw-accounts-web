export const statusOptions = [
  { label: '待审核', value: 0 },
  { label: '审核通过', value: 1 },
  { label: '审核驳回', value: 2 },
  { label: '暂存', value: 4 },
  { label: '变更审核中', value: 7 },
  { label: '变更审核通过', value: 8 },
  { label: '变更审核拒绝', value: 9 },
]

export const config = {
  table: [
    { label: '任务编号', prop: 'moveTaskNum', isTitle: true, width: 160 },
    { label: '容器数量', prop: 'containerCount', width: 100 },
    { label: '移动时间', prop: 'moveTime', width: 170 },
    { label: '创建时间', prop: 'createTime', width: 170 },
    { label: '状态', prop: 'auditStatus', type: 'slot', width: 180 },
  ],
  search: [
    { label: '任务编号', prop: 'taskNum', type: 'text', col: 4 },
    { label: '容器号', prop: 'containerCode', type: 'text', col: 4 },
    { label: '位置', prop: 'position', type: 'text', col: 4 },
    { label: '移动时间', prop: 'timeRange', type: 'daterange', col: 8 },
    {
      label: '状态',
      prop: 'statusList',
      type: 'select',
      multiple: true,
      col: 4,
      option: statusOptions,
      defaultValue: [],
    },
  ],
  detail: [
    { label: '任务编号', prop: 'taskNum', type: 'text', disabled: true, required: true, defaultValue: '' },
    { label: '执行人', prop: 'executor', type: 'text', required: false, defaultValue: '' },
    { label: '移动时间', prop: 'moveTime', type: 'datetime', required: false, defaultValue: () => new Date() },
    { label: '备注', prop: 'remark', type: 'textarea', required: false, full: true, defaultValue: '' },
  ],
}

export const btns = {
  operation: [
    { label: '添加任务', type: 'primary', execute: 'add' },
    // { label: '导出', type: 'primary', fn: null },
  ],
  table: [
    { label: '详情', type: 'text', execute: 'view' },
    { label: '编辑', type: 'text', execute: 'update' },
    { label: '审核', type: 'text', execute: 'audit' },
  ],
}

import { move } from './api.js'
export const requestFun = move

export const getDefaultOptions = async () => {}

export const beforeSubmit = async data => data

export const beforeRecurrence = data => data

export const handleSearchParams = params => {
  const p = { ...params }
  if (p.timeRange && p.timeRange.length === 2) {
    p.startTime = p.timeRange[0]
    p.endTime = p.timeRange[1]
  }
  delete p.timeRange
  if (p.statusList && !Array.isArray(p.statusList)) {
    p.statusList = [p.statusList]
  }
  return p
}

export const handleTbaleMap = data => data
