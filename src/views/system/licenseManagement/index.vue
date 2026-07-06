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
          >
            <el-table-column type="index" label="序号" width="80" align="center" show-overflow-tooltip></el-table-column>
            <el-table-column prop="unitName" label="单位名称" min-width="180" show-overflow-tooltip></el-table-column>
            <el-table-column prop="unitCode" label="单位代号" min-width="160" show-overflow-tooltip></el-table-column>
            <el-table-column prop="licenseNo" label="许可证号" min-width="180" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template slot-scope="scope">
                <div class="table_operation">
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
    <edit-dialog ref="editDialog" :parent-id="parentId" @saved="handleQuery"></edit-dialog>
  </div>
</template>

<script>
import EditDialog from './components/EditDialog.vue'
import { getDictionaryList } from '@/api/common/dictionary.js'

const CATEGORY_NAME = '单位信息'

export default {
  name: 'LicenseManagement',
  components: { EditDialog },
  data() {
    return {
      parentId: '',
      searchForm: {
        unitName: '',
        currentPage: 1,
        pageSize: 20,
        total: 0,
      },
      searchOptions: [
        { label: '单位名称', prop: 'unitName', type: 'text', col: 6 },
        { type: 'slot', slotName: 'footer', col: 4 },
      ],
      tableData: [],
      listLoading: false,
      height: 0,
    }
  },
  async created() {
    await this.loadParentId()
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
    async loadParentId() {
      try {
        const res = await getDictionaryList({ keyword: CATEGORY_NAME })
        const list = (res.data?.list || res.list || [])
        const parent = list.find(item => item.fullName === CATEGORY_NAME && item.parentId === '0')
        this.parentId = parent ? parent.id : ''
      } catch (e) {
        console.error('获取单位信息字典分类失败:', e)
        this.parentId = ''
      }
    },
    async handleQuery() {
      if (!this.parentId) {
        this.$message.warning('未找到单位信息字典分类')
        return
      }
      this.listLoading = true
      try {
        const params = {
          parentId: this.parentId,
          keyword: this.searchForm.unitName,
          currentPage: this.searchForm.currentPage,
          pageSize: this.searchForm.pageSize,
        }
        const res = await getDictionaryList(params)
        const data = res.data || {}
        const list = data.list || []
        this.searchForm.total = data.pagination ? data.pagination.total || 0 : 0
        this.tableData = list.map(item => this.parseUnitItem(item))
      } finally {
        this.listLoading = false
      }
    },
    parseUnitItem(item) {
      const description = item.description || ''
      const parts = description.split('|')
      return {
        id: item.id,
        unitName: item.fullName,
        unitCode: parts[0] || '',
        licenseNo: parts[1] || '',
        raw: item,
      }
    },
    handleReset() {
      this.searchForm.unitName = ''
      this.searchForm.currentPage = 1
      this.searchForm.pageSize = 20
      this.handleQuery()
    },
    handleAdd() {
      this.$refs.editDialog.open()
    },
    handleEdit(row) {
      this.$refs.editDialog.open(row)
    },
    handleDelete(row) {
      this.$confirm('确定要删除该单位信息吗?', '提示', { type: 'warning' })
        .then(async () => {
          const { deleteDictionary } = await import('@/api/common/dictionary.js')
          const res = await deleteDictionary(row.id)
          if (res.code === 1) {
            this.$message.success('删除成功')
            this.handleQuery()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        })
        .catch(() => {})
    },
    handleSizeChange(value) {
      this.searchForm.pageSize = value
      this.searchForm.currentPage = 1
      this.handleQuery()
    },
    handleCurrentChange(value) {
      this.searchForm.currentPage = value
      this.handleQuery()
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
  }
  .btn + .btn {
    margin-left: 10px;
  }
}
</style>
