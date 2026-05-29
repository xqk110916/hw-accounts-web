import * as api from './api.js'
import { reportCards, reportConfigs, templateConfigs } from './reportConfigs.js'
import { listAllMaterialCode } from '@/views/dataManagement/materialManagement/components/api.js'

export { reportCards, reportConfigs, templateConfigs } from './reportConfigs.js'

export const requestFun = {
  R01: {
    historyList: api.listR01History,
    detail: api.getR01Detail,
    export: api.exportR01,
    save: api.saveR01,
    taskList: api.listTaskForReport,
    taskDetail: api.getTaskDetailForReport,
  },
  R02: null,
  R03: {
    historyList: api.listR03History,
    detail: api.getR03Detail,
    generate: api.queryR03Data,
    export: api.exportR03,
    save: api.saveR03,
  },
  R04: {
    historyList: api.listR04History,
    detail: api.getR04Detail,
    generate: api.queryR04Data,
    export: api.exportR04,
    save: api.saveR04,
  },
  R05: {
    historyList: api.listR05History,
    detail: api.getR05Detail,
    generate: api.listR05History,
    export: api.exportR05,
    save: api.saveR05,
  },
  R06: {
    historyList: api.listR06History,
    detail: api.getR06Detail,
    generate: api.listR06History,
    export: api.exportR06,
    save: api.saveR06,
  },
  R07: null,
  R08: {
    historyList: api.listR08History,
    detail: api.getR08Detail,
    generate: api.queryR08Data,
    export: api.exportR08,
    save: api.saveR08,
  },
  R09: {
    historyList: api.listR09History,
    detail: api.getR09Detail,
    generate: api.queryR09Data,
    export: api.exportR09,
    save: api.saveR09,
  },
}

const historyProps = ['historyId', 'historyIds']

const pick = (source, fields) => {
  const data = {}
  fields.forEach(field => {
    if (source[field] !== undefined && source[field] !== null && source[field] !== '') data[field] = source[field]
  })
  return data
}

const getList = data => {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.list)) return data.list
  if (data && data.data && Array.isArray(data.data)) return data.data
  if (data && data.data && Array.isArray(data.data.list)) return data.data.list
  return []
}

const findSearchOption = (code, prop) => {
  const config = reportConfigs[code] || {}
  return (config.search || []).find(item => item.prop === prop)
}

const setSearchOptions = (vm, code, prop, options) => {
  const item = findSearchOption(code, prop)
  if (item) vm.$set(item, 'option', options)
  if (vm && vm.searchOptions) {
    vm.$set(vm.searchOptions, prop, options)
  }
}

export const isHistoryProp = prop => historyProps.indexOf(prop) > -1

export const formatDate = (date) => {
  if (!date) return ''
  if (typeof date === 'string') return date
  if (date instanceof Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  return date
}

export const buildQueryParams = (code, params = {}) => {
  const data = {}
  if (params.year) {
    if (params.year instanceof Date) {
      data.year = params.year.getFullYear()
    } else {
      data.year = params.year
    }
  }
  if (params.quarter) data.quarter = params.quarter
  if (params.dateRange && params.dateRange.length === 2) {
    data.startTime = formatDate(params.dateRange[0])
    data.endTime = formatDate(params.dateRange[1])
  }
  if (params.goodsCodes && params.goodsCodes.length) data.goodsCodes = params.goodsCodes
  if (code === 'R01' && params.type) data.type = params.type
  return data
}

export const buildTaskQueryParams = (params = {}) => {
  const data = {}
  if (params.type) data.type = params.type
  if (params.dateRange && params.dateRange.length === 2) {
    data.startTime = formatDate(params.dateRange[0])
    data.endTime = formatDate(params.dateRange[1])
  }
  return data
}

export const buildTaskDetailParams = (params = {}) => {
  const taskNums = Array.isArray(params.taskNums) ? params.taskNums : (params.taskNums ? [params.taskNums] : [])
  return {
    type: params.type,
    taskNums,
  }
}

export const toHistoryOptions = list => list.map(item => ({
  label: item.reportNo || `${item.id || ''}${item.createTime ? ` - ${item.createTime}` : ''}` || '未命名报表',
  value: item.id,
  raw: item,
})).filter(item => item.value !== undefined && item.value !== null)

export const toTaskOptions = list => list.map(item => ({
  label: `${item.taskNum || ''}${item.typeName ? ` - ${item.typeName}` : ''}${item.warehouseName ? ` - ${item.warehouseName}` : ''}`,
  value: item.taskNum,
  raw: item,
})).filter(item => item.value)

export const loadDefaultOptions = async (vm, code) => {
  const fn = requestFun[code]
  if (!fn) return

  if (fn.historyList) {
    const res = await fn.historyList().catch(() => ({ data: [] }))
    const options = toHistoryOptions(getList(res.data))
    const historyProp = code === 'R01' ? 'historyIds' : 'historyId'
    setSearchOptions(vm, code, historyProp, options)
  }

  if (code === 'R08' || code === 'R09') {
    const res = await listAllMaterialCode().catch(() => ({ data: [] }))
    const options = getList(res.data).map(item => ({
      label: `${item.goodCode || ''}${item.goodName ? ` - ${item.goodName}` : ''}`,
      value: item.goodCode,
      raw: item,
    })).filter(item => item.value)
    setSearchOptions(vm, code, 'goodsCodes', options)
  }
}

export const setTaskOptions = (vm, options) => {
  setSearchOptions(vm, 'R01', 'taskNums', options)
}

const toTemplateData = (code, report = {}) => {
  const data = { ...report }
  data.classification = report.securityLevel || report.classification || '内部'

  if (code === 'R01') {
    data.senderTabulator = report.senderMaker || report.senderTabulator || ''
  }

  if (report.startYearQuarter || report.endYearQuarter) {
    data.yearQuarterRangeStart = report.startYearQuarter || ''
    data.yearQuarterRangeEnd = report.endYearQuarter || ''
  }
  if (report.startYearSeason || report.endYearSeason) {
    data.yearQuarterRangeStart = report.startYearSeason || ''
    data.yearQuarterRangeEnd = report.endYearSeason || ''
  }
  if (report.startDate || report.endDate) {
    data.actualDateRangeStart = report.startDate || ''
    data.actualDateRangeEnd = report.endDate || ''
  }
  if (report.startActualDate || report.endActualDate) {
    data.actualDateRangeStart = report.startActualDate || ''
    data.actualDateRangeEnd = report.endActualDate || ''
  }

  return data
}

export const normalizeRowsForDisplay = (code, rows = []) => rows.map((row, index) => {
  const item = { ...row }
  if (item.containerCount !== undefined && item.itemCount === undefined) item.itemCount = item.containerCount
  if (item.itemCount !== undefined && item.itemsPerBatch === undefined) item.itemsPerBatch = item.itemCount
  if (item.batchNo !== undefined && item.batchNoCode === undefined) item.batchNoCode = item.batchNo
  if (item.remarkSymbol === undefined && item.annotation !== undefined) item.remarkSymbol = item.annotation
  if ((code === 'R03' || code === 'R04') && item.elementQuantity === undefined) item.elementQuantity = item.elementContent
  if ((code === 'R03' || code === 'R04') && item.isotopeQuantity === undefined) item.isotopeQuantity = item.isotopeContent
  if ((code === 'R08' || code === 'R09') && item.seqNo === undefined) item.seqNo = index + 1
  return item
})

export const normalizeDetailData = (code, data = {}) => {
  const detailData = data || {}
  let report = {}
  let detailList = []

  if (detailData.report || detailData.detailList) {
    report = detailData.report ? { ...detailData.report } : { ...detailData }
    detailList = detailData.detailList || []
    delete report.detailList
  }

  return {
    report: toTemplateData(code, report),
    detailList: normalizeRowsForDisplay(code, detailList),
  }
}

export const normalizeTaskDetailRows = (data = []) => {
  const taskList = getList(data)
  const rows = []
  taskList.forEach(task => {
    const goodsList = task.goodsList || []
    goodsList.forEach(goods => {
      rows.push({
        ...goods,
        type: task.type,
        typeName: task.typeName,
        inOutType: task.typeName || task.type,
        taskNum: goods.taskNum || task.taskNum,
        itemCount: goods.itemCount || goods.containerCount,
      })
    })
  })
  return normalizeRowsForDisplay('R01', rows)
}

const headerFields = {
  R01: [
    'id', 'checker', 'debitPost', 'debitPostDate', 'debitReturn', 'debitReturnDate',
    'formNo', 'format', 'inOutType', 'receiveDate', 'receiveLocation', 'receiver',
    'receiverLicenseNo', 'receiverMaker', 'receiverSignDate', 'receiverUnitCode',
    'receiverUnitName', 'reportNo', 'securityLevel', 'sendDate', 'sendLocation',
    'sendRemain1', 'sendRemain1Date', 'sendRemain3', 'sendRemain3Date',
    'sendRemainPost', 'sendRemainPostDate', 'sender', 'senderLicenseNo',
    'senderMaker', 'senderSignDate', 'senderUnitCode', 'senderUnitName',
    'taskNum', 'verifier',
  ],
  R03: [
    'id', 'approvalNo', 'approvalOrg', 'endDate', 'endYearQuarter', 'formNo',
    'format', 'leaderSign', 'licenseNo', 'makeOrg', 'maker', 'reportNo',
    'responsiblePerson', 'securityLevel', 'startDate', 'startYearQuarter',
    'unitCode', 'unitName',
  ],
  R04: [
    'id', 'actualDate', 'approvalNo', 'approvalOrg', 'bookInventoryDate',
    'formNo', 'format', 'leaderSign', 'licenseNo', 'makeOrg', 'maker',
    'reportNo', 'responsiblePerson', 'securityLevel', 'unitCode', 'unitName',
  ],
  R05: [
    'id', 'approvalNo', 'approvalOrg', 'endActualDate', 'endYearQuarter',
    'formNo', 'format', 'leaderSign', 'licenseNo', 'makeOrg', 'maker',
    'reportNo', 'responsiblePerson', 'securityLevel', 'startActualDate',
    'startYearQuarter', 'unitCode', 'unitName',
  ],
  R06: [
    'id', 'approvalNo', 'approvalOrg', 'formNo', 'format', 'leaderSign',
    'licenseNo', 'makeOrg', 'maker', 'reportDate', 'reportNo',
    'responsiblePerson', 'securityLevel', 'unitCode', 'unitName',
  ],
  R08: [
    'id', 'approvalNo', 'approvalOrg', 'endDate', 'endYearSeason', 'formNo',
    'format', 'leaderSign', 'licenseNo', 'makeOrg', 'maker', 'reportNo',
    'responsiblePerson', 'securityLevel', 'startDate', 'startYearSeason',
    'unitCode', 'unitName',
  ],
  R09: [
    'id', 'approvalNo', 'approvalOrg', 'endDate', 'endYearSeason', 'formNo',
    'format', 'leaderSign', 'licenseNo', 'makeOrg', 'maker', 'reportNo',
    'responsiblePerson', 'securityLevel', 'startDate', 'startYearSeason',
    'unitCode', 'unitName',
  ],
}

const detailFields = {
  R01: [
    'id', 'containerCode', 'elementCode', 'elementPercentage', 'elementQuantity',
    'goodsCode', 'grossWeight', 'isotopeCode', 'isotopePercentage',
    'isotopeQuantity', 'itemCount', 'materialCategory', 'materialTypeCode',
    'measurePointCode', 'measureStatus', 'netWeight', 'remarkSymbol',
    'tareWeight', 'taskNum', 'weightUnit',
  ],
  R03: [
    'id', 'batchNoCode', 'changeCode', 'changeDate', 'elementCode',
    'elementContent', 'elementPercentage', 'elementQuantity', 'fromLocation',
    'goodsCode', 'grossWeight', 'isotopeCode', 'isotopeContent',
    'isotopePercentage', 'isotopeQuantity', 'itemsPerBatch', 'materialTypeCode',
    'measurePointCode', 'measureStatus', 'netWeight', 'remarkSymbol',
    'tareWeight', 'toLocation', 'weightCount', 'weightUnit',
  ],
  R04: [
    'id', 'balanceArea', 'batchNoCode', 'elementCode', 'elementContent',
    'elementPercentage', 'elementQuantity', 'goodsCode', 'grossWeight',
    'isotopeCode', 'isotopeContent', 'isotopePercentage', 'isotopeQuantity',
    'itemsPerBatch', 'materialTypeCode', 'measurePointCode', 'measureStatus',
    'netWeight', 'remarkSymbol', 'tareWeight', 'weightUnit',
  ],
  R05: [
    'id', 'abundance', 'balanceAreaCode', 'balanceAreaName', 'calcObjectName',
    'calcUnit', 'categoryCode', 'elementCode', 'isotopeCode', 'isotopePosition',
    'materialElementCode', 'registerItemName', 'remarkSymbol', 'seqNo', 'weight',
  ],
  R06: [
    'balanceArea', 'batchNo', 'changeCode', 'commonName', 'containerNo',
    'materialCode', 'remarkContent',
  ],
  R08: [
    'id', 'balanceAreaCode', 'closingBalance', 'elementName', 'inbound',
    'isotopeContent', 'isotopeName', 'knownLoss', 'openingBalance',
    'otherDecrease', 'otherIncrease', 'outbound', 'remark', 'remarkSymbol',
    'seqNo', 'weightUnit', 'xconsumption', 'xoutput',
  ],
  R09: [
    'id', 'adjustedBalance', 'balanceAreaCode', 'closingBalance', 'elementName',
    'goodsCode', 'grossWeight', 'isotopeContent', 'lossRate', 'netWeight',
    'physicalBalance', 'remark', 'remarkSymbol', 'seqNo', 'tareWeight',
    'unbalance', 'weightUnit',
  ],
}

const buildHeader = (code, templateData = {}) => {
  const config = reportConfigs[code] || {}
  const data = {
    ...templateData,
    formNo: templateData.formNo || config.tableNo,
    format: templateData.format || config.formatNo,
    securityLevel: templateData.securityLevel || templateData.classification || '内部',
  }

  if (code === 'R01') {
    data.senderMaker = templateData.senderMaker || templateData.senderTabulator
    data.sendDate = formatDate(templateData.sendDate)
    data.receiveDate = formatDate(templateData.receiveDate)
  }
  if (code === 'R03') {
    data.startYearQuarter = templateData.startYearQuarter || templateData.yearQuarterRangeStart
    data.endYearQuarter = templateData.endYearQuarter || templateData.yearQuarterRangeEnd
    data.startDate = formatDate(templateData.startDate || templateData.actualDateRangeStart)
    data.endDate = formatDate(templateData.endDate || templateData.actualDateRangeEnd)
  }
  if (code === 'R05') {
    data.startYearQuarter = templateData.startYearQuarter || templateData.yearQuarterRangeStart
    data.endYearQuarter = templateData.endYearQuarter || templateData.yearQuarterRangeEnd
    data.startActualDate = formatDate(templateData.startActualDate || templateData.actualDateRangeStart)
    data.endActualDate = formatDate(templateData.endActualDate || templateData.actualDateRangeEnd)
  }
  if (code === 'R08' || code === 'R09') {
    data.startYearSeason = templateData.startYearSeason || templateData.yearQuarterRangeStart
    data.endYearSeason = templateData.endYearSeason || templateData.yearQuarterRangeEnd
    data.startDate = formatDate(templateData.startDate || templateData.actualDateRangeStart)
    data.endDate = formatDate(templateData.endDate || templateData.actualDateRangeEnd)
  }

  return pick(data, headerFields[code] || [])
}

const normalizeRowForSave = (code, row, index) => {
  const item = { ...row }
  item.seqNo = item.seqNo || index + 1
  item.itemCount = item.itemCount || item.itemsPerBatch || item.containerCount
  item.itemsPerBatch = item.itemsPerBatch || item.itemCount
  item.batchNoCode = item.batchNoCode || item.batchNo
  item.elementQuantity = item.elementQuantity || item.elementContent
  item.isotopeQuantity = item.isotopeQuantity || item.isotopeContent
  item.remarkSymbol = item.remarkSymbol || item.annotation
  item.materialCode = item.materialCode || item.goodsCode
  item.containerNo = item.containerNo || item.containerCode
  item.batchNo = item.batchNo || item.batchNoCode
  return pick(item, detailFields[code] || [])
}

export const buildSavePayload = (code, templateData = {}, tableData = []) => ({
  ...buildHeader(code, templateData),
  detailList: tableData.map((row, index) => normalizeRowForSave(code, row, index)),
})

export const extractList = getList
