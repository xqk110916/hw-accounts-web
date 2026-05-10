<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="760px"
    top="4vh"
    append-to-body
    :before-close="handleClose"
  >
    <div class="import-dialog">
      <el-form ref="form" :model="formData" label-width="90px" size="small" class="import-form">
        <el-form-item label="类型" required>
          <el-select v-model="formData['类型']" :disabled="readonly" placeholder="请选择类型" class="type-select">
            <el-option label="封记台账" value="封记台账"></el-option>
          </el-select>
          <el-button type="text" class="template-link" :disabled="readonly" @click="handleDownloadTemplate">下载模板</el-button>
        </el-form-item>
        <el-form-item v-if="!readonly" label="选择文件" required>
          <el-upload
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            :file-list="fileList"
          >
            <el-button size="small">选择文件</el-button>
            <span class="file-name">{{ formData['选择文件'] || '未选择任何文件' }}</span>
          </el-upload>
        </el-form-item>
        <div v-if="!readonly" class="import-action">
          <el-button type="primary" size="small" :loading="uploadLoading" @click="handleImport">导入</el-button>
        </div>
      </el-form>

      <div class="result-head">
        <div>
          <span class="section-title">导入内容</span>
          <span class="result-text">成功{{ importResult['导入内容'].成功 }}条，失败{{ importResult['导入内容'].失败 }}条</span>
        </div>
        <div v-if="!readonly" class="result-actions">
          <el-button size="small" :loading="exportProblemLoading" @click="handleExportProblem">导出问题</el-button>
          <el-button size="small" @click="handleReImport">重新导入</el-button>
        </div>
      </div>
      <el-table :data="problemTableData" border size="small" class="problem-table">
        <el-table-column prop="行号" label="行号" width="64"></el-table-column>
        <el-table-column prop="字段1" label="字段1"></el-table-column>
        <el-table-column prop="字段2" label="字段2"></el-table-column>
        <el-table-column prop="字段3" label="字段3"></el-table-column>
        <el-table-column prop="字段4" label="字段4"></el-table-column>
        <el-table-column prop="问题" label="问题"></el-table-column>
      </el-table>

      <div class="remark-label">备注</div>
      <el-input
        v-model="formData['备注']"
        type="textarea"
        :rows="4"
        maxlength="500"
        show-word-limit
        :readonly="readonly"
        placeholder="请输入"
      ></el-input>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClose">关闭</el-button>
      <el-button
        v-if="!readonly"
        type="primary"
        size="small"
        :loading="submitAuditLoading"
        @click="handleSubmitAudit"
      >
        提交审核
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { importInitialEntry, submitInitialEntry } from './api.js'

export default {
  name: 'ImportDialog',
  data() {
    return {
      visible: false,
      mode: 'add',
      currentRow: null,
      formData: {
        '类型': '封记台账',
        '选择文件': '',
        '备注': '',
      },
      importResult: {
        '导入内容': { 成功: 0, 失败: 0 },
      },
      problemTableData: [],
      fileList: [],
      imported: false,
      uploadLoading: false,
      submitAuditLoading: false,
      exportProblemLoading: false,
    }
  },
  computed: {
    dialogTitle() {
      if (this.mode === 'view') return '详情'
      if (this.mode === 'edit') return '编辑'
      return '添加'
    },
    readonly() {
      return this.mode === 'view'
    },
    hasProblem() {
      return this.problemTableData.length > 0 || this.importResult['导入内容'].失败 > 0
    },
  },
  methods: {
    open(row, mode) {
      this.mode = mode || 'add'
      this.currentRow = row || null
      this.resetData()
      if (row) this.fillRow(row)
      this.visible = true
    },
    resetData() {
      this.formData = {
        '类型': '封记台账',
        '选择文件': '',
        '备注': '',
      }
      this.importResult = {
        '导入内容': { 成功: 0, 失败: 0 },
      }
      this.problemTableData = []
      this.fileList = []
      this.imported = false
    },
    fillRow(row) {
      this.formData['类型'] = row['数据类型'] || '封记台账'
      this.formData['备注'] = row['备注'] || ''
      this.importResult['导入内容'] = {
        成功: Number(row['据条数']) || 0,
        失败: 0,
      }
      this.problemTableData = [
        { '行号': 1, '字段1': 'xxxxx', '字段2': 'xxxxx', '字段3': 'xxxxx', '字段4': 'xxxxx', '问题': 'xxxxxx' },
        { '行号': 2, '字段1': 'xxxxx', '字段2': 'xxxxx', '字段3': 'xxxxx', '字段4': 'xxxxx', '问题': '' },
        { '行号': 3, '字段1': 'xxxxx', '字段2': 'xxxxx', '字段3': 'xxxxx', '字段4': 'xxxxx', '问题': '' },
      ]
      this.imported = true
    },
    handleDownloadTemplate() {
      if (!this.formData['类型']) {
        this.$message.warning('请选择类型')
        return
      }
      this.$message.success('下载模板')
    },
    handleFileChange(file) {
      const name = file && file.name ? file.name : ''
      if (!/\.(xls|xlsx)$/i.test(name)) {
        this.fileList = []
        this.formData['选择文件'] = ''
        this.$message.warning('只能上传 Excel 文件')
        return false
      }
      this.fileList = [file]
      this.formData['选择文件'] = name
      return false
    },
    async handleImport() {
      if (!this.formData['类型']) {
        this.$message.warning('请选择类型')
        return
      }
      if (!this.fileList.length) {
        this.$message.warning('请选择文件')
        return
      }
      this.uploadLoading = true
      try {
        const raw = this.fileList[0].raw || this.fileList[0]
        const res = await importInitialEntry(raw, this.currentRow && this.currentRow.id)
        if (res && res.code === 1 && res.data) {
          this.importResult['导入内容'] = {
            成功: Number(res.data.success || res.data['成功']) || 0,
            失败: Number(res.data.fail || res.data['失败']) || 0,
          }
          this.problemTableData = res.data.problemList || []
        } else {
          this.mockImportResult()
        }
      } catch (e) {
        this.mockImportResult()
      } finally {
        this.imported = true
        this.uploadLoading = false
      }
    },
    mockImportResult() {
      this.importResult['导入内容'] = { 成功: 3, 失败: 1 }
      this.problemTableData = [
        { '行号': 1, '字段1': 'xxxxx', '字段2': 'xxxxx', '字段3': 'xxxxx', '字段4': 'xxxxx', '问题': 'xxxxxx' },
        { '行号': 2, '字段1': 'xxxxx', '字段2': 'xxxxx', '字段3': 'xxxxx', '字段4': 'xxxxx', '问题': '' },
        { '行号': 3, '字段1': 'xxxxx', '字段2': 'xxxxx', '字段3': 'xxxxx', '字段4': 'xxxxx', '问题': '' },
      ]
    },
    handleExportProblem() {
      if (!this.problemTableData.length) {
        this.$message.warning('暂无问题数据')
        return
      }
      this.exportProblemLoading = true
      setTimeout(() => {
        this.exportProblemLoading = false
        this.$message.success('导出问题')
      }, 300)
    },
    handleReImport() {
      this.fileList = []
      this.formData['选择文件'] = ''
      this.importResult['导入内容'] = { 成功: 0, 失败: 0 }
      this.problemTableData = []
      this.imported = false
    },
    async handleSubmitAudit() {
      if (!this.imported) {
        this.$message.warning('请先导入')
        return
      }
      if (this.hasProblem) {
        await this.$confirm('当前存在问题数据，确定要提交吗?', '提示', { type: 'warning' })
      }
      if (this.formData['备注'] && !this.formData['备注'].trim()) {
        this.$message.warning('备注不能只输入空白字符')
        return
      }
      this.submitAuditLoading = true
      try {
        const res = this.currentRow && this.currentRow.id ? await submitInitialEntry(this.currentRow.id) : { code: 1 }
        if (!res || res.code === 1) {
          this.$message.success('提交成功')
          this.$emit('saved')
          this.handleClose()
        }
      } finally {
        this.submitAuditLoading = false
      }
    },
    handleClose() {
      this.visible = false
    },
  },
}
</script>

<style lang="scss" scoped>
.import-dialog {
  .import-form {
    .type-select {
      width: 280px;
    }
    .template-link {
      margin-left: 24px;
    }
    .file-name {
      margin-left: 8px;
      color: #626c78;
    }
  }
  .import-action {
    text-align: right;
    margin-bottom: 28px;
  }
  .result-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    .section-title {
      font-size: 22px;
      font-weight: 700;
      color: #1b2129;
      margin-right: 36px;
    }
    .result-text {
      color: #1b2129;
      font-size: 16px;
    }
  }
  .problem-table {
    margin-bottom: 18px;
  }
  .remark-label {
    font-size: 16px;
    color: #1b2129;
    margin: 10px 0;
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
