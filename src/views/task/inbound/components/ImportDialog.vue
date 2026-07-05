<template>
  <el-dialog
    :close-on-click-modal="false"
    title="导入"
    custom-class="show-footer-dialog import-dialog"
    :visible.sync="visible"
    width="900px"
    append-to-body
    @close="handleClose"
  >
    <el-form :model="importForm" label-width="80px">
      <el-form-item label="类型" required>
        <el-radio-group v-model="importForm.inboundImportType" @change="handleTypeChange">
          <el-radio :label="1">信息导入1</el-radio>
          <el-radio :label="2">信息导入2</el-radio>
        </el-radio-group>
        <div class="type-desc">
          <div class="desc-text">* 信息导入1(材料代码、容器号、生产单位、重量:毛、皮、净、百分比含量)</div>
          <div class="desc-text">* 信息导入2(容器号、封记编码1、封记类型1、封记编码2、封记类型2、库房、货箱号、位置)</div>
        </div>
      </el-form-item>

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
    <div v-if="remindList.length > 0 || errorFiles[1] || errorFiles[2]" class="error-section">
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

      <div class="error-footer">
        <span v-if="errorFiles[1]" class="download-link" @click="downloadErrorFile(1)">
          <i class="el-icon-download"></i> 下载类型1错误文件
        </span>
        <span v-if="errorFiles[2]" class="download-link" @click="downloadErrorFile(2)">
          <i class="el-icon-download"></i> 下载类型2错误文件
        </span>
      </div>
    </div>

    <!-- 预览列表 -->
    <div v-if="previewList.length > 0" class="preview-section">
      <div class="preview-header">
        <span>预览数据（共 {{ previewList.length }} 条）</span>
        <el-button type="text" size="small" style="color: #f56c6c;" @click="clearPreview">清空</el-button>
      </div>
      <!-- 预览字段：类型1(基础信息+毛皮净/百分比含量) 与 类型2(封记/库房/货箱号/位置) 合并展示 -->
      <el-table :data="previewList" border stripe size="mini" max-height="280" style="width: 100%;">
        <el-table-column prop="goodCode" label="材料代码" min-width="100" show-overflow-tooltip />
        <el-table-column prop="containerCode" label="容器号" min-width="90" show-overflow-tooltip />
        <el-table-column prop="productionUnit" label="生产单位" min-width="100" show-overflow-tooltip />
        <el-table-column prop="warehouseName" label="库房" min-width="90" show-overflow-tooltip />
        <el-table-column prop="sealCode1" label="封记编码1" min-width="90" show-overflow-tooltip />
        <el-table-column prop="sealType1" label="封记类型1" min-width="80" show-overflow-tooltip />
        <el-table-column prop="sealCode2" label="封记编码2" min-width="90" show-overflow-tooltip />
        <el-table-column prop="sealType2" label="封记类型2" min-width="80" show-overflow-tooltip />
        <el-table-column prop="grossWeight" label="毛重" min-width="70" show-overflow-tooltip />
        <el-table-column prop="tareWeight" label="皮重" min-width="70" show-overflow-tooltip />
        <el-table-column prop="netWeight" label="净重" min-width="70" show-overflow-tooltip />
        <el-table-column prop="metalPercentage" label="百分比含量" min-width="90" show-overflow-tooltip />
        <el-table-column prop="elementQuantity" label="元素量" min-width="90" show-overflow-tooltip />
        <el-table-column prop="boxNum" label="货箱号" min-width="80" show-overflow-tooltip />
        <el-table-column prop="position" label="位置" min-width="80" show-overflow-tooltip />
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
import { importExcel, downloadTemplate } from './api'

export default {
  name: 'ImportDialog',
  data() {
    return {
      visible: false,
      uploading: false,
      importForm: {
        inboundImportType: 1
      },
      fileList: [],
      previewList: [], // 导入预览数据（两次导入后的合并结果）
      remindList: [], // 错误提示列表
      errorFiles: {
        1: '',
        2: ''
      }
    }
  },
  methods: {
    open() {
      this.resetForm()
      this.visible = true
    },
    resetForm() {
      this.importForm = { inboundImportType: 1 }
      this.fileList = []
      this.previewList = []
      this.remindList = []
      this.errorFiles = { 1: '', 2: '' }
      this.$nextTick(() => {
        if (this.$refs.upload) this.$refs.upload.clearFiles()
      })
    },
    handleClose() {
      this.resetForm()
    },
    handleTypeChange() {
      this.fileList = []
      this.$nextTick(() => {
        if (this.$refs.upload) this.$refs.upload.clearFiles()
      })
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
    isEmptyValue(value) {
      return value === undefined || value === null || String(value).trim() === ''
    },
    parseNumberValue(value) {
      if (this.isEmptyValue(value)) return NaN
      return Number(String(value).replace('%', '').trim())
    },
    getDecimalLength(value) {
      if (this.isEmptyValue(value)) return 0
      const normalized = String(value).replace('%', '').trim()
      const decimal = normalized.split('.')[1]
      return decimal ? decimal.length : 0
    },
    formatMinDecimal(value, decimalLength) {
      if (Number.isNaN(value)) return ''
      const precision = Math.min(Math.max(decimalLength, 3), 12)
      const [integerPart, decimalPart = ''] = Number(value).toFixed(precision).split('.')
      let decimals = decimalPart
      while (decimals.length > 3 && decimals.endsWith('0')) {
        decimals = decimals.slice(0, -1)
      }
      while (decimals.length < 3) {
        decimals += '0'
      }
      return `${integerPart}.${decimals}`
    },
    formatElementQuantity(percentage, netWeight, rawPercentage = percentage, rawNetWeight = netWeight) {
      const decimalLength = this.getDecimalLength(rawPercentage) + this.getDecimalLength(rawNetWeight) + 2
      return this.formatMinDecimal((percentage / 100) * netWeight, decimalLength)
    },
    calcElementQuantity(item) {
      const percentage = this.parseNumberValue(item.metalPercentage)
      const netWeight = this.parseNumberValue(item.netWeight)
      if (Number.isNaN(percentage) || Number.isNaN(netWeight)) return ''
      return this.formatElementQuantity(percentage, netWeight, item.metalPercentage, item.netWeight)
    },
    isCompletePreviewRow(item) {
      // 两类模板字段均完整方可提交：类型1(基础+重量) + 类型2(封记/库房/货箱号/位置)
      const requiredFields = [
        'goodCode',
        'containerCode',
        'productionUnit',
        'grossWeight',
        'tareWeight',
        'netWeight',
        'metalPercentage',
        'sealCode1',
        'sealType1',
        'sealCode2',
        'sealType2',
        'warehouseId',
        'warehouseName',
        'boxNum',
        'position'
      ]
      return requiredFields.every(field => !this.isEmptyValue(item[field]))
    },
    downloadTemplate() {
      downloadTemplate({ tempType: this.importForm.inboundImportType }).then(res => {
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
        const disposition = res.headers && res.headers['content-disposition']
        let fileName = `信息导入模板${this.importForm.inboundImportType}`
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
    downloadErrorFile(type) {
      const path = this.errorFiles[type]
      if (!path) return
      const baseUrl = process.env.VUE_APP_FILE_ACCESS_PATH || ''
      const downloadUrl = `${baseUrl}/${path}`
      window.open(downloadUrl, '_blank')
    },
    async submitImport() {
      if (this.fileList.length === 0) {
        this.$message.warning('请选择要导入的文件')
        return
      }
      const formData = new FormData()
      formData.append('file', this.fileList[0].raw)
      formData.append('importType', 'inbound')
      formData.append('inboundImportType', this.importForm.inboundImportType)

      this.uploading = true
      try {
        const res = await importExcel(formData)
        if (res.code === 1) {
          const resData = res.data || {}
          // 后端返回的 successList 即为本次解析成功的全部数据，预览阶段不再二次过滤
          const importedData = Array.isArray(resData.successList) ? resData.successList : []
          const successNum = resData.successNum || 0
          const failNum = resData.failNum || 0

          // 处理错误信息
          this.remindList = Array.isArray(resData.remindList) ? resData.remindList : []
          if (resData.failFilePath) {
            this.errorFiles[this.importForm.inboundImportType] = resData.failFilePath
          }

          if (this.importForm.inboundImportType === 1) {
            // 类型1：基础信息 + 重量信息(毛皮净、百分比含量)；库房/封记/货箱号/位置由类型2补充
            this.previewList = importedData.map(item => ({
              goodCode: item.goodCode || '',
              containerCode: item.containerCode || '',
              productionUnit: item.productionUnit || '',
              grossWeight: item.grossWeight || '',
              tareWeight: item.tareWeight || '',
              netWeight: item.netWeight || '',
              metalPercentage: item.metalPercentage || '',
              elementQuantity: item.elementQuantity || this.calcElementQuantity(item),
              warehouseId: '',  // 库房ID由类型2提供（原类型1逻辑已移至类型2）
              warehouseName: '',
              sealCode1: '', sealType1: '', sealCode2: '', sealType2: '',
              boxNum: '', position: ''
            }))
          } else {
            // 类型2：通过容器号 containerCode 匹配并合并到现有 previewList
            if (this.previewList.length === 0) {
              // 若还未导入类型1，直接填充类型2字段(封记/库房/货箱号/位置)，基础与重量信息留空
              this.previewList = importedData.map(item => ({
                goodCode: '', productionUnit: '',
                grossWeight: '', tareWeight: '', netWeight: '', metalPercentage: '', elementQuantity: '',
                containerCode: item.containerCode || '',
                sealCode1: item.sealCode1 || '', sealType1: item.sealType1 || '',
                sealCode2: item.sealCode2 || '', sealType2: item.sealType2 || '',
                warehouseId: item.warehouseId || '',
                warehouseName: item.warehouseName || '',
                boxNum: item.boxNum || '', position: item.position || ''
              }))
            } else {
              // 通过容器号匹配，将类型2字段(封记/库房/货箱号/位置)补充到已存在的预览行
              importedData.forEach(importItem => {
                const target = this.previewList.find(p => p.containerCode === importItem.containerCode)
                if (target) {
                  target.sealCode1 = importItem.sealCode1 || target.sealCode1
                  target.sealType1 = importItem.sealType1 || target.sealType1
                  target.sealCode2 = importItem.sealCode2 || target.sealCode2
                  target.sealType2 = importItem.sealType2 || target.sealType2
                  target.warehouseId = importItem.warehouseId || target.warehouseId
                  target.warehouseName = importItem.warehouseName || target.warehouseName
                  target.boxNum = importItem.boxNum || target.boxNum
                  target.position = importItem.position || target.position
                }
              })
            }
          }

          // 根据后端统计值给出准确提示
          const typeText = this.importForm.inboundImportType === 1 ? '信息导入1' : '信息导入2'
          if (successNum > 0) {
            this.$message.success(`${typeText}成功，共 ${successNum} 条`)
          }
          if (failNum > 0 || this.remindList.length > 0) {
            this.$message.warning(`共 ${failNum} 条数据异常，请查看下方提示`)
          }
          if (successNum === 0 && failNum === 0 && this.remindList.length === 0) {
            this.$message.warning('未解析到有效数据')
          }

          // 清空文件选择
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
      const completeRows = this.previewList.filter(item => this.isCompletePreviewRow(item))
      const skippedCount = this.previewList.length - completeRows.length
      if (skippedCount > 0) {
        this.$message.warning(`已跳过 ${skippedCount} 条信息不全的数据`)
      }
      if (completeRows.length === 0) {
        this.$message.warning('没有信息完整的数据可提交')
        return
      }
      this.$emit('success', completeRows)
      this.visible = false
    }
  }
}
</script>

<style scoped>
.type-desc {
  margin-top: 5px;
  line-height: 1.8;
}
.desc-text {
  font-size: 12px;
  color: #909399;
}
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
