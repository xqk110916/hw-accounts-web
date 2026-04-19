<template>
  <el-drawer
    :title="title"
    :visible.sync="visible"
    direction="rtl"
    size="500px"
    :before-close="handleClose">
    <div class="drawer-content">
      <el-form ref="form" :model="form" label-width="100px" size="small">
        <el-form-item label="数据类型" prop="dataType">
          <el-input v-model="form.dataType" :disabled="mode === 'view'"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="form.remark" :disabled="mode === 'view'"></el-input>
        </el-form-item>
      </el-form>
      <div class="drawer-footer" v-if="mode !== 'view'">
        <el-button size="small" @click="handleClose">取 消</el-button>
        <el-button size="small" type="primary" @click="submit">确 定</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      title: '操作',
      mode: 'add',
      form: {
        dataType: '',
        remark: ''
      }
    }
  },
  methods: {
    open(row, type = 'add') {
      this.mode = type
      this.title = type === 'add' ? '新增' : type === 'view' ? '查看详情' : '编辑'
      if (row) {
        this.form = { ...row }
      } else {
        this.form = { dataType: '', remark: '' }
      }
      this.visible = true
    },
    handleClose() {
      this.visible = false
      this.$refs.form && this.$refs.form.resetFields()
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$message.success('保存成功')
          this.visible = false
          this.$emit('query')
        }
      })
    }
  }
}
</script>

<style scoped>
.drawer-content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.drawer-footer {
  margin-top: auto;
  text-align: right;
  padding-top: 20px;
}
</style>
