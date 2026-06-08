<template>
  <div class="preview-scaler">
    <div class="preview-box" :style="previewBoxStyle">
      <div class="preview-inner">
        <div v-if="template.titleVisible === 'visible'" class="preview-title" :style="titleStyle">{{ template.title }}</div>
        <div class="preview-body">
          <div class="preview-left-section">
            <div class="preview-grid">
              <div
                v-for="item in visibleFields"
                :key="item.key"
                :class="['preview-field', item.layout === 'double' ? 'double' : '', item.status === 'disabled' ? 'disabled' : '']"
                :style="fieldStyle(item)"
              >
                <span class="field-label-preview">{{ item.name || item.label }}</span>
                <span class="field-value-preview">
                  <template v-if="mode === 'edit'">
                    <el-select v-if="selectFieldKeys.includes(item.key)"
                      v-model="selectBindValues[item.key]" size="small" filterable
                      :placeholder="`请选择${item.name || item.label}`" class="edit-input"
                      @change="val => onSelectChange(item.key, val)">
                      <el-option v-for="opt in (selectFieldOptions[item.key] || [])" :key="opt.value" :label="opt.label" :value="opt.value" />
                    </el-select>
                    <el-date-picker v-else-if="dateFieldValues.includes(item.fileValue)"
                      v-model="formData[item.key]" size="small" type="datetime"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      :placeholder="`请选择${item.name || item.label}`" class="edit-input"
                      @change="onInput" />
                    <el-input v-else v-model="formData[item.key]" size="small" placeholder="请输入" @input="onInput" class="edit-input" />
                  </template>
                  <template v-else-if="mode === 'preview'">
                    <span class="preview-text">{{ formData[item.key] || '' }}</span>
                  </template>
                  <template v-else-if="mode === 'design'">
                  </template>
                </span>
              </div>
            </div>
          </div>
          <div class="preview-right-section">
            <div v-if="template.qrVisible === 'visible'" class="qr-code-wrapper">
              <slot name="qrcode" :qrStyle="qrCodeStyle">
                <div class="qr-code" :style="qrCodeStyle">
                  二维码占位
                </div>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getPrinterConfig } from './storage'

export default {
  name: 'LabelTemplatePreview',
  props: {
    template: {
      type: Object,
      required: true,
    },
    formData: {
      type: Object,
      default: () => ({}),
    },
    mode: {
      type: String,
      default: 'preview',
    },
    selectFieldKeys: {
      type: Array,
      default: () => [],
    },
    dateFieldValues: {
      type: Array,
      default: () => [],
    },
    selectFieldOptions: {
      type: Object,
      default: () => () => ({}),
    },
    selectBindValues: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    visibleFields() {
      return (this.template.fields || []).filter(item => item.status !== 'hidden' && item.status !== '隐藏')
    },
    // 纸张宽高比
    labelRatio() {
      const config = getPrinterConfig()
      const w = Number(config.labelWidth) || 100
      const h = Number(config.labelHeight) || 75
      return w / h
    },
    // 预览容器按纸张比例缩放（固定高度，宽度按比例）
    previewBoxStyle() {
      const containerHeight = 560
      const boxWidth = Math.round(containerHeight * this.labelRatio)
      return {
        width: boxWidth + 'px',
        height: containerHeight + 'px',
      }
    },
    titleStyle() {
      const bold = this.template.titleStatus === 'bold' || this.template.titleStatus === '加粗'
      const disabled = this.template.titleStatus === 'disabled' || this.template.titleStatus === '禁用'
      return {
        fontWeight: bold ? 700 : 400,
        opacity: disabled ? 0.45 : 1,
      }
    },
    qrCodeStyle() {
      return {}
    },
  },
  methods: {
    fieldStyle(item) {
      return {}
    },
    onInput() {
      this.$emit('input-change')
    },
    onSelectChange(fieldKey, value) {
      this.$emit('select-change', { fieldKey, value })
      this.onInput()
    },
  },
}
</script>

<style lang="scss" scoped>
.preview-scaler {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.preview-box {
  background-color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  transition: all 0.3s;
  overflow: hidden;
  flex: none;
}

.preview-inner {
  display: flex;
  flex-direction: column;
  border: 2px solid #1b2129;
  height: 100%;
  box-sizing: border-box;
  color: #1b2129;
}

.preview-title {
  height: 10%;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5vh;
  font-weight: 700;
  border-bottom: 2px solid #1b2129;
  text-align: center;
  padding: 0 10px;
  line-height: 1.2;
  box-sizing: border-box;
}

.preview-body {
  flex: 1;
  min-height: 0;
  display: grid;
  /* 文字区域 60%，二维码区域 40%，与打印模板一致 */
  grid-template-columns: 6fr 4fr;
}

.preview-left-section {
  display: flex;
  flex-direction: column;
  border-right: 2px solid #1b2129;
}

.preview-grid {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .preview-field {
    border-bottom: 1px solid #c4c9cf;
    display: flex;
    align-items: center;
    flex: 1;
    font-size: 2vh;

    &.disabled {
      opacity: 0.45;
    }

    .field-label-preview {
      padding-left: 4%;
      border-right: 1px solid #c4c9cf;
      height: 100%;
      display: flex;
      align-items: center;
      width: 38%;
      box-sizing: border-box;
    }

    &.double .field-label-preview {
      width: 50%;
    }

    .field-value-preview {
      flex: 1;
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 4%;

      .edit-input {
        width: 100%;
      }

      .preview-text {
        word-break: break-all;
      }
    }
  }
}

.preview-right-section {
  display: flex;
  flex-direction: column;

  .qr-code-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    box-sizing: border-box;
  }

  .qr-code {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #999;
    background: #f5f5f5;
    border: none;
    box-shadow: none;
    margin: 0;
  }
}
</style>
