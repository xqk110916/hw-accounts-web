<template>
  <el-dialog
    title="查看详情"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="700px"
    :before-close="handleClose">
    <div class="dialog-content">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="容器号">{{ form.containerCode }}</el-descriptions-item>
        <el-descriptions-item label="材料名称">{{ form.goodName }}</el-descriptions-item>
        <el-descriptions-item label="库房">{{ form.warehouseName }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ form.location }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ form.statusName }}</el-descriptions-item>
        <el-descriptions-item label="调拨依据">{{ form.transferBasis }}</el-descriptions-item>
        <el-descriptions-item label="入库信息" :span="2">
          <div style="white-space: pre-wrap; line-height: 1.5;">{{ form.inboundInfo }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="出库信息" :span="2">
          <div style="white-space: pre-wrap; line-height: 1.5;">{{ form.outboundInfo }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="封记类型1">{{ form.sealType1 }}</el-descriptions-item>
        <el-descriptions-item label="封记编码1">{{ form.sealCode1 }}</el-descriptions-item>
        <el-descriptions-item label="封记类型2">{{ form.sealType2 }}</el-descriptions-item>
        <el-descriptions-item label="封记编码2">{{ form.sealCode2 }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <span slot="footer">
      <el-button size="small" @click="handleClose">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      form: {},
    }
  },
  methods: {
    open(row) {
      this.form = { ...row }
      this.visible = true
    },
    handleClose() {
      this.visible = false
      this.form = {}
    },
  },
}
</script>

<style scoped>
.dialog-content {
  padding: 10px 20px;
}
</style>
