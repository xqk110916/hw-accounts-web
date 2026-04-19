<template>
  <div class="wrapper">
    <div class="content">
      <div class="right">
        <el-tabs v-model="activeView" @tab-click="handleTabClick">
          <el-tab-pane label="明细视图" name="detail"></el-tab-pane>
          <el-tab-pane label="汇总视图" name="summary"></el-tab-pane>
        </el-tabs>
        
        <search-filter class="search" :options="search.options" :form="search.params">
          <div slot="footer" class="footer">
            <div :class="['btn', 'text']" @click="getTableList">查询</div>
            <div class="partition"></div>
            <div :class="['btn', 'text']" @click="resetSearchParams">重置</div>
          </div>
        </search-filter>
        
        <div class="operation-bar">
          <div class="btn default-btn" @click="$message.success('已加入导出队列')">导出</div>
        </div>

        <div class="table">
          <el-table ref="table" :data="tableData" highlight-current-row :height="height" style="width: 100%">
            <el-table-column
              v-for="item in tableKeys"
              :prop="item.prop"
              :label="item.label"
              :key="item.prop"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <div v-if="item.type === 'slot'">
                  <span v-if="item.prop === 'type'">
                    <el-tag :type="scope.row.type === 'in' ? 'success' : 'danger'" size="small">
                      {{ scope.row.type === 'in' ? '入库' : '出库' }}
                    </el-tag>
                  </span>
                  <span v-else-if="item.prop === 'changeAmount'" :style="{ color: scope.row.type === 'in' ? '#2e7d32' : '#d32f2f', fontWeight: 'bold' }">
                    {{ scope.row.changeAmount }}
                  </span>
                </div>
                <div v-else>{{ scope.row[item.prop] }}</div>
              </template>
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
import { configDetail, requestFun, getDefaultOptions } from './components/index.js'

export default {
  name: 'ChangeReport',
  data() {
    return {
      activeView: 'detail',
      search: {
        params: {
          currentPage: 1,
          pageSize: 20,
          totoal: 0,
        },
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
    setTimeout(() => {
      this.computedTableHeight()
    }, 0)
    window.addEventListener('resize', this.computedTableHeight)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.computedTableHeight)
  },
  methods: {
    handleTabClick() {
      this.getTableList()
    },
    computedTableHeight() {
      let rightDom = document.querySelector('.right')
      let rightDomHeight = rightDom ? rightDom.clientHeight : 0
      let tabsDom = document.querySelector('.el-tabs')
      let tabsDomHeight = tabsDom ? tabsDom.clientHeight : 0
      let searchDom = document.querySelector('.search')
      let searchDomHeight = searchDom ? searchDom.clientHeight : 0
      let operationDom = document.querySelector('.operation-bar')
      let operationDomHeight = operationDom ? operationDom.clientHeight : 0

      this.height = rightDomHeight - tabsDomHeight - searchDomHeight - operationDomHeight - 90
    },
    async handleData() {
      this.tableKeys = configDetail.table
      configDetail.search.forEach(item => {
        this.search.options.push(item)
        this.$set(this.search.params, item.prop, '')
      })
      this.search.options.push({ type: 'slot', slotName: 'footer', col: 6 })
    },
    getTableList() {
      this.tableData = []
      // Mock logic: pass view type
      let p = { ...this.search.params, view: this.activeView }
      return requestFun.list(p).then(res => {
        if (res.code === 1) {
          this.tableData = res.data.list || []
          this.search.params.totoal = res.data.pagination.total
        }
      })
    },
    handleSizeChange(value) {
      this.search.params.pageSize = value
      this.getTableList()
    },
    handleCurrentChange(value) {
      this.search.params.currentPage = value
      this.getTableList()
    },
    resetSearchParams() {
      this.search.params.currentPage = 1
      configDetail.search.forEach(item => {
        this.search.params[item.prop] = ''
      })
      this.getTableList()
    }
  },
}
</script>

<style lang="scss" scoped>
// 省略标准 wrapper/content/table 相关样式，使用常规代码即可
.wrapper {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 16px;
  .content {
    width: 100%;
    height: 100%;
    display: flex;
    background: #fff;
    .right {
      flex: 1;
      height: 100%;
      box-sizing: border-box;
      padding: 16px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      
      .el-tabs {
        margin-bottom: 0px;
      }
      .search {
        .footer {
          height: 34px;
          display: flex;
          align-items: center;
          margin-left: 5px;
          .partition {
            width: 1px;
            height: 14px;
            background: #e1e5eb;
            margin: 0 12px;
          }
        }
      }
      .operation-bar {
        height: 32px;
        margin-top: 4px;
        margin-bottom: 6px;
        text-align: right;
      }
      .table {
        margin-top: 10px;
        flex: 1;
        .pagination {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
          color: #626c78;
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
        }
        ::v-deep .el-table th.el-table__cell {
          background: #f1f4f6;
          color: #626c78;
        }
      }
    }
  }

  .btn {
    display: inline-block;
    font-size: 14px;
    line-height: 22px;
    cursor: pointer;
    &.text { color: #246fe5; }
    &.default-btn {
      padding: 5px 16px;
      border-radius: 3px;
      background: #fff;
      border: 1px solid #c4c9cf;
      color: #333;
    }
  }
}
</style>
