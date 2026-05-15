<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="800px"
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
          <el-input v-model="formData.remark" :disabled="readonly" placeholder="请输入" maxlength="200"></el-input>
        </el-form-item>
      </el-form>

      <div class="label-card-container">
        <label-template-preview
          :template="currentTemplate"
          :form-data="formData"
          :mode="readonly ? 'preview' : 'edit'"
          :select-field-keys="readonly ? [] : selectFieldKeys"
          :select-field-options="selectFieldOptions"
          :select-bind-values="selectBindValues"
          :date-field-values="dateFieldValues"
          @select-change="handleSelectFieldChange"
        >
          <template #qrcode="{ qrStyle }">
            <div class="qr-code-display" :style="qrStyle">
              <img v-if="formData.qrContent" :src="formData.qrContent" class="qr-code-image" alt="二维码" />
              <div v-else class="qr-code-empty">
                <i class="el-icon-picture-outline"></i>
                <span>{{ readonly ? '暂无二维码' : '保存后生成' }}</span>
              </div>
            </div>
          </template>
        </label-template-preview>
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
import LabelTemplatePreview from './LabelTemplatePreview.vue'
import { buildLabelPrintData } from './print-builder'
import {
  backendToTemplate,
  buildLabelDataPayload,
  createDefaultTemplate,
  getPrinterConfig,
  labelDataToRow,
  templateListToOptions,
} from './storage'
import { addLabelData, getLabelDataDetail, getTemplateDetail, listAllTemplate, updateLabelData } from './api'
import { getLocationHierarchy, getPositionMap, getMaterialCodeListAll } from '@/views/task/inbound/components/api'
import { getSealTypeOptions } from '@/utils/sealType'

export default {
  name: 'PrintRecordDialog',
  components: { LabelTemplatePreview },
  data() {
    return {
      visible: false,
      mode: 'add',
      formLoading: false,
      saveLoading: false,
      printLoading: false,
      templateOptions: [],
      currentTemplate: createDefaultTemplate('模板1'),
      formData: {
        id: '',
        templateId: '',
        remark: '',
        materialCode: '',
        productionUnit: '',
        warehouse: '',
        containerNo: '',
        storageTime: '',
        qrContent: '',
      },
      rules: {
        templateId: [{ required: true, message: '请选择模板', trigger: 'change' }],
        materialCode: [{ required: true, message: '请输入材料编码', trigger: 'blur' }],
        productionUnit: [{ required: true, message: '请输入生产单位', trigger: 'blur' }],
        warehouse: [{ required: true, message: '请输入库房', trigger: 'blur' }],
        containerNo: [{ required: true, message: '请输入容器号', trigger: 'blur' }],
        storageTime: [{ required: true, message: '请选择入库时间', trigger: 'change' }],
      },
      selectFieldKeys: ['materialCode', 'warehouse', 'position', 'sealType1', 'sealType2'],
      selectFieldOptions: { materialCode: [], warehouse: [], position: [], sealType1: [], sealType2: [] },
      selectBindValues: { materialCode: '', warehouse: '', position: '', sealType1: '', sealType2: '' },
      dateFieldValues: ['storageTime'],
      warehouseIdMap: {},
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
    async open(row, mode) {
      this.mode = mode || 'add'
      this.formLoading = true
      this.resetForm()
      this.visible = true
      try {
        if (this.readonly) {
          // 详情模式：获取模板选项 + 详情接口 + 模板详情接口
          await this.loadTemplateOptions()
          if (row && row.id) {
            const res = await getLabelDataDetail(row.id)
            this.fillRow(labelDataToRow(res.data))
          } else if (row) {
            this.fillRow(row)
          }
          if (this.formData.templateId) {
            const res = await getTemplateDetail(this.formData.templateId)
            this.currentTemplate = backendToTemplate(res.data)
            this.currentTemplate.fields.forEach(field => {
              if (this.formData[field.key] === undefined) {
                this.$set(this.formData, field.key, '')
              }
            })
          } else {
            this.currentTemplate = createDefaultTemplate('模板1')
          }
        } else {
          // 编辑/新增模式加载全部数据
          await this.loadTemplateOptions()
          await this.loadSelectFieldOptions()
          this.resetForm()
          if (row && row.id) {
            const res = await getLabelDataDetail(row.id)
            this.fillRow(labelDataToRow(res.data))
          } else if (row) {
            this.fillRow(row)
          }
          await this.loadCurrentTemplate()
        }
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
        qrContent: '',
      }
      this.selectBindValues = { materialCode: '', warehouse: '', position: '', sealType1: '', sealType2: '' }
    },
    fillRow(row) {
      this.formData = {
        id: row.id,
        templateId: row.templateId,
        remark: row.remark,
        qrContent: row.qrContent,
        ...row,
      }
    },
    async loadCurrentTemplate() {
      if (!this.formData.templateId) {
        this.currentTemplate = createDefaultTemplate('模板1')
      } else {
        const res = await getTemplateDetail(this.formData.templateId)
        this.currentTemplate = backendToTemplate(res.data)
      }

      // Ensure reactivity for dynamic fields
      this.currentTemplate.fields.forEach(field => {
        if (this.formData[field.key] === undefined) {
          this.$set(this.formData, field.key, '')
        }
      })

      // Pre-load position options if warehouse value exists (edit mode)
      if (this.formData.warehouse) {
        const warehouseOpt = this.selectFieldOptions.warehouse.find(
          opt => opt.label === this.formData.warehouse
        )
        if (warehouseOpt) {
          this.$set(this.selectBindValues, 'warehouse', warehouseOpt.value)
          await this.loadPositionOptions(warehouseOpt.value)
        }
      }

      // Restore selectBindValues for other fields from formData labels
      this.restoreSelectBindValues()
    },
    async handleTemplateChange() {
      await this.loadCurrentTemplate()
      this.formData.qrContent = ''
      this.$set(this.selectFieldOptions, 'position', [])
      this.$set(this.selectBindValues, 'position', '')
    },
    validateCardFields() {
      const fields = this.currentTemplate.fields || []
      for (let i = 0; i < fields.length; i += 1) {
        const field = fields[i]
        if (field.status !== 'hidden' && field.status !== '隐藏') {
          if (!this.formData[field.key] || !String(this.formData[field.key]).trim()) {
            this.$message.warning(`请输入${field.name || field.label}`)
            return false
          }
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
    async loadSelectFieldOptions() {
      await Promise.all([
        this.loadMaterialCodeOptions(),
        this.loadWarehouseOptions(),
        this.loadSealTypeOptions(),
      ])
    },
    async loadMaterialCodeOptions() {
      try {
        const res = await getMaterialCodeListAll()
        this.$set(this.selectFieldOptions, 'materialCode', (res.data || []).map(item => ({
          label: item.goodName || item.goodCode,
          value: item.goodCode,
        })))
      } catch (e) {
        this.$set(this.selectFieldOptions, 'materialCode', [])
      }
    },
    async loadWarehouseOptions() {
      try {
        const res = await getLocationHierarchy(2)
        const list = res.data || []
        this.$set(this.selectFieldOptions, 'warehouse', list.map(item => ({
          label: item.warehouseName,
          value: item.id,
        })))
        this.warehouseIdMap = {}
        list.forEach(item => {
          this.warehouseIdMap[item.id] = item.warehouseName
        })
      } catch (e) {
        this.$set(this.selectFieldOptions, 'warehouse', [])
      }
    },
    async loadSealTypeOptions() {
      try {
        const options = await getSealTypeOptions()
        this.$set(this.selectFieldOptions, 'sealType1', options)
        this.$set(this.selectFieldOptions, 'sealType2', options)
      } catch (e) {
        this.$set(this.selectFieldOptions, 'sealType1', [])
        this.$set(this.selectFieldOptions, 'sealType2', [])
      }
    },
    async loadPositionOptions(warehouseId) {
      if (!warehouseId) {
        this.$set(this.selectFieldOptions, 'position', [])
        return
      }
      try {
        const res = await getPositionMap({ nodeId: warehouseId, nodeType: '2' })
        this.$set(this.selectFieldOptions, 'position', (res.data || []).map(item => ({
          label: `${item.shelfCode}-${item.rowCode}-${item.columnCode}`,
          value: item.id,
        })))
      } catch (e) {
        this.$set(this.selectFieldOptions, 'position', [])
      }
    },
    restoreSelectBindValues() {
      this.selectFieldKeys.forEach(fieldKey => {
        if (fieldKey === 'warehouse') return // Already handled above
        const label = this.formData[fieldKey]
        if (!label) return
        const options = this.selectFieldOptions[fieldKey] || []
        const matched = options.find(opt => opt.label === label)
        if (matched) {
          this.$set(this.selectBindValues, fieldKey, matched.value)
        }
      })
    },
    handleSelectFieldChange({ fieldKey, value }) {
      if (fieldKey === 'warehouse') {
        const selected = this.selectFieldOptions.warehouse.find(opt => opt.value === value)
        if (selected) {
          this.$set(this.formData, 'warehouse', selected.label)
        }
        this.$set(this.formData, 'position', '')
        this.$set(this.selectBindValues, 'position', '')
        if (value) {
          this.loadPositionOptions(value)
        } else {
          this.$set(this.selectFieldOptions, 'position', [])
        }
      } else if (fieldKey === 'position') {
        const selected = this.selectFieldOptions.position.find(opt => opt.value === value)
        if (selected) {
          this.$set(this.formData, 'position', selected.label)
        }
      } else {
        const options = this.selectFieldOptions[fieldKey] || []
        const selected = options.find(opt => opt.value === value)
        if (selected) {
          this.$set(this.formData, fieldKey, selected.label)
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.record-dialog {
  .full-input {
    width: 100%;
  }
  .label-card-container {
    width: 780px;
    margin: 18px auto 0;
    height: 610px;
  }
  .qr-code-display {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border: 1px solid #e0e0e0;

    .qr-code-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .qr-code-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #c0c4cc;
      font-size: 14px;

      i {
        font-size: 48px;
        margin-bottom: 8px;
      }
    }
  }
}
</style>
