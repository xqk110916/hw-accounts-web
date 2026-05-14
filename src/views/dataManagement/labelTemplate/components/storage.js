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
  { key: 'materialCode', label: '字段1', name: '材料编码', layout: 'single', fontSize: '16号', status: 'normal' },
  { key: 'generationUnit', label: '字段2', name: '生成单位', layout: 'single', fontSize: '16号', status: 'normal' },
  { key: 'warehouse', label: '字段3', name: '库房', layout: 'single', fontSize: '16号', status: 'normal' },
  { key: 'inboundPerson', label: '字段4', name: '入库人', layout: 'single', fontSize: '16号', status: 'normal' },
  { key: 'containerNo', label: '字段5', name: '容器号', layout: 'single', fontSize: '16号', status: 'normal' },
  { key: 'inboundTime', label: '字段6', name: '入库时间', layout: 'single', fontSize: '16号', status: 'normal' },
]

export const createDefaultTemplate = (name = '模板1') => ({
  id: `tpl_${Date.now()}`,
  name,
  title: '材料管理卡',
  titleVisible: 'visible',
  titleFontSize: '16号',
  titleStatus: 'normal',
  fields: defaultFields.map(item => ({ ...item })),
  qrSize: { width: '50mm', height: '50mm' },
  qrVisible: 'visible',
  margins: {
    top: '10mm',
    bottom: '10mm',
    left: '10mm',
    right: '10mm',
  },
})

const clone = data => JSON.parse(JSON.stringify(data))

const yesValues = ['true', '1', 'visible', '显示', true, 1]

const toVisibleValue = value => (value === undefined || value === null || value === '' || yesValues.includes(value) ? 'visible' : 'hidden')

const toBooleanText = value => (['visible', 'normal', 'bold', '显示', '正常', '加粗'].includes(value) ? 'true' : 'false')

const normalizeLayout = value => {
  if (value === 'double' || value === '双排') return 'double'
  return 'single'
}

const toBackendLayout = value => (normalizeLayout(value) === 'double' ? '双排' : '单排')

const normalizeFieldStatus = value => {
  if (value === 'hidden' || value === '隐藏') return 'hidden'
  if (value === 'disabled' || value === '禁用') return 'disabled'
  return 'normal'
}

const toBackendFieldStatus = value => {
  const normalized = normalizeFieldStatus(value)
  if (normalized === 'hidden') return '隐藏'
  if (normalized === 'disabled') return '禁用'
  return '正常'
}

const normalizeTitleStatus = value => {
  if (value === true || value === 1 || value === 'true' || value === 'bold' || value === '加粗') return 'bold'
  if (value === 'disabled' || value === '禁用') return 'disabled'
  return 'normal'
}

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

const withDefault = (value, fallback) => (value === undefined || value === null || value === '' ? fallback : value)

export const backendToTemplate = data => {
  const source = data || {}
  const fields = Array.isArray(source.fieldsConfig) ? [...source.fieldsConfig] : []
  fields.sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
  return {
    id: source.id,
    name: withDefault(source.templateName, '模板1'),
    title: withDefault(source.title, '材料管理卡'),
    titleVisible: toVisibleValue(source.titleShow),
    titleFontSize: ensureFontSize(source.titleSize),
    titleStatus: readBoolean(source.titleBold) ? 'bold' : normalizeTitleStatus(source.titleStatus),
    fields: (fields.length ? fields : defaultFields).map((item, index) => ({
      key: defaultFields[index] ? defaultFields[index].key : `customField${index + 1}`,
      label: `字段${index + 1}`,
      name: item.fileName,
      layout: normalizeLayout(item.rowSet),
      fontSize: ensureFontSize(item.fontSize),
      status: normalizeFieldStatus(item.status),
    })),
    qrSize: {
      width: ensureMm(withDefault(source.codeWidth, 50)),
      height: ensureMm(withDefault(source.codeHeight, 50)),
    },
    qrVisible: toVisibleValue(source.codeShow),
    margins: {
      top: ensureMm(withDefault(source.marginTop, 10)),
      bottom: ensureMm(withDefault(source.marginBottom, 10)),
      left: ensureMm(withDefault(source.marginLeft, 10)),
      right: ensureMm(withDefault(source.marginRight, 10)),
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
    titleBold: source.titleStatus === 'bold' ? 'true' : 'false',
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
      fontBold: item.status === 'bold' ? 'true' : 'false',
      rowSet: toBackendLayout(item.layout),
      status: toBackendFieldStatus(item.status),
      sortOrder: index + 1,
    })),
  }
}

export const templateListToOptions = list =>
  (Array.isArray(list) ? list : []).map(item => ({
    label: item.templateName,
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
    materialCode: fieldMap.materialCode,
    generationUnit: fieldMap.generationUnit,
    warehouse: fieldMap.warehouse,
    inboundPerson: fieldMap.inboundPerson,
    containerNo: fieldMap.containerNo,
    inboundTime: fieldMap.inboundTime,
    qrContent: source.qrcodeBase64,
  }
}

export const buildLabelDataPayload = (template, formData, id) => {
  const source = template || {}
  const fieldValueMap = {
    materialCode: formData.materialCode,
    generationUnit: formData.generationUnit,
    warehouse: formData.warehouse,
    inboundPerson: formData.inboundPerson,
    containerNo: formData.containerNo,
    inboundTime: formData.inboundTime,
  }
  const payload = {
    templateId: source.id,
    templateName: source.name,
    qrcodeBase64: formData.qrContent,
    remark: formData.remark,
    dataJson: (source.fields || []).map((item, index) => ({
      fileName: item.name,
      value: fieldValueMap[item.key] || '',
      fontSize: stripUnit(item.fontSize),
      fontBold: item.status === 'bold' ? 'true' : 'false',
      rowSet: toBackendLayout(item.layout),
      status: toBackendFieldStatus(item.status),
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
  templateId: template.id,
  title: template.title,
  titleVisible: template.titleVisible,
  titleFontSize: template.titleFontSize,
  titleStatus: template.titleStatus,
  qrSize: `${template.qrSize.width}×${template.qrSize.height}`,
  qrVisible: template.qrVisible,
  marginTop: template.margins.top,
  marginBottom: template.margins.bottom,
  marginLeft: template.margins.left,
  marginRight: template.margins.right,
})

export const formToTemplate = (form, fields, currentTemplate) => ({
  id: currentTemplate && currentTemplate.id,
  name: currentTemplate && currentTemplate.name ? currentTemplate.name : form.templateId,
  title: form.title,
  titleVisible: form.titleVisible,
  titleFontSize: form.titleFontSize,
  titleStatus: form.titleStatus,
  fields: fields.map((item, index) => ({
    key: item.key,
    label: item.label,
    name: item.value,
    layout: item.layout,
    fontSize: item.fontSize,
    status: item.status,
  })),
  qrSize: {
    width: form.qrSize.split('×')[0],
    height: form.qrSize.split('×')[1],
  },
  qrVisible: form.qrVisible,
  margins: {
    top: form.marginTop,
    bottom: form.marginBottom,
    left: form.marginLeft,
    right: form.marginRight,
  },
})

export const templateToFields = template =>
  template.fields.map((item, index) => ({
    id: index + 1,
    key: item.key,
    label: item.label || `字段${index + 1}`,
    value: item.name,
    layout: item.layout,
    fontSize: item.fontSize,
    status: item.status,
  }))
