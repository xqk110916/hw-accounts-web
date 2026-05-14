<template>
  <el-dialog
    title="导入"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="520px"
    append-to-body
    :before-close="handleClose"
  >
    <el-form :model="formData" label-width="90px" size="small">
      <el-form-item label="选择模板" required>
        <el-select v-model="formData.templateId" class="full-input" placeholder="请选择模板">
          <el-option v-for="item in templateOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="formData.remark" maxlength="200" placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item label="选择文件" required>
        <el-upload
          action=""
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          :file-list="fileList"
        >
          <el-button size="small">选择文件</el-button>
          <el-button size="small" type="text" :disabled="!formData.templateId" @click.stop="handleDownloadTemplate">下载模板</el-button>
          <span class="file-name">{{ formData.fileName || '未选择任何文件' }}</span>
        </el-upload>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button type="primary" size="small" :loading="importLoading" @click="handleImport">导入</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { exportLabelDataTemplate, importLabelData, listAllTemplate } from './api'
import { templateListToOptions } from './storage'

export default {
  name: 'PrintImportDialog',
  data() {
    return {
      visible: false,
      importLoading: false,
      templateLoading: false,
      fileList: [],
      templateOptions: [],
      formData: {
        fileName: '',
        templateId: '',
        remark: '',
      },
    }
  },
  methods: {
    async open() {
      this.fileList = []
      this.formData.fileName = ''
      this.formData.templateId = ''
      this.formData.remark = ''
      this.visible = true
      await this.loadTemplateOptions()
    },
    async loadTemplateOptions() {
      this.templateLoading = true
      try {
        const res = await listAllTemplate()
        this.templateOptions = templateListToOptions(res.data)
        this.formData.templateId = this.templateOptions[0] ? this.templateOptions[0].value : ''
      } finally {
        this.templateLoading = false
      }
    },
    handleFileChange(file) {
      const name = file && file.name ? file.name : ''
      if (!/\.(xls|xlsx)$/i.test(name)) {
        this.fileList = []
        this.formData.fileName = ''
        this.$message.warning('只能上传 Excel 文件')
        return false
      }
      this.fileList = [file]
      this.formData.fileName = name
      return false
    },
    async handleImport() {
      if (!this.formData.templateId) {
        this.$message.warning('请选择模板')
        return
      }
      if (!this.fileList.length) {
        this.$message.warning('请选择文件')
        return
      }
      this.importLoading = true
      try {
        const file = this.fileList[0].raw || this.fileList[0]
        await importLabelData(file, this.formData.templateId, this.formData.remark)
        this.importLoading = false
        this.$message.success('导入成功')
        this.$emit('saved')
        this.handleClose()
      } finally {
        this.importLoading = false
      }
    },
    async handleDownloadTemplate() {
      if (!this.formData.templateId) {
        this.$message.warning('请选择模板')
        return
      }
      const res = await exportLabelDataTemplate({ templateId: this.formData.templateId })
      const blob = new Blob([res.data])
      const link = document.createElement('a')
      const disposition = res.headers && (res.headers['content-disposition'] || res.headers['Content-Disposition'])
      const matched = disposition && disposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/i)
      const fileName = matched ? decodeURIComponent(matched[1].replace(/"/g, '')) : '标签数据导入模板.xlsx'
      link.href = window.URL.createObjectURL(blob)
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(link.href)
    },
    handleClose() {
      this.visible = false
    },
  },
}
</script>

<style lang="scss" scoped>
.full-input {
  width: 100%;
}
.file-name {
  margin-left: 8px;
  color: #626c78;
}
</style>
