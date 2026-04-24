import { listMaterialCode, deleteMaterialCode, addMaterialCode, updateMaterialCode, getMaterialCodeDetail } from './api.js'

export const config = {
  table: [
    { label: '材料代码', prop: 'goodCode' },
    { label: '材料名称', prop: 'goodName' },
    { label: '通用名称', prop: 'commonName' },
    { label: '常用单位', prop: 'commonUnit' },
  ],
  search: [
    { label: '材料代码', prop: 'goodCode', type: 'text', col: 6 },
    { label: '材料名称', prop: 'goodName', type: 'text', col: 6 },
    { label: '通用名称', prop: 'commonName', type: 'text', col: 6 },
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

export const requestFun = { 
  list: listMaterialCode, 
  delete: deleteMaterialCode,
  add: addMaterialCode,
  update: updateMaterialCode,
  detail: getMaterialCodeDetail
}
export const getDefaultOptions = async () => {}
export const beforeSubmit = async (data) => { return data }
export const handleTbaleMap = (data) => { return data }
