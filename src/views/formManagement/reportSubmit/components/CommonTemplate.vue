<template>
  <div class="common-template">
    <!-- 页眉 -->
    <div class="report-header">
      <div class="header-left">
        <div class="header-row">
          <span>密级：</span>
          <el-select v-model="form.classification" size="mini" style="width: 100px;">
            <el-option label="内部" value="内部" />
            <el-option label="秘密" value="秘密" />
            <el-option label="机密" value="机密" />
          </el-select>
        </div>
        <div class="header-row">表号：{{ config.tableNo }}</div>
      </div>
      <div class="header-center">{{ config.title }}</div>
      <div class="header-right">
        <div class="header-row" style="text-align: right;">格式：{{ config.formatNo }}</div>
      </div>
    </div>

    <!-- 主体表格（两栏式） -->
    <table class="report-table">
      <tbody>
        <tr v-for="(row, idx) in templateConfig.leftRows" :key="idx">
          <!-- 左侧输入栏 -->
          <td class="label-cell">{{ row.label }}</td>
          <template v-if="row.type === 'range'">
            <td style="width: 50%;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="white-space:nowrap;">起</span>
                <el-input v-model="form[row.prop + 'Start']" size="mini" :placeholder="row.placeholders[0]" />
                <span style="white-space:nowrap;">止</span>
                <el-input v-model="form[row.prop + 'End']" size="mini" :placeholder="row.placeholders[1]" />
              </div>
            </td>
          </template>
          <template v-else>
            <td><el-input v-model="form[row.prop]" size="mini" :placeholder="row.placeholder" /></td>
          </template>

          <!-- 右侧签名盖章栏（仅前两行） -->
          <template v-if="idx === 0">
            <td class="label-cell" style="width: 120px;">负责人（签字）</td>
            <td class="sign-cell"><div class="sign-area"></div></td>
          </template>
          <template v-else-if="idx === 1">
            <td class="label-cell">制表人（签字）</td>
            <td class="sign-cell"><div class="sign-area"></div></td>
          </template>
          <template v-else-if="idx === 2">
            <td class="label-cell" :rowspan="rowspanCount">单位领导签名和单位盖章</td>
            <td class="sign-cell" :rowspan="rowspanCount" style="vertical-align: top;">
              <div class="seal-area"></div>
              <div class="date-mark">年&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;日</div>
            </td>
          </template>
        </tr>
      </tbody>
    </table>

    <!-- 页脚 -->
    <div class="report-footer">
      <span>批准机关：国家统计局</span>
      <span>批准文号：XXX字（xxxx）xxx号</span>
      <span>制表机关：X材料XX办公室</span>
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
  },
  data() {
    return {
      form: { classification: '内部' },
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
  },
  watch: {
    form: {
      deep: true,
      handler(val) { this.$emit('update', val) },
    },
    formData: {
      immediate: true,
      handler(val) { if (val && Object.keys(val).length) Object.assign(this.form, val) },
    },
  },
}
</script>

<style lang="scss" scoped>
.common-template {
  font-family: SimSun, serif;
  .report-header {
    display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;
    .header-left, .header-right { width: 260px; }
    .header-center { font-size: 20px; font-weight: bold; text-align: center; flex: 1; }
    .header-row { margin-bottom: 4px; font-size: 13px; }
  }
  .report-table {
    width: 100%; border-collapse: collapse; margin-bottom: 8px;
    td, th { border: 1px solid #000; padding: 6px 8px; font-size: 13px; vertical-align: middle; }
    .label-cell { background: #f5f7fa; text-align: center; white-space: nowrap; min-width: 100px; }
    .sign-cell { min-width: 150px; }
    .sign-area { min-height: 30px; }
    .seal-area { min-height: 100px; }
    .date-mark { text-align: right; font-size: 12px; color: #999; margin-top: 8px; }
  }
  .report-footer {
    display: flex; justify-content: space-between; font-size: 12px; color: #606266; margin-top: 8px;
  }
}
</style>
