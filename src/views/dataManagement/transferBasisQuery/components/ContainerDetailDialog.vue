<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="1300px"
    custom-class="container-detail-dialog"
    :before-close="handleClose">
    <div class="dialog-content">
      <!-- 行上下文信息 -->
      <div class="context-bar">
        <span class="ctx-item"><span class="ctx-label">调拨依据：</span>{{ row.transferBasis || '-' }}</span>
        <span class="ctx-item"><span class="ctx-label">年份：</span>{{ row.year || '-' }}</span>
        <span class="ctx-item"><span class="ctx-label">材料：</span>{{ row.goodName || '-' }}</span>
        <span class="ctx-item"><span class="ctx-label">统计口径：</span>{{ fieldLabel }}</span>
      </div>

      <!-- 容器明细列表 -->
      <div class="table">
        <el-table
          v-loading="loading"
          :data="tableData"
          border
          highlight-current-row
          :max-height="tableHeight"
          style="width: 100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="containerCode" label="容器号" min-width="120" show-overflow-tooltip />
          <el-table-column prop="position" label="位置" min-width="140" show-overflow-tooltip />
          <el-table-column prop="warehouseName" label="库房" min-width="120" show-overflow-tooltip />
          <el-table-column prop="inboundTaskNum" label="入库任务号" min-width="140" show-overflow-tooltip />
          <el-table-column prop="outboundTaskNum" label="出库任务号" min-width="140" show-overflow-tooltip />
          <el-table-column prop="goodName" label="材料名称" min-width="120" show-overflow-tooltip />
          <el-table-column prop="sealCode1" label="封记编码1" min-width="120" show-overflow-tooltip />
          <el-table-column label="封记类型1" min-width="120" show-overflow-tooltip>
            <template slot-scope="scope">{{ getSealTypeLabel(scope.row.sealType1) }}</template>
          </el-table-column>
          <el-table-column prop="sealCode2" label="封记编码2" min-width="120" show-overflow-tooltip />
          <el-table-column label="封记类型2" min-width="120" show-overflow-tooltip>
            <template slot-scope="scope">{{ getSealTypeLabel(scope.row.sealType2) }}</template>
          </el-table-column>
          <el-table-column prop="productionUnit" label="生产单位" min-width="130" show-overflow-tooltip />
          <el-table-column prop="grossWeight" label="毛重" min-width="100" show-overflow-tooltip />
          <el-table-column prop="tareWeight" label="皮重" min-width="100" show-overflow-tooltip />
          <el-table-column prop="netWeight" label="净重" min-width="100" show-overflow-tooltip />
        </el-table>
        <div class="pagination">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="page.currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="page.pageSize"
            background
            layout="total, sizes, prev, pager, next"
            :total="page.total" />
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" class="close-btn" @click="handleClose">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { listTransferBasisContainer } from './api.js'
import { formatSealType, getSealTypeOptions } from '@/utils/sealType.js'

export default {
  name: 'ContainerDetailDialog',
  data() {
    return {
      visible: false,
      loading: false,
      field: 'quantity', // 点击来源：quantity 数量 / weight 重量
      row: {},
      goodCodeNameMap: {}, // goodCode -> goodName 映射，由列表页透传
      sealTypeOptions: [], // 封记类型字典项
      tableData: [],
      tableHeight: 420,
      page: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
    }
  },
  computed: {
    title() {
      return this.field === 'weight' ? '容器明细 - 按重量' : '容器明细 - 按数量'
    },
    fieldLabel() {
      if (this.field === 'weight') return `重量 ${this.row.weight ?? '-'}`
      return `数量 ${this.row.quantity ?? '-'}`
    },
  },
  created() {
    this.loadSealTypeOptions()
  },
  methods: {
    // 加载封记类型字典项
    loadSealTypeOptions() {
      getSealTypeOptions()
        .then(options => { this.sealTypeOptions = options })
        .catch(() => { this.sealTypeOptions = [] })
    },
    // 封记类型字典值 -> 名称
    getSealTypeLabel(value) {
      return formatSealType(this.sealTypeOptions, value)
    },
    // field: 'quantity' | 'weight'；goodCodeNameMap 由列表页透传，用于 goodCode -> goodName 展示
    open(row, field = 'quantity', goodCodeNameMap = {}) {
      this.row = { ...row }
      this.field = field
      this.goodCodeNameMap = goodCodeNameMap || {}
      this.page.currentPage = 1
      this.visible = true
      this.getList()
    },
    getList() {
      this.loading = true
      // 后端容器明细仅按调拨依据 transferId 查询
      const params = {
        currentPage: this.page.currentPage,
        pageSize: this.page.pageSize,
        transferId: this.row.transferId,
      }
      listTransferBasisContainer(params)
        .then(res => {
          if (res.code === 1) {
            const list = (res.data && res.data.list) || []
            // 后端仅返回 goodCode，补充 goodName 供「材料名称」列展示
            this.tableData = list.map(item => ({
              ...item,
              goodName: this.goodCodeNameMap[item.goodCode] || item.goodCode,
            }))
            this.page.total = (res.data && res.data.pagination && res.data.pagination.total) || this.tableData.length
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSizeChange(val) {
      this.page.pageSize = val
      this.page.currentPage = 1
      this.getList()
    },
    handleCurrentChange(val) {
      this.page.currentPage = val
      this.getList()
    },
    handleClose() {
      this.visible = false
      this.row = {}
      this.tableData = []
    },
  },
}
</script>

<style lang="scss" scoped>
.dialog-content {
  padding: 0 4px;
}

.context-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  padding: 10px 14px;
  background: #f8f9fc;
  border: 1px solid #edf1f7;
  border-radius: 6px;
  margin-bottom: 14px;

  .ctx-item {
    font-size: 13px;
    color: #2e353f;
  }
  .ctx-label {
    color: #8a929f;
    margin-right: 2px;
  }
}

.table {
  .pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    color: #626c78;

    ::v-deep .el-pager .number {
      background: #fff;
      border: 1px solid #c4c9cf;
      border-radius: 4px;
      font-size: 14px;
    }
    ::v-deep .el-pager .active {
      background: #cce6ff;
      color: #246fe5;
      border: 1px solid #246fe5;
    }
  }

  ::v-deep .el-table th.el-table__cell {
    background: #f1f4f6;
    color: #626c78;
  }
  ::v-deep .el-table td.el-table__cell {
    color: #1b2129;
  }
}

::v-deep .container-detail-dialog {
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);

  .el-dialog__header {
    padding: 18px 24px 14px;
    border-bottom: 1px solid #f1f4f9;

    .el-dialog__title {
      font-size: 15px;
      font-weight: 600;
      color: #1b2129;
    }
  }
  .el-dialog__body {
    padding: 18px 24px 6px;
  }
  .el-dialog__footer {
    padding: 12px 24px 18px;
    border-top: 1px solid #f1f4f9;
  }
}

.close-btn {
  padding: 7px 18px;
  border-color: #dcdfe6;
  color: #606266;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: #246fe5;
    border-color: #cce6ff;
    background-color: #f5f9ff;
  }
}
</style>
