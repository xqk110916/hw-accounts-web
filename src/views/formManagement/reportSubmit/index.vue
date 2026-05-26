<template>
  <div class="wrapper report-center-wrapper">
    <div class="content report-center-content">
      <div class="right report-center-right">
        <!-- 视图1: 卡片列表 -->
        <template v-if="currentView === 'list'">
          <!-- 极简典雅看板头部 (Clean Minimalist Header) -->
          <!-- <div class="hero-header-area">
            <div class="hero-text">
              <h1 class="hero-title">
                <i class="el-icon-document-copy title-icon"></i>
                报表统计与数据报送中心
              </h1>
              <p class="hero-subtitle">标准报表填报 · 账目关联统计 · 规范打印导出</p>
            </div>
            <div class="hero-stats">
              <div class="stat-badge">
                <span class="badge-dot pulse-blue"></span>
                <span class="badge-text">R01-R09 标准表单</span>
              </div>
            </div>
          </div> -->

          <!-- 卡片列表布局 -->
          <el-row :gutter="16" class="card-row">
            <el-col :span="8" v-for="card in reportCards" :key="card.code">
              <div class="modern-card" @click="openReport(card.code)">
                <!-- 顶部徽章与图标 -->
                <div class="card-header">
                  <div class="card-code-badge">{{ card.code }}</div>
                  <div class="card-icon-wrapper">
                    <i class="el-icon-document"></i>
                  </div>
                </div>
                <!-- 中部文本 -->
                <div class="card-body">
                  <h3 class="card-title">{{ card.name }}</h3>
                  <p class="card-desc">{{ card.desc }}</p>
                </div>
                <!-- 底部高颜值引导栏 -->
                <div class="card-footer">
                  <span class="footer-action">
                    进入填报
                    <i class="el-icon-arrow-right action-arrow"></i>
                  </span>
                </div>
              </div>
            </el-col>
          </el-row>
        </template>

        <!-- 视图2: 报表详情 -->
        <template v-else>
          <!-- 紧凑工具栏 (Detail Header) -->
          <div class="detail-header-panel">
            <div class="header-left-box">
              <el-button 
                icon="el-icon-arrow-left" 
                size="small" 
                class="modern-back-btn"
                @click="goBack"
              >返回</el-button>
              <div class="report-meta-title">
                <span class="meta-code">{{ activeReport }}</span>
                <span class="meta-name">{{ currentConfig.title }}</span>
              </div>
            </div>
            <div class="header-right-actions">
              <el-button size="small" type="primary" icon="el-icon-finished" class="action-btn-save" @click="handleSave">保存报表</el-button>
              <el-button size="small" icon="el-icon-download" class="action-btn-export" @click="handleExport">导出 Excel</el-button>
              <el-button size="small" icon="el-icon-printer" class="action-btn-print" @click="handlePrint">打印</el-button>
            </div>
          </div>

          <!-- 紧凑筛选面板 (Filter Area) -->
          <div class="filter-panel-area">
            <div class="filter-panel-header">
              <i class="el-icon-search panel-icon"></i>
              <span class="panel-title">报表统计筛选</span>
            </div>
            <div class="filter-panel-body">
              <el-form :inline="true" size="small" :model="searchParams" class="modern-inline-form">
                <el-row :gutter="12">
                  <template v-for="(item, idx) in currentSearchConfig">
                    <el-col :span="item.col || 6" :key="'s_' + idx" v-if="!item.newRow" class="form-col">
                      <el-form-item :label="item.label" class="modern-form-item">
                        <div class="form-item-inner-wrap">
                          <el-select
                            v-if="item.type === 'select'"
                            v-model="searchParams[item.prop]"
                            :multiple="item.multiple"
                            placeholder="请选择"
                            clearable
                            collapse-tags
                            size="small"
                            class="modern-select-item"
                          >
                            <el-option v-for="opt in item.option || []" :key="opt.value" :label="opt.label" :value="opt.value" />
                          </el-select>
                          
                          <el-date-picker
                            v-else-if="item.type === 'daterange'"
                            v-model="searchParams[item.prop]"
                            type="daterange"
                            range-separator="至"
                            start-placeholder="开始"
                            end-placeholder="结束"
                            value-format="yyyy-MM-dd"
                            size="small"
                            class="modern-daterange-item"
                          />
                          
                          <el-date-picker
                            v-else-if="item.type === 'year'"
                            v-model="searchParams[item.prop]"
                            type="year"
                            value-format="yyyy"
                            placeholder="选择年份"
                            size="small"
                            class="modern-year-item"
                          />
                          
                          <el-button
                            v-if="item.actionBtn"
                            type="primary"
                            size="small"
                            icon="el-icon-cpu"
                            class="search-trigger-btn"
                            @click="handleAction(item.actionBtn)"
                          >{{ item.actionBtn }}</el-button>
                        </div>
                      </el-form-item>
                    </el-col>
                    
                    <el-col :span="24" :key="'sr_' + idx" v-else class="form-col row-col">
                      <el-form-item :label="item.label" class="modern-form-item col-span-24">
                        <el-select
                          v-model="searchParams[item.prop]"
                          :multiple="item.multiple"
                          placeholder="从历史记录中检索并加载"
                          clearable
                          filterable
                          size="small"
                          class="modern-select-full"
                        >
                          <el-option v-for="opt in item.option || []" :key="opt.value" :label="opt.label" :value="opt.value" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </template>
                </el-row>
              </el-form>
            </div>
          </div>

          <!-- 报表显示区域 - 不固定高度，由界面内容自动撑开 (Natural height auto wrapper) -->
          <div class="paper-desk-wrapper">
            <div ref="printArea" class="report-paper-container">
              <r01-template v-if="activeReport === 'R01'" :form-data="templateData" @update="updateTemplateData" />
              <common-template v-else :code="activeReport" :form-data="templateData" @update="updateTemplateData" />
            </div>
          </div>

          <!-- 关联表格区块 - 不固定高度限制（跟随大页面垂直流动） -->
          <div class="table-card-container">
            <div class="table-card-header">
              <div class="header-left">
                <span class="marker"></span>
                <span class="title">关联明细数据列表</span>
              </div>
              <div class="header-right">
                <span class="table-stats">共 {{ tableData.length }} 条明细记录</span>
              </div>
            </div>
            <div class="table-area">
              <el-table
                ref="table"
                :data="tableData"
                border
                size="small"
                class="modern-table"
                style="width: 100%"
              >
                <template v-for="col in currentColumns">
                  <!-- 序号列 -->
                  <el-table-column v-if="col.type === 'index'" :key="'col_index_' + col.label" type="index" :label="col.label" width="55" align="center" />
                  
                  <!-- 操作列 -->
                  <el-table-column v-else-if="col.type === 'operation'" :key="'col_op_' + col.label" :label="col.label" width="100" :fixed="col.fixed" align="center">
                    <template slot-scope="scope">
                      <div class="table_operation">
                        <span v-for="act in col.actions" :key="act" class="btn-text-action" :class="act === '删除' ? 'danger-text' : 'primary-text'" @click="handleRowAction(act, scope.row)">
                          {{ act }}
                        </span>
                      </div>
                    </template>
                  </el-table-column>
                  
                  <!-- 多级表头 -->
                  <el-table-column v-else-if="col.children" :key="'col_children_' + col.label" :label="col.label" align="center" class-name="group-header">
                    <el-table-column
                      v-for="child in col.children"
                      :key="child.prop"
                      :prop="child.prop"
                      :label="child.label"
                      :min-width="child.minWidth"
                      show-overflow-tooltip
                      align="center"
                    />
                  </el-table-column>
                  
                  <!-- 普通列 -->
                  <el-table-column
                    v-else
                    :key="'col_normal_' + col.prop"
                    :prop="col.prop"
                    :label="col.label"
                    :min-width="col.minWidth"
                    show-overflow-tooltip
                    align="center"
                  />
                </template>
              </el-table>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import R01Template from './components/R01Template.vue'
import CommonTemplate from './components/CommonTemplate.vue'
import { reportCards, reportConfigs, requestFun, buildQueryParams } from './components/index.js'
import { blobSaveExcel } from '@/utils'

export default {
  name: 'ReportSubmit',
  components: { R01Template, CommonTemplate },
  data() {
    return {
      currentView: 'list',
      activeReport: '',
      searchParams: {},
      templateData: {},
      tableData: [],
      tableHeight: null, // 不限制表格高度，由内容自动撑开
    }
  },
  computed: {
    reportCards: () => reportCards,
    currentConfig() {
      return reportConfigs[this.activeReport] || {}
    },
    currentSearchConfig() {
      return this.currentConfig.search || []
    },
    currentColumns() {
      return this.currentConfig.columns || []
    },
  },
  methods: {
    openReport(code) {
      this.activeReport = code
      this.currentView = 'detail'
      this.searchParams = {}
      this.templateData = {}
      this.tableData = []
    },
    goBack() {
      this.currentView = 'list'
      this.activeReport = ''
    },
    handleAction(btnText) {
      if (btnText === '接入报表') this.loadData()
      else if (btnText === '统计' || btnText === '生成') this.loadData()
    },
    loadData() {
      const fn = requestFun[this.activeReport]
      if (!fn || !fn.list) return
      const params = buildQueryParams(this.activeReport, this.searchParams)
      fn.list(params).then(res => {
        if (res.code === 1) {
          this.tableData = res.data?.list || res.data || []
        }
      })
    },
    updateTemplateData(data) {
      this.templateData = { ...this.templateData, ...data }
    },
    handleSave() {
      const fn = requestFun[this.activeReport]
      if (!fn || !fn.save) return
      fn.save({ ...this.templateData, searchParams: this.searchParams }).then(res => {
        if (res.code === 1) {
          this.$message.success('保存成功')
        }
      })
    },
    handleExport() {
      const fn = requestFun[this.activeReport]
      if (!fn || !fn.export) return
      const params = buildQueryParams(this.activeReport, this.searchParams)
      fn.export(params).then(res => {
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
        const disposition = res.headers && res.headers['content-disposition']
        let fileName = `${this.activeReport}报表导出`
        if (disposition) {
          const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^";\n]+)/i)
          if (match && match[1]) fileName = decodeURIComponent(match[1].replace(/['"]/g, ''))
        }
        blobSaveExcel(blob, fileName)
      })
    },
    handlePrint() {
      const printContent = this.$refs.printArea
      if (!printContent) return
      const newWin = window.open('', '_blank')
      
      const printStyles = `
        /* 通用打印复位与版面微调 */
        body {
          margin: 10px;
          font-family: SimSun, serif !important;
          background: transparent !important;
          color: #000000 !important;
        }
        
        /* 1. 双流渲染隐藏/显示机制 */
        .no-print {
          display: none !important;
        }
        .print-only {
          display: inline-block !important;
        }
        
        /* 2. 印刷级纯文本样式 */
        .print-text {
          font-family: SimSun, serif !important;
          font-size: 11px !important;
          color: #000000 !important;
          display: block !important;
          text-align: left !important;
          padding-left: 4px !important;
          min-height: 16px !important;
          font-weight: normal !important;
        }
        .print-text-inline {
          font-family: SimSun, serif !important;
          font-size: 11px !important;
          color: #000000 !important;
          display: inline-block !important;
          font-weight: normal !important;
        }
        
        /* 3. R01材料交接表 打印版面控制 */
        .r01-template {
          background: transparent !important;
          padding: 0 !important;
          font-family: SimSun, serif !important;
          width: 100% !important;
        }
        .r01-template .report-paper {
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .r01-template .report-header {
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
          gap: 6px !important;
          margin-bottom: 12px !important;
        }
        .r01-template .report-header .header-meta-row {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          width: 100% !important;
        }
        .r01-template .report-header .header-title-row {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          text-align: center !important;
          margin: 6px 0 !important;
        }
        .r01-template .report-header .header-title-row .main-title {
          font-size: 20px !important;
          font-weight: bold !important;
          color: #000 !important;
          font-family: SimSun, serif !important;
          letter-spacing: 1px !important;
        }
        .r01-template .report-header .header-title-row .title-sub-bar {
          display: none !important;
        }
        .r01-template .report-header .header-sub-row {
          display: flex !important;
          justify-content: flex-end !important;
          width: 100% !important;
        }
        .r01-template .report-header .code-tag,
        .r01-template .report-header .format-tag {
          background: transparent !important;
          padding: 0 !important;
          color: #000 !important;
          font-family: SimSun, serif !important;
          font-size: 12px !important;
        }
        .r01-template .report-header .label-with-select {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          white-space: nowrap !important;
        }
        .r01-template .report-header .label-with-select .label,
        .r01-template .report-header .label-with-select .print-text-inline {
          font-size: 12px !important;
          font-weight: bold !important;
          font-family: SimSun, serif !important;
          color: #000000 !important;
        }
        .r01-template .table-container {
          width: 100% !important;
          border: none !important;
          margin-bottom: 12px !important;
        }
        .r01-template .report-table {
          width: 100% !important;
          border-collapse: collapse !important;
          table-layout: fixed !important;
        }
        .r01-template .report-table td {
          border: 1px solid #000000 !important;
          padding: 5px 8px !important;
          color: #000000 !important;
          font-family: SimSun, serif !important;
          font-size: 11px !important;
          background: transparent !important;
          vertical-align: middle !important;
        }
        .r01-template .report-table .side-label {
          font-family: SimSun, serif !important;
          background: transparent !important;
          color: #000 !important;
          border-right: 1px solid #000000 !important;
          width: 32px !important;
          text-align: center !important;
          vertical-align: middle !important;
          padding: 4px !important;
        }
        .r01-template .report-table .side-label .side-text-wrapper {
          writing-mode: horizontal-tb !important;
          width: 14px !important;
          margin: 0 auto !important;
          word-break: break-all !important;
          text-align: center !important;
          line-height: 1.4 !important;
          font-size: 11px !important;
          font-weight: bold !important;
          letter-spacing: 0 !important;
        }
        .r01-template .report-table .label-cell {
          background: transparent !important;
          color: #000000 !important;
          font-family: SimSun, serif !important;
          border-right: 1px solid #000000 !important;
          font-weight: bold !important;
          text-align: center !important;
        }
        .r01-template .report-table .seal-cell {
          background: transparent !important;
          width: 33% !important;
        }
        .r01-template .report-table .seal-container {
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          min-height: 140px !important;
        }
        .r01-template .report-table .seal-container .seal-title {
          font-size: 11px !important;
          color: #000 !important;
          text-align: center !important;
          line-height: 1.4 !important;
        }
        .r01-template .report-table .seal-container .seal-area {
          background: transparent !important;
          border: 1px dashed #000000 !important;
          height: 80px !important;
          min-height: 80px !important;
          display: block !important;
          margin: 8px 0 !important;
        }
        .r01-template .report-table .seal-container .seal-placeholder {
          display: none !important;
        }
        .r01-template .report-table .sign-area-wrapper {
          min-height: 20px !important;
          display: flex !important;
          align-items: center !important;
        }
        .r01-template .report-table .sign-area-wrapper.flex-between {
          position: relative !important;
          display: block !important;
          min-height: 44px !important;
          width: 100% !important;
        }
        .r01-template .report-table .sign-area-wrapper.flex-between .date-mark {
          position: absolute !important;
          bottom: 0px !important;
          right: 4px !important;
          font-size: 11px !important;
          color: #000000 !important;
        }
        .r01-template .report-table .sign-area-wrapper .sign-placeholder {
          display: none !important;
        }
        .r01-template .report-table .section-header-row td {
          border-top: 1px solid #000000 !important;
        }
        .r01-template .report-table .report-no-row td {
          border-top: 1px solid #000000 !important;
        }
        .r01-template .report-table .date-mark {
          color: #000 !important;
          font-size: 11px !important;
          text-align: right !important;
        }
        .r01-template .report-table .copies-row td {
          padding: 0 !important;
        }
        .r01-template .report-table .copies-flex-wrapper {
          display: table !important;
          width: 100% !important;
          table-layout: fixed !important;
        }
        .r01-template .report-table .copy-flex-card {
          display: table-cell !important;
          width: 20% !important;
          text-align: center !important;
          vertical-align: top !important;
          border: none !important;
          background: transparent !important;
          padding: 8px 4px !important;
          box-sizing: border-box !important;
        }
        .r01-template .report-table .copy-flex-card:not(:last-child) {
          border-right: 1px solid #000000 !important;
        }
        .r01-template .report-table .copy-flex-card .copy-badge {
          display: none !important;
        }
        .r01-template .report-table .copy-flex-card .copy-text {
          font-size: 11px !important;
          color: #000000 !important;
          line-height: 1.3 !important;
        }
        .r01-template .report-footer {
          border: none !important;
          margin-top: 12px !important;
          color: #000000 !important;
          font-family: SimSun, serif !important;
          font-size: 11px !important;
          display: flex !important;
          flex-direction: row !important;
          justify-content: space-between !important;
          align-items: center !important;
          width: 100% !important;
        }
        .r01-template .report-footer .footer-label {
          color: #000000 !important;
        }
        .r01-template .report-footer .footer-item {
          display: flex !important;
          align-items: center !important;
        }
        .r01-template .report-footer .placeholder-line {
          border-bottom: 1px solid #000000 !important;
          min-width: 120px !important;
          width: 120px !important;
          display: inline-block !important;
          height: 16px !important;
        }
        
        /* 4. Common通用报表 打印版面控制 */
        .common-template {
          background: transparent !important;
          padding: 0 !important;
          font-family: SimSun, serif !important;
          width: 100% !important;
        }
        .common-template .report-paper {
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .common-template .report-header {
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
          gap: 6px !important;
          margin-bottom: 12px !important;
        }
        .common-template .report-header .header-meta-row {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          width: 100% !important;
        }
        .common-template .report-header .header-title-row {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          text-align: center !important;
          margin: 6px 0 !important;
        }
        .common-template .report-header .header-title-row .main-title {
          font-size: 20px !important;
          font-weight: bold !important;
          color: #000 !important;
          font-family: SimSun, serif !important;
          letter-spacing: 1px !important;
        }
        .common-template .report-header .header-title-row .title-sub-bar {
          display: none !important;
        }
        .common-template .report-header .header-sub-row {
          display: flex !important;
          justify-content: flex-end !important;
          width: 100% !important;
        }
        .common-template .report-header .code-tag,
        .common-template .report-header .format-tag {
          background: transparent !important;
          padding: 0 !important;
          color: #000 !important;
          font-family: SimSun, serif !important;
          font-size: 12px !important;
        }
        .common-template .report-header .label-with-select {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          white-space: nowrap !important;
        }
        .common-template .report-header .label-with-select .label,
        .common-template .report-header .label-with-select .print-text-inline {
          font-size: 12px !important;
          font-weight: bold !important;
          font-family: SimSun, serif !important;
          color: #000000 !important;
        }
        .common-template .table-container {
          width: 100% !important;
          border: none !important;
          margin-bottom: 12px !important;
        }
        .common-template .report-table {
          width: 100% !important;
          border-collapse: collapse !important;
          table-layout: fixed !important;
        }
        .common-template .report-table td {
          border: 1px solid #000000 !important;
          padding: 5px 8px !important;
          color: #000000 !important;
          font-family: SimSun, serif !important;
          font-size: 12px !important;
          background: transparent !important;
          vertical-align: middle !important;
        }
        .common-template .report-table .label-cell {
          background: transparent !important;
          color: #000000 !important;
          font-family: SimSun, serif !important;
          border-right: 1px solid #000000 !important;
          font-weight: bold !important;
          text-align: center !important;
          white-space: nowrap !important;
          width: 120px !important;
        }
        .common-template .report-table .range-input-wrapper {
          display: flex !important;
          align-items: center !important;
        }
        .common-template .report-table .range-input-wrapper .range-badge {
          background: transparent !important;
          color: #000 !important;
          font-family: SimSun, serif !important;
          font-weight: normal !important;
          padding: 0 2px !important;
          border: none !important;
        }
        .common-template .report-table .sign-cell {
          background: transparent !important;
          width: 180px !important;
        }
        .common-template .report-table .sign-area-wrapper {
          min-height: 20px !important;
          display: flex !important;
          align-items: center !important;
        }
        .common-template .report-table .sign-area-wrapper .sign-placeholder {
          display: none !important;
        }
        .common-template .report-table .seal-cell {
          background: transparent !important;
          width: 180px !important;
        }
        .common-template .report-table .seal-container {
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          min-height: 100px !important;
        }
        .common-template .report-table .seal-area {
          background: transparent !important;
          border: none !important;
        }
        .common-template .report-table .seal-placeholder {
          display: none !important;
        }
        .common-template .report-table .date-mark {
          color: #000 !important;
          font-size: 11px !important;
          text-align: right !important;
        }
        .common-template .el-input__inner,
        .common-template .el-select .el-input__inner {
          border: none !important;
          padding: 0 !important;
          background: transparent !important;
          height: auto !important;
          line-height: inherit !important;
          color: #000000 !important;
          font-family: SimSun, serif !important;
          font-size: 12px !important;
        }
        .common-template .el-input__suffix,
        .common-template .el-input__prefix {
          display: none !important;
        }
        .common-template .report-footer {
          border: none !important;
          margin-top: 12px !important;
          padding: 0 !important;
          width: 100% !important;
        }
        .common-template .report-footer .footer-meta {
          display: flex !important;
          flex-direction: row !important;
          justify-content: space-between !important;
          align-items: center !important;
          width: 100% !important;
        }
        .common-template .report-footer .meta-item {
          color: #000000 !important;
          font-family: SimSun, serif !important;
          font-size: 11px !important;
        }
      `;

      newWin.document.write(`
        <html><head><title>${this.activeReport}报表打印</title>
        <style>
          ${printStyles}
        </style>
        </head><body>${printContent.innerHTML}</body></html>
      `)
      newWin.document.close()
      newWin.focus()
      newWin.print()
      newWin.close()
    },
    handleRowAction(action, row) {
      if (action === '新增') {
        this.tableData.push({ ...row, _isNew: true })
      } else if (action === '删除') {
        const idx = this.tableData.indexOf(row)
        if (idx > -1) this.tableData.splice(idx, 1)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
/* 报表报送中心极简现代美化 */
.report-center-wrapper {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 12px;
  background-color: #f1f5f9;

  .report-center-content {
    width: 100%;
    height: 100%;
    display: flex;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    overflow: hidden;

    .report-center-right {
      flex: 1;
      height: 100%;
      box-sizing: border-box;
      padding: 16px;
      display: flex;
      flex-direction: column;
      overflow-y: auto; /* 唯一的垂直滚动容器 */
      background-color: #f8fafc;
    }
  }
}

/* -------------------------------------------------------------
 * 1. 列表视图 - 极简白净看板与精简卡片
 * ------------------------------------------------------------- */
.hero-header-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);

  .hero-text {
    .hero-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 4px;
      display: flex;
      align-items: center;
      gap: 8px;

      .title-icon {
        font-size: 18px;
        color: #475569;
      }
    }
    .hero-subtitle {
      font-size: 12px;
      color: #64748b;
      margin: 0;
    }
  }

  .hero-stats {
    .stat-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 4px 10px;
      border-radius: 12px;

      .badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        &.pulse-blue {
          background-color: #3b82f6;
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          animation: badge-pulse 2s infinite;
        }
      }
      .badge-text {
        color: #475569;
        font-size: 12px;
        font-weight: 500;
      }
    }
  }
}

@keyframes badge-pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

/* 简约卡片 */
.card-row {
  margin-bottom: 4px;
}

.modern-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-sizing: border-box;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  min-height: 130px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .card-code-badge {
      font-size: 11px;
      font-weight: 700;
      color: #1e3a8a;
      background: #eff6ff;
      border: 1px solid rgba(37, 99, 235, 0.12);
      padding: 1px 8px;
      border-radius: 4px;
      font-family: Consolas, monospace;
    }

    .card-icon-wrapper {
      font-size: 16px;
      color: #94a3b8;
    }
  }

  .card-body {
    flex: 1;
    margin-bottom: 12px;

    .card-title {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 4px;
      line-height: 1.4;
    }

    .card-desc {
      font-size: 12px;
      color: #64748b;
      margin: 0;
      line-height: 1.4;
    }
  }

  .card-footer {
    border-top: 1px dashed #f1f5f9;
    padding-top: 8px;
    display: flex;
    align-items: center;

    .footer-action {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 2px;
      transition: color 0.15s;

      .action-arrow {
        font-size: 10px;
        transition: transform 0.15s;
      }
    }
  }

  /* 悬浮简约微光 */
  &:hover {
    transform: translateY(-2px);
    border-color: #cbd5e1;
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.04);
    
    .card-title {
      color: #246fe5;
    }
    .footer-action {
      color: #246fe5;
      .action-arrow {
        transform: translateX(2px);
      }
    }
  }
}

/* -------------------------------------------------------------
 * 2. 详情视图 - 紧凑工具栏与单色筛选区
 * ------------------------------------------------------------- */
.detail-header-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.01);

  .header-left-box {
    display: flex;
    align-items: center;
    gap: 12px;

    .modern-back-btn {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      color: #475569;
      font-weight: 500;
      padding: 7px 12px;
    }

    .report-meta-title {
      display: flex;
      align-items: center;
      gap: 8px;

      .meta-code {
        font-family: Consolas, monospace;
        font-weight: 700;
        font-size: 12px;
        background: #f1f5f9;
        color: #334155;
        padding: 1px 8px;
        border-radius: 4px;
        border: 1px solid #cbd5e1;
      }

      .meta-name {
        font-size: 14px;
        font-weight: 700;
        color: #0f172a;
      }
    }
  }

  .header-right-actions {
    display: flex;
    gap: 8px;

    .action-btn-save {
      font-weight: 500;
      border-radius: 6px;
      background-color: #246fe5;
      border-color: #246fe5;
    }

    .action-btn-export, .action-btn-print {
      background-color: #ffffff;
      border-color: #cbd5e1;
      color: #334155;
      font-weight: 500;
      border-radius: 6px;
      &:hover { background-color: #f8fafc; border-color: #94a3b8; }
    }
  }
}

/* 简约灰色筛选区 */
.filter-panel-area {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.01);

  .filter-panel-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f1f5f9;

    .panel-icon {
      font-size: 13px;
      color: #475569;
    }
    .panel-title {
      font-size: 12px;
      font-weight: 600;
      color: #334155;
    }
  }

  .modern-inline-form {
    .form-col {
      margin-bottom: 6px;
    }
    .row-col {
      margin-top: 2px;
      margin-bottom: 2px;
    }

    ::v-deep .modern-form-item {
      margin-bottom: 0 !important;
      margin-right: 0 !important;
      display: flex !important;
      align-items: center;

      .el-form-item__label {
        font-weight: 500;
        color: #475569;
        font-size: 12px;
        padding-right: 8px;
        line-height: 32px;
        width: 100px !important;
        text-align: right !important;
        flex-shrink: 0 !important;
      }

      .el-form-item__content {
        flex: 1;
        line-height: 32px;
      }
    }

    .form-item-inner-wrap {
      display: flex;
      align-items: center;
      width: 100%;
    }

    /* 筛选项高度、圆角细节 */
    ::v-deep {
      .modern-select-item, .modern-daterange-item, .modern-year-item {
        flex: 1;
        width: 100% !important;
        .el-input__inner {
          border-radius: 6px !important;
          border-color: #cbd5e1;
          height: 32px;
          line-height: 32px;
          font-size: 12px;
          &:hover { border-color: #94a3b8; }
          &:focus { border-color: #246fe5; }
        }
      }

      .modern-daterange-item {
        padding: 0 8px !important;
        height: 32px !important;
        line-height: 32px !important;
        border-color: #cbd5e1 !important;
        border-radius: 6px !important;
        &:hover { border-color: #94a3b8 !important; }
        &.is-active { border-color: #246fe5 !important; }
        .el-range-separator { line-height: 24px !important; color: #64748b !important; font-size: 12px; }
        .el-range-input { font-weight: 500 !important; font-size: 12px; }
      }

      .modern-select-full {
        width: 100% !important;
        .el-input__inner {
          border-radius: 6px !important;
          border-color: #cbd5e1;
          height: 32px;
          line-height: 32px;
          font-size: 12px;
        }
      }
    }

    /* 筛选操作动作按钮 */
    .search-trigger-btn {
      flex-shrink: 0;
      margin-left: 8px;
      border-radius: 6px;
      padding: 7px 12px;
      height: 32px;
      font-weight: 500;
      background-color: #246fe5;
      border-color: #246fe5;
      &:hover { background-color: #1d5ec2; border-color: #1d5ec2; }
    }
  }
}

/* -------------------------------------------------------------
 * 3. 详情视图 - 自然流动、不设限高度的报表背托纸张区
 * ------------------------------------------------------------- */
.paper-desk-wrapper {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.02);
  /* 重点：不设 max-height 也不限制 overflow-y，由界面内容彻底自动撑开！ */
}

.report-paper-container {
  width: 100%;
  max-width: 1000px;
  background-color: #ffffff;
}

/* -------------------------------------------------------------
 * 4. 详情视图 - 列表表格区块 (跟随页面垂直流动，不限制自身高度)
 * ------------------------------------------------------------- */
.table-card-container {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.01);
  margin-bottom: 8px;

  .table-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 6px;

      .marker {
        width: 3px;
        height: 12px;
        background-color: #246fe5;
        border-radius: 1px;
      }
      .title {
        font-size: 13px;
        font-weight: 700;
        color: #1e293b;
      }
    }

    .header-right {
      .table-stats {
        font-size: 11px;
        font-weight: 500;
        color: #64748b;
        background-color: #f1f5f9;
        padding: 2px 8px;
        border-radius: 10px;
      }
    }
  }

  .table-area {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;

    /* 覆盖表格，与 Demo 界面保持完美兼容，又融入极简蓝灰色调 */
    ::v-deep .modern-table {
      border: none;
      
      th.el-table__cell {
        background-color: #f8fafc !important;
        color: #475569 !important;
        font-weight: 600 !important;
        font-size: 12px !important;
        border-bottom: 1px solid #e2e8f0 !important;
        height: 36px;
        padding: 0;
      }

      td.el-table__cell {
        color: #334155 !important;
        font-size: 12px !important;
        border-bottom: 1px solid #f1f5f9 !important;
        height: 34px;
        padding: 0;
      }

      /* 针对多级表头着色加固 */
      .group-header {
        background-color: #f1f5f9 !important;
      }

      /* 行悬浮 */
      .el-table__row:hover > td {
        background-color: #f1f5f9 !important;
      }
    }
  }
}

/* 表单表格操作文字按钮 */
.table_operation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  .btn-text-action {
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.1s;

    &.primary-text {
      color: #246fe5;
      &:hover { color: #1d5ec2; }
    }

    &.danger-text {
      color: #ef4444;
      &:hover { color: #dc2626; }
    }
  }
}
</style>
