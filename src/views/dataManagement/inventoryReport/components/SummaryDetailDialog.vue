<template>
  <el-dialog
    title="汇总详情"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="900px"
    :before-close="handleClose">
    <div class="detail-content">
      <el-table :data="pageData" border size="small" max-height="400">
        <el-table-column type="index" label="序号" width="60" align="center" show-overflow-tooltip />
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
      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          background
          layout="total, sizes, prev, pager, next"
          :total="detailData.length"
        >
        </el-pagination>
      </div>
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
      taskNum: '',
      currentPage: 1,
      pageSize: 10,
    }
  },
  computed: {
    pageData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = this.currentPage * this.pageSize
      return this.detailData.slice(start, end)
    }
  },
  methods: {
    open(goodsCode, taskNum) {
      this.goodsCode = goodsCode
      this.taskNum = taskNum || ''
      this.visible = true
      this.currentPage = 1
      this.loadData()
    },
    loadData() {
      getStockSummaryDetail(this.goodsCode, { currentPage: 1, pageSize: 999, taskNum: this.taskNum }).then(res => {
        if (res.code === 1) {
          this.detailData = (res.data && res.data.list) || []
        }
      })
    },
    handleClose() {
      this.visible = false
      this.detailData = []
      this.taskNum = ''
      this.currentPage = 1
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
  },
}
</script>

<style scoped>
.detail-content {
  padding: 10px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
  color: #626c78;
}
.pagination ::v-deep .el-pager .number {
  background: #fff;
  border: 1px solid #c4c9cf;
  border-radius: 4px;
  font-size: 14px;
}
.pagination ::v-deep .el-pager .active {
  background: #cce6ff;
  color: #246fe5;
  border: 1px solid #246fe5;
}
</style>
