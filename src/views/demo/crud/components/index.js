import { getFun } from './api.js'
const area = getFun().then(res => {
  return res
})
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
  detail 配置
    type:<String> 字段类型<可选值: text, select, date>(默认text)
    option:<Array> 字段选项<select类型必传>
    isAdd:<Boolean/Function> 是否在新增时显示(默认为true)(function参数为form表单数据)  
    isUpdate:<Boolean/Function> 是否在编辑时显示(默认为true)
    required:<Boolean> 是否必填(默认为true)
    change:<Function> 字段change事件(input/change事件参数:当前值、form表单数据)
*/
export const config = {
  table: [
    { label: '设备组名称', prop: 'name', isTitle: true },
    { label: '时间内(分钟)', prop: 'sbId' },
    { label: '频次', prop: 'position' },
    { label: '创建时间', prop: 'ip' },
  ],
  search: [
    { label: '设备组名称', prop: 'name', type: 'text', col: 4 },
    { label: '创建时间', prop: 'sbId', type: 'daterange', col: 4 },
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
    { label: '新增', type: 'primary', execute: 'add' },
  ],
  table: [
    { label: '编辑', type: 'text', execute: 'update' },
    { label: '删除', type: 'text', execute: 'delete' },
  ]
}

// 定义crud请求方法
import { box } from './api.js'
export const requestFun = box

// 定义初始查询
export const getDefaultOptions = async () => {
  
}

// 定义提交前的参数处理
export const beforeSubmit = async (data) => {
  console.log('beforeSubmit', data);
  return data
}
// 定义修改复现数据时的处理S
export const beforeRecurrence = (data, that) => {
  return data
}
// 定义table数据返回值处理
export const handleTbaleMap = (data) => {
  return data
}