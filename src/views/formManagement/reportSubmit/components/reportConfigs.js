// 报表卡片元信息
export const reportCards = [
  { code: 'R01', name: 'X材料交接统计报表', desc: '发方与收方对称布局，记录交接信息' },
  { code: 'R03', name: 'X材料库存变化统计报表', desc: '按季度统计库存变化' },
  { code: 'R04', name: 'X材料实际库存统计报表', desc: '实际库存盘点统计' },
  { code: 'R05', name: 'X材料账目报表', desc: '账目衡算数据登记' },
  { code: 'R06', name: 'X材料注释统计报表', desc: '注释信息统计管理' },
  { code: 'R08', name: 'X材料库存变化综合统计表', desc: '结算周期材料变动量综合统计' },
  { code: 'R09', name: 'X材料库存变化综合统计表', desc: '账面与实物对比综合统计' },
]

// 多级表头公共片段
const materialWeightColumns = [
  { prop: 'grossWeight', label: '毛重', minWidth: 90 },
  { prop: 'tareWeight', label: '皮重', minWidth: 90 },
  { prop: 'netWeight', label: '净重', minWidth: 90 },
]

const elementColumns = [
  { prop: 'elementCode', label: '元素代码', minWidth: 100 },
  { prop: 'elementPercent', label: '百分比含量', minWidth: 110 },
  { prop: 'elementAmount', label: '元素量', minWidth: 90 },
]

const isotopeColumns = [
  { prop: 'isotopeCode', label: '同位素代码', minWidth: 110 },
  { prop: 'isotopePercent', label: '百分比含量', minWidth: 110 },
  { prop: 'isotopeAmount', label: '同位素量', minWidth: 90 },
]

// 季度选项
export const quarterOptions = [
  { label: '第一季度', value: 1 },
  { label: '第二季度', value: 2 },
  { label: '第三季度', value: 3 },
  { label: '第四季度', value: 4 },
]

// 各报表配置
export const reportConfigs = {
  R01: {
    title: 'X材料交接统计报表',
    tableNo: 'X材料R01表',
    formatNo: 'X管办94R01号',
    search: [
      { label: '任务类型', prop: 'taskType', type: 'select', col: 6, option: [
        { label: '入库', value: 1 }, { label: '出库', value: 2 },
      ] },
      { label: '日期区间', prop: 'dateRange', type: 'daterange', col: 7 },
      { label: '选择任务', prop: 'taskId', type: 'select', col: 6, option: [], actionBtn: '接入报表' },
      { label: '从历史中选择', prop: 'historyIds', type: 'select', col: 12, multiple: true, option: [], newRow: true },
    ],
    columns: [
      { type: 'index', label: '序号', width: 60 },
      { prop: 'taskNum', label: '批号', minWidth: 120 },
      { prop: 'piecesPerBatch', label: '每批物件数', minWidth: 100 },
      { prop: 'containerCode', label: '容器编号', minWidth: 120 },
      { prop: 'transferType', label: '材料转移类型', minWidth: 110 },
      { prop: 'goodsCode', label: '材料代码', minWidth: 110 },
      { prop: 'materialTypeCode', label: '材料类型代码', minWidth: 110 },
      { prop: 'weightUnit', label: '重量单位', minWidth: 80 },
      { label: '材料量', children: materialWeightColumns },
      { label: '元素量', children: elementColumns },
      { label: '同位素量', children: isotopeColumns },
      { prop: 'measurePointCode', label: '测量点代码', minWidth: 110 },
      { prop: 'measureStatus', label: '测量情况', minWidth: 100 },
      { prop: 'annotation', label: '注释符', minWidth: 80 },
    ],
  },

  R03: {
    title: 'X材料库存变化统计报表',
    tableNo: 'X材料R03表',
    formatNo: 'X管办94R03号',
    search: [
      { label: '年份', prop: 'year', type: 'year', col: 4 },
      { label: '季度', prop: 'quarter', type: 'select', col: 4, option: quarterOptions, actionBtn: '统计' },
      { label: '从历史中选择', prop: 'historyId', type: 'select', col: 8, option: [], newRow: true },
    ],
    columns: [
      { type: 'index', label: '序号', width: 60 },
      { prop: 'changeDate', label: '库存变化日期', minWidth: 120 },
      { label: '单位或平衡区', children: [
        { prop: 'fromUnit', label: '来处', minWidth: 100 },
        { prop: 'toUnit', label: '去处', minWidth: 100 },
      ] },
      { prop: 'changeCode', label: '库存变化代码', minWidth: 110 },
      { prop: 'batchNum', label: '批号', minWidth: 120 },
      { prop: 'piecesPerBatch', label: '每批物件数', minWidth: 100 },
      { prop: 'goodsCode', label: '材料代码', minWidth: 110 },
      { prop: 'materialTypeCode', label: '材料类型代码', minWidth: 110 },
      { prop: 'weightUnit', label: '重量单位', minWidth: 80 },
      { label: '材料量', children: materialWeightColumns },
      { label: '元素量', children: elementColumns },
      { label: '同位素量', children: isotopeColumns },
      { prop: 'measurePointCode', label: '测量点代码', minWidth: 110 },
      { prop: 'measureStatus', label: '测量情况', minWidth: 100 },
      { prop: 'annotation', label: '注释符', minWidth: 80 },
    ],
  },

  R04: {
    title: 'X材料实际库存统计报表',
    tableNo: 'X材料R04表',
    formatNo: 'X管办94R04号',
    search: [
      { label: '年份', prop: 'year', type: 'year', col: 4 },
      { label: '季度', prop: 'quarter', type: 'select', col: 4, option: quarterOptions, actionBtn: '统计' },
      { label: '从历史中选择', prop: 'historyId', type: 'select', col: 8, option: [], newRow: true },
    ],
    columns: [
      { type: 'index', label: '序号', width: 60 },
      { prop: 'measurePointCode', label: '测量点代码', minWidth: 110 },
      { prop: 'balanceAreaCode', label: '平衡区代码', minWidth: 110 },
      { prop: 'batchNum', label: '批号', minWidth: 120 },
      { prop: 'piecesPerBatch', label: '每批物件数', minWidth: 100 },
      { prop: 'goodsCode', label: '材料代码', minWidth: 110 },
      { prop: 'materialTypeCode', label: '材料类型代码', minWidth: 110 },
      { prop: 'weightUnit', label: '重量单位', minWidth: 80 },
      { label: '材料量', children: materialWeightColumns },
      { label: '元素量', children: elementColumns },
      { label: '同位素量', children: isotopeColumns },
      { prop: 'measureStatus', label: '测量情况', minWidth: 100 },
      { prop: 'annotation', label: '注释符', minWidth: 80 },
    ],
  },

  R05: {
    title: 'X材料账目报表',
    tableNo: 'X材料R05表',
    formatNo: 'X管办94R05号',
    search: [
      { label: '年份', prop: 'year', type: 'year', col: 4 },
      { label: '季度', prop: 'quarter', type: 'select', col: 4, option: quarterOptions, actionBtn: '统计' },
      { label: '从历史中选择', prop: 'historyId', type: 'select', col: 8, option: [], newRow: true },
    ],
    columns: [
      { type: 'index', label: '序号', width: 60 },
      { label: '平衡区', children: [
        { prop: 'balanceAreaCode', label: '编号', minWidth: 100 },
        { prop: 'balanceAreaName', label: '名称', minWidth: 100 },
      ] },
      { label: '衡算数据', children: [
        { prop: 'accountingObjName', label: '衡算对象名称', minWidth: 120 },
        { prop: 'abundance', label: '丰度(%)', minWidth: 90 },
      ] },
      { label: '登记项目', children: [
        { prop: 'categoryCode', label: '类别代码', minWidth: 100 },
        { prop: 'categoryName', label: '名称', minWidth: 100 },
      ] },
      { label: '衡算数据', children: [
        { prop: 'substanceCode', label: '物素代码', minWidth: 100 },
        { prop: 'elementCode', label: '元素代码', minWidth: 100 },
        { prop: 'isotopeCode', label: '同位素代码', minWidth: 100 },
        { prop: 'weight', label: '重量', minWidth: 90 },
        { prop: 'weightUnit', label: '重量单位', minWidth: 80 },
      ] },
      { prop: 'annotation', label: '注释符', minWidth: 80 },
    ],
  },

  R06: {
    title: 'X材料注释统计报表',
    tableNo: 'X材料R06表',
    formatNo: 'X管办94R06号',
    search: [
      { label: '查询日期', prop: 'dateRange', type: 'daterange', col: 7, actionBtn: '统计' },
      { label: '从历史中选择', prop: 'historyId', type: 'select', col: 8, option: [], newRow: true },
    ],
    columns: [
      { type: 'index', label: '序号', width: 60 },
      { prop: 'balanceArea', label: '平衡区', minWidth: 100 },
      { prop: 'goodsCode', label: '材料代码', minWidth: 110 },
      { prop: 'commonName', label: '通用名称', minWidth: 120 },
      { prop: 'batchNum', label: '批号', minWidth: 120 },
      { prop: 'containerCode', label: '容器号', minWidth: 120 },
      { prop: 'changeCode', label: '变化码', minWidth: 100 },
      { prop: 'annotationContent', label: '注释内容', minWidth: 140 },
      { label: '操作', width: 120, fixed: 'right', type: 'operation', actions: ['新增', '删除'] },
    ],
  },

  R08: {
    title: 'X材料库存变化综合统计表',
    tableNo: 'X材料R08表',
    formatNo: 'X管办94R08号',
    search: [
      { label: '统计日期', prop: 'dateRange', type: 'daterange', col: 7 },
      { label: '选择材料', prop: 'materialCodes', type: 'select', col: 6, multiple: true, option: [], actionBtn: '生成' },
      { label: '从历史中选择', prop: 'historyId', type: 'select', col: 8, option: [], newRow: true },
    ],
    columns: [
      { type: 'index', label: '序号', width: 60 },
      { prop: 'balanceAreaCode', label: '平衡区代码', minWidth: 110 },
      { prop: 'substanceName', label: '物素名称', minWidth: 110 },
      { prop: 'isotopePercent', label: '同位素含量(%)', minWidth: 120 },
      { prop: 'weightUnit', label: '重量单位', minWidth: 80 },
      { label: '本结算周期内材料变动量', children: [
        { prop: 'openingBalance', label: '期初', minWidth: 90 },
        { prop: 'transferIn', label: '调入', minWidth: 90 },
        { prop: 'transferOut', label: '调出', minWidth: 90 },
        { prop: 'output', label: '产出', minWidth: 90 },
        { prop: 'consumption', label: '消耗', minWidth: 90 },
        { prop: 'otherIncrease', label: '其他增量', minWidth: 90 },
        { prop: 'otherDecrease', label: '其他减量', minWidth: 90 },
        { prop: 'knownLoss', label: '已知损失', minWidth: 90 },
        { prop: 'closingBalance', label: '期末账面', minWidth: 90 },
      ] },
      { prop: 'annotation', label: '注释符', minWidth: 80 },
      { prop: 'remark', label: '备注', minWidth: 100 },
    ],
  },

  R09: {
    title: 'X材料库存变化综合统计表',
    tableNo: 'X材料R09表',
    formatNo: 'X管办94R09号',
    search: [
      { label: '统计日期', prop: 'dateRange', type: 'daterange', col: 7 },
      { label: '选择材料', prop: 'materialCodes', type: 'select', col: 6, multiple: true, option: [], actionBtn: '生成' },
      { label: '从历史中选择', prop: 'historyId', type: 'select', col: 8, option: [], newRow: true },
    ],
    columns: [
      { type: 'index', label: '序号', width: 60 },
      { prop: 'balanceAreaCode', label: '平衡区代码', minWidth: 110 },
      { prop: 'substanceName', label: '物素名称', minWidth: 110 },
      { prop: 'isotopePercent', label: '同位素含量(%)', minWidth: 120 },
      { prop: 'weightUnit', label: '重量单位', minWidth: 80 },
      { label: '本结算周期内材料变动量', children: [
        { prop: 'closingBalance', label: '本期末账面', minWidth: 110 },
        { prop: 'adjustedBalance', label: '调整后账面', minWidth: 110 },
        { prop: 'physicalInventory', label: '本期末实物', minWidth: 110 },
        { prop: 'imbalanceDiff', label: '不平衡差', minWidth: 100 },
        { prop: 'totalLossRate', label: '总损失率', minWidth: 100 },
      ] },
      { prop: 'annotation', label: '注释符', minWidth: 80 },
      { prop: 'remark', label: '备注', minWidth: 100 },
    ],
  },
}

// 报表模板字段配置（通用两栏式）
export const templateConfigs = {
  R03: {
    leftRows: [
      { label: '报表编号', prop: 'reportNo', placeholder: '请输入' },
      { label: '单位名称', prop: 'unitName', placeholder: '系统预设可修改' },
      { label: '单位代码', prop: 'unitCode', placeholder: '系统预设可修改' },
      { label: '许可证号', prop: 'licenseNo', placeholder: '系统预设可修改' },
      { label: '起止年季', prop: 'yearQuarterRange', type: 'range', placeholders: ['2020.1', '2020.3'] },
      { label: '实际日期', prop: 'actualDateRange', type: 'range', placeholders: ['2020.1.1', '2020.3.31'] },
    ],
  },
  R04: {
    leftRows: [
      { label: '报表编号', prop: 'reportNo', placeholder: '请输入' },
      { label: '单位名称', prop: 'unitName', placeholder: '系统预设可修改' },
      { label: '单位代码', prop: 'unitCode', placeholder: '系统预设可修改' },
      { label: '许可证号', prop: 'licenseNo', placeholder: '系统预设可修改' },
      { label: '账面盘存日期', prop: 'bookInventoryDate', placeholder: '2020.3.31' },
      { label: '实际日期', prop: 'actualDate', placeholder: '2020.3.31' },
    ],
  },
  R05: {
    leftRows: [
      { label: '报表编号', prop: 'reportNo', placeholder: '请输入' },
      { label: '单位名称', prop: 'unitName', placeholder: '系统预设可修改' },
      { label: '单位代码', prop: 'unitCode', placeholder: '系统预设可修改' },
      { label: '许可证号', prop: 'licenseNo', placeholder: '系统预设可修改' },
      { label: '起止年季', prop: 'yearQuarterRange', type: 'range', placeholders: ['2020.1', '2020.3'] },
      { label: '实际日期', prop: 'actualDateRange', type: 'range', placeholders: ['2020.1.1', '2020.3.31'] },
    ],
  },
  R06: {
    leftRows: [
      { label: '报表编号', prop: 'reportNo', placeholder: '请输入' },
      { label: '单位名称', prop: 'unitName', placeholder: '系统预设可修改' },
      { label: '单位代码', prop: 'unitCode', placeholder: '系统预设可修改' },
      { label: '许可证号', prop: 'licenseNo', placeholder: '系统预设可修改' },
      { label: '报告日期', prop: 'reportDate', placeholder: '2020.1.31' },
    ],
  },
  R08: {
    leftRows: [
      { label: '报表编号', prop: 'reportNo', placeholder: '请输入' },
      { label: '单位名称', prop: 'unitName', placeholder: '系统预设可修改' },
      { label: '单位代码', prop: 'unitCode', placeholder: '系统预设可修改' },
      { label: '许可证号', prop: 'licenseNo', placeholder: '系统预设可修改' },
      { label: '起止年季', prop: 'yearQuarterRange', type: 'range', placeholders: ['2020.1', '2020.3'] },
      { label: '实际日期', prop: 'actualDateRange', type: 'range', placeholders: ['2020.1.1', '2020.3.31'] },
    ],
  },
  R09: {
    leftRows: [
      { label: '报表编号', prop: 'reportNo', placeholder: '请输入' },
      { label: '单位名称', prop: 'unitName', placeholder: '系统预设可修改' },
      { label: '单位代码', prop: 'unitCode', placeholder: '系统预设可修改' },
      { label: '许可证号', prop: 'licenseNo', placeholder: '系统预设可修改' },
      { label: '起止年季', prop: 'yearQuarterRange', type: 'range', placeholders: ['2020.1', '2020.3'] },
      { label: '实际日期', prop: 'actualDateRange', type: 'range', placeholders: ['2020.1.1', '2020.3.31'] },
    ],
  },
}
