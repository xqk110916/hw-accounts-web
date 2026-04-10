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
      </el-form-item>
    </el-form>

    <!-- 明细表格 -->
    <div class="detail-section">
      <div class="detail-header">
        <span class="detail-title">明细信息</span>
        <div class="detail-actions">
          <el-button size="small" @click="openImportDialog">导入</el-button>
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
      <!-- 合计行 -->
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

  <!-- 导入弹窗 -->
  <el-dialog title="导入" :visible.sync="importDialogVisible" width="500px" append-to-body>
    <el-form :model="importForm" label-width="80px">
      <el-form-item label="类型">
        <el-select v-model="importForm.type" size="small" placeholder="请选择">
          <el-option label="导入1（材料编码、容器号、生产单位、库房）" value="1" />
          <el-option
            label="导入2（容器号、封记编码、重量等）"
            value="2"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="选择文件">
        <el-upload
          ref="upload"
          :auto-upload="false"
          :on-change="handleFileChange"
          :limit="1"
          accept=".xlsx,.xls"
        >
          <el-button size="small" type="primary">选择文件</el-button>
        </el-upload>
      </el-form-item>
      <div class="import-tip">
        <el-link type="primary" @click="downloadTemplate">下载模板</el-link>
      </div>
    </el-form>
    <div slot="footer">
      <el-button size="small" @click="importDialogVisible = false">取消</el-button>
      <el-button type="primary" size="small" @click="submitImport">提交</el-button>
    </div>
  </el-dialog>

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
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { config, requestFun, beforeSubmit, beforeRecurrence } from './index.js'

export default {
  data() {
    return {
      row: {},
      show: false,
      type: 'add', // add 添加 edit 编辑 view 查看
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
        materialCode: [{ required: true, message: '请输入材料编码', trigger: 'blur' }],
        containerNo: [{ required: true, message: '请输入容器号', trigger: 'blur' }],
        productionUnit: [{ required: true, message: '请输入生产单位', trigger: 'blur' }],
        warehouse: [{ required: true, message: '请输入库房', trigger: 'blur' }],
        position: [{ required: true, message: '请输入位置', trigger: 'blur' }],
      },
      // 导入
      importDialogVisible: false,
      importForm: {
        type: '1',
        file: null,
      },
    }
  },
  computed: {
    titleMap() {
      return { add: '添加入库任务', edit: '编辑入库任务', view: '入库任务详情' }
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
        // 加载明细
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
          // 校验库位是否被占用
          const occupiedPositions = this.detailList.filter(
            item => item.positionStatus === 'occupied'
          )
          if (occupiedPositions.length > 0) {
            this.$message.warning('存在库位已被占用，请检查后重新选择')
            return
          }
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
    // 明细操作
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
    // 导入
    openImportDialog() {
      this.importForm = { type: '1', file: null }
      this.importDialogVisible = true
    },
    handleFileChange(file) {
      this.importForm.file = file.raw
    },
    submitImport() {
      if (!this.importForm.file) {
        this.$message.warning('请选择文件')
        return
      }
      const formData = new FormData()
      formData.append('file', this.importForm.file)
      formData.append('type', this.importForm.type)
      // 调用导入接口
      this.$message.success('导入成功')
      this.importDialogVisible = false
    },
    downloadTemplate() {
      this.$message.info('下载模板功能')
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

::v-deep .el-dialog__body {
  padding: 0 !important;
}

::v-deep .el-dialog__footer {
  display: none;
}
</style>
