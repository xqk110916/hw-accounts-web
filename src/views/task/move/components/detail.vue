<template>
  <div>
    <theme-edit :show="show" showFooterSlot :title="titleMap[type]" :column="1" @cancle="close">

    <!-- 明细表格 -->
    <div class="detail-section">
      <div class="detail-header">
        <span class="detail-title">容器明细</span>
        <div class="detail-actions">
          <el-button size="small" type="primary" @click="openPositionSelector">选择</el-button>
        </div>
      </div>
      <el-table :data="detailList" border size="small" max-height="300">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="containerNo" label="容器号" width="120" show-overflow-tooltip />
        <el-table-column prop="sourceWarehouse" label="原库房" width="120" show-overflow-tooltip />
        <el-table-column prop="sourcePosition" label="原位置" width="120" show-overflow-tooltip />
        <el-table-column prop="targetWarehouse" label="目标库房" width="120" show-overflow-tooltip />
        <el-table-column prop="targetPosition" label="目标位置" width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="80" fixed="right">
          <template slot-scope="scope">
            <span class="btn text" @click="removeDetailRow(scope.$index)">删除</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="footer">
      <el-button size="small" @click="close">取消</el-button>
      <el-button type="primary" size="small" @click="submitForm">确定</el-button>
    </div>
  </theme-edit>

  <!-- 位置选择弹窗 -->
  <el-dialog :close-on-click-modal="false" title="选择目标位置" :visible.sync="positionDialogVisible" width="500px" append-to-body>
    <el-form :model="positionForm" label-width="100px">
      <el-form-item label="目标库房">
        <el-input v-model="positionForm.targetWarehouse" size="small" placeholder="请选择目标库房" />
      </el-form-item>
      <el-form-item label="目标位置">
        <el-input v-model="positionForm.targetPosition" size="small" placeholder="请选择目标位置" />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button size="small" @click="positionDialogVisible = false">取消</el-button>
      <el-button type="primary" size="small" @click="confirmPosition">确定</el-button>
    </div>
  </el-dialog>
  </div>
</template>

<script>
import { requestFun, beforeSubmit } from './index.js'

export default {
  data() {
    return {
      row: {},
      show: false,
      type: 'add',
      form: {},
      detailList: [],
      positionDialogVisible: false,
      positionForm: {
        targetWarehouse: '',
        targetPosition: '',
      },
    }
  },
  computed: {
    titleMap() {
      return { add: '添加位置移动', edit: '编辑位置移动', view: '位置移动详情' }
    },
  },
  methods: {
    open(row) {
      this.row = row || {}
      if (this.row.id) {
        this.type = 'edit'
        this.getDetails(this.row.id).then(() => {
          this.show = true
        })
      } else {
        this.type = 'add'
        this.detailList = []
        this.show = true
      }
    },
    close() {
      this.row = {}
      this.form = this.$options.data().form
      this.detailList = []
      this.$nextTick(() => {
        this.show = false
      })
    },
    getDetails(id) {
      return requestFun.detail({ id }).then(res => {
        this.form = res.data || {}
        this.detailList = res.data.details || []
        return res.data
      })
    },
    async submitForm() {
      let payload = { ...this.form }
      if (this.row.id) payload.id = this.row.id
      payload.details = this.detailList
      if (beforeSubmit) payload = await beforeSubmit(payload)
      requestFun.update(payload).then(res => {
        if (res.code === 1) {
          this.$message.success('操作成功')
          this.$emit('query')
          this.close()
        }
      })
    },
    openPositionSelector() {
      this.positionForm = { targetWarehouse: '', targetPosition: '' }
      this.positionDialogVisible = true
    },
    confirmPosition() {
      if (!this.positionForm.targetWarehouse || !this.positionForm.targetPosition) {
        this.$message.warning('请选择目标位置')
        return
      }
      this.detailList.push({
        containerNo: '',
        sourceWarehouse: this.form.sourceWarehouse,
        sourcePosition: this.form.sourcePosition,
        targetWarehouse: this.positionForm.targetWarehouse,
        targetPosition: this.positionForm.targetPosition,
      })
      this.positionDialogVisible = false
    },
    removeDetailRow(index) {
      this.detailList.splice(index, 1)
    },
  },
}
</script>

<style lang="scss" scoped>
.detail-section {
  padding: 0 20px 20px;
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    .detail-title {
      font-size: 14px;
      font-weight: bold;
      color: #1b2129;
    }
  }
}
.footer {
  padding: 12px 32px 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #c4c9cf;
}
.btn.text {
  color: #246fe5;
  cursor: pointer;
}
::v-deep .el-dialog__body {
  padding: 0 !important;
}
::v-deep .el-dialog__footer {
  display: none;
}
</style>
