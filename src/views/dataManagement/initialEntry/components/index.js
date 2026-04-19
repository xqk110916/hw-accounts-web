import { listInitialEntry, deleteInitialEntry } from './api.js'

export const config = {
  table: [
    { label: '数据类型', prop: 'dataType' },
    { label: '导入时间', prop: 'importTime' },
    { label: '导入人', prop: 'importUser' },
    { label: '审批时间', prop: 'auditTime' },
    { label: '审批人', prop: 'auditUser' },
    { label: '据条数', prop: 'count' },
    { label: '状态', prop: 'status', type: 'slot' },
  ],
  search: [
    { label: '添加时间', prop: 'addTime', type: 'daterange', col: 5 },
    { 
      label: '状态', 
      prop: 'status', 
      type: 'select', 
      multiple: true,
      col: 6,
      option: [
        { label: '全部', value: 'all' },
        { label: '待提交', value: 'unsubmitted' },
        { label: '待审核', value: 'pending' },
        { label: '审核通过', value: 'approved' },
        { label: '审核拒绝', value: 'rejected' },
      ]
    },
  ],
  detail: [],
}

export const btns = {
  operation: [
    { label: '添加', type: 'primary', execute: 'add' },
  ],
  table: []
}

export const requestFun = {
  list: listInitialEntry,
  delete: deleteInitialEntry
}

export const getDefaultOptions = async () => {}
export const beforeSubmit = async (data) => { return data }
export const beforeRecurrence = (data) => { return data }
export const handleTbaleMap = (data) => { return data }
