<template>
  <div>
    <theme-edit :show="show" showFooterSlot :title="titleMap[type]" :column="2" @cancle="close">
      <el-form ref="form" class="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col
            v-for="item in formKeys"
            v-if="judgeRowShow(item)"
            :key="item.prop"
            :span="item.full ? 24 : 12"
          >
            <el-form-item :label="item.label" :prop="item.prop">
              <div class="form-item-content">
                <el-input
                  v-if="judgeInput(item) && item.type !== 'textarea'"
                  v-model="form[item.prop]"
                  :type="item.type || 'text'"
                  size="small"
                  :placeholder="`请输入${item.label}`"
                  clearable
                  :disabled="type === 'view' || item.disabled"
                  @blur="value => changeFormValue(value, item)"
                />
                <el-input
                  v-if="item.type === 'textarea'"
                  v-model="form[item.prop]"
                  type="textarea"
                  :rows="3"
                  size="small"
                  :placeholder="`请输入${item.label}`"
                  clearable
                  :disabled="type === 'view'"
                  @blur="value => changeFormValue(value, item)"
                />
                <el-select
                  v-if="item.type === 'select'"
                  v-model="form[item.prop]"
                  size="small"
                  :placeholder="`请选择${item.label}`"
                  clearable
                  :disabled="type === 'view' || item.disabled"
                  @change="value => changeFormValue(value, item)"
                >
                  <el-option
                    v-for="opt in options[item.prop]"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
                <el-cascader
                  v-if="item.type === 'cascader'"
                  v-model="form[item.prop]"
                  :options="options[item.prop]"
                  size="small"
                  :placeholder="`请选择${item.label}`"
                  :props="item.props || { emitPath: false }"
                  clearable
                  filterable
                  :disabled="type === 'view' || item.disabled"
                  @change="value => changeFormValue(value, item)"
                />
                <el-date-picker
                  v-if="item.type === 'datetime'"
                  v-model="form[item.prop]"
                  type="datetime"
                  size="small"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  :placeholder="`请选择${item.label}`"
                  clearable
                  :disabled="type === 'view'"
                  @change="value => changeFormValue(value, item)"
                />
                <el-button
                  v-if="item.showMaintenance && type !== 'view'"
                  type="primary"
                  icon="el-icon-setting"
                  size="mini"
                  circle
                  class="maintenance-btn"
                  title="维护"
                  @click="openMaintenance"
                />
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="detail-section">
        <div class="detail-header">
          <span class="detail-title">明细信息</span>
          <div class="detail-actions" v-if="type !== 'view'">
            <el-button v-if="type === 'add'" size="small" @click="autoAllocate">自动配置</el-button>
            <el-button size="small" type="primary" @click="openSelectContainer">手工选择</el-button>
          </div>
        </div>
        <el-table :data="detailList" border size="small" max-height="300">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="goodCode" label="材料编码" width="120" show-overflow-tooltip />
          <el-table-column prop="containerCode" label="容器号" width="120" show-overflow-tooltip />
          <el-table-column prop="productionUnit" label="生产单位" width="120" show-overflow-tooltip />
          <el-table-column prop="warehouseName" label="库房" width="100" show-overflow-tooltip />
          <el-table-column label="位置(排-行-列)" width="130" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ getPositionText(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column prop="boxNum" label="货箱号" width="100" show-overflow-tooltip />
          <el-table-column prop="sealCode1" label="封记编码1" width="120" show-overflow-tooltip />
          <el-table-column prop="sealCode2" label="封记编码2" width="120" show-overflow-tooltip />
          <el-table-column label="重量(毛,皮,净)" width="180" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.grossWeight || 0 }}、{{ scope.row.tareWeight || 0 }}、{{ scope.row.netWeight || 0 }}
            </template>
          </el-table-column>
          <el-table-column prop="metalPercentage" label="金属量%" width="100" show-overflow-tooltip />
          <el-table-column v-if="type !== 'view'" label="操作" width="80" fixed="right">
            <template slot-scope="scope">
              <span class="table_operation">
                <span class="btn text" @click="removeDetailRow(scope.$index)">删除</span>
              </span>
            </template>
          </el-table-column>
        </el-table>
        <div class="summary-row">
          合计：{{ detailList.length }}件 总重：{{ totalWeightGross }}、{{ totalWeightTare }}、{{ totalWeightNet }}KG
        </div>
      </div>

      <div class="footer" v-if="type !== 'view'">
        <el-button size="small" @click="close">取消</el-button>
        <el-button v-if="type !== 'modify'" size="small" @click="submitForm(4)">暂存</el-button>
        <el-button type="primary" size="small" @click="submitForm(0)">
          {{ type === 'modify' ? '提交变更审核' : '提交' }}
        </el-button>
      </div>
      <div class="footer" v-else>
        <el-button size="small" @click="close">关闭</el-button>
      </div>
    </theme-edit>

    <allocation-basis-list-dialog ref="basisDialog" @success="handleBasisSuccess" />
    <select-container-dialog ref="selectContainerDialog" @confirm="handleSelectContainerConfirm" />
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { config, requestFun, beforeSubmit, beforeRecurrence } from './index.js'
import AllocationBasisListDialog from '@/views/task/inbound/components/AllocationBasisListDialog.vue'
import SelectContainerDialog from './SelectContainerDialog.vue'
import { getDictionaryList } from '@/api/common/dictionary.js'
import { generateBatchNo } from '@/api/common/batchNo.js'

function formatDefaultDate(value) {
  if (!(value instanceof Date)) return value
  const y = value.getFullYear()
  const m = String(value.getMonth() + 1).padStart(2, '0')
  const d = String(value.getDate()).padStart(2, '0')
  const H = String(value.getHours()).padStart(2, '0')
  const M = String(value.getMinutes()).padStart(2, '0')
  const S = String(value.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${H}:${M}:${S}`
}

export default {
  components: { AllocationBasisListDialog, SelectContainerDialog },
  data() {
    return {
      row: {},
      show: false,
      type: 'add',
      updateType: 0,
      formKeys: [],
      form: {},
      rules: {},
      options: {},
      detailList: [],
      deletedGoodIds: [],
      deletedContainerCodes: [],
    }
  },
  computed: {
    titleMap() {
      return { add: '添加出库任务', edit: '编辑出库任务', view: '出库任务详情', modify: '修改出库任务' }
    },
    totalWeightGross() {
      return this.detailList.reduce((sum, item) => sum + (Number(item.grossWeight) || 0), 0).toFixed(5)
    },
    totalWeightTare() {
      return this.detailList.reduce((sum, item) => sum + (Number(item.tareWeight) || 0), 0).toFixed(5)
    },
    totalWeightNet() {
      return this.detailList.reduce((sum, item) => sum + (Number(item.netWeight) || 0), 0).toFixed(5)
    },
  },
  created() {
    this.handleParams()
  },
  methods: {
    open(row, updateType = 0, mode) {
      this.row = row || {}
      this.updateType = updateType
      this.deletedGoodIds = []
      this.deletedContainerCodes = []
      this.resetFormValues()
      if (this.row.id) {
        this.type = mode || 'edit'
        this.getDetails(this.row.id).then(() => {
          const transferItem = this.formKeys.find(i => i.prop === '_transferSelected')
          if (transferItem) this.$set(transferItem, 'disabled', this.type !== 'add')
          this.refreshOptions()
          this.show = true
          this.$nextTick(() => {
            setTimeout(() => {
              if (beforeRecurrence) beforeRecurrence(this.form, this)
            }, 300)
          })
        })
      } else {
        this.type = 'add'
        const transferItem = this.formKeys.find(i => i.prop === '_transferSelected')
        if (transferItem) this.$set(transferItem, 'disabled', false)
        this.detailList = []
        this.refreshOptions()
        this.show = true
        generateBatchNo({ batchType: 'outbound', prefix: 'CK' }).then(res => {
          if (res.code === 1) this.$set(this.form, 'taskNum', res.data)
        })
      }
    },
    close() {
      this.resetForm()
      this.$nextTick(() => {
        this.show = false
      })
    },
    getDetails(id) {
      return requestFun.detail(id).then(res => {
        const data = (res.data && res.data.operation) || res.data || {}
        config.detail.forEach(item => {
          if (data[item.prop] !== undefined && data[item.prop] !== null) {
            this.$set(this.form, item.prop, data[item.prop])
          }
        })
        if (data.transferId) this.$set(this.form, 'transferId', data.transferId)
        if (data.goodCodes) this.$set(this.form, 'goodCodes', data.goodCodes)
        if (data.securityLevel) this.$set(this.form, 'securityLevel', String(data.securityLevel))
        this.detailList = ((res.data && res.data.goodsList) || data.goodsList || data.details || []).map(this.normalizeGoods)
        return data
      })
    },
    async submitForm(submitType) {
      let payload = this.buildSubmitPayload(submitType)
      this.$refs.form.validate(async valid => {
        if (!valid) return false
        if (!this.detailList.length) {
          this.$message.warning('请选择出库容器')
          return
        }
        if (beforeSubmit) payload = await beforeSubmit(payload)
        const submitMethod = (this.type === 'edit' || this.type === 'modify') ? requestFun.update : requestFun.submit
        submitMethod(payload).then(res => {
          if (res.code === 1) {
            this.$message.success('操作成功')
            this.$emit('query')
            this.close()
          }
        })
      })
    },
    buildSubmitPayload(submitType) {
      const payload = deepClone(this.form)
      const goodsList = this.detailList.map(this.normalizeGoods)
      if (this.row.id) {
        payload.id = this.row.id
        payload.updateType = this.updateType
        payload.submitType = submitType
        payload.dtoList = goodsList.filter(item => !item.id)
        payload.editList = goodsList.filter(item => item.id)
        payload.goodIds = this.deletedGoodIds.join(',')
        payload.containerCodes = this.deletedContainerCodes.join(',')
      } else {
        payload.submitType = submitType
        payload.goodsList = goodsList
      }
      return payload
    },
    resetFormValues() {
      config.detail.forEach(item => {
        const value = item.defaultValue !== undefined ? formatDefaultDate(item.defaultValue) : ''
        this.$set(this.form, item.prop, value)
      })
    },
    resetForm() {
      this.row = {}
      this.resetFormValues()
      this.detailList = []
      this.deletedGoodIds = []
      this.deletedContainerCodes = []
      this.$refs.form && this.$refs.form.resetFields()
    },
    handleParams() {
      config.detail.forEach(item => {
        this.formKeys.push(item)
        const value = item.defaultValue !== undefined ? formatDefaultDate(item.defaultValue) : ''
        this.$set(this.form, item.prop, value)
        if (item.option || item.dictParentId) this.getOptions(item)
        if (item.required) {
          const isInput = this.judgeInput(item)
          this.$set(this.rules, item.prop, [{
            required: true,
            message: `请${isInput ? '输入' : '选择'}${item.label}`,
            trigger: isInput ? 'blur' : 'change',
          }])
        }
      })
    },
    refreshOptions() {
      this.formKeys.forEach(item => {
        if (item.option || item.dictParentId) this.getOptions(item)
      })
    },
    getOptions(item) {
      if (item.dictParentId) {
        getDictionaryList({ parentId: item.dictParentId, currentPage: 1, pageSize: 999 }).then(res => {
          if (res.code === 1) {
            this.$set(this.options, item.prop, (res.data.list || []).map(i => ({
              label: i.fullName,
              value: i.dictValue,
            })))
          }
        })
      } else if (item.option) {
        const result = typeof item.option === 'function' ? item.option() : item.option
        if (result && typeof result.then === 'function') {
          result.then(data => {
            const ary = Array.isArray(data) ? data : (data.data ? (Array.isArray(data.data) ? data.data : data.data.list) : [])
            this.$set(this.options, item.prop, ary || [])
          })
        } else {
          this.$set(this.options, item.prop, result || [])
        }
      }
    },
    changeFormValue(value, item) {
      if (item.change && typeof item.change === 'function') item.change(value, this.form, this)
    },
    judgeInput(row) {
      return !row.type || row.type === 'text' || row.type === 'textarea'
    },
    judgeRowShow(item) {
      let handle
      if (this.type === 'add') handle = item.isAdd
      else if (this.type === 'edit') handle = item.isUpdate
      else if (this.type === 'view') handle = item.isView
      if (typeof handle === 'function') return handle(this.form)
      if (typeof handle === 'boolean') return handle
      return true
    },
    openMaintenance() {
      this.$refs.basisDialog.open()
    },
    handleBasisSuccess() {
      const item = this.formKeys.find(i => i.prop === '_transferSelected')
      if (item) this.getOptions(item)
    },
    openSelectContainer() {
      this.$refs.selectContainerDialog.open(this.detailList)
    },
    handleSelectContainerConfirm(list) {
      this.detailList = (list || []).map(this.normalizeGoods)
    },
    normalizeGoods(row = {}) {
      return {
        ...row,
        id: row.id || '',
        taskNum: row.taskNum || '',
        containerCode: row.containerCode || row.containerNo || '',
        goodCode: row.goodCode || row.materialCode || '',
        warehouseId: row.warehouseId || '',
        warehouseName: row.warehouseName || row.warehouse || '',
        boxNum: row.boxNum || row.cargoBoxNo || '',
        grossWeight: row.grossWeight || row.weightGross || '',
        netWeight: row.netWeight || row.weightNet || '',
        tareWeight: row.tareWeight || row.weightTare || '',
        metalPercentage: row.metalPercentage || '',
        productionUnit: row.productionUnit || '',
        shelfCode: row.shelfCode || '',
        rowCode: row.rowCode || '',
        columnCode: row.columnCode || '',
        sealCode1: row.sealCode1 || '',
        sealCode2: row.sealCode2 || '',
        sealType1: row.sealType1 || '',
        sealType2: row.sealType2 || '',
      }
    },
    getPositionText(row) {
      const values = [row.shelfCode, row.rowCode, row.columnCode].filter(Boolean)
      return values.length ? values.join('-') : '-'
    },
    removeDetailRow(index) {
      this.$confirm('确定要删除该明细?', '提示', { type: 'warning' }).then(() => {
        const removed = this.detailList.splice(index, 1)[0]
        if (removed && removed.id) this.deletedGoodIds.push(removed.id)
        if (removed && removed.containerCode) this.deletedContainerCodes.push(removed.containerCode)
      })
    },
    autoAllocate() {
      this.$message.info('自动配置位置功能')
    },
  },
}
</script>

<style lang="scss" scoped>
.form {
  padding: 20px;

  .form-item-content {
    display: flex;
    align-items: center;

    .maintenance-btn {
      margin-left: 8px;
      flex-shrink: 0;
    }
  }

  ::v-deep .el-cascader,
  ::v-deep .el-select,
  ::v-deep .el-input__inner {
    width: 100%;
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

  .summary-row {
    margin-top: 10px;
    text-align: right;
    font-size: 14px;
    color: #1b2129;
    font-weight: bold;
  }
}

.footer {
  padding: 12px 32px 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #c4c9cf;
}

.table_operation {
  .btn {
    cursor: pointer;

    &.text {
      color: #246fe5;
    }
  }
}

</style>
