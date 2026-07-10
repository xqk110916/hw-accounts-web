<template>
  <el-dialog
    :close-on-click-modal="false"
    title="导入"
    custom-class="show-footer-dialog import-dialog"
    :visible.sync="visible"
    width="1000px"
    append-to-body
    @close="handleClose"
  >
    <el-form :model="importForm" label-width="80px">
      <el-form-item label="选择文件" required>
        <el-upload
          ref="upload"
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :limit="1"
          accept=".xlsx,.xls"
          :file-list="fileList"
        >
          <el-button size="small" type="primary">选择文件</el-button>
          <div slot="tip" class="el-upload__tip">只能上传xls/xlsx文件</div>
        </el-upload>
      </el-form-item>

      <div class="import-actions">
        <el-link type="primary" @click="downloadTemplate">下载模板</el-link>
        <el-button size="small" type="primary" :loading="uploading" @click="submitImport" style="margin-left: 12px;">导入并预览</el-button>
      </div>
    </el-form>

    <!-- 错误信息展示区域 -->
    <div v-if="remindList.length > 0 || failFilePath" class="error-section">
      <div class="error-header">
        <i class="el-icon-warning" style="color: #f56c6c; margin-right: 8px;"></i>
        <span class="error-title">导入异常提示</span>
      </div>

      <div v-if="remindList.length > 0" class="error-list">
        <div v-for="(err, index) in remindList" :key="index" class="error-item">
          <span class="error-num">第{{ err.num || '-' }}行:</span>
          <span class="error-text">{{ err.remind }}</span>
        </div>
      </div>

      <div v-if="failFilePath" class="error-footer">
        <span class="download-link" @click="downloadErrorFile">
          <i class="el-icon-download"></i> 下载错误文件
        </span>
      </div>
    </div>

    <!-- 预览列表 -->
    <div v-if="previewList.length > 0" class="preview-section">
      <div class="preview-header">
        <span>预览数据（共 {{ previewList.length }} 条）</span>
        <el-button type="text" size="small" style="color: #f56c6c;" @click="clearPreview">清空</el-button>
      </div>
      <el-table :data="previewList" border stripe size="mini" max-height="320" style="width: 100%;">
        <el-table-column prop="containerCode" label="容器号" min-width="100" show-overflow-tooltip />
        <el-table-column prop="taskNum" label="入库任务编号" min-width="120" show-overflow-tooltip />
        <el-table-column prop="goodCode" label="材料代码" min-width="100" show-overflow-tooltip />
        <el-table-column prop="productionUnit" label="生产单位" min-width="100" show-overflow-tooltip />
        <el-table-column prop="sourceWarehouse" label="原库房" min-width="90" show-overflow-tooltip />
        <el-table-column label="原位置" min-width="100" show-overflow-tooltip>
          <template slot-scope="scope">{{ getPositionText(scope.row, 'source') }}</template>
        </el-table-column>
        <el-table-column prop="targetWarehouse" label="目标库房" min-width="90" show-overflow-tooltip />
        <el-table-column label="目标位置" min-width="100" show-overflow-tooltip>
          <template slot-scope="scope">{{ getPositionText(scope.row, 'target') }}</template>
        </el-table-column>
        <el-table-column label="重量(毛,皮,净)" min-width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.grossWeight || 0 }}、{{ scope.row.tareWeight || 0 }}、{{ scope.row.netWeight || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="elementQuantity" label="元素量" min-width="90" show-overflow-tooltip />
      </el-table>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="visible = false">取消</el-button>
      <el-button
        type="primary"
        size="small"
        :disabled="previewList.length === 0"
        @click="confirmSubmit"
      >确认提交</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { downloadMoveTemplate, importMove } from './api.js'

export default {
  name: 'MoveImportDialog',
  data() {
    return {
      visible: false,
      uploading: false,
      fileList: [],
      previewList: [],
      remindList: [],
      failFilePath: '',
    }
  },
  methods: {
    open() {
      this.resetForm()
      this.visible = true
    },
    resetForm() {
      this.fileList = []
      this.previewList = []
      this.remindList = []
      this.failFilePath = ''
      this.$nextTick(() => {
        if (this.$refs.upload) this.$refs.upload.clearFiles()
      })
    },
    handleClose() {
      this.resetForm()
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList
    },
    handleFileRemove(file, fileList) {
      this.fileList = fileList
    },
    clearPreview() {
      this.previewList = []
    },
    downloadTemplate() {
      downloadMoveTemplate({ tempType: 5 }).then(res => {
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
        const disposition = res.headers && res.headers['content-disposition']
        let fileName = '移库导入模板'
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
      }).catch(() => {
        this.$message.error('下载模板失败')
      })
    },
    downloadErrorFile() {
      if (!this.failFilePath) return
      const baseUrl = process.env.VUE_APP_FILE_ACCESS_PATH || ''
      window.open(`${baseUrl}/${this.failFilePath}`, '_blank')
    },
    // 兼容接口返回的多种结构：数组、{ successList }、{ list }
    pickSuccessList(data) {
      if (Array.isArray(data)) return data
      if (!data) return []
      if (Array.isArray(data.successList)) return data.successList
      if (Array.isArray(data.list)) return data.list
      return []
    },
    async submitImport() {
      if (this.fileList.length === 0) {
        this.$message.warning('请选择要导入的文件')
        return
      }
      const formData = new FormData()
      formData.append('file', this.fileList[0].raw)

      this.uploading = true
      try {
        const res = await importMove(formData)
        if (res.code === 1) {
          const importedData = this.pickSuccessList(res.data)
          this.remindList = (res.data && Array.isArray(res.data.remindList)) ? res.data.remindList : []
          this.failFilePath = (res.data && res.data.failFilePath) || ''

          if (importedData.length === 0 && this.remindList.length > 0) {
            this.$message.warning('文件导入存在异常，请查看提示信息')
          } else {
            this.previewList = importedData
            this.$message.success(`导入成功，共 ${importedData.length} 条`)
          }

          this.fileList = []
          this.$nextTick(() => {
            if (this.$refs.upload) this.$refs.upload.clearFiles()
          })
        }
      } catch (err) {
        console.error('导入失败', err)
      } finally {
        this.uploading = false
      }
    },
    confirmSubmit() {
      if (this.previewList.length === 0) {
        this.$message.warning('暂无预览数据可提交')
        return
      }
      this.$emit('success', this.previewList)
      this.visible = false
    },
    getPositionText(row = {}, prefix) {
      const values = [row[`${prefix}Shelf`], row[`${prefix}Row`], row[`${prefix}Column`]].filter(Boolean)
      return values.length ? values.join('-') : '-'
    },
  },
}
</script>

<style scoped>
.import-actions {
  margin-left: 80px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}
.preview-section {
  margin-top: 12px;
  border-top: 1px solid #ebeef5;
  padding-top: 12px;
}
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: bold;
  color: #606266;
  margin-bottom: 8px;
}
.dialog-footer {
  text-align: right;
}
.error-section {
  margin-top: 15px;
  padding: 12px;
  background-color: #fff1f0;
  border: 1px solid #ffa39e;
  border-radius: 4px;
}
.error-header {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}
.error-title {
  font-size: 14px;
  font-weight: bold;
  color: #cf1322;
}
.error-list {
  max-height: 120px;
  overflow-y: auto;
  margin-bottom: 10px;
}
.error-item {
  font-size: 13px;
  color: #5c0011;
  margin-bottom: 4px;
  line-height: 1.5;
}
.error-num {
  font-weight: bold;
  margin-right: 6px;
}
.error-footer {
  display: flex;
  gap: 15px;
  border-top: 1px dashed #ffa39e;
  padding-top: 8px;
}
.download-link {
  font-size: 13px;
  color: #246fe5;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.download-link:hover {
  text-decoration: underline;
  color: #518ff3;
}
</style>
