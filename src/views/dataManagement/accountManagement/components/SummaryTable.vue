<template>
  <el-table
    :data="flatData"
    border
    size="small"
    :height="height"
    :row-class-name="rowClassName"
    :cell-style="cellStyle"
    :span-method="mergeMethod"
    style="width: 100%">
    <el-table-column prop="date" label="日期" min-width="100" show-overflow-tooltip>
      <template slot="header"><span>日期</span></template>
      <template slot-scope="{ row }">
        <span v-if="row.isTotal" style="font-weight: bold;">汇总</span>
        <span v-else>{{ row.date }}</span>
      </template>
    </el-table-column>
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
const GROUP_COLORS = [
  'rgba(230, 240, 255, 0.6)',   // 浅蓝
  'rgba(255, 243, 224, 0.6)',   // 浅橙
  'rgba(232, 245, 233, 0.6)',   // 浅绿
  'rgba(243, 229, 245, 0.6)',   // 浅紫
  'rgba(224, 247, 250, 0.6)',   // 浅青
  'rgba(255, 235, 238, 0.6)',   // 浅红
  'rgba(248, 244, 224, 0.6)',   // 浅黄绿
  'rgba(232, 240, 254, 0.6)',   // 浅靛蓝
]

export default {
  props: {
    data: { type: Array, default: () => [] },
    height: { type: [Number, String], default: 200 },
  },
  computed: {
    flatData() {
      const result = []
      ;(this.data || []).forEach((group, groupIndex) => {
        ;(group.dataList || []).forEach(row => {
          result.push({ ...row, _groupIndex: groupIndex })
        })
      })
      return result
    },
  },
  methods: {
    rowClassName({ row }) {
      if (row.isTotal) return 'total-row'
      return ''
    },
    cellStyle({ row }) {
      if (row.isTotal) {
        return { background: '#fff8e1', fontWeight: 'bold', textAlign: 'center' }
      }
      if (row._groupIndex != null) {
        const idx = row._groupIndex % GROUP_COLORS.length
        return { background: GROUP_COLORS[idx] }
      }
      return {}
    },
    mergeMethod({ row, columnIndex }) {
      if (row.isTotal && columnIndex <= 2) {
        return columnIndex === 0
          ? { rowspan: 1, colspan: 3 }
          : { rowspan: 0, colspan: 0 }
      }
    },
  },
}
</script>

<style scoped>
</style>
