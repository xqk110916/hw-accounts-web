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
      <el-table :data="approveTableData" border size="small">
        <el-table-column prop="rowNo" label="行号" width="64"></el-table-column>
        <el-table-column prop="field1" label="字段1"></el-table-column>
        <el-table-column prop="field2" label="字段2"></el-table-column>
        <el-table-column prop="field3" label="字段3"></el-table-column>
        <el-table-column prop="field4" label="字段4"></el-table-column>
        <el-table-column prop="issue" label="问题"></el-table-column>
      </el-table>
      <div class="remark-label">备注</div>
      <div class="remark-content">{{ approveData.remark }}</div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" size="small" :loading="approveLoading" @click="handlePass">通过</el-button>
      <el-button size="small" :loading="approveLoading" @click="openRejectDialog">拒绝</el-button>
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
import { auditInitialEntry } from './api.js'

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
      approveForm: {
        approvalResult: '',
        approvalRemark: '',
      },
    }
  },
  methods: {
    open(row) {
      this.currentRow = row
      this.approveForm = {
        approvalResult: '',
        approvalRemark: '',
      }
      this.approveData = {
        title: (row && (row.operationTypeText || this.getLegacyValue(row, '数据类型'))) || 'XXXX',
        importContent: {},
        remark: (row && (row.remark || this.getLegacyValue(row, '备注'))) || '',
      }
      this.approveTableData = [
        { rowNo: 1, field1: 'xxxxx', field2: 'xxxxx', field3: 'xxxxx', field4: 'xxxxx', issue: 'xxxxxx' },
        { rowNo: 2, field1: 'xxxxx', field2: 'xxxxx', field3: 'xxxxx', field4: 'xxxxx', issue: '' },
        { rowNo: 3, field1: 'xxxxx', field2: 'xxxxx', field3: 'xxxxx', field4: 'xxxxx', issue: '' },
      ]
      this.visible = true
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
    getLegacyValue(source, key) {
      return source && source[key]
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
</style>
