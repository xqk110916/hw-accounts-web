<template>
  <div>
    <theme-edit :show="show" showFooterSlot :title="titleMap[type]" :column="1" @cancle="close">
    <el-form ref="form" class="form" :model="form" :rules="rules" label-width="130px">
      <el-form-item
        v-for="item in formKeys"
        :label="item.label"
        :prop="item.prop"
        v-if="judgeRowShow(item)"
      >
        <el-input
          v-if="judgeInput(item) && item.type !== 'textarea'"
          v-model="form[item.prop]"
          size="small"
          :placeholder="`请输入${item.label}`"
          @blur="value => changeFormValue(value, item)"
          clearable
          :disabled="item.disabled"
        />
        <el-input
          v-if="item.type === 'textarea'"
          v-model="form[item.prop]"
          type="textarea"
          :rows="3"
          size="small"
          :placeholder="`请输入${item.label}`"
          @blur="value => changeFormValue(value, item)"
          clearable
        />
      </el-form-item>
    </el-form>

    <!-- 明细表格 -->
    <div class="detail-section">
      <div class="detail-header">
        <span class="detail-title">盘存明细</span>
        <div class="detail-actions">
          <el-button size="small" type="primary" @click="addDetailRow">添加</el-button>
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
        <el-table-column prop="sealCode" label="封记编码" width="120" show-overflow-tooltip />
        <el-table-column label="重量(毛,皮,净)" width="160" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.weightGross || 0 }}/{{ scope.row.weightTare || 0 }}/{{
              scope.row.weightNet || 0
            }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.status"
              size="mini"
              placeholder="请选择"
              @change="handleStatusChange(scope.row)"
            >
              <el-option label="正常" value="normal" />
              <el-option label="不正常" value="abnormal" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.remark"
              size="mini"
              placeholder="不正常时必填"
              :disabled="scope.row.status !== 'abnormal'"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template slot-scope="scope">
            <span class="btn text" @click="editDetailRow(scope.row, scope.$index)">编辑</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template slot="footer">
      <div class="footer">
        <el-button size="small" @click="close">取消</el-button>
        <el-button type="primary" size="small" @click="submitForm">确定</el-button>
      </div>
    </template>
  </theme-edit>

  <!-- 明细编辑弹窗 -->
  <el-dialog :close-on-click-modal="false" title="明细编辑" :visible.sync="detailEditVisible" width="600px" append-to-body>
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
      <el-form-item label="封记编码" prop="sealCode">
        <el-input v-model="detailEditForm.sealCode" size="small" placeholder="请输入封记编码" />
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
      <el-form-item label="状态" prop="status">
        <el-select v-model="detailEditForm.status" size="small" placeholder="请选择">
          <el-option label="正常" value="normal" />
          <el-option label="不正常" value="abnormal" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="detailEditForm.remark" type="textarea" :rows="2" size="small" placeholder="不正常时必填" />
      </el-form-item>
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
import { generateBatchNo } from '@/api/common/batchNo.js'

export default {
  data() {
    return {
      row: {},
      show: false,
      type: 'add',
      formKeys: [],
      form: {},
      rules: {},
      options: {},
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
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
      },
    }
  },
  computed: {
    titleMap() {
      return { add: '添加实物盘存', edit: '编辑实物盘存', view: '实物盘存详情' }
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
        generateBatchNo({ batchType: 3 }).then(res => {
          if (res.code === 1) {
            this.$set(this.form, 'taskNo', res.data)
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
      return requestFun.detail({ id }).then(res => {
        let data = res.data
        config.detail.forEach(item => {
          if (data[item.prop]) {
            this.$set(this.form, item.prop, data[item.prop])
          }
        })
        this.detailList = (data.details || []).sort((a, b) => {
          // 按位置排序
          return (a.position || '').localeCompare(b.position || '')
        })
        if (beforeRecurrence) beforeRecurrence(this.form, this)
        return data
      })
    },
    async submitForm() {
      // 校验不正常问题是否填写了备注
      const abnormalItems = this.detailList.filter(
        item => item.status === 'abnormal' && !item.remark
      )
      if (abnormalItems.length > 0) {
        this.$message.warning('存在状态为"不正常"的容器未填写备注，请补充')
        return
      }
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
      return !row.type || row.type === 'text' || row.type === 'textarea'
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
        let defaultValue = this.form[item.prop] || item.defaultValue || ''
        this.$set(this.form, item.prop, defaultValue)
        if (item.option) this.getOptions(item)
        if (item.required || item.required !== false) {
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
        sealCode: '',
        weightGross: 0,
        weightTare: 0,
        weightNet: 0,
        status: 'normal',
        remark: '',
      }
      this.detailEditVisible = true
    },
    editDetailRow(row, index) {
      this.detailEditIndex = index
      this.detailEditForm = deepClone(row)
      this.detailEditVisible = true
    },
    submitDetailForm() {
      // 不正常时备注必填
      if (this.detailEditForm.status === 'abnormal' && !this.detailEditForm.remark) {
        this.$message.warning('状态为"不正常"时，备注必填')
        return
      }
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
    handleStatusChange(row) {
      if (row.status === 'abnormal' && !row.remark) {
        this.$message.warning('状态为"不正常"时，请补充备注')
      }
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
</style>
