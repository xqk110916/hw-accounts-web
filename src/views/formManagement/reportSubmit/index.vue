<template>
  <div class="wrapper">
    <div class="content">
      <div class="right">
        <!-- 视图1: 卡片列表 -->
        <template v-if="currentView === 'list'">
          <el-row :gutter="16" class="card-row">
            <el-col :span="8" v-for="card in reportCards" :key="card.code">
              <el-card shadow="hover" class="report-card" @click.native="openReport(card.code)">
                <div class="card-header">
                  <span class="card-code">{{ card.code }}</span>
                </div>
                <div class="card-body">
                  <h3 class="card-title">{{ card.name }}</h3>
                  <p class="card-desc">{{ card.desc }}</p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </template>

        <!-- 视图2: 报表详情 -->
        <template v-else>
          <div class="detail-header">
            <el-button icon="el-icon-arrow-left" size="small" @click="goBack">返回</el-button>
            <div class="header-right">
              <el-button size="small" type="primary" @click="handleSave">保存</el-button>
              <el-button size="small" @click="handleExport">导出</el-button>
              <el-button size="small" icon="el-icon-printer" @click="handlePrint">打印</el-button>
            </div>
          </div>

          <!-- 筛选区 -->
          <div class="filter-area">
            <el-form :inline="true" size="small" :model="searchParams" label-width="80px">
              <template v-for="(item, idx) in currentSearchConfig">
                <el-col :span="item.col || 6" :key="'s_' + idx" v-if="!item.newRow" style="margin-bottom: 8px;">
                  <el-form-item :label="item.label">
                    <div style="display: flex; align-items: center;">
                      <el-select
                        v-if="item.type === 'select'"
                        v-model="searchParams[item.prop]"
                        :multiple="item.multiple"
                        :placeholder="'请选择'"
                        clearable
                        style="flex: 1;"
                      >
                        <el-option v-for="opt in item.option || []" :key="opt.value" :label="opt.label" :value="opt.value" />
                      </el-select>
                      <el-date-picker
                        v-else-if="item.type === 'daterange'"
                        v-model="searchParams[item.prop]"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        value-format="yyyy-MM-dd"
                        style="flex: 1;"
                      />
                      <el-date-picker
                        v-else-if="item.type === 'year'"
                        v-model="searchParams[item.prop]"
                        type="year"
                        value-format="yyyy"
                        placeholder="选择年份"
                        style="flex: 1;"
                      />
                      <el-button
                        v-if="item.actionBtn"
                        type="primary"
                        size="small"
                        style="margin-left: 8px;"
                        @click="handleAction(item.actionBtn)"
                      >{{ item.actionBtn }}</el-button>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="24" :key="'sr_' + idx" v-else style="margin-bottom: 8px;">
                  <el-form-item :label="item.label">
                    <el-select
                      v-model="searchParams[item.prop]"
                      :multiple="item.multiple"
                      placeholder="请选择"
                      clearable
                      style="width: 300px;"
                    >
                      <el-option v-for="opt in item.option || []" :key="opt.value" :label="opt.label" :value="opt.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </template>
            </el-form>
          </div>

          <!-- 报表模板区域（可打印） -->
          <div ref="printArea" class="report-template-area">
            <r01-template v-if="activeReport === 'R01'" :form-data="templateData" @update="updateTemplateData" />
            <common-template v-else :code="activeReport" :form-data="templateData" @update="updateTemplateData" />
          </div>

          <!-- 底部表格 -->
          <div class="table-area">
            <el-table
              ref="table"
              :data="tableData"
              border
              :height="tableHeight"
              style="width: 100%"
            >
              <template v-for="col in currentColumns">
                <!-- 序号列 -->
                <el-table-column v-if="col.type === 'index'" :key="col.label" type="index" :label="col.label" :width="col.width" align="center" />
                <!-- 操作列 -->
                <el-table-column v-else-if="col.type === 'operation'" :key="col.label" :label="col.label" :width="col.width" :fixed="col.fixed" align="center">
                  <template slot-scope="scope">
                    <div class="table_operation">
                      <span v-for="act in col.actions" :key="act" class="btn text" @click="handleRowAction(act, scope.row)">{{ act }}</span>
                    </div>
                  </template>
                </el-table-column>
                <!-- 多级表头 -->
                <el-table-column v-else-if="col.children" :key="col.label" :label="col.label" align="center">
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
                  :key="col.prop"
                  :prop="col.prop"
                  :label="col.label"
                  :min-width="col.minWidth"
                  show-overflow-tooltip
                  align="center"
                />
              </template>
            </el-table>
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
      tableHeight: 300,
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
  mounted() {
    window.addEventListener('resize', this.computedTableHeight)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.computedTableHeight)
  },
  methods: {
    openReport(code) {
      this.activeReport = code
      this.currentView = 'detail'
      this.searchParams = {}
      this.templateData = {}
      this.tableData = []
      this.$nextTick(() => this.computedTableHeight())
    },
    goBack() {
      this.currentView = 'list'
      this.activeReport = ''
    },
    computedTableHeight() {
      const rightDom = document.querySelector('.right')
      const rightH = rightDom ? rightDom.clientHeight : 0
      const headerDom = document.querySelector('.detail-header')
      const headerH = headerDom ? headerDom.clientHeight : 0
      const filterDom = document.querySelector('.filter-area')
      const filterH = filterDom ? filterDom.clientHeight : 0
      const templateDom = document.querySelector('.report-template-area')
      const templateH = templateDom ? templateDom.clientHeight : 0
      this.tableHeight = rightH - headerH - filterH - templateH - 120
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
      newWin.document.write(`
        <html><head><title>${this.activeReport}报表打印</title>
        <style>
          body { margin: 10px; font-family: SimSun, serif; }
          table { border-collapse: collapse; width: 100%; }
          td, th { border: 1px solid #000; padding: 6px 10px; text-align: center; font-size: 14px; }
          .report-title { text-align: center; font-size: 20px; font-weight: bold; margin: 16px 0; }
          .report-header { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
          .seal-area { min-height: 100px; }
          .footer-info { display: flex; justify-content: space-between; font-size: 12px; margin-top: 12px; }
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
.wrapper {
  width: 100%; height: 100%; box-sizing: border-box; padding: 16px;
  .content {
    width: 100%; height: 100%; display: flex; background: #fff;
    .right {
      flex: 1; height: 100%; box-sizing: border-box; padding: 16px; display: flex; flex-direction: column; overflow: auto;

      .card-row {
        .report-card {
          cursor: pointer; margin-bottom: 16px; transition: all 0.2s;
          &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
          .card-header {
            margin-bottom: 8px;
            .card-code {
              display: inline-block; background: #246fe5; color: #fff; padding: 2px 12px;
              border-radius: 3px; font-size: 14px; font-weight: bold;
            }
          }
          .card-body {
            .card-title { font-size: 15px; font-weight: bold; margin: 0 0 6px; color: #303133; }
            .card-desc { font-size: 13px; color: #909399; margin: 0; }
          }
        }
      }

      .detail-header {
        display: flex; justify-content: space-between; align-items: center;
        padding-bottom: 12px; border-bottom: 1px solid #e1e5eb; margin-bottom: 12px;
        .header-right { display: flex; gap: 8px; }
      }

      .filter-area {
        margin-bottom: 12px; padding: 12px; background: #f9fafb; border-radius: 4px;
      }

      .report-template-area {
        margin-bottom: 16px; flex-shrink: 0;
      }

      .table-area {
        flex: 1; overflow: hidden;
        ::v-deep .el-table th.el-table__cell { background: #f1f4f6; color: #626c78; }
        ::v-deep .el-table td.el-table__cell { color: #1b2129; }
      }
    }
  }

  .btn {
    display: inline-block; font-size: 14px; line-height: 22px; cursor: pointer;
    &.text { color: #246fe5; margin-right: 8px; }
  }
}

.table_operation {
  display: flex; justify-content: center; gap: 8px;
}
</style>
