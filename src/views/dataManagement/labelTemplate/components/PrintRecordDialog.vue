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
        <el-form-item label="选择模板" prop="templateId">
          <el-select v-model="formData.templateId" :disabled="readonly" placeholder="请选择模板" class="full-input" @change="handleTemplateChange">
            <el-option v-for="item in templateOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" :readonly="readonly" placeholder="请输入" maxlength="200" @input="refreshQrCode"></el-input>
        </el-form-item>
      </el-form>

      <div class="label-card">
        <div v-if="currentTemplate.titleVisible === 'visible'" class="card-title">{{ currentTemplate.title }}</div>
        <div class="grid-row two-cols">
          <div class="grid-label">{{ getFieldLabel('materialCode') }}</div>
          <div class="grid-value">
            <el-input v-model="formData.materialCode" :readonly="readonly" size="small" placeholder="请输入" @input="refreshQrCode"></el-input>
          </div>
          <div class="grid-label">{{ getFieldLabel('generationUnit') }}</div>
          <div class="grid-value">
            <el-input v-model="formData.generationUnit" :readonly="readonly" size="small" placeholder="请输入" @input="refreshQrCode"></el-input>
          </div>
        </div>
        <div class="grid-row two-cols">
          <div class="grid-label">{{ getFieldLabel('warehouse') }}</div>
          <div class="grid-value">
            <el-input v-model="formData.warehouse" :readonly="readonly" size="small" placeholder="请输入" @input="refreshQrCode"></el-input>
          </div>
          <div class="grid-label">{{ getFieldLabel('inboundPerson') }}</div>
          <div class="grid-value">
            <el-input v-model="formData.inboundPerson" :readonly="readonly" size="small" placeholder="请输入" @input="refreshQrCode"></el-input>
          </div>
        </div>
        <div class="grid-row full-row">
          <div class="grid-label">{{ getFieldLabel('containerNo') }}</div>
          <div class="grid-value">
            <el-input v-model="formData.containerNo" :readonly="readonly" size="small" placeholder="请输入" @input="refreshQrCode"></el-input>
          </div>
        </div>
        <div class="grid-row full-row">
          <div class="grid-label">{{ getFieldLabel('inboundTime') }}</div>
          <div class="grid-value">
            <el-input v-model="formData.inboundTime" :readonly="readonly" size="small" placeholder="请输入" @input="refreshQrCode"></el-input>
          </div>
        </div>
        <div v-if="currentTemplate.qrVisible === 'visible'" class="qr-title">二维码 <i v-if="!readonly" class="el-icon-refresh" @click="refreshQrCode"></i></div>
        <div v-if="currentTemplate.qrVisible === 'visible'" class="qr-wrap">
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
import { buildLabelPrintData, buildQrContent } from './print-builder'
import {
  backendToTemplate,
  buildLabelDataPayload,
  createDefaultTemplate,
  getPrinterConfig,
  labelDataToRow,
  templateListToOptions,
} from './storage'
import { addLabelData, getLabelDataDetail, getTemplateDetail, listAllTemplate, updateLabelData } from './api'

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
      templateOptions: [],
      currentTemplate: createDefaultTemplate('模板1'),
      formData: {
        id: '',
        templateId: '',
        remark: '',
        materialCode: '',
        generationUnit: '',
        warehouse: '',
        inboundPerson: '',
        containerNo: '',
        inboundTime: '',
        qrContent: '',
      },
      rules: {
        templateId: [{ required: true, message: '请选择模板', trigger: 'change' }],
        materialCode: [{ required: true, message: '请输入材料编码', trigger: 'blur' }],
        generationUnit: [{ required: true, message: '请输入生成单位', trigger: 'blur' }],
        warehouse: [{ required: true, message: '请输入库房', trigger: 'blur' }],
        inboundPerson: [{ required: true, message: '请输入入库人', trigger: 'blur' }],
        containerNo: [{ required: true, message: '请输入容器号', trigger: 'blur' }],
        inboundTime: [{ required: true, message: '请输入入库时间', trigger: 'blur' }],
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
  beforeDestroy() {
    clearTimeout(this.qrTimer)
  },
  methods: {
    async open(row, mode) {
      this.mode = mode || 'add'
      this.formLoading = true
      this.resetForm()
      this.visible = true
      try {
        await this.loadTemplateOptions()
        this.resetForm()
        if (row && row.id) {
          const res = await getLabelDataDetail(row.id)
          this.fillRow(labelDataToRow(res.data))
        } else if (row) {
          this.fillRow(row)
        }
        await this.loadCurrentTemplate()
        this.refreshQrCode()
        this.$nextTick(() => {
          if (this.$refs.form) this.$refs.form.clearValidate()
        })
      } finally {
        this.formLoading = false
      }
    },
    async loadTemplateOptions() {
      const res = await listAllTemplate()
      this.templateOptions = templateListToOptions(res.data)
    },
    resetForm() {
      this.formData = {
        id: '',
        templateId: this.templateOptions[0] ? this.templateOptions[0].value : '',
        remark: '',
        materialCode: '',
        generationUnit: '',
        warehouse: '',
        inboundPerson: '',
        containerNo: '',
        inboundTime: '',
        qrContent: '',
      }
    },
    fillRow(row) {
      this.formData = {
        id: row.id,
        templateId: row.templateId,
        remark: row.remark,
        materialCode: row.materialCode,
        generationUnit: row.generationUnit,
        warehouse: row.warehouse,
        inboundPerson: row.inboundPerson,
        containerNo: row.containerNo,
        inboundTime: row.inboundTime,
        qrContent: row.qrContent,
      }
    },
    async loadCurrentTemplate() {
      if (!this.formData.templateId) {
        this.currentTemplate = createDefaultTemplate('模板1')
        return
      }
      const res = await getTemplateDetail(this.formData.templateId)
      this.currentTemplate = backendToTemplate(res.data)
    },
    async handleTemplateChange() {
      await this.loadCurrentTemplate()
      this.formData.qrContent = ''
      this.refreshQrCode()
    },
    getFieldLabel(key) {
      const field = (this.currentTemplate.fields || []).find(item => item.key === key)
      return field ? field.name : ''
    },
    refreshQrCode() {
      this.qrCodeLoading = true
      clearTimeout(this.qrTimer)
      this.qrTimer = setTimeout(() => {
        this.ensureQrContent()
        this.qrCodeLoading = false
      }, 120)
    },
    ensureQrContent() {
      this.formData.qrContent = buildQrContent(this.currentTemplate, this.formData)
      return this.formData.qrContent
    },
    validateCardFields() {
      const requiredFields = [
        { key: 'materialCode', label: '材料编码' },
        { key: 'generationUnit', label: '生成单位' },
        { key: 'warehouse', label: '库房' },
        { key: 'inboundPerson', label: '入库人' },
        { key: 'containerNo', label: '容器号' },
        { key: 'inboundTime', label: '入库时间' },
      ]
      for (let i = 0; i < requiredFields.length; i += 1) {
        const field = requiredFields[i]
        if (!this.formData[field.key] || !String(this.formData[field.key]).trim()) {
          this.$message.warning('请输入' + field.label)
          return false
        }
      }
      return true
    },
    validatePrinterConfig(config) {
      if (!config.serviceIp) {
        this.$message.warning('请在 public/config.js 中配置打印服务地址')
        return false
      }
      if (!config.servicePort) {
        this.$message.warning('请在 public/config.js 中配置打印服务端口')
        return false
      }
      if (!config.model) {
        this.$message.warning('请在 public/config.js 中配置打印机型号')
        return false
      }
      if (config.interfaceType === 'NET' && !config.netIp) {
        this.$message.warning('请在 public/config.js 中配置打印机 IP')
        return false
      }
      if (config.interfaceType === 'COM' && (!config.comData || !config.comData.port)) {
        this.$message.warning('请在 public/config.js 中配置串口号')
        return false
      }
      return true
    },
    handleSave() {
      this.$refs.form.validate(async valid => {
        if (!valid || !this.validateCardFields()) return
        this.ensureQrContent()
        this.saveLoading = true
        try {
          const payload = buildLabelDataPayload(this.currentTemplate, this.formData, this.formData.id)
          if (this.mode === 'edit' && this.formData.id) {
            await updateLabelData(payload)
          } else {
            delete payload.id
            await addLabelData(payload)
          }
          this.$message.success('保存成功')
          this.$emit('saved')
          this.handleClose()
        } finally {
          this.saveLoading = false
        }
      })
    },
    handlePrint() {
      this.$refs.form.validate(async valid => {
        const config = getPrinterConfig()
        if (!valid || !this.validateCardFields() || !this.validatePrinterConfig(config)) return
        this.ensureQrContent()
        this.printLoading = true
        try {
          const sdk = await this.$zplPrinter.getSdk()
          await this.$zplPrinter.connect(config.serviceIp, config.servicePort)
          const printData = buildLabelPrintData(sdk, this.currentTemplate, this.formData)
          this.$zplPrinter.sendData(config.model, printData, {
            interfaceType: config.interfaceType,
            sn: config.sn,
            netIp: config.netIp,
            netPort: config.netPort,
            comData: config.comData,
          })
          const payload = buildLabelDataPayload(this.currentTemplate, this.formData, this.formData.id)
          if (this.mode === 'edit' && this.formData.id) {
            await updateLabelData(payload)
          } else {
            delete payload.id
            await addLabelData(payload)
          }
          this.$message.success('打印任务已发送')
          this.$emit('saved')
          this.handleClose()
        } catch (error) {
          this.$message.error(error && error.message ? error.message : '打印失败')
        } finally {
          this.printLoading = false
        }
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
