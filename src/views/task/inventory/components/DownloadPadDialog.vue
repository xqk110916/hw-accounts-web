<template>
  <el-dialog
    title="下载PAD盘存数据"
    :visible.sync="visible"
    width="420px"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="90px" size="small">
      <el-form-item label="选择库房" prop="warehouseIds">
        <el-select
          v-model="form.warehouseIds"
          multiple
          filterable
          placeholder="请选择需要下载的库房"
          style="width: 100%"
        >
          <el-option
            v-for="item in warehouseOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="visible = false">取 消</el-button>
      <el-button type="primary" size="small" @click="submit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'DownloadPadDialog',
  data() {
    return {
      visible: false,
      warehouseOptions: [],
      form: {
        warehouseIds: [],
      },
      rules: {
        warehouseIds: [
          {
            type: 'array',
            required: true,
            message: '请至少选择一个库房',
            trigger: 'change',
          },
        ],
      },
    }
  },
  methods: {
    // warehouseList: 本任务详情返回的库房集合 [{ warehouseId, warehouseName }]
    open(warehouseList = []) {
      this.warehouseOptions = (warehouseList || []).map(w => ({
        value: String(w.warehouseId),
        label: w.warehouseName || `库房 ${w.warehouseId}`,
      }))
      this.form.warehouseIds = []
      this.visible = true
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.$emit('confirm', [...this.form.warehouseIds])
        this.visible = false
      })
    },
    handleClose() {
      this.$refs.form && this.$refs.form.resetFields()
    },
  },
}
</script>

<style scoped>
.dialog-footer {
  text-align: center;
}
</style>
