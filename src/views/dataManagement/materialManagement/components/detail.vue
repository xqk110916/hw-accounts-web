<template>
  <el-drawer
    :title="title"
    :visible.sync="visible"
    direction="rtl"
    size="500px"
    :before-close="handleClose">
    <div class="drawer-content">
      <el-form ref="form" :model="form" label-width="100px" size="small">
        <el-form-item label="材料代码" prop="materialCode"><el-input v-model="form.materialCode"></el-input></el-form-item>
        <el-form-item label="材料名称" prop="materialName"><el-input v-model="form.materialName"></el-input></el-form-item>
        <el-form-item label="单位" prop="unit"><el-input v-model="form.unit"></el-input></el-form-item>
        <el-form-item label="单价" prop="price"><el-input-number v-model="form.price" controls-position="right"></el-input-number></el-form-item>
      </el-form>
      <div class="drawer-footer">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button size="small" type="primary" @click="submit">确定</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
export default {
  data() {
    return {
      visible: false, title: '新增',
      form: { materialCode: '', materialName: '', unit: '', price: 0 }
    }
  },
  methods: {
    open(row) {
      if (row) { this.title = '编辑材料'; this.form = { ...row } } else { this.title = '新增材料'; this.form = { materialCode: '', materialName: '', unit: '', price: 0 } }
      this.visible = true
    },
    handleClose() { this.visible = false; },
    submit() { this.$message.success('保存成功'); this.visible = false; this.$emit('query') }
  }
}
</script>

<style scoped>
.drawer-content { padding: 20px; height: 100%; display: flex; flex-direction: column; }
.drawer-footer { margin-top: auto; text-align: right; padding-top: 20px; }
</style>
