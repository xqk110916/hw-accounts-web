<template>
  <div class="wrapper">
    <div class="content">
      <div class="right">
        <search-filter class="search" :options="search.options" :form="search.params">
          <div slot="footer" class="footer" style="padding-top: 4px;">
            <div :class="['btn', 'text']" @click="getTableList">查询</div>
            <div class="partition"></div>
            <div :class="['btn', 'text']" @click="resetSearchParams">重置</div>
          </div>
        </search-filter>
        <div class="table">
          <el-table ref="table" :data="tableData" border highlight-current-row :height="height" style="width: 100%">
            <el-table-column type="index" label="序号" width="80" align="center" show-overflow-tooltip />
            <el-table-column
              v-for="item in tableKeys"
              :prop="item.prop"
              :label="item.label"
              :key="item.prop"
              show-overflow-tooltip
              :min-width="item.minWidth">
              <template slot-scope="scope">
                <span v-if="item.clickable" class="link-text" @click="openContainer(scope.row, item.prop)">
                  {{ scope.row[item.prop] }}
                </span>
                <span v-else>{{ scope.row[item.prop] }}</span>
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
              :total="search.params.total" />
          </div>
        </div>
      </div>
    </div>
    <container-detail-dialog ref="containerDetail" />
  </div>
</template>

<script>
import ContainerDetailDialog from './components/ContainerDetailDialog.vue'
import { config, allTableColumns, requestFun, getDefaultOptions, buildQueryParams, handleTbaleMap } from './components/index.js'

export default {
  name: 'TransferBasisQuery',
  components: { ContainerDetailDialog },
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
      tableKeys: allTableColumns,
      tableData: [],
      goodCodeNameMap: {}, // goodCode -> goodName 映射，由 getDefaultOptions 初始化
      height: 0,
    }
  },
  async created() {
    this.initSearchOptions()
    await getDefaultOptions(this)
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
    initSearchOptions() {
      config.search.forEach(item => {
        this.search.options.push({ ...item })
        if (item.type === 'daterange' || item.multiple) {
          this.$set(this.search.params, item.prop, [])
        } else {
          this.$set(this.search.params, item.prop, '')
        }
      })
      this.search.options.push({ type: 'slot', slotName: 'footer', col: 4 })
    },
    computedTableHeight() {
      const rightDom = document.querySelector('.right')
      const rightH = rightDom ? rightDom.clientHeight : 0
      const searchDom = document.querySelector('.search')
      const searchH = searchDom ? searchDom.clientHeight : 0
      this.height = rightH - searchH - 90
    },
    // 点击数量/重量列，查看容器明细
    openContainer(row, prop) {
      this.$refs.containerDetail.open(row, prop, this.goodCodeNameMap)
    },
    getTableList() {
      this.tableData = []
      const params = buildQueryParams(this.search.params)
      return requestFun.list(params).then(res => {
        if (res.code === 1) {
          let data = res.data.list || []
          const page = res.data.pagination || {}
          if (handleTbaleMap) data = handleTbaleMap(data, this)
          this.tableData = data
          this.search.params.total = page.total
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
      this.search.params = { currentPage: 1, pageSize: this.search.params.pageSize, total: 0 }
      this.initSearchOptions()
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

      .table {
        margin-top: 10px;
        flex: 1;
        .link-text {
          color: #246fe5;
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
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
  }
  .btn + .btn {
    margin-left: 10px;
  }
}
</style>
