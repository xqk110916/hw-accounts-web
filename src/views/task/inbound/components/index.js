/*
  config配置:
  必传:
    label:<String> 字段名称
    prop:<String> 字段key
  ======================================================
  table 配置
    type:<String> 字段类型<可选值: text, slot>(默认text)
  search 配置
    type:<String> 字段类型<可选值: text, select, daterange>(默认text)
    option:<Array> 字段选项<select类型必传>
    col:<Number> 字段占位<默认5>
  detail 配置
    type:<String> 字段类型<可选值: text, select, date, textarea>(默认text)
    option:<Array> 字段选项<select类型必传>
    isAdd:<Boolean/Function> 是否在新增时显示(默认为true)(function参数为form表单数据)
    isUpdate:<Boolean/Function> 是否在编辑时显示(默认为true)
    required:<Boolean> 是否必填(默认为true)
    change:<Function> 字段change事件(input/change事件参数:当前值、form表单数据)
*/

import { getAllocationList } from './api.js'

// 状态枚举
export const statusOptions = [
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '变更审核中', value: 'auditing' },
  { label: '变更审核通过', value: 'approved' },
  { label: '变更审核拒绝', value: 'rejected' },
]

// 密级枚举
export const secretLevelOptions = [
  { label: '普通', value: 'normal' },
  { label: '秘密', value: 'secret' },
  { label: '机密', value: 'confidential' },
]

export const config = {
  table: [
    { label: '任务编号', prop: 'taskNo', isTitle: true },
    { label: '调拨依据', prop: 'allocationBasis' },
    { label: '入库时间', prop: 'inboundTime' },
    { label: '库房', prop: 'warehouseName' },
    { label: '状态', prop: 'status', type: 'slot' },
  ],
  search: [
    { label: '任务编号', prop: 'taskNo', type: 'text', col: 4 },
    { label: '生产单位', prop: 'qqq', type: 'text', col: 4 },
    {
      label: '库房',
      prop: 'warehouseName',
      type: 'select',
      col: 4,
      option: statusOptions,
    },
    { label: '入库时间', prop: 'inboundTime', type: 'daterange', col: 4 },
    { label: '调拨依据', prop: 'allocationBasis', type: 'text', col: 4 },
    { label: '容器号', prop: 'xxx', type: 'text', col: 4 },
    { label: '出方单位', prop: 'outboundUnit', type: 'text', col: 4 },
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
      change: (value, form) => {
        console.log('联动调拨依据', value)
      },
    },
    {
      label: '入库人',
      prop: 'inboundPerson',
      type: 'text',
      required: true,
    },
    {
      label: '入库时间',
      prop: 'inboundTime',
      type: 'date',
      required: false,
      defaultValue: new Date(),
    },
    {
      label: '出方单位',
      prop: 'outboundUnit',
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

// 定义crud请求方法
import { inbound } from './api.js'
export const requestFun = inbound

// 定义初始查询
export const getDefaultOptions = async () => {}

// 定义提交前的参数处理
export const beforeSubmit = async data => {
  console.log('beforeSubmit', data)
  return data
}

// 定义修改复现数据时的处理
export const beforeRecurrence = (data, that) => {
  return data
}

// 定义table数据返回值处理
export const handleTbaleMap = data => {
  return data
}
