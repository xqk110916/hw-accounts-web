import { getAllTransferBasisList } from '@/views/task/inbound/components/api.js'

// 出库调拨依据只查调出类型
const getAllOutboundTransferBasisList = () => getAllTransferBasisList({ type: '1' })
import { getLocationHierarchy } from './api.js'

export const statusOptions = [
  { label: '待审核', value: 0 },
  { label: '审核通过', value: 1 },
  { label: '已拒绝', value: 2 },
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
      option: () => getAllOutboundTransferBasisList().then(res => {
        return (res.data || []).map(item => ({
          label: item.documentNo,
          value: item.id,
          raw: item,
          goodsList: item.goodsList || [],
          children: item.goodsList && item.goodsList.length ? item.goodsList.map(good => ({
            label: `材料代码: ${good.goodCode || '未命名'} (件数: ${good.goodNum || 0}, 重量: ${good.goodWeight || 0})`,
            value: good.goodCode || good.id,
            raw: good,
          })) : undefined
        }))
      }),
      props: { multiple: true, checkStrictly: false, emitPath: true },
      required: true,
      defaultValue: [],
      change: (values, form, that) => {
        const firstLevelIds = new Set()
        const goodCodes = []

        // checkStrictly: false 时 values 只包含叶子路径（父级自动展开子级）
        if (Array.isArray(values)) {
          values.forEach(path => {
            if (Array.isArray(path) && path.length >= 2) {
              firstLevelIds.add(path[0])
              goodCodes.push(path[1])
            }
          })
        }

        form.transferId = Array.from(firstLevelIds).join(',')
        form.goodCodes = goodCodes.join(',')
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
      defaultValue: () => new Date(),
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
    // { label: '导出', type: 'primary', fn: null },
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
  // 复现调拨依据：将 transferId(s) 和 goodCodes 映射回级联组件的叶子路径
  if (data.transferId) {
    const transferIds = data.transferId.split(',').filter(Boolean)
    const goodCodes = data.goodCodes ? data.goodCodes.split(',').filter(Boolean) : []
    const opts = (that.options && that.options['_transferSelected']) || []

    const paths = []
    transferIds.forEach(parentId => {
      if (goodCodes.length > 0) {
        // 有子级编码：用它们构建叶子路径
        goodCodes.forEach(code => {
          paths.push([parentId, code])
        })
      } else {
        // 无子级编码：从选项中找到所有子级，展开为叶子路径
        const parent = opts.find(o => String(o.value) === String(parentId))
        const children = (parent && parent.children) || []
        if (children.length > 0) {
          children.forEach(child => {
            paths.push([parentId, child.value])
          })
        }
      }
    })

    that.$set(that.form, '_transferSelected', paths)
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
