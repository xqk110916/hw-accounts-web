import { listInitialEntry, deleteInitialEntry } from './api.js'

export const config = {
  table: [
    { label: '操作类型', prop: 'operationType' },
    { label: '状态', prop: 'dataStatus', type: 'slot' },
    { label: '录入时间', prop: 'createTime' },
    { label: '录入人', prop: 'createUname' },
    { label: '审批时间', prop: 'auditTime' },
    { label: '审批人', prop: 'auditUserName' },
  ],
  search: [
    { label: '开始时间', prop: 'startTime', type: 'date', col: 5 },
    { label: '结束时间', prop: 'endTime', type: 'date', col: 5 },
    { 
      label: '状态', 
      prop: 'dataStatus', 
      type: 'select', 
      col: 6,
      option: [
        { label: '待确认', value: 0 },
        { label: '已确认', value: 1 },
        { label: '待提交', value: 2 },
        { label: '审核中', value: 3 },
        { label: '审核通过', value: 4 },
        { label: '审核驳回', value: 5 },
      ]
    },
  ],
  detail: [],
}

export const btns = {
  operation: [
    { label: '导入', type: 'primary', execute: 'add' },
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
export const handleTbaleMap = (data) => {
  return (data || []).map(item => {
    return {
      ...item,
      operationType: item.operationType === 'INITIAL_ENTRY' ? '初始录入' : item.operationType
    }
  })
}
