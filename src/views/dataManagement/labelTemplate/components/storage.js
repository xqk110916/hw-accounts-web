export const defaultPrinterConfig = {
  serviceIp: '127.0.0.1',
  servicePort: 9099,
  model: 'HT300',
  interfaceType: 'USB',
  sn: '',
  netIp: '',
  netPort: 9100,
  comData: {
    port: 'COM1',
    baudrate: 115200,
    party: 'n',
    databit: 8,
    stopbit: 1,
    ctl: 'n',
  },
}

const defaultFields = [
  { key: 'materialCode', label: '字段1', name: '材料编码', layout: '单排', fontSize: '16号', status: '正常' },
  { key: 'generationUnit', label: '字段2', name: '生成单位', layout: '单排', fontSize: '16号', status: '正常' },
  { key: 'warehouse', label: '字段3', name: '库房', layout: '单排', fontSize: '16号', status: '正常' },
  { key: 'inboundPerson', label: '字段4', name: '入库人', layout: '单排', fontSize: '16号', status: '正常' },
  { key: 'containerNo', label: '字段5', name: '容器号', layout: '单排', fontSize: '16号', status: '正常' },
  { key: 'inboundTime', label: '字段6', name: '入库时间', layout: '单排', fontSize: '16号', status: '正常' },
]

export const createDefaultTemplate = (name = '模板1') => ({
  id: `tpl_${Date.now()}`,
  name,
  title: '材料管理卡',
  titleVisible: '显示',
  titleFontSize: '16号',
  titleStatus: '正常',
  fields: defaultFields.map(item => ({ ...item })),
  qrSize: { width: '50mm', height: '50mm' },
  qrVisible: '显示',
  margins: {
    top: '10mm',
    bottom: '10mm',
    left: '10mm',
    right: '10mm',
  },
})

const clone = data => JSON.parse(JSON.stringify(data))

const yesValues = ['true', '1', '显示', true, 1]

const toVisibleText = value => (value === undefined || value === null || value === '' || yesValues.includes(value) ? '显示' : '隐藏')

const toBooleanText = value => (value === '显示' || value === '正常' || value === '加粗' ? 'true' : 'false')

const stripUnit = value => {
  const size = Number.parseFloat(String(value || '').replace(/[^\d.]/g, ''))
  return Number.isFinite(size) ? String(size) : ''
}

const ensureMm = value => {
  const size = stripUnit(value)
  return size ? `${size}mm` : '0mm'
}

const ensureFontSize = value => {
  const size = stripUnit(value)
  return size ? `${size}号` : '16号'
}

const readBoolean = value => yesValues.includes(value)

export const backendToTemplate = data => {
  const source = data || {}
  const fields = Array.isArray(source.fieldsConfig) ? [...source.fieldsConfig] : []
  fields.sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
  return {
    id: source.id,
    name: source.templateName || source.name || '模板1',
    title: source.title || '材料管理卡',
    titleVisible: toVisibleText(source.titleShow),
    titleFontSize: ensureFontSize(source.titleSize),
    titleStatus: readBoolean(source.titleBold) ? '加粗' : '正常',
    fields: (fields.length ? fields : defaultFields).map((item, index) => ({
      key: item.key || (defaultFields[index] && defaultFields[index].key) || `customField${index + 1}`,
      label: item.label || `字段${index + 1}`,
      name: item.fileName || item.name || item.value || '',
      layout: item.rowSet || item.layout || '单排',
      fontSize: ensureFontSize(item.fontSize),
      status: item.status || '正常',
    })),
    qrSize: {
      width: ensureMm(source.codeWidth || 50),
      height: ensureMm(source.codeHeight || 50),
    },
    qrVisible: toVisibleText(source.codeShow),
    margins: {
      top: ensureMm(source.marginTop || 10),
      bottom: ensureMm(source.marginBottom || 10),
      left: ensureMm(source.marginLeft || 10),
      right: ensureMm(source.marginRight || 10),
    },
  }
}

export const templateToBackend = template => {
  const source = template || createDefaultTemplate()
  return {
    id: source.id,
    templateName: source.name,
    title: source.title,
    titleShow: toBooleanText(source.titleVisible),
    titleSize: stripUnit(source.titleFontSize),
    titleBold: source.titleStatus === '加粗' ? 'true' : 'false',
    codeShow: toBooleanText(source.qrVisible),
    codeWidth: stripUnit(source.qrSize && source.qrSize.width),
    codeHeight: Number(stripUnit(source.qrSize && source.qrSize.height) || 0),
    marginLeft: Number(stripUnit(source.margins && source.margins.left) || 0),
    marginTop: Number(stripUnit(source.margins && source.margins.top) || 0),
    marginRight: Number(stripUnit(source.margins && source.margins.right) || 0),
    marginBottom: Number(stripUnit(source.margins && source.margins.bottom) || 0),
    fieldsConfig: (source.fields || []).map((item, index) => ({
      fileName: item.name,
      fontSize: stripUnit(item.fontSize),
      fontBold: item.status === '加粗' ? 'true' : 'false',
      rowSet: item.layout,
      sortOrder: index + 1,
    })),
  }
}

export const templateListToOptions = list =>
  (Array.isArray(list) ? list : []).map(item => ({
    label: item.templateName || item.name,
    value: item.id,
  }))

export const labelDataToRow = data => {
  const source = data || {}
  const dataJson = Array.isArray(source.dataJson) ? source.dataJson : []
  const fieldMap = dataJson.reduce((result, item, index) => {
    const key = (defaultFields[index] && defaultFields[index].key) || `customField${index + 1}`
    result[key] = item.value || ''
    return result
  }, {})
  return {
    ...source,
    printTime: source.printTime || source.createTime || '',
    labelCount: source.labelCount || 1,
    materialCode: fieldMap.materialCode || source.materialCode || '',
    generationUnit: fieldMap.generationUnit || source.generationUnit || '',
    warehouse: fieldMap.warehouse || source.warehouse || '',
    inboundPerson: fieldMap.inboundPerson || source.inboundPerson || '',
    containerNo: fieldMap.containerNo || source.containerNo || '',
    inboundTime: fieldMap.inboundTime || source.inboundTime || '',
    qrContent: source.qrcodeBase64 || source.qrContent || '',
  }
}

export const buildLabelDataPayload = (template, formData, id) => {
  const source = template || {}
  const fieldValueMap = {
    materialCode: formData['材料编码'],
    generationUnit: formData['生成单位'],
    warehouse: formData['库房'],
    inboundPerson: formData['入库人'],
    containerNo: formData['容器号'],
    inboundTime: formData['入库时间'],
  }
  const payload = {
    templateId: source.id,
    templateName: source.name,
    qrcodeBase64: formData['二维码'],
    remark: formData['备注'],
    dataJson: (source.fields || []).map((item, index) => ({
      fileName: item.name,
      value: fieldValueMap[item.key] || '',
      fontSize: stripUnit(item.fontSize),
      fontBold: item.status === '加粗' ? 'true' : 'false',
      rowSet: item.layout,
      sortOrder: index + 1,
    })),
  }
  if (id) payload.id = id
  return payload
}

export const getPrinterConfig = () => ({
  ...clone(defaultPrinterConfig),
  ...((window.globalConfig && window.globalConfig.ZPL_PRINTER_CONFIG) || window.ZPL_PRINTER_CONFIG || {}),
  comData: {
    ...defaultPrinterConfig.comData,
    ...(((window.globalConfig && window.globalConfig.ZPL_PRINTER_CONFIG) || window.ZPL_PRINTER_CONFIG || {}).comData || {}),
  },
})

export const templateToForm = template => ({
  '模板': template.id,
  '标题': template.title,
  '标题显示状态': template.titleVisible,
  '标题字号': template.titleFontSize,
  '标题状态': template.titleStatus,
  '二维码': `${template.qrSize.width}×${template.qrSize.height}`,
  '显示状态': template.qrVisible,
  '上边距': template.margins.top,
  '下边距': template.margins.bottom,
  '左边距': template.margins.left,
  '右边距': template.margins.right,
})

export const formToTemplate = (form, fields, currentTemplate) => ({
  id: currentTemplate && currentTemplate.id,
  name: currentTemplate && currentTemplate.name ? currentTemplate.name : form['模板'],
  title: form['标题'],
  titleVisible: form['标题显示状态'],
  titleFontSize: form['标题字号'],
  titleStatus: form['标题状态'],
  fields: fields.map((item, index) => ({
    key: item.key || (defaultFields[index] && defaultFields[index].key) || `customField${index + 1}`,
    label: item.label || `字段${index + 1}`,
    name: item.value,
    layout: item['排版'],
    fontSize: item['字号'],
    status: item['状态'],
  })),
  qrSize: {
    width: form['二维码'].split('×')[0],
    height: form['二维码'].split('×')[1],
  },
  qrVisible: form['显示状态'],
  margins: {
    top: form['上边距'],
    bottom: form['下边距'],
    left: form['左边距'],
    right: form['右边距'],
  },
})

export const templateToFields = template =>
  template.fields.map((item, index) => ({
    id: index + 1,
    key: item.key,
    label: item.label || `字段${index + 1}`,
    value: item.name,
    '排版': item.layout,
    '字号': item.fontSize,
    '状态': item.status,
  }))
