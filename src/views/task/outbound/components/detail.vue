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
                ></el-input>
                <el-select
                  v-if="item.type === 'select'"
                  v-model="form[item.prop]"
                  size="small"
                  :placeholder="`请选择${item.label}`"
                  @change="value => changeFormValue(value, item)"
                  clearable
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
                  @change="value => changeFormValue(value, item)"
                  clearable
                  filterable
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
                >
                </el-date-picker>

                <el-button
                  v-if="item.showMaintenance"
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
        <div class="detail-actions">
          <el-button size="small" @click="autoAllocate">自动配置</el-button>
          <el-button size="small" type="primary" @click="addDetailRow">手工选择</el-button>
        </div>
      </div>
      <el-table :data="detailList" border size="small" max-height="300">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="materialCode" label="材料编码" width="120" show-overflow-tooltip />
        <el-table-column prop="containerNo" label="容器号" width="120" show-overflow-tooltip />
        <el-table-column prop="productionUnit" label="生产单位" width="120" show-overflow-tooltip />
        <el-table-column prop="warehouse" label="库房" width="100" show-overflow-tooltip />
        <el-table-column prop="position" label="位置" width="120" show-overflow-tooltip />
        <el-table-column prop="cargoBoxNo" label="货箱号" width="100" show-overflow-tooltip />
        <el-table-column prop="sealCode1" label="封记编码1" width="120" show-overflow-tooltip />
        <el-table-column prop="sealCode2" label="封记编码2" width="120" show-overflow-tooltip />
        <el-table-column prop="materialWeight" label="材料重量" width="100" show-overflow-tooltip />
        <el-table-column label="重量(毛,皮,净)" width="180" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.weightGross || 0 }}/{{ scope.row.weightTare || 0 }}/{{
              scope.row.weightNet || 0
            }}
          </template>
        </el-table-column>
        <el-table-column prop="metalContent" label="金属量%" width="100" show-overflow-tooltip />
        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <span class="table_operation">
              <span class="btn text" @click="editDetailRow(scope.row, scope.$index)">编辑</span>
              <span class="btn text" @click="removeDetailRow(scope.$index)">删除</span>
            </span>
          </template>
        </el-table-column>
      </el-table>
      <div class="summary-row">
        合计：{{ detailList.length }}件 总重：{{ totalWeightGross }}/{{ totalWeightTare }}/{{
          totalWeightNet
        }}KG
      </div>
    </div>

    <div class="footer">
      <el-button size="small" @click="close">取消</el-button>
      <el-button type="primary" size="small" @click="submitForm">确定</el-button>
    </div>
  </theme-edit>

  <!-- 明细编辑弹窗 -->
  <el-dialog title="明细编辑" :visible.sync="detailEditVisible" width="600px" append-to-body>
    <el-form ref="detailForm" :model="detailEditForm" label-width="120px" :rules="detailRules">
      <el-form-item label="材料编码" prop="materialCode">
        <el-input v-model="detailEditForm.materialCode" size="small" placeholder="请输入材料编码" />
      </el-form-item>
      <el-form-item label="容器号" prop="containerNo">
        <el-input v-model="detailEditForm.containerNo" size="small" placeholder="请输入容器号" />
      </el-form-item>
      <el-form-item label="生产单位" prop="productionUnit">
        <el-input v-model="detailEditForm.productionUnit" size="small" placeholder="请输入生产单位" />
      </el-form-item>
      <el-form-item label="库房" prop="warehouse">
        <el-input v-model="detailEditForm.warehouse" size="small" placeholder="请输入库房" />
      </el-form-item>
      <el-form-item label="位置" prop="position">
        <el-input v-model="detailEditForm.position" size="small" placeholder="请输入位置" />
      </el-form-item>
      <el-form-item label="货箱号" prop="cargoBoxNo">
        <el-input v-model="detailEditForm.cargoBoxNo" size="small" placeholder="请输入货箱号" />
      </el-form-item>
      <el-form-item label="封记编码1" prop="sealCode1">
        <el-input v-model="detailEditForm.sealCode1" size="small" placeholder="请输入封记编码1" />
      </el-form-item>
      <el-form-item label="封记编码2" prop="sealCode2">
        <el-input v-model="detailEditForm.sealCode2" size="small" placeholder="请输入封记编码2" />
      </el-form-item>
      <el-form-item label="材料重量" prop="materialWeight">
        <el-input v-model="detailEditForm.materialWeight" size="small" placeholder="请输入材料重量" />
      </el-form-item>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="毛重" prop="weightGross">
            <el-input v-model="detailEditForm.weightGross" size="small" placeholder="毛重" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="皮重" prop="weightTare">
            <el-input v-model="detailEditForm.weightTare" size="small" placeholder="皮重" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="净重" prop="weightNet">
            <el-input v-model="detailEditForm.weightNet" size="small" placeholder="净重" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="金属量%" prop="metalContent">
        <el-input v-model="detailEditForm.metalContent" size="small" placeholder="请输入金属量%" />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button size="small" @click="detailEditVisible = false">取消</el-button>
      <el-button type="primary" size="small" @click="submitDetailForm">确定</el-button>
    </div>
  </el-dialog>

  <allocation-basis-dialog ref="basisDialog" @success="handleBasisSuccess" />
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { config, requestFun, beforeSubmit, beforeRecurrence } from './index.js'
import AllocationBasisDialog from '@/views/task/inbound/components/AllocationBasisDialog.vue'

export default {
  components: { AllocationBasisDialog },
  data() {
    return {
      row: {},
      show: false,
      type: 'add',
      formKeys: [],
      form: {},
      rules: {},
      options: {},
      defaultProps: {
        label: 'label',
        value: 'id',
      },
      detailList: [],
      detailEditVisible: false,
      detailEditForm: {},
      detailEditIndex: -1,
      detailRules: {
        materialCode: [{ required: true, message: '请输入材料编码', trigger: 'blur' }],
        containerNo: [{ required: true, message: '请输入容器号', trigger: 'blur' }],
        productionUnit: [{ required: true, message: '请输入生产单位', trigger: 'blur' }],
        warehouse: [{ required: true, message: '请输入库房', trigger: 'blur' }],
        position: [{ required: true, message: '请输入位置', trigger: 'blur' }],
      },
    }
  },
  computed: {
    titleMap() {
      return { add: '添加出库任务', edit: '编辑出库任务', view: '出库任务详情' }
    },
    totalWeightGross() {
      return this.detailList
        .reduce((sum, item) => sum + (Number(item.weightGross) || 0), 0)
        .toFixed(5)
    },
    totalWeightTare() {
      return this.detailList
        .reduce((sum, item) => sum + (Number(item.weightTare) || 0), 0)
        .toFixed(5)
    },
    totalWeightNet() {
      return this.detailList
        .reduce((sum, item) => sum + (Number(item.weightNet) || 0), 0)
        .toFixed(5)
    },
  },
  created() {
    this.handleParams()
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
      this.resetForm()
      this.$nextTick(() => {
        this.show = false
      })
    },
    getDetails(id) {
      return requestFun.detail({ id }).then(res => {
        let data = res.data
        config.detail.forEach(item => {
          if (data[item.prop]) {
            this.$set(this.form, item.prop, data[item.prop])
          }
        })
        this.detailList = data.details || []
        if (beforeRecurrence) beforeRecurrence(this.form, this)
        return data
      })
    },
    async submitForm() {
      let payload = deepClone(this.form)
      if (this.row.id) payload.id = this.row.id
      payload.details = this.detailList
      this.$refs.form.validate(async valid => {
        if (valid) {
          if (beforeSubmit) payload = await beforeSubmit(payload)
          requestFun.update(payload).then(res => {
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
        item.change(value, this.form)
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
            const y = defaultValue.getFullYear()
            const m = String(defaultValue.getMonth() + 1).padStart(2, '0')
            const d = String(defaultValue.getDate()).padStart(2, '0')
            defaultValue = `${y}-${m}-${d} 00:00:00`
          }
          this.$set(this.form, item.prop, defaultValue)
        } else {
          this.$set(this.form, item.prop, '')
        }
        
        if (item.option) this.getOptions(item)
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
    openMaintenance(item) {
      this.$refs.basisDialog.open()
    },
    handleBasisSuccess() {
      const item = this.formKeys.find(i => i.prop === 'allocationBasisId')
      if (item) this.getOptions(item)
    },
    getOptions(item) {
      if (!Array.isArray(item.option)) {
        item.option.then(res => {
          let ary = Array.isArray(res.data) ? res.data : res.data.list
          this.$set(this.options, item.prop, ary)
        })
      } else {
        this.$set(this.options, item.prop, item.option)
      }
    },
    addDetailRow() {
      this.detailEditIndex = -1
      this.detailEditForm = {
        materialCode: '',
        containerNo: '',
        productionUnit: '',
        warehouse: '',
        position: '',
        cargoBoxNo: '',
        sealCode1: '',
        sealCode2: '',
        materialWeight: '',
        weightGross: 0,
        weightTare: 0,
        weightNet: 0,
        metalContent: 0,
      }
      this.detailEditVisible = true
    },
    editDetailRow(row, index) {
      this.detailEditIndex = index
      this.detailEditForm = deepClone(row)
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
        this.detailList.splice(index, 1)
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
  .btn + .btn {
    margin-left: 10px;
  }
}

::v-deep .el-dialog__body {
  padding: 0 !important;
}

::v-deep .el-dialog__footer {
  display: none;
}
</style>
