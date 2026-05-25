<template>
  <div class="wrapper">
    <div class="content">
      <div class="right">
        <search-filter class="search" :options="search.options" :form="search.params">
          <div slot="footer" class="footer" style="padding-top: 4px;">
            <div :class="['btn', 'text']" @click="handleQuery">查询</div>
            <div class="partition"></div>
            <div :class="['btn', 'text']" @click="resetSearchParams">重置</div>
          </div>
        </search-filter>
        <div class="tab-bar">
          <el-tabs v-model="activeTab" class="report-tabs" @tab-click="handleTabChange">
            <el-tab-pane label="汇总" name="summary" />
            <el-tab-pane label="明细" name="detail" />
          </el-tabs>
          <el-button size="small" @click="handleExport">导出</el-button>
        </div>
        <div class="statistics" v-if="activeTab === 'summary'">
          <span>总入库：<span class="stat-value">{{ summaryStats.inboundCount || 0 }}（{{ summaryStats.inboundWeight || 0 }}）</span></span>
          <span style="margin-left: 30px;">总出库：<span class="stat-value">{{ summaryStats.outboundCount || 0 }}（{{ summaryStats.outboundWeight || 0 }}）</span></span>
        </div>
        <div class="table">
          <el-table ref="table" :data="tableData" border highlight-current-row :height="height" style="width: 100%">
            <el-table-column
              v-for="item in currentTableKeys"
              :prop="item.prop"
              :label="item.label"
              :key="item.prop"
              show-overflow-tooltip
              :min-width="item.minWidth"
            >
              <template slot-scope="scope">
                <el-tag v-if="item.type === 'tag'" :type="scope.row.type === 1 ? 'success' : 'danger'" size="small">
                  {{ scope.row[item.prop] }}
                </el-tag>
                <div v-else>{{ scope.row[item.prop] }}</div>
              </template>
            </el-table-column>
            <el-table-column v-if="activeTab === 'summary'" label="操作" width="80" fixed="right">
              <template slot-scope="scope">
                <div class="table_operation">
                  <div class="btn text" @click="openDetail(scope.row)">详情</div>
                </div>
              </template>
            </el-table-column>
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
      </div>
    </div>
    <summary-detail-dialog ref="summaryDetailDialog" />
  </div>
</template>

<script>
import SummaryDetailDialog from './components/SummaryDetailDialog.vue'
import { configSummary, configDetail, searchConfig, requestFun, getDefaultOptions, buildQueryParams } from './components/index.js'
import { blobSaveExcel } from '@/utils'

export default {
  name: 'ChangeReport',
  components: { SummaryDetailDialog },
  data() {
    return {
      activeTab: 'summary',
      search: {
        params: { currentPage: 1, pageSize: 20, total: 0 },
        options: [],
      },
      tableData: [],
      summaryStats: {},
      height: 0,
    }
  },
  computed: {
    currentTableKeys() {
      return this.activeTab === 'summary' ? configSummary.table : configDetail.table
    },
  },
  async created() {
    this.initSearchOptions()
    await getDefaultOptions(this)
    this.getTableList()
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
      searchConfig.forEach(item => {
        this.search.options.push({ ...item })
        if (item.type !== 'daterange') {
          this.$set(this.search.params, item.prop, item.multiple ? [] : '')
        } else {
          this.$set(this.search.params, item.prop, [])
        }
      })
      this.search.options.push({ type: 'slot', slotName: 'footer', col: 6 })
    },
    computedTableHeight() {
      const rightDom = document.querySelector('.right')
      const rightH = rightDom ? rightDom.clientHeight : 0
      const searchDom = document.querySelector('.search')
      const searchH = searchDom ? searchDom.clientHeight : 0
      const tabsDom = document.querySelector('.tab-bar')
      const tabsH = tabsDom ? tabsDom.clientHeight : 0
      const statsDom = document.querySelector('.statistics')
      const statsH = statsDom ? statsDom.clientHeight : 0
      this.height = rightH - searchH - tabsH - statsH - 90
    },
    handleQuery() {
      this.search.params.currentPage = 1
      this.getTableList()
    },
    handleTabChange() {
      this.search.params.currentPage = 1
      this.tableData = []
      this.getTableList()
    },
    getTableList() {
      const params = buildQueryParams(this.search.params)
      const fn = this.activeTab === 'summary' ? requestFun.summaryList : requestFun.detailList
      fn(params).then(res => {
        if (res.code === 1) {
          this.tableData = res.data?.list || []
          this.search.params.total = res.data?.pagination?.total || 0
        }
      })
      if (this.activeTab === 'summary') {
        this.getSummaryStatistics(params)
      }
    },
    getSummaryStatistics(params) {
      requestFun.summaryStatistics(params).then(res => {
        if (res.code === 1) {
          this.summaryStats = res.data || {}
        }
      }).catch(() => {
        this.summaryStats = {}
      })
    },
    handleExport() {
      const params = buildQueryParams(this.search.params)
      const fn = this.activeTab === 'summary' ? requestFun.summaryExport : requestFun.detailExport
      fn(params).then(res => {
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
        const disposition = res.headers && res.headers['content-disposition']
        let fileName = this.activeTab === 'summary' ? '变化量汇总报表' : '变化量明细报表'
        if (disposition) {
          const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^";\n]+)/i)
          if (match && match[1]) fileName = decodeURIComponent(match[1].replace(/['"]/g, ''))
        }
        blobSaveExcel(blob, fileName)
      })
    },
    openDetail(row) {
      this.$refs.summaryDetailDialog.open(row.goodsCode)
    },
    handleSizeChange(value) {
      this.search.params.pageSize = value
      this.getTableList()
    },
    handleCurrentChange(value) {
      this.search.params.currentPage = value
      this.getTableList()
    },
    resetSearchParams() {
      this.search.params = { currentPage: 1, pageSize: this.search.params.pageSize, total: 0 }
      this.initSearchOptions()
      this.getTableList()
    },
  },
}
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 16px;
  .content {
    width: 100%;
    height: 100%;
    display: flex;
    background: #fff;
    .right {
      flex: 1;
      height: 100%;
      box-sizing: border-box;
      padding: 16px;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .tab-bar {
        position: relative;
        .report-tabs {
          ::v-deep .el-tabs__header { margin-bottom: 8px; }
        }
        .el-button {
          position: absolute;
          right: 0;
          top: 0;
        }
      }

      .search {
        .footer {
          height: 34px;
          display: flex;
          align-items: center;
          margin-left: 5px;
          .partition {
            width: 1px;
            height: 14px;
            background: #e1e5eb;
            margin: 0 12px;
          }
        }
      }

      .statistics {
        font-size: 15px;
        font-weight: bold;
        margin-bottom: 10px;
        padding: 8px 0;
        .stat-value {
          color: #d32f2f;
          font-weight: 600;
        }
      }

      .table {
        flex: 1;
        .pagination {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
          color: #626c78;
          ::v-deep .el-pager .number {
            background: #fff;
            border: 1px solid #c4c9cf;
            border-radius: 4px;
          }
          ::v-deep .el-pager .active {
            background: #cce6ff;
            color: #246fe5;
            border: 1px solid #246fe5;
          }
        }
        ::v-deep .el-table th.el-table__cell {
          background: #f1f4f6;
          color: #626c78;
        }
        ::v-deep .el-table td.el-table__cell {
          color: #1b2129;
        }
      }
    }
  }

  .btn {
    display: inline-block;
    font-size: 14px;
    line-height: 22px;
    cursor: pointer;
    &.text { color: #246fe5; }
    &.default-btn {
      padding: 5px 16px;
      border-radius: 3px;
      background: #fff;
      border: 1px solid #246fe5;
      color: #246fe5;
    }
  }
}

.table_operation {
  display: flex;
  flex-wrap: wrap;
}
</style>
