import { getAllTransferBasisList } from '@/views/task/inbound/components/api.js'
import { getLocationHierarchy } from './api.js'

export const statusOptions = [
  { label: '待审核', value: 0 },
  { label: '审核通过', value: 1 },
  { label: '审核拒绝', value: 2 },
  { label: '暂存', value: 4 },
  { label: '变更审核中', value: 7 },
  { label: '变更审核通过', value: 8 },
  { label: '变更审核拒绝', value: 9 },
]

export const secretLevelOptions = [
  { label: '普通', value: 'normal' },
  { label: '秘密', value: 'secret' },
  { label: '机密', value: 'confidential' },
]

export const config = {
  table: [
    { label: '任务编号', prop: 'taskNum', isTitle: true },
    { label: '调拨依据', prop: 'transferBasis' },
    { label: '出库时间', prop: 'createTime' },
    { label: '库房', prop: 'warehouseName' },
    { label: '收方单位', prop: 'receiveUnit' },
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
    { label: '出库时间', prop: 'timeRange', type: 'daterange', col: 8 },
    { label: '调拨依据', prop: 'transferBasis', type: 'text', col: 4 },
    { label: '容器号', prop: 'containerCode', type: 'text', col: 4 },
    { label: '收方单位', prop: 'receiveUnit', type: 'text', col: 4 },
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
          activeFirstLevelId = values[0][0]
          values.forEach(path => {
            if (Array.isArray(path) && path.length >= 2 && path[0] === activeFirstLevelId) {
              goodCodes.push(path[1])
            }
          })
        }

        form.transferId = activeFirstLevelId
        form.goodCodes = goodCodes.join(',')

        // 动态更新级联选项：已选文号则将其他第一级置灰，清空则恢复全部
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
      label: '出库人',
      prop: 'outboundMan',
      type: 'text',
      required: true,
    },
    {
      label: '出库时间',
      prop: 'createTime',
      type: 'datetime',
      required: false,
      defaultValue: new Date(),
    },
    {
      label: '收方单位',
      prop: 'receiveUnit',
      type: 'text',
      required: false,
    },
    {
      label: '密级',
      prop: 'securityLevel',
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

import { outbound } from './api.js'
export const requestFun = outbound

export const getDefaultOptions = async () => {}

export const beforeSubmit = async data => {
  // 移除级联组件的中间绑定字段，不向后端提交
  delete data._transferSelected
  return data
}

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
  if (data.securityLevel !== undefined && data.securityLevel !== null) {
    that.$set(that.form, 'securityLevel', String(data.securityLevel))
  }
  return data
}

export const handleTbaleMap = data => {
  return data
}
