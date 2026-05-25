<template>
  <div class="detail-table-wrapper">
    <el-table
      :data="tableData"
      border
      size="small"
      :height="height"
      style="width: 100%">
      <el-table-column
        v-for="item in columns"
        :prop="item.prop"
        :label="item.label"
        :key="item.prop"
        show-overflow-tooltip
        :min-width="item.minWidth"
      />
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
        :total="page.total"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    columns: { type: Array, default: () => [] },
    height: { type: [Number, String], default: 200 },
  },
  data() {
    return {
      tableData: [],
      page: { currentPage: 1, pageSize: 20, total: 0 },
    }
  },
  methods: {
    loadData(apiFn, params) {
      const query = { ...params, currentPage: this.page.currentPage, pageSize: this.page.pageSize }
      return apiFn(query).then(res => {
        if (res.code === 1) {
          this.tableData = res.data?.list || []
          this.page.total = res.data?.pagination?.total || 0
        }
      })
    },
    resetPage() {
      this.page.currentPage = 1
      this.page.total = 0
      this.tableData = []
    },
    handleSizeChange(val) {
      this.page.pageSize = val
      this.$emit('page-change')
    },
    handleCurrentChange(val) {
      this.page.currentPage = val
      this.$emit('page-change')
    },
  },
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  color: #626c78;
}
::v-deep .el-pager .number {
  background: #fff;
  border: 1px solid #c4c9cf;
  border-radius: 4px;
}
::v-deep .el-pager .active {
  background: #cce6ff;
  color: #246fe5;
  border: 1px solid #246fe5;
}
</style>
