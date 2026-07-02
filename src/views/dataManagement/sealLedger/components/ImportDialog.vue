<template>
  <el-dialog
    title="导入"
    :visible.sync="visible"
    width="560px"
    append-to-body
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <el-form label-width="90px" size="small">
      <el-form-item label="选择文件" required>
        <el-upload
          action=""
          :auto-upload="false"
          :show-file-list="false"
          :file-list="fileList"
          :on-change="handleFileChange"
        >
          <el-button size="small">选择文件</el-button>
          <el-button size="small" type="text" :loading="downloadLoading" @click.stop="handleDownloadTemplate">下载模板</el-button>
          <span class="file-name">{{ fileName || '未选择任何文件' }}</span>
        </el-upload>
      </el-form-item>
    </el-form>
    <div v-if="hasResult" class="result-head">
      <div>
        <span class="section-title">导入内容</span>
        <span class="result-text">总{{ importResult.totalNum || 0 }}条，成功{{ importResult.successNum || 0 }}条，失败{{ importResult.failNum || 0 }}条</span>
      </div>
      <div class="result-actions">
        <el-button size="small" :disabled="!failFilePath" @click="handleExportProblem">导出问题</el-button>
        <el-button size="small" @click="handleReImport">重新导入</el-button>
      </div>
    </div>
    <div v-if="remindList.length" class="remind-section">
      <div class="remind-title">导入异常提示</div>
      <div v-for="(item, index) in remindList" :key="index" class="remind-item">
        第{{ item.num || '-' }}行：{{ item.typeName || '' }} {{ item.remind || '' }}
      </div>
    </div>
    <span slot="footer">
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button type="primary" size="small" :loading="uploadLoading" @click="handleImport">导入</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { downloadSealTemplate, importSealRecord } from './api.js'

export default {
  name: 'ImportDialog',
  data() {
    return {
      visible: false,
      uploadLoading: false,
      downloadLoading: false,
      fileList: [],
      fileName: '',
      importResult: {},
    }
  },
  computed: {
    hasResult() {
      return Object.keys(this.importResult || {}).length > 0
    },
    remindList() {
      return this.importResult && Array.isArray(this.importResult.remindList) ? this.importResult.remindList : []
    },
    failFilePath() {
      return (this.importResult && this.importResult.failFilePath) || ''
    },
  },
  methods: {
    open() {
      this.fileList = []
      this.fileName = ''
      this.importResult = {}
      this.visible = true
    },
    handleFileChange(file) {
      const name = file && file.name ? file.name : ''
      const size = file && file.size ? file.size : 0
      if (!/\.(xls|xlsx)$/i.test(name)) {
        this.clearFile()
        this.$message.warning('只能上传 Excel 文件')
        return false
      }
      if (size > 20 * 1024 * 1024) {
        this.clearFile()
        this.$message.warning('文件大小不能超过20MB')
        return false
      }
      this.fileList = [file]
      this.fileName = name
      return false
    },
    async handleDownloadTemplate() {
      this.downloadLoading = true
      try {
        const res = await downloadSealTemplate({ tempType: 4 })
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
        const disposition = res.headers && (res.headers['content-disposition'] || res.headers['Content-Disposition'])
        let fileName = '封记台账导入模板.xlsx'
        if (disposition) {
          const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^";\n]+)/i)
          if (match && match[1]) {
            fileName = decodeURIComponent(match[1].replace(/['"]/g, ''))
          }
        }
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        this.$message.error('模板下载失败')
      } finally {
        this.downloadLoading = false
      }
    },
    clearFile() {
      this.fileList = []
      this.fileName = ''
    },
    async handleImport() {
      if (!this.fileList.length) {
        this.$message.warning('请选择文件')
        return
      }
      this.uploadLoading = true
      try {
        const file = this.fileList[0].raw || this.fileList[0]
        const res = await importSealRecord(file)
        if (res.code === 1) {
          const data = res.data || {}
          this.importResult = data
          const failNum = Number(data.failNum) || 0
          const remindList = Array.isArray(data.remindList) ? data.remindList : []
          const hasFailure = failNum > 0 && remindList.length > 0
          if (hasFailure) {
            // 有失败记录：保持弹窗打开，展示异常信息和问题文件下载入口
            this.$message.warning(`共 ${failNum} 条数据导入失败，请查看下方提示`)
            this.clearFile()
          } else {
            // 全部成功：关闭弹窗，刷新列表
            this.$message.success('导入成功')
            this.$emit('saved')
            this.visible = false
          }
        }
      } finally {
        this.uploadLoading = false
      }
    },
    handleExportProblem() {
      if (!this.failFilePath) {
        this.$message.warning('暂无问题文件')
        return
      }
      const baseUrl = process.env.VUE_APP_FILE_ACCESS_PATH || ''
      window.open(`${baseUrl}/${this.failFilePath}`, '_blank')
    },
    handleReImport() {
      this.fileList = []
      this.fileName = ''
      this.importResult = {}
    },
    handleClose(done) {
      this.visible = false
      if (typeof done === 'function') done()
    },
  },
}
</script>

<style lang="scss" scoped>
.file-name {
  margin-left: 8px;
  color: #626c78;
}

.result-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 14px 0 12px;

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

.remind-section {
  padding: 12px;
  margin-bottom: 12px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  color: #7c4b00;

  .remind-title {
    font-weight: 700;
    margin-bottom: 8px;
  }

  .remind-item {
    line-height: 22px;
  }
}
</style>
