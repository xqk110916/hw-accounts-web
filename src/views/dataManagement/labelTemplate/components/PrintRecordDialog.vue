<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="720px"
    top="4vh"
    append-to-body
    :before-close="handleClose"
  >
    <div class="record-dialog" v-loading="formLoading">
      <el-form ref="form" :model="formData" :rules="rules" label-width="92px" size="small">
        <el-form-item label="选择模板" prop="选择模板">
          <el-select v-model="formData['选择模板']" :disabled="readonly" placeholder="请选择模板" class="full-input" @change="handleTemplateChange">
            <el-option v-for="item in templateOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="备注">
          <el-input v-model="formData['备注']" :readonly="readonly" placeholder="请输入" maxlength="200"></el-input>
        </el-form-item>
      </el-form>

      <div class="label-card">
        <div class="card-title">材料管理卡</div>
        <div class="grid-row two-cols">
          <div class="grid-label">材料编码</div>
          <div class="grid-value">
            <el-input v-model="formData['材料编码']" :readonly="readonly" size="small" placeholder="请输入" @input="refreshQrCode"></el-input>
          </div>
          <div class="grid-label">生成单位</div>
          <div class="grid-value">
            <el-input v-model="formData['生成单位']" :readonly="readonly" size="small" placeholder="请输入" @input="refreshQrCode"></el-input>
          </div>
        </div>
        <div class="grid-row two-cols">
          <div class="grid-label">库房</div>
          <div class="grid-value">
            <el-input v-model="formData['库房']" :readonly="readonly" size="small" placeholder="请输入" @input="refreshQrCode"></el-input>
          </div>
          <div class="grid-label">入库人</div>
          <div class="grid-value">
            <el-input v-model="formData['入库人']" :readonly="readonly" size="small" placeholder="请输入" @input="refreshQrCode"></el-input>
          </div>
        </div>
        <div class="grid-row full-row">
          <div class="grid-label">容器号</div>
          <div class="grid-value">
            <el-input v-model="formData['容器号']" :readonly="readonly" size="small" placeholder="请输入" @input="refreshQrCode"></el-input>
          </div>
        </div>
        <div class="grid-row full-row">
          <div class="grid-label">入库时间</div>
          <div class="grid-value">
            <el-input v-model="formData['入库时间']" :readonly="readonly" size="small" placeholder="请输入" @input="refreshQrCode"></el-input>
          </div>
        </div>
        <div class="qr-title">二维码 <i class="el-icon-refresh" @click="refreshQrCode"></i></div>
        <div class="qr-wrap">
          <div class="qr-code" v-loading="qrCodeLoading"></div>
        </div>
      </div>
    </div>
    <div slot="footer">
      <el-button size="small" @click="handleClose">关闭</el-button>
      <el-button v-if="!readonly" type="primary" size="small" :loading="saveLoading" @click="handleSave">保存</el-button>
      <el-button v-if="!readonly" type="primary" size="small" :loading="printLoading" @click="handlePrint">打印</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'PrintRecordDialog',
  data() {
    return {
      visible: false,
      mode: 'add',
      formLoading: false,
      saveLoading: false,
      printLoading: false,
      qrCodeLoading: false,
      templateOptions: [{ label: '模板1', value: '模板1' }],
      formData: {
        '选择模板': '模板1',
        '备注': '',
        '材料编码': '',
        '生成单位': '',
        '库房': '',
        '入库人': '',
        '容器号': '',
        '入库时间': '',
        '二维码': '',
      },
      rules: {
        '选择模板': [{ required: true, message: '请选择模板', trigger: 'change' }],
        '材料编码': [{ required: true, message: '请输入材料编码', trigger: 'blur' }],
        '生成单位': [{ required: true, message: '请输入生成单位', trigger: 'blur' }],
        '库房': [{ required: true, message: '请输入库房', trigger: 'blur' }],
        '入库人': [{ required: true, message: '请输入入库人', trigger: 'blur' }],
        '容器号': [{ required: true, message: '请输入容器号', trigger: 'blur' }],
        '入库时间': [{ required: true, message: '请输入入库时间', trigger: 'blur' }],
      },
    }
  },
  computed: {
    readonly() {
      return this.mode === 'detail'
    },
    dialogTitle() {
      if (this.mode === 'detail') return '详情'
      if (this.mode === 'edit') return '编辑'
      return '添加'
    },
  },
  methods: {
    open(row, mode) {
      this.mode = mode || 'add'
      this.resetForm()
      this.visible = true
      if (row) this.fillRow(row)
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    resetForm() {
      this.formData = {
        '选择模板': '模板1',
        '备注': '',
        '材料编码': '',
        '生成单位': '',
        '库房': '',
        '入库人': '',
        '容器号': '',
        '入库时间': '',
        '二维码': '',
      }
    },
    fillRow(row) {
      Object.keys(this.formData).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(row, key)) this.formData[key] = row[key]
      })
      this.formData['选择模板'] = row['选择模板'] || '模板1'
      this.formData['备注'] = row['备注'] || ''
      this.refreshQrCode()
    },
    handleTemplateChange() {
      this.formData['二维码'] = ''
      this.refreshQrCode()
    },
    refreshQrCode() {
      this.qrCodeLoading = true
      setTimeout(() => {
        this.formData['二维码'] = '已生成'
        this.qrCodeLoading = false
      }, 200)
    },
    validateCardFields() {
      const requiredFields = ['材料编码', '生成单位', '库房', '入库人', '容器号', '入库时间']
      for (let i = 0; i < requiredFields.length; i += 1) {
        const field = requiredFields[i]
        if (!this.formData[field] || !String(this.formData[field]).trim()) {
          this.$message.warning('请输入' + field)
          return false
        }
      }
      return true
    },
    handleSave() {
      this.$refs.form.validate(valid => {
        if (!valid || !this.validateCardFields()) return
        if (!this.formData['二维码']) this.refreshQrCode()
        this.saveLoading = true
        setTimeout(() => {
          this.saveLoading = false
          this.$message.success('保存成功')
          this.$emit('saved')
          this.handleClose()
        }, 300)
      })
    },
    handlePrint() {
      this.$refs.form.validate(valid => {
        if (!valid || !this.validateCardFields()) return
        if (!this.formData['二维码']) {
          this.$message.warning('请先生成二维码')
          return
        }
        this.printLoading = true
        setTimeout(() => {
          this.printLoading = false
          this.$message.success('打印成功')
          this.$emit('saved')
          this.handleClose()
        }, 300)
      })
    },
    handleClose() {
      this.visible = false
    },
  },
}
</script>

<style lang="scss" scoped>
.record-dialog {
  .full-input {
    width: 100%;
  }
  .label-card {
    width: 630px;
    margin: 18px auto 0;
    border: 2px solid #1b2129;
    color: #1b2129;
    .card-title {
      height: 48px;
      line-height: 48px;
      text-align: center;
      font-size: 28px;
      font-weight: 700;
      border-bottom: 2px solid #1b2129;
    }
    .grid-row {
      display: grid;
      border-bottom: 2px solid #1b2129;
      &.two-cols {
        grid-template-columns: 155px 1fr 155px 1fr;
      }
      &.full-row {
        grid-template-columns: 155px 1fr;
      }
    }
    .grid-label {
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: 2px solid #1b2129;
      font-size: 26px;
    }
    .grid-value {
      min-height: 44px;
      padding: 4px;
      box-sizing: border-box;
      border-right: 2px solid #1b2129;
      &:last-child {
        border-right: 0;
      }
    }
    .qr-title {
      height: 50px;
      line-height: 50px;
      text-align: center;
      border-bottom: 2px solid #1b2129;
      font-size: 24px;
      .el-icon-refresh {
        cursor: pointer;
        margin-left: 10px;
      }
    }
    .qr-wrap {
      height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      .qr-code {
        width: 420px;
        height: 420px;
        background:
          linear-gradient(90deg, #000 10px, transparent 10px) 0 0 / 40px 40px,
          linear-gradient(#000 10px, transparent 10px) 0 0 / 40px 40px,
          #fff;
        border: 20px solid #fff;
        box-shadow: inset 0 0 0 34px #000, inset 0 0 0 58px #fff, inset 0 0 0 82px #000;
      }
    }
  }
}
</style>
