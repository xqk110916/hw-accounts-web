// 报表卡片元信息
export const reportCards = [
  { code: 'R01', name: '材料交接统计报表', desc: '发方与收方对称布局，记录交接信息' },
  { code: 'R03', name: '材料库存变化统计报表', desc: '按季度统计库存变化' },
  { code: 'R04', name: '材料实际库存统计报表', desc: '实际库存盘点统计' },
  { code: 'R05', name: '材料账目报表', desc: '账目衡算数据登记' },
  { code: 'R06', name: '材料注释统计报表', desc: '注释信息统计管理' },
  { code: 'R08', name: '材料库存变化综合统计表', desc: '结算周期材料变动量综合统计' },
  { code: 'R09', name: '材料库存变化综合统计表', desc: '账面与实物对比综合统计' },
]

// 多级表头公共片段
const materialWeightColumns = [
  { prop: 'grossWeight', label: '毛重', minWidth: 90 },
  { prop: 'tareWeight', label: '皮重', minWidth: 90 },
  { prop: 'netWeight', label: '净重', minWidth: 90 },
]

const elementColumns = [
  { prop: 'elementCode', label: '元素代码', minWidth: 100 },
  { prop: 'elementPercentage', label: '百分比含量', minWidth: 110 },
  { prop: 'elementQuantity', label: '元素量', minWidth: 90 },
]

const isotopeColumns = [
  { prop: 'isotopeCode', label: '同位素代码', minWidth: 110 },
  { prop: 'isotopePercentage', label: '百分比含量', minWidth: 110 },
  { prop: 'isotopeQuantity', label: '同位素量', minWidth: 90 },
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
    title: '材料交接统计报表',
    tableNo: '材料R01表',
    formatNo: 'X管办94R01号',
    search: [
      { label: '任务类型', prop: 'type', type: 'select', col: 5, option: [
        { label: '入库', value: 1 }, { label: '出库', value: 2 },
      ] },
      { label: '日期区间', prop: 'dateRange', type: 'daterange', col: 8 },
      { label: '选择任务', prop: 'taskNums', type: 'select', col: 11, multiple: true, option: [], actionBtn: '接入报表' },
      { label: '从历史中选择', prop: 'historyIds', type: 'select', col: 12, option: [], newRow: true },
    ],
    columns: [
      { type: 'index', label: '序号', width: 60 },
      { prop: 'taskNum', label: '批号', minWidth: 120 },
      { prop: 'itemCount', label: '每批物件数', minWidth: 100 },
      { prop: 'containerCode', label: '容器编号', minWidth: 120 },
      { prop: 'inOutType', label: '材料转移类型', minWidth: 110 },
      { prop: 'goodsCode', label: '材料代码', minWidth: 110 },
      { prop: 'materialTypeCode', label: '材料类型代码', minWidth: 110 },
      { prop: 'weightUnit', label: '重量单位', minWidth: 80 },
      { label: '材料量', children: materialWeightColumns },
      { label: '元素量', children: elementColumns },
      { label: '同位素量', children: isotopeColumns },
      { prop: 'measurePointCode', label: '测量点代码', minWidth: 110 },
      { prop: 'measureStatus', label: '测量情况', minWidth: 100 },
      { prop: 'remarkSymbol', label: '注释符', minWidth: 80 },
    ],
  },

  R03: {
    title: '材料库存变化统计报表',
    tableNo: '材料R03表',
    formatNo: 'X管办01R01号',
    search: [
      { label: '年份', prop: 'year', type: 'year', col: 11 },
      { label: '季度', prop: 'quarter', type: 'select', col: 13, option: quarterOptions, actionBtn: '统计' },
      { label: '从历史中选择', prop: 'historyId', type: 'select', col: 8, option: [], newRow: true },
    ],
    columns: [
      { type: 'index', label: '序号', width: 60 },
      { prop: 'changeDate', label: '库存变化日期', minWidth: 120 },
      { label: '单位或平衡区', children: [
        { prop: 'fromLocation', label: '来处', minWidth: 100 },
        { prop: 'toLocation', label: '去处', minWidth: 100 },
      ] },
      { prop: 'changeCode', label: '库存变化代码', minWidth: 110 },
      { prop: 'batchNoCode', label: '批号', minWidth: 120 },
      { prop: 'itemsPerBatch', label: '每批物件数', minWidth: 100 },
      { prop: 'goodsCode', label: '材料代码', minWidth: 110 },
      { prop: 'materialTypeCode', label: '材料类型代码', minWidth: 110 },
      { prop: 'weightUnit', label: '重量单位', minWidth: 80 },
      { label: '材料量', children: materialWeightColumns },
      { label: '元素量', children: elementColumns },
      { label: '同位素量', children: isotopeColumns },
      { prop: 'measurePointCode', label: '测量点代码', minWidth: 110 },
      { prop: 'measureStatus', label: '测量情况', minWidth: 100 },
      { prop: 'remarkSymbol', label: '注释符', minWidth: 80 },
    ],
  },

  R04: {
    title: '材料实际库存统计报表',
    tableNo: '材料R04表',
    formatNo: 'X管办94R04号',
    search: [
      { label: '年份', prop: 'year', type: 'year', col: 11 },
      { label: '季度', prop: 'quarter', type: 'select', col: 13, option: quarterOptions, actionBtn: '统计' },
      { label: '从历史中选择', prop: 'historyId', type: 'select', col: 8, option: [], newRow: true },
    ],
    columns: [
      { type: 'index', label: '序号', width: 60 },
      { prop: 'measurePointCode', label: '测量点代码', minWidth: 110 },
      { prop: 'balanceArea', label: '平衡区代码', minWidth: 110 },
      { prop: 'batchNoCode', label: '批号', minWidth: 120 },
      { prop: 'itemsPerBatch', label: '每批物件数', minWidth: 100 },
      { prop: 'goodsCode', label: '材料代码', minWidth: 110 },
      { prop: 'materialTypeCode', label: '材料类型代码', minWidth: 110 },
      { prop: 'weightUnit', label: '重量单位', minWidth: 80 },
      { label: '材料量', children: materialWeightColumns },
      { label: '元素量', children: elementColumns },
      { label: '同位素量', children: isotopeColumns },
      { prop: 'measureStatus', label: '测量情况', minWidth: 100 },
      { prop: 'remarkSymbol', label: '注释符', minWidth: 80 },
    ],
  },

  R05: {
    title: '材料账目报表',
    tableNo: '材料R05表',
    formatNo: 'X管办94R05号',
    search: [
      { label: '年份', prop: 'year', type: 'year', col: 11 },
      { label: '季度', prop: 'quarter', type: 'select', col: 13, option: quarterOptions, actionBtn: '统计', disabled: true },
      { label: '从历史中选择', prop: 'historyId', type: 'select', col: 8, option: [], newRow: true },
    ],
    columns: [
      { type: 'index', label: '序号', width: 60 },
      { label: '平衡区', children: [
        { prop: 'balanceAreaCode', label: '编号', minWidth: 100 },
        { prop: 'balanceAreaName', label: '名称', minWidth: 100 },
      ] },
      { label: '衡算数据', children: [
        { prop: 'calcObjectName', label: '衡算对象名称', minWidth: 120 },
        { prop: 'abundance', label: '丰度(%)', minWidth: 90 },
      ] },
      { label: '登记项目', children: [
        { prop: 'categoryCode', label: '类别代码', minWidth: 100 },
        { prop: 'registerItemName', label: '名称', minWidth: 100 },
      ] },
      { label: '衡算数据', children: [
        { prop: 'materialElementCode', label: '物素代码', minWidth: 100 },
        { prop: 'elementCode', label: '元素代码', minWidth: 100 },
        { prop: 'isotopeCode', label: '同位素代码', minWidth: 100 },
        { prop: 'weight', label: '重量', minWidth: 90 },
        { prop: 'calcUnit', label: '重量单位', minWidth: 80 },
      ] },
      { prop: 'remarkSymbol', label: '注释符', minWidth: 80 },
    ],
  },

  R06: {
    title: '材料注释统计报表',
    tableNo: '材料R06表',
    formatNo: 'X管办94R06号',
    search: [
      { label: '查询日期', prop: 'dateRange', type: 'daterange', col: 12, actionBtn: '统计', disabled: true },
      { label: '从历史中选择', prop: 'historyId', type: 'select', col: 8, option: [], newRow: true },
    ],
    columns: [
      { type: 'index', label: '序号', width: 60 },
      { prop: 'balanceArea', label: '平衡区', minWidth: 100 },
      { prop: 'materialCode', label: '材料代码', minWidth: 110 },
      { prop: 'commonName', label: '通用名称', minWidth: 120 },
      { prop: 'batchNo', label: '批号', minWidth: 120 },
      { prop: 'containerNo', label: '容器号', minWidth: 120 },
      { prop: 'changeCode', label: '变化码', minWidth: 100 },
      { prop: 'remarkContent', label: '注释内容', minWidth: 140 },
      { label: '操作', width: 120, fixed: 'right', type: 'operation', actions: ['新增', '删除'] },
    ],
  },

  R08: {
    title: '材料库存变化综合统计表',
    tableNo: '材料R08表',
    formatNo: 'X管办94R08号',
    search: [
      { label: '统计日期', prop: 'dateRange', type: 'daterange', col: 11 },
      { label: '选择材料', prop: 'goodsCodes', type: 'select', col: 13, multiple: true, option: [], actionBtn: '生成' },
      { label: '从历史中选择', prop: 'historyId', type: 'select', col: 8, option: [], newRow: true },
    ],
    columns: [
      { type: 'index', label: '序号', width: 60 },
      { prop: 'balanceAreaCode', label: '平衡区代码', minWidth: 110 },
      { prop: 'elementName', label: '物素名称', minWidth: 110 },
      { prop: 'isotopeContent', label: '同位素含量(%)', minWidth: 120 },
      { prop: 'weightUnit', label: '重量单位', minWidth: 80 },
      { label: '本结算周期内材料变动量', children: [
        { prop: 'openingBalance', label: '期初', minWidth: 90 },
        { prop: 'inbound', label: '调入', minWidth: 90 },
        { prop: 'outbound', label: '调出', minWidth: 90 },
        { prop: 'xoutput', label: '产出', minWidth: 90 },
        { prop: 'xconsumption', label: '消耗', minWidth: 90 },
        { prop: 'otherIncrease', label: '其他增量', minWidth: 90 },
        { prop: 'otherDecrease', label: '其他减量', minWidth: 90 },
        { prop: 'knownLoss', label: '已知损失', minWidth: 90 },
          { prop: 'closingBalance', label: '期末账面', minWidth: 90 },
      ] },
      { prop: 'remarkSymbol', label: '注释符', minWidth: 80 },
      { prop: 'remark', label: '备注', minWidth: 100 },
    ],
  },

  R09: {
    title: '材料库存变化综合统计表',
    tableNo: '材料R09表',
    formatNo: 'X管办94R09号',
    search: [
      { label: '统计日期', prop: 'dateRange', type: 'daterange', col: 11 },
      { label: '选择材料', prop: 'goodsCodes', type: 'select', col: 13, multiple: true, option: [], actionBtn: '生成' },
      { label: '从历史中选择', prop: 'historyId', type: 'select', col: 8, option: [], newRow: true },
    ],
    columns: [
      { type: 'index', label: '序号', width: 60 },
      { prop: 'balanceAreaCode', label: '平衡区代码', minWidth: 110 },
      { prop: 'elementName', label: '物素名称', minWidth: 110 },
      { prop: 'isotopeContent', label: '同位素含量(%)', minWidth: 120 },
      { prop: 'weightUnit', label: '重量单位', minWidth: 80 },
      { label: '本结算周期内材料变动量', children: [
        { prop: 'closingBalance', label: '本期末账面', minWidth: 110 },
        { prop: 'adjustedBalance', label: '调整后账面', minWidth: 110 },
        { prop: 'physicalBalance', label: '本期末实物', minWidth: 110 },
        { prop: 'unbalance', label: '不平衡差', minWidth: 100 },
        { prop: 'lossRate', label: '总损失率', minWidth: 100 },
      ] },
      { prop: 'remarkSymbol', label: '注释符', minWidth: 80 },
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
      { label: '起止年季', prop: 'yearQuarterRange', type: 'monthrange', placeholders: ['请选择开始月份', '请选择结束月份'] },
      { label: '实际日期', prop: 'actualDateRange', type: 'daterange', placeholders: ['请选择开始日期', '请选择结束日期'] },
    ],
  },
  R04: {
    leftRows: [
      { label: '报表编号', prop: 'reportNo', placeholder: '请输入' },
      { label: '单位名称', prop: 'unitName', placeholder: '系统预设可修改' },
      { label: '单位代码', prop: 'unitCode', placeholder: '系统预设可修改' },
      { label: '许可证号', prop: 'licenseNo', placeholder: '系统预设可修改' },
      { label: '账面盘存日期', prop: 'bookInventoryDate', type: 'date', placeholder: '请选择盘存日期' },
      { label: '实际日期', prop: 'actualDate', type: 'date', placeholder: '请选择实际日期' },
    ],
  },
  R05: {
    leftRows: [
      { label: '报表编号', prop: 'reportNo', placeholder: '请输入' },
      { label: '单位名称', prop: 'unitName', placeholder: '系统预设可修改' },
      { label: '单位代码', prop: 'unitCode', placeholder: '系统预设可修改' },
      { label: '许可证号', prop: 'licenseNo', placeholder: '系统预设可修改' },
      { label: '起止年季', prop: 'yearQuarterRange', type: 'monthrange', placeholders: ['请选择开始月份', '请选择结束月份'] },
      { label: '实际日期', prop: 'actualDateRange', type: 'daterange', placeholders: ['请选择开始日期', '请选择结束日期'] },
    ],
  },
  R06: {
    leftRows: [
      { label: '报表编号', prop: 'reportNo', placeholder: '请输入' },
      { label: '单位名称', prop: 'unitName', placeholder: '系统预设可修改' },
      { label: '单位代码', prop: 'unitCode', placeholder: '系统预设可修改' },
      { label: '许可证号', prop: 'licenseNo', placeholder: '系统预设可修改' },
      { label: '报告日期', prop: 'reportDate', type: 'date', placeholder: '请选择报告日期' },
    ],
  },
  R08: {
    leftRows: [
      { label: '报表编号', prop: 'reportNo', placeholder: '请输入' },
      { label: '单位名称', prop: 'unitName', placeholder: '系统预设可修改' },
      { label: '单位代码', prop: 'unitCode', placeholder: '系统预设可修改' },
      { label: '许可证号', prop: 'licenseNo', placeholder: '系统预设可修改' },
      { label: '起止年季', prop: 'yearQuarterRange', type: 'monthrange', placeholders: ['请选择开始月份', '请选择结束月份'] },
      { label: '实际日期', prop: 'actualDateRange', type: 'daterange', placeholders: ['请选择开始日期', '请选择结束日期'] },
    ],
  },
  R09: {
    leftRows: [
      { label: '报表编号', prop: 'reportNo', placeholder: '请输入' },
      { label: '单位名称', prop: 'unitName', placeholder: '系统预设可修改' },
      { label: '单位代码', prop: 'unitCode', placeholder: '系统预设可修改' },
      { label: '许可证号', prop: 'licenseNo', placeholder: '系统预设可修改' },
      { label: '起止年季', prop: 'yearQuarterRange', type: 'monthrange', placeholders: ['请选择开始月份', '请选择结束月份'] },
      { label: '实际日期', prop: 'actualDateRange', type: 'daterange', placeholders: ['请选择开始日期', '请选择结束日期'] },
    ],
  },
}
