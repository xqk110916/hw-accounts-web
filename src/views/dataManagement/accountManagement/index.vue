<template>
  <div class="wrapper">
    <div class="content">
      <div class="right">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="总账" name="main"></el-tab-pane>
          <el-tab-pane label="固定资产明细账" name="sub1"></el-tab-pane>
          <el-tab-pane label="低值易耗品明细" name="sub2"></el-tab-pane>
          <el-tab-pane label="备品备件库明细" name="sub3"></el-tab-pane>
        </el-tabs>
        
        <search-filter class="search" :options="search.options" :form="search.params">
          <div slot="footer" class="footer">
            <div :class="['btn', 'text']" @click="getTableList">查询</div>
            <div class="partition"></div>
            <div :class="['btn', 'text']" @click="resetSearchParams">重置</div>
          </div>
        </search-filter>

        <div class="table-container">
          <h2 class="account-title">《{{ accountTitle }}》</h2>
          <div class="operation-bar">
            <div class="btn default-btn" @click="$message.success('已加入打印队列')">打印账本</div>
            <div class="btn default-btn" @click="$message.success('已导出')">导出</div>
          </div>
          
          <el-table ref="table" border :data="tableData" highlight-current-row :height="height" style="width: 100%">
            <el-table-column
              v-for="item in tableKeys"
              :prop="item.prop"
              :label="item.label"
              :key="item.prop"
              show-overflow-tooltip
              align="center"
            >
            </el-table-column>
          </el-table>
          <div class="pagination">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="search.params.currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="search.params.pageSize"
              background
              layout="total, sizes, prev, pager, next"
              :total="search.params.totoal"
            >
            </el-pagination>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 与前类似结构
import { config, requestFun, getDefaultOptions } from './components/index.js'

export default {
  name: 'AccountManagement',
  data() {
    return {
      activeTab: 'main',
      accountTitle: '2026年总账',
      search: {
        params: { currentPage: 1, pageSize: 20, totoal: 0 },
        options: [],
      },
      tableData: [],
      height: 0,
      tableKeys: [],
    }
  },
  async created() {
    await getDefaultOptions()
    this.handleData()
    this.getTableList()
  },
  mounted() {
    setTimeout(() => { this.computedTableHeight() }, 0)
    window.addEventListener('resize', this.computedTableHeight)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.computedTableHeight)
  },
  methods: {
    handleTabClick() { this.getTableList() },
    computedTableHeight() {
      let rightDom = document.querySelector('.right')
      let rightDomHeight = rightDom ? rightDom.clientHeight : 0
      let tabsDom = document.querySelector('.el-tabs')
      let tabsDomHeight = tabsDom ? tabsDom.clientHeight : 0
      let searchDom = document.querySelector('.search')
      let searchDomHeight = searchDom ? searchDom.clientHeight : 0
      let titleDom = document.querySelector('.account-title')
      let titleDomHeight = titleDom ? titleDom.clientHeight : 0
      let opDom = document.querySelector('.operation-bar')
      let opDomHeight = opDom ? opDom.clientHeight : 0

      this.height = rightDomHeight - tabsDomHeight - searchDomHeight - titleDomHeight - opDomHeight - 110
    },
    async handleData() {
      this.tableKeys = config.table
      config.search.forEach(item => {
        this.search.options.push(item)
        this.$set(this.search.params, item.prop, '')
      })
      this.search.options.push({ type: 'slot', slotName: 'footer', col: 6 })
    },
    getTableList() {
      let p = { ...this.search.params, tab: this.activeTab }
      return requestFun.list(p).then(res => {
        if (res.code === 1) {
          this.tableData = res.data.list || []
          this.accountTitle = res.data.title || '年总账'
          this.search.params.totoal = res.data.pagination.total
        }
      })
    },
    handleSizeChange(value) { this.search.params.pageSize = value; this.getTableList() },
    handleCurrentChange(value) { this.search.params.currentPage = value; this.getTableList() },
    resetSearchParams() {
      this.search.params.currentPage = 1
      config.search.forEach(item => { this.search.params[item.prop] = '' })
      this.getTableList()
    }
  },
}
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%; height: 100%; box-sizing: border-box; padding: 16px;
  .content {
    width: 100%; height: 100%; display: flex; background: #fff;
    .right {
      flex: 1; height: 100%; box-sizing: border-box; padding: 16px; display: flex; flex-direction: column; overflow: hidden;
      
      .el-tabs { margin-bottom: 0px; }
      .search {
        .footer {
          height: 34px; display: flex; align-items: center; margin-left: 5px;
          .partition { width: 1px; height: 14px; background: #e1e5eb; margin: 0 12px; }
        }
      }
      .table-container {
        flex: 1; display: flex; flex-direction: column; overflow: hidden;
        margin-top: 10px; border: 1px solid #ebeef5; padding: 16px; border-radius: 4px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);

        .account-title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 10px; color: #303133; }
        .operation-bar { text-align: right; margin-bottom: 10px; }
        .pagination { display: flex; justify-content: flex-end; margin-top: 10px; }
      }
    }
  }
  .btn {
    display: inline-block; font-size: 14px; line-height: 22px; cursor: pointer;
    &.text { color: #246fe5; }
    &.default-btn { padding: 5px 16px; border-radius: 3px; background: #fff; border: 1px solid #c4c9cf; color: #333; margin-left: 10px; }
  }
}
</style>
