<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="500px"
    :before-close="handleClose">
    <div class="dialog-content">
      <el-form ref="form" :model="form" label-width="100px" size="small">
        <el-form-item label="容器号" prop="containerId">
          <el-input v-model="form.containerId" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="材料名称" prop="materialName">
          <el-input v-model="form.materialName" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="入库信息" prop="inInfo">
          <el-input type="textarea" :rows="3" v-model="form.inInfo" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="出库信息" prop="outInfo">
          <el-input type="textarea" :rows="3" v-model="form.outInfo" :disabled="true"></el-input>
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button size="small" @click="handleClose">关 闭</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      title: '详情',
      form: {
        containerId: '',
        materialName: '',
        inInfo: '',
        outInfo: ''
      }
    }
  },
  methods: {
    open(row) {
      this.title = '查看详情'
      if (row) {
        this.form = { ...row }
      }
      this.visible = true
    },
    handleClose() {
      this.visible = false
      this.$refs.form && this.$refs.form.resetFields()
    }
  }
}
</script>

<style scoped>
.dialog-content {
  padding: 20px;
}
.dialog-footer {
  text-align: right;
  padding-top: 20px;
}
</style>
