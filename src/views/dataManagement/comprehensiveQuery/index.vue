<template>
  <div class="wrapper">
    <div class="content">
      <div class="right">
        <search-filter class="search" :options="search.options" :form="search.params">
          <div slot="footer" class="footer" style="padding-top: 4px;">
            <div :class="['btn', 'text']" @click="getTableList">查询</div>
            <div class="partition"></div>
            <div :class="['btn', 'text']" @click="resetSearchParams">重置</div>
          </div>
        </search-filter>
        <div class="operation-bar" v-if="btns.operation && btns.operation.length">
          <div
            v-for="item in btns.operation"
            :key="item.label"
            :class="['btn', item.type === 'primary' ? 'primary' : 'default-btn']"
            @click="handleBtnClick(item)"
          >
            {{ item.label }}
          </div>
        </div>
        <div class="table">
          <el-table ref="table" :data="tableData" highlight-current-row :height="height" style="width: 100%">
            <el-table-column
              v-for="(item, idx) in visibleTableKeys"
              :prop="item.prop"
              :label="item.label"
              :key="'col_' + item.prop + '_' + idx"
              show-overflow-tooltip
              :min-width="item.minWidth"
            >
              <template slot-scope="scope">
                <div v-if="item.type === 'slot'">
                  <div style="white-space: pre-wrap; line-height: 1.5; padding: 4px 0;">{{ scope.row[item.prop] }}</div>
                </div>
                <div v-else>{{ scope.row[item.prop] }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template slot-scope="scope">
                <div class="table_operation">
                  <div
                    v-for="item in btns.table"
                    :key="item.label"
                    :class="['btn', 'text']"
                    @click="e => handleBtnClick(item, scope.row)"
                  >
                    {{ item.label }}
                  </div>
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
    <detail ref="detail" />
    <column-manage-dialog
      ref="columnManage"
      :columns="allTableColumns"
      @confirm="handleColumnConfirm"
    />
  </div>
</template>

<script>
import detail from './components/detail.vue'
import ColumnManageDialog from './components/ColumnManageDialog.vue'
import { config, allTableColumns, requestFun, btns, getDefaultOptions, buildQueryParams, handleTbaleMap } from './components/index.js'
import { exportSummaryQuery } from './components/api.js'
import { blobSaveExcel } from '@/utils'

const COLUMN_STORAGE_KEY = 'column_visible_comprehensiveQuery'

export default {
  name: 'ComprehensiveQuery',
  components: { detail, ColumnManageDialog },
  data() {
    return {
      search: {
        params: {
          currentPage: 1,
          pageSize: 20,
          total: 0,
        },
        options: [],
      },
      tableData: [],
      height: 0,
      allTableColumns,
      visibleColumnProps: [],
      btns,
    }
  },
  computed: {
    visibleTableKeys() {
      if (!this.visibleColumnProps.length) return this.allTableColumns
      return this.visibleColumnProps
        .map(prop => this.allTableColumns.find(col => col.prop === prop))
        .filter(Boolean)
    },
  },
  async created() {
    this.initSearchOptions()
    await getDefaultOptions(this)
    this.loadColumnConfig()
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
      config.search.forEach(item => {
        this.search.options.push({ ...item })
        if (item.type !== 'daterange') {
          this.$set(this.search.params, item.prop, '')
        } else {
          this.$set(this.search.params, item.prop, [])
        }
      })
      this.search.options.push({ type: 'slot', slotName: 'footer', col: 6 })
    },
    loadColumnConfig() {
      const saved = localStorage.getItem(COLUMN_STORAGE_KEY)
      if (saved) {
        try {
          this.visibleColumnProps = JSON.parse(saved)
        } catch {
          this.visibleColumnProps = this.allTableColumns.map(c => c.prop)
        }
      } else {
        this.visibleColumnProps = this.allTableColumns.map(c => c.prop)
      }
    },
    handleColumnConfirm(selectedProps) {
      this.visibleColumnProps = [...selectedProps]
      localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(selectedProps))
      this.$nextTick(() => { this.$forceUpdate() })
    },
    computedTableHeight() {
      const rightDom = document.querySelector('.right')
      const rightH = rightDom ? rightDom.clientHeight : 0
      const searchDom = document.querySelector('.search')
      const searchH = searchDom ? searchDom.clientHeight : 0
      const operationDom = document.querySelector('.operation-bar')
      const operationH = operationDom ? operationDom.clientHeight : 0
      this.height = rightH - searchH - operationH - 90
    },
    handleBtnClick(item, payload) {
      if (item.fn) {
        item.fn(payload)
      } else if (item.execute) {
        switch (item.execute) {
          case 'view':
            this.$refs.detail.open(payload)
            break
          case 'export':
            this.handleExport()
            break
          case 'columnManage':
            this.$refs.columnManage.open(this.visibleColumnProps)
            break
        }
      }
    },
    getTableList() {
      this.tableData = []
      const params = buildQueryParams(this.search.params)
      return requestFun.list(params).then(res => {
        if (res.code === 1) {
          let data = res.data.list || []
          const page = res.data.pagination || {}
          if (handleTbaleMap) data = handleTbaleMap(data)
          this.tableData = data
          this.search.params.total = page.total
        }
      })
    },
    handleExport() {
      const params = buildQueryParams(this.search.params)
      exportSummaryQuery(params).then(res => {
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
        const disposition = res.headers && res.headers['content-disposition']
        let fileName = '综合查询导出'
        if (disposition) {
          const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^";\n]+)/i)
          if (match && match[1]) fileName = decodeURIComponent(match[1].replace(/['"]/g, ''))
        }
        blobSaveExcel(blob, fileName)
      })
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
      const defaultParams = { currentPage: 1, pageSize: this.search.params.pageSize, total: 0 }
      this.search.params = defaultParams
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

      .operation-bar {
        height: 32px;
        margin-top: 4px;
        margin-bottom: 6px;
        text-align: right;
      }
      .table {
        margin-top: 10px;
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
            font-size: 14px;
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

    &.text {
      color: #246fe5;
    }
    &.primary {
      padding: 5px 16px;
      border-radius: 3px;
      background: #246fe5;
      color: #fff;
    }
    &.default-btn {
      padding: 5px 16px;
      border-radius: 3px;
      background: #fff;
      border: 1px solid #246fe5;
      color: #246fe5;
    }
  }
  .btn + .btn {
    margin-left: 10px;
  }
}

.table_operation {
  display: flex;
  flex-wrap: wrap;
}
</style>
