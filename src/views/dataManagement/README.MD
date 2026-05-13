# 数据管理菜单业务说明

本文档用于说明 `src/views/dataManagement` 菜单下当前已明确完成或前端部分完成界面的业务边界、数据来源和关键约定，方便后续 Agent 或开发者修改时快速理解上下文。

## 一、菜单结构

当前目录包含以下业务界面：

- `initialEntry/`：初始录入，用于系统建设初期的期初物资数据录入与导入。
- `changeReport/`：变化量报表，用于统计特定周期内物资变动和流水情况。
- `inventoryReport/`：存量报表，用于展示特定时点的库存结余统计。
- `sealLedger/`：封记台账，用于记录封签、启封等生命周期信息。
- `materialManagement/`：材料管理，当前已完成前端界面并对接真实材料代码接口。
- `labelTemplate/`：标签模版管理，当前前端部分完成，以本地闭环数据和打印 JSSDK 为主。
- `comprehensiveQuery/`：综合查询，用于跨业务流水的全局检索与快照查询。
- `accountManagement/`：账目管理，用于处理实物资产变动产生的关联账务数据。

当前维护重点：

- 已完成界面：`materialManagement/` 材料管理。
- 前端部分完成界面：`labelTemplate/` 标签模版管理。

其他界面若发生业务行为、接口、路由或菜单边界变化，应继续在本文档中补充对应说明。

## 二、材料管理 materialManagement

入口文件：`materialManagement/index.vue`

材料管理用于维护系统底层物资材料主数据。页面提供材料代码列表查询、新增、编辑和删除能力，并支持维护材料的元素及同位素含量信息。

核心文件：

- `materialManagement/index.vue`：列表页入口，包含搜索区、操作区、表格区和分页。
- `materialManagement/components/index.js`：列表列配置、搜索项配置、按钮配置和接口函数聚合。
- `materialManagement/components/detail.vue`：新增/编辑弹窗，维护材料基础字段和元素及同位素含量列表。
- `materialManagement/components/api.js`：材料代码接口封装。

主要字段：

- 材料代码：`goodCode`，必填。
- 材料名称：`goodName`，必填。
- 通用名称：`commonName`，必填。
- 常用单位：`commonUnit`，通过字典选择。
- 元素及同位素含量：`elements`，数组结构，每项包含元素名称、同位素、含量。

主要接口：

- 新增：`POST /busin/material-code/add`
- 删除：`DELETE /busin/material-code/delete/{id}`
- 详情：`GET /busin/material-code/detail/{id}`
- 分页列表：`GET /busin/material-code/list`
- 全量列表：`GET /busin/material-code/listAll`
- 更新：`PUT /busin/material-code/update`

常用单位字典：

- 字典父级 ID：`2046860711332478977`
- 加载位置：`materialManagement/components/detail.vue`
- 字典接口：`getDictionaryList({ parentId, currentPage: 1, pageSize: 999 })`

布局约定：

- 页面保持项目标准列表页结构：`wrapper -> content -> right`。
- 右侧内容区顺序为搜索区、操作区、表格区、分页。
- 搜索区使用全局 `search-filter` 组件。
- 新增/编辑弹窗当前位于 `components/detail.vue`，后续若重命名或拆分，应遵循项目 Dialog 独立组件规范。

## 三、标签模版管理 labelTemplate

入口文件：`labelTemplate/index.vue`

标签模版管理用于维护材料管理卡打印记录、编辑标签模版，并通过 `public/js/ZPL_JSSdk0.0.0.3.js` 对接本机 JSSDK 打印服务。该界面当前属于前端部分完成状态：页面交互、模版配置、本地记录和打印链路已具备前端闭环，但数据尚未接入真实后端。

该页面目录下已存在页面级说明：`labelTemplate/README.md`。修改标签打印、模版配置或本地数据结构时，应同步更新该页面级 README。

核心文件：

- `labelTemplate/index.vue`：打印记录列表入口，支持按打印时间筛选、导入、添加、编辑模版、详情、编辑和删除。
- `labelTemplate/components/PrintImportDialog.vue`：导入弹窗，目前仅校验 Excel 文件类型并模拟导入成功。
- `labelTemplate/components/PrintRecordDialog.vue`：新增、编辑、详情和打印记录弹窗。
- `labelTemplate/components/TemplateDialog.vue`：标签模版编辑弹窗，支持字段、标题、二维码和边距配置。
- `labelTemplate/components/storage.js`：本地模版和打印记录读写、默认打印配置合并。
- `labelTemplate/components/print-builder.js`：根据模版和表单数据生成 ZPL 打印数据。
- `labelTemplate/components/api.js`：早期模拟接口，目前主流程以 `storage.js` 的本地数据为准。

本地数据：

- `localStorage.labelTemplate.templates`：保存标签模版配置。
- `localStorage.labelTemplate.records`：保存打印记录。
- 模版包含标题、字段、二维码显示状态和边距配置。
- 打印记录保存模版快照和字段快照，便于详情回显。

打印接入：

- 默认打印服务：`127.0.0.1:9099`
- 默认打印机型号：`HT300`
- 默认连接方式：`USB`
- 支持连接方式：`USB`、`NET`、`COM`
- 打印配置来源：`public/config.js` 中的 `window.globalConfig.ZPL_PRINTER_CONFIG`
- 打印执行链路：校验表单和打印配置后，通过 `Vue.prototype.$zplPrinter` 加载 SDK、建立 WebSocket 连接并发送 ZPL 指令。

打印记录字段：

- 选择模板
- 备注
- 材料编码
- 生成单位
- 库房
- 入库人
- 容器号
- 入库时间
- 二维码内容

当前未完成或需后续对接事项：

- 打印记录和模版配置仍保存在 `localStorage`，尚未接入后端接口。
- 导入功能当前只做 Excel 后缀校验和成功提示，尚未解析文件内容。
- 二维码预览当前是前端样式占位，真实打印内容由 `print-builder.js` 生成。
- 若后续接入真实后端，优先替换 `storage.js` 中的数据读写方法，并保留现有页面交互结构。

## 四、修改注意事项

- 修改材料管理字段、接口参数或字典来源时，需要同步检查 `materialManagement/components/index.js`、`materialManagement/components/detail.vue` 和接口封装。
- 修改标签模版字段时，需要同时检查 `storage.js` 的模版结构、`TemplateDialog.vue` 的编辑表单、`PrintRecordDialog.vue` 的打印表单和 `print-builder.js` 的字段映射。
- 标签模版管理当前使用本地闭环数据，不要误认为列表数据来自 `components/api.js`。
- 新增数据管理下的页面、路由或菜单时，需要同步更新 `docs/SYSTEM_MODULES_MAP.md`、对应模块 README 和菜单配置来源。
