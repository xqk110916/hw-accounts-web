<template>
  <el-dialog title="详情" :visible.sync="dialogVisible" width="600px" :close-on-click-modal="false">
    <el-form ref="form" :model="form" label-width="100px" class="detail-form">
      <el-form-item label="操作时间">
        <el-input v-model="form.operateTime" disabled></el-input>
      </el-form-item>
      <el-form-item label="类型">
        <el-input v-model="form.type" disabled></el-input>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="3" disabled></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="dialogVisible = false">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getDataBackupDetail } from './api.js'

export default {
  name: 'DetailDialog',
  data() {
    return {
      dialogVisible: false,
      form: {
        operateTime: '',
        type: '',
        remark: ''
      }
    }
  },
  methods: {
    open(row) {
      this.dialogVisible = true
      if (row && row.id) {
        this.getDetail(row.id)
      }
    },
    getDetail(id) {
      getDataBackupDetail({ id }).then(res => {
        if (res.code === 1 && res.data) {
          const typeMap = {
            'import': '导入',
            'export': '导出'
          }
          this.form = {
            ...res.data,
            type: typeMap[res.data.type] || res.data.type
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-form {
  padding: 20px;

  ::v-deep .el-input__inner,
  ::v-deep .el-textarea__inner {
    width: 100%;
  }
}
</style>
