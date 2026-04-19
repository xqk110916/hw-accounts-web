import { listTemplate, deleteTemplate } from './api.js'

export const config = {
  table: [
    { label: '模板名称', prop: 'name' },
    { label: '模板类别', prop: 'type', type: 'slot' },
    { label: '生成时间', prop: 'updateTime' },
  ],
  search: [
    { label: '模板名称', prop: 'name', type: 'text', col: 6 },
    { label: '模板类别', prop: 'type', type: 'select', col: 6, option: [{label: '标签', value: 'label'}] },
  ],
  detail: [],
}

export const btns = {
  operation: [
    { label: '新增', type: 'primary', execute: 'add' },
  ],
  table: [
    { label: '重命名', type: 'text', execute: 'rename' },
    { label: '编辑模板', type: 'text', execute: 'editTemplate' },
    { label: '删除', type: 'text', execute: 'delete' },
  ]
}

export const requestFun = { list: listTemplate, delete: deleteTemplate }
export const getDefaultOptions = async () => {}
