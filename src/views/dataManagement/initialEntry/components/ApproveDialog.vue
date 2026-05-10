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
      <div class="approve-title">{{ approveData['XXXX'] }}</div>
      <div class="section-title">导入内容</div>
      <el-table :data="approveTableData" border size="small">
        <el-table-column prop="行号" label="行号" width="64"></el-table-column>
        <el-table-column prop="字段1" label="字段1"></el-table-column>
        <el-table-column prop="字段2" label="字段2"></el-table-column>
        <el-table-column prop="字段3" label="字段3"></el-table-column>
        <el-table-column prop="字段4" label="字段4"></el-table-column>
        <el-table-column prop="问题" label="问题"></el-table-column>
      </el-table>
      <div class="remark-label">备注</div>
      <div class="remark-content">{{ approveData['备注'] }}</div>
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
            v-model="approveForm['审批意见']"
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
        'XXXX': '',
        '导入内容': {},
        '备注': '',
      },
      approveTableData: [],
      approveForm: {
        '审批结果': '',
        '审批意见': '',
      },
    }
  },
  methods: {
    open(row) {
      this.currentRow = row
      this.approveForm = {
        '审批结果': '',
        '审批意见': '',
      }
      this.approveData = {
        'XXXX': (row && row['数据类型']) || 'XXXX',
        '导入内容': {},
        '备注': (row && row['备注']) || '',
      }
      this.approveTableData = [
        { '行号': 1, '字段1': 'xxxxx', '字段2': 'xxxxx', '字段3': 'xxxxx', '字段4': 'xxxxx', '问题': 'xxxxxx' },
        { '行号': 2, '字段1': 'xxxxx', '字段2': 'xxxxx', '字段3': 'xxxxx', '字段4': 'xxxxx', '问题': '' },
        { '行号': 3, '字段1': 'xxxxx', '字段2': 'xxxxx', '字段3': 'xxxxx', '字段4': 'xxxxx', '问题': '' },
      ]
      this.visible = true
    },
    async handlePass() {
      await this.$confirm('确定审核通过吗?', '提示', { type: 'warning' })
      this.approveForm['审批结果'] = '通过'
      this.approveLoading = true
      try {
        const res = await auditInitialEntry({
          id: this.currentRow && this.currentRow.id,
          approved: true,
          '审批结果': this.approveForm['审批结果'],
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
      this.approveForm['审批结果'] = '拒绝'
      this.approveForm['审批意见'] = ''
      this.rejectDialogVisible = true
    },
    async handleReject() {
      if (!this.approveForm['审批意见'] || !this.approveForm['审批意见'].trim()) {
        this.$message.warning('请输入审批意见')
        return
      }
      this.approveLoading = true
      try {
        const res = await auditInitialEntry({
          id: this.currentRow && this.currentRow.id,
          approved: false,
          '审批结果': this.approveForm['审批结果'],
          '审批意见': this.approveForm['审批意见'],
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
</style>
