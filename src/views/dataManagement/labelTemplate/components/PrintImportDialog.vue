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
      <el-form-item label="选择文件" required>
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
    </el-form>
    <div slot="footer">
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button type="primary" size="small" :loading="importLoading" @click="handleImport">导入</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'PrintImportDialog',
  data() {
    return {
      visible: false,
      importLoading: false,
      fileList: [],
      formData: {
        '选择文件': '',
      },
    }
  },
  methods: {
    open() {
      this.fileList = []
      this.formData['选择文件'] = ''
      this.visible = true
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
    handleImport() {
      if (!this.fileList.length) {
        this.$message.warning('请选择文件')
        return
      }
      this.importLoading = true
      setTimeout(() => {
        this.importLoading = false
        this.$message.success('导入成功')
        this.$emit('saved')
        this.handleClose()
      }, 300)
    },
    handleClose() {
      this.visible = false
    },
  },
}
</script>

<style lang="scss" scoped>
.file-name {
  margin-left: 8px;
  color: #626c78;
}
</style>
