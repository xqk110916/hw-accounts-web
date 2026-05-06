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
          <div
            v-for="item in btns.operation"
            :key="item.label"
            :class="['btn', 'primary']"
            @click="handleBtnClick(item)"
          >
            {{ item.label }}
          </div>
        </div>
        <div class="table">
          <el-table ref="table" :data="tableData" highlight-current-row :height="height" style="width: 100%">
            <el-table-column type="index" label="序号" width="80" show-overflow-tooltip />
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
                  <span v-if="item.prop === 'auditStatus'">
                    <span :class="['status-tag', getDataStatusClass(scope.row.dataStatus)]">
                      {{ getDataStatusText(scope.row.dataStatus) }}
                    </span>
                    <span
                      v-if="shouldShowAuditTag(scope.row)"
                      :class="['status-tag', 'audit-tag', getAuditStatusClass(scope.row.auditStatus)]"
                    >
                      {{ getAuditStatusText(scope.row.auditStatus) }}
                    </span>
                  </span>
                </div>
                <div v-else>{{ scope.row[item.prop] }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template slot-scope="scope">
                <div class="table_operation">
                  <div
                    v-for="item in getRowBtns(scope.row)"
                    :key="item.label"
                    :class="['btn', 'text']"
                    @click="handleBtnClick(item, scope.row)"
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
            />
          </div>
        </div>
      </div>
    </div>
    <detail ref="detail" @query="resetSearchParams" />
  </div>
</template>

<script>
import detail from './components/detail.vue'
import { config, requestFun, btns, handleTbaleMap, getDefaultOptions, handleSearchParams } from './components/index.js'

export default {
  name: 'MoveManage',
  components: { detail },
  data() {
    return {
      search: {
        params: { currentPage: 1, pageSize: 20, totoal: 0 },
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
      const rightDom = document.querySelector('.right')
      const rightDomHeight = rightDom ? rightDom.clientHeight : 0
      const searchDom = document.querySelector('.search')
      const searchDomHeight = searchDom ? searchDom.clientHeight : 0
      const operationDom = document.querySelector('.operation')
      const operationDomHeight = operationDom ? operationDom.clientHeight : 0
      this.height = rightDomHeight - searchDomHeight - operationDomHeight - 90
    },
    async handleData() {
      this.tableKeys = config.table
      config.search.forEach(item => {
        this.search.options.push(item)
        this.$set(this.search.params, item.prop, item.defaultValue !== undefined ? item.defaultValue : '')
        if (item.option) this.getOptions(item)
      })
      this.addSearchBtn()
    },
    addSearchBtn() {
      this.search.options.push({ type: 'slot', slotName: 'footer', col: 4 })
    },
    handleBtnClick(item, payload) {
      if (item.fn) {
        item.fn(payload)
      } else if (item.execute) {
        switch (item.execute) {
          case 'add':
            this.open()
            break
          case 'view':
            this.$refs.detail.open(payload, 0, 'view')
            break
          case 'update':
            this.$refs.detail.open(payload, 0, 'edit')
            break
          case 'modify':
            this.$refs.detail.open(payload, 1, 'modify')
            break
          case 'audit':
            this.$refs.detail.open(payload, 0, 'audit')
            break
        }
      }
    },
    getOptions(item) {
      if (typeof item.option === 'function') {
        const result = item.option()
        if (result && typeof result.then === 'function') {
          result.then(data => {
            item.option = Array.isArray(data) ? data : (data.data ? (Array.isArray(data.data) ? data.data : data.data.list) : [])
          })
        }
      } else if (!Array.isArray(item.option) && item.option && typeof item.option.then === 'function') {
        item.option.then(res => {
          item.option = Array.isArray(res.data) ? res.data : res.data.list
        })
      }
    },
    getTableList() {
      this.tableData = []
      const params = handleSearchParams ? handleSearchParams(this.search.params) : this.search.params
      return requestFun.list(params).then(res => {
        if (res.code === 1) {
          let data = res.data.list || []
          const page = res.data.pagination || {}
          if (handleTbaleMap) data = handleTbaleMap(data)
          this.tableData = data
          this.search.params.totoal = page.total
        }
      })
    },
    open() {
      this.$refs.detail.open()
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
      config.search.forEach(item => {
        this.$set(this.search.params, item.prop, item.defaultValue !== undefined ? item.defaultValue : '')
      })
      this.getTableList()
    },
    getDataStatusText(status) {
      const value = Number(status)
      const map = { 0: '待审核', 1: '已确认', 2: '已拒绝', 4: '暂存' }
      return map[value] !== undefined ? map[value] : '-'
    },
    getDataStatusClass(status) {
      const value = Number(status)
      const map = { 0: 'status-auditing', 1: 'status-confirmed', 2: 'status-rejected', 4: 'status-draft' }
      return map[value] || ''
    },
    getAuditStatusText(status) {
      const value = Number(status)
      const map = { 0: '待审核', 1: '审核通过', 2: '审核拒绝', 7: '待审核', 8: '审核通过', 9: '审核驳回' }
      return map[value] !== undefined ? map[value] : ''
    },
    getAuditStatusClass(status) {
      const value = Number(status)
      const map = { 0: 'status-auditing', 1: 'status-approved', 2: 'status-rejected', 7: 'status-auditing', 8: 'status-approved', 9: 'status-rejected' }
      return map[value] || ''
    },
    shouldShowAuditTag(row) {
      const auditStatus = row.auditStatus
      if (auditStatus === undefined || auditStatus === null || auditStatus === '') return false
      return !(Number(row.dataStatus) === 0 && Number(auditStatus) === 0)
    },
    getRowBtns(row) {
      const rowBtns = [{ label: '详情', type: 'text', execute: 'view' }]
      const dataStatus = Number(row.dataStatus)
      const hasAuditStatus = row.auditStatus !== undefined && row.auditStatus !== null && row.auditStatus !== ''
      const auditStatus = hasAuditStatus ? Number(row.auditStatus) : NaN
      const isPendingAudit = auditStatus === 0 || auditStatus === 7

      if (dataStatus === 4 || dataStatus === 2) {
        rowBtns.push({ label: '编辑', type: 'text', execute: 'update' })
        return rowBtns
      }
      if (dataStatus === 1) {
        if (isPendingAudit) rowBtns.push({ label: '审核', type: 'text', execute: 'audit' })
        else rowBtns.push({ label: '修改', type: 'text', execute: 'modify' })
        return rowBtns
      }
      if (isPendingAudit || dataStatus === 0) rowBtns.push({ label: '审核', type: 'text', execute: 'audit' })
      return rowBtns
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

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  &.status-draft {
    background: #f4f4f5;
    color: #606266;
  }
  &.status-confirmed,
  &.status-approved {
    background: #e8f5e9;
    color: #2e7d32;
  }
  &.status-auditing {
    background: #e3f2fd;
    color: #1565c0;
  }
  &.status-rejected {
    background: #ffebee;
    color: #c62828;
  }
  &.audit-tag {
    margin-left: 4px;
    font-size: 11px;
    padding: 1px 6px;
    opacity: 0.9;
  }
}
</style>
