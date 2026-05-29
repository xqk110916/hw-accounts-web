import { dataBackup } from './api.js'

export const config = {
  table: [
    { label: '备份名称', prop: 'backName', width: 160 },
    { label: '备份类型', prop: 'backTypeDesc', width: 120 },
    { label: '是否自动备份', prop: 'isBackDesc', width: 120 },
    { label: '执行时间', prop: 'createTime', width: 180 },
    { label: '数据最新日期', prop: 'newTime', width: 180 },
  ],
  search: [],
  detail: [],
}

export const btns = {
  operation: [],
  table: [
    { label: '备份', type: 'text', execute: 'backup' },
    { label: '恢复', type: 'text', execute: 'restore' },
  ]
}

export const requestFun = dataBackup

export const getDefaultOptions = async () => {}

export const beforeSubmit = async (data) => {
  return data
}

export const beforeRecurrence = (data, that) => {
  return data
}

const backTypeMap = {
  '1': '实时库存数据',
  '2': '库位表',
  '3': '入库数据',
  '4': '出库数据',
  '5': '移库数据',
  '6': '盘存数据',
}

const isBackMap = {
  '1': '是',
  '2': '否',
}

export const handleTbaleMap = (data) => {
  return data.map(item => ({
    ...item,
    backTypeDesc: backTypeMap[item.backType] || item.backType,
    isBackDesc: isBackMap[item.isBack] || item.isBack,
  }))
}
