<template>
  <div class="wrapper">
    <div class="content">
      <div class="right">
        <search-filter class="search" :options="searchOptions" :form="searchForm">
          <div slot="footer" class="footer">
            <div :class="['btn', 'text']" @click="handleQuery">查询</div>
            <div class="partition"></div>
            <div :class="['btn', 'text']" @click="handleReset">重置</div>
          </div>
        </search-filter>
        <div class="operation">
          <div :class="['btn', 'primary']" @click="handleAdd">添加</div>
        </div>
        <div class="table">
          <el-table
            ref="table"
            v-loading="listLoading"
            :data="tableData"
            highlight-current-row
            :height="height"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="operationType" label="数据类型" min-width="120" show-overflow-tooltip></el-table-column>
            <el-table-column prop="createTime" label="导入时间" min-width="170" show-overflow-tooltip></el-table-column>
            <el-table-column prop="createUname" label="导入人" min-width="100" show-overflow-tooltip></el-table-column>
            <el-table-column prop="auditTime" label="审批时间" min-width="170" show-overflow-tooltip></el-table-column>
            <el-table-column prop="auditUserName" label="审批人" min-width="100" show-overflow-tooltip></el-table-column>
            <el-table-column prop="dataTotal" label="数据条数" min-width="100" show-overflow-tooltip></el-table-column>
            <el-table-column prop="dataStatus" label="状态" min-width="110" show-overflow-tooltip>
              <template slot-scope="scope">
                <span :class="['status-tag', getStatusClass(scope.row.dataStatus)]">{{ getStatusText(scope.row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template slot-scope="scope">
                <div class="table_operation">
                  <div
                    v-for="item in getRowActions(scope.row)"
                    :key="item.label"
                    :class="['btn', 'text']"
                    @click="handleRowAction(item.execute, scope.row)"
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
              :current-page="searchForm.currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="searchForm.pageSize"
              background
              layout="total, sizes, prev, pager, next"
              :total="searchForm.total"
            >
            </el-pagination>
          </div>
        </div>
      </div>
    </div>
    <import-dialog ref="importDialog" @saved="handleQuery"></import-dialog>
    <approve-dialog ref="approveDialog" @saved="handleQuery"></approve-dialog>
  </div>
</template>

<script>
import ImportDialog from './components/ImportDialog.vue'
import ApproveDialog from './components/ApproveDialog.vue'
import { listInitialEntry, deleteInitialEntry, submitInitialEntryById } from './components/api.js'

export default {
  name: 'InitialEntry',
  components: { ImportDialog, ApproveDialog },
  data() {
    return {
      searchForm: {
        addTimeRange: [],
        dataStatusList: ['all'],
        currentPage: 1,
        pageSize: 20,
        total: 0,
      },
      searchOptions: [
        { label: '添加时间', prop: 'addTimeRange', type: 'daterange', col: 7 },
        {
          label: '状态',
          prop: 'dataStatusList',
          type: 'select',
          multiple: true,
          col: 8,
          option: [
            { label: '全部', value: 'all' },
            { label: '待提交', value: 2 },
            { label: '待审核', value: 3 },
            { label: '审核通过', value: 4 },
            { label: '审核拒绝', value: 5 },
          ],
        },
        { type: 'slot', slotName: 'footer', col: 4 },
      ],
      tableData: [],
      selectedRows: [],
      listLoading: false,
      submitLoading: false,
      height: 0,
    }
  },
  watch: {
    'searchForm.dataStatusList'(value) {
      if (!Array.isArray(value) || !value.length) {
        this.searchForm.dataStatusList = ['all']
        return
      }
      const lastValue = value[value.length - 1]
      if (lastValue === 'all' && value.length > 1) {
        this.searchForm.dataStatusList = ['all']
      } else if (lastValue !== 'all' && value.indexOf('all') > -1) {
        this.searchForm.dataStatusList = value.filter(item => item !== 'all')
      }
    },
  },
  created() {
    this.handleQuery()
  },
  mounted() {
    this.$nextTick(this.computedTableHeight)
    window.addEventListener('resize', this.computedTableHeight)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.computedTableHeight)
  },
  methods: {
    computedTableHeight() {
      let rightDom = document.querySelector('.right')
      let rightDomHeight = rightDom ? rightDom.clientHeight : 0
      let searchDom = document.querySelector('.search')
      let searchDomHeight = searchDom ? searchDom.clientHeight : 0
      let operationDom = document.querySelector('.operation')
      let operationDomHeight = operationDom ? operationDom.clientHeight : 0
      this.height = rightDomHeight - searchDomHeight - operationDomHeight - 90
    },
    async handleQuery() {
      if (!this.validateDateRange()) return
      this.listLoading = true
      try {
        const params = this.buildQueryParams()
        const res = await listInitialEntry(params)
        if (res && res.code === 1) {
          const data = res.data || {}
          this.tableData = data.list || []
          this.searchForm.total = Number(data.pagination ? data.pagination.total : 0)
        } else {
          this.tableData = []
          this.searchForm.total = 0
        }
      } catch (e) {
        this.tableData = []
        this.searchForm.total = 0
      } finally {
        this.listLoading = false
      }
    },
    buildQueryParams() {
      const dateRange = this.searchForm.addTimeRange || []
      const statusList = this.searchForm.dataStatusList || []
      return {
        currentPage: this.searchForm.currentPage,
        pageSize: this.searchForm.pageSize,
        startTime: dateRange[0] || '',
        endTime: dateRange[1] || '',
        statusList: statusList.indexOf('all') > -1 ? [] : statusList,
      }
    },
    validateDateRange() {
      const dateRange = this.searchForm.addTimeRange
      if (Array.isArray(dateRange) && dateRange.length === 2 && dateRange[0] > dateRange[1]) {
        this.$message.warning('开始日期不得晚于结束日期')
        return false
      }
      return true
    },
    handleReset() {
      this.searchForm.addTimeRange = []
      this.searchForm.dataStatusList = ['all']
      this.searchForm.currentPage = 1
      this.searchForm.pageSize = 20
      this.handleQuery()
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows
    },
    handleAdd() {
      this.$refs.importDialog.open(null, 'add')
    },
    handleRowAction(type, row) {
      if (type === 'view') this.$refs.importDialog.open(row, 'view')
      if (type === 'audit') this.$refs.approveDialog.open(row)
      if (type === 'edit') this.$refs.importDialog.open(row, 'edit')
      if (type === 'delete') this.handleDelete(row)
      if (type === 'submit') this.handleSubmit(row)
    },
    getRowActions(row) {
      const actions = [{ label: '详情', execute: 'view' }]
      const dataStatus = Number(row.dataStatus)

      if (dataStatus === 3) actions.push({ label: '审核', execute: 'audit' })
      if (dataStatus === 2 || dataStatus === 5) {
        actions.push({ label: '编辑', execute: 'edit' })
        actions.push({ label: '提交', execute: 'submit' })
        actions.push({ label: '删除', execute: 'delete' })
      }
      return actions
    },
    async handleDelete(row) {
      await this.$confirm('确定要删除吗?', '提示', { type: 'warning' })
      this.submitLoading = true
      try {
        const res = await deleteInitialEntry(row.id)
        if (!res || res.code === 1) {
          this.$message.success('删除成功')
          this.handleQuery()
        }
      } finally {
        this.submitLoading = false
      }
    },
    async handleSubmit(row) {
      const dataStatus = Number(row.dataStatus)
      if (dataStatus !== 2 && dataStatus !== 5) {
        this.$message.warning('当前状态不可提交')
        return
      }
      await this.$confirm('确定要提交吗?', '提示', { type: 'warning' })
      this.submitLoading = true
      try {
        const res = await submitInitialEntryById(row.id)
        if (!res || res.code === 1) {
          this.$message.success('提交成功')
          this.handleQuery()
        }
      } finally {
        this.submitLoading = false
      }
    },
    handleSizeChange(value) {
      this.searchForm.pageSize = value
      this.handleQuery()
    },
    handleCurrentChange(value) {
      this.searchForm.currentPage = value
      this.handleQuery()
    },
    getStatusText(row) {
      if (row && row.statusDesc !== undefined && row.statusDesc !== null && row.statusDesc !== '') return row.statusDesc
      const map = {
        2: '待提交',
        3: '待审核',
        4: '审核通过',
        5: '审核拒绝',
      }
      return map[Number(row && row.dataStatus)] || ''
    },
    getStatusClass(status) {
      const map = {
        2: 'status-default',
        3: 'status-pending',
        4: 'status-approved',
        5: 'status-rejected',
      }
      return map[Number(status)] || 'status-default'
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
      .operation {
        height: 32px;
        margin-top: 4px;
        margin-bottom: 6px;
      }
      .table {
        margin-top: 10px;
        flex: 1;
        .table_operation {
          display: flex;
          flex-wrap: wrap;
        }
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
  }
  .btn + .btn {
    margin-left: 10px;
  }
}
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  &.status-default {
    background: #edf1f5;
    color: #424c59;
  }
  &.status-pending {
    background: #fff0cc;
    color: #e68600;
  }
  &.status-approved {
    background: #e8f5e9;
    color: #2e7d32;
  }
  &.status-rejected {
    background: #ffebee;
    color: #c62828;
  }
}
</style>
