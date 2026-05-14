<template>
  <el-dialog
    title="模板管理"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="860px"
    top="6vh"
    append-to-body
    :before-close="handleClose"
  >
    <div class="template-manage-dialog">
      <div class="manage-search">
        <span class="search-label">模板名称</span>
        <el-input v-model="query.templateName" size="small" class="search-input" placeholder="请输入"></el-input>
        <el-button size="small" type="text" @click="handleQuery">查询</el-button>
        <span class="partition"></span>
        <el-button size="small" type="text" @click="handleReset">重置</el-button>
      </div>
      <div class="manage-operation">
        <div :class="['btn', 'primary']" @click="handleAdd">新增</div>
      </div>
      <el-table v-loading="loading" :data="tableData" height="420" style="width: 100%">
        <el-table-column prop="templateName" label="模板名称" min-width="180" show-overflow-tooltip></el-table-column>
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip></el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" show-overflow-tooltip></el-table-column>
        <el-table-column prop="createUname" label="创建人" min-width="110" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
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
          :current-page="query.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="query.pageSize"
          background
          layout="total, sizes, prev, pager, next"
          :total="query.total"
        ></el-pagination>
      </div>
    </div>
    <template-dialog ref="templateDialog" @saved="handleSaved"></template-dialog>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import TemplateDialog from './TemplateDialog.vue'
import { deleteTemplate, listTemplate } from './api'

export default {
  name: 'TemplateManageDialog',
  components: { TemplateDialog },
  data() {
    return {
      visible: false,
      loading: false,
      tableData: [],
      query: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
        templateName: '',
      },
    }
  },
  methods: {
    open() {
      this.visible = true
      this.handleQuery()
    },
    async handleQuery() {
      this.loading = true
      try {
        const res = await listTemplate({
          currentPage: this.query.currentPage,
          pageSize: this.query.pageSize,
          templateName: this.query.templateName,
        })
        const data = res.data || {}
        this.tableData = data.list || []
        this.query.total = data.pagination ? data.pagination.total || 0 : 0
      } finally {
        this.loading = false
      }
    },
    handleReset() {
      this.query.templateName = ''
      this.query.currentPage = 1
      this.handleQuery()
    },
    handleAdd() {
      this.$refs.templateDialog.open(null, 'add')
    },
    handleEdit(row) {
      this.$refs.templateDialog.open(row.id, 'edit')
    },
    async handleDelete(row) {
      await this.$confirm('确定要删除该模板吗?', '提示', { type: 'warning' })
      await deleteTemplate(row.id)
      const maxPage = Math.max(Math.ceil((this.query.total - 1) / this.query.pageSize), 1)
      this.query.currentPage = Math.min(this.query.currentPage, maxPage)
      this.$message.success('删除成功')
      this.handleQuery()
      this.$emit('saved')
    },
    handleSaved() {
      this.handleQuery()
      this.$emit('saved')
    },
    handleSizeChange(value) {
      this.query.pageSize = value
      this.query.currentPage = 1
      this.handleQuery()
    },
    handleCurrentChange(value) {
      this.query.currentPage = value
      this.handleQuery()
    },
    handleClose() {
      this.visible = false
    },
  },
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}
.template-manage-dialog {
  .manage-search {
    height: 34px;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    .search-label {
      margin-right: 8px;
      color: #1b2129;
    }
    .search-input {
      width: 220px;
      margin-right: 12px;
    }
    .partition {
      width: 1px;
      height: 14px;
      background: #e1e5eb;
      margin: 0 12px;
    }
  }
  .manage-operation {
    height: 32px;
    margin-bottom: 10px;
  }
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
