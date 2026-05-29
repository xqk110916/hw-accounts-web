import { dataBackup } from './api.js'

/*
  config配置:
  必传:
    label:<String> 字段名称
    prop:<String> 字段key
  ======================================================
  table 配置
    type:<String> 字段类型<可选值: text, slot>(默认text)
  search 配置
    type:<String> 字段类型<可选值: text, select, date>(默认text)
    option:<Array> 字段选项<select类型必传>
    col:<Number> 字段占位<默认5>
*/
export const config = {
  table: [
    { label: '操作时间', prop: 'operateTime', width: 180 },
    { label: '类型', prop: 'type', width: 120 },
    { label: '备注', prop: 'remark' },
  ],
  search: [
    { label: '操作时间', prop: 'operateTime', type: 'daterange', col: 6 },
    { label: '类型', prop: 'type', type: 'select', col: 4, option: [
      { label: '导入', value: 'import' },
      { label: '导出', value: 'export' }
    ]},
  ],
  detail: [],
}

/**
 * 按钮配置
 *  必传:
 *  label:<String> 按钮名称
 *   type:<String> 按钮类型<可选值: primary, success, warning, danger>
 *   fn:<Function> 按钮点击事件
 * 可选:
 * execute:<String> 按钮权限标识(如果传fn会优先执行fn的事件)<可选值: 'add', 'delete', 'update', 'view'>
 * isShow:<Boolean/Function> 是否显示按钮(默认为true)
 */
export const btns = {
  operation: [
    { label: '导入', type: 'primary', fn: 'import' },
    { label: '导出', type: 'primary', fn: 'export' },
  ],
  table: [
    { label: '详情', type: 'text', execute: 'view' },
  ]
}

// 定义crud请求方法
export const requestFun = dataBackup

// 定义初始查询
export const getDefaultOptions = async () => {

}

// 定义提交前的参数处理
export const beforeSubmit = async (data) => {
  return data
}

// 定义修改复现数据时的处理
export const beforeRecurrence = (data, that) => {
  return data
}

// 定义table数据返回值处理
export const handleTbaleMap = (data) => {
  const typeMap = {
    'import': '导入',
    'export': '导出'
  }
  return data.map(item => ({
    ...item,
    type: typeMap[item.type] || item.type
  }))
}
