<template>
  <div class="wrapper">
    <div class="content">
      <div class="right">
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
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template slot-scope="scope">
                <div class="table_operation">
                  <div :class="['btn', 'text', scope.row.isBack === '1' ? 'warning' : 'primary']" @click="handleBackup(scope.row)">{{ scope.row.isBack === '1' ? '关闭自动备份' : '开启自动备份' }}</div>
                  <div :class="['btn', 'text', 'danger']" @click="handleRestore(scope.row)">恢复</div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { config, handleTbaleMap } from './components/index.js'
import { getBackupConfigList, updateBackupConfig, restoreBackup } from './components/api.js'

export default {
  name: 'DataBackup',
  data() {
    return {
      tableData: [],
      tableKeys: [],
      height: 0,
    }
  },
  created() {
    this.tableKeys = config.table
    this.getTableList()
  },
  mounted() {
    this.$nextTick(() => {
      this.computedTableHeight()
    })
  },
  methods: {
    computedTableHeight() {
      let rightDom = document.querySelector('.right')
      let rightDomHeight = rightDom ? rightDom.clientHeight : 0
      this.height = rightDomHeight - 40
    },
    getTableList() {
      getBackupConfigList().then(res => {
        if (res.code === 1) {
          let data = res.data || []
          if (handleTbaleMap) data = handleTbaleMap(data)
          this.tableData = data
        }
      })
    },
    handleBackup(row) {
      const isBack = row.isBack === '1' ? '2' : '1'
      const action = isBack === '1' ? '开启' : '关闭'
      this.$confirm(`确定要${action}自动备份吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateBackupConfig(row.id, isBack).then(() => {
          this.$message.success(`${action}自动备份成功`)
          this.getTableList()
        })
      }).catch(() => {})
    },
    handleRestore(row) {
      this.$confirm('恢复操作会删除当前表数据并用备份数据替换，确定要恢复吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        restoreBackup(row.backType).then(() => {
          this.$message.success('恢复成功')
          this.getTableList()
        })
      }).catch(() => {})
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

      .table {
        flex: 1;

        .table_operation {
          display: flex;
          gap: 10px;
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
      &.primary {
        color: #246fe5;
      }

      &.warning {
        color: #e6a23c;
      }

      &.danger {
        color: #f56c6c;
      }
    }
  }
}
</style>
