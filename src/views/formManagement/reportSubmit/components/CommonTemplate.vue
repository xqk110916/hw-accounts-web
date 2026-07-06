<template>
  <div class="common-template">
    <!-- 极简高雅报表纸质感 -->
    <div class="report-paper">
      <!-- 页眉 (分层排版：密级居顶，大标题独占中行，格式与表号同列于下，格式居左、表号居右) -->
      <div class="report-header">
        <div class="header-meta-row">
          <div class="header-row label-with-select">
            <span class="label">密级：</span>
            <el-select v-model="form.securityLevel" size="mini" class="modern-select-mini no-print" filterable>
              <el-option v-for="opt in securityOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <span class="print-only print-text-inline" style="font-weight: bold;">{{ securityLevelLabel }}</span>
          </div>
        </div>
        
        <div class="header-title-row">
          <div class="main-title">{{ config.title }}</div>
          <div class="title-sub-bar"></div>
        </div>
        
        <div class="header-sub-row">
          <div class="header-row format-tag">
              <span class="no-print">格式：</span><el-input v-model="form.format" size="mini" class="tag-input no-print" :placeholder="config.formatNo" />
              <span class="print-only">格式：{{ form.format || config.formatNo }}</span>
            </div>
          <div class="header-row code-tag">
              <span class="no-print">表号：</span><el-input v-model="form.formNo" size="mini" class="tag-input no-print" :placeholder="config.tableNo" />
              <span class="print-only">表号：{{ form.formNo || config.tableNo }}</span>
            </div>
        </div>
      </div>

      <!-- 主体表格（两栏式） -->
      <div class="table-container">
        <table class="report-table">
          <tbody>
            <tr v-for="(row, idx) in templateConfig.leftRows" :key="idx">
              <!-- 左侧输入栏 -->
              <td class="label-cell">{{ row.label }}</td>
              <template v-if="row.type === 'monthrange'">
                <td style="width: 50%;">
                  <div class="no-print" style="width: 100%;">
                    <el-date-picker
                      v-model="tempRange[row.prop]"
                      type="monthrange"
                      size="mini"
                      range-separator="至"
                      start-placeholder="开始月份"
                      end-placeholder="结束月份"
                      value-format="yyyy-MM-dd"
                      class="modern-date-picker"
                      style="width: 100%;"
                    />
                  </div>
                  <div class="print-only" style="font-family: SimSun, serif; font-size: 12px; color: #000;">
                    {{ form[row.prop + 'Start'] ? formatPrintMonth(form[row.prop + 'Start']) : '' }} 至 {{ form[row.prop + 'End'] ? formatPrintMonth(form[row.prop + 'End']) : '' }}
                  </div>
                </td>
              </template>
              <template v-else-if="row.type === 'daterange'">
                <td style="width: 50%;">
                  <div class="no-print" style="width: 100%;">
                    <el-date-picker
                      v-model="tempRange[row.prop]"
                      type="daterange"
                      size="mini"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      value-format="yyyy-MM-dd"
                      class="modern-date-picker"
                      style="width: 100%;"
                    />
                  </div>
                  <div class="print-only" style="font-family: SimSun, serif; font-size: 12px; color: #000;">
                    {{ form[row.prop + 'Start'] ? form[row.prop + 'Start'] : '' }} 至 {{ form[row.prop + 'End'] ? form[row.prop + 'End'] : '' }}
                  </div>
                </td>
              </template>
              <template v-else-if="row.type === 'date'">
                <td style="width: 50%;">
                  <div class="no-print" style="width: 100%;">
                    <el-date-picker
                      v-model="form[row.prop]"
                      type="date"
                      size="mini"
                      :placeholder="row.placeholder || '请选择日期'"
                      value-format="yyyy-MM-dd"
                      class="modern-date-picker"
                      style="width: 100%;"
                    />
                  </div>
                  <div class="print-only" style="font-family: SimSun, serif; font-size: 12px; color: #000;">
                    {{ form[row.prop] || '' }}
                  </div>
                </td>
              </template>
              <template v-else-if="row.type === 'range'">
                <td style="width: 50%;">
                  <div class="range-input-wrapper">
                    <span class="range-badge">起</span>
                    <el-input v-model="form[row.prop + 'Start']" size="mini" :placeholder="row.placeholders[0]" class="modern-input" />
                    <span class="range-badge">止</span>
                    <el-input v-model="form[row.prop + 'End']" size="mini" :placeholder="row.placeholders[1]" class="modern-input" />
                  </div>
                </td>
              </template>
              <template v-else-if="row.type === 'autocomplete'">
                <td style="width: 50%;">
                  <el-autocomplete
                    v-model="form[row.prop]"
                    :fetch-suggestions="(queryString, cb) => queryUnitSearch(queryString, cb, row.prop)"
                    :value-key="getUnitValueKey(row.prop)"
                    :placeholder="row.placeholder"
                    size="mini"
                    clearable
                    class="modern-input"
                    @select="item => handleUnitSelect(item, row.prop)"
                  />
                </td>
              </template>
              <template v-else>
                <td style="width: 50%;">
                  <el-input v-model="form[row.prop]" size="mini" :placeholder="row.placeholder" class="modern-input" />
                </td>
              </template>

              <!-- 右侧签名盖章栏（仅前两行以及合并行） -->
              <template v-if="idx === 0">
                <td class="label-cell" style="width: 120px;">负责人</td>
                <td class="sign-cell">
                  <div class="sign-area-wrapper">
                    <el-input v-model="form.responsiblePerson" size="mini" placeholder="请输入负责人" class="modern-input inline-input no-print" style="width: 140px;" />
                    <span class="print-only print-text">{{ form.responsiblePerson }}</span>
                  </div>
                </td>
              </template>
              <template v-else-if="idx === 1">
                <td class="label-cell" style="width: 120px;">制表人</td>
                <td class="sign-cell">
                  <div class="sign-area-wrapper">
                    <el-input v-model="form.maker" size="mini" placeholder="请输入制表人" class="modern-input inline-input no-print" style="width: 140px;" />
                    <span class="print-only print-text">{{ form.maker }}</span>
                  </div>
                </td>
              </template>
              <template v-else-if="idx === 2">
                <td class="label-cell" :rowspan="rowspanCount" style="width: 120px;">单位领导签名<br/>和单位盖章</td>
                <td class="sign-cell seal-cell" :rowspan="rowspanCount" style="vertical-align: top;">
                  <div class="seal-container">
                    <div class="seal-area">
                      <span class="seal-placeholder">（ 盖章处 ）</span>
                    </div>
                    <div class="date-mark">年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</div>
                  </div>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 页脚 -->
      <div class="report-footer">
        <div class="footer-meta">
          <span class="meta-item no-print" style="display: inline-flex; align-items: center; gap: 2px;">
            批准机关：<el-input v-model="form.approvalOrg" size="mini" placeholder="请输入" class="modern-input inline-input" style="width: 120px;" />
          </span>
          <span class="print-only meta-item">批准机关：{{ form.approvalOrg }}</span>
          <span class="meta-item no-print" style="display: inline-flex; align-items: center; gap: 2px;">
            批准文号：<el-input v-model="form.approvalNo" size="mini" placeholder="请输入" class="modern-input inline-input" style="width: 160px;" />
          </span>
          <span class="print-only meta-item">批准文号：{{ form.approvalNo }}</span>
          <span class="meta-item no-print" style="display: inline-flex; align-items: center; gap: 2px;">
            制表机关：<el-input v-model="form.makeOrg" size="mini" placeholder="请输入" class="modern-input inline-input" style="width: 140px;" />
          </span>
          <span class="print-only meta-item">制表机关：{{ form.makeOrg }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reportConfigs, templateConfigs } from './reportConfigs.js'

export default {
  name: 'CommonTemplate',
  props: {
    code: { type: String, required: true },
    formData: { type: Object, default: () => ({}) },
    securityOptions: { type: Array, default: () => [] },
    unitList: { type: Array, default: () => [] },
  },
  data() {
    return {
      form: { securityLevel: '', format: '', formNo: '', maker: '', approvalOrg: '', approvalNo: '', makeOrg: '', responsiblePerson: '' },
      tempRange: {},
    }
  },
  computed: {
    config() {
      return reportConfigs[this.code] || {}
    },
    templateConfig() {
      return templateConfigs[this.code] || { leftRows: [] }
    },
    rowspanCount() {
      return Math.max(this.templateConfig.leftRows.length - 2, 1)
    },
    securityLevelLabel() {
      const option = this.securityOptions.find(opt => opt.value === this.form.securityLevel)
      return option ? option.label : this.form.securityLevel
    },
  },
  watch: {
    form: {
      deep: true,
      handler(val) {
        // 反向同步到 tempRange
        if (this.templateConfig && this.templateConfig.leftRows) {
          this.templateConfig.leftRows.forEach(row => {
            if (row.type === 'monthrange' || row.type === 'daterange') {
              const startVal = val[row.prop + 'Start'] || ''
              const endVal = val[row.prop + 'End'] || ''
              if (startVal && endVal) {
                const temp = this.tempRange[row.prop] || []
                if (temp[0] !== startVal || temp[1] !== endVal) {
                  this.$set(this.tempRange, row.prop, [startVal, endVal])
                }
              } else {
                if (this.tempRange[row.prop]) {
                  this.$set(this.tempRange, row.prop, null)
                }
              }
            }
          })
        }
        this.$emit('update', val)
      },
    },
    formData: {
      immediate: true,
      handler(val) {
        if (val && Object.keys(val).length) {
          Object.assign(this.form, val)
        } else {
          Object.keys(this.form).forEach(key => {
            this.form[key] = ''
          })
        }
      },
    },
    tempRange: {
      deep: true,
      handler(val) {
        if (!val) return
        if (this.templateConfig && this.templateConfig.leftRows) {
          this.templateConfig.leftRows.forEach(row => {
            if (row.type === 'monthrange' || row.type === 'daterange') {
              const arr = val[row.prop]
              if (Array.isArray(arr) && arr.length === 2) {
                const sVal = arr[0] || ''
                const eVal = arr[1] || ''
                if (this.form[row.prop + 'Start'] !== sVal) {
                  this.$set(this.form, row.prop + 'Start', sVal)
                }
                if (this.form[row.prop + 'End'] !== eVal) {
                  this.$set(this.form, row.prop + 'End', eVal)
                }
              } else {
                if (this.form[row.prop + 'Start'] !== '') {
                  this.$set(this.form, row.prop + 'Start', '')
                }
                if (this.form[row.prop + 'End'] !== '') {
                  this.$set(this.form, row.prop + 'End', '')
                }
              }
            }
          })
        }
      }
    },
  },
  methods: {
    formatPrintMonth(val) {
      if (!val) return ''
      return val.length > 7 ? val.substring(0, 7) : val
    },
    getUnitValueKey(prop) {
      if (prop === 'unitName') return 'unitName'
      if (prop === 'unitCode') return 'unitCode'
      if (prop === 'licenseNo') return 'licenseNo'
      return 'unitName'
    },
    queryUnitSearch(queryString, cb, prop) {
      const list = this.unitList || []
      const key = this.getUnitValueKey(prop)
      const keyword = (queryString || '').toLowerCase()
      const results = keyword
        ? list.filter(item => (item[key] || '').toLowerCase().includes(keyword))
        : list
      cb(results)
    },
    handleUnitSelect(item, prop) {
      // 仅选择单位名称时联动填充单位代号和许可证号
      if (prop === 'unitName' && item) {
        this.$set(this.form, 'unitCode', item.unitCode || '')
        this.$set(this.form, 'licenseNo', item.licenseNo || '')
      }
    },
  },
}
</script>

<style lang="scss" scoped>
/* -------------------------------------------------------------
 * 屏幕上显示的极简典雅现代风格 (Screen Mode Style)
 * ------------------------------------------------------------- */
.common-template {
  width: 100%;
  box-sizing: border-box;
  padding: 4px;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  /* 屏幕状态下隐藏专属打印纯文本 */
  .print-only {
    display: none !important;
  }

  .report-paper {
    background: #ffffff;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    padding: 24px;
    box-sizing: border-box;
    position: relative;
  }

  /* 页眉布局 (分层排版) */
  .report-header {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 8px;
    margin-bottom: 16px;

    .header-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .header-title-row {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      text-align: center;
      margin: 4px 0;

      .main-title {
        font-size: 20px;
        font-weight: 700;
        color: #0f172a;
        letter-spacing: 1px;
        margin-bottom: 4px;
      }

      .title-sub-bar {
        width: 120px;
        height: 2px;
        background: #475569;
        border-radius: 1px;
        opacity: 0.5;
      }
    }

    .header-sub-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .header-row {
      font-size: 12px;
      color: #475569;
      line-height: 1.4;
    }

    .label-with-select {
      display: flex;
      align-items: center;
      gap: 4px;
      .label {
        font-weight: 500;
        color: #475569;
        white-space: nowrap; /* 绝对禁止换行 */
        width: 45px; /* 强制 label 占用固定 45px 宽度 */
        display: inline-block;
        flex-shrink: 0; /* 绝对不被压缩 */
      }
    }

    .code-tag, .format-tag {
      font-size: 11px;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      color: #475569;
      display: inline-flex;
      align-items: center;
      width: fit-content;
    }

    .tag-input {
      width: 130px;
      ::v-deep .el-input__inner {
        border: none;
        background: transparent;
        font-size: 11px;
        padding: 0 2px;
        height: 20px;
        line-height: 20px;
        color: #475569;
      }
    }
  }

  /* 表格容器 */
  .table-container {
    width: 100%;
    border: 1px solid #64748b;
    overflow: hidden;
    margin-bottom: 12px;
  }

  /* 报表主体表格 */
  .report-table {
    width: 100%;
    border-collapse: collapse;
    background: #ffffff;

    td {
      border: 1px solid #64748b;
      padding: 8px 12px;
      font-size: 12px;
      color: #0f172a;
      vertical-align: middle;
    }

    .label-cell {
      background: #f8fafc;
      color: #334155;
      font-weight: 500;
      text-align: center;
      white-space: nowrap;
      min-width: 90px;
    }

    /* 范围输入栏（起止式） */
    .range-input-wrapper {
      display: flex;
      align-items: center;
      gap: 4px;

      .range-badge {
        font-size: 11px;
        color: #64748b;
        background: #f1f5f9;
        padding: 1px 4px;
        border-radius: 3px;
        border: 1px solid #cbd5e1;
        white-space: nowrap;
        user-select: none;
      }

      .el-date-editor.el-input {
        flex: 1;
        width: 0; /* 允许 flex 压缩并均分空间 */
      }
    }

    /* 签名与盖章单元格 */
    .sign-cell {
      min-width: 140px;
      background: #ffffff;
    }

    .sign-area-wrapper {
      position: relative;
      min-height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;

      .sign-placeholder {
        font-size: 11px;
        color: #94a3b8;
      }
    }

    .seal-cell {
      background: #ffffff;
      padding: 8px;
    }

    .seal-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 110px;
      justify-content: space-between;
    }

    .seal-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60px;
      border: 1px dashed #cbd5e1;
      border-radius: 4px;
      background-color: #fafbfc;
      margin: 4px 0;
    }

    .seal-placeholder {
      font-size: 11px;
      color: #94a3b8;
    }

    .date-mark {
      text-align: right;
      font-size: 11px;
      color: #64748b;
    }
  }

  /* 输入框与下拉控件屏幕无框美化 */
  ::v-deep {
    .modern-input {
      .el-input__inner {
        border: 1px solid transparent;
        background-color: transparent;
        color: #0f172a;
        font-weight: 500;
        padding-left: 2px;
        padding-right: 2px;
        font-size: 12px;
        border-radius: 4px;
        transition: all 0.15s ease;

        &:hover {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }

        &:focus {
          background-color: #ffffff;
          border-color: #246fe5;
        }
      }

      &.inline-input .el-input__inner {
        border-bottom: 1px dashed #64748b;
        border-radius: 0;
        padding-bottom: 2px;
        &:focus {
          border-bottom-style: solid;
          border-bottom-color: #246fe5;
        }
      }
    }

    .modern-date-picker {
      &.el-date-editor {
        border: 1px solid transparent;
        background-color: transparent;
        padding: 3px 5px;
        height: 28px;
        line-height: 22px;
        border-radius: 4px;
        transition: all 0.15s ease;
        display: inline-flex;
        align-items: center;

        .el-range-input {
          background-color: transparent;
          color: #0f172a;
          font-weight: 500;
          font-size: 12px;
        }

        .el-range-separator {
          line-height: 20px;
          font-size: 11px;
          color: #64748b;
        }

        .el-input__icon {
          line-height: 20px;
        }

        &:hover {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }

        &.is-active, &:focus-within {
          background-color: #ffffff;
          border-color: #246fe5;
        }
      }
    }

    .modern-select-mini {
      width: 95px; /* 适当放宽，支持更多字符 */
      transition: all 0.3s ease;
      
      .el-input__inner {
        border: none;
        border-bottom: 1px dashed #cbd5e1; /* 极简虚线下划线，更具纸质填空感 */
        background-color: transparent; /* 背景透明，融入纸张 */
        font-size: 11px;
        font-weight: bold; /* 加粗显示密级 */
        border-radius: 0; /* 移除圆角以配合下划线样式 */
        height: 22px;
        line-height: 22px;
        padding-left: 4px;
        padding-right: 20px; /* 留出箭头空间 */
        color: #334155;
        transition: all 0.2s ease;
        
        &:hover {
          border-bottom: 1px solid #94a3b8;
          color: #0f172a;
        }
        &:focus {
          border-bottom: 1px solid #246fe5;
          background-color: #f8fafc; /* 聚焦时柔和背景 */
          color: #246fe5;
        }
      }
      .el-input__icon {
        line-height: 22px;
        color: #94a3b8;
        transition: color 0.2s ease;
      }
      &:hover .el-input__icon {
        color: #64748b;
      }
    }
  }

  /* 页脚 */
  .report-footer {
    border-top: 1px solid #e2e8f0;
    padding-top: 8px;
    margin-top: 12px;

    .footer-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .meta-item {
      font-size: 11px;
      color: #475569;
    }
  }
}

/* -------------------------------------------------------------
 * 严格遵照打印规范的打印风格 (Print Mode Style)
 * ------------------------------------------------------------- */
@media print {
  .common-template {
    background: transparent !important;
    padding: 0 !important;
    font-family: SimSun, serif !important;

    /* 打印模式下的双流显隐切换 */
    .no-print {
      display: none !important;
    }
    .print-only {
      display: inline-block !important;
    }

    .report-paper {
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
    }

    .report-header {
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
      gap: 6px !important;
      margin-bottom: 12px !important;

      .header-meta-row {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        width: 100% !important;
      }

      .header-title-row {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100% !important;
        text-align: center !important;
        margin: 6px 0 !important;

        .main-title {
          font-size: 20px !important;
          font-weight: bold !important;
          color: #000 !important;
          font-family: SimSun, serif !important;
          letter-spacing: 1px !important;
        }

        .title-sub-bar {
          display: none !important;
        }
      }

      .header-sub-row {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        width: 100% !important;
      }

      .code-tag, .format-tag {
        background: transparent !important;
        padding: 0 !important;
        color: #000 !important;
        font-family: SimSun, serif !important;
        font-size: 12px !important;
      }

      .label-with-select {
        .label, .print-text-inline {
          font-size: 12px !important;
          font-weight: bold !important;
          font-family: SimSun, serif !important;
          color: #000000 !important;
        }
      }
    }

    .table-container {
      border: none !important;
    }

    .report-table {
      border-collapse: collapse !important;
      td {
        border: 1px solid #000000 !important;
        padding: 5px 8px !important;
        color: #000000 !important;
        font-family: SimSun, serif !important;
        font-size: 12px !important;
        background: transparent !important;
      }

      .label-cell {
        background: transparent !important;
        color: #000000 !important;
        font-family: SimSun, serif !important;
        border-right: 1px solid #000000 !important;
        font-weight: bold !important;
        text-align: center !important;
        white-space: nowrap !important;
        width: 120px !important;
      }

      .range-input-wrapper {
        .range-badge {
          background: transparent !important;
          color: #000 !important;
          font-family: SimSun, serif !important;
          font-weight: normal !important;
          padding: 0 2px !important;
          border: none !important;
        }
      }

      .sign-cell {
        background: transparent !important;
        width: 180px !important;
      }

      .sign-area-wrapper {
        min-height: 20px !important;
        .sign-placeholder {
          display: none !important;
        }
      }

      .seal-cell {
        background: transparent !important;
        width: 180px !important;
      }

      .seal-container {
        min-height: 100px !important;
      }

      .seal-area {
        background: transparent !important;
        border: none !important;
      }

      .seal-placeholder {
        display: none !important;
      }

      .date-mark {
        color: #000 !important;
      }
    }

    /* 打印时输入控件转换为纯文本展示 */
    ::v-deep {
      .el-input__inner, .el-select .el-input__inner {
        border: none !important;
        padding: 0 !important;
        background: transparent !important;
        height: auto !important;
        line-height: inherit !important;
        color: #000000 !important;
        font-family: SimSun, serif !important;
        font-size: 12px !important;
      }
      .el-input__suffix, .el-input__prefix {
        display: none !important;
      }
    }

    .report-footer {
      border: none !important;
      margin-top: 12px !important;
      padding: 0 !important;
      width: 100% !important;

      .footer-meta {
        display: flex !important;
        flex-direction: row !important;
        justify-content: space-between !important;
        align-items: center !important;
        width: 100% !important;
      }

      .meta-item {
        color: #000000 !important;
        font-family: SimSun, serif !important;
        font-size: 11px !important;
      }
    }
  }
}
</style>
