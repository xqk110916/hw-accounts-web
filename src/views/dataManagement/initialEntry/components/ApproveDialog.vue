<template>
  <el-dialog
    title="审核"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="760px"
    top="8vh"
    append-to-body
    :before-close="handleClose"
  >
    <div class="approve-dialog" v-loading="detailLoading">
      <div class="approve-title">{{ approveData.title }}</div>
      <div class="section-title">导入内容</div>
      <el-table :data="approveTableData" border size="small" max-height="330">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="goodCode" label="材料代码" min-width="100" show-overflow-tooltip></el-table-column>
        <el-table-column prop="productionUnit" label="生产单位" min-width="110" show-overflow-tooltip></el-table-column>
        <el-table-column prop="warehouseName" label="库房" min-width="100" show-overflow-tooltip></el-table-column>
        <el-table-column prop="boxNum" label="货箱号" min-width="100" show-overflow-tooltip></el-table-column>
        <el-table-column prop="containerCode" label="容器号" min-width="110" show-overflow-tooltip></el-table-column>
        <el-table-column prop="sealCode1" label="封记编码1" min-width="110" show-overflow-tooltip></el-table-column>
        <el-table-column label="封记类型1" min-width="110" show-overflow-tooltip>
          <template slot-scope="scope">{{ getSealTypeLabel(scope.row.sealType1) }}</template>
        </el-table-column>
        <el-table-column prop="sealCode2" label="封记编码2" min-width="110" show-overflow-tooltip></el-table-column>
        <el-table-column label="封记类型2" min-width="110" show-overflow-tooltip>
          <template slot-scope="scope">{{ getSealTypeLabel(scope.row.sealType2) }}</template>
        </el-table-column>
        <el-table-column prop="grossWeight" label="毛重" min-width="80" show-overflow-tooltip></el-table-column>
        <el-table-column prop="tareWeight" label="皮重" min-width="80" show-overflow-tooltip></el-table-column>
        <el-table-column prop="netWeight" label="净重" min-width="80" show-overflow-tooltip></el-table-column>
        <el-table-column prop="metalPercentage" label="金属量" min-width="90" show-overflow-tooltip></el-table-column>
        <el-table-column label="位置" min-width="100" show-overflow-tooltip>
          <template slot-scope="scope">{{ formatLocation(scope.row) }}</template>
        </el-table-column>
      </el-table>
      <div class="detail-pagination" v-if="detailPagination.total > 0">
        <el-pagination
          @size-change="handleDetailSizeChange"
          @current-change="handleDetailCurrentChange"
          :current-page="detailPagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="detailPagination.pageSize"
          background
          layout="total, sizes, prev, pager, next"
          :total="detailPagination.total"
        ></el-pagination>
      </div>
      <div class="remark-label">备注</div>
      <div class="remark-content">{{ approveData.remark }}</div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClose"> 取消 </el-button>
      <el-button type="primary" size="small" :loading="approveLoading" @click="handlePass">同意</el-button>
      <el-button size="small" type="danger" :loading="approveLoading" @click="openRejectDialog">不同意</el-button>
    </div>

    <el-dialog
      title="拒绝"
      :visible.sync="rejectDialogVisible"
      :close-on-click-modal="false"
      width="420px"
      append-to-body
    >
      <el-form :model="approveForm" label-width="90px" size="small">
        <el-form-item label="审批意见" required>
          <el-input
            v-model="approveForm.approvalRemark"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            placeholder="请输入"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" :loading="approveLoading" @click="handleReject">确定</el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { auditInitialEntry, detailInitialEntry } from './api.js'
import { formatSealType, getSealTypeOptions } from '@/utils/sealType.js'

export default {
  name: 'ApproveDialog',
  data() {
    return {
      visible: false,
      rejectDialogVisible: false,
      detailLoading: false,
      approveLoading: false,
      currentRow: null,
      approveData: {
        title: '',
        importContent: {},
        remark: '',
      },
      approveTableData: [],
      detailPagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
      sealTypeOptions: [],
      approveForm: {
        approvalResult: '',
        approvalRemark: '',
      },
    }
  },
  created() {
    this.loadSealTypeOptions()
  },
  methods: {
    open(row) {
      this.currentRow = row
      this.approveForm = {
        approvalResult: '',
        approvalRemark: '',
      }
      this.approveData = {
        title: row ? row.operationType : '',
        importContent: {},
        remark: row ? row.remark : '',
      }
      this.approveTableData = []
      this.detailPagination = { currentPage: 1, pageSize: 10, total: 0 }
      this.visible = true
      if (row && row.id) this.loadDetail()
    },
    async loadDetail() {
      this.detailLoading = true
      try {
        const res = await detailInitialEntry({
          id: this.currentRow.id,
          currentPage: this.detailPagination.currentPage,
          pageSize: this.detailPagination.pageSize,
        })
        if (res.code === 1) {
          const data = res.data || {}
          const pageData = data.dataList || {}
          this.approveData = {
            title: data.operationType,
            importContent: data,
            remark: data.remark,
          }
          this.approveTableData = pageData.list || []
          this.detailPagination.total = Number(pageData.pagination && pageData.pagination.total) || 0
        }
      } finally {
        this.detailLoading = false
      }
    },
    loadSealTypeOptions() {
      getSealTypeOptions().then(options => {
        this.sealTypeOptions = options
      }).catch(() => {
        this.sealTypeOptions = []
      })
    },
    getSealTypeLabel(value) {
      return formatSealType(this.sealTypeOptions, value)
    },
    formatLocation(row) {
      const values = [row.shelfCode, row.rowCode, row.columnCode].filter(Boolean)
      const location = values.length ? values.join('-') : ''
      if (!location) return '-'
      const warehouseCode = row.warehouseCode || row.warehouseName || ''
      return warehouseCode ? `${warehouseCode} - ${location}` : location
    },
    handleDetailSizeChange(value) {
      this.detailPagination.pageSize = value
      this.detailPagination.currentPage = 1
      this.loadDetail()
    },
    handleDetailCurrentChange(value) {
      this.detailPagination.currentPage = value
      this.loadDetail()
    },
    async handlePass() {
      await this.$confirm('确定审核通过吗?', '提示', { type: 'warning' })
      this.approveForm.approvalResult = 'pass'
      this.approveLoading = true
      try {
        const res = await auditInitialEntry({
          id: this.currentRow && this.currentRow.id,
          approved: true,
        })
        if (!res || res.code === 1) {
          this.$message.success('审核通过')
          this.$emit('saved')
          this.handleClose()
        }
      } finally {
        this.approveLoading = false
      }
    },
    openRejectDialog() {
      this.approveForm.approvalResult = 'reject'
      this.approveForm.approvalRemark = ''
      this.rejectDialogVisible = true
    },
    async handleReject() {
      if (!this.approveForm.approvalRemark || !this.approveForm.approvalRemark.trim()) {
        this.$message.warning('请输入审批意见')
        return
      }
      this.approveLoading = true
      try {
        const res = await auditInitialEntry({
          id: this.currentRow && this.currentRow.id,
          approved: false,
          remark: this.approveForm.approvalRemark,
        })
        if (!res || res.code === 1) {
          this.$message.success('审核拒绝')
          this.rejectDialogVisible = false
          this.$emit('saved')
          this.handleClose()
        }
      } finally {
        this.approveLoading = false
      }
    },
    handleClose() {
      this.visible = false
      this.rejectDialogVisible = false
    },
  },
}
</script>

<style lang="scss" scoped>
.approve-dialog {
  .approve-title {
    text-align: center;
    font-size: 18px;
    color: #1b2129;
    margin-bottom: 20px;
  }
  .section-title {
    font-size: 22px;
    line-height: 32px;
    font-weight: 700;
    color: #1b2129;
    margin-bottom: 18px;
  }
  .remark-label {
    margin-top: 26px;
    font-size: 16px;
    color: #1b2129;
  }
  .remark-content {
    min-height: 42px;
    color: #1b2129;
    line-height: 24px;
    margin-top: 10px;
  }
}
::v-deep .el-table th.el-table__cell {
  background: #f1f4f6;
  color: #626c78;
}
::v-deep .el-table td.el-table__cell {
  color: #1b2129;
}
.dialog-footer {
  text-align: right;
}
.detail-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
