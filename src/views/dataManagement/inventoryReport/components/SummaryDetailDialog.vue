<template>
  <el-dialog
    title="汇总详情"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="900px"
    :before-close="handleClose">
    <div class="detail-content">
      <el-table :data="detailData" border size="small" max-height="400">
        <el-table-column prop="warehouseName" label="库房" min-width="120" show-overflow-tooltip />
        <el-table-column prop="containerCode" label="容器号" min-width="120" show-overflow-tooltip />
        <el-table-column prop="goodsCode" label="材料代码" min-width="120" show-overflow-tooltip />
        <el-table-column prop="taskNum" label="批号" min-width="120" show-overflow-tooltip />
        <el-table-column prop="productionUnit" label="生产单位" min-width="120" show-overflow-tooltip />
        <el-table-column prop="inboundTime" label="入库时间" min-width="140" show-overflow-tooltip />
        <el-table-column prop="location" label="位置" min-width="120" show-overflow-tooltip />
        <el-table-column prop="sealCode1" label="封记编码1" min-width="120" show-overflow-tooltip />
        <el-table-column prop="grossWeight" label="毛重" min-width="100" />
        <el-table-column prop="tareWeight" label="皮重" min-width="100" />
        <el-table-column prop="netWeight" label="净重" min-width="100" />
      </el-table>
    </div>
    <span slot="footer">
      <el-button size="small" @click="handleClose">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getStockSummaryDetail } from './api.js'

export default {
  data() {
    return {
      visible: false,
      detailData: [],
      goodsCode: '',
    }
  },
  methods: {
    open(goodsCode) {
      this.goodsCode = goodsCode
      this.visible = true
      this.loadData()
    },
    loadData() {
      getStockSummaryDetail(this.goodsCode, { currentPage: 1, pageSize: 999 }).then(res => {
        if (res.code === 1) {
          this.detailData = res.data?.list || []
        }
      })
    },
    handleClose() {
      this.visible = false
      this.detailData = []
    },
  },
}
</script>

<style scoped>
.detail-content {
  padding: 10px;
}
</style>
