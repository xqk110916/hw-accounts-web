/**
 * 盘存定制版2D平面图离屏渲染
 * 基于 WarehouseGridMap2D 的 exportImage 逻辑，增加盘存状态着色
 */

// 盘存状态颜色配置
const INVENTORY_COLORS = {
  normal: '#43a047',   // 正常 - 绿色
  deficit: '#d32f2f',  // 不正常 - 红色
  unscanned: 'rgba(160,160,160,0.45)', // 非本次盘单容器 - 灰色半透明
  empty: 'rgba(255,255,255,0.15)',     // 空位
}

const LEGEND_ITEMS = [
  { color: INVENTORY_COLORS.normal, label: '正常' },
  { color: INVENTORY_COLORS.deficit, label: '不正常' },
  { color: INVENTORY_COLORS.unscanned, label: '非本次盘单' },
]

const DEFAULT_CELL_SIZE = 32
const HEADER_HEIGHT = 44
const LEGEND_HEIGHT = 32

/**
 * 将盘存结果状态码映射为颜色键名
 * '0' → normal, '1' → deficit
 */
function resultToStatusKey(result) {
  const map = { '0': 'normal', '1': 'deficit' }
  return map[String(result)] || null
}

/**
 * 渲染单个库房的盘存平面图到 canvas 并返回 PNG Blob
 * @param {Object} options
 * @param {string} options.warehouseName - 库名
 * @param {Object} options.layout - layout2d 对象 { grid: {rows,cols,cellSize}, shelves:[], aisles:[] }
 * @param {Array} options.shelves - 货架数据（含 layers/containers）
 * @param {Object} options.inventoryResultMap - containerCode → result 状态映射
 * @returns {Promise<Blob>} PNG Blob
 */
export function renderInventoryPlan({ warehouseName, layout, shelves, inventoryResultMap = {} }) {
  const cellSize = (layout.grid && layout.grid.cellSize) || DEFAULT_CELL_SIZE
  const gridRows = (layout.grid && layout.grid.rows) || 12
  const gridCols = (layout.grid && layout.grid.cols) || 20
  const layoutShelves = layout.shelves || []
  const layoutAisles = layout.aisles || []

  // 合并货架位置信息
  const layoutMap = new Map(layoutShelves.map(item => [String(item.id), item]))
  const mergedShelves = (shelves || []).map(shelf => {
    const hit = layoutMap.get(String(shelf.id))
    return {
      ...shelf,
      ...(hit ? { position: { x: hit.x, y: hit.y }, width: hit.w, height: hit.h } : {}),
    }
  })

  const canvasWidth = gridCols * cellSize
  const canvasHeight = gridRows * cellSize + HEADER_HEIGHT + LEGEND_HEIGHT
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const ctx = canvas.getContext('2d')

  // 背景
  ctx.fillStyle = '#f7f9fc'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // 标题
  ctx.fillStyle = '#1f2d3d'
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText(warehouseName || '库房', 16, 28)

  // 盘存图例
  let legendX = canvasWidth - LEGEND_ITEMS.length * 90 - 10
  LEGEND_ITEMS.forEach(item => {
    ctx.fillStyle = item.color
    ctx.fillRect(legendX, 14, 14, 14)
    ctx.fillStyle = '#5d6673'
    ctx.font = '12px sans-serif'
    ctx.fillText(item.label, legendX + 18, 25)
    legendX += 90
  })

  // 平移到网格区域
  ctx.save()
  ctx.translate(0, HEADER_HEIGHT)

  // 网格线
  ctx.strokeStyle = '#d8dee9'
  ctx.lineWidth = 1
  for (let x = 0; x <= gridCols; x++) {
    ctx.beginPath()
    ctx.moveTo(x * cellSize, 0)
    ctx.lineTo(x * cellSize, gridRows * cellSize)
    ctx.stroke()
  }
  for (let y = 0; y <= gridRows; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * cellSize)
    ctx.lineTo(gridCols * cellSize, y * cellSize)
    ctx.stroke()
  }

  // 过道
  layoutAisles.forEach(item => {
    ctx.fillStyle = '#d9dde6'
    ctx.fillRect(item.x * cellSize, item.y * cellSize, item.w * cellSize, item.h * cellSize)
  })

  // 货架和容器
  mergedShelves.forEach(shelf => {
    if (!shelf.position) return
    const rx = shelf.position.x * cellSize
    const ry = shelf.position.y * cellSize
    const rw = (shelf.width || 1) * cellSize
    const rh = (shelf.height || 1) * cellSize

    // 货架底色
    ctx.fillStyle = '#2f6f73'
    ctx.fillRect(rx, ry, rw, rh)
    ctx.strokeStyle = '#174d51'
    ctx.lineWidth = 1.5
    ctx.strokeRect(rx, ry, rw, rh)

    // 货架名称
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(shelf.name || '', rx + 5, ry + 14)

    // 容器色块
    const dotSize = 8
    const dotGap = 2
    let dotX = rx + 5
    let dotY = ry + 20
    ;(shelf.layers || []).forEach(layer => {
      ;(layer.containers || []).forEach(container => {
        if (dotX + dotSize > rx + rw - 2) {
          dotX = rx + 5
          dotY += dotSize + dotGap
        }
        if (dotY + dotSize > ry + rh - 2) return

        const containerCode = container.code || container.containerCode || ''
        if (containerCode && containerCode in inventoryResultMap) {
          // 本次盘单中的容器，按盘存状态着色
          const statusKey = resultToStatusKey(inventoryResultMap[containerCode])
          ctx.fillStyle = statusKey ? INVENTORY_COLORS[statusKey] : INVENTORY_COLORS.normal
        } else if (container.materialCode || String(container.status) === '1') {
          // 有物料但不在本次盘单中 → 灰色半透明
          ctx.fillStyle = INVENTORY_COLORS.unscanned
        } else {
          // 空位
          ctx.fillStyle = INVENTORY_COLORS.empty
        }
        ctx.fillRect(dotX, dotY, dotSize, dotSize)
        dotX += dotSize + dotGap
      })
    })
  })

  ctx.restore()

  // 底部图例栏
  const legendBarY = HEADER_HEIGHT + gridRows * cellSize
  ctx.fillStyle = '#eef2f6'
  ctx.fillRect(0, legendBarY, canvasWidth, LEGEND_HEIGHT)
  ctx.fillStyle = '#5d6673'
  ctx.font = '12px sans-serif'
  ctx.fillText('盘存平面图 · ', 12, legendBarY + 20)
  let barLegendX = 90
  LEGEND_ITEMS.forEach(item => {
    ctx.fillStyle = item.color
    ctx.fillRect(barLegendX, legendBarY + 10, 12, 12)
    ctx.fillStyle = '#5d6673'
    ctx.font = '12px sans-serif'
    ctx.fillText(item.label, barLegendX + 16, legendBarY + 20)
    barLegendX += 80
  })

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/png')
  })
}

/**
 * 从盘存 goodsListMap 中构建 containerCode → result 映射
 * @param {Array} goodsList - 单个库房的货物列表
 * @returns {Object} { [containerCode]: result }
 */
export function buildInventoryResultMap(goodsList = []) {
  const map = {}
  goodsList.forEach(item => {
    const code = item.containerCode
    if (code && item.result && item.result !== '-1') {
      // 同一个容器可能有多条记录，以最后有值的为准
      map[code] = String(item.result)
    }
  })
  return map
}
