<template>
  <div>
    <theme-edit :show="show" showFooterSlot :title="titleMap[type]" :column="1" @cancle="close">
      <el-form ref="form" class="form" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="任务编号" prop="taskNum">
          <el-input v-model="form.taskNum" size="small" disabled placeholder="自动生成" />
        </el-form-item>
        <el-form-item label="盘存方式" prop="selectType" v-if="type === 'add' || type === 'edit'">
          <el-select v-model="form.selectType" size="small" placeholder="请选择盘存方式" @change="handleSelectTypeChange">
            <el-option label="全部库房" value="all" />
            <el-option label="指定库房" value="selected" />
          </el-select>
        </el-form-item>
        <el-form-item label="盘存方式" v-else>
          <span>{{ form.selectType === 'all' ? '全部库房' : '指定库房' }}</span>
        </el-form-item>
        <el-form-item label="指定库房" prop="warehouseIds" v-if="(type === 'add' || type === 'edit') && form.selectType === 'selected'">
          <el-select v-model="form.warehouseIds" size="small" multiple placeholder="请选择库房" style="width: 100%">
            <el-option
              v-for="item in warehouseOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="库房名称" v-if="type !== 'add' && form.warehouseNames">
          <span>{{ form.warehouseNames }}</span>
        </el-form-item>
        <el-form-item label="备注" prop="remark" v-if="type === 'add' || type === 'edit'">
          <el-input v-model="form.remark" type="textarea" :rows="3" size="small" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="备注" v-else-if="form.remark">
          <span>{{ form.remark }}</span>
        </el-form-item>
        <el-form-item label="创建人" v-if="type === 'view' && form.createUname">
          <span>{{ form.createUname }}</span>
        </el-form-item>
        <el-form-item label="创建时间" v-if="type === 'view' && form.createTime">
          <span>{{ form.createTime }}</span>
        </el-form-item>
      </el-form>

      <!-- 统计信息 (查看模式) -->
      <div class="statistics" v-if="type === 'view'">
        <div class="stat-item">
          <span class="stat-label">总正常数：</span>
          <span class="stat-value stat-normal">{{ statistics.totalNormalCount || 0 }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总盘亏数：</span>
          <span class="stat-value stat-deficit">{{ statistics.totalDeficitCount || 0 }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总盘盈数：</span>
          <span class="stat-value stat-excess">{{ statistics.totalExcessCount || 0 }}</span>
        </div>
      </div>

      <!-- 货物清单 (新增/编辑模式) -->
      <div class="detail-section" v-if="type === 'add' || type === 'edit'">
        <div class="detail-header">
          <span class="detail-title">货物清单</span>
          <el-button size="small" type="primary" @click="fetchGoodsList" :loading="goodsLoading">
            获取货物清单
          </el-button>
        </div>
        <el-table :data="goodsList" border size="small" max-height="300" @selection-change="handleGoodsSelectionChange">
          <el-table-column v-if="form.selectType === 'all'" type="selection" width="50" />
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="warehouseName" label="库房" width="120" show-overflow-tooltip />
          <el-table-column prop="containerCode" label="容器号" width="120" show-overflow-tooltip />
          <el-table-column prop="goodCode" label="材料编码" width="120" show-overflow-tooltip />
          <el-table-column prop="goodName" label="材料名称" width="120" show-overflow-tooltip />
          <el-table-column prop="productionUnit" label="生产单位" width="100" show-overflow-tooltip />
          <el-table-column prop="location" label="位置" width="120" show-overflow-tooltip />
          <el-table-column prop="sealCode1" label="封记编号1" width="100" show-overflow-tooltip />
          <el-table-column prop="sealCode2" label="封记编号2" width="100" show-overflow-tooltip />
          <el-table-column prop="storageTime" label="入库时间" width="160" show-overflow-tooltip />
        </el-table>
      </div>

      <!-- 库房分组展示 (查看/录入结果模式) -->
      <div class="detail-section" v-if="type === 'view' || type === 'inputResult'">
        <div class="detail-header">
          <span class="detail-title">库房货物清单</span>
        </div>
        <el-collapse v-model="activeWarehouses">
          <el-collapse-item
            v-for="(warehouse, wIdx) in warehouseList"
            :key="warehouse.warehouseId"
            :title="`${warehouse.warehouseName} (${(warehouse.goodsList || []).length}项)`"
            :name="warehouse.warehouseId"
          >
            <el-table :data="warehouse.goodsList" border size="small" max-height="250">
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="goodCode" label="材料编码" width="120" show-overflow-tooltip />
              <el-table-column prop="goodName" label="材料名称" width="120" show-overflow-tooltip />
              <el-table-column prop="containerCode" label="容器号" width="120" show-overflow-tooltip />
              <el-table-column prop="productionUnit" label="生产单位" width="100" show-overflow-tooltip />
              <el-table-column prop="location" label="位置" width="120" show-overflow-tooltip />
              <el-table-column prop="sealCode1" label="封记编号1" width="100" show-overflow-tooltip />
              <el-table-column prop="sealCode2" label="封记编号2" width="100" show-overflow-tooltip />
              <el-table-column prop="storageTime" label="入库时间" width="160" show-overflow-tooltip />
              <!-- 录入结果模式：结果列 -->
              <el-table-column prop="result" label="结果" width="120" v-if="type === 'inputResult'">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.result" size="mini" placeholder="请选择">
                    <el-option label="正常" value="0" />
                    <el-option label="盘亏" value="1" />
                    <el-option label="盘盈" value="2" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="resultRemark" label="结果备注" width="150" v-if="type === 'inputResult'">
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.resultRemark"
                    size="mini"
                    placeholder="异常时必填"
                    :disabled="scope.row.result === '0'"
                  />
                </template>
              </el-table-column>
              <!-- 查看模式：结果列 -->
              <el-table-column prop="result" label="结果" width="100" v-if="type === 'view'">
                <template slot-scope="scope">
                  <span :class="getResultClass(scope.row.result)">{{ getResultText(scope.row.result) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="resultRemark" label="结果备注" width="150" v-if="type === 'view'" show-overflow-tooltip />
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </div>

      <template slot="footer">
        <div class="footer">
          <el-button size="small" @click="close">取消</el-button>
          <!-- 新增模式 -->
          <template v-if="type === 'add'">
            <el-button size="small" @click="saveDraft" :loading="submitting">暂存</el-button>
            <el-button type="primary" size="small" @click="submitTask" :loading="submitting">提交</el-button>
          </template>
          <!-- 编辑模式 -->
          <template v-if="type === 'edit'">
            <el-button type="primary" size="small" @click="editTask" :loading="submitting">保存</el-button>
          </template>
          <!-- 录入结果模式 -->
          <template v-if="type === 'inputResult'">
            <el-button type="primary" size="small" @click="submitResult" :loading="submitting">提交结果</el-button>
          </template>
          <!-- 审核模式 -->
          <template v-if="type === 'audit'">
            <el-button size="small" @click="handleAudit(false)">驳回</el-button>
            <el-button type="primary" size="small" @click="handleAudit(true)">同意</el-button>
          </template>
        </div>
      </template>
    </theme-edit>

    <!-- 驳回原因弹窗 -->
    <el-dialog :close-on-click-modal="false" title="驳回原因" :visible.sync="rejectDialogVisible" width="400px" append-to-body>
      <el-input v-model="rejectRemark" type="textarea" :rows="3" placeholder="请输入驳回原因" />
      <div slot="footer">
        <el-button size="small" @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="confirmReject">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { config, requestFun, beforeSubmit, beforeRecurrence, selectTypeOptions } from './index.js'
import { getGoodsList, submitInventory, editInventory, auditInventory, submitInventoryResult } from './api.js'
import { generateBatchNo } from '@/api/common/batchNo.js'
import { getLocationHierarchy } from '@/views/task/outbound/components/api.js'

export default {
  data() {
    return {
      row: {},
      show: false,
      type: 'add',
      form: {},
      rules: {},
      options: {},
      goodsList: [],
      selectedGoods: [],
      warehouseList: [],
      activeWarehouses: [],
      statistics: { totalNormalCount: 0, totalDeficitCount: 0, totalExcessCount: 0 },
      warehouseOptions: [],
      goodsLoading: false,
      submitting: false,
      rejectDialogVisible: false,
      rejectRemark: '',
    }
  },
  computed: {
    titleMap() {
      return {
        add: '添加实物盘存',
        edit: '编辑实物盘存',
        view: '实物盘存详情',
        inputResult: '录入盘存结果',
        audit: '审核实物盘存',
      }
    },
  },
  created() {
    this.initForm()
    this.loadWarehouseOptions()
  },
  methods: {
    open(row, mode) {
      this.row = row || {}
      if (this.row.id) {
        this.type = mode || 'edit'
        this.getDetails(this.row.id).then(() => {
          this.show = true
        })
      } else {
        this.type = 'add'
        this.goodsList = []
        this.warehouseList = []
        this.show = true
        generateBatchNo({ batchType: 3 }).then(res => {
          if (res.code === 1) {
            this.$set(this.form, 'taskNum', res.data)
          }
        })
      }
    },
    close() {
      this.resetForm()
      this.$nextTick(() => {
        this.show = false
      })
    },
    initForm() {
      config.detail.forEach(item => {
        let defaultValue = item.defaultValue !== undefined ? item.defaultValue : ''
        this.$set(this.form, item.prop, defaultValue)
        if (item.required) {
          let isInput = !item.type || item.type === 'text' || item.type === 'textarea'
          let rule = {
            required: true,
            message: `请${isInput ? '输入' : '选择'}${item.label}`,
            trigger: isInput ? 'blur' : 'change',
          }
          this.$set(this.rules, item.prop, [rule])
        }
      })
    },
    loadWarehouseOptions() {
      getLocationHierarchy(2).then(res => {
        if (res.code === 1) {
          this.warehouseOptions = (res.data || []).map(item => ({
            label: item.warehouseName,
            value: item.id,
          }))
        }
      })
    },
    getDetails(id) {
      return requestFun.detail(id).then(res => {
        let data = res.data
        // 填充主表单
        const inventory = data.inventory || data
        config.detail.forEach(item => {
          if (inventory[item.prop] !== undefined && inventory[item.prop] !== null) {
            this.$set(this.form, item.prop, inventory[item.prop])
          }
        })
        this.form.id = inventory.id
        // 库房分组数据
        this.warehouseList = data.warehouseList || []
        if (this.warehouseList.length > 0) {
          this.activeWarehouses = [this.warehouseList[0].warehouseId]
        }
        // 统计数据
        this.statistics = {
          totalNormalCount: data.totalNormalCount || 0,
          totalDeficitCount: data.totalDeficitCount || 0,
          totalExcessCount: data.totalExcessCount || 0,
        }
        if (beforeRecurrence) beforeRecurrence(this.form, this)
        return data
      })
    },
    fetchGoodsList() {
      const type = this.form.selectType || 'all'
      const warehouseId = type === 'selected' ? this.form.warehouseIds : undefined
      if (type === 'selected' && (!warehouseId || warehouseId.length === 0)) {
        this.$message.warning('请先选择库房')
        return
      }
      this.goodsLoading = true
      getGoodsList({ type, warehouseId }).then(res => {
        if (res.code === 1) {
          this.goodsList = res.data || []
          this.$message.success(`获取到 ${this.goodsList.length} 条货物`)
        }
      }).finally(() => {
        this.goodsLoading = false
      })
    },
    handleGoodsSelectionChange(selection) {
      this.selectedGoods = selection
    },
    handleSelectTypeChange(val) {
      if (val === 'all') {
        this.$set(this.form, 'warehouseIds', [])
      }
    },
    async saveDraft() {
      await this.doSubmit(4)
    },
    async submitTask() {
      await this.doSubmit(0)
    },
    async doSubmit(submitType) {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        const goodsToSubmit = this.form.selectType === 'all' ? this.selectedGoods : this.goodsList
        if (!goodsToSubmit || goodsToSubmit.length === 0) {
          this.$message.warning('请获取并选择货物清单')
          return
        }
        let payload = {
          taskNum: this.form.taskNum,
          selectType: this.form.selectType,
          submitType,
          remark: this.form.remark,
          goodsList: goodsToSubmit.map(g => ({
            warehouseId: g.warehouseId,
            warehouseName: g.warehouseName,
            containerCode: g.containerCode,
            goodCode: g.goodCode,
            goodName: g.goodName,
            productionUnit: g.productionUnit,
            location: g.location,
            sealCode1: g.sealCode1,
            sealCode2: g.sealCode2,
            storageTime: g.storageTime,
          })),
        }
        if (this.form.selectType === 'selected') {
          const selectedNames = this.warehouseOptions
            .filter(w => (this.form.warehouseIds || []).includes(w.value))
            .map(w => w.label)
          payload.warehouseIds = (this.form.warehouseIds || []).join(',')
          payload.warehouseNames = selectedNames.join(',')
        }
        if (beforeSubmit) payload = await beforeSubmit(payload)
        this.submitting = true
        submitInventory(payload).then(res => {
          if (res.code === 1) {
            this.$message.success(submitType === 4 ? '暂存成功' : '提交成功')
            this.$emit('query')
            this.close()
          }
        }).finally(() => {
          this.submitting = false
        })
      })
    },
    editTask() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        let payload = {
          id: this.form.id,
          taskNum: this.form.taskNum,
          selectType: this.form.selectType,
          remark: this.form.remark,
        }
        if (this.form.selectType === 'selected') {
          const selectedNames = this.warehouseOptions
            .filter(w => (this.form.warehouseIds || []).includes(w.value))
            .map(w => w.label)
          payload.warehouseIds = (this.form.warehouseIds || []).join(',')
          payload.warehouseNames = selectedNames.join(',')
        }
        if (beforeSubmit) payload = await beforeSubmit(payload)
        this.submitting = true
        editInventory(payload).then(res => {
          if (res.code === 1) {
            this.$message.success('编辑成功')
            this.$emit('query')
            this.close()
          }
        }).finally(() => {
          this.submitting = false
        })
      })
    },
    submitResult() {
      // 校验异常项是否填写备注
      for (const warehouse of this.warehouseList) {
        const abnormalItems = (warehouse.goodsList || []).filter(
          g => g.result && g.result !== '0' && !g.resultRemark
        )
        if (abnormalItems.length > 0) {
          this.$message.warning(`库房"${warehouse.warehouseName}"中存在异常项未填写备注`)
          return
        }
      }
      const wareList = this.warehouseList.map(w => ({
        warehouseId: w.warehouseId,
        warehouseName: w.warehouseName,
        goodsList: (w.goodsList || []).map(g => ({
          id: g.id,
          result: g.result || '0',
          resultRemark: g.resultRemark || '',
        })),
      }))
      this.submitting = true
      submitInventoryResult({
        id: this.form.id,
        taskNum: this.form.taskNum,
        wareList,
      }).then(res => {
        if (res.code === 1) {
          this.$message.success('录入结果成功')
          this.$emit('query')
          this.close()
        }
      }).finally(() => {
        this.submitting = false
      })
    },
    handleAudit(approved) {
      if (approved) {
        auditInventory({
          id: this.form.id,
          auditStatus: 1,
          auditRemark: '',
        }).then(res => {
          if (res.code === 1) {
            this.$message.success('审核通过')
            this.$emit('query')
            this.close()
          }
        })
      } else {
        this.rejectRemark = ''
        this.rejectDialogVisible = true
      }
    },
    confirmReject() {
      if (!this.rejectRemark) {
        this.$message.warning('请输入驳回原因')
        return
      }
      auditInventory({
        id: this.form.id,
        auditStatus: 2,
        auditRemark: this.rejectRemark,
      }).then(res => {
        if (res.code === 1) {
          this.$message.success('已驳回')
          this.rejectDialogVisible = false
          this.$emit('query')
          this.close()
        }
      })
    },
    resetForm() {
      this.row = {}
      this.form = {}
      this.goodsList = []
      this.selectedGoods = []
      this.warehouseList = []
      this.activeWarehouses = []
      this.statistics = { totalNormalCount: 0, totalDeficitCount: 0, totalExcessCount: 0 }
      this.initForm()
      this.$refs.form && this.$refs.form.resetFields()
    },
    getResultText(result) {
      const map = { '0': '正常', '1': '盘亏', '2': '盘盈' }
      return map[result] || result || '-'
    },
    getResultClass(result) {
      const map = { '0': 'result-normal', '1': 'result-deficit', '2': 'result-excess' }
      return map[result] || ''
    },
  },
}
</script>

<style lang="scss" scoped>
.form {
  padding: 20px;
  ::v-deep .el-select,
  ::v-deep .el-input__inner {
    width: 100%;
  }
}
.statistics {
  display: flex;
  gap: 24px;
  padding: 0 20px 16px;
  .stat-item {
    .stat-label {
      font-size: 14px;
      color: #606266;
    }
    .stat-value {
      font-size: 16px;
      font-weight: bold;
      &.stat-normal { color: #2e7d32; }
      &.stat-deficit { color: #c62828; }
      &.stat-excess { color: #e68600; }
    }
  }
}
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
.result-normal { color: #2e7d32; }
.result-deficit { color: #c62828; }
.result-excess { color: #e68600; }
</style>
