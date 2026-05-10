<template>
  <el-dialog
    title="编辑模版"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="92%"
    top="4vh"
    append-to-body
    :before-close="handleClose"
  >
    <div class="template-dialog" v-loading="templateLoading">
      <div class="config-panel">
        <div class="form-row">
          <span class="row-label">模板名称</span>
          <el-select v-model="templateForm['模板']" size="small" class="template-select" @change="handleTemplateChange">
            <el-option v-for="item in templateOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-button size="small" @click="handleCreateTemplate">新增</el-button>
        </div>

        <div class="form-row">
          <span class="row-label">标题</span>
          <el-input v-model="templateForm['标题']" size="small" class="title-input" @input="refreshPreview"></el-input>
          <el-select v-model="templateForm['标题显示状态']" size="small" class="small-select" @change="refreshPreview">
            <el-option label="显示" value="显示"></el-option>
            <el-option label="隐藏" value="隐藏"></el-option>
          </el-select>
          <el-select v-model="templateForm['标题字号']" size="small" class="small-select" @change="refreshPreview">
            <el-option v-for="item in fontSizeOptions" :key="item" :label="item" :value="item"></el-option>
          </el-select>
          <el-select v-model="templateForm['标题状态']" size="small" class="state-select" @change="refreshPreview">
            <el-option v-for="item in titleStatusOptions" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </div>

        <div v-for="(item, index) in fieldConfigList" :key="item.label" class="form-row field-row">
          <span class="sort-icons">
            <i v-if="index > 0" class="el-icon-top" @click="moveField(index, -1)"></i>
            <i v-if="index < fieldConfigList.length - 1" class="el-icon-bottom" @click="moveField(index, 1)"></i>
          </span>
          <span class="field-label">{{ item.label }}</span>
          <el-input v-model="item.value" size="small" class="field-input" @input="handleFieldChange"></el-input>
          <el-select v-model="item['排版']" size="small" class="mini-select" @change="refreshPreview">
            <el-option label="单排" value="单排"></el-option>
            <el-option label="双排" value="双排"></el-option>
          </el-select>
          <el-select v-model="item['字号']" size="small" class="mini-select" @change="refreshPreview">
            <el-option v-for="font in fontSizeOptions" :key="font" :label="font" :value="font"></el-option>
          </el-select>
          <el-select v-model="item['状态']" size="small" class="state-select" @change="refreshPreview">
            <el-option v-for="state in fieldStatusOptions" :key="state" :label="state" :value="state"></el-option>
          </el-select>
          <el-button size="mini" class="icon-btn">+</el-button>
          <el-button size="mini" class="icon-btn minus">-</el-button>
        </div>

        <div class="form-row">
          <span class="sort-icons"><i class="el-icon-top"></i></span>
          <span class="field-label">二维码</span>
          <el-input v-model="qrWidth" size="small" class="qr-input" @input="handleQrSizeChange"></el-input>
          <span class="multiply">×</span>
          <el-input v-model="qrHeight" size="small" class="qr-input" @input="handleQrSizeChange"></el-input>
          <el-select v-model="templateForm['显示状态']" size="small" class="state-select" @change="refreshPreview">
            <el-option label="显示" value="显示"></el-option>
            <el-option label="隐藏" value="隐藏"></el-option>
          </el-select>
        </div>

        <div class="margin-title">边距设置</div>
        <div class="margin-grid">
          <div class="margin-item">
            <span>上边距</span>
            <el-input v-model="templateForm['上边距']" size="small" @input="refreshPreview"></el-input>
          </div>
          <div class="margin-item">
            <span>下边距</span>
            <el-input v-model="templateForm['下边距']" size="small" @input="refreshPreview"></el-input>
          </div>
          <div class="margin-item">
            <span>左边距</span>
            <el-input v-model="templateForm['左边距']" size="small" @input="refreshPreview"></el-input>
          </div>
          <div class="margin-item">
            <span>右边距</span>
            <el-input v-model="templateForm['右边距']" size="small" @input="refreshPreview"></el-input>
          </div>
        </div>
      </div>

      <div class="preview-panel">
        <div class="preview-head">
          <span>预览</span>
          <i class="el-icon-refresh" @click="refreshPreview"></i>
        </div>
        <div class="preview-card" v-loading="previewLoading">
          <div class="preview-left">
            <div class="preview-title">{{ templateForm['标题'] }}</div>
            <div class="preview-grid">
              <div>{{ fieldConfigList[0] && fieldConfigList[0].value }}</div>
              <div></div>
              <div>{{ fieldConfigList[1] && fieldConfigList[1].value }}</div>
              <div></div>
              <div>{{ fieldConfigList[2] && fieldConfigList[2].value }}</div>
              <div></div>
              <div>{{ fieldConfigList[3] && fieldConfigList[3].value }}</div>
              <div></div>
              <div>{{ fieldConfigList[4] && fieldConfigList[4].value }}</div>
              <div></div>
              <div></div>
              <div></div>
              <div>{{ fieldConfigList[5] && fieldConfigList[5].value }}</div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          <div class="preview-qr">
            <div class="qr-label">二维码</div>
            <div v-if="templateForm['显示状态'] === '显示'" class="qr-code"></div>
          </div>
        </div>
      </div>
    </div>
    <div slot="footer">
      <el-button size="small" @click="handleClose">关闭</el-button>
      <el-button type="primary" size="small" :loading="saveTemplateLoading" @click="handleSaveTemplate">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'TemplateDialog',
  data() {
    return {
      visible: false,
      templateLoading: false,
      previewLoading: false,
      saveTemplateLoading: false,
      templateOptions: [{ label: '模板1', value: '模板1' }],
      fontSizeOptions: ['12号', '14号', '16号', '18号'],
      titleStatusOptions: ['正常', '加粗', '禁用'],
      fieldStatusOptions: ['正常', '隐藏', '禁用'],
      qrWidth: '50mm',
      qrHeight: '50mm',
      templateForm: {
        '模板': '模板1',
        '标题': '材料管理卡',
        '标题显示状态': '显示',
        '标题字号': '16号',
        '标题状态': '正常',
        '二维码': '50mm×50mm',
        '显示状态': '显示',
        '上边距': '10mm',
        '下边距': '10mm',
        '左边距': '10mm',
        '右边距': '10mm',
      },
      fieldConfigList: [],
    }
  },
  methods: {
    open() {
      this.initFieldConfigList()
      this.visible = true
      this.refreshPreview()
    },
    initFieldConfigList() {
      this.fieldConfigList = [
        { label: '字段1', value: '材料编码', '排版': '单排', '字号': '16号', '状态': '正常' },
        { label: '字段2', value: '生产单位', '排版': '单排', '字号': '16号', '状态': '正常' },
        { label: '字段3', value: '库房', '排版': '单排', '字号': '16号', '状态': '正常' },
        { label: '字段4', value: '入库人', '排版': '单排', '字号': '16号', '状态': '正常' },
        { label: '字段5', value: '容器号', '排版': '单排', '字号': '16号', '状态': '正常' },
        { label: '字段6', value: '入库时间', '排版': '单排', '字号': '16号', '状态': '正常' },
      ]
    },
    handleTemplateChange() {
      this.templateLoading = true
      setTimeout(() => {
        this.initFieldConfigList()
        this.templateLoading = false
        this.refreshPreview()
      }, 200)
    },
    handleCreateTemplate() {
      this.$prompt('请输入模板名称', '新增').then(({ value }) => {
        if (!value || !value.trim()) {
          this.$message.warning('请输入模板名称')
          return
        }
        const exists = this.templateOptions.some(item => item.value === value)
        if (exists) {
          this.$message.warning('模板名称不能重复')
          return
        }
        this.templateOptions.push({ label: value, value: value })
        this.templateForm['模板'] = value
        this.refreshPreview()
      }).catch(() => {})
    },
    moveField(index, step) {
      const target = index + step
      if (target < 0 || target >= this.fieldConfigList.length) return
      const current = this.fieldConfigList[index]
      this.fieldConfigList.splice(index, 1)
      this.fieldConfigList.splice(target, 0, current)
      this.refreshPreview()
    },
    handleFieldChange() {
      this.refreshPreview()
    },
    handleQrSizeChange() {
      this.templateForm['二维码'] = this.qrWidth + '×' + this.qrHeight
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
      if (!this.templateForm['模板']) {
        this.$message.warning('请选择模板')
        return false
      }
      if (!this.templateForm['标题'] || !this.templateForm['标题'].trim()) {
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
      const marginKeys = ['上边距', '下边距', '左边距', '右边距']
      const invalidMargin = marginKeys.some(key => !/^\d+mm$/.test(this.templateForm[key]))
      if (invalidMargin) {
        this.$message.warning('边距格式应为数字mm')
        return false
      }
      if (!/^\d+mm×\d+mm$/.test(this.templateForm['二维码'])) {
        this.$message.warning('二维码格式应为数字mm×数字mm')
        return false
      }
      return true
    },
    handleSaveTemplate() {
      if (!this.validateTemplate()) return
      this.saveTemplateLoading = true
      setTimeout(() => {
        this.saveTemplateLoading = false
        this.$message.success('保存成功')
        this.handleClose()
      }, 300)
    },
    handleClose() {
      this.visible = false
    },
  },
}
</script>

<style lang="scss" scoped>
.template-dialog {
  display: flex;
  min-height: 620px;
  color: #1b2129;
  .config-panel {
    width: 660px;
    padding-right: 24px;
    box-sizing: border-box;
  }
  .preview-panel {
    flex: 1;
    min-width: 0;
  }
  .form-row {
    display: flex;
    align-items: center;
    margin-bottom: 14px;
    .row-label {
      width: 92px;
      text-align: right;
      padding-right: 12px;
      box-sizing: border-box;
    }
    .template-select {
      width: 380px;
      margin-right: 8px;
    }
    .title-input {
      width: 190px;
    }
    .small-select {
      width: 78px;
      margin-left: 4px;
    }
    .state-select {
      width: 140px;
      margin-left: 4px;
    }
    .field-label {
      width: 70px;
    }
    .field-input {
      width: 190px;
    }
    .mini-select {
      width: 78px;
      margin-left: 4px;
    }
    .icon-btn {
      width: 24px;
      height: 24px;
      padding: 0;
      margin-left: 6px;
      color: #246fe5;
      border-color: #246fe5;
      &.minus {
        color: #e68600;
        border-color: #e68600;
      }
    }
  }
  .sort-icons {
    width: 72px;
    display: inline-flex;
    justify-content: flex-end;
    align-items: center;
    font-size: 28px;
    color: #1b2129;
    i {
      cursor: pointer;
      margin-left: 6px;
    }
  }
  .qr-input {
    width: 160px;
  }
  .multiply {
    font-size: 28px;
    padding: 0 10px;
  }
  .margin-title {
    margin-top: 34px;
    margin-bottom: 10px;
    font-size: 24px;
    font-weight: 700;
  }
  .margin-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 48px;
    row-gap: 22px;
    width: 570px;
    .margin-item {
      display: grid;
      grid-template-columns: 72px 1fr;
      align-items: center;
    }
  }
  .preview-head {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 42px;
    font-size: 24px;
    font-weight: 700;
    .el-icon-refresh {
      margin-left: 18px;
      cursor: pointer;
    }
  }
  .preview-card {
    display: grid;
    grid-template-columns: 1fr 1.15fr;
    border: 2px solid #1b2129;
    min-height: 610px;
    .preview-left {
      border-right: 2px solid #1b2129;
    }
    .preview-title {
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 700;
      border-bottom: 1px solid #c4c9cf;
    }
    .preview-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(4, 122px);
      > div {
        border-right: 1px solid #c4c9cf;
        border-bottom: 1px solid #c4c9cf;
        display: flex;
        align-items: center;
        padding-left: 8px;
        font-size: 18px;
      }
    }
    .preview-qr {
      .qr-label {
        height: 52px;
        line-height: 52px;
        text-align: center;
        font-size: 24px;
        border-bottom: 2px solid #1b2129;
      }
      .qr-code {
        width: 450px;
        height: 450px;
        margin: 24px auto 0;
        background:
          linear-gradient(90deg, #000 10px, transparent 10px) 0 0 / 42px 42px,
          linear-gradient(#000 10px, transparent 10px) 0 0 / 42px 42px,
          #fff;
        border: 20px solid #fff;
        box-shadow: inset 0 0 0 34px #000, inset 0 0 0 58px #fff, inset 0 0 0 82px #000;
      }
    }
  }
}
</style>
