<template>
  <div class="wrapper">
    <div class="content">
      <div class="right">
        <search-filter class="search" :options="search.options" :form="search.params">
          <div slot="footer" class="footer">
            <div :class="['btn', 'text']" @click="handleQuery">查询</div>
            <div class="partition"></div>
            <div :class="['btn', 'text']" @click="resetSearchParams">重置</div>
          </div>
        </search-filter>
        <div class="operation" v-if="btns.operation && btns.operation.length">
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
          <el-table
            ref="table"
            v-loading="loading"
            :data="tableData"
            border
            highlight-current-row
            :height="height"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column type="index" label="序号" width="80" align="center" show-overflow-tooltip></el-table-column>
            <el-table-column
              v-for="item in tableKeys"
              :key="item.prop"
              :prop="item.prop"
              :label="item.label"
              :width="item.width"
              :min-width="item.minWidth"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span v-if="item.prop === 'seal1Display'">{{ scope.row.seal1Display }}</span>
                <span v-else-if="item.prop === 'seal2Display'">{{ scope.row.seal2Display }}</span>
                <span v-else-if="item.prop === 'sealStatus'">{{ scope.row.sealStatusName }}</span>
                <span v-else>{{ scope.row[item.prop] || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template slot-scope="scope">
                <div class="table_operation">
                  <div
                    v-for="item in btns.table"
                    :key="item.label"
                    :class="['btn', 'text']"
                    @click="handleBtnClick(item, scope.row)"
                  >
                    {{ item.label }}
                  </div>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination">
            <el-pagination
              :current-page="search.params.currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="search.params.pageSize"
              :total="search.params.total"
              background
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            >
            </el-pagination>
          </div>
        </div>
      </div>
    </div>
    <edit-dialog
      ref="editDialog"
      :seal-type-options="sealTypeOptions"
      :container-options="containerOptions"
      @saved="handleSaved"
    />
    <detail-dialog ref="detailDialog" :seal-type-options="sealTypeOptions" />
    <import-dialog ref="importDialog" @saved="handleSaved" />
  </div>
</template>

<script>
import { formatSealType, getSealTypeOptions } from '@/utils/sealType.js'
import DetailDialog from './components/DetailDialog.vue'
import EditDialog from './components/EditDialog.vue'
import ImportDialog from './components/ImportDialog.vue'
import {
  btns,
  config,
  handleSearchParams,
  loadContainerOptions,
  normalizeSealRecord,
  requestFun,
} from './components/index.js'

export default {
  name: 'SealLedger',
  components: { DetailDialog, EditDialog, ImportDialog },
  data() {
    return {
      loading: false,
      search: {
        params: {
          currentPage: 1,
          pageSize: 20,
          total: 0,
          sealCode: '',
          sealType: '',
          sealStatus: '',
          registerTimeRange: [],
          containerCode: '',
        },
        options: [],
      },
      tableData: [],
      selectedRows: [],
      selectedIds: [],
      height: 0,
      tableKeys: [],
      btns,
      sealTypeOptions: [],
      containerOptions: [],
    }
  },
  async created() {
    this.handleData()
    await this.loadDefaultOptions()
    await this.getTableList()
  },
  mounted() {
    setTimeout(() => {
      this.computedTableHeight()
    }, 0)
    window.addEventListener('resize', this.computedTableHeight)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.computedTableHeight)
  },
  methods: {
    computedTableHeight() {
      const rightDom = document.querySelector('.right')
      const rightDomHeight = rightDom ? rightDom.clientHeight : 0
      const searchDom = document.querySelector('.search')
      const searchDomHeight = searchDom ? searchDom.clientHeight : 0
      const operationDom = document.querySelector('.operation')
      const operationDomHeight = operationDom ? operationDom.clientHeight : 0

      this.height = rightDomHeight - searchDomHeight - operationDomHeight - 90
    },
    handleData() {
      this.tableKeys = config.table
      this.search.options = config.search.map(item => ({ ...item }))
      this.search.options.push({ type: 'slot', slotName: 'footer', col: 4 })
    },
    async loadDefaultOptions() {
      const [sealTypeOptions, containerOptions] = await Promise.all([
        getSealTypeOptions().catch(() => []),
        loadContainerOptions().catch(() => []),
      ])
      this.sealTypeOptions = sealTypeOptions
      this.containerOptions = containerOptions
      this.setSearchOption('sealType', sealTypeOptions)
      this.setSearchOption('containerCode', containerOptions)
    },
    setSearchOption(prop, option) {
      const item = this.search.options.find(optionItem => optionItem.prop === prop)
      if (item) this.$set(item, 'option', option)
    },
    getSealTypeLabel(value) {
      return formatSealType(this.sealTypeOptions, value)
    },
    handleQuery() {
      this.search.params.currentPage = 1
      this.getTableList()
    },
    async getTableList() {
      this.loading = true
      try {
        const params = handleSearchParams(this.search.params)
        const res = await requestFun.list(params)
        if (res.code === 1) {
          const data = (res.data && res.data.list) || []
          const page = (res.data && res.data.pagination) || {}
          this.tableData = data.map(item => normalizeSealRecord(item, this.getSealTypeLabel))
          this.search.params.total = page.total || 0
          return this.tableData
        }
        this.tableData = []
        this.search.params.total = 0
        return []
      } finally {
        this.loading = false
      }
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows || []
      this.selectedIds = this.selectedRows.map(item => item.id).filter(Boolean)
    },
    handleBtnClick(item, payload) {
      switch (item.execute) {
        case 'add':
          this.openAdd()
          break
        case 'import':
          this.openImport()
          break
        case 'batchDelete':
          this.handleBatchDelete()
          break
        case 'view':
          this.openDetail(payload)
          break
        case 'update':
          this.openEdit(payload)
          break
        case 'delete':
          this.handleDelete(payload)
          break
      }
    },
    openAdd() {
      this.$refs.editDialog.open()
    },
    openEdit(row) {
      this.$refs.editDialog.open(row)
    },
    openDetail(row) {
      this.$refs.detailDialog.open(row)
    },
    openImport() {
      this.$refs.importDialog.open()
    },
    async handleDelete(row) {
      if (!row || !row.id) return
      try {
        await this.$confirm('确定要删除该封记记录吗？', '提示', { type: 'warning' })
        const res = await requestFun.delete(row.id)
        if (res.code === 1) {
          this.$message.success('删除成功')
          await this.refreshAfterDelete(1)
        }
      } catch (error) {}
    },
    async handleBatchDelete() {
      if (!this.selectedIds.length) {
        this.$message.warning('请先选择需要删除的记录')
        return
      }
      try {
        await this.$confirm('确定要删除选中的封记记录吗？', '提示', { type: 'warning' })
        const res = await requestFun.batchDelete(this.selectedIds)
        if (res.code === 1) {
          const count = this.selectedIds.length
          this.$message.success('删除成功')
          this.clearSelection()
          await this.refreshAfterDelete(count)
        }
      } catch (error) {}
    },
    async refreshAfterDelete(count) {
      const remain = this.tableData.length - count
      if (remain <= 0 && this.search.params.currentPage > 1) {
        this.search.params.currentPage -= 1
      }
      await this.getTableList()
    },
    clearSelection() {
      this.selectedRows = []
      this.selectedIds = []
      if (this.$refs.table) this.$refs.table.clearSelection()
    },
    async handleSaved() {
      await this.loadDefaultOptions()
      await this.getTableList()
    },
    handleSizeChange(value) {
      this.search.params.pageSize = value
      this.search.params.currentPage = 1
      this.getTableList()
    },
    handleCurrentChange(value) {
      this.search.params.currentPage = value
      this.getTableList()
    },
    resetSearchParams() {
      this.search.params = {
        currentPage: 1,
        pageSize: 20,
        total: 0,
        sealCode: '',
        sealType: '',
        sealStatus: '',
        registerTimeRange: [],
        containerCode: '',
      }
      this.clearSelection()
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

      .operation {
        height: 32px;
        margin-top: 4px;
        margin-bottom: 6px;
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
      border: 1px solid #c4c9cf;
      color: #333;
    }
  }
  .btn + .btn {
    margin-left: 10px;
  }
}
</style>
