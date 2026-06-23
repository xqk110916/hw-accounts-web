<template>
  <el-dialog
    title="恢复备份数据"
    :visible.sync="visible"
    width="520px"
    append-to-body
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <el-alert
      class="warn-tip"
      type="warning"
      :closable="false"
      show-icon
      title="恢复会用 DMP 备份覆盖当前数据库，且操作不可撤销，请谨慎操作！"
    />
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
          <span class="file-name">{{ fileName || '仅支持 .dmp 备份文件' }}</span>
        </el-upload>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button type="danger" size="small" :loading="uploadLoading" @click="handleRestore">恢复</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { restoreByUpload } from './api.js'

export default {
  name: 'RestoreUploadDialog',
  data() {
    return {
      visible: false,
      uploadLoading: false,
      fileList: [],
      fileName: '',
    }
  },
  methods: {
    open() {
      this.fileList = []
      this.fileName = ''
      this.visible = true
    },
    handleFileChange(file) {
      const name = file && file.name ? file.name : ''
      if (!/\.dmp$/i.test(name)) {
        this.clearFile()
        this.$message.warning('只能上传 .dmp 备份文件')
        return false
      }
      this.fileList = [file]
      this.fileName = name
      return false
    },
    clearFile() {
      this.fileList = []
      this.fileName = ''
    },
    handleRestore() {
      if (!this.fileList.length) {
        this.$message.warning('请选择 DMP 备份文件')
        return
      }
      // 高危操作：恢复前二次确认
      this.$confirm('恢复将覆盖当前数据库且不可撤销，确定继续吗？', '高危操作确认', {
        confirmButtonText: '确定恢复',
        cancelButtonText: '取消',
        type: 'error',
      }).then(() => {
        this.doRestore()
      }).catch(() => {})
    },
    doRestore() {
      this.uploadLoading = true
      const file = this.fileList[0].raw || this.fileList[0]
      restoreByUpload(file).then(res => {
        if (res.code === 1) {
          this.$message.success('恢复成功')
          this.$emit('saved')
          this.handleClose()
        }
      }).finally(() => {
        this.uploadLoading = false
      })
    },
    handleClose(done) {
      this.visible = false
      if (typeof done === 'function') done()
    },
  },
}
</script>

<style lang="scss" scoped>
.warn-tip {
  margin-bottom: 16px;
}
.file-name {
  margin-left: 8px;
  color: #626c78;
}
</style>
