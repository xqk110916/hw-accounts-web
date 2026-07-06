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
          <div :class="['btn', 'primary']" @click="handleAdd">新增</div>
          <div :class="['btn', 'default-btn']" @click="handleImport">导入</div>
          <div :class="['btn', 'default-btn']" @click="handleTemplateManage">模板管理</div>
        </div>
        <div class="table">
          <el-table
            ref="table"
            v-loading="listLoading"
            :data="tableData"
            border
            highlight-current-row
            :height="height"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <!-- <el-table-column type="selection" width="55"></el-table-column> -->
            <el-table-column type="index" label="序号" width="80" align="center" show-overflow-tooltip></el-table-column>
            <el-table-column prop="containerNo" label="容器号" min-width="140" show-overflow-tooltip>
              <template slot-scope="scope">{{ getDataJsonValue(scope.row, '容器号') }}</template>
            </el-table-column>
            <el-table-column prop="warehouse" label="库房" min-width="140" show-overflow-tooltip>
              <template slot-scope="scope">{{ getDataJsonValue(scope.row, '库房') }}</template>
            </el-table-column>
            <el-table-column prop="materialCode" label="材料代码" min-width="140" show-overflow-tooltip>
              <template slot-scope="scope">{{ getDataJsonValue(scope.row, '材料代码') }}</template>
            </el-table-column>
            <el-table-column prop="templateId" label="模板名称" min-width="140" show-overflow-tooltip>
              <template slot-scope="scope">{{ templateMap[scope.row.templateId] || '' }}</template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" min-width="160" show-overflow-tooltip>
              <template slot-scope="scope">{{ formatDisplayDateValue(scope.row.createTime) }}</template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip></el-table-column>
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
    <template-manage-dialog ref="templateManageDialog" @saved="handleTemplateChanged"></template-manage-dialog>
  </div>
</template>

<script>
import PrintImportDialog from './components/PrintImportDialog.vue'
import PrintRecordDialog from './components/PrintRecordDialog.vue'
import TemplateManageDialog from './components/TemplateManageDialog.vue'
import { formatDisplayDateValue, templateListToOptions } from './components/storage'
import { deleteLabelData, listAllTemplate, listLabelData } from './components/api'

export default {
  name: 'LabelTemplate',
  components: { PrintImportDialog, PrintRecordDialog, TemplateManageDialog },
  data() {
    return {
      searchForm: {
        dateRange: [],
        templateId: '',
        currentPage: 1,
        pageSize: 20,
        total: 0,
      },
      searchOptions: [
        { label: '打印时间', prop: 'dateRange', type: 'daterange', col: 7 },
        { label: '模板', prop: 'templateId', type: 'select', col: 5, option: [] },
        { type: 'slot', slotName: 'footer', col: 4 },
      ],
      tableData: [],
      templateMap: {},
      selectedRows: [],
      listLoading: false,
      deleteLoading: false,
      height: 0,
    }
  },
  async created() {
    // 进入页面时预加载 ZPL SDK
    this.$zplPrinter.getSdk().catch(() => {})
    await this.loadTemplateOptions()
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
    formatDisplayDateValue,
    getDataJsonValue(row, fileName) {
      const dataJson = row.dataJson || []
      const field = dataJson.find(item => item.fileName === fileName)
      const value = field ? field.value || '' : ''
      if (fileName === '入库时间' || (field && field.fileValue === 'storageTime')) {
        return formatDisplayDateValue(value)
      }
      return value
    },
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
        const records = await this.getFilteredRecords()
        this.tableData = records
      } finally {
        this.listLoading = false
      }
    },
    async loadTemplateOptions() {
      const res = await listAllTemplate()
      const list = res.data || []
      this.templateMap = list.reduce((map, item) => {
        map[item.id] = item.templateName
        return map
      }, {})
      const templateSearch = this.searchOptions.find(item => item.prop === 'templateId')
      if (templateSearch) templateSearch.option = templateListToOptions(list)
    },
    validateDateRange() {
      const range = this.searchForm.dateRange
      if (Array.isArray(range) && range.length === 2 && range[0] > range[1]) {
        this.$message.warning('开始日期不得晚于结束日期')
        return false
      }
      return true
    },
    async getFilteredRecords() {
      const params = {
        currentPage: this.searchForm.currentPage,
        pageSize: this.searchForm.pageSize,
      }
      if (this.searchForm.templateId) params.templateId = this.searchForm.templateId
      const res = await listLabelData(params)
      const data = res.data || {}
      this.searchForm.total = data.pagination ? data.pagination.total || 0 : 0
      return data.list || []
    },
    handleReset() {
      this.searchForm.dateRange = []
      this.searchForm.templateId = ''
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
    handleTemplateManage() {
      this.$refs.templateManageDialog.open()
    },
    async handleTemplateChanged() {
      await this.loadTemplateOptions()
      if (this.$refs.printRecordDialog && this.$refs.printRecordDialog.visible) {
        this.$refs.printRecordDialog.loadTemplateOptions()
      }
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
        await deleteLabelData(row.id)
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
