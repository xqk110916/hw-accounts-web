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
        <div class="operation" v-if="btns.operation && btns.operation.length">
          <div class="operation-right">
            <div v-for="item in btns.operation" :key="item.label" :class="['btn', 'primary']" @click="handleBtnClick(item)">{{ item.label }}</div>
          </div>
        </div>
        <div class="table">
          <el-table
            ref="table"
            :data="tableData"
            border
            highlight-current-row
            :height="height"
            style="width: 100%"
          >
            <el-table-column type="index" label="序号" width="80" show-overflow-tooltip></el-table-column>
            <el-table-column v-for="item in tableKeys" :prop="item.prop" :label="item.label" :key="item.prop" show-overflow-tooltip :width="item.width">
              <template slot-scope="scope">
                <div>{{ scope.row[item.prop] }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template slot-scope="scope">
                <div class="table_operation">
                  <div v-for="item in btns.table" :key="item.label" :class="['btn', 'text']" @click="e => handleBtnClick(item, scope.row)">{{ item.label }}</div>
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
              :total="search.params.total"
            >
            </el-pagination>
          </div>
        </div>
      </div>
    </div>
    <detail-dialog ref="detailDialog"></detail-dialog>
    <import-dialog ref="importDialog" @success="getTableList"></import-dialog>
  </div>
</template>

<script>
import DetailDialog from './components/DetailDialog.vue'
import ImportDialog from './components/ImportDialog.vue'
import { config, requestFun, btns, handleTbaleMap, getDefaultOptions } from './components/index.js'

export default {
  name: 'DataBackup',
  components: { DetailDialog, ImportDialog },
  data() {
    return {
      search: {
        params: {
          currentPage: 1,
          pageSize: 20,
          total: 0,
        },
        options: [],
      },
      tableData: [],
      height: 0,
      tableKeys: [],
      btns,
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
  },
  methods: {
    computedTableHeight() {
      let rightDom = document.querySelector('.right')
      let rightDomHeight = rightDom ? rightDom.clientHeight : 0
      let searchDom = document.querySelector('.search')
      let searchDomHeight = searchDom ? searchDom.clientHeight : 0
      let operationDom = document.querySelector('.operation')
      let operationDomHeight = operationDom ? operationDom.clientHeight : 0
      this.height = rightDomHeight - searchDomHeight - operationDomHeight - 90
    },
    handleData() {
      let colNumber = 0
      this.tableKeys = config.table
      config.search.forEach(item => {
        colNumber = colNumber + (item.col || 5)
        if (colNumber > 20) this.addSearchBtn()
        this.search.options.push(item)
        this.$set(this.search.params, item.prop, '')
        if (item.option) this.getOptions(item)
      })
      if (colNumber <= 20) this.addSearchBtn()
    },
    addSearchBtn() {
      this.search.options.push({ type: 'slot', slotName: 'footer', col: 4 })
    },
    handleBtnClick(item, payload) {
      if (item.fn) {
        if (item.fn === 'import') {
          this.$refs.importDialog.open()
        } else if (item.fn === 'export') {
          this.handleExport()
        }
      } else if (item.execute) {
        switch (item.execute) {
          case 'view':
            this.$refs.detailDialog.open(payload)
            break
        }
      }
    },
    getOptions(item) {
      if (!Array.isArray(item.option)) {
        item.option.then(res => {
          item.option = Array.isArray(res.data) ? res.data : res.data.list
        })
      }
    },
    getTableList() {
      this.tableData = []
      return requestFun.list(this.search.params).then(res => {
        if (res.code === 1) {
          let data = res.data.list || []
          let page = res.data.pagination || {}
          if (handleTbaleMap) data = handleTbaleMap(data)
          this.tableData = data
          this.search.params.total = page.total
          return data
        }
      })
    },
    handleExport() {
      this.$confirm('确定要导出数据吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        requestFun.export(this.search.params).then(res => {
          const blob = new Blob([res])
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = `数据备份_${new Date().getTime()}.xlsx`
          link.click()
          URL.revokeObjectURL(link.href)
          this.$message.success('导出成功')
        }).catch(() => {
          this.$message.error('导出失败')
        })
      }).catch(() => {})
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
      this.search.params = this.$options.data().search.params
      this.getTableList()
    },
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

      .operation {
        height: 32px;
        margin-top: 4px;
        margin-bottom: 6px;
        display: flex;
        justify-content: flex-end;

        .operation-right {
          display: flex;
          gap: 10px;
        }
      }

      .table {
        margin-top: 10px;
        flex: 1;

        .table_operation {}

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
  }

  .btn + .btn {
    margin-left: 10px;
  }
}
</style>
