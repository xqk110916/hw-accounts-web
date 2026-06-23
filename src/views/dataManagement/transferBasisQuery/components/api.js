import request from '@/utils/request'

/**
 * 调拨依据查询 - 接口封装
 * 对接 md/数据管理接口.md「调拨统计」分组：
 *   - 主列表（按调拨依据聚合）：POST /busin/statist/transfer/statistics
 *   - 容器明细下钻：POST /busin/statist/transfer/container/list
 */

// 调拨依据查询 - 调拨单统计报表（分页，按调拨依据 + 年份 + 材料聚合）
export const listTransferBasisQuery = data => {
  return request({ url: '/busin/statist/transfer/statistics', method: 'post', data })
}

// 调拨依据查询 - 容器明细（点击数量 / 重量列下钻，按调拨依据查询容器详情列表）
export const listTransferBasisContainer = data => {
  return request({ url: '/busin/statist/transfer/container/list', method: 'post', data })
}
