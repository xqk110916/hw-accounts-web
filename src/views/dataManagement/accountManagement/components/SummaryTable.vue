<template>
  <el-table
    :data="flatData"
    border
    size="small"
    :height="height"
    :row-class-name="rowClassName"
    style="width: 100%">
    <el-table-column prop="date" label="日期" min-width="100" show-overflow-tooltip />
    <el-table-column prop="typeName" label="类型" min-width="70" />
    <el-table-column prop="warehouseName" label="库房" min-width="100" show-overflow-tooltip />
    <el-table-column prop="transferBasis" label="调拨依据" min-width="120" show-overflow-tooltip />
    <el-table-column prop="goodsCode" label="材料代码" min-width="100" show-overflow-tooltip />
    <el-table-column label="调入">
      <el-table-column prop="inboundUnit" label="调入单位" min-width="100" show-overflow-tooltip />
      <el-table-column prop="inboundCount" label="件数" min-width="70" />
      <el-table-column prop="inboundWeight" label="材料量" min-width="90" />
    </el-table-column>
    <el-table-column label="调出">
      <el-table-column prop="outboundUnit" label="调出单位" min-width="100" show-overflow-tooltip />
      <el-table-column prop="outboundCount" label="件数" min-width="70" />
      <el-table-column prop="outboundWeight" label="材料量" min-width="90" />
    </el-table-column>
    <el-table-column label="结存">
      <el-table-column prop="balanceCount" label="件数" min-width="70" />
      <el-table-column prop="balanceWeight" label="材料量" min-width="90" />
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  props: {
    data: { type: Array, default: () => [] },
    height: { type: [Number, String], default: 200 },
  },
  computed: {
    flatData() {
      const result = []
      ;(this.data || []).forEach(group => {
        const groupHeader = {
          _isGroupHeader: true,
          _goodsCode: group.goodsCode,
          goodsCode: group.goodsCode,
          date: '',
          typeName: '',
          warehouseName: '',
          transferBasis: '',
        }
        result.push(groupHeader)
        ;(group.dataList || []).forEach(row => {
          result.push({ ...row, _goodsCode: group.goodsCode })
        })
      })
      return result
    },
  },
  methods: {
    rowClassName({ row }) {
      if (row._isGroupHeader) return 'group-header-row'
      if (row.isTotal) return 'total-row'
      return ''
    },
  },
}
</script>

<style scoped>
::v-deep .el-table .group-header-row td {
  background: #e6f0ff !important;
  font-weight: bold;
  color: #246fe5;
}
::v-deep .el-table .total-row td {
  background: #fff8e1 !important;
  font-weight: bold;
}
</style>
