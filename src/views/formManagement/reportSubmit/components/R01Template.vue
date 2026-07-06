<template>
  <div class="r01-template">
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
          <div class="main-title">材料交接统计报表</div>
          <div class="title-sub-bar"></div>
        </div>
        
        <div class="header-sub-row">
          <div class="header-row format-tag">
              <span class="no-print">格式：</span><el-input v-model="form.format" size="mini" class="tag-input no-print" placeholder="X管办94R01号" />
              <span class="print-only">格式：{{ form.format || 'X管办94R01号' }}</span>
            </div>
          <div class="header-row code-tag">
              <span class="no-print">表号：</span><el-input v-model="form.formNo" size="mini" class="tag-input no-print" placeholder="材料R01表" />
              <span class="print-only">表号：{{ form.formNo || '材料R01表' }}</span>
            </div>
        </div>
      </div>

      <!-- 主体表格：发方 | 收方 (完美网格对齐，100% 包含在表内，绝无凸起) -->
      <div class="table-container">
        <table class="report-table">
          <colgroup>
            <col style="width: 3%;" />
            <col style="width: 10%;" />
            <col style="width: 22%;" />
            <col style="width: 10%;" />
            <col style="width: 22%;" />
            <col style="width: 33%;" />
          </colgroup>
          <tbody>
            <!-- ==================== 发方信息 (6行) ==================== -->
            <tr class="section-header-row">
              <!-- 最左侧侧边栏，跨越 6 行，宽度收缩 -->
              <td class="side-label" rowspan="6">
                <div class="side-text-wrapper">发方信息</div>
              </td>
              <td class="label-cell">单位名称</td>
              <td colspan="3">
                <el-autocomplete
                  v-model="form.senderUnitName"
                  :fetch-suggestions="(queryString, cb) => queryUnitSearch(queryString, cb, 'unitName')"
                  value-key="unitName"
                  placeholder="请选择或输入单位名称"
                  size="mini"
                  clearable
                  class="modern-input no-print"
                  @select="item => handleUnitSelect(item, 'sender')"
                />
                <span class="print-only print-text">{{ form.senderUnitName }}</span>
              </td>
              <!-- 最右侧盖章列，完美跨满发方 6 行，显示在表内，面积放大 -->
              <td class="seal-cell" rowspan="6">
                <div class="seal-container">
                  <span class="seal-title">发方单位领导签名<br/>和单位盖章</span>
                  <div class="seal-area">
                    <span class="seal-placeholder">（ 盖章处 ）</span>
                  </div>
                  <div class="date-mark">年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="label-cell">单位代号</td>
              <td>
                <el-autocomplete
                  v-model="form.senderUnitCode"
                  :fetch-suggestions="(queryString, cb) => queryUnitSearch(queryString, cb, 'unitCode')"
                  value-key="unitCode"
                  placeholder="单位代号"
                  size="mini"
                  clearable
                  class="modern-input no-print"
                />
                <span class="print-only print-text">{{ form.senderUnitCode }}</span>
              </td>
              <td class="label-cell">许可证号</td>
              <td>
                <el-autocomplete
                  v-model="form.senderLicenseNo"
                  :fetch-suggestions="(queryString, cb) => queryUnitSearch(queryString, cb, 'licenseNo')"
                  value-key="licenseNo"
                  placeholder="许可证号"
                  size="mini"
                  clearable
                  class="modern-input no-print"
                />
                <span class="print-only print-text">{{ form.senderLicenseNo }}</span>
              </td>
            </tr>
            <tr>
              <td class="label-cell">发货日期</td>
              <td colspan="3">
                <el-date-picker 
                  v-model="form.sendDate" 
                  type="date" 
                  size="mini" 
                  placeholder="选择发货日期" 
                  value-format="yyyy-MM-dd" 
                  class="modern-date-picker no-print" 
                />
                <span class="print-only print-text">{{ form.sendDate }}</span>
              </td>
            </tr>
            <tr>
              <td class="label-cell">发货地点</td>
              <td colspan="3">
                <el-input v-model="form.sendLocation" size="mini" placeholder="请输入发货地点" class="modern-input no-print" />
                <span class="print-only print-text">{{ form.sendLocation }}</span>
              </td>
            </tr>
            <tr>
              <td class="label-cell">发货人</td>
              <td colspan="3">
                <el-input v-model="form.sender" size="mini" placeholder="请输入发货人" class="modern-input no-print" />
                <span class="print-only print-text">{{ form.sender }}</span>
              </td>
            </tr>
            <tr>
              <td class="label-cell">核查人</td>
              <td colspan="3">
                <div class="sign-area-wrapper flex-between">
                  <span class="sign-placeholder">（ 签字 ）</span>
                  <div class="date-mark">年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</div>
                </div>
              </td>
            </tr>

            <!-- ==================== 收方信息 (6行) ==================== -->
            <tr class="section-header-row">
              <!-- 最左侧侧边栏，跨越 6 行，宽度收缩 -->
              <td class="side-label" rowspan="6">
                <div class="side-text-wrapper">收方信息</div>
              </td>
              <td class="label-cell">单位名称</td>
              <td colspan="3">
                <el-autocomplete
                  v-model="form.receiverUnitName"
                  :fetch-suggestions="(queryString, cb) => queryUnitSearch(queryString, cb, 'unitName')"
                  value-key="unitName"
                  placeholder="请选择或输入单位名称"
                  size="mini"
                  clearable
                  class="modern-input no-print"
                  @select="item => handleUnitSelect(item, 'receiver')"
                />
                <span class="print-only print-text">{{ form.receiverUnitName }}</span>
              </td>
              <!-- 最右侧盖章列，完美跨满收方 6 行，显示在表内，面积放大 -->
              <td class="seal-cell" rowspan="6">
                <div class="seal-container">
                  <span class="seal-title">收方单位领导签名<br/>和单位盖章</span>
                  <div class="seal-area">
                    <span class="seal-placeholder">（ 盖章处 ）</span>
                  </div>
                  <div class="date-mark">年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="label-cell">单位代号</td>
              <td>
                <el-autocomplete
                  v-model="form.receiverUnitCode"
                  :fetch-suggestions="(queryString, cb) => queryUnitSearch(queryString, cb, 'unitCode')"
                  value-key="unitCode"
                  placeholder="单位代号"
                  size="mini"
                  clearable
                  class="modern-input no-print"
                />
                <span class="print-only print-text">{{ form.receiverUnitCode }}</span>
              </td>
              <td class="label-cell">许可证号</td>
              <td>
                <el-autocomplete
                  v-model="form.receiverLicenseNo"
                  :fetch-suggestions="(queryString, cb) => queryUnitSearch(queryString, cb, 'licenseNo')"
                  value-key="licenseNo"
                  placeholder="许可证号"
                  size="mini"
                  clearable
                  class="modern-input no-print"
                />
                <span class="print-only print-text">{{ form.receiverLicenseNo }}</span>
              </td>
            </tr>
            <tr>
              <td class="label-cell">收货日期</td>
              <td colspan="3">
                <el-date-picker 
                  v-model="form.receiveDate" 
                  type="date" 
                  size="mini" 
                  placeholder="选择收货日期" 
                  value-format="yyyy-MM-dd" 
                  class="modern-date-picker no-print" 
                />
                <span class="print-only print-text">{{ form.receiveDate }}</span>
              </td>
            </tr>
            <tr>
              <td class="label-cell">收货地点</td>
              <td colspan="3">
                <el-input v-model="form.receiveLocation" size="mini" placeholder="请输入收货地点" class="modern-input no-print" />
                <span class="print-only print-text">{{ form.receiveLocation }}</span>
              </td>
            </tr>
            <tr>
              <td class="label-cell">收货人</td>
              <td colspan="3">
                <el-input v-model="form.receiver" size="mini" placeholder="请输入收货人" class="modern-input no-print" />
                <span class="print-only print-text">{{ form.receiver }}</span>
              </td>
            </tr>
            <tr>
              <td class="label-cell">核收入</td>
              <td colspan="3">
                <div class="sign-area-wrapper flex-between">
                  <span class="sign-placeholder">（ 签字 ）</span>
                  <div class="date-mark">年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</div>
                </div>
              </td>
            </tr>

            <!-- ==================== 报表编号行 (整齐对齐 6 列) ==================== -->
            <tr class="report-no-row">
              <td class="label-cell bg-transparent" colspan="2" style="font-weight: 600;">报表编号</td>
              <td colspan="2">
                <el-input v-model="form.reportNo" size="mini" placeholder="请输入报表编号" class="modern-input no-print" style="font-weight: 500;" />
                <span class="print-only print-text" style="font-weight: bold; font-size: 12px; display: block; text-align: left; padding-left: 4px;">{{ form.reportNo }}</span>
              </td>
              <td colspan="2" class="align-right-cell">
                <span class="no-print" style="display: inline-flex; align-items: center; gap: 2px; width: 100%;">
                  <span class="dispatch-text" style="white-space: nowrap;">本份单据发往单位（</span>
                  <el-input v-model="form.postUnit" size="mini" placeholder="请输入" class="modern-input" style="flex: 1;" />
                  <span class="dispatch-text" style="white-space: nowrap;">）</span>
                </span>
                <span class="print-only" style="font-family: SimSun, serif; font-size: 11px; color: #000;">本份单据发往单位（ {{ form.postUnit }} ）</span>
              </td>
            </tr>

            <!-- ==================== 单据联次 (使用 100% 均匀 Flex 容器展示) ==================== -->
            <tr class="copies-row">
              <td colspan="6">
                <div class="copies-flex-wrapper">
                  <div v-for="(copy, idx) in copyItems" :key="idx" class="copy-flex-card">
                    <div class="copy-badge">第 {{ idx + 1 }} 联</div>
                    <div class="copy-text" v-html="copy"></div>
                    <div class="date-mark">年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 页脚 -->
      <div class="report-footer">
        <div class="footer-item tabulator-field">
          <span class="footer-label">发方制表人：</span>
          <el-input v-model="form.senderTabulator" size="mini" style="width: 140px;" placeholder="系统预设可修改" class="modern-input inline-input no-print" />
          <span class="print-only print-text" style="border-bottom: 1px solid #000000; min-width: 120px; display: inline-block; text-align: center; font-family: SimSun, serif; font-size: 11px;">{{ form.senderTabulator }}</span>
        </div>
        <div class="footer-item reviewer-field">
          <span class="footer-label">收方制表人：</span>
          <el-input v-model="form.receiverMaker" size="mini" style="width: 140px;" placeholder="请输入" class="modern-input inline-input no-print" />
          <span class="print-only print-text" style="border-bottom: 1px solid #000000; min-width: 120px; display: inline-block; text-align: center; font-family: SimSun, serif; font-size: 11px;">{{ form.receiverMaker }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'R01Template',
  props: {
    formData: { type: Object, default: () => ({}) },
    securityOptions: { type: Array, default: () => [] },
    unitList: { type: Array, default: () => [] },
  },
  data() {
    return {
      form: {
        securityLevel: '',
        senderUnitName: '', senderUnitCode: '', senderLicenseNo: '',
        sendDate: '', sendLocation: '', sender: '',
        receiverUnitName: '', receiverUnitCode: '', receiverLicenseNo: '',
        receiveDate: '', receiveLocation: '', receiver: '',
        reportNo: '', senderTabulator: '', receiverMaker: '',
        format: '', formNo: '', postUnit: '',
      },
      copyItems: [
        '1（&nbsp;&nbsp;）发方留存',
        '2（&nbsp;&nbsp;）发方寄X管办',
        '3（&nbsp;&nbsp;）发方留存备查',
        '4（&nbsp;&nbsp;）收方返还发方',
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
  },
  computed: {
    securityLevelLabel() {
      const option = this.securityOptions.find(opt => opt.value === this.form.securityLevel)
      return option ? option.label : this.form.securityLevel
    },
  },
  methods: {
    queryUnitSearch(queryString, cb, field) {
      const list = this.unitList || []
      const keyword = (queryString || '').toLowerCase()
      const results = keyword
        ? list.filter(item => (item[field] || '').toLowerCase().includes(keyword))
        : list
      cb(results)
    },
    handleUnitSelect(item, side) {
      // 选择单位名称时，自动填充对应侧的单位代号和许可证号
      if (!item) return
      const prefix = side === 'sender' ? 'sender' : 'receiver'
      this.$set(this.form, `${prefix}UnitName`, item.unitName || '')
      this.$set(this.form, `${prefix}UnitCode`, item.unitCode || '')
      this.$set(this.form, `${prefix}LicenseNo`, item.licenseNo || '')
    },
  },
}
</script>

<style lang="scss" scoped>
/* -------------------------------------------------------------
 * 屏幕上显示的极简典雅现代风格 (Screen Mode Style)
 * ------------------------------------------------------------- */
.r01-template {
  width: 100%;
  box-sizing: border-box;
  padding: 4px;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  /* 屏幕显示时，默认隐藏打印元素 */
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

  /* 表格大容器 */
  .table-container {
    width: 100%;
    border: 1px solid #64748b;
    overflow: hidden;
    margin-bottom: 12px;
  }

  /* 报送表格重构 (无缝格线对齐) */
  .report-table {
    width: 100%;
    border-collapse: collapse;
    background: #ffffff;
    table-layout: fixed; /* 强制等宽布局以便严格精准对齐 */

    td {
      border: 1px solid #64748b;
      padding: 6px 8px;
      font-size: 11px;
      color: #0f172a;
      vertical-align: middle;
      box-sizing: border-box;
    }

    /* 侧边信息栏字宽压缩 */
    .side-label {
      text-align: center;
      font-weight: 600;
      background: #f8fafc;
      color: #334155;
      padding: 10px 2px !important;

      .side-text-wrapper {
        writing-mode: vertical-rl;
        text-orientation: mixed;
        letter-spacing: 3px;
        font-size: 11px;
        line-height: 1.2;
        margin: 0 auto;
      }
    }

    /* 标签单元格 */
    .label-cell {
      background: #f8fafc;
      color: #334155;
      font-weight: 500;
      text-align: center;
      white-space: nowrap;

      &.bg-transparent {
        background: transparent;
      }
    }

    /* 对齐样式 */
    .align-right-cell {
      text-align: right;
      padding-right: 12px;
      color: #475569;
    }

    /* 盖章单元格面积放大，完美契合在表内右侧 */
    .seal-cell {
      width: 33% !important; 
      background: #ffffff;
      padding: 10px 8px !important;
    }

    .seal-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 160px; /* 大幅放大高度 */
      justify-content: space-between;

      .seal-title {
        font-size: 11px;
        font-weight: 600;
        color: #334155;
        text-align: center;
        line-height: 1.4;
      }
    }

    .seal-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 90px; /* 盖章框高度放大 */
      border: 1px dashed #cbd5e1;
      border-radius: 4px;
      background-color: #fafbfc;
      margin: 8px 0;
    }

    .seal-placeholder {
      font-size: 11px;
      color: #94a3b8;
    }

    .sign-area-wrapper {
      position: relative;
      min-height: 24px;
      display: flex;
      align-items: center;
      padding-left: 4px;

      &.flex-between {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .sign-placeholder {
        font-size: 11px;
        color: #94a3b8;
      }
    }

    .date-mark {
      text-align: right;
      font-size: 11px;
      color: #64748b;
    }

    /* 给大区域交界行设置统一风格的分割线，确保完美连续、粗细一致 */
    .section-header-row td {
      border-top: 1px solid #64748b !important;
    }

    .report-no-row td {
      border-top: 1px solid #64748b !important;
    }

    .dispatch-text {
      font-size: 11px;
      color: #334155;
    }

    .placeholder-underline {
      display: inline-block;
      border-bottom: 1px dashed #475569;
      width: 40px;
    }

    /* 均匀联次 */
    .copies-row {
      background: #ffffff;
      td {
        padding: 0 !important; /* 彻底去除边距让 Flex 无缝贴紧 td 边界 */
      }
    }

    .copies-flex-wrapper {
      display: flex;
      width: 100%;
      gap: 0 !important; /* 彻底去除 gap 间隙 */
    }

    .copy-flex-card {
      flex: 1;
      text-align: center;
      background: #ffffff;
      border: none !important; /* 去除四周包裹的边框 */
      padding: 12px 4px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 80px;

      /* 只在挨着的中间部分添加边框，右侧单线 */
      &:not(:last-child) {
        border-right: 1px solid #64748b !important;
      }

      .copy-badge {
        display: inline-block;
        font-size: 10px;
        font-weight: 600;
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #cbd5e1;
        padding: 1px 4px;
        border-radius: 3px;
        margin: 0 auto 6px auto;
        width: fit-content;
      }

      .copy-text {
        font-size: 11px;
        color: #0f172a;
        margin-bottom: 6px;
        line-height: 1.3;
      }
    }
  }

  /* 输入控件在屏幕上的无框下划线微动效 */
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

    .modern-select {
      width: 100%;
      .el-input__inner {
        border: 1px solid transparent;
        background-color: transparent;
        color: #0f172a;
        font-weight: 500;
        font-size: 12px;
        border-radius: 4px;
        &:hover {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }
        &:focus {
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

    .modern-date-picker {
      width: 100% !important;
      .el-input__inner {
        border: 1px solid transparent;
        background-color: transparent;
        color: #0f172a;
        font-weight: 500;
        font-size: 12px;
        border-radius: 4px;
        padding-left: 24px;
        &:hover {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }
        &:focus {
          background-color: #ffffff;
          border-color: #246fe5;
        }
      }
      .el-input__prefix {
        left: 2px;
        color: #64748b;
      }
    }
  }

  /* 页脚 */
  .report-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #475569;
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid #e2e8f0;

    .footer-item {
      display: flex;
      align-items: center;
    }

    .footer-label {
      font-weight: 500;
      color: #475569;
    }

    .placeholder-line {
      display: inline-block;
      border-bottom: 1px dashed #cbd5e1;
      height: 16px;
    }
  }
}

/* -------------------------------------------------------------
 * 严格遵照打印规范的打印风格 (Print Mode Style)
 * ------------------------------------------------------------- */
@media print {
  .r01-template {
    background: transparent !important;
    padding: 0 !important;
    font-family: SimSun, serif !important;

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
      table-layout: fixed !important;

      td {
        border: 1px solid #000000 !important;
        padding: 5px 8px !important;
        color: #000000 !important;
        font-family: SimSun, serif !important;
        font-size: 11px !important;
        background: transparent !important;
      }

      .side-label {
        font-family: SimSun, serif !important;
        background: transparent !important;
        color: #000 !important;
        border-right: 1px solid #000000 !important;
        width: 32px !important;
        text-align: center !important;
        vertical-align: middle !important;
        padding: 4px !important;

        .side-text-wrapper {
          writing-mode: horizontal-tb !important;
          width: 14px !important;
          margin: 0 auto !important;
          word-break: break-all !important;
          text-align: center !important;
          line-height: 1.4 !important;
          font-size: 11px !important;
          font-weight: bold !important;
          letter-spacing: 0 !important;
        }
      }

      .label-cell {
        background: transparent !important;
        color: #000000 !important;
        font-family: SimSun, serif !important;
        border-right: 1px solid #000000 !important;
        font-weight: bold !important;
      }

      .seal-cell {
        background: transparent !important;
        width: 33% !important;
      }

      .seal-container {
        min-height: 140px !important;
        .seal-title {
          font-size: 11px !important;
          color: #000 !important;
        }
      }

      .seal-area {
        background: transparent !important;
        border: 1px dashed #000000 !important;
        height: 80px !important;
        min-height: 80px !important;
        display: block !important; /* 强制 block 避开 Flexbox 塌缩 */
      }

      .seal-placeholder {
        display: none !important;
      }

      .sign-area-wrapper {
        min-height: 20px !important;
        .sign-placeholder {
          display: none !important;
        }
      }

      .sign-area-wrapper.flex-between {
        position: relative !important;
        display: block !important;
        min-height: 44px !important;
        width: 100% !important;

        .date-mark {
          position: absolute !important;
          bottom: 0px !important;
          right: 4px !important;
          font-size: 11px !important;
          color: #000000 !important;
        }
      }

      .section-header-row td {
        border-top: 1px solid #000000 !important;
      }

      .report-no-row td {
        border-top: 1px solid #000000 !important;
      }

      .date-mark {
        color: #000 !important;
      }

      .copies-row {
        td {
          padding: 0 !important;
        }
      }

      .copies-flex-wrapper {
        display: table !important;
        width: 100% !important;
        table-layout: fixed !important;
      }

      .copy-flex-card {
        display: table-cell !important;
        width: 20% !important;
        text-align: center !important;
        vertical-align: top !important;
        border: none !important;
        background: transparent !important;
        padding: 8px 4px !important;
        box-sizing: border-box !important;

        &:not(:last-child) {
          border-right: 1px solid #000000 !important;
        }

        .copy-badge {
          display: none !important;
        }
        .copy-text {
          font-size: 11px !important;
          color: #000000 !important;
          line-height: 1.3 !important;
        }
      }
    }

    .no-print {
      display: none !important;
    }

    .print-only {
      display: inline-block !important;
    }

    /* 打印纯文本渲染样式 */
    .print-text {
      font-family: SimSun, serif !important;
      font-size: 11px !important;
      color: #000000 !important;
      display: block !important;
      text-align: left !important;
      padding-left: 4px !important;
      min-height: 16px !important;
      font-weight: normal !important;
    }

    .print-text-inline {
      font-family: SimSun, serif !important;
      font-size: 11px !important;
      color: #000000 !important;
      display: inline-block !important;
      font-weight: normal !important;
    }

    .report-footer {
      border: none !important;
      margin-top: 6px !important;
      color: #000000 !important;
      font-family: SimSun, serif !important;
      font-size: 11px !important;
      display: flex !important;
      flex-direction: row !important;
      justify-content: space-between !important;
      align-items: center !important;

      .footer-label {
        color: #000000 !important;
      }

      .placeholder-line {
        border-bottom: 1px solid #000000 !important;
        min-width: 120px !important;
        width: 120px !important;
        display: inline-block !important;
        height: 16px !important;
      }
    }
  }
}
</style>
