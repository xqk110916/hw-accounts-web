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
            <el-form-item :label="item.label" :prop="item.prop" :class="{ 'modified-field': type === 'audit' && isFieldModified(item.prop) }">
              <template v-if="type !== 'audit'">
                <el-input
                  v-if="judgeInput(item) && item.type !== 'textarea'"
                  v-model="form[item.prop]"
                  :type="item.type || 'text'"
                  size="small"
                  :placeholder="`请输入${item.label}`"
                  clearable
                  :disabled="isReadonlyMode || item.disabled"
                />
                <el-input
                  v-if="item.type === 'textarea'"
                  v-model="form[item.prop]"
                  type="textarea"
                  :rows="3"
                  size="small"
                  :placeholder="`请输入${item.label}`"
                  clearable
                  :disabled="isReadonlyMode"
                />
                <el-date-picker
                  v-if="item.type === 'datetime'"
                  v-model="form[item.prop]"
                  type="datetime"
                  size="small"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  :placeholder="`请选择${item.label}`"
                  clearable
                  :disabled="isReadonlyMode"
                />
              </template>
              <template v-else>
                <div class="audit-text-display" :class="{ 'is-textarea': item.type === 'textarea' }">
                  <span class="original-text" :class="{ 'is-deleted': isFieldModified(item.prop) }">
                    {{ getDisplayValue(item) }}
                  </span>
                  <template v-if="isFieldModified(item.prop)">
                    <div v-if="item.type === 'textarea'" class="modify-text-block">
                      <span class="modify-badge"><i class="el-icon-edit"></i> 修改为：{{ getModifiedDisplayValue(item.prop) }}</span>
                    </div>
                    <span v-else class="modify-badge"><i class="el-icon-edit"></i> 改：{{ getModifiedDisplayValue(item.prop) }}</span>
                  </template>
                </div>
              </template>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="detail-section" v-if="type === 'audit' && modifyDescList.length">
        <div class="detail-header">
          <span class="detail-title">修改内容</span>
        </div>
        <div class="modify-desc-list">
          <div v-for="(desc, index) in modifyDescList" :key="index" class="modify-desc-item">
            {{ index + 1 }}. {{ desc }}
          </div>
        </div>
      </div>

      <div class="detail-section" v-if="type === 'view' && modifyRecords.length">
        <div class="detail-header">
          <span class="detail-title">变更记录</span>
        </div>
        <div class="change-record-list">
          <div v-for="record in modifyRecords" :key="record.id" class="change-record-item">
            <div class="change-record-head">
              <div class="change-record-meta">
                <el-tag size="mini" :type="getModifyRecordTagType(record.status)">
                  {{ record.statusDesc || getModifyRecordStatusText(record.status) }}
                </el-tag>
                <span>申请人：{{ record.createUname || '-' }}</span>
                <span>申请时间：{{ record.createTime || '-' }}</span>
                <span v-if="record.auditUserName">审核人：{{ record.auditUserName }}</span>
                <span v-if="record.auditTime">审核时间：{{ record.auditTime }}</span>
                <span v-if="getModifyRecordAuditRemark(record)">驳回原因：{{ getModifyRecordAuditRemark(record) }}</span>
              </div>
              <el-button v-if="Number(record.status) === 7" type="text" size="mini" @click="cancelModifyRecord(record)">
                撤回
              </el-button>
            </div>
            <div class="change-record-desc">
              <div
                v-for="(desc, descIndex) in getModifyRecordDescList(record)"
                :key="descIndex"
                class="change-record-desc-item"
              >
                {{ descIndex + 1 }}. {{ desc }}
              </div>
              <span v-if="!getModifyRecordDescList(record).length" class="empty-desc">暂无变更说明</span>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-header">
          <span class="detail-title">移库明细</span>
          <div class="detail-actions" v-if="!isReadonlyMode">
            <el-button size="small" type="primary" @click="addDetailRow">新增明细</el-button>
          </div>
        </div>
        <el-table :data="detailList" border size="small" max-height="330">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="taskNum" label="入库任务编号" width="140" show-overflow-tooltip />
          <el-table-column prop="containerCode" label="容器号" width="130" show-overflow-tooltip />
          <el-table-column prop="goodCode" label="材料编码" width="120" show-overflow-tooltip />
          <el-table-column prop="productionUnit" label="生产单位" width="120" show-overflow-tooltip />
          <el-table-column prop="sourceWarehouse" label="原库房" width="120" show-overflow-tooltip />
          <el-table-column label="原位置" width="130" show-overflow-tooltip>
            <template slot-scope="scope">{{ getSourcePositionText(scope.row) }}</template>
          </el-table-column>
          <el-table-column prop="targetWarehouse" label="目标库房" width="120" show-overflow-tooltip />
          <el-table-column label="目标位置" width="130" show-overflow-tooltip>
            <template slot-scope="scope">{{ getTargetPositionText(scope.row) }}</template>
          </el-table-column>
          <el-table-column label="重量(毛,皮,净)" width="170" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.grossWeight || 0 }}、{{ scope.row.tareWeight || 0 }}、{{ scope.row.netWeight || 0 }}
            </template>
          </el-table-column>
          <el-table-column prop="sealCode1" label="封记编码1" width="120" show-overflow-tooltip />
          <el-table-column prop="sealCode2" label="封记编码2" width="120" show-overflow-tooltip />
          <el-table-column v-if="!isReadonlyMode" label="操作" width="120" fixed="right">
            <template slot-scope="scope">
              <span class="table_operation">
                <span v-if="type !== 'modify'" class="btn text" @click="editDetailRow(scope.row, scope.$index)">编辑</span>
                <span class="btn text danger" @click="removeDetailRow(scope.$index)">删除</span>
              </span>
            </template>
          </el-table-column>
        </el-table>
        <div class="summary-row">
          合计：{{ detailList.length }}件 总重：{{ totalWeightGross }}、{{ totalWeightTare }}、{{ totalWeightNet }}KG
        </div>
      </div>

      <template slot="footer">
        <div class="footer" v-if="type === 'audit'">
          <el-button size="small" @click="close">取消</el-button>
          <el-button type="danger" size="small" @click="handleAuditReject">不同意</el-button>
          <el-button type="primary" size="small" @click="handleAuditApprove">同意</el-button>
        </div>
        <div class="footer" v-else-if="type !== 'view'">
          <el-button size="small" @click="close">取消</el-button>
          <el-button v-if="type !== 'modify'" size="small" @click="submitForm(4)">暂存</el-button>
          <el-button type="primary" size="small" @click="submitForm(0)">
            {{ type === 'modify' ? '提交变更审核' : '提交' }}
          </el-button>
        </div>
        <div class="footer" v-else>
          <el-button size="small" @click="close">关闭</el-button>
        </div>
      </template>
    </theme-edit>

    <el-dialog
      :close-on-click-modal="false"
      title="明细编辑"
      custom-class="show-footer-dialog"
      :visible.sync="detailEditVisible"
      width="680px"
      append-to-body
    >
      <el-form ref="detailForm" :model="detailEditForm" label-width="120px" :rules="detailRules">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="原库房" prop="sourceWarehouseId">
              <el-select
                v-model="detailEditForm.sourceWarehouseId"
                size="small"
                placeholder="请选择原库房"
                clearable
                filterable
                @change="handleSourceWarehouseChange"
              >
                <el-option
                  v-for="warehouse in warehouseOptions"
                  :key="warehouse.id"
                  :label="warehouse.warehouseName || warehouse.nodeName"
                  :value="warehouse.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="原位置" prop="sourcePositionId">
              <el-select
                v-model="detailEditForm.sourcePositionId"
                size="small"
                placeholder="请选择原位置"
                clearable
                filterable
                :disabled="!detailEditForm.sourceWarehouseId"
                :loading="sourcePositionLoading"
                @change="handleSourcePositionChange"
              >
                <el-option
                  v-for="position in sourcePositionOptions"
                  :key="position.id"
                  :label="formatPositionLabel(position)"
                  :value="position.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标库房" prop="targetWarehouseId">
              <el-select
                v-model="detailEditForm.targetWarehouseId"
                size="small"
                placeholder="请选择目标库房"
                clearable
                filterable
                @change="handleTargetWarehouseChange"
              >
                <el-option
                  v-for="warehouse in warehouseOptions"
                  :key="warehouse.id"
                  :label="warehouse.warehouseName || warehouse.nodeName"
                  :value="warehouse.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标位置" prop="targetPositionId">
              <el-select
                v-model="detailEditForm.targetPositionId"
                size="small"
                placeholder="请选择目标位置"
                clearable
                filterable
                :disabled="!detailEditForm.targetWarehouseId"
                :loading="targetPositionLoading"
                @change="handleTargetPositionChange"
              >
                <el-option
                  v-for="position in targetPositionOptions"
                  :key="position.id"
                  :label="formatPositionLabel(position)"
                  :value="position.id"
                  :disabled="Number(position.status) !== 0"
                >
                  <span>{{ formatPositionLabel(position) }}</span>
                  <span v-if="Number(position.status) !== 0" style="color: #999; margin-left: 8px;">
                    ({{ Number(position.status) === 1 ? '占用' : '锁定' }})
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <table class="detail-preview-table">
          <tr>
            <td class="label">入库任务编号</td>
            <td>{{ detailEditForm.taskNum || '-' }}</td>
            <td class="label">容器号</td>
            <td>{{ detailEditForm.containerCode || '-' }}</td>
          </tr>
          <tr>
            <td class="label">材料编码</td>
            <td>{{ detailEditForm.goodCode || '-' }}</td>
            <td class="label">生产单位</td>
            <td>{{ detailEditForm.productionUnit || '-' }}</td>
          </tr>
          <tr>
            <td class="label">重量(毛/皮/净)</td>
            <td>{{ detailEditForm.grossWeight || 0 }} / {{ detailEditForm.tareWeight || 0 }} / {{ detailEditForm.netWeight || 0 }}</td>
            <td class="label">封记</td>
            <td>{{ [detailEditForm.sealCode1, detailEditForm.sealCode2].filter(Boolean).join('、') || '-' }}</td>
          </tr>
        </table>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="detailEditVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="submitDetailForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { config, requestFun, beforeSubmit } from './index.js'
import { cancelMoveApply, confirmMove, executeAuditedMove, getLocationHierarchy, getPositionMap } from './api.js'
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

function getDefaultFormValue(item) {
  if (item.defaultValue === undefined) return ''
  const value = typeof item.defaultValue === 'function' ? item.defaultValue() : item.defaultValue
  if (Array.isArray(value)) return []
  const formattedValue = formatDefaultDate(value)
  if (formattedValue && typeof formattedValue === 'object') return { ...formattedValue }
  return formattedValue
}

function valueOrEmpty(value) {
  return value === null || value === undefined ? '' : value
}

export default {
  data() {
    return {
      row: {},
      show: false,
      type: 'add',
      updateType: 0,
      formKeys: [],
      form: {},
      rules: {},
      detailList: [],
      originalDetailList: [],
      modifyRecords: [],
      detailEditVisible: false,
      detailEditIndex: -1,
      detailEditForm: {},
      detailRules: {
        sourceWarehouseId: [{ required: true, message: '请选择原库房', trigger: 'change' }],
        sourcePositionId: [{ required: true, message: '请选择原位置', trigger: 'change' }],
        targetWarehouseId: [{ required: true, message: '请选择目标库房', trigger: 'change' }],
        targetPositionId: [{ required: true, message: '请选择目标位置', trigger: 'change' }],
      },
      warehouseOptions: [],
      sourcePositionOptions: [],
      targetPositionOptions: [],
      sourcePositionLoading: false,
      targetPositionLoading: false,
    }
  },
  computed: {
    titleMap() {
      return { add: '添加位置移动', edit: '编辑位置移动', view: '位置移动详情', modify: '修改位置移动', audit: '审核位置移动' }
    },
    isReadonlyMode() {
      return this.type === 'view' || this.type === 'audit'
    },
    modifyDescList() {
      const record = (this.modifyRecords && this.modifyRecords[0]) || {}
      return (record.modifyDescList || []).filter(Boolean)
    },
    modifiedFieldMap() {
      if (!this.modifyRecords || !this.modifyRecords.length) return {}
      try {
        const record = this.modifyRecords[0]
        const before = JSON.parse(record.beforeData || '{}')
        const after = JSON.parse(record.afterData || '{}')
        const apiToFormProp = {
          taskNum: 'taskNum',
          moveTaskNum: 'taskNum',
          executor: 'executor',
          moveTime: 'moveTime',
          remark: 'remark',
        }
        const map = {}
        Object.keys(apiToFormProp).forEach(apiField => {
          const formProp = apiToFormProp[apiField]
          const beforeVal = before[apiField] === undefined || before[apiField] === null ? '' : String(before[apiField])
          const afterVal = after[apiField] === undefined || after[apiField] === null ? '' : String(after[apiField])
          if (beforeVal !== afterVal) map[formProp] = { before: before[apiField], after: after[apiField] }
        })
        return map
      } catch (error) {
        console.error('解析移库修改记录失败', error)
        return {}
      }
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
    this.loadWarehouseOptions()
  },
  methods: {
    open(row, updateType = 0, mode) {
      this.row = row || {}
      this.updateType = updateType
      this.modifyRecords = []
      this.originalDetailList = []
      this.resetFormValues()
      if (this.row.id) {
        this.type = mode || 'edit'
        this.ensureWarehouseOptions().then(() => this.getDetails(this.row.id)).then(() => {
          this.show = true
        })
      } else {
        this.type = 'add'
        this.detailList = []
        this.originalDetailList = []
        this.ensureWarehouseOptions()
        this.show = true
        generateBatchNo({ batchType: 2 }).then(res => {
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
        const data = res.data || {}
        const operation = data.operation || {}
        config.detail.forEach(item => {
          const apiProp = item.prop === 'taskNum' ? 'moveTaskNum' : item.prop
          const value = operation[apiProp] !== undefined && operation[apiProp] !== null ? operation[apiProp] : operation[item.prop]
          if (value !== undefined && value !== null) this.$set(this.form, item.prop, value)
        })
        this.detailList = (data.goodsList || []).map(this.normalizeMoveGoods)
        this.originalDetailList = deepClone(this.detailList)
        this.modifyRecords = data.modifyRecords || []
        return data
      })
    },
    async submitForm(submitType) {
      let payload = this.buildSubmitPayload(submitType)
      this.$refs.form.validate(async valid => {
        if (!valid) return false
        if (!this.detailList.length) {
          this.$message.warning('请添加移库明细')
          return
        }
        if (this.hasSameSourceTarget()) {
          this.$message.warning('存在原位置与目标位置相同的明细，请检查后重新选择')
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
      const goodsList = this.detailList.map(this.buildMoveGoodsPayload)
      if (this.row.id) {
        const { dtoList, editList, goodIds, containerCodes } = this.buildUpdateDetailPayload(goodsList)
        payload.id = this.row.id
        payload.updateType = this.updateType
        if (this.updateType === 0) payload.submitType = submitType
        payload.dtoList = dtoList
        payload.editList = editList
        payload.goodIds = goodIds
        payload.containerCodes = containerCodes
      } else {
        payload.saveType = submitType
        payload.goodsList = goodsList
      }
      return payload
    },
    buildMoveGoodsPayload(row = {}) {
      const payload = {
        containerCode: row.containerCode,
        goodCode: row.goodCode,
        productionUnit: row.productionUnit,
        goodsWeight: row.goodsWeight,
        grossWeight: row.grossWeight,
        netWeight: row.netWeight,
        tareWeight: row.tareWeight,
        sealCode1: row.sealCode1,
        sealCode2: row.sealCode2,
        sealType1: row.sealType1,
        sealType2: row.sealType2,
        taskNum: row.taskNum,
        sourceWarehouse: row.sourceWarehouse,
        sourceShelf: row.sourceShelf,
        sourceRow: row.sourceRow,
        sourceColumn: row.sourceColumn,
        targetWarehouse: row.targetWarehouse,
        targetShelf: row.targetShelf,
        targetRow: row.targetRow,
        targetColumn: row.targetColumn,
      }
      if (row.id) payload.id = row.id
      return payload
    },
    resetFormValues() {
      config.detail.forEach(item => {
        this.$set(this.form, item.prop, getDefaultFormValue(item))
      })
    },
    resetForm() {
      this.row = {}
      this.resetFormValues()
      this.detailList = []
      this.originalDetailList = []
      this.modifyRecords = []
      this.detailEditVisible = false
      this.$refs.form && this.$refs.form.clearValidate()
    },
    handleParams() {
      config.detail.forEach(item => {
        this.formKeys.push(item)
        this.$set(this.form, item.prop, getDefaultFormValue(item))
        if (item.required) {
          this.$set(this.rules, item.prop, [{
            required: true,
            message: `请${this.judgeInput(item) ? '输入' : '选择'}${item.label}`,
            trigger: this.judgeInput(item) ? 'blur' : 'change',
          }])
        }
      })
    },
    judgeInput(row) {
      return !row.type || row.type === 'text' || row.type === 'textarea'
    },
    judgeRowShow(item) {
      return item && item.prop
    },
    getDisplayValue(item) {
      const value = this.form[item.prop]
      return value === undefined || value === null || value === '' ? '-' : value
    },
    isFieldModified(prop) {
      return !!this.modifiedFieldMap[prop]
    },
    getModifiedDisplayValue(prop) {
      const info = this.modifiedFieldMap[prop]
      if (!info) return ''
      const value = info.after
      return value === undefined || value === null || value === '' ? '-' : String(value)
    },
    async loadWarehouseOptions() {
      const res = await getLocationHierarchy(2)
      this.warehouseOptions = res.data || []
    },
    ensureWarehouseOptions() {
      if (this.warehouseOptions.length) return Promise.resolve(this.warehouseOptions)
      return this.loadWarehouseOptions().then(() => this.warehouseOptions)
    },
    getWarehouseName(warehouseId) {
      const warehouse = this.warehouseOptions.find(item => String(item.id) === String(warehouseId)) || {}
      return warehouse.warehouseName || warehouse.nodeName || ''
    },
    normalizePositionOption(item = {}) {
      const inboundGoods = item.inboundGoodsEntity || {}
      return {
        ...item,
        id: item.id || item.positionId || item.hierarchyId || item.columnId,
        status: Number(item.status == null ? 0 : item.status),
        taskNum: inboundGoods.taskNum || item.taskNum || '',
        containerCode: inboundGoods.containerCode || item.containerCode || item.containerNo || item.code || '',
        goodCode: inboundGoods.goodCode || inboundGoods.goodsCode || item.goodCode || item.goodsCode || item.materialCode || '',
        productionUnit: inboundGoods.productionUnit || item.productionUnit || '',
        goodsWeight: valueOrEmpty(inboundGoods.goodsWeight || item.goodsWeight),
        grossWeight: valueOrEmpty(inboundGoods.grossWeight || item.grossWeight),
        tareWeight: valueOrEmpty(inboundGoods.tareWeight || item.tareWeight),
        netWeight: valueOrEmpty(inboundGoods.netWeight || item.netWeight),
        sealCode1: inboundGoods.sealCode1 || item.sealCode1 || '',
        sealCode2: inboundGoods.sealCode2 || item.sealCode2 || '',
        sealType1: inboundGoods.sealType1 || item.sealType1 || '',
        sealType2: inboundGoods.sealType2 || item.sealType2 || '',
      }
    },
    async loadSourcePositions(warehouseId) {
      this.sourcePositionLoading = true
      try {
        const res = await getPositionMap({ nodeId: warehouseId, nodeType: '2' })
        this.sourcePositionOptions = (res.data || [])
          .map(this.normalizePositionOption)
          .filter(item => Number(item.status) === 1 && item.containerCode)
      } finally {
        this.sourcePositionLoading = false
      }
    },
    async loadTargetPositions(warehouseId) {
      this.targetPositionLoading = true
      try {
        const res = await getPositionMap({ nodeId: warehouseId, nodeType: '2' })
        this.targetPositionOptions = (res.data || []).map(this.normalizePositionOption)
      } finally {
        this.targetPositionLoading = false
      }
    },
    handleSourceWarehouseChange(warehouseId) {
      this.detailEditForm.sourcePositionId = ''
      this.sourcePositionOptions = []
      this.detailEditForm.sourceWarehouse = this.getWarehouseName(warehouseId)
      this.clearSourceGoodsFields()
      if (warehouseId) this.loadSourcePositions(warehouseId)
    },
    handleTargetWarehouseChange(warehouseId) {
      this.detailEditForm.targetPositionId = ''
      this.targetPositionOptions = []
      this.detailEditForm.targetWarehouse = this.getWarehouseName(warehouseId)
      this.detailEditForm.targetShelf = ''
      this.detailEditForm.targetRow = ''
      this.detailEditForm.targetColumn = ''
      if (warehouseId) this.loadTargetPositions(warehouseId)
    },
    handleSourcePositionChange(positionId) {
      const pos = this.sourcePositionOptions.find(item => String(item.id) === String(positionId))
      if (!pos) return
      Object.assign(this.detailEditForm, {
        taskNum: pos.taskNum || '',
        containerCode: pos.containerCode || '',
        goodCode: pos.goodCode || '',
        productionUnit: pos.productionUnit || '',
        goodsWeight: pos.goodsWeight || '',
        grossWeight: pos.grossWeight || '',
        tareWeight: pos.tareWeight || '',
        netWeight: pos.netWeight || '',
        sealCode1: pos.sealCode1 || '',
        sealCode2: pos.sealCode2 || '',
        sealType1: pos.sealType1 || '',
        sealType2: pos.sealType2 || '',
        sourceShelf: pos.shelfCode || '',
        sourceRow: pos.rowCode || '',
        sourceColumn: pos.columnCode || '',
      })
    },
    handleTargetPositionChange(positionId) {
      const pos = this.targetPositionOptions.find(item => String(item.id) === String(positionId))
      if (!pos) return
      Object.assign(this.detailEditForm, {
        targetShelf: pos.shelfCode || '',
        targetRow: pos.rowCode || '',
        targetColumn: pos.columnCode || '',
      })
    },
    clearSourceGoodsFields() {
      Object.assign(this.detailEditForm, {
        taskNum: '',
        containerCode: '',
        goodCode: '',
        productionUnit: '',
        goodsWeight: '',
        grossWeight: '',
        tareWeight: '',
        netWeight: '',
        sealCode1: '',
        sealCode2: '',
        sealType1: '',
        sealType2: '',
        sourceShelf: '',
        sourceRow: '',
        sourceColumn: '',
      })
    },
    getDefaultDetailEditForm() {
      return {
        id: '',
        sourceWarehouseId: '',
        sourcePositionId: '',
        targetWarehouseId: '',
        targetPositionId: '',
        taskNum: '',
        containerCode: '',
        goodCode: '',
        productionUnit: '',
        goodsWeight: '',
        grossWeight: '',
        tareWeight: '',
        netWeight: '',
        sealCode1: '',
        sealCode2: '',
        sealType1: '',
        sealType2: '',
        sourceWarehouse: '',
        sourceShelf: '',
        sourceRow: '',
        sourceColumn: '',
        targetWarehouse: '',
        targetShelf: '',
        targetRow: '',
        targetColumn: '',
      }
    },
    addDetailRow() {
      this.detailEditIndex = -1
      this.detailEditForm = this.getDefaultDetailEditForm()
      this.sourcePositionOptions = []
      this.targetPositionOptions = []
      this.detailEditVisible = true
      this.$nextTick(() => {
        this.$refs.detailForm && this.$refs.detailForm.clearValidate()
      })
    },
    editDetailRow(row, index) {
      this.detailEditIndex = index
      this.detailEditForm = { ...this.getDefaultDetailEditForm(), ...deepClone(row) }
      this.sourcePositionOptions = []
      this.targetPositionOptions = []
      this.detailEditVisible = true
      if (this.detailEditForm.sourceWarehouseId) {
        this.loadSourcePositions(this.detailEditForm.sourceWarehouseId).then(() => this.matchDetailPosition('source'))
      }
      if (this.detailEditForm.targetWarehouseId) {
        this.loadTargetPositions(this.detailEditForm.targetWarehouseId).then(() => this.matchDetailPosition('target'))
      }
      this.$nextTick(() => {
        this.$refs.detailForm && this.$refs.detailForm.clearValidate()
      })
    },
    submitDetailForm() {
      this.$refs.detailForm.validate(valid => {
        if (!valid) return
        if (!this.detailEditForm.containerCode) {
          this.$message.warning('原位置没有可移动容器')
          return
        }
        const current = this.normalizeMoveGoods(this.detailEditForm)
        if (this.isSamePosition(current)) {
          this.$message.warning('目标位置不能与原位置相同')
          return
        }
        const duplicated = this.detailList.some((item, index) => {
          if (index === this.detailEditIndex) return false
          return item.containerCode && item.containerCode === current.containerCode
        })
        if (duplicated) {
          this.$message.warning('该容器已在明细中')
          return
        }
        if (this.detailEditIndex >= 0) this.$set(this.detailList, this.detailEditIndex, current)
        else this.detailList.push(current)
        this.detailEditVisible = false
      })
    },
    removeDetailRow(index) {
      this.$confirm('确定要删除该明细?', '提示', { type: 'warning' }).then(() => {
        this.detailList.splice(index, 1)
      }).catch(() => {})
    },
    normalizeMoveGoods(row = {}) {
      const sourceWarehouseId = row.sourceWarehouseId || this.findWarehouseId(row.sourceWarehouse)
      const targetWarehouseId = row.targetWarehouseId || this.findWarehouseId(row.targetWarehouse)
      return {
        ...row,
        id: row.id || '',
        sourceWarehouseId,
        targetWarehouseId,
        sourcePositionId: row.sourcePositionId || row.sourceId || '',
        targetPositionId: row.targetPositionId || row.targetId || '',
        taskNum: row.taskNum || '',
        containerCode: row.containerCode || row.containerNo || '',
        goodCode: row.goodCode || row.materialCode || '',
        productionUnit: row.productionUnit || '',
        goodsWeight: row.goodsWeight || '',
        grossWeight: row.grossWeight || '',
        netWeight: row.netWeight || '',
        tareWeight: row.tareWeight || '',
        sealCode1: row.sealCode1 || '',
        sealCode2: row.sealCode2 || '',
        sealType1: row.sealType1 || '',
        sealType2: row.sealType2 || '',
        sourceWarehouse: row.sourceWarehouse || '',
        sourceShelf: row.sourceShelf || '',
        sourceRow: row.sourceRow || '',
        sourceColumn: row.sourceColumn || '',
        targetWarehouse: row.targetWarehouse || '',
        targetShelf: row.targetShelf || '',
        targetRow: row.targetRow || '',
        targetColumn: row.targetColumn || '',
      }
    },
    matchDetailPosition(type) {
      const prefix = type === 'source' ? 'source' : 'target'
      const options = type === 'source' ? this.sourcePositionOptions : this.targetPositionOptions
      const idProp = `${prefix}PositionId`
      if (this.detailEditForm[idProp]) return
      const shelf = this.detailEditForm[`${prefix}Shelf`]
      const row = this.detailEditForm[`${prefix}Row`]
      const column = this.detailEditForm[`${prefix}Column`]
      const hit = (options || []).find(item =>
        String(item.shelfCode) === String(shelf) &&
        String(item.rowCode) === String(row) &&
        String(item.columnCode) === String(column)
      )
      if (hit) this.$set(this.detailEditForm, idProp, hit.id)
      else if (shelf || row || column) this.$set(this.detailEditForm, idProp, `${prefix}:${[shelf, row, column].join('-')}`)
    },
    findWarehouseId(warehouseName) {
      const hit = this.warehouseOptions.find(item => (item.warehouseName || item.nodeName) === warehouseName)
      return hit ? hit.id : ''
    },
    getDetailIdentity(row = {}) {
      if (row.id) return `id:${row.id}`
      if (row.containerCode) return `container:${row.containerCode}`
      return ''
    },
    buildUpdateDetailPayload(goodsList) {
      const originalList = (this.originalDetailList || []).map(this.buildMoveGoodsPayload)
      const originalIdentitySet = new Set(originalList.map(this.getDetailIdentity).filter(Boolean))
      const currentIdentitySet = new Set(goodsList.map(this.getDetailIdentity).filter(Boolean))
      const dtoList = goodsList.filter(item => !originalIdentitySet.has(this.getDetailIdentity(item)))
      const deletedList = originalList.filter(item => !currentIdentitySet.has(this.getDetailIdentity(item)))
      return {
        dtoList,
        editList: [],
        goodIds: this.uniqueJoin(deletedList.map(item => item.id)),
        containerCodes: this.uniqueJoin(deletedList.map(item => item.containerCode)),
      }
    },
    uniqueJoin(list) {
      return Array.from(new Set((list || []).filter(value => value !== undefined && value !== null && value !== ''))).join(',')
    },
    hasSameSourceTarget() {
      return this.detailList.some(item => this.isSamePosition(item))
    },
    isSamePosition(row = {}) {
      return row.sourceWarehouse === row.targetWarehouse &&
        row.sourceShelf === row.targetShelf &&
        row.sourceRow === row.targetRow &&
        row.sourceColumn === row.targetColumn
    },
    formatPositionLabel(position = {}) {
      return [position.shelfCode, position.rowCode, position.columnCode].filter(Boolean).join('-') || '-'
    },
    getSourcePositionText(row) {
      const values = [row.sourceShelf, row.sourceRow, row.sourceColumn].filter(Boolean)
      return values.length ? values.join('-') : '-'
    },
    getTargetPositionText(row) {
      const values = [row.targetShelf, row.targetRow, row.targetColumn].filter(Boolean)
      return values.length ? values.join('-') : '-'
    },
    getModifyRecordDescList(record = {}) {
      return (record.modifyDescList || []).filter(Boolean)
    },
    getModifyRecordAuditRemark(record = {}) {
      return Number(record.status) === 9 ? (record.auditRemark || record.remark || '') : ''
    },
    getModifyRecordStatusText(status) {
      const value = Number(status)
      const map = { 7: '申请变更', 8: '变更通过', 9: '变更驳回' }
      return map[value] || '-'
    },
    getModifyRecordTagType(status) {
      const value = Number(status)
      const map = { 7: 'warning', 8: 'success', 9: 'danger' }
      return map[value] || 'info'
    },
    cancelModifyRecord(record) {
      this.$confirm('确定撤回该变更申请？', '撤回确认', { type: 'warning' }).then(() => {
        cancelMoveApply({ modifyId: record.id }).then(res => {
          if (res.code === 1) {
            this.$message.success('撤回成功')
            this.getDetails(this.row.id)
            this.$emit('query')
          }
        })
      }).catch(() => {})
    },
    isAuditedModification() {
      if (Array.isArray(this.modifyRecords) && this.modifyRecords.length > 0) return true
      const dataStatus = Number(this.row.dataStatus)
      const auditStatus = Number(this.row.auditStatus)
      return dataStatus === 1 && (auditStatus === 0 || auditStatus === 7)
    },
    getModifyRecordId() {
      const record = (this.modifyRecords && this.modifyRecords[0]) || {}
      return record.id || this.row.modifyRecordId || this.row.operationId || this.row.id
    },
    submitAuditResult(approved, remark) {
      if (this.isAuditedModification()) {
        const params = {
          modifyRecordId: this.getModifyRecordId(),
          approved,
          remark,
        }
        return executeAuditedMove(params)
      }
      const data = {
        taskNum: this.form.taskNum || this.row.moveTaskNum,
        approved,
        remark,
      }
      return confirmMove(data)
    },
    handleAuditApprove() {
      this.$confirm('确定同意该审核申请？', '审核确认', { type: 'info' }).then(() => {
        this.submitAuditResult(true).then(res => {
          if (res.code === 1) {
            this.$message.success('审核通过')
            this.$emit('query')
            this.close()
          }
        })
      }).catch(() => {})
    },
    handleAuditReject() {
      this.$prompt('请输入驳回原因', '审核驳回', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '请输入驳回原因',
        inputValidator: value => {
          if (!value || !value.trim()) return '请输入驳回原因'
          return true
        },
      }).then(({ value }) => {
        this.submitAuditResult(false, value).then(res => {
          if (res.code === 1) {
            this.$message.success('已驳回')
            this.$emit('query')
            this.close()
          }
        })
      }).catch(() => {})
    },
  },
}
</script>

<style lang="scss" scoped>
.form {
  padding: 20px;

  ::v-deep .el-select,
  ::v-deep .el-date-editor,
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

    &.danger {
      color: #f56c6c;
    }
  }

  .btn + .btn {
    margin-left: 8px;
  }
}

::v-deep .modified-field {
  background: #fffbe6;
  border-left: 3px solid #e6a23c;
  border-radius: 4px;
  padding-left: 8px;

  .el-form-item__label {
    color: #e6a23c;
    font-weight: bold;
  }
}

.audit-text-display {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  padding: 5px 0;

  &.is-textarea {
    flex-direction: column;
    align-items: flex-start;
  }

  .original-text {
    color: #1b2129;
    line-height: 22px;

    &.is-deleted {
      color: #999;
      text-decoration: line-through;
    }
  }

  .modify-text-block {
    width: 100%;
    margin-top: 6px;
  }
}

.modify-desc-list {
  padding: 10px 16px;
  background: #fdf6ec;
  border-left: 4px solid #e6a23c;
  border-radius: 4px;

  .modify-desc-item {
    margin-bottom: 4px;
    color: #e6a23c;
    font-size: 13px;
    line-height: 1.6;
  }
}

.change-record-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.change-record-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.change-record-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background: #f7f9fc;
  border-bottom: 1px solid #e4e7ed;
}

.change-record-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  color: #606266;
  font-size: 12px;
}

.change-record-desc {
  padding: 10px 14px;
  color: #303133;
  font-size: 13px;
  line-height: 1.6;
}

.change-record-desc-item + .change-record-desc-item {
  margin-top: 4px;
}

.empty-desc {
  color: #909399;
}

.modify-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 8px;
  padding: 2px 6px;
  border-radius: 3px;
  background: #fdf6ec;
  color: #e6a23c;
  font-size: 12px;
  line-height: 18px;
}

.detail-preview-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 4px;

  td {
    border: 1px solid #ebeef5;
    padding: 9px 10px;
    color: #303133;
  }

  .label {
    width: 110px;
    background: #f5f7fa;
    color: #606266;
    font-weight: 600;
  }
}
</style>
