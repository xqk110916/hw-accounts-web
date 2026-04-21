<template>
  <div class="wrapper">
    <div class="content">
      <div class="right">
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
            >
              <template slot-scope="scope">
                <div v-if="item.type === 'slot'">
                  <span v-if="item.prop === 'type'">{{ scope.row.type === 'label' ? '标签' : '其它' }}</span>
                </div>
                <div v-else>{{ scope.row[item.prop] }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template slot-scope="scope">
                <div class="table_operation">
                  <div
                    v-for="item in btns.table"
                    :key="item.label"
                    :class="['btn', 'text', item.execute === 'editTemplate' ? 'highlight' : '']"
                    @click="e => handleBtnClick(item, scope.row)"
                  >
                    {{ item.label }}
                  </div>
                </div>
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
import { config, requestFun, btns, getDefaultOptions } from './components/index.js'

export default {
  name: 'LabelTemplate',
  data() {
    return {
      search: { params: { currentPage: 1, pageSize: 20, totoal: 0 }, options: [] },
      tableData: [], height: 0, tableKeys: [], btns
    }
  },
  async created() { await getDefaultOptions(); this.handleData(); this.getTableList() },
  mounted() { setTimeout(() => { this.computedTableHeight() }, 0); window.addEventListener('resize', this.computedTableHeight) },
  beforeDestroy() { window.removeEventListener('resize', this.computedTableHeight) },
  methods: {
    computedTableHeight() {
      let rightDom = document.querySelector('.right'); let rH = rightDom ? rightDom.clientHeight : 0
      let sDom = document.querySelector('.search'); let sH = sDom ? sDom.clientHeight : 0
      let oDom = document.querySelector('.operation-bar'); let oH = oDom ? oDom.clientHeight : 0
      this.height = rH - sH - oH - 90
    },
    async handleData() {
      this.tableKeys = config.table
      config.search.forEach(item => { this.search.options.push(item); this.$set(this.search.params, item.prop, '') })
      this.search.options.push({ type: 'slot', slotName: 'footer', col: 6 })
    },
    handleBtnClick(item, payload) {
      if (item.execute === 'add') this.$message.info('打开新增弹窗')
      if (item.execute === 'rename') this.$prompt('请输入新的模板名称', '重命名').then(({value}) => this.$message.success('已修改为：' + value))
      if (item.execute === 'editTemplate') this.$message.success('进入外部编辑器: ' + payload.name)
      if (item.execute === 'delete') {
        this.$confirm('确定要删除吗?', '提示').then(() => {
          requestFun.delete().then(() => { this.$message.success('删除成功'); this.getTableList() })
        })
      }
    },
    getTableList() {
      this.tableData = []; return requestFun.list(this.search.params).then(res => {
        if (res.code === 1) { this.tableData = res.data.list; this.search.params.totoal = res.data.pagination.total }
      })
    },
    handleSizeChange(v) { this.search.params.pageSize = v; this.getTableList() },
    handleCurrentChange(v) { this.search.params.currentPage = v; this.getTableList() },
    resetSearchParams() {
      this.search.params.currentPage = 1; config.search.forEach(i => { this.search.params[i.prop] = '' }); this.getTableList()
    }
  },
}
</script>

<style lang="scss" scoped>
.wrapper { width: 100%; height: 100%; box-sizing: border-box; padding: 16px;
  .content { width: 100%; height: 100%; display: flex; background: #fff;
    .right { flex: 1; height: 100%; box-sizing: border-box; padding: 16px; display: flex; flex-direction: column; overflow: hidden;
      .search .footer { height: 34px; display: flex; align-items: center; margin-left: 5px;
        .partition { width: 1px; height: 14px; background: #e1e5eb; margin: 0 12px; }
      }
      .operation-bar { height: 32px; margin-top: 4px; margin-bottom: 6px; }
      .table { margin-top: 10px; flex: 1;
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
  .table_operation { display: flex; flex-wrap: wrap; }
  .btn { display: inline-block; font-size: 14px; line-height: 22px; cursor: pointer;
    &.text { color: #246fe5; margin-left: 10px; }
    &.highlight { font-weight: bold; color: #ff9800; }
    &.primary { padding: 5px 16px; border-radius: 3px; background: #246fe5; color: #fff; }
    &.default-btn { padding: 5px 16px; border-radius: 3px; background: #fff; border: 1px solid #c4c9cf; color: #333; margin-left: 10px; }
  }
}
</style>
