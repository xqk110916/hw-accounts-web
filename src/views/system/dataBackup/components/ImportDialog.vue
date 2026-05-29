<template>
  <el-dialog title="导入" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false" @close="resetForm">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="import-form">
      <el-form-item label="文件" prop="file">
        <el-upload
          ref="upload"
          class="upload-demo"
          action="#"
          :auto-upload="false"
          :limit="1"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          accept=".xlsx,.xls,.csv"
        >
          <el-button size="small" type="primary">选择文件</el-button>
          <div slot="tip" class="el-upload__tip">支持 .xlsx, .xls, .csv 格式文件</div>
        </el-upload>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="dialogVisible = false">取 消</el-button>
      <el-button size="small" type="primary" :loading="loading" @click="submitForm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { importData } from './api.js'

export default {
  name: 'ImportDialog',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      form: {
        file: null,
        remark: ''
      },
      rules: {
        file: [
          { required: true, message: '请选择文件', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    open() {
      this.dialogVisible = true
    },
    handleFileChange(file) {
      this.form.file = file.raw
    },
    handleFileRemove() {
      this.form.file = null
    },
    submitForm() {
      if (!this.form.file) {
        this.$message.warning('请选择文件')
        return
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          const formData = new FormData()
          formData.append('file', this.form.file)
          if (this.form.remark) {
            formData.append('remark', this.form.remark)
          }
          importData(formData).then(res => {
            if (res.code === 1) {
              this.$message.success('导入成功')
              this.$emit('success')
              this.dialogVisible = false
            } else {
              this.$message.error(res.message || '导入失败')
            }
          }).catch(() => {
            this.$message.error('导入失败')
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },
    resetForm() {
      this.form = {
        file: null,
        remark: ''
      }
      this.$refs.upload && this.$refs.upload.clearFiles()
      this.$refs.form && this.$refs.form.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.import-form {
  padding: 20px;

  .upload-demo {
    width: 100%;
  }
}
</style>
