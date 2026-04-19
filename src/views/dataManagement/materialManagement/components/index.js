import { listMaterial, deleteMaterial } from './api.js'

export const config = {
  table: [
    { label: '材料代码', prop: 'materialCode' },
    { label: '材料名称', prop: 'materialName' },
    { label: '单位', prop: 'unit' },
    { label: '规格', prop: 'specification' },
    { label: '单价', prop: 'price' },
    { label: '状态', prop: 'status', type: 'slot' },
  ],
  search: [
    { label: '材料代码', prop: 'materialCode', type: 'text', col: 6 },
    { label: '材料名称', prop: 'materialName', type: 'text', col: 6 },
    { label: '状态', prop: 'status', type: 'select', col: 6, option: [{label: '启用', value: 'enable'}, {label: '禁用', value: 'disable'}] },
  ],
  detail: [],
}

export const btns = {
  operation: [
    { label: '新增', type: 'primary', execute: 'add' },
  ],
  table: [
    { label: '编辑', type: 'text', execute: 'update' },
    { label: '删除', type: 'text', execute: 'delete' },
  ]
}

export const requestFun = { list: listMaterial, delete: deleteMaterial }
export const getDefaultOptions = async () => {}
export const beforeSubmit = async (data) => { return data }
export const handleTbaleMap = (data) => { return data }
