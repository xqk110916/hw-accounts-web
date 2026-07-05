<template>
  <el-dialog :title="dialogTitle" :visible.sync="visible" :close-on-click-modal="false" width="1080px" top="4vh" append-to-body :before-close="handleClose">
    <div class="import-dialog" v-loading="detailLoading">
      <el-form ref="form" :model="formData" label-width="90px" size="small" class="import-form">
        <el-form-item label="类型" required>
          <el-select v-model="formData.operationType" :disabled="readonly" placeholder="请选择类型" class="type-select">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-button type="text" class="template-link" :disabled="readonly" @click="handleDownloadTemplate">下载模板</el-button>
        </el-form-item>
        <el-form-item v-if="!readonly" label="选择文件" required>
          <el-upload action="" :auto-upload="false" :show-file-list="false" :on-change="handleFileChange" :file-list="fileList">
            <el-button size="small">选择文件</el-button>
            <span class="file-name">{{ formData.fileName || '未选择任何文件' }}</span>
          </el-upload>
        </el-form-item>
        <div v-if="!readonly" class="import-action">
          <el-button type="primary" size="small" :loading="uploadLoading" @click="handleImport">导入</el-button>
        </div>
      </el-form>

      <div class="result-head">
        <div>
          <span class="section-title">导入内容</span>
          <span class="result-text">总{{ importResult.totalNum }}条，成功{{ importResult.successNum }}条，失败{{ importResult.failNum }}条</span>
        </div>
        <div v-if="!readonly" class="result-actions">
          <el-button size="small" :disabled="!failFilePath" @click="handleExportProblem">导出问题</el-button>
          <el-button size="small" @click="handleReImport">重新导入</el-button>
        </div>
      </div>

      <el-table :data="detailTableData" border size="small" class="detail-table" max-height="330">
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

      <div v-if="remindList.length" class="remind-section">
        <div class="remind-title">导入异常提示</div>
        <div v-for="(item, index) in remindList" :key="index" class="remind-item">
          第{{ item.num || '-' }}行：{{ item.typeName || '' }} {{ item.remind || '' }}
        </div>
      </div>

      <div class="remark-label">备注</div>
      <el-input v-model="formData.remark" type="textarea" :rows="4" maxlength="500" show-word-limit :readonly="readonly" placeholder="请输入"></el-input>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClose">关闭</el-button>
      <template v-if="!readonly">
        <el-button size="small" :loading="submitLoading" @click="handleSaveDraft">暂存</el-button>
        <el-button type="primary" size="small" :loading="submitLoading" @click="handleSubmitAudit">提交</el-button>
      </template>
    </div>
  </el-dialog>
</template>

<script>
import { detailInitialEntry, downloadInitialTemplate, editInitialEntry, importInitialEntry, submitInitialEntry } from './api.js'
import { formatSealType, getSealTypeOptions } from '@/utils/sealType.js'
import { getDictionaryList } from '@/api/common/dictionary.js'

export default {
  name: 'ImportDialog',
  data() {
    return {
      visible: false,
      mode: 'add',
      currentRow: null,
      detailLoading: false,
      formData: {
        operationType: '入库',
        fileName: '',
        remark: '',
      },
      importResult: {
        totalNum: 0,
        successNum: 0,
        failNum: 0,
      },
      detailTableData: [],
      remindList: [],
      failFilePath: '',
      fileList: [],
      imported: false,
      reImported: false,
      uploadLoading: false,
      submitLoading: false,
      sealTypeOptions: [],
      typeOptions: [],
      detailPagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
    }
  },
  created() {
    this.loadSealTypeOptions()
    this.loadTypeOptions()
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
  },
  methods: {
    open(row, mode) {
      this.mode = mode || 'add'
      this.currentRow = row || null
      this.resetData()
      this.visible = true
      if (row && row.id) this.loadDetail()
      if (this.mode === 'add' && this.typeOptions.length === 1) {
        this.formData.operationType = this.typeOptions[0].value
      }
    },
    resetData() {
      this.formData = {
        operationType: '',
        fileName: '',
        remark: '',
      }
      this.importResult = { totalNum: 0, successNum: 0, failNum: 0 }
      this.detailTableData = []
      this.remindList = []
      this.failFilePath = ''
      this.fileList = []
      this.imported = false
      this.reImported = false
      this.detailPagination = { currentPage: 1, pageSize: 10, total: 0 }
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
          this.formData.operationType = data.operationType || this.currentRow.operationType || ''
          this.formData.remark = data.remark || ''
          const pageData = data.dataList || {}
          this.detailTableData = pageData.list || []
          this.detailPagination.total = Number(pageData.pagination && pageData.pagination.total) || 0
          this.importResult = {
            totalNum: Number(data.dataTotal) || this.detailPagination.total || 0,
            successNum: Number(data.dataTotal) || this.detailPagination.total || 0,
            failNum: 0,
          }
          this.imported = this.detailTableData.length > 0
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
    async loadTypeOptions() {
      try {
        const res = await getDictionaryList({ keyword: '录入类型' })
        if (res.code === 1 && res.data && res.data.list) {
          const parent = res.data.list.find(item => item.fullName === '录入类型' && item.parentId === '0')
          if (parent) {
            const childRes = await getDictionaryList({ parentId: parent.id })
            if (childRes.code === 1 && childRes.data && childRes.data.list) {
              this.typeOptions = childRes.data.list.map(item => ({
                label: item.fullName,
                value: item.fullName
              }))
              if (this.mode === 'add' && this.typeOptions.length === 1) {
                this.formData.operationType = this.typeOptions[0].value
              }
            }
          }
        }
      } catch (e) {
        this.typeOptions = []
      }
    },
    getSealTypeLabel(value) {
      return formatSealType(this.sealTypeOptions, value)
    },
    handleDownloadTemplate() {
      downloadInitialTemplate({ tempType: 3 }).then(res => {
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
        const disposition = res.headers && res.headers['content-disposition']
        let fileName = '初始录入导入模板'
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
        this.$message.error('模板下载失败')
      })
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
      if (!this.fileList.length) {
        this.$message.warning('请选择文件')
        return
      }
      this.uploadLoading = true
      try {
        const raw = this.fileList[0].raw || this.fileList[0]
        const res = await importInitialEntry(raw, this.currentRow && this.currentRow.id)
        if (res.code === 1) {
          const data = res.data || {}
          this.importResult = {
            totalNum: Number(data.totalNum) || 0,
            successNum: Number(data.successNum) || 0,
            failNum: Number(data.failNum) || 0,
          }
          this.detailTableData = data.successList || []
          this.detailPagination.total = this.detailTableData.length
          this.remindList = data.remindList || []
          this.failFilePath = data.failFilePath || ''
          this.imported = true
          this.reImported = true
          this.$message.success('导入完成')
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
      this.formData.fileName = ''
      this.importResult = { totalNum: 0, successNum: 0, failNum: 0 }
      this.detailTableData = []
      this.detailPagination.total = 0
      this.remindList = []
      this.failFilePath = ''
      this.imported = false
      this.reImported = false
    },
    async handleSaveDraft() {
      await this.submitForm(2)
    },
    async handleSubmitAudit() {
      await this.submitForm(3)
    },
    async submitForm(submitType) {
      if (!this.imported && this.mode === 'add') {
        this.$message.warning('请先导入')
        return
      }
      if (this.formData.remark && !this.formData.remark.trim()) {
        this.$message.warning('备注不能只输入空白字符')
        return
      }
      this.submitLoading = true
      try {
        const isEdit = this.currentRow && this.currentRow.id
        const payload = {
          id: isEdit ? this.currentRow.id : undefined,
          remark: this.formData.remark,
          submitType,
          dataList: isEdit && !this.reImported ? [] : this.detailTableData,
        }
        const res = this.currentRow && this.currentRow.id ? await editInitialEntry(payload) : await submitInitialEntry(payload)
        if (res.code === 1) {
          this.$message.success(submitType === 2 ? '暂存成功' : '提交成功')
          this.$emit('saved')
          this.handleClose()
        }
      } finally {
        this.submitLoading = false
      }
    },
    handleDetailSizeChange(value) {
      this.detailPagination.pageSize = value
      this.detailPagination.currentPage = 1
      if (this.currentRow && this.currentRow.id) this.loadDetail()
    },
    handleDetailCurrentChange(value) {
      this.detailPagination.currentPage = value
      if (this.currentRow && this.currentRow.id) this.loadDetail()
    },
    formatLocation(row) {
      const values = [row.shelfCode, row.rowCode, row.columnCode].filter(Boolean)
      const location = values.length ? values.join('-') : ''
      if (!location) return '-'
      const warehouseCode = row.warehouseCode || row.warehouseName || ''
      return warehouseCode ? `${warehouseCode} - ${location}` : location
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
    margin-bottom: 20px;
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
  .detail-table {
    margin-bottom: 12px;
  }
  .detail-pagination {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
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
