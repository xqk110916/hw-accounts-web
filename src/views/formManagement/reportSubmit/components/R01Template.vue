<template>
  <div class="r01-template">
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
        <div class="header-row">表号：X材料R01表</div>
      </div>
      <div class="header-center">X材料交接统计报表</div>
      <div class="header-right">
        <div class="header-row" style="text-align: right;">格式：X管办94R01号</div>
      </div>
    </div>

    <!-- 主体表格：发方 | 收方 -->
    <table class="report-table">
      <tbody>
        <!-- 发方头部 -->
        <tr>
          <td class="side-label" rowspan="2">发方</td>
          <td class="label-cell">单位名称</td>
          <td colspan="3"><el-input v-model="form.senderUnitName" size="mini" placeholder="系统预设可修改" /></td>
        </tr>
        <tr>
          <td class="label-cell">单位代号</td>
          <td><el-input v-model="form.senderUnitCode" size="mini" placeholder="系统预设可修改" /></td>
          <td class="label-cell">许可证号</td>
          <td><el-input v-model="form.senderLicenseNo" size="mini" placeholder="系统预设可修改" /></td>
        </tr>
        <!-- 发方签名区 -->
        <tr>
          <td class="label-cell">发货日期</td>
          <td colspan="3"><el-date-picker v-model="form.sendDate" type="date" size="mini" placeholder="日期选择" value-format="yyyy-MM-dd" style="width: 100%;" /></td>
          <td class="side-label" rowspan="4">发方单位领导签名和单位盖章<br/><div class="seal-area"></div><div class="date-mark">年&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;日</div></td>
        </tr>
        <tr>
          <td class="label-cell">发货地点</td>
          <td colspan="3"><el-input v-model="form.sendLocation" size="mini" placeholder="请输入" /></td>
        </tr>
        <tr>
          <td class="label-cell">发货人（签名）</td>
          <td colspan="3"><div class="sign-area"></div></td>
        </tr>
        <tr>
          <td class="label-cell">核查人（签名）</td>
          <td colspan="3"><div class="sign-area"></div><div class="date-mark">年&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;日</div></td>
        </tr>

        <!-- 分隔线 -->
        <tr class="divider-row"><td colspan="5"></td></tr>

        <!-- 收方头部 -->
        <tr>
          <td class="side-label" rowspan="2">收方</td>
          <td class="label-cell">单位名称</td>
          <td colspan="3">
            <el-select v-model="form.receiverUnitName" size="mini" filterable placeholder="选择，后返现单位代号，许可证号" style="width: 100%;">
              <el-option v-for="opt in receiverOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </td>
        </tr>
        <tr>
          <td class="label-cell">单位代号</td>
          <td><el-input v-model="form.receiverUnitCode" size="mini" placeholder="请输入" /></td>
          <td class="label-cell">许可证号</td>
          <td><el-input v-model="form.receiverLicenseNo" size="mini" placeholder="请输入" /></td>
        </tr>
        <!-- 收方签名区 -->
        <tr>
          <td class="label-cell">收货日期</td>
          <td colspan="3"><el-date-picker v-model="form.receiveDate" type="date" size="mini" placeholder="日期选择" value-format="yyyy-MM-dd" style="width: 100%;" /></td>
          <td class="side-label" rowspan="4">收方单位领导签名和单位盖章<br/><div class="seal-area"></div><div class="date-mark">年&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;日</div></td>
        </tr>
        <tr>
          <td class="label-cell">收货地点</td>
          <td colspan="3"><el-input v-model="form.receiveLocation" size="mini" placeholder="请输入" /></td>
        </tr>
        <tr>
          <td class="label-cell">收货人（签名）</td>
          <td colspan="3"><div class="sign-area"></div></td>
        </tr>
        <tr>
          <td class="label-cell">核收入（签名）</td>
          <td colspan="3"><div class="sign-area"></div><div class="date-mark">年&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;日</div></td>
        </tr>

        <!-- 报表编号行 -->
        <tr class="divider-row"><td colspan="5"></td></tr>
        <tr>
          <td class="label-cell" colspan="2">报表编号</td>
          <td><el-input v-model="form.reportNo" size="mini" placeholder="请输入" /></td>
          <td colspan="2" style="text-align: right; padding-right: 10px;">本份单据发往单位（&nbsp;&nbsp;）</td>
        </tr>

        <!-- 单据联次 -->
        <tr>
          <td v-for="(copy, idx) in copyItems" :key="idx" class="copy-cell">
            <div>{{ copy }}</div>
            <div class="date-mark">年&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;日</div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 底部 -->
    <div class="report-footer">
      <span>发方制表人：<el-input v-model="form.senderTabulator" size="mini" style="width: 160px;" placeholder="系统预设可修改" /></span>
      <span>收方制表人：</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'R01Template',
  props: {
    formData: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      form: {
        classification: '内部',
        senderUnitName: '', senderUnitCode: '', senderLicenseNo: '',
        sendDate: '', sendLocation: '',
        receiverUnitName: '', receiverUnitCode: '', receiverLicenseNo: '',
        receiveDate: '', receiveLocation: '',
        reportNo: '', senderTabulator: '',
      },
      receiverOptions: [],
      copyItems: [
        '1（&nbsp;&nbsp;）发方留',
        '2（&nbsp;&nbsp;）发方寄X管办',
        '3（&nbsp;&nbsp;）发方留',
        '4（&nbsp;&nbsp;）收方返发方',
        '5（&nbsp;&nbsp;）收方寄X管办',
      ],
    }
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
.r01-template {
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
    .side-label { text-align: center; font-weight: bold; width: 60px; background: #f5f7fa; writing-mode: vertical-rl; letter-spacing: 4px; }
    .label-cell { background: #f5f7fa; text-align: center; white-space: nowrap; min-width: 90px; }
    .sign-area { min-height: 30px; }
    .seal-area { min-height: 80px; }
    .date-mark { text-align: right; font-size: 12px; color: #999; margin-top: 4px; }
    .divider-row td { border: none; height: 4px; padding: 0; background: #000; }
    .copy-cell { text-align: center; font-size: 12px; vertical-align: middle; }
  }
  .report-footer {
    display: flex; justify-content: space-between; font-size: 13px; margin-top: 8px;
  }
}
</style>
