const fieldValueMap = {
  materialCode: '材料编码',
  generationUnit: '生成单位',
  warehouse: '库房',
  inboundPerson: '入库人',
  containerNo: '容器号',
  inboundTime: '入库时间',
}

const fontDotMap = {
  '12号': 20,
  '14号': 22,
  '16号': 24,
  '18号': 28,
}

const getFontDot = value => fontDotMap[value] || 24

const mmToDot = value => {
  const size = Number.parseFloat(String(value || '').replace('mm', ''))
  return Number.isFinite(size) ? Math.round(size * 8) : 0
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const getLabelBounds = template => {
  const margins = template.margins || {}
  const left = clamp(mmToDot(margins.left), 0, 300)
  const right = clamp(mmToDot(margins.right), 0, 300)
  const top = clamp(mmToDot(margins.top), 0, 220)
  const bottom = clamp(mmToDot(margins.bottom), 0, 220)

  return {
    x: left,
    y: top,
    width: Math.max(360, 800 - left - right),
    height: Math.max(280, 600 - top - bottom),
  }
}

export const buildQrContent = (template, formData) =>
  JSON.stringify({
    template: template.name,
    materialCode: formData['材料编码'] || '',
    generationUnit: formData['生成单位'] || '',
    warehouse: formData['库房'] || '',
    inboundPerson: formData['入库人'] || '',
    containerNo: formData['容器号'] || '',
    inboundTime: formData['入库时间'] || '',
    remark: formData['备注'] || '',
  })

export const buildLabelPrintData = (ZPL_JSSDK, template, formData) => {
  if (!ZPL_JSSDK || !ZPL_JSSDK.Builder) {
    throw new Error('ZPL SDK 未加载')
  }

  const builder = new ZPL_JSSDK.Builder()
  const visibleFields = (template.fields || []).filter(item => item.status === '正常')
  const qrContent = formData['二维码'] || buildQrContent(template, formData)
  const bounds = getLabelBounds(template)
  const titleHeight = Math.min(90, Math.max(52, Math.round(bounds.height * 0.14)))
  const rowHeight = Math.max(40, Math.floor((bounds.height - titleHeight) / 6))
  const qrColumnWidth = Math.min(240, Math.max(170, Math.round(bounds.width * 0.3)))
  const fieldWidth = bounds.width - qrColumnWidth
  const fieldSplitX = bounds.x + Math.round(fieldWidth * 0.38)
  const qrX = bounds.x + fieldWidth
  const qrSize = clamp(mmToDot(template.qrSize && template.qrSize.width), 120, Math.max(120, qrColumnWidth - 24))
  const qrModuleSize = clamp(Math.round(qrSize / 45), 2, 10)

  builder.ZPL_StartFormat()
  builder.ZPL_SetLabelLength(600)
  builder.ZPL_SetPrintWidth(800)
  builder.ZPL_SetChangeFontEncoding(14)
  builder.ZPL_SetPrintQuantity(1, 0, 1, 'Y')
  builder.ZPL_GraphicBox(bounds.x, bounds.y, bounds.width, bounds.height, 2, 0)
  builder.ZPL_GraphicBox(bounds.x, bounds.y + titleHeight, bounds.width, 1, 2, 0)
  builder.ZPL_GraphicBox(fieldSplitX, bounds.y + titleHeight, 1, rowHeight * 6, 2, 0)
  builder.ZPL_GraphicBox(qrX, bounds.y + titleHeight, 1, rowHeight * 6, 2, 0)

  if (template.titleVisible === '显示' && template.titleStatus !== '禁用') {
    const titleSize = getFontDot(template.titleFontSize) + 12
    builder.ZPL_Text(bounds.x + Math.round(bounds.width * 0.32), bounds.y + 18, 16, 0, titleSize, titleSize, template.title || '')
  }

  Array.from({ length: 6 }).forEach((_, index) => {
    const y = bounds.y + titleHeight + rowHeight * (index + 1)
    builder.ZPL_GraphicBox(bounds.x, y, fieldWidth, 1, 1, 0)
  })

  visibleFields.slice(0, 6).forEach((field, index) => {
    const y = bounds.y + titleHeight + 18 + index * rowHeight
    const fontSize = getFontDot(field.fontSize)
    const valueKey = fieldValueMap[field.key]
    builder.ZPL_Text(bounds.x + 20, y, 16, 0, fontSize, fontSize, field.name || '')
    builder.ZPL_Text_Block(fieldSplitX + 10, y, 16, 0, fontSize, fontSize, Math.max(100, qrX - fieldSplitX - 20), rowHeight - 12, formData[valueKey] || '')
  })

  if (template.qrVisible === '显示') {
    builder.ZPL_QRCode(qrX + Math.max(10, Math.round((qrColumnWidth - qrSize) / 2)), bounds.y + titleHeight + 34, 0, 2, qrModuleSize, 'M', 'A', 'A', qrContent)
  }

  if (formData['材料编码']) {
    builder.ZPL_BarCode128(qrX + 12, bounds.y + bounds.height - 95, 0, 2, 60, 'Y', 'Y', 'Y', 'A', formData['材料编码'])
  }

  builder.ZPL_EndFormat()
  return builder.getPrintData()
}
