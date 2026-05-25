<template>
  <div class="wrapper">
    <div class="content">
      <div class="right">
        <el-tabs v-model="activeTab" class="report-tabs" @tab-click="handleTabChange">
          <el-tab-pane label="总账" name="tab1" />
          <el-tab-pane label="总账明细" name="tab2" />
          <el-tab-pane label="库房账明细" name="tab3" />
          <el-tab-pane label="生产单位明细账" name="tab4" />
          <el-tab-pane label="材料账明细" name="tab5" />
        </el-tabs>

        <search-filter class="search" :options="search.options" :form="search.params">
          <div slot="footer" class="footer" style="padding-top: 4px;">
            <div :class="['btn', 'text']" @click="handleQuery">查询</div>
            <div class="partition"></div>
            <div :class="['btn', 'text']" @click="resetSearchParams">重置</div>
          </div>
        </search-filter>

        <div class="operation-bar">
          <div class="btn default-btn" @click="handleExport">导出</div>
        </div>

        <!-- Tab 1: 总账 - 单表格 + 标题 -->
        <template v-if="activeTab === 'tab1'">
          <h2 class="account-title">{{ accountTitle }}</h2>
          <div class="table-area">
            <el-table ref="table" :data="tableData" border highlight-current-row :height="height" style="width: 100%">
              <el-table-column
                v-for="item in tab1Config.table"
                :prop="item.prop"
                :label="item.label"
                :key="item.prop"
                show-overflow-tooltip
                :min-width="item.minWidth"
              />
            </el-table>
            <div class="pagination">
              <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="search.params.currentPage"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="search.params.pageSize"
                background
                layout="total, sizes, prev, pager, next"
                :total="search.params.total"
              />
            </div>
          </div>
        </template>

        <!-- Tab 2-5: 上下分栏 -->
        <template v-else>
          <h2 class="account-title">{{ accountTitle }}</h2>
          <div class="split-container">
            <div class="split-top">
              <div class="split-header">
                <span>汇总</span>
              </div>
              <summary-table :data="summaryData" :height="splitTopHeight" />
            </div>
            <div class="split-divider"></div>
            <div class="split-bottom">
              <div class="split-header">
                <span>明细</span>
              </div>
              <detail-table
                ref="detailTable"
                :columns="detailTableColumns"
                :height="splitBottomHeight"
                @page-change="loadDetailData"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import SummaryTable from './components/SummaryTable.vue'
import DetailTable from './components/DetailTable.vue'
import {
  tabConfigs, tab1Config, detailTableColumns, requestFun,
  getDefaultOptions, buildQueryParams,
} from './components/index.js'
import { blobSaveExcel } from '@/utils'

export default {
  name: 'AccountManagement',
  components: { SummaryTable, DetailTable },
  data() {
    return {
      activeTab: 'tab1',
      search: {
        params: { currentPage: 1, pageSize: 20, total: 0 },
        options: [],
      },
      tableData: [],
      summaryData: [],
      accountTitle: '',
      height: 400,
      splitTopHeight: 200,
      splitBottomHeight: 200,
      warehouseOptions: [],
    }
  },
  computed: {
    tab1Config: () => tab1Config,
    detailTableColumns: () => detailTableColumns,
    currentConfig() {
      return tabConfigs[this.activeTab]
    },
  },
  async created() {
    this.initSearchOptions()
    await getDefaultOptions(this)
    this.loadCurrentTab()
  },
  mounted() {
    setTimeout(() => { this.computedTableHeight() }, 0)
    window.addEventListener('resize', this.computedTableHeight)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.computedTableHeight)
  },
  methods: {
    initSearchOptions() {
      const config = this.currentConfig
      if (!config) return
      config.search.forEach(item => {
        this.search.options.push({ ...item })
        if (item.type !== 'daterange') {
          this.$set(this.search.params, item.prop, item.multiple ? [] : '')
        } else {
          this.$set(this.search.params, item.prop, [])
        }
      })
      this.search.options.push({ type: 'slot', slotName: 'footer', col: 6 })
    },
    rebuildSearchOptions() {
      this.search.options = []
      this.search.params = { currentPage: 1, pageSize: this.search.params.pageSize, total: 0 }
      this.initSearchOptions()
      getDefaultOptions(this)
    },
    computedTableHeight() {
      const rightDom = document.querySelector('.right')
      const rightH = rightDom ? rightDom.clientHeight : 0
      const tabsDom = document.querySelector('.report-tabs')
      const tabsH = tabsDom ? tabsDom.clientHeight : 0
      const searchDom = document.querySelector('.search')
      const searchH = searchDom ? searchDom.clientHeight : 0
      const opDom = document.querySelector('.operation-bar')
      const opH = opDom ? opDom.clientHeight : 0
      const titleDom = document.querySelector('.account-title')
      const titleH = titleDom ? titleDom.clientHeight : 0

      const available = rightH - tabsH - searchH - opH - titleH - 100

      if (this.activeTab === 'tab1') {
        this.height = available
      } else {
        this.splitTopHeight = Math.floor(available * 0.42)
        this.splitBottomHeight = available - this.splitTopHeight - 60
      }
    },
    handleTabChange() {
      this.rebuildSearchOptions()
      this.loadCurrentTab()
      this.$nextTick(() => { this.computedTableHeight() })
    },
    loadCurrentTab() {
      this.updateAccountTitle()
      if (this.activeTab === 'tab1') {
        this.loadLedgerData()
      } else {
        this.loadSummaryAndDetail()
      }
    },
    updateAccountTitle() {
      const config = this.currentConfig
      if (!config || !config.titleTemplate) {
        this.accountTitle = ''
        return
      }
      this.accountTitle = config.titleTemplate({
        ...this.search.params,
        warehouseOptions: this.warehouseOptions,
      })
    },
    loadLedgerData() {
      const params = buildQueryParams(this.search.params)
      requestFun.ledgerList(params).then(res => {
        if (res.code === 1) {
          this.tableData = res.data?.list || []
          this.search.params.total = res.data?.pagination?.total || 0
        }
      })
      if (!this.accountTitle && this.search.params.year) {
        this.accountTitle = `${this.search.params.year}年总账`
      }
    },
    loadSummaryAndDetail() {
      const params = buildQueryParams(this.search.params)
      requestFun.ledgerSummary(params).then(res => {
        if (res.code === 1) {
          this.summaryData = res.data || []
        }
      })
      this.$nextTick(() => {
        if (this.$refs.detailTable) {
          this.$refs.detailTable.resetPage()
          this.loadDetailData()
        }
      })
    },
    loadDetailData() {
      const params = buildQueryParams(this.search.params)
      if (this.$refs.detailTable) {
        this.$refs.detailTable.loadData(requestFun.ledgerDetail, params)
      }
    },
    handleQuery() {
      this.search.params.currentPage = 1
      this.updateAccountTitle()
      if (this.activeTab === 'tab1') {
        this.loadLedgerData()
      } else {
        this.loadSummaryAndDetail()
      }
    },
    handleExport() {
      const params = buildQueryParams(this.search.params)
      let fn
      if (this.activeTab === 'tab1') {
        fn = requestFun.ledgerExport
      } else {
        fn = requestFun.detailExport
      }
      fn(params).then(res => {
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
        const disposition = res.headers && res.headers['content-disposition']
        let fileName = '账目数据导出'
        if (disposition) {
          const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^";\n]+)/i)
          if (match && match[1]) fileName = decodeURIComponent(match[1].replace(/['"]/g, ''))
        }
        blobSaveExcel(blob, fileName)
      })
    },
    handleSizeChange(value) {
      this.search.params.pageSize = value
      this.loadLedgerData()
    },
    handleCurrentChange(value) {
      this.search.params.currentPage = value
      this.loadLedgerData()
    },
    resetSearchParams() {
      this.search.params = { currentPage: 1, pageSize: this.search.params.pageSize, total: 0 }
      this.rebuildSearchOptions()
      this.loadCurrentTab()
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
      flex: 1; height: 100%; box-sizing: border-box; padding: 16px; display: flex; flex-direction: column; overflow: hidden;

      .report-tabs {
        ::v-deep .el-tabs__header { margin-bottom: 8px; }
      }

      .search {
        .footer {
          height: 34px; display: flex; align-items: center; margin-left: 5px;
          .partition { width: 1px; height: 14px; background: #e1e5eb; margin: 0 12px; }
        }
      }

      .operation-bar {
        height: 32px; margin-top: 4px; margin-bottom: 6px; text-align: right;
      }

      .account-title {
        text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #303133;
      }

      .table-area {
        flex: 1; display: flex; flex-direction: column; overflow: hidden;
        .pagination {
          display: flex; justify-content: flex-end; margin-top: 10px; color: #626c78;
          ::v-deep .el-pager .number { background: #fff; border: 1px solid #c4c9cf; border-radius: 4px; }
          ::v-deep .el-pager .active { background: #cce6ff; color: #246fe5; border: 1px solid #246fe5; }
        }
      }

      .split-container {
        flex: 1; display: flex; flex-direction: column; overflow: hidden;

        .split-top { flex: 0 0 auto; overflow: auto; }
        .split-divider { height: 6px; background: #e1e5eb; margin: 8px 0; border-radius: 3px; }
        .split-bottom { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

        .split-header {
          font-size: 14px; font-weight: bold; margin-bottom: 6px; color: #303133;
          display: flex; justify-content: space-between; align-items: center;
        }
      }

      ::v-deep .el-table th.el-table__cell { background: #f1f4f6; color: #626c78; }
      ::v-deep .el-table td.el-table__cell { color: #1b2129; }
    }
  }

  .btn {
    display: inline-block; font-size: 14px; line-height: 22px; cursor: pointer;
    &.text { color: #246fe5; }
    &.default-btn {
      padding: 5px 16px; border-radius: 3px; background: #fff; border: 1px solid #246fe5; color: #246fe5;
    }
  }
}
</style>
