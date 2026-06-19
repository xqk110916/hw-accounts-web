import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

/**
 * 报表表单模板字段 → Excel 单元格映射配置
 */
const CELL_MAPS = {
  R01: {
    securityLevel:    'C1',
    // 发方信息
    senderUnitName:   'F4',
    senderUnitCode:   'F5',
    senderLicenseNo:  'H5',
    sendDate:         'D6',
    sendLocation:     'D7',
    // 收方信息
    receiverUnitName:  'M4',
    receiverUnitCode:  'M5',
    receiverLicenseNo: 'O5',
    receiveDate:       'K6',
    receiveLocation:   'K7',
    // 报表信息
    reportNo:          'F12',
    postUnit:          'M12',
    // 制表人
    senderTabulator:   'E16',
    receiverMaker:     'O16',
  },
  R03: {
    securityLevel: 'C1',
    reportNo: 'C5',
    unitName: 'C6',
    unitCode: 'C7',
    licenseNo: 'C8',
    yearQuarterRange: 'C9',
    actualDateRange: 'C10',
    formNo: 'C3',
    format: 'G3',
    responsiblePerson: 'G5',
    maker: 'G6',
    approvalOrg: 'C12',
    approvalNo: 'F12',
    makeOrg: 'I12',
  },
  R04: {
    securityLevel: 'C1',
    reportNo: 'C5',
    unitName: 'C6',
    unitCode: 'C7',
    licenseNo: 'C8',
    bookInventoryDate: 'C9',
    actualDate: 'C10',
    formNo: 'C3',
    format: 'G3',
    responsiblePerson: 'G5',
    maker: 'G6',
    approvalOrg: 'C12',
    approvalNo: 'F12',
    makeOrg: 'I12',
  },
  R05: {
    securityLevel: 'C1',
    reportNo: 'C5',
    unitName: 'C6',
    unitCode: 'C7',
    licenseNo: 'C8',
    yearQuarterRange: 'C9',
    actualDateRange: 'C10',
    formNo: 'C3',
    format: 'G3',
    responsiblePerson: 'G5',
    maker: 'G6',
    approvalOrg: 'C12',
    approvalNo: 'F12',
    makeOrg: 'I12',
  },
  R06: {
    securityLevel: 'C1',
    reportNo: 'C5',
    unitName: 'C6',
    unitCode: 'C7',
    licenseNo: 'C8',
    reportDate: 'C9',
    formNo: 'C3',
    format: 'G3',
    responsiblePerson: 'G5',
    maker: 'G6',
    approvalOrg: 'C11',
    approvalNo: 'F11',
    makeOrg: 'I11',
  },
  R08: {
    securityLevel: 'C1',
    reportNo: 'C5',
    unitName: 'C6',
    unitCode: 'C7',
    licenseNo: 'C8',
    yearQuarterRange: 'C9',
    actualDateRange: 'C10',
    formNo: 'C3',
    format: 'G3',
    responsiblePerson: 'G5',
    maker: 'G6',
    approvalOrg: 'C12',
    approvalNo: 'F12',
    makeOrg: 'I12',
  },
  R09: {
    securityLevel: 'C1',
    reportNo: 'C5',
    unitName: 'C6',
    unitCode: 'C7',
    licenseNo: 'C8',
    yearQuarterRange: 'C9',
    actualDateRange: 'C10',
    formNo: 'C3',
    format: 'G3',
    responsiblePerson: 'G5',
    maker: 'G6',
    approvalOrg: 'C12',
    approvalNo: 'F12',
    makeOrg: 'I12',
  }
}

/**
 * 可选覆盖字段（仅当界面有值时才覆盖模板默认值）
 */
const OPTIONAL_CELL_MAPS = {
  R01: {
    formNo:  'D3',
    format:  'N3',
  }
}

const REPORT_NAMES = {
  R01: '材料交接统计报表',
  R03: '材料库存变化统计报表',
  R04: '材料实际库存统计报表',
  R05: '材料账目报表',
  R06: '材料注释统计报表',
  R08: '材料库存变化综合统计表',
  R09: '材料库存变化综合统计表',
}

/**
 * 将界面表单数据填充到 Excel 模板并触发下载
 * @param {String} reportType - 报表类型 (如 'R01', 'R03')
 * @param {Object} templateData - 报表界面的 templateData 对象
 * @param {Array} securityOptions - 密级字典列表，用于翻译密级值
 */
export async function exportReportWithTemplate(reportType, templateData = {}, securityOptions = []) {
  const actualTemplateType = ['R05', 'R08', 'R09'].includes(reportType) ? 'R03' : reportType
  const templateUrl = `${process.env.BASE_URL || '/'}templates/${actualTemplateType}-表单.xlsx`
  const response = await fetch(templateUrl)
  if (!response.ok) throw new Error(`模板文件加载失败: ${response.status}`)
  const arrayBuffer = await response.arrayBuffer()

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(arrayBuffer)
  const worksheet = workbook.getWorksheet('Sheet1') || workbook.worksheets[0]

  const cellMap = CELL_MAPS[reportType] || {}
  
  // 翻译密级等可能的字段
  const dataToExport = { ...templateData }
  if (dataToExport.securityLevel && securityOptions && securityOptions.length > 0) {
    const opt = securityOptions.find(o => String(o.value) === String(dataToExport.securityLevel))
    if (opt) {
      dataToExport.securityLevel = opt.label
    }
  }

  // 针对起止年季和实际日期的 Start / End 进行提取、拼接并填充到对应的映射字段上
  if (['R03', 'R05', 'R08', 'R09'].includes(reportType)) {
    const formatMonth = (val) => {
      if (!val) return ''
      return typeof val === 'string' && val.length > 7 ? val.substring(0, 7) : val
    }
    const formatDate = (val) => {
      if (!val) return ''
      return typeof val === 'string' && val.length > 10 ? val.substring(0, 10) : val
    }
    
    const startYQ = formatMonth(dataToExport.yearQuarterRangeStart)
    const endYQ = formatMonth(dataToExport.yearQuarterRangeEnd)
    if (startYQ || endYQ) {
      dataToExport.yearQuarterRange = [startYQ, endYQ]
    }

    const startAD = formatDate(dataToExport.actualDateRangeStart)
    const endAD = formatDate(dataToExport.actualDateRangeEnd)
    if (startAD || endAD) {
      dataToExport.actualDateRange = [startAD, endAD]
    }
  }

  for (const [field, cell] of Object.entries(cellMap)) {
    let value = dataToExport[field]
    
    if (reportType === 'R01' && field === 'senderTabulator') {
      value = value || dataToExport.senderMaker || ''
    }

    const formatDateOnly = (val) => {
      if (!val) return ''
      if (typeof val === 'string') {
        if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
          return val.slice(0, 10)
        }
        return val
      }
      if (val instanceof Date) {
        const year = val.getFullYear()
        const month = String(val.getMonth() + 1).padStart(2, '0')
        const day = String(val.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      return val
    }

    if (value && !Array.isArray(value) && (field.toLowerCase().includes('date') || field.toLowerCase().includes('time'))) {
      value = formatDateOnly(value)
    }

    if (['R03', 'R05', 'R08', 'R09'].includes(reportType) && (field === 'yearQuarterRange' || field === 'actualDateRange')) {
      if (Array.isArray(value) && value.length === 2) {
        const start = value[0] || ''
        const end = value[1] || ''
        if (start || end) {
          value = `起：${start}   止：${end}`
        } else {
          value = ''
        }
      } else if (typeof value === 'string' && value.startsWith('起：')) {
        // Keep string if already formatted
      } else {
        value = ''
      }
    }

    if (value !== undefined && value !== null) {
      worksheet.getCell(cell).value = value
    }
  }

  const optionalMap = OPTIONAL_CELL_MAPS[reportType] || {}
  for (const [field, cell] of Object.entries(optionalMap)) {
    const value = dataToExport[field]
    if (value) {
      worksheet.getCell(cell).value = value
    }
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  
  const reportName = REPORT_NAMES[reportType] || ''
  const fileName = `${reportType}${reportName}_${dataToExport.reportNo || new Date().toISOString().slice(0, 10)}.xlsx`
  saveAs(blob, fileName)
}
