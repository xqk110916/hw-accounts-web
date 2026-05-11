# 标签模板管理

标签模板管理用于维护标签打印记录、配置材料管理卡模板，并通过 `public/js/ZPL_JSSdk0.0.0.3.js` 对接本机 JSSDK 打印服务。

## 打印接入

- 打印入口位于新增/编辑记录弹窗的“打印”按钮。
- 默认打印服务为 `127.0.0.1:9099`，默认型号为 `HT300`，默认连接方式为 `USB`。
- 支持 USB、NET、COM 三种连接方式；打印配置统一由 `public/config.js` 中的 `window.globalConfig.ZPL_PRINTER_CONFIG` 控制，界面不展示打印机参数。
- 打印前会校验标签字段和二维码内容，随后通过 `Vue.prototype.$zplPrinter` 建立 WebSocket 连接并发送 ZPL 指令。

## 本地闭环数据

- `localStorage.labelTemplate.templates` 保存模板配置。
- `localStorage.labelTemplate.records` 保存打印记录。
- 模板包含标题、字段、二维码显示状态和边距配置；打印记录保存模板快照和字段快照，便于详情回显。
- 后续接入真实后端时，优先替换 `components/storage.js` 中的数据读写方法，页面交互可保持不变。
