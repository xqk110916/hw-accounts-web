# 标签模板管理

标签模板管理用于维护标签打印记录、配置材料管理卡模板，并通过 `public/js/ZPL_JSSdk0.0.0.3.js` 对接本机 JSSDK 打印服务。

## 打印接入

- 打印入口位于新增/编辑记录弹窗的“打印”按钮。
- 默认打印服务为 `127.0.0.1:9099`，默认型号为 `HT300`，默认连接方式为 `USB`。
- 支持 USB、NET、COM 三种连接方式；打印配置统一由 `public/config.js` 中的 `window.globalConfig.ZPL_PRINTER_CONFIG` 控制，界面不展示打印机参数。
- 打印前会校验标签字段和二维码内容，随后通过 `Vue.prototype.$zplPrinter` 建立 WebSocket 连接并发送 ZPL 指令。

## 接口数据

- 模板管理按钮打开 `components/TemplateManageDialog.vue`，通过接口分页查询模板列表，并支持新增、编辑和删除模板。
- 单个模板配置由 `components/TemplateDialog.vue` 维护，保存时调用标签模板新增/更新接口。
- 打印记录列表、新增、编辑、详情、删除和导入已接入 `md/数据管理接口.md` 中的 `/busin/label/data/*` 接口。
- `components/storage.js` 仅保留前端打印模板结构转换、默认打印配置和 ZPL 生成所需的辅助方法，不再作为模板和打印记录的数据源。
