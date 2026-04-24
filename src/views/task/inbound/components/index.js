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

import { getAllTransferBasisList, getLocationHierarchy } from './api.js'

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
    { label: '任务编号', prop: 'taskNum', isTitle: true },
    { label: '调拨依据', prop: 'transferBasis' },
    { label: '出方单位', prop: 'outUnit' },
    { label: '入库时间', prop: 'createTime' },
    { label: '库房', prop: 'warehouseName' },
    { label: '状态', prop: 'auditStatus', type: 'slot' },
  ],
  search: [
    { label: '任务编号', prop: 'taskNum', type: 'text', col: 4 },
    { label: '生产单位', prop: 'productionUnit', type: 'text', col: 4 },
    {
      label: '库房',
      prop: 'warehouseName',
      type: 'select',
      col: 4,
      option: () => getLocationHierarchy(2).then(res => {
        return (res.data || []).map(item => ({ label: item.warehouseName, value: item.warehouseName }))
      }),
    },
    { label: '入库时间', prop: 'timeRange', type: 'daterange', col: 4 },
    { label: '调拨依据', prop: 'transferBasis', type: 'text', col: 4 },
    { label: '容器号', prop: 'containerCode', type: 'text', col: 4 },
    { label: '出方单位', prop: 'outUnit', type: 'text', col: 4 },
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
    {
      label: '任务编号',
      prop: 'taskNum',
      type: 'text',
      required: true,
      defaultValue: '',
      disabled: true,
    },
    {
      label: '调拨依据',
      prop: '_transferSelected', // 少用于级联组件绑定，不提交到后端
      type: 'cascader',
      showMaintenance: true,
      option: () => getAllTransferBasisList().then(res => {
        return (res.data || []).map(item => ({
          label: item.documentNo,
          value: item.id,
          children: item.goodsList && item.goodsList.length ? item.goodsList.map(good => ({
            label: `材料编码: ${good.goodCode || '未命名'} (件数: ${good.goodNum || 0}, 重量: ${good.goodWeight || 0})`,
            value: good.goodCode || good.id,
          })) : undefined
        }))
      }),
      props: { multiple: true, checkStrictly: true, emitPath: true },
      required: true,
      defaultValue: [],
      change: (values, form, that) => {
        const goodCodes = []
        let activeFirstLevelId = ''

        if (Array.isArray(values) && values.length > 0) {
          // 取第一个被选中路径的第一级 ID 作为唯一文号
          activeFirstLevelId = values[0][0]
          values.forEach(path => {
            if (Array.isArray(path) && path.length >= 2 && path[0] === activeFirstLevelId) {
              goodCodes.push(path[1])
            }
          })
        }

        form.transferId = activeFirstLevelId
        form.goodCodes = goodCodes.join(',')

        // 动态更新级联选项：已选文号则将其他第一级置灰。清空则恢复全部
        if (that && that.options && that.options['_transferSelected']) {
          const updated = that.options['_transferSelected'].map(opt => ({
            ...opt,
            disabled: activeFirstLevelId ? opt.value !== activeFirstLevelId : false
          }))
          that.$set(that.options, '_transferSelected', updated)
        }
      },
    },
    {
      label: '入库人',
      prop: 'inboundMan',
      type: 'text',
      required: true,
    },
    {
      label: '入库时间',
      prop: 'createTime',
      type: 'datetime',
      required: false,
      defaultValue: new Date(),
    },
    {
      label: '出方单位',
      prop: 'outUnit',
      type: 'text',
      required: false,
    },
    {
      label: '密级',
      prop: 'classify',
      type: 'select',
      dictParentId: '2046869125529927682', // 密级字典ID
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
    { label: '调拨依据管理', type: 'primary', execute: 'manageAllocationBasis' },
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
  // 移除级联组件的中间绑定字段，不向后端提交
  delete data._transferSelected
  return data
}

// 供列表查询前处理参数
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

// 定义修改复现数据时的处理
export const beforeRecurrence = (data, that) => {
  // 复现调拨依据：将 transferId 和 goodCodes 映射回级联组件的二维数组格式
  if (data.transferId) {
    const transferId = data.transferId
    const goodCodes = data.goodCodes ? data.goodCodes.split(',').filter(Boolean) : []
    const paths = goodCodes.length > 0
      ? goodCodes.map(code => [transferId, code])
      : [[transferId]]
    that.$set(that.form, '_transferSelected', paths)

    // 置灰其他文号选项
    const applyDisabled = () => {
      const opts = that.options['_transferSelected']
      if (opts && opts.length > 0) {
        const updated = opts.map(opt => ({
          ...opt,
          disabled: opt.value !== transferId
        }))
        that.$set(that.options, '_transferSelected', updated)
        return true
      }
      return false
    }

    // 如果 options 已加载则直接执行，否则用 $watch 等待
    if (!applyDisabled()) {
      const unwatch = that.$watch(
        () => that.options['_transferSelected'],
        (newVal) => {
          if (newVal && newVal.length > 0) {
            applyDisabled()
            unwatch()
          }
        }
      )
    }
  }

  // 复现密级：确保值为字符串以匹配 select 的 value
  if (data.classify !== undefined && data.classify !== null) {
    that.$set(that.form, 'classify', String(data.classify))
  }
  return data
}

// 定义table数据返回值处理
export const handleTbaleMap = data => {
  return data
}
