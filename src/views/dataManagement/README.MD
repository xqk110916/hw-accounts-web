# 数据管理菜单业务说明

本文档用于说明 `src/views/dataManagement` 菜单下当前已明确完成或前端部分完成界面的业务边界、数据来源和关键约定，方便后续 Agent 或开发者修改时快速理解上下文。

## 一、菜单结构

当前目录包含以下业务界面：

- `initialEntry/`：初始录入，用于系统建设初期的期初物资数据录入与导入。
- `changeReport/`：变化量报表，用于统计特定周期内物资变动和流水情况。
- `inventoryReport/`：存量报表，用于展示特定时点的库存结余统计。
- `sealLedger/`：封记台账，用于记录封签、启封等生命周期信息。
- `materialManagement/`：材料管理，当前已完成前端界面并对接真实材料代码接口。
- `labelTemplate/`：标签模版管理，已接入标签数据和标签模版后端接口，并保留本机打印 JSSDK 链路。
- `comprehensiveQuery/`：综合查询，用于跨业务流水的全局检索与快照查询。
- `transferBasisQuery/`：调拨依据查询，按调拨依据（调出）聚合查询物资数量与重量，支持下钻容器明细。
- `accountManagement/`：账目管理，用于处理实物资产变动产生的关联账务数据。

当前维护重点：

- 已完成界面：`materialManagement/` 材料管理。
- 已接入接口界面：`labelTemplate/` 标签模版管理。

其他界面若发生业务行为、接口、路由或菜单边界变化，应继续在本文档中补充对应说明。

### 初始录入封记字段

`initialEntry/components/ImportDialog.vue` 的导入明细表展示 `sealCode1`、`sealType1`、`sealCode2`、`sealType2`。封记类型使用字典父级 ID `2052628107427078145`，展示时优先映射字典名称，提交 `dataList` 时保留后端返回的原始字段值。

初始录入审核弹窗打开时调用 `POST /busin/initial/detail` 获取导入明细，审核表格展示接口返回的 `dataList.list`，不使用静态占位数据。
初始录入列表行操作中的“提交”调用 `POST /busin/initial/submitById`，仅按记录 `id` 提交；新增/编辑弹窗内的暂存和提交仍使用 `POST /busin/initial/submit` 携带完整表单数据。

### 字段取值规范

初始录入和标签模版相关页面的表格、表单、弹窗统一按接口字段 key 取值，中文仅作为 label、提示文案或字典展示名使用。除字典/枚举归一化和 `dataJson` 等后端结构转换外，不再通过中文 key 或多个别名字段兜底读取业务值。

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

标签模版管理用于维护材料管理卡打印记录、编辑标签模版，并通过 `public/js/ZPL_JSSdk0.0.0.3.js` 对接本机 JSSDK 打印服务。该界面已接入 `md/数据管理接口.md` 中的标签数据和标签模版接口；本机打印仍由前端 JSSDK 执行。

该页面目录下已存在页面级说明：`labelTemplate/README.md`。修改标签打印、模版配置或本地数据结构时，应同步更新该页面级 README。

核心文件：

- `labelTemplate/index.vue`：打印记录列表入口，支持按打印时间筛选、导入、添加、模版管理、详情、编辑和删除。
- `labelTemplate/components/PrintImportDialog.vue`：导入弹窗，支持选择模版、下载空白 Excel 模版和导入文件。
- `labelTemplate/components/PrintRecordDialog.vue`：新增、编辑、详情和打印记录弹窗。
- `labelTemplate/components/TemplateManageDialog.vue`：标签模版管理弹窗，支持模版列表查询、新增、编辑和删除。
- `labelTemplate/components/TemplateDialog.vue`：标签模版新增/编辑弹窗，支持字段、标题、二维码和边距配置。
- `labelTemplate/components/storage.js`：前后端模版结构转换、默认打印配置合并和打印记录字段转换。
- `labelTemplate/components/print-builder.js`：根据模版和表单数据生成 ZPL 打印数据。
- `labelTemplate/components/api.js`：标签数据和标签模版接口封装。

接口数据：

- 模版列表、详情、新增、更新和删除使用 `/busin/label/template/*` 接口。
- 打印记录列表、详情、新增、更新、删除、导入和空白 Excel 模版下载使用 `/busin/label/data/*` 接口。
- 模版包含标题、字段、二维码显示状态和边距配置。

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
- 材料代码
- 生成单位
- 库房
- 入库人
- 容器号
- 入库时间
- 二维码内容

当前注意事项：

- 二维码预览当前是前端样式占位，真实打印内容由 `print-builder.js` 生成。
- `storage.js` 当前不再作为数据源，仅负责接口 DTO 与前端打印模版结构之间的转换。

## 四、修改注意事项

- 修改材料管理字段、接口参数或字典来源时，需要同步检查 `materialManagement/components/index.js`、`materialManagement/components/detail.vue` 和接口封装。
- 修改标签模版字段时，需要同时检查 `storage.js` 的模版结构、`TemplateDialog.vue` 的编辑表单、`PrintRecordDialog.vue` 的打印表单和 `print-builder.js` 的字段映射。
- 标签模版管理当前使用真实接口数据，`storage.js` 不再作为列表和表单持久化来源。
- 新增数据管理下的页面、路由或菜单时，需要同步更新 `docs/SYSTEM_MODULES_MAP.md`、对应模块 README 和菜单配置来源。

## 五、封记台账 sealLedger

入口文件：`sealLedger/index.vue`

封记台账用于维护容器与两道封记之间的登记关系，支持分页查询、新增、编辑、详情、单条删除、批量删除和 Excel 导入。页面已从占位数据改为对接真实封记台账接口。

核心文件：

- `sealLedger/index.vue`：列表页入口，包含搜索区、操作区、表格区、分页和 Dialog 引用。
- `sealLedger/components/index.js`：搜索项、表格列、按钮、状态选项、查询参数转换和表格展示转换。
- `sealLedger/components/api.js`：封记台账接口封装。
- `sealLedger/components/EditDialog.vue`：新增 / 编辑封记记录，所有字段必填。
- `sealLedger/components/DetailDialog.vue`：封记记录只读详情。
- `sealLedger/components/ImportDialog.vue`：封记记录 Excel 导入。

主要字段 key：

- 容器号：`containerCode`，必填。
- 登记时间：`registerTime`，必填。
- 封记编码1：`sealCode1`，必填。
- 封记类型1：`sealType1`，必填，使用封记类型字典。
- 封记编码2：`sealCode2`，必填，且不得与 `sealCode1` 重复。
- 封记类型2：`sealType2`，必填，使用封记类型字典。
- 封记状态：`sealStatus`，`0` 表示完好，`1` 表示破损。

主要接口：

- 新增：`POST /busin/seal/record/add`
- 批量删除：`POST /busin/seal/record/batchDelete`
- 删除：`DELETE /busin/seal/record/delete/{id}`
- 详情：`GET /busin/seal/record/detail/{id}`
- 导入：`POST /busin/seal/record/import`
- 下载导入模板：`GET /busin/inbound/downTemplate`，固定参数 `tempType=4`
- 分页列表：`POST /busin/seal/record/list`
- 更新：`PUT /busin/seal/record/update`

字典和下拉：

- 封记类型复用 `src/utils/sealType.js` 的 `getSealTypeOptions()` 和 `formatSealType()`。
- 封记类型字典父级 ID：`2052628107427078145`。
- 容器下拉使用现有 `POST /busin/inbound/goodsPageList` 获取容器号并转换为 `containerCode` 选项。

字段取值约定：

- 表单、搜索、表格和接口参数统一使用英文 key；中文仅作为 label、按钮文案、提示文案或表格列名。
- 搜索区状态、类型、容器均使用 `select / el-select`，不使用 checkbox。

## 六、调拨依据查询 transferBasisQuery

入口文件：`transferBasisQuery/index.vue`

调拨依据查询按调拨依据（调出）维度聚合统计物资的数量与重量，并支持点击单元格下钻查看容器明细。已对接 `md/数据管理接口.md`「调拨统计」分组的两个接口，不再使用本地 Mock。

核心文件：

- `transferBasisQuery/index.vue`：列表页入口，包含搜索区、表格区和分页。
- `transferBasisQuery/components/index.js`：列表列、搜索项、查询参数转换、响应字段映射与下拉选项初始化。
- `transferBasisQuery/components/api.js`：调拨依据查询与容器明细接口封装。
- `transferBasisQuery/components/ContainerDetailDialog.vue`：点击数量/重量列弹出的容器明细列表。

主要接口：

- 调拨单统计报表（主列表）：`POST /busin/statist/transfer/statistics`。
- 容器明细下钻：`POST /busin/statist/transfer/container/list`。

搜索条件：

- 调拨依据（调出）：`outTransferId`，下拉，选项来自 `getAllTransferBasisList({ type: '1' })`，提交时映射为 `transferId`。
- 日期区间：`dateRange`，`daterange`，提交时映射为 `startTime` / `endTime`。
- 材料（多选）：`goodCodes`，多选 `select`，选项来自 `listAllMaterialCode`，提交数组。

列表字段（后端 `TransferStatisticsVO` → 界面 prop）：

- 调拨依据：`documentNo` → `transferBasis`。
- 年份：`outYear` → `year`。
- 材料：`goodCode`，经前端 `goodCodeNameMap` 映射为 `goodName` 展示。
- 数量：`count` → `quantity`，可点击下钻。
- 重量：`grossWeight`（毛重口径）→ `weight`，可点击下钻。

容器明细字段（后端 `TransferContainerVO`）：

- 容器号：`containerCode`。
- 位置：`position`。
- 库房：`warehouseName`。
- 入库任务号：`inboundTaskNum`。
- 出库任务号：`outboundTaskNum`。
- 材料名称：`goodCode` 经 `goodCodeNameMap` 映射为 `goodName` 展示。
- 封记编码1：`sealCode1`。
- 封记类型1：`sealType1`，经 `formatSealType`（封记类型字典父级 ID `2052628107427078145`）转义为字典名称展示。
- 封记编码2：`sealCode2`。
- 封记类型2：`sealType2`，同上字典转义。
- 生产单位：`productionUnit`。
- 毛重：`grossWeight`。
- 皮重：`tareWeight`。
- 净重：`netWeight`。

字段映射约定：

- 后端统计与明细接口仅返回 `goodCode`，列表页 `getDefaultOptions` 基于材料全量列表建立 `goodCodeNameMap`，主列表 `handleTbaleMap` 与容器明细 `ContainerDetailDialog` 共用该映射补全 `goodName`。
- `goodCodeNameMap` 由 `index.vue` 维护并透传给 `handleTbaleMap`（主列表）与 `ContainerDetailDialog`（明细弹窗）。
