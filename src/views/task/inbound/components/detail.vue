<template>
  <div>
    <theme-edit :show="show" showFooterSlot :title="titleMap[type]" :column="2" @cancle="close">
      <el-form ref="form" class="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col
            v-for="item in formKeys"
            :key="item.prop"
            :span="item.full ? 24 : 12"
            v-if="judgeRowShow(item)"
          >
            <el-form-item :label="item.label" :prop="item.prop">
              <div class="form-item-content">
                <el-input
                  v-if="judgeInput(item) && item.type !== 'textarea'"
                  v-model="form[item.prop]"
                  :type="item.type || 'text'"
                  size="small"
                  :placeholder="`请输入${item.label}`"
                  @blur="value => changeFormValue(value, item)"
                  clearable
                  :disabled="type === 'view' || item.disabled"
                ></el-input>
                <el-input
                  v-if="item.type === 'textarea'"
                  v-model="form[item.prop]"
                  type="textarea"
                  :rows="3"
                  size="small"
                  :placeholder="`请输入${item.label}`"
                  @blur="value => changeFormValue(value, item)"
                  clearable
                  :disabled="type === 'view'"
                ></el-input>
                <el-select
                  v-if="item.type === 'select'"
                  v-model="form[item.prop]"
                  size="small"
                  :placeholder="`请选择${item.label}`"
                  @change="value => changeFormValue(value, item)"
                  clearable
                  :disabled="type === 'view' || item.disabled"
                >
                  <el-option
                    v-for="opt in options[item.prop]"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  >
                  </el-option>
                </el-select>
                <el-cascader
                  v-if="item.type === 'cascader'"
                  v-model="form[item.prop]"
                  :options="options[item.prop]"
                  size="small"
                  :placeholder="`请选择${item.label}`"
                  :props="item.props || { emitPath: false }"
                  @change="value => changeFormValue(value, item)"
                  clearable
                  filterable
                  :disabled="type === 'view' || item.disabled"
                ></el-cascader>
                <el-date-picker
                  v-if="item.type === 'date'"
                  v-model="form[item.prop]"
                  type="date"
                  size="small"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  :placeholder="`请选择${item.label}`"
                  @change="value => changeFormValue(value, item)"
                  clearable
                  :disabled="type === 'view'"
                >
                </el-date-picker>
                <el-date-picker
                  v-if="item.type === 'datetime'"
                  v-model="form[item.prop]"
                  type="datetime"
                  size="small"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  :placeholder="`请选择${item.label}`"
                  @change="value => changeFormValue(value, item)"
                  clearable
                  :disabled="type === 'view'"
                >
                </el-date-picker>

                <el-button
                  v-if="item.showMaintenance && type !== 'view'"
                  type="primary"
                  icon="el-icon-setting"
                  size="mini"
                  circle
                  class="maintenance-btn"
                  title="维护"
                  @click="openMaintenance(item)"
                ></el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 明细表格 -->
      <div class="detail-section">
        <div class="detail-header">
          <span class="detail-title">明细信息</span>
          <div class="detail-actions" v-if="type !== 'view'">
            <el-button v-if="type === 'add'" size="small" @click="openImportDialog">导入</el-button>
            <el-button size="small" type="primary" @click="addDetailRow">添加</el-button>
          </div>
        </div>
        <el-table :data="detailList" border size="small" max-height="300">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="goodCode" label="材料编码" width="120" show-overflow-tooltip />
          <el-table-column prop="containerCode" label="容器号" width="120" show-overflow-tooltip />
          <el-table-column prop="productionUnit" label="生产单位" width="120" show-overflow-tooltip />
          <el-table-column prop="warehouseName" label="库房" width="100" show-overflow-tooltip />
          <el-table-column label="位置(排-行-列)" width="120" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.shelfCode || '' }}-{{ scope.row.rowCode || '' }}-{{ scope.row.columnCode || '' }}
            </template>
          </el-table-column>
          <el-table-column prop="boxNum" label="货箱号" width="100" show-overflow-tooltip />
          <el-table-column prop="sealCode1" label="封记编码1" width="120" show-overflow-tooltip />
          <el-table-column prop="sealCode2" label="封记编码2" width="120" show-overflow-tooltip />
          <el-table-column label="重量(毛,皮,净)" width="180" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.grossWeight || 0 }}、{{ scope.row.tareWeight || 0 }}、{{
                scope.row.netWeight || 0
              }}
            </template>
          </el-table-column>
          <el-table-column v-if="type !== 'view'" label="操作" width="120" fixed="right">
            <template slot-scope="scope">
              <span class="table_operation">
                <span class="btn text" @click="editDetailRow(scope.row, scope.$index)">编辑</span>
                <span class="btn text" @click="removeDetailRow(scope.$index)">删除</span>
              </span>
            </template>
          </el-table-column>
        </el-table>
        <!-- 合计行 -->
        <div class="summary-row">
          合计：{{ detailList.length }}件 总重：{{ totalWeightGross }}、{{ totalWeightTare }}、{{
            totalWeightNet
          }}KG
        </div>
      </div>

      <div class="footer" v-if="type !== 'view'">
        <el-button size="small" @click="close">取消</el-button>
        <el-button type="primary" size="small" @click="submitForm">
          {{ type === 'modify' ? '提交变更审核' : '确定' }}
        </el-button>
      </div>
      <div class="footer" v-else>
        <el-button size="small" @click="close">关闭</el-button>
      </div>
    </theme-edit>

    <allocation-basis-list-dialog ref="basisDialog" @success="handleBasisSuccess" />

  <!-- 导入弹窗 -->
  <ImportDialog ref="importDialog" @success="handleImportSuccess" />

  <!-- 明细编辑弹窗 -->
  <el-dialog :close-on-click-modal="false" title="明细编辑" custom-class="show-footer-dialog" :visible.sync="detailEditVisible" width="600px" append-to-body>
    <el-form ref="detailForm" :model="detailEditForm" label-width="120px" :rules="detailRules">
      <el-form-item label="材料编码" prop="goodCode">
        <el-input v-model="detailEditForm.goodCode" size="small" placeholder="请输入材料编码" />
      </el-form-item>
      <el-form-item label="容器号" prop="containerCode">
        <el-input v-model="detailEditForm.containerCode" size="small" placeholder="请输入容器号" />
      </el-form-item>
      <el-form-item label="生产单位" prop="productionUnit">
        <el-input v-model="detailEditForm.productionUnit" size="small" placeholder="请输入生产单位" />
      </el-form-item>
      <el-form-item label="库房名称" prop="warehouseId">
        <el-select
          v-model="detailEditForm.warehouseId"
          size="small"
          placeholder="请选择库房"
          @change="handleWarehouseChange"
          clearable
          filterable
        >
          <el-option
            v-for="w in warehouseOptions"
            :key="w.id"
            :label="w.warehouseName"
            :value="w.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="位置" prop="positionId">
        <el-select
          v-model="detailEditForm.positionId"
          size="small"
          placeholder="请选择位置"
          @change="handlePositionChange"
          clearable
          filterable
          :disabled="!detailEditForm.warehouseId"
        >
          <el-option
            v-for="p in positionOptions"
            :key="p.id"
            :label="`${p.shelfCode}-${p.rowCode}-${p.columnCode}`"
            :value="p.id"
            :disabled="p.status !== 0"
          >
            <span>{{ p.shelfCode }}-{{ p.rowCode }}-{{ p.columnCode }}</span>
            <span v-if="p.status !== 0" style="color: #999; margin-left: 8px;">({{ p.status === 1 ? '占用' : '锁定' }})</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="货箱号" prop="boxNum">
        <el-input v-model="detailEditForm.boxNum" size="small" placeholder="请输入货箱号" />
      </el-form-item>
      <el-form-item label="封记编码1" prop="sealCode1">
        <el-input v-model="detailEditForm.sealCode1" size="small" placeholder="请输入封记编码1" />
      </el-form-item>
      <el-form-item label="封记编码2" prop="sealCode2">
        <el-input v-model="detailEditForm.sealCode2" size="small" placeholder="请输入封记编码2" />
      </el-form-item>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="毛重" prop="grossWeight">
            <el-input v-model="detailEditForm.grossWeight" size="small" placeholder="毛重" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="皮重" prop="tareWeight">
            <el-input v-model="detailEditForm.tareWeight" size="small" placeholder="皮重" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="净重" prop="netWeight">
            <el-input v-model="detailEditForm.netWeight" size="small" placeholder="净重" />
          </el-form-item>
        </el-col>
      </el-row>
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
import { config, requestFun, beforeSubmit, beforeRecurrence } from './index.js'
import AllocationBasisListDialog from './AllocationBasisListDialog.vue'
import ImportDialog from './ImportDialog.vue'
import { getDictionaryList } from '@/api/common/dictionary.js'
import { generateBatchNo } from '@/api/common/batchNo.js'
import { getLocationHierarchy, getPositionMap } from './api.js'

export default {
  components: { AllocationBasisListDialog, ImportDialog },
  data() {
    return {
      row: {},
      show: false,
      type: 'add', // add 添加 edit 编辑 view 查看 modify 修改
      updateType: 0,
      deletedGoodIds: [],
      formKeys: [],
      form: {},
      rules: {},
      options: {},
      defaultProps: {
        label: 'label',
        value: 'id',
      },
      // 明细数据
      detailList: [],
      detailEditVisible: false,
      detailEditForm: {},
      detailEditIndex: -1,
      detailRules: {
        goodCode: [{ required: true, message: '请输入材料编码', trigger: 'blur' }],
        containerCode: [{ required: true, message: '请输入容器号', trigger: 'blur' }],
        productionUnit: [{ required: true, message: '请输入生产单位', trigger: 'blur' }],
        warehouseId: [{ required: true, message: '请选择库房', trigger: 'change' }],
        positionId: [{ required: true, message: '请选择位置', trigger: 'change' }],
      },
      warehouseOptions: [], // 库房下拉选项
      positionOptions: [],  // 位置下拉选项
      // 导入
      updateType: 0,
      deletedGoodIds: [],
    }
  },
  computed: {
    titleMap() {
      return { add: '添加入库任务', edit: '编辑入库任务', view: '入库任务详情', modify: '修改入库任务' }
    },
    totalWeightGross() {
      return this.detailList
        .reduce((sum, item) => sum + (Number(item.grossWeight) || 0), 0)
        .toFixed(5)
    },
    totalWeightTare() {
      return this.detailList
        .reduce((sum, item) => sum + (Number(item.tareWeight) || 0), 0)
        .toFixed(5)
    },
    totalWeightNet() {
      return this.detailList
        .reduce((sum, item) => sum + (Number(item.netWeight) || 0), 0)
        .toFixed(5)
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
      this.deletedGoodIds = []
      if (this.row.id) {
        // mode: 'view' | 'edit' | 'modify'
        this.type = mode || 'edit'
        this.getDetails(this.row.id).then(() => {
          // 动态禁用调拨依据（edit/modify 时不允许修改）
          const transferItem = this.formKeys.find(i => i.prop === '_transferSelected')
          if (transferItem) {
            this.$set(transferItem, 'disabled', this.type !== 'add')
          }
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
        // 新增时恢复调拨依据可编辑
        const transferItem = this.formKeys.find(i => i.prop === '_transferSelected')
        if (transferItem) {
          this.$set(transferItem, 'disabled', false)
        }
        this.detailList = []
        this.refreshOptions()
        this.show = true
        generateBatchNo({ batchType: 1 }).then(res => {
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
    getDetails(id) {
      return requestFun.detail(id).then(res => {
        let data = res.data?.operation || res.data || {}
        config.detail.forEach(item => {
          if (data[item.prop] !== undefined && data[item.prop] !== null) {
            this.$set(this.form, item.prop, data[item.prop])
          }
        })
        // 手动映射接口字段名与配置 prop 不一致的字段
        if (data.transferId) this.$set(this.form, 'transferId', data.transferId)
        if (data.goodCodes) this.$set(this.form, 'goodCodes', data.goodCodes)
        if (data.securityLevel) this.$set(this.form, 'classify', data.securityLevel)
        // 加载明细
        this.detailList = res.data?.goodsList || data.details || []
        return data
      })
    },
    async submitForm() {
      let payload = deepClone(this.form)
      if (this.row.id) {
        payload.id = this.row.id
        payload.updateType = this.updateType
        payload.dtoList = this.detailList.filter(item => !item.id)
        payload.editList = this.detailList.filter(item => item.id)
        payload.goodIds = this.deletedGoodIds.join(',')
      } else {
        payload.dtoList = this.detailList
      }
      // 移除可能导致多余传参的属性
      delete payload.details
      
      this.$refs.form.validate(async valid => {
        if (valid) {
          // 校验库位是否被占用
          const occupiedPositions = this.detailList.filter(
            item => item.positionStatus === 'occupied'
          )
          if (occupiedPositions.length > 0) {
            this.$message.warning('存在库位已被占用，请检查后重新选择')
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
        } else {
          return false
        }
      })
    },
    resetForm() {
      this.row = {}
      this.form = this.$options.data().form
      this.detailList = []
      this.$refs.form && this.$refs.form.resetFields()
    },
    changeFormValue(value, item) {
      if (item.change && typeof item.change === 'function') {
        item.change(value, this.form, this)
      }
    },
    judgeInput(row) {
      if (!row.type || row.type === 'text' || row.type === 'textarea') {
        return true
      } else {
        return false
      }
    },
    judgeRowShow(item) {
      let handle = null
      switch (this.type) {
        case 'add':
          handle = item.isAdd
          break
        case 'edit':
          handle = item.isUpdate
          break
        case 'view':
          handle = item.isView
          break
        default:
          handle = () => true
          break
      }
      let flag = true
      switch (typeof handle) {
        case 'function':
          flag = handle(this.form)
          break
        case 'boolean':
          flag = handle
          break
        case 'undefined':
          flag = true
          break
      }
      return flag
    },
    handleParams() {
      config.detail.forEach(item => {
        this.formKeys.push(item)
        if (item.defaultValue !== undefined) {
          let defaultValue = item.defaultValue
          if (defaultValue instanceof Date) {
            // 格式化日期为字符串
            const y = defaultValue.getFullYear()
            const m = String(defaultValue.getMonth() + 1).padStart(2, '0')
            const d = String(defaultValue.getDate()).padStart(2, '0')
            defaultValue = `${y}-${m}-${d} 00:00:00`
          }
          this.$set(this.form, item.prop, defaultValue)
        } else {
          this.$set(this.form, item.prop, '')
        }

        if (item.option || item.dictParentId) this.getOptions(item)

        if (item.required) {
          let isInput = this.judgeInput(item)
          let rule = {
            required: true,
            message: `请${isInput ? '输入' : '选择'}${item.label}`,
            trigger: isInput ? 'blur' : 'change',
          }
          this.$set(this.rules, item.prop, [rule])
        }
      })
    },
    refreshOptions() {
      // 重新加载具有动态选项配置的字段（例如：调拨依据）
      this.formKeys.forEach(item => {
        if (item.option || item.dictParentId) {
          this.getOptions(item)
        }
      })
    },
    openMaintenance(item) {
      this.$refs.basisDialog.open()
    },
    handleBasisSuccess() {
      // 维护成功后刷新调拨依据列表
      const item = this.formKeys.find(i => i.prop === '_transferSelected')
      if (item) this.getOptions(item)
    },
    getOptions(item) {
      if (item.dictParentId) {
        getDictionaryList({ 
          parentId: item.dictParentId, 
          currentPage: 1, 
          pageSize: 999 
        }).then(res => {
          if (res.code === 1) {
            // 映射为通用的 label/value 格式以适配模板
            const options = (res.data.list || []).map(i => ({
              label: i.fullName,
              value: i.dictValue
            }))
            this.$set(this.options, item.prop, options)
          }
        })
      } else if (item.option) {
        if (typeof item.option === 'function') {
          const res = item.option()
          if (res && typeof res.then === 'function') {
            res.then(data => {
              const ary = Array.isArray(data) ? data : (data.data ? (Array.isArray(data.data) ? data.data : data.data.list) : [])
              this.$set(this.options, item.prop, ary || [])
            })
          }
        } else if (item.option.then) {
          item.option.then(res => {
            const ary = Array.isArray(res) ? res : (res.data ? (Array.isArray(res.data) ? res.data : res.data.list) : [])
            this.$set(this.options, item.prop, ary || [])
          })
        } else {
          this.$set(this.options, item.prop, item.option)
        }
      }
    },
    // 库房/位置接口联动
    loadWarehouseOptions() {
      getLocationHierarchy(2).then(res => {
        this.warehouseOptions = res.data || []
      })
    },
    handleWarehouseChange(warehouseId) {
      // 切换库房时清空位置选项和已选位置
      this.detailEditForm.positionId = ''
      this.detailEditForm.shelfCode = ''
      this.detailEditForm.rowCode = ''
      this.detailEditForm.columnCode = ''
      this.positionOptions = []
      // 同步库房名称
      const warehouse = this.warehouseOptions.find(w => w.id === warehouseId)
      this.detailEditForm.warehouseName = warehouse ? warehouse.warehouseName : ''
      this.detailEditForm.warehouseId = warehouseId
      if (warehouseId) {
        getPositionMap({ nodeId: warehouseId, nodeType: '2' }).then(res => {
          this.positionOptions = res.data || []
        })
      }
    },
    handlePositionChange(positionId) {
      const pos = this.positionOptions.find(p => p.id === positionId)
      if (pos) {
        this.detailEditForm.shelfCode = pos.shelfCode || ''
        this.detailEditForm.rowCode = pos.rowCode || ''
        this.detailEditForm.columnCode = pos.columnCode || ''
      }
    },
    // 明细操作
    addDetailRow() {
      this.detailEditIndex = -1
      this.detailEditForm = {
        goodCode: '',
        containerCode: '',
        productionUnit: '',
        warehouseId: '',
        warehouseName: '',
        positionId: '',
        shelfCode: '',
        rowCode: '',
        columnCode: '',
        boxNum: '',
        sealCode1: '',
        sealCode2: '',
        grossWeight: 0,
        tareWeight: 0,
        netWeight: 0,
      }
      this.positionOptions = []
      this.detailEditVisible = true
    },
    editDetailRow(row, index) {
      this.detailEditIndex = index
      const rowData = deepClone(row)
      
      // 如果没有 warehouseId 但有 warehouseName，尝试从选项中匹配（兼容导入数据）
      if (!rowData.warehouseId && rowData.warehouseName && this.warehouseOptions.length > 0) {
        const foundWarehouse = this.warehouseOptions.find(w => w.warehouseName === rowData.warehouseName)
        if (foundWarehouse) {
          rowData.warehouseId = foundWarehouse.id
        }
      } else if (rowData.warehouseId && this.warehouseOptions.length > 0) {
        // 确保类型一致（接口返回 ID 通常为 Number，后端返回详情可能是 String）
        const foundWarehouse = this.warehouseOptions.find(w => String(w.id) === String(rowData.warehouseId))
        if (foundWarehouse) {
          rowData.warehouseId = foundWarehouse.id
        }
      }
      
      this.detailEditForm = rowData
      this.positionOptions = []
      
      // 编辑时加载对应库房的位置列表
      if (this.detailEditForm.warehouseId) {
        getPositionMap({ nodeId: this.detailEditForm.warehouseId, nodeType: '2' }).then(res => {
          this.positionOptions = res.data || []
          
          // 如果有 positionId，确保类型与选项一致
          if (this.detailEditForm.positionId) {
            const matched = this.positionOptions.find(p => String(p.id) === String(this.detailEditForm.positionId))
            if (matched) {
              this.$set(this.detailEditForm, 'positionId', matched.id)
            }
          }
          // 如果没有 positionId，尝试根据排行列编码反向查找对应的位置 ID
          else if (this.detailEditForm.shelfCode) {
            const targetPos = this.positionOptions.find(p => 
              String(p.shelfCode) === String(this.detailEditForm.shelfCode) &&
              String(p.rowCode) === String(this.detailEditForm.rowCode) &&
              String(p.columnCode) === String(this.detailEditForm.columnCode)
            )
            if (targetPos) {
              this.$set(this.detailEditForm, 'positionId', targetPos.id)
            }
          }
        })
      }
      this.detailEditVisible = true
    },
    submitDetailForm() {
      this.$refs.detailForm.validate(valid => {
        if (valid) {
          if (this.detailEditIndex >= 0) {
            this.$set(this.detailList, this.detailEditIndex, deepClone(this.detailEditForm))
          } else {
            this.detailList.push(deepClone(this.detailEditForm))
          }
          this.detailEditVisible = false
        }
      })
    },
    removeDetailRow(index) {
      this.$confirm('确定要删除该明细?', '提示', { type: 'warning' }).then(() => {
        const removed = this.detailList.splice(index, 1)[0]
        if (removed && removed.id) {
          this.deletedGoodIds.push(removed.id)
        }
      })
    },
    // 导入
    openImportDialog() {
      this.$refs.importDialog.open()
    },
    handleImportSuccess(data) {
      // 将 position(如 "S1-1-2") 解析为 shelfCode/rowCode/columnCode
      const parsePosition = (item) => {
        if (item.position) {
          const parts = item.position.split('-')
          item.shelfCode = parts[0] || ''
          item.rowCode = parts[1] || ''
          item.columnCode = parts[2] || ''
        }
        return item
      }
      // 合并导入的明细数据到 detailList
      if (Array.isArray(data)) {
        this.detailList = this.detailList.concat(data.map(parsePosition))
      } else if (data && Array.isArray(data.goodsList)) {
        this.detailList = this.detailList.concat(data.goodsList.map(parsePosition))
      } else {
        this.$message.success('导入成功，请刷新页面')
      }
    },
    // 提交变更审核
    submitChangeAudit() {
      this.$confirm('确定要提交变更审核?', '提示', { type: 'warning' }).then(() => {
        this.$message.success('已提交变更审核')
      })
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
  .btn + .btn {
    margin-left: 10px;
  }
}

.import-tip {
  margin-top: 10px;
}

::v-deep .el-dialog:not(.show-footer-dialog) .el-dialog__body {
  padding: 0 !important;
}

::v-deep .el-dialog:not(.show-footer-dialog) .el-dialog__footer {
  display: none;
}
</style>
