import request from '@/utils/request'

/**
 * 调拨依据查询 - 接口封装
 * 说明：后端接口尚未最终确定，下方 URL 为预留占位；
 *      在接口就绪前，通过 withMock 在请求失败时回退到本地 Mock 数据，保证界面可用。
 *      字段 key 与 comprehensiveQuery / sealLedger 等同名字段保持一致，
 *      后端接口确定后，删除 buildMock* 与 withMock 包装，直接导出 request 调用即可。
 */

// 预留接口地址（后端确定后替换）
const API = {
  list: '/busin/statist/transfer-basis/query',
  container: '/busin/statist/transfer-basis/container',
}

// 标准成功响应封装（与 request 拦截器返回结构保持一致）
const ok = data => ({ code: 1, data })

// 下拉候选项（与 comprehensiveQuery 调拨依据下拉数据风格保持一致）
const TRANSFER_POOL = [
  'DB-2025-001', 'DB-2025-002', 'DB-2024-018', 'DB-2024-031', 'DB-2023-007',
]
const MATERIAL_POOL = [
  { goodCode: 'M001', goodName: '金属材料A' },
  { goodCode: 'M002', goodName: '复合材料B' },
  { goodCode: 'M003', goodName: '化工材料C' },
  { goodCode: 'M004', goodName: '合金材料D' },
]
const PRODUCTION_POOL = ['第一生产单位', '第二生产单位', '第三生产单位']
const LOCATION_POOL = ['1号库-货架A-01', '1号库-货架B-03', '2号库-货架C-12', '2号库-货架D-07']

// 生成容器明细 Mock（点击数量/重量时调用）
const buildMockContainer = (params = {}) => {
  const count = Math.max(1, Number(params.count) || 5)
  const goodName = params.goodName || MATERIAL_POOL[0].goodName
  const list = Array.from({ length: count }, (_, i) => {
    const gross = (10 + i * 1.7).toFixed(2)
    const tare = (1 + i * 0.15).toFixed(2)
    const net = (gross - tare).toFixed(2)
    return {
      containerCode: `CN-${String(10001 + i).padStart(5, '0')}`,
      location: LOCATION_POOL[i % LOCATION_POOL.length],
      inboundInfo: `2025-0${(i % 9) + 1}-1${i % 9} 09:3${i}  /  张三`,
      outboundInfo: `2025-0${(i % 9) + 1}-2${i % 9} 16:0${i}  /  李四`,
      goodName,
      sealType1: '铅封',
      sealCode1: `SEAL-A${String(20001 + i)}`,
      sealType2: '电子封',
      sealCode2: `SEAL-B${String(30001 + i)}`,
      productionUnit: PRODUCTION_POOL[i % PRODUCTION_POOL.length],
      grossWeight: Number(gross),
      tareWeight: Number(tare),
      netWeight: Number(net),
    }
  })
  return ok({ list })
}

// 生成主列表 Mock（按调拨依据 + 年份 + 材料聚合）
const buildMockList = (params = {}) => {
  const goodCodes = Array.isArray(params.goodCodes) && params.goodCodes.length ? params.goodCodes : null
  const outTransferId = params.outTransferId
  const materials = goodCodes
    ? MATERIAL_POOL.filter(m => goodCodes.includes(m.goodCode))
    : MATERIAL_POOL
  const transferBasisList = outTransferId ? [TRANSFER_POOL[(outTransferId - 1) % TRANSFER_POOL.length]] : TRANSFER_POOL
  const years = ['2025', '2024', '2023']

  const all = []
  transferBasisList.forEach(tb => {
    years.forEach(year => {
      materials.forEach(m => {
        const quantity = 50 + ((tb.length + year.length + m.goodCode.length) % 200)
        all.push({
          transferBasis: tb,
          outTransferId: TRANSFER_POOL.indexOf(tb) + 1,
          year,
          goodCode: m.goodCode,
          goodName: m.goodName,
          quantity,
          weight: Number((quantity * 2.35).toFixed(2)),
        })
      })
    })
  })

  const page = Number(params.currentPage) || 1
  const size = Number(params.pageSize) || 20
  const start = (page - 1) * size
  const list = all.slice(start, start + size)
  return ok({ list, pagination: { total: all.length } })
}

/**
 * 接口失败时回退到 Mock，保证界面在接口未就绪时仍可用。
 * 接口就绪后，移除 withMock 包装，直接导出 request 调用。
 */
const withMock = (requestFn, mockFn) => params =>
  requestFn(params)
    .then(res => (res && res.code === 1 ? res : mockFn(params)))
    .catch(() => mockFn(params))

// 调拨依据查询 - 分页列表
export const listTransferBasisQuery = withMock(
  data => request({ url: API.list, method: 'post', data }),
  buildMockList
)

// 调拨依据查询 - 容器明细（点击数量 / 重量时调用）
export const listTransferBasisContainer = withMock(
  data => request({ url: API.container, method: 'post', data }),
  buildMockContainer
)
