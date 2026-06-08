<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="92%"
    top="4vh"
    append-to-body
    custom-class="template-dialog-wrapper"
    :before-close="handleClose"
  >
    <div class="template-layout" v-loading="templateLoading">
      <div class="layout-row">
        <!-- 左侧配置区 -->
        <div class="layout-left">
          <el-card class="box-card config-card" shadow="never">
            <div slot="header" class="clearfix card-header">
              <span><i class="el-icon-setting"></i> 模板配置</span>
            </div>

            <div class="config-content">
              <el-form label-width="90px" size="small" class="custom-form">
                <!-- 基础设置 -->
                <div class="section-title">基础设置</div>
                <el-form-item label="模板名称" required>
                  <el-input v-model="templateName" @input="refreshPreview" placeholder="请输入模板名称" />
                </el-form-item>

                <el-form-item label="标题设置" required>
                  <div class="flex-row gap-2">
                    <el-input v-model="templateForm.title" @input="refreshPreview" style="flex: 2" placeholder="请输入标题" />
                    <el-select v-model="templateForm.titleVisible" @change="refreshPreview" style="flex: 1">
                      <el-option label="显示" value="visible"></el-option>
                      <el-option label="隐藏" value="hidden"></el-option>
                    </el-select>
                    <el-select v-model="templateForm.titleFontSize" @change="refreshPreview" style="flex: 1">
                      <el-option v-for="item in fontSizeOptions" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                    <el-select v-model="templateForm.titleStatus" @change="refreshPreview" style="flex: 1">
                      <el-option v-for="item in titleStatusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                  </div>
                </el-form-item>

                <!-- 字段设置 -->
                <div class="section-title">字段设置</div>
                <div class="field-list-container">
                  <div class="field-item" v-for="(item, index) in fieldConfigList" :key="item.id">
                    <div class="field-actions-left">
                      <el-button type="text" icon="el-icon-top" :disabled="index === 0" @click="moveField(index, -1)" class="action-btn" title="上移"></el-button>
                      <el-button type="text" icon="el-icon-bottom" :disabled="index === fieldConfigList.length - 1" @click="moveField(index, 1)" class="action-btn" title="下移"></el-button>
                    </div>

                    <div class="field-label">{{ item.label }}</div>

                    <div class="field-content flex-row gap-2">
                      <el-select v-model="item.value" filterable allow-create placeholder="请选择字段名称" style="flex: 2" @change="val => handleFieldSelectChange(val, item)">
                        <el-option v-for="opt in fieldOptions" :key="opt.fileValue" :label="opt.label" :value="opt.value" :disabled="isFieldSelected(opt.value, item)" />
                      </el-select>
                      <el-select v-model="item.layout" @change="refreshPreview" style="flex: 1">
                        <el-option label="单排" value="single"></el-option>
                        <el-option label="双排" value="double"></el-option>
                      </el-select>
                      <el-select v-model="item.fontSize" @change="refreshPreview" style="flex: 1">
                        <el-option v-for="font in fontSizeOptions" :key="font" :label="font" :value="font"></el-option>
                      </el-select>
                      <el-select v-model="item.status" @change="refreshPreview" style="flex: 1">
                        <el-option v-for="state in fieldStatusOptions" :key="state.value" :label="state.label" :value="state.value"></el-option>
                      </el-select>
                    </div>

                    <div class="field-actions-right">
                      <el-button type="primary" icon="el-icon-plus" circle plain size="mini" @click="addField(index)" title="新增"></el-button>
                      <el-button type="danger" icon="el-icon-minus" circle plain size="mini" :disabled="fieldConfigList.length <= 1 || fixedFieldKeys.includes(item.key)" @click="removeField(index)" title="删除"></el-button>
                    </div>
                  </div>
                </div>

                <!-- 二维码与边距 -->
                <div class="section-title">其他设置</div>
                <el-form-item label="二维码">
                  <div class="flex-row gap-2 align-center">
                    <el-input v-model="qrWidth" @input="handleQrSizeChange" placeholder="宽度(如: 50mm)" style="width: 140px" />
                    <span class="multiply-sign">×</span>
                    <el-input v-model="qrHeight" @input="handleQrSizeChange" placeholder="高度(如: 50mm)" style="width: 140px" />
                    <el-select v-model="templateForm.qrVisible" @change="refreshPreview" style="width: 100px; margin-left: auto;">
                      <el-option label="显示" value="visible"></el-option>
                      <el-option label="隐藏" value="hidden"></el-option>
                    </el-select>
                  </div>
                </el-form-item>

                <el-form-item label="边距设置">
                  <div class="flex-row gap-2 margin-row" style="margin-bottom: 12px;">
                    <el-input v-model="templateForm.marginTop" @input="refreshPreview" style="flex: 1">
                      <template slot="prepend">上</template>
                    </el-input>
                    <el-input v-model="templateForm.marginBottom" @input="refreshPreview" style="flex: 1">
                      <template slot="prepend">下</template>
                    </el-input>
                  </div>
                  <div class="flex-row gap-2 margin-row">
                    <el-input v-model="templateForm.marginLeft" @input="refreshPreview" style="flex: 1">
                      <template slot="prepend">左</template>
                    </el-input>
                    <el-input v-model="templateForm.marginRight" @input="refreshPreview" style="flex: 1">
                      <template slot="prepend">右</template>
                    </el-input>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </div>

        <!-- 右侧预览区 -->
        <div class="layout-right">
          <el-card class="box-card preview-card" shadow="never">
            <div slot="header" class="clearfix card-header flex-between">
              <span><i class="el-icon-view"></i> 预览效果</span>
              <el-button type="text" icon="el-icon-refresh" @click="refreshPreview" style="padding: 0; font-size: 14px;">刷新预览</el-button>
            </div>
            
            <div class="preview-content" v-loading="previewLoading">
              <label-template-preview :template="realtimeTemplate" mode="design" style="height: 610px;" />
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose" size="medium">取消</el-button>
      <el-button type="primary" :loading="saveTemplateLoading" @click="handleSaveTemplate" size="medium">保存模板</el-button>
    </div>
  </el-dialog>
</template>

<script>
import LabelTemplatePreview from './LabelTemplatePreview.vue'
import {
  backendToTemplate,
  createDefaultTemplate,
  formToTemplate,
  templateToBackend,
  templateToFields,
  templateToForm,
} from './storage'
import { addTemplate, getTemplateDetail, updateTemplate } from './api'

export default {
  name: 'TemplateDialog',
  components: { LabelTemplatePreview },
  data() {
    return {
      visible: false,
      mode: 'add',
      templateLoading: false,
      previewLoading: false,
      saveTemplateLoading: false,
      templateId: '',
      templateName: '',
      currentTemplate: null,
      fontSizeOptions: ['12号', '14号', '16号', '18号', '22号', '24号', '26号'],
      titleStatusOptions: [
        { label: '正常', value: 'normal' },
        { label: '加粗', value: 'bold' },
        { label: '禁用', value: 'disabled' },
      ],
      fieldStatusOptions: [
        { label: '正常', value: 'normal' },
        { label: '隐藏', value: 'hidden' },
        { label: '禁用', value: 'disabled' },
      ],
      qrWidth: '50mm',
      qrHeight: '50mm',
      nextFieldId: 1,
      templateForm: {
        templateId: '模板1',
        title: '材料管理卡',
        titleVisible: 'visible',
        titleFontSize: '16号',
        titleStatus: 'normal',
        qrSize: '50mm×50mm',
        qrVisible: 'visible',
        marginTop: '10mm',
        marginBottom: '10mm',
        marginLeft: '10mm',
        marginRight: '10mm',
      },
      fieldConfigList: [],
      fixedFieldKeys: ['containerNo', 'warehouse'],
      fieldOptions: [
        { label: '材料编码', value: '材料编码', fileValue: 'goodCode' },
        { label: '容器号', value: '容器号', fileValue: 'containerCode' },
        { label: '生产单位', value: '生产单位', fileValue: 'productionUnit' },
        { label: '库房', value: '库房', fileValue: 'warehouseName' },
        { label: '位置', value: '位置', fileValue: 'position' },
        { label: '货箱号', value: '货箱号', fileValue: 'boxNum' },
        { label: '封记编码1', value: '封记编码1', fileValue: 'sealCode1' },
        { label: '封记类型1', value: '封记类型1', fileValue: 'sealType1' },
        { label: '封记编码2', value: '封记编码2', fileValue: 'sealCode2' },
        { label: '封记类型2', value: '封记类型2', fileValue: 'sealType2' },
        { label: '重量(毛重)', value: '重量(毛重)', fileValue: 'grossWeight' },
        { label: '重量(皮重)', value: '重量(皮重)', fileValue: 'tareWeight' },
        { label: '重量(净重)', value: '重量(净重)', fileValue: 'netWeight' },
        { label: '入库时间', value: '入库时间', fileValue: 'storageTime' },
      ],
    }
  },
  computed: {
    dialogTitle() {
      return this.mode === 'edit' ? '编辑模板' : '新增模板'
    },
    realtimeTemplate() {
      return formToTemplate(this.templateForm, this.fieldConfigList, this.currentTemplate)
    },
  },
  methods: {
    async open(templateId, mode) {
      this.mode = mode || (templateId ? 'edit' : 'add')
      this.templateId = templateId || ''
      this.visible = true
      await this.loadTemplate(templateId)
      this.refreshPreview()
    },
    async loadTemplate(value) {
      this.templateLoading = true
      try {
        let template = createDefaultTemplate('新模板')
        if (value) {
          const res = await getTemplateDetail(value)
          template = backendToTemplate(res.data)
        }
        this.currentTemplate = template
        this.templateName = template.name
        this.templateForm = templateToForm(template)
        this.fieldConfigList = templateToFields(template).map((item, index) => ({
          ...item,
          id: item.id || index + 1,
        }))
        this.nextFieldId = Math.max(...this.fieldConfigList.map(item => item.id), 0) + 1
        this.qrWidth = template.qrSize.width
        this.qrHeight = template.qrSize.height
      } finally {
        this.templateLoading = false
      }
    },
    relabelFields() {
      this.fieldConfigList.forEach((item, index) => {
        item.label = '字段' + (index + 1)
      })
    },
    addField(index) {
      this.fieldConfigList.splice(index + 1, 0, {
        id: this.nextFieldId,
        key: 'customField' + this.nextFieldId,
        label: '',
        value: '自定义字段' + this.nextFieldId,
        fileValue: '',
        layout: 'single',
        fontSize: '16号',
        status: 'normal',
      })
      this.nextFieldId += 1
      this.relabelFields()
      this.refreshPreview()
    },
    removeField(index) {
      if (this.fieldConfigList.length <= 1) return
      this.fieldConfigList.splice(index, 1)
      this.relabelFields()
      this.refreshPreview()
    },
    moveField(index, step) {
      const target = index + step
      if (target < 0 || target >= this.fieldConfigList.length) return
      const current = this.fieldConfigList[index]
      this.fieldConfigList.splice(index, 1)
      this.fieldConfigList.splice(target, 0, current)
      this.relabelFields()
      this.refreshPreview()
    },
    handleFieldChange() {
      this.refreshPreview()
    },
    isFieldSelected(value, currentItem) {
      return this.fieldConfigList.some(item => item !== currentItem && item.value === value)
    },
    handleFieldSelectChange(val, item) {
      const matched = this.fieldOptions.find(opt => opt.value === val)
      item.fileValue = matched ? matched.fileValue : ''
      this.handleFieldChange()
    },
    handleQrSizeChange() {
      this.templateForm.qrSize = this.qrWidth + '×' + this.qrHeight
      this.refreshPreview()
    },
    refreshPreview() {
      this.previewLoading = true
      clearTimeout(this.previewTimer)
      this.previewTimer = setTimeout(() => {
        this.previewLoading = false
      }, 160)
    },
    validateTemplate() {
      if (!this.templateName || !this.templateName.trim()) {
        this.$message.warning('请输入模板名称')
        return false
      }
      if (!this.templateForm.title || !this.templateForm.title.trim()) {
        this.$message.warning('请输入标题')
        return false
      }
      const names = this.fieldConfigList.map(item => item.value)
      const hasEmpty = names.some(name => !name || !name.trim())
      if (hasEmpty) {
        this.$message.warning('字段名称不能为空')
        return false
      }
      const uniqueNames = Array.from(new Set(names))
      if (uniqueNames.length !== names.length) {
        this.$message.warning('字段名称不可重复')
        return false
      }
      const marginKeys = ['marginTop', 'marginBottom', 'marginLeft', 'marginRight']
      const invalidMargin = marginKeys.some(key => !/^\d+mm$/.test(this.templateForm[key]))
      if (invalidMargin) {
        this.$message.warning('边距格式应为数字mm')
        return false
      }
      const invalidMarginRange = marginKeys.some(key => Number.parseFloat(String(this.templateForm[key]).replace('mm', '')) > 100)
      if (invalidMarginRange) {
        this.$message.warning('边距数值不能超过100mm')
        return false
      }
      if (!/^\d+mm×\d+mm$/.test(this.templateForm.qrSize)) {
        this.$message.warning('二维码格式应为数字mm×数字mm')
        return false
      }
      return true
    },
    async handleSaveTemplate() {
      if (!this.validateTemplate()) return
      this.saveTemplateLoading = true
      try {
        const template = {
          ...formToTemplate(this.templateForm, this.fieldConfigList, this.currentTemplate),
          id: this.templateId,
          name: this.templateName.trim(),
        }
        const payload = templateToBackend(template)
        if (this.mode === 'edit' && this.templateId) {
          await updateTemplate(payload)
        } else {
          delete payload.id
          await addTemplate(payload)
        }
        this.saveTemplateLoading = false
        this.$message.success('保存成功')
        this.$emit('saved')
        this.handleClose()
      } finally {
        this.saveTemplateLoading = false
      }
    },
    handleClose() {
      this.visible = false
    },
  },
}
</script>

<style lang="scss" scoped>
::v-deep .template-dialog-wrapper {
  .el-dialog__body {
    padding: 20px;
    background-color: #f5f7fa;
  }
}

.template-layout {
  min-height: 650px;

  .layout-row {
    display: flex;
    align-items: stretch;
    height: 680px;
    gap: 20px;
  }

  .layout-left {
    width: 660px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .layout-right {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .box-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: 6px;
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05) !important;

    ::v-deep .el-card__header {
      padding: 15px 20px;
      background-color: #fff;
      border-bottom: 1px solid #ebeef5;
      border-radius: 6px 6px 0 0;
    }
    ::v-deep .el-card__body {
      flex: 1;
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  }

  .card-header {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    &.flex-between {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    i {
      margin-right: 6px;
      color: #409eff;
    }
  }

  .config-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: #fff;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 3px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  .section-title {
    font-size: 14px;
    font-weight: bold;
    color: #606266;
    margin-bottom: 16px;
    margin-top: 10px;
    padding-left: 10px;
    border-left: 3px solid #409eff;
    line-height: 1.2;

    &:first-child {
      margin-top: 0;
    }
  }

  .flex-row {
    display: flex;
    align-items: center;
  }

  .gap-2 {
    gap: 10px;
  }

  .align-center {
    align-items: center;
  }

  .multiply-sign {
    color: #909399;
    font-size: 18px;
    padding: 0 4px;
  }

  /* Field List Styling */
  .field-list-container {
    margin-bottom: 24px;
    padding-left: 8px;
  }

  .field-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    background-color: #f8f9fb;
    padding: 10px 15px;
    border-radius: 6px;
    border: 1px solid #eef0f5;
    transition: all 0.3s ease;

    &:hover {
      background-color: #f2f6fc;
      border-color: #dcdfe6;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
  }

  .field-actions-left {
    display: flex;
    flex-direction: column;
    margin-right: 15px;

    .action-btn {
      padding: 0;
      height: 18px;
      font-size: 16px;
      color: #909399;

      &:hover:not(:disabled) {
        color: #409eff;
      }
      &:disabled {
        color: #c0c4cc;
      }
    }
  }

  .field-label {
    width: 45px;
    font-size: 13px;
    color: #606266;
    font-weight: 500;
    margin-right: 10px;
    flex-shrink: 0;
  }

  .field-content {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .field-actions-right {
    margin-left: 15px;
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .margin-row {
    ::v-deep .el-input-group__prepend {
      padding: 0 10px;
      background-color: #f5f7fa;
    }
  }

  /* Preview Area Styling */
  .preview-content {
    flex: 1;
    overflow-y: auto;
    background-color: #f0f2f5;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 30px;
    
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: #c0c4cc;
      border-radius: 3px;
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>
