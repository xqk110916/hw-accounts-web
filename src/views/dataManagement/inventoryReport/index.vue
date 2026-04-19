<template>
  <div class="wrapper">
    <div class="content">
      <div class="right">
        <!-- 红色大字看板 -->
        <div class="kanban">
          <span>当前总数量：<span class="red-text">{{ extra.totalStock }}</span></span>
          <span style="margin-left: 30px;">总重：<span class="red-text">{{ extra.totalWeight }}</span></span>
        </div>
        
        <search-filter class="search" :options="search.options" :form="search.params">
          <div slot="footer" class="footer">
            <div :class="['btn', 'text']" @click="getTableList">查询</div>
            <div class="partition"></div>
            <div :class="['btn', 'text']" @click="resetSearchParams">重置</div>
          </div>
        </search-filter>
        <div class="operation-bar" v-if="btns.operation && btns.operation.length">
          <div
            v-for="item in btns.operation"
            :key="item.label"
            :class="['btn', item.type === 'primary' ? 'primary' : 'default-btn']"
            @click="handleBtnClick(item)"
          >
            {{ item.label }}
          </div>
        </div>
        <div class="table">
          <el-table ref="table" :data="tableData" highlight-current-row :height="height" style="width: 100%">
            <el-table-column
              v-for="item in tableKeys"
              :prop="item.prop"
              :label="item.label"
              :key="item.prop"
              show-overflow-tooltip
              :width="item.width"
            >
              <template slot-scope="scope">
                <div v-if="item.type === 'slot'">
                  <span v-if="item.prop === 'stock' || item.prop === 'totalWeight'" class="red-text">
                    {{ scope.row[item.prop] }}
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
import { config, requestFun, btns, handleTbaleMap, getDefaultOptions } from './components/index.js'

export default {
  name: 'InventoryReport',
  data() {
    return {
      search: {
        params: {
          currentPage: 1,
          pageSize: 20,
          totoal: 0,
        },
        options: [],
      },
      tableData: [],
      extra: {
        totalStock: '0',
        totalWeight: '0'
      },
      height: 0,
      tableKeys: [],
      btns
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
    computedTableHeight() {
      let rightDom = document.querySelector('.right')
      let rightDomHeight = rightDom ? rightDom.clientHeight : 0
      let kanbanDom = document.querySelector('.kanban')
      let kanbanDomHeight = kanbanDom ? kanbanDom.clientHeight : 0
      let searchDom = document.querySelector('.search')
      let searchDomHeight = searchDom ? searchDom.clientHeight : 0
      let operationDom = document.querySelector('.operation-bar')
      let operationDomHeight = operationDom ? operationDom.clientHeight : 0

      this.height = rightDomHeight - kanbanDomHeight - searchDomHeight - operationDomHeight - 90
    },
    async handleData() {
      this.tableKeys = config.table
      config.search.forEach(item => {
        this.search.options.push(item)
        this.$set(this.search.params, item.prop, '')
        if (item.option && Object.prototype.toString.call(item.option) !== '[object Array]') {
          item.option.then(res => {
            item.option = Array.isArray(res.data) ? res.data : res.data.list
          })
        }
      })
      this.search.options.push({ type: 'slot', slotName: 'footer', col: 6 })
    },
    handleBtnClick(item, payload) {
      if (item.execute === 'export') {
        this.$message.success('已加入导出队列')
      }
    },
    getTableList() {
      this.tableData = []
      return requestFun.list(this.search.params).then(res => {
        if (res.code === 1) {
          let data = res.data.list || []
          let page = res.data.pagination || {}
          this.extra = res.data.extra || { totalStock: '0', totalWeight: '0' }
          if (handleTbaleMap) data = handleTbaleMap(data)
          this.tableData = data
          this.search.params.totoal = page.total
          return data
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
      config.search.forEach(item => {
        this.search.params[item.prop] = ''
      })
      this.getTableList()
    }
  },
}
</script>

<style lang="scss" scoped>
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

      .kanban {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 16px;
        .red-text {
          color: #d32f2f;
        }
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
        .red-text {
          color: #d32f2f;
          font-weight: 500;
        }
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
    }
  }

  .btn {
    display: inline-block;
    font-size: 14px;
    line-height: 22px;
    cursor: pointer;

    &.text {
      color: #246fe5;
    }
    &.primary {
      padding: 5px 16px;
      border-radius: 3px;
      background: #246fe5;
      color: #fff;
    }
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
