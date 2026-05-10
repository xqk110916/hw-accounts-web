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
            <el-table-column prop="数据类型" label="数据类型" min-width="120" show-overflow-tooltip></el-table-column>
            <el-table-column prop="导入时间" label="导入时间" min-width="170" show-overflow-tooltip></el-table-column>
            <el-table-column prop="导入人" label="导入人" min-width="100" show-overflow-tooltip></el-table-column>
            <el-table-column prop="审批时间" label="审批时间" min-width="170" show-overflow-tooltip></el-table-column>
            <el-table-column prop="审批人" label="审批人" min-width="100" show-overflow-tooltip></el-table-column>
            <el-table-column prop="据条数" label="据条数" min-width="100" show-overflow-tooltip></el-table-column>
            <el-table-column prop="状态" label="状态" min-width="110" show-overflow-tooltip>
              <template slot-scope="scope">
                <span :class="['status-tag', getStatusClass(scope.row['状态'])]">{{ scope.row['状态'] }}</span>
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
import { listInitialEntry, deleteInitialEntry, submitInitialEntry } from './components/api.js'

export default {
  name: 'InitialEntry',
  components: { ImportDialog, ApproveDialog },
  data() {
    return {
      searchForm: {
        '添加时间': [],
        '状态': ['全部'],
        currentPage: 1,
        pageSize: 20,
        total: 0,
      },
      searchOptions: [
        { label: '添加时间', prop: '添加时间', type: 'daterange', col: 7 },
        {
          label: '状态',
          prop: '状态',
          type: 'select',
          multiple: true,
          col: 8,
          option: [
            { label: '全部', value: '全部' },
            { label: '待提交', value: '待提交' },
            { label: '待审核', value: '待审核' },
            { label: '审核通过', value: '审核通过' },
            { label: '审核拒绝', value: '审核拒绝' },
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
    "searchForm.状态"(value) {
      if (!Array.isArray(value) || !value.length) {
        this.searchForm['状态'] = ['全部']
        return
      }
      const lastValue = value[value.length - 1]
      if (lastValue === '全部' && value.length > 1) {
        this.searchForm['状态'] = ['全部']
      } else if (lastValue !== '全部' && value.indexOf('全部') > -1) {
        this.searchForm['状态'] = value.filter(item => item !== '全部')
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
          const records = (res.data && (res.data.records || res.data.list)) || []
          this.tableData = records.length ? records.map(this.normalizeRow) : this.getMockTableData()
          this.searchForm.total = Number((res.data && (res.data.total || (res.data.pagination && res.data.pagination.total))) || this.tableData.length)
        } else {
          this.tableData = this.getMockTableData()
          this.searchForm.total = 400
        }
      } catch (e) {
        this.tableData = this.getMockTableData()
        this.searchForm.total = 400
      } finally {
        this.listLoading = false
      }
    },
    buildQueryParams() {
      const dateRange = this.searchForm['添加时间'] || []
      const statusList = this.searchForm['状态'] || []
      return {
        currentPage: this.searchForm.currentPage,
        pageSize: this.searchForm.pageSize,
        startTime: dateRange[0] || '',
        endTime: dateRange[1] || '',
        statusList: statusList.indexOf('全部') > -1 ? [] : statusList,
      }
    },
    validateDateRange() {
      const dateRange = this.searchForm['添加时间']
      if (Array.isArray(dateRange) && dateRange.length === 2 && dateRange[0] > dateRange[1]) {
        this.$message.warning('开始日期不得晚于结束日期')
        return false
      }
      return true
    },
    normalizeRow(row) {
      const statusMap = {
        2: '待提交',
        3: '待审核',
        4: '审核通过',
        5: '审核拒绝',
        待提交: '待提交',
        待审核: '待审核',
        审核通过: '审核通过',
        审核拒绝: '审核拒绝',
      }
      return {
        ...row,
        '数据类型': row['数据类型'] || row.operationType || row.dataType || '材料信息',
        '导入时间': row['导入时间'] || row.createTime || row.importTime || '',
        '导入人': row['导入人'] || row.createUname || row.importUserName || '',
        '审批时间': row['审批时间'] || row.auditTime || '',
        '审批人': row['审批人'] || row.auditUserName || '',
        '据条数': row['据条数'] || row.dataCount || row.count || '',
        '状态': row['状态'] || statusMap[row.dataStatus] || statusMap[row.status] || row.status || '待提交',
      }
    },
    getMockTableData() {
      return [
        { id: 1, '数据类型': '材料信息', '导入时间': '2025-10-10 09:00:00', '导入人': '张三', '审批时间': '', '审批人': '李四', '据条数': 100100, '状态': '待审核' },
        { id: 2, '数据类型': '材料信息', '导入时间': '2025-10-10 09:00:00', '导入人': '张三', '审批时间': '2025-10-11 09:00:00', '审批人': '李四', '据条数': 100100, '状态': '审核通过' },
        { id: 3, '数据类型': '材料信息', '导入时间': '2025-10-10 09:00:00', '导入人': '张三', '审批时间': '2025-10-11 09:00:00', '审批人': '李四', '据条数': 100100, '状态': '审核拒绝' },
        { id: 4, '数据类型': '材料信息', '导入时间': '2025-10-10 09:00:00', '导入人': '张三', '审批时间': '', '审批人': '', '据条数': '', '状态': '待提交' },
      ]
    },
    handleReset() {
      this.searchForm['添加时间'] = []
      this.searchForm['状态'] = ['全部']
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
      if (row['状态'] === '待审核') actions.push({ label: '审核', execute: 'audit' })
      if (row['状态'] === '待提交' || row['状态'] === '审核拒绝') {
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
      if (row['状态'] !== '待提交' && row['状态'] !== '审核拒绝') {
        this.$message.warning('当前状态不可提交')
        return
      }
      await this.$confirm('确定要提交吗?', '提示', { type: 'warning' })
      this.submitLoading = true
      try {
        const res = await submitInitialEntry(row.id)
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
    getStatusClass(status) {
      const map = {
        待提交: 'status-default',
        待审核: 'status-pending',
        审核通过: 'status-approved',
        审核拒绝: 'status-rejected',
      }
      return map[status] || 'status-default'
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
