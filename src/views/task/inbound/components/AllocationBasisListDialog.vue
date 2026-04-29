<template>
  <el-dialog
    title="调拨依据管理"
    :visible.sync="visible"
    width="800px"
    custom-class="show-footer-dialog"
    append-to-body
    :close-on-click-modal="false"
  >
    <div class="list-container">
      <div class="action-bar">
        <el-button type="primary" size="small" @click="handleAdd">新增</el-button>
      </div>
      <el-table :data="tableData" border stripe v-loading="loading" height="400px">
        <el-table-column prop="documentNo" label="文号" show-overflow-tooltip></el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template slot-scope="scope">
            {{ scope.row.type == '0' ? '调入' : '调出' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="mini">
              {{ scope.row.status === 1 ? '已完成' : '未完成' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" size="small" style="color: #f56c6c" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          @current-change="handlePageChange"
          :current-page="params.pageNum"
          :page-size="params.pageSize"
          layout="total, prev, pager, next"
          :total="total">
        </el-pagination>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <AllocationBasisDialog ref="editDialog" @success="handleEditSuccess" />
  </el-dialog>
</template>

<script>
import { getTransferBasisPageList, deleteTransferBasis } from './api'
import AllocationBasisDialog from './AllocationBasisDialog.vue'

export default {
  name: 'AllocationBasisListDialog',
  components: { AllocationBasisDialog },
  data() {
    return {
      visible: false,
      loading: false,
      tableData: [],
      total: 0,
      params: {
        pageNum: 1,
        pageSize: 10
      }
    }
  },
  methods: {
    open() {
      this.visible = true
      this.getList()
    },
    getList() {
      this.loading = true
      getTransferBasisPageList(this.params).then(res => {
        if (res.code === 1) {
          this.tableData = res.data.list || []
          this.total = res.data.pagination && res.data.pagination.total ? Number(res.data.pagination.total) : this.tableData.length
        }
      }).finally(() => {
        this.loading = false
      })
    },
    handlePageChange(val) {
      this.params.pageNum = val
      this.getList()
    },
    handleAdd() {
      this.$refs.editDialog.open()
    },
    handleEdit(row) {
      this.$refs.editDialog.open(row)
    },
    handleEditSuccess() {
      this.getList()
      this.$emit('success')
    },
    handleDelete(row) {
      this.$confirm(`确定要删除文号为 "${row.documentNo}" 的调拨依据吗?`, '提示', {
        type: 'warning'
      }).then(() => {
        deleteTransferBasis({ id: row.id }).then(res => {
          if (res.code === 1) {
            this.$message.success('删除成功')
            this.getList()
            this.$emit('success') // 通知外部刷新下拉列表
          }
        })
      })
    }
  }
}
</script>

<style scoped>
.action-bar {
  margin-bottom: 15px;
}
.pagination {
  margin-top: 15px;
  text-align: right;
}
</style>
