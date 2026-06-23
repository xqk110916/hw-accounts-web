export const REPORT_PRINT_STYLES = `
        /* 通用打印复位与版面微调 */
        body {
          margin: 10px;
          font-family: SimSun, serif !important;
          background: transparent !important;
          color: #000000 !important;
        }
        
        /* 1. 双流渲染隐藏/显示机制 */
        .no-print {
          display: none !important;
        }
        .print-only {
          display: inline-block !important;
        }
        
        /* 2. 印刷级纯文本样式 */
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
        
        /* 3. R01材料交接表 打印版面控制 */
        .r01-template {
          background: transparent !important;
          padding: 0 !important;
          font-family: SimSun, serif !important;
          width: 100% !important;
        }
        .r01-template .report-paper {
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .r01-template .report-header {
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
          gap: 6px !important;
          margin-bottom: 12px !important;
        }
        .r01-template .report-header .header-meta-row {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          width: 100% !important;
        }
        .r01-template .report-header .header-title-row {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          text-align: center !important;
          margin: 6px 0 !important;
        }
        .r01-template .report-header .header-title-row .main-title {
          font-size: 20px !important;
          font-weight: bold !important;
          color: #000 !important;
          font-family: SimSun, serif !important;
          letter-spacing: 1px !important;
        }
        .r01-template .report-header .header-title-row .title-sub-bar {
          display: none !important;
        }
        .r01-template .report-header .header-sub-row {
          display: flex !important;
          justify-content: flex-end !important;
          width: 100% !important;
        }
        .r01-template .report-header .code-tag,
        .r01-template .report-header .format-tag {
          background: transparent !important;
          padding: 0 !important;
          color: #000 !important;
          font-family: SimSun, serif !important;
          font-size: 12px !important;
        }
        .r01-template .report-header .label-with-select {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          white-space: nowrap !important;
        }
        .r01-template .report-header .label-with-select .label,
        .r01-template .report-header .label-with-select .print-text-inline {
          font-size: 12px !important;
          font-weight: bold !important;
          font-family: SimSun, serif !important;
          color: #000000 !important;
        }
        .r01-template .table-container {
          width: 100% !important;
          border: none !important;
          margin-bottom: 12px !important;
        }
        .r01-template .report-table {
          width: 100% !important;
          border-collapse: collapse !important;
          table-layout: fixed !important;
        }
        .r01-template .report-table td {
          border: 1px solid #000000 !important;
          padding: 5px 8px !important;
          color: #000000 !important;
          font-family: SimSun, serif !important;
          font-size: 11px !important;
          background: transparent !important;
          vertical-align: middle !important;
        }
        .r01-template .report-table .side-label {
          font-family: SimSun, serif !important;
          background: transparent !important;
          color: #000 !important;
          border-right: 1px solid #000000 !important;
          width: 32px !important;
          text-align: center !important;
          vertical-align: middle !important;
          padding: 4px !important;
        }
        .r01-template .report-table .side-label .side-text-wrapper {
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
        .r01-template .report-table .label-cell {
          background: transparent !important;
          color: #000000 !important;
          font-family: SimSun, serif !important;
          border-right: 1px solid #000000 !important;
          font-weight: bold !important;
          text-align: center !important;
        }
        .r01-template .report-table .seal-cell {
          background: transparent !important;
          width: 33% !important;
        }
        .r01-template .report-table .seal-container {
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          min-height: 140px !important;
        }
        .r01-template .report-table .seal-container .seal-title {
          font-size: 11px !important;
          color: #000 !important;
          text-align: center !important;
          line-height: 1.4 !important;
        }
        .r01-template .report-table .seal-container .seal-area {
          background: transparent !important;
          border: 1px dashed #000000 !important;
          height: 80px !important;
          min-height: 80px !important;
          display: block !important;
          margin: 8px 0 !important;
        }
        .r01-template .report-table .seal-container .seal-placeholder {
          display: none !important;
        }
        .r01-template .report-table .sign-area-wrapper {
          min-height: 20px !important;
          display: flex !important;
          align-items: center !important;
        }
        .r01-template .report-table .sign-area-wrapper.flex-between {
          position: relative !important;
          display: block !important;
          min-height: 44px !important;
          width: 100% !important;
        }
        .r01-template .report-table .sign-area-wrapper.flex-between .date-mark {
          position: absolute !important;
          bottom: 0px !important;
          right: 4px !important;
          font-size: 11px !important;
          color: #000000 !important;
        }
        .r01-template .report-table .sign-area-wrapper .sign-placeholder {
          display: none !important;
        }
        .r01-template .report-table .section-header-row td {
          border-top: 1px solid #000000 !important;
        }
        .r01-template .report-table .report-no-row td {
          border-top: 1px solid #000000 !important;
        }
        .r01-template .report-table .date-mark {
          color: #000 !important;
          font-size: 11px !important;
          text-align: right !important;
        }
        .r01-template .report-table .copies-row td {
          padding: 0 !important;
        }
        .r01-template .report-table .copies-flex-wrapper {
          display: table !important;
          width: 100% !important;
          table-layout: fixed !important;
        }
        .r01-template .report-table .copy-flex-card {
          display: table-cell !important;
          width: 20% !important;
          text-align: center !important;
          vertical-align: top !important;
          border: none !important;
          background: transparent !important;
          padding: 8px 4px !important;
          box-sizing: border-box !important;
        }
        .r01-template .report-table .copy-flex-card:not(:last-child) {
          border-right: 1px solid #000000 !important;
        }
        .r01-template .report-table .copy-flex-card .copy-badge {
          display: none !important;
        }
        .r01-template .report-table .copy-flex-card .copy-text {
          font-size: 11px !important;
          color: #000000 !important;
          line-height: 1.3 !important;
        }
        .r01-template .report-footer {
          border: none !important;
          margin-top: 12px !important;
          color: #000000 !important;
          font-family: SimSun, serif !important;
          font-size: 11px !important;
          display: flex !important;
          flex-direction: row !important;
          justify-content: space-between !important;
          align-items: center !important;
          width: 100% !important;
        }
        .r01-template .report-footer .footer-label {
          color: #000000 !important;
        }
        .r01-template .report-footer .footer-item {
          display: flex !important;
          align-items: center !important;
        }
        .r01-template .report-footer .placeholder-line {
          border-bottom: 1px solid #000000 !important;
          min-width: 120px !important;
          width: 120px !important;
          display: inline-block !important;
          height: 16px !important;
        }
        
        /* 4. Common通用报表 打印版面控制 */
        .common-template {
          background: transparent !important;
          padding: 0 !important;
          font-family: SimSun, serif !important;
          width: 100% !important;
        }
        .common-template .report-paper {
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .common-template .report-header {
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
          gap: 6px !important;
          margin-bottom: 12px !important;
        }
        .common-template .report-header .header-meta-row {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          width: 100% !important;
        }
        .common-template .report-header .header-title-row {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          text-align: center !important;
          margin: 6px 0 !important;
        }
        .common-template .report-header .header-title-row .main-title {
          font-size: 20px !important;
          font-weight: bold !important;
          color: #000 !important;
          font-family: SimSun, serif !important;
          letter-spacing: 1px !important;
        }
        .common-template .report-header .header-title-row .title-sub-bar {
          display: none !important;
        }
        .common-template .report-header .header-sub-row {
          display: flex !important;
          justify-content: flex-end !important;
          width: 100% !important;
        }
        .common-template .report-header .code-tag,
        .common-template .report-header .format-tag {
          background: transparent !important;
          padding: 0 !important;
          color: #000 !important;
          font-family: SimSun, serif !important;
          font-size: 12px !important;
        }
        .common-template .report-header .label-with-select {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          white-space: nowrap !important;
        }
        .common-template .report-header .label-with-select .label,
        .common-template .report-header .label-with-select .print-text-inline {
          font-size: 12px !important;
          font-weight: bold !important;
          font-family: SimSun, serif !important;
          color: #000000 !important;
        }
        .common-template .table-container {
          width: 100% !important;
          border: none !important;
          margin-bottom: 12px !important;
        }
        .common-template .report-table {
          width: 100% !important;
          border-collapse: collapse !important;
          table-layout: fixed !important;
        }
        .common-template .report-table td {
          border: 1px solid #000000 !important;
          padding: 5px 8px !important;
          color: #000000 !important;
          font-family: SimSun, serif !important;
          font-size: 12px !important;
          background: transparent !important;
          vertical-align: middle !important;
        }
        .common-template .report-table .label-cell {
          background: transparent !important;
          color: #000000 !important;
          font-family: SimSun, serif !important;
          border-right: 1px solid #000000 !important;
          font-weight: bold !important;
          text-align: center !important;
          white-space: nowrap !important;
          width: 120px !important;
        }
        .common-template .report-table .range-input-wrapper {
          display: flex !important;
          align-items: center !important;
        }
        .common-template .report-table .range-input-wrapper .range-badge {
          background: transparent !important;
          color: #000 !important;
          font-family: SimSun, serif !important;
          font-weight: normal !important;
          padding: 0 2px !important;
          border: none !important;
        }
        .common-template .report-table .sign-cell {
          background: transparent !important;
          width: 180px !important;
        }
        .common-template .report-table .sign-area-wrapper {
          min-height: 20px !important;
          display: flex !important;
          align-items: center !important;
        }
        .common-template .report-table .sign-area-wrapper .sign-placeholder {
          display: none !important;
        }
        .common-template .report-table .seal-cell {
          background: transparent !important;
          width: 180px !important;
        }
        .common-template .report-table .seal-container {
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          min-height: 100px !important;
        }
        .common-template .report-table .seal-area {
          background: transparent !important;
          border: none !important;
        }
        .common-template .report-table .seal-placeholder {
          display: none !important;
        }
        .common-template .report-table .date-mark {
          color: #000 !important;
          font-size: 11px !important;
          text-align: right !important;
        }
        .common-template .el-input__inner,
        .common-template .el-select .el-input__inner {
          border: none !important;
          padding: 0 !important;
          background: transparent !important;
          height: auto !important;
          line-height: inherit !important;
          color: #000000 !important;
          font-family: SimSun, serif !important;
          font-size: 12px !important;
        }
        .common-template .el-input__suffix,
        .common-template .el-input__prefix {
          display: none !important;
        }
        .common-template .report-footer {
          border: none !important;
          margin-top: 12px !important;
          padding: 0 !important;
          width: 100% !important;
        }
        .common-template .report-footer .footer-meta {
          display: flex !important;
          flex-direction: row !important;
          justify-content: space-between !important;
          align-items: center !important;
          width: 100% !important;
        }
        .common-template .report-footer .meta-item {
          color: #000000 !important;
          font-family: SimSun, serif !important;
          font-size: 11px !important;
        }
`;
