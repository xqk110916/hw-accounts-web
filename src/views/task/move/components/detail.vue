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
      </el-form-item>
    </el-form>

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
  <el-dialog title="选择目标位置" :visible.sync="positionDialogVisible" width="500px" append-to-body>
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
import { deepClone } from '@/utils'
import { config, requestFun, beforeSubmit, beforeRecurrence } from './index.js'

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
::v-deep .el-dialog__body {
  padding: 0 !important;
}
::v-deep .el-dialog__footer {
  display: none;
}
</style>
