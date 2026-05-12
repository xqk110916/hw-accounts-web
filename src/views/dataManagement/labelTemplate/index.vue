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
          <div :class="['btn', 'primary']" @click="handleImport">导入</div>
          <div :class="['btn', 'primary']" @click="handleAdd">添加</div>
          <div :class="['btn', 'default-btn']" @click="handleEditTemplate">编辑模版</div>
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
            <el-table-column prop="打印时间" label="打印时间" min-width="160" show-overflow-tooltip></el-table-column>
            <el-table-column prop="标签数量" label="标签数量" min-width="140" show-overflow-tooltip></el-table-column>
            <el-table-column prop="备注" label="备注" min-width="220" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作" width="190" fixed="right">
              <template slot-scope="scope">
                <div class="table_operation">
                  <div :class="['btn', 'text']" @click="handleDetail(scope.row)">详情</div>
                  <div :class="['btn', 'text']" @click="handleEdit(scope.row)">编辑</div>
                  <div :class="['btn', 'text']" @click="handleDelete(scope.row)">删除</div>
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
    <print-import-dialog ref="printImportDialog" @saved="handleQuery"></print-import-dialog>
    <print-record-dialog ref="printRecordDialog" @saved="handleQuery"></print-record-dialog>
    <template-dialog ref="templateDialog"></template-dialog>
  </div>
</template>

<script>
import PrintImportDialog from './components/PrintImportDialog.vue'
import PrintRecordDialog from './components/PrintRecordDialog.vue'
import TemplateDialog from './components/TemplateDialog.vue'
import { deleteRecord, getRecords } from './components/storage'

export default {
  name: 'LabelTemplate',
  components: { PrintImportDialog, PrintRecordDialog, TemplateDialog },
  data() {
    return {
      searchForm: {
        '日期范围': [],
        currentPage: 1,
        pageSize: 20,
        total: 0,
      },
      searchOptions: [
        { label: '打印时间', prop: '日期范围', type: 'daterange', col: 7 },
        { type: 'slot', slotName: 'footer', col: 4 },
      ],
      tableData: [],
      selectedRows: [],
      listLoading: false,
      deleteLoading: false,
      height: 0,
    }
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
        const records = this.getFilteredRecords()
        const start = (this.searchForm.currentPage - 1) * this.searchForm.pageSize
        const end = start + this.searchForm.pageSize
        this.tableData = records.slice(start, end).map(this.mapRecordToRow)
        this.searchForm.total = records.length
      } finally {
        this.listLoading = false
      }
    },
    validateDateRange() {
      const range = this.searchForm['日期范围']
      if (Array.isArray(range) && range.length === 2 && range[0] > range[1]) {
        this.$message.warning('开始日期不得晚于结束日期')
        return false
      }
      return true
    },
    getFilteredRecords() {
      const range = this.searchForm['日期范围']
      const records = getRecords()
      if (!Array.isArray(range) || range.length !== 2) return records
      const startTime = new Date(range[0]).setHours(0, 0, 0, 0)
      const endTime = new Date(range[1]).setHours(23, 59, 59, 999)
      return records.filter(item => {
        const time = new Date(item.printTime || item.createTime || 0).getTime()
        return time >= startTime && time <= endTime
      })
    },
    mapRecordToRow(record) {
      return {
        ...record,
        '打印时间': record.printTime || record.createTime || '',
        '标签数量': record.labelCount || 1,
        '备注': record.remark || '',
        '选择模板': record.templateId || record.templateName || '',
        '材料编码': record.materialCode || '',
        '生成单位': record.generationUnit || '',
        '库房': record.warehouse || '',
        '入库人': record.inboundPerson || '',
        '容器号': record.containerNo || '',
        '入库时间': record.inboundTime || '',
        '二维码': record.qrContent || '',
      }
    },
    handleReset() {
      this.searchForm['日期范围'] = []
      this.searchForm.currentPage = 1
      this.searchForm.pageSize = 20
      this.handleQuery()
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows
    },
    handleImport() {
      this.$refs.printImportDialog.open()
    },
    handleAdd() {
      this.$refs.printRecordDialog.open(null, 'add')
    },
    handleEditTemplate() {
      this.$refs.templateDialog.open()
    },
    handleDetail(row) {
      this.$refs.printRecordDialog.open(row, 'detail')
    },
    handleEdit(row) {
      this.$refs.printRecordDialog.open(row, 'edit')
    },
    async handleDelete(row) {
      await this.$confirm('确定要删除吗?', '提示', { type: 'warning' })
      this.deleteLoading = true
      try {
        deleteRecord(row.id)
        const maxPage = Math.max(Math.ceil((this.searchForm.total - 1) / this.searchForm.pageSize), 1)
        this.searchForm.currentPage = Math.min(this.searchForm.currentPage, maxPage)
        this.handleQuery()
        this.$message.success('删除成功')
      } finally {
        this.deleteLoading = false
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
        display: flex;
        justify-content: flex-start;
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
    &.default-btn {
      padding: 5px 16px;
      border-radius: 3px;
      background: #fff;
      color: #246fe5;
      border: 1px solid #246fe5;
    }
  }
  .btn + .btn {
    margin-left: 10px;
  }
}
</style>
