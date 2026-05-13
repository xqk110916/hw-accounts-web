const TEMPLATE_KEY = 'labelTemplate.templates'
const RECORD_KEY = 'labelTemplate.records'

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

const readJson = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch (e) {
    return fallback
  }
}

const writeJson = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value))
}

const clone = data => JSON.parse(JSON.stringify(data))

export const getTemplates = () => {
  const templates = readJson(TEMPLATE_KEY, null)
  if (Array.isArray(templates) && templates.length) return templates
  const defaultTemplate = createDefaultTemplate('模板1')
  writeJson(TEMPLATE_KEY, [defaultTemplate])
  return [defaultTemplate]
}

export const getTemplateByIdOrName = value => {
  const templates = getTemplates()
  return templates.find(item => item.id === value || item.name === value) || templates[0]
}

export const saveTemplate = template => {
  const templates = getTemplates()
  const nextTemplate = { ...clone(template), id: template.id || `tpl_${Date.now()}` }
  const index = templates.findIndex(item => item.id === nextTemplate.id || item.name === nextTemplate.name)
  if (index > -1) {
    templates.splice(index, 1, nextTemplate)
  } else {
    templates.push(nextTemplate)
  }
  writeJson(TEMPLATE_KEY, templates)
  return nextTemplate
}

export const createTemplateFrom = (name, source) => {
  const template = clone(source || getTemplates()[0])
  template.id = `tpl_${Date.now()}`
  template.name = name
  return saveTemplate(template)
}

export const getTemplateOptions = () => getTemplates().map(item => ({ label: item.name, value: item.id }))

export const getRecords = () => readJson(RECORD_KEY, [])

export const saveRecord = record => {
  const records = getRecords()
  const nextRecord = { ...clone(record), id: record.id || `record_${Date.now()}` }
  const index = records.findIndex(item => item.id === nextRecord.id)
  if (index > -1) {
    records.splice(index, 1, nextRecord)
  } else {
    records.unshift(nextRecord)
  }
  writeJson(RECORD_KEY, records)
  return nextRecord
}

export const deleteRecord = id => {
  const records = getRecords().filter(item => item.id !== id)
  writeJson(RECORD_KEY, records)
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
