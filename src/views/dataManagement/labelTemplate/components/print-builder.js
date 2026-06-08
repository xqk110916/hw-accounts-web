import { getPrinterConfig } from './storage'

// 字号映射（基准值，会乘以 DPI 缩放系数）
const fontDotMap = {
  '12号': 20,
  '14号': 22,
  '16号': 24,
  '18号': 28,
  '22号': 36,
  '24号': 40,
  '26号': 44,
}

const getFontDot = value => fontDotMap[value] || 24

/**
 * mm 转 dot
 */
const mmToDot = (value, dpi) => {
  const size = Number.parseFloat(String(value || '').replace('mm', ''))
  const dotsPerMm = dpi / 25.4
  return Number.isFinite(size) ? Math.round(size * dotsPerMm) : 0
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

// 安全占位符：不含任何特殊字符，SDK 内部 JSON 拼接不会破坏结构
const QR_PLACEHOLDER = '__ZPL_QR_DATA__'

/**
 * 构建二维码 JSON 数据（用户期望的扫描结果格式）
 */
export const buildQrContent = (template, formData) => {
  const fields = (template.fields || []).map(field => ({
    fileValue: field.fileValue || '',
    fileName: field.name || '',
    value: formData[field.key] || '',
  }))
  return JSON.stringify(fields)
}

/**
 * 获取打印内容区域边界（dot）
 */
const getLabelBounds = (template, dpi, labelWidthMm, labelHeightMm) => {
  const labelW = Math.round(labelWidthMm * dpi / 25.4)
  const labelH = Math.round(labelHeightMm * dpi / 25.4)
  const margins = template.margins || {}
  const left = clamp(mmToDot(margins.left, dpi), 0, Math.round(labelW * 0.4))
  const right = clamp(mmToDot(margins.right, dpi), 0, Math.round(labelW * 0.4))
  const top = clamp(mmToDot(margins.top, dpi), 0, Math.round(labelH * 0.4))
  const bottom = clamp(mmToDot(margins.bottom, dpi), 0, Math.round(labelH * 0.4))

  const contentWidth = Math.max(Math.round(labelW * 0.45), labelW - left - right)
  const contentHeight = Math.max(Math.round(labelH * 0.45), labelH - top - bottom)

  return {
    // 内容区域在标签上水平+垂直居中
    x: Math.round((labelW - contentWidth) / 2),
    y: Math.round((labelH - contentHeight) / 2),
    width: contentWidth,
    height: contentHeight,
    labelW,
    labelH,
  }
}

/**
 * 将占位符替换为正确转义的 JSON 数据
 * SDK 的 getPrintData() 输出中占位符被包在双引号内："__ZPL_QR_DATA__"
 * JSON.stringify(jsonString) 会将字符串中的 " { } 正确转义为 \" \{ \}
 */
const injectQrData = (printData, qrJsonData) => {
  return printData.replace(`"${QR_PLACEHOLDER}"`, JSON.stringify(qrJsonData))
}

export const buildLabelPrintData = (ZPL_JSSDK, template, formData) => {
  if (!ZPL_JSSDK || !ZPL_JSSDK.Builder) {
    throw new Error('ZPL SDK 未加载')
  }

  const config = getPrinterConfig()
  const dpi = Number(config.dpi) || 203
  const labelWidthMm = Number(config.labelWidth) || 100
  const labelHeightMm = Number(config.labelHeight) || 75

  const builder = new ZPL_JSSDK.Builder()
  const visibleFields = (template.fields || []).filter(item => item.status === 'normal')
  const fieldCount = Math.max(visibleFields.length, 1)
  const qrJsonData = buildQrContent(template, formData)
  const bounds = getLabelBounds(template, dpi, labelWidthMm, labelHeightMm)

  // 标题行高度
  const titleHeight = Math.round(bounds.height * 0.12)

  // 文字区域 60%，二维码区域 40%
  const qrColumnWidth = Math.round(bounds.width * 0.4)
  const fieldWidth = bounds.width - qrColumnWidth

  // 字段标签/值 分隔线 X 位置（字段区 38%）
  const fieldSplitX = bounds.x + Math.round(fieldWidth * 0.38)
  // 二维码区起始 X
  const qrX = bounds.x + fieldWidth

  // 行高：去掉标题后平均分配
  const rowHeight = Math.max(Math.round(dpi / 25.4 * 4), Math.floor((bounds.height - titleHeight) / fieldCount))

  // 字体缩放：基准 3 倍
  const fontScale = 3
  const scaleFont = baseDot => Math.round(baseDot * fontScale)

  // 二维码尺寸：固定 20mm × 20mm
  const qrSizeDot = mmToDot('20mm', dpi)
  const qrModuleSize = 6

  builder.ZPL_StartFormat()
  builder.ZPL_SetLabelLength(bounds.labelH)
  builder.ZPL_SetPrintWidth(bounds.labelW)
  builder.ZPL_SetChangeFontEncoding(14)
  builder.ZPL_SetPrintQuantity(1, 0, 1, 'Y')

  // 外框
  builder.ZPL_GraphicBox(bounds.x, bounds.y, bounds.width, bounds.height, 2, 0)
  // 标题行分隔线
  builder.ZPL_GraphicBox(bounds.x, bounds.y + titleHeight, bounds.width, 1, 2, 0)
  // 字段标签/值 竖线
  builder.ZPL_GraphicBox(fieldSplitX, bounds.y + titleHeight, 1, rowHeight * fieldCount, 2, 0)
  // 二维码区 竖线
  builder.ZPL_GraphicBox(qrX, bounds.y + titleHeight, 1, rowHeight * fieldCount, 2, 0)

  // 标题：水平 + 垂直居中（ZPL_Text_BlockEx align=1 居中）
  if (template.titleVisible === 'visible' && template.titleStatus !== 'disabled') {
    const titleFontSize = scaleFont(getFontDot(template.titleFontSize))
    const titleText = template.title || ''
    const titleY = bounds.y + Math.round((titleHeight - titleFontSize) / 2)
    const titleBold = template.titleStatus === 'bold'
    builder.ZPL_Text_BlockEx(
      bounds.x, titleY, 16, 0, titleFontSize, titleFontSize,
      bounds.width, 1, 1, 0, 0, titleText
    )
    // 加粗：偏移 1 dot 再打印一次
    if (titleBold) {
      builder.ZPL_Text_BlockEx(
        bounds.x + 1, titleY, 16, 0, titleFontSize, titleFontSize,
        bounds.width, 1, 1, 0, 0, titleText
      )
    }
  }

  // 字段行横线
  Array.from({ length: fieldCount }).forEach((_, index) => {
    const y = bounds.y + titleHeight + rowHeight * (index + 1)
    builder.ZPL_GraphicBox(bounds.x, y, fieldWidth, 1, 1, 0)
  })

  // 字段名和值（字号放大 3 倍，垂直居中）
  visibleFields.forEach((field, index) => {
    const fontSize = scaleFont(getFontDot(field.fontSize))
    const fieldBold = field.status === 'bold'
    // 垂直居中：行内 (rowHeight - fontSize) / 2
    const rowY = bounds.y + titleHeight + index * rowHeight
    const centerY = rowY + Math.round((rowHeight - fontSize) / 2)
    builder.ZPL_Text(bounds.x + Math.round(dpi / 25.4 * 2), centerY, 16, 0, fontSize, fontSize, field.name || '')
    builder.ZPL_Text_Block(
      fieldSplitX + Math.round(dpi / 25.4 * 1.5),
      centerY, 16, 0, fontSize, fontSize,
      Math.max(100, qrX - fieldSplitX - Math.round(dpi / 25.4 * 3)),
      rowHeight - Math.round(dpi / 25.4 * 2),
      formData[field.key] || ''
    )
    // 加粗：偏移 1 dot 再打印一次
    if (fieldBold) {
      builder.ZPL_Text(bounds.x + Math.round(dpi / 25.4 * 2) + 1, centerY, 16, 0, fontSize, fontSize, field.name || '')
      builder.ZPL_Text_Block(
        fieldSplitX + Math.round(dpi / 25.4 * 1.5) + 1,
        centerY, 16, 0, fontSize, fontSize,
        Math.max(100, qrX - fieldSplitX - Math.round(dpi / 25.4 * 3)),
        rowHeight - Math.round(dpi / 25.4 * 2),
        formData[field.key] || ''
      )
    }
  })

  // 二维码：自适应大小，在右侧 40% 区域内水平+垂直居中
  if (template.qrVisible === 'visible') {
    const qrAreaX = qrX
    const qrAreaY = bounds.y + titleHeight
    const qrAreaW = qrColumnWidth
    const qrAreaH = bounds.height - titleHeight

    // 根据内容长度估算二维码版本和模块数（QR Version V → 4V+17 模块/边）
    const contentLen = (qrJsonData || '').length
    const estimatedVersion = Math.min(20, Math.max(3, Math.ceil((contentLen + 10) / 14)))
    const estimatedModules = 4 * estimatedVersion + 17

    // 自适应模块大小，再放大 1.3 倍
    const maxQrSpace = Math.round(Math.min(qrAreaW, qrAreaH) * 0.85)
    const adaptiveModuleSize = Math.max(2, Math.floor(maxQrSpace / estimatedModules * 1.3))

    // 估算实际二维码像素尺寸
    const estimatedQrPixels = adaptiveModuleSize * estimatedModules

    // 用右侧区域中心点定位，补偿估算偏差向右偏移
    const centerX = qrAreaX + Math.round(qrAreaW / 2)
    const centerY = qrAreaY + Math.round(qrAreaH / 2)
    const qrXOffset = centerX - Math.round(estimatedQrPixels / 2) + Math.round(adaptiveModuleSize * 12)
    const qrYOffset = centerY - Math.round(estimatedQrPixels / 2) + Math.round(adaptiveModuleSize * 4)

    // 传安全占位符给 SDK，避免 JSON 中的 " { } 破坏 SDK 内部 JSON 拼接
    builder.ZPL_QRCode(qrXOffset, qrYOffset, 0, 2, adaptiveModuleSize, 'M', 'A', 'A', QR_PLACEHOLDER)
  }

  builder.ZPL_EndFormat()
  // getPrintData() 后替换占位符为正确转义的 JSON 数据
  return injectQrData(builder.getPrintData(), qrJsonData)
}

/**
 * 单独打印二维码：在标签上居中打印一个 20mm × 20mm 的二维码
 */
export const buildQrOnlyPrintData = (ZPL_JSSDK, template, formData) => {
  if (!ZPL_JSSDK || !ZPL_JSSDK.Builder) {
    throw new Error('ZPL SDK 未加载')
  }

  const config = getPrinterConfig()
  const dpi = Number(config.dpi) || 203
  const labelWidthMm = Number(config.labelWidth) || 100
  const labelHeightMm = Number(config.labelHeight) || 75
  const labelW = Math.round(labelWidthMm * dpi / 25.4)
  const labelH = Math.round(labelHeightMm * dpi / 25.4)

  const qrJsonData = buildQrContent(template, formData)
  const qrSizeDot = mmToDot('20mm', dpi)
  const qrModuleSize = 6

  const builder = new ZPL_JSSDK.Builder()
  builder.ZPL_StartFormat()
  builder.ZPL_SetLabelLength(labelH)
  builder.ZPL_SetPrintWidth(labelW)
  builder.ZPL_SetChangeFontEncoding(14)
  builder.ZPL_SetPrintQuantity(1, 0, 1, 'Y')

  // 二维码在标签上水平+垂直居中，传安全占位符
  const qrX = Math.round((labelW - qrSizeDot) / 2)
  const qrY = Math.round((labelH - qrSizeDot) / 2)
  builder.ZPL_QRCode(qrX, qrY, 0, 2, qrModuleSize, 'M', 'A', 'A', QR_PLACEHOLDER)

  builder.ZPL_EndFormat()
  return injectQrData(builder.getPrintData(), qrJsonData)
}
