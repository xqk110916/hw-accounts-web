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
            <!-- 左侧复选框 -->
            <el-table-column type="selection" width="55"></el-table-column>
            
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
                  <span v-if="item.prop === 'dataStatus'" :class="['status-tag', getStatusClass(scope.row.dataStatus)]">
                    {{ getStatusText(scope.row.dataStatus) }}
                  </span>
                </div>
                <div v-else>{{ scope.row[item.prop] }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
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
              :total="search.params.total"
            >
            </el-pagination>
          </div>
        </div>
      </div>
    </div>
    <detail ref="detail" @query="getTableList"></detail>
    
    <!-- 审核弹窗 -->
    <el-dialog :close-on-click-modal="false" title="审核" :visible.sync="auditDialogVisible" width="500px" append-to-body>
      <el-form :model="auditForm" label-width="100px">
        <el-form-item label="审核结果" prop="approved">
          <el-radio-group v-model="auditForm.approved">
            <el-radio :label="true">审核通过</el-radio>
            <el-radio :label="false">审核拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="auditForm.remark" type="textarea" :rows="3" size="small" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="submitAudit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import detail from './components/detail.vue'
import { config, requestFun, btns, handleTbaleMap, getDefaultOptions } from './components/index.js'
import { auditInitialEntry, submitInitialEntry } from './components/api.js'

export default {
  name: 'InitialEntry',
  components: { detail },
  data() {
    return {
      search: {
        params: {
          currentPage: 1,
          pageSize: 20,
          dataStatus: '',
          total: 0,
          startTime: '',
          endTime: '',
        },
        options: [],
      },
      tableData: [],
      height: 0,
      tableKeys: [],
      btns,
      // 审核
      auditDialogVisible: false,
      auditForm: {
        id: '',
        result: 'pass',
        remark: '',
      },
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
    async handleData() {
      this.tableKeys = config.table
      config.search.forEach(item => {
        this.search.options.push(item)
        if (item.prop !== 'dataStatus') {
          this.$set(this.search.params, item.prop, '')
        }
        if (item.option && Object.prototype.toString.call(item.option) !== '[object Array]') {
          item.option.then(res => {
            item.option = Array.isArray(res.data) ? res.data : res.data.list
          })
        }
      })
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
          case 'delete':
            this.remove(payload)
            break
          case 'audit':
            this.openAudit(payload)
            break
          case 'submit':
            this.submitAction(payload)
            break
          case 're-import':
            this.reImport(payload)
            break
        }
      }
    },
    getTableList() {
      this.tableData = []
      return requestFun.list(this.search.params).then(res => {
        if (res.code === 1) {
          let data = res.data.records || []
          if (handleTbaleMap) data = handleTbaleMap(data)
          this.tableData = data
          this.search.params.total = Number(res.data.total) || 0
          return data
        }
      })
    },
    open() {
      this.$refs.detail.open()
    },
    view(row) {
      this.$refs.detail.open(row, 'view')
    },
    edit(row) {
      this.$refs.detail.open(row, 'edit')
    },
    remove(row) {
      this.$confirm('确定要删除吗?', '提示', { type: 'warning' })
        .then(() => {
          requestFun.delete({ id: row.id }).then(res => {
            if (res.code === 1) {
              this.$message({ message: '删除成功', type: 'success' })
              this.getTableList()
            }
          })
        })
        .catch(() => {})
    },
    submitAction(row) {
       this.$confirm('确定要提交吗?', '提示', { type: 'warning' })
        .then(() => {
          submitInitialEntry({ id: row.id }).then(res => {
            if (res.code === 1) {
              this.$message({ message: '提交成功', type: 'success' })
              this.getTableList()
            }
          })
        })
        .catch(() => {})
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
    reImport(row) {
      this.$refs.detail.open(row, 're-import')
    },
    // 审核
    openAudit(row) {
      this.auditForm = {
        id: row.id,
        result: 'pass',
        remark: '',
      }
      this.auditDialogVisible = true
    },
    submitAudit() {
      const payload = {
        id: this.auditForm.id,
        approved: this.auditForm.approved
      }
      auditInitialEntry(payload).then(res => {
        if (res.code === 1) {
          this.$message.success('审核成功')
          this.auditDialogVisible = false
          this.getTableList()
        }
      })
    },
    // 状态显示
    getStatusText(status) {
      const map = {
        0: '待确认',
        1: '已确认',
        2: '待提交',
        3: '审核中',
        4: '审核通过',
        5: '审核驳回',
      }
      return map[status] || status
    },
    getStatusClass(status) {
      const map = {
        0: 'status-pending',
        1: 'status-approved',
        2: 'status-default',
        3: 'status-pending',
        4: 'status-approved',
        5: 'status-rejected',
      }
      return map[status] || ''
    },
    // 根据状态显示不同按钮
    getRowBtns(row) {
      const btns = [{ label: '详情', type: 'text', execute: 'view' }]
      if (row.dataStatus === 0) { // 待确认
        btns.push({ label: '确认', type: 'text', execute: 'confirm' }) // 文档没写确认接口，先保留或映射为编辑
        btns.push({ label: '编辑', type: 'text', execute: 'update' })
        btns.push({ label: '删除', type: 'text', execute: 'delete' })
      } else if (row.dataStatus === 2 || row.dataStatus === 5) { // 待提交 或 审核驳回
        btns.push({ label: '重新导入', type: 'text', execute: 're-import' })
        btns.push({ label: '编辑', type: 'text', execute: 'update' })
        btns.push({ label: '提交', type: 'text', execute: 'submit' })
        btns.push({ label: '删除', type: 'text', execute: 'delete' })
      } else if (row.dataStatus === 3) { // 审核中
        btns.push({ label: '审核', type: 'text', execute: 'audit' })
      } else if (row.dataStatus === 4) { // 审核通过
        btns.push({ label: '删除', type: 'text', execute: 'delete' })
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

.table_operation {
  display: flex;
  flex-wrap: wrap;
}

// 状态标签
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  &.status-default {
    background: #edf1f5;
    color: #424c59;
  }
  &.status-pending {
    background: #fff0cc;
    color: #e68600;
  }
  &.status-approved {
    background: #e8f5e9;
    color: #2e7d32;
  }
  &.status-rejected {
    background: #ffebee;
    color: #c62828;
  }
}
</style>
