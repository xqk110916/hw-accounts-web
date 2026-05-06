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
            <el-table-column type="index" label="序号" width="80" show-overflow-tooltip>
            </el-table-column>
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
                    <span v-if="scope.row.auditStatus" :class="['status-tag', 'audit-tag', getAuditStatusClass(scope.row.auditStatus)]" style="margin-left: 4px;">
                      {{ getAuditStatusText(scope.row.auditStatus) }}
                    </span>
                  </span>
                </div>
                <div v-else>{{ scope.row[item.prop] }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template slot-scope="scope">
                <div class="table_operation">
                  <div
                    v-for="item in getRowBtns(scope.row)"
                    :key="item.label"
                    :class="['btn', 'text']"
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
    <detail ref="detail" @query="resetSearchParams"></detail>
    <allocation-basis-list-dialog ref="basisDialog" />


  </div>
</template>

<script>
import detail from './components/detail.vue'
import { config, requestFun, btns, handleTbaleMap, getDefaultOptions, handleSearchParams } from './components/index.js'
import { confirmInbound } from './components/api.js'
import AllocationBasisListDialog from './components/AllocationBasisListDialog.vue'

export default {
  name: 'InboundManage',
  components: { detail, AllocationBasisListDialog },
  data() {
    return {
      showLeft: false,
      tree: {
        value: '',
        data: [],
        nodeKey: 'id',
        props: { label: 'areaName', value: 'areaCode' },
      },
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
      searchKeys: [],
      detailKey: [],
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
  watch: {
    'tree.value': {
      handler(val) {
        this.$refs.tree && this.$refs.tree.filter(val)
      },
      deep: true,
    },
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
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    async handleData() {
      this.tableKeys = config.table
      config.search.forEach(item => {
        this.search.options.push(item)
        this.$set(this.search.params, item.prop, item.defaultValue !== undefined ? item.defaultValue : '')
        if (item.option) this.getOptions(item)
      })
      this.addSearchBtn()

      if (config.tree && config.tree.data) {
        this.showLeft = true
        let { data } = await config.tree.data
        this.tree.data = data
        if (config.tree.searchKey) this.$set(this.search.params, config.tree.searchKey, '')
        if (config.tree.props) this.tree.props = config.tree.props
        if (config.tree.nodeKey) this.tree.nodeKey = config.tree.nodeKey
      }
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
            this.view(payload)
            break
          case 'update':
            this.edit(payload)
            break
          case 'modify':
            this.modify(payload)
            break
          case 'confirm':
            this.confirmRow(payload)
            break
          case 'delete':
            this.remove(payload)
            break
          case 'audit':
            this.openAudit(payload)
            break
          case 'manageAllocationBasis':
            this.$refs.basisDialog.open()
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
          let page = res.data.pagination || {}
          if (handleTbaleMap) data = handleTbaleMap(data)
          this.tableData = data
          this.search.params.totoal = page.total
          return data
        }
      })
    },
    open() {
      this.$refs.detail.open()
    },
    view(row) {
      this.$refs.detail.open(row, 0, 'view')
    },
    edit(row) {
      // 未确认状态可编辑
      this.$refs.detail.open(row, 0, 'edit')
    },
    modify(row) {
      // 已确认状态 -> 修改 -> 提交变更审核
      this.$refs.detail.open(row, 1, 'modify')
    },
    confirmRow(row) {
      this.$confirm('确定要确认该入库任务?', '提示', { type: 'warning' })
        .then(() => {
          confirmInbound({ taskNum: row.taskNum }).then(res => {
            if (res.code === 1) {
              this.$message.success('确认成功')
              this.getTableList()
            }
          })
        })
        .catch(() => {})
    },
    remove(row) {
      this.$confirm('确定要删除该任务?', '提示', { type: 'warning' })
        .then(() => {
          if (requestFun.delete) {
            requestFun.delete({ id: row.id }).then(res => {
              if (res.code === 1) {
                this.$message({ message: '删除成功', type: 'success' })
                this.getTableList()
              }
            })
          } else {
            this.$message.warning('当前接口文档未提供删除接口')
          }
        })
        .catch(() => {})
    },
    handleNodeClick(data, node) {
      config.tree.nodeClick && config.tree.nodeClick(data, node)
      this.getTableList()
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
    // 审核 - 以审核模式打开详情弹窗
    openAudit(row) {
      this.$refs.detail.open(row, 0, 'audit')
    },
    // dataStatus 显示文本
    getDataStatusText(status) {
      const value = Number(status)
      const map = { 0: '待确认', 1: '已确认', 2: '已拒绝' }
      return map[value] !== undefined ? map[value] : ('-')
    },
    getDataStatusClass(status) {
      const value = Number(status)
      const map = { 0: 'status-pending', 1: 'status-confirmed', 2: 'status-rejected' }
      return map[value] || ''
    },
    // auditStatus 显示文本
    getAuditStatusText(status) {
      const map = { 7: '待审核', 8: '审核通过', 9: '审核驳回' }
      return map[status] !== undefined ? map[status] : ''
    },
    getAuditStatusClass(status) {
      const map = { 7: 'status-auditing', 8: 'status-approved', 9: 'status-rejected' }
      return map[status] || ''
    },
    // 根据状态显示不同按钮
    getRowBtns(row) {
      const btns = [{ label: '详情', type: 'text', execute: 'view' }]
      const dataStatus = Number(row.dataStatus)
      const auditStatus = row.auditStatus

      if (dataStatus === 0) {
        // 未确认：显示 编辑、确认、删除
        btns.push({ label: '编辑', type: 'text', execute: 'update' })
        btns.push({ label: '确认', type: 'text', execute: 'confirm' })
        btns.push({ label: '删除', type: 'text', execute: 'delete' })
      } else if (dataStatus === 2) {
        btns.push({ label: '编辑', type: 'text', execute: 'update' })
        btns.push({ label: '删除', type: 'text', execute: 'delete' })
      } else if (dataStatus === 1) {
        // 已确认且非待审核：显示 修改（待审核时隐藏修改按钮）
        if (auditStatus !== 7) {
          btns.push({ label: '修改', type: 'text', execute: 'modify' })
        }
      }

      // 待审核：显示 审核
      if (dataStatus !== 2 && auditStatus === 7) {
        btns.push({ label: '审核', type: 'text', execute: 'audit' })
      }

      return btns
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

// 状态标签
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  &.status-pending {
    background: #fff0cc;
    color: #e68600;
  }
  &.status-confirmed {
    background: #e8f5e9;
    color: #2e7d32;
  }
  &.status-auditing {
    background: #e3f2fd;
    color: #1565c0;
  }
  &.status-approved {
    background: #e8f5e9;
    color: #2e7d32;
  }
  &.status-rejected {
    background: #ffebee;
    color: #c62828;
  }
  &.audit-tag {
    font-size: 11px;
    padding: 1px 6px;
    opacity: 0.9;
  }
}
</style>
