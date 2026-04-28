# 财务核算模块业务说明

本文档用于沉淀 `src/views/accounting` 目录相关业务背景、已完成界面的业务逻辑、关键状态和接口约定。后续出库、移库、盘存、报表或账务类页面完成后，应在本文档中继续补充对应章节，而不是为单个页面另建孤立说明。

## 一、模块定位

财务核算模块承接仓储作业产生的业务数据，重点关注物资实物流转后的入账、调整、审核和追溯。当前项目中，已对接完成的入库管理页面位于 `src/views/task/inbound`，它属于任务管理中的现场作业入口，同时为后续核算、账目和统计提供基础数据来源。

入库管理的业务含义不是简单的列表维护，而是完成从调拨依据、材料明细、库房位置、导入校验到确认入账的完整链路。修改这类页面时，需要同时理解任务流和账务流的边界：

- 任务流：创建入库任务、补充明细、选择库位、导入数据、确认任务。
- 账务流：已确认的入库记录进入稳定状态，后续修改需要走变更审核。
- 基础数据流：依赖库房层级、库位状态、调拨依据、文号、密级字典等基础数据。

## 二、已完成界面：入库管理

入口文件：

- `src/views/task/inbound/index.vue`
- `src/views/task/inbound/components/detail.vue`
- `src/views/task/inbound/components/index.js`
- `src/views/task/inbound/components/api.js`
- `src/views/task/inbound/components/ImportDialog.vue`
- `src/views/task/inbound/components/AllocationBasisListDialog.vue`
- `src/views/task/inbound/components/AllocationBasisDialog.vue`

接口参考：

- `md/入库管理接口文档.md`

### 1. 列表查询

列表页通过 `getInboundList` 调用 `POST /busin/inbound/manage/pageList`，支持按任务编号、生产单位、库房、入库时间、调拨依据、容器号、出方单位和状态过滤。

页面状态展示由两个字段共同决定：

- `dataStatus`：入库数据确认状态，当前前端映射为 `0=待确认`、`1=已确认`。
- `auditStatus`：变更审核状态，当前前端映射为 `7=待审核`、`8=审核通过`、`9=审核驳回`。

列表行操作根据状态动态生成：

- 待确认：可查看、编辑、确认、删除。
- 已确认：可查看；非待审核时可发起修改。
- 待审核：可查看并进入审核操作。

### 2. 新增入库任务

新增时由 `generateBatchNo({ batchType: 1 })` 自动生成任务编号。表单核心字段包括任务编号、调拨依据、入库人、入库时间、出方单位、密级和备注。

调拨依据使用级联选择，数据来源为 `getAllTransferBasisList()`。选择规则是同一入库任务只允许围绕一个文号/调拨依据选择材料编码：选中第一个文号后，其他文号会在前端置灰，避免跨依据混合入库。

提交前通过 `beforeSubmit` 移除 `_transferSelected` 这类前端中间绑定字段，只向后端提交 `transferId`、`goodCodes` 和明细数据。

### 3. 明细维护与库位选择

入库明细包含材料编码、容器号、生产单位、库房、位置、货箱号、封记编码、毛重、皮重、净重等字段。每条明细需要选择库房和库位：

- 库房列表来自 `GET /busin/locationMap/hierarchy/listByNodeType/2`。
- 库位列表来自 `POST /busin/locationMap/positionMap`，请求体包含 `nodeId` 和 `nodeType: '2'`。
- 位置下拉中非空闲位置会被禁用，避免选择已占用或锁定库位。

表单提交前还会检查明细中是否存在被标记为占用的位置，发现占用时阻止提交。

### 4. Excel 导入

导入弹窗支持两类入库模板：

- 信息导入 1：材料编码、容器号、生产单位、库房。
- 信息导入 2：容器号、封记信息、重量、金属量、货箱号、位置。

导入接口为 `POST /busin/excelImport/import`，参数包含 `importType=inbound` 和 `inboundImportType`。类型 1 主要建立基础预览数据，类型 2 通过 `containerCode` 合并补充封记、重量和位置等字段。导入异常时会展示行级提示，并支持下载后端返回的错误文件。

确认提交导入结果后，父组件会把预览数据合并到入库明细表格中。若存在 `position` 字符串，会按 `排-行-列` 的格式解析为 `shelfCode`、`rowCode`、`columnCode`。

### 5. 确认、修改与审核

待确认任务可通过 `POST /busin/inbound/confirm` 按 `taskNum` 确认。确认后的数据进入已确认状态，普通编辑不再作为直接修改入口。

已确认数据如需变更，使用详情弹窗的 `modify` 模式提交，前端会带上 `updateType=1`，由后端生成变更审核记录。待审核状态下，详情弹窗以 `audit` 模式打开：

- 表单字段以只读方式展示。
- 修改过的字段会高亮，并展示修改前后差异。
- 审核同意或驳回调用 `POST /busin/inbound/executeAuditedUpdate`。
- 驳回时需要输入驳回原因。

### 6. 调拨依据与文号维护

入库任务依赖调拨依据。页面内置调拨依据管理弹窗，支持新增、编辑、删除和分页查询调拨依据，同时支持维护文号。

相关接口包括：

- `/busin/transfer-basis/add`
- `/busin/transfer-basis/update`
- `/busin/transfer-basis/delete`
- `/busin/transfer-basis/list`
- `/busin/transfer-basis/list-all`
- `/busin/doc-number/add`
- `/busin/doc-number/update`
- `/busin/doc-number/delete`
- `/busin/doc-number/list-all`

调拨依据中维护材料编码、批准件数和批准量，入库任务通过调拨依据选择材料范围。

## 三、开发与修改注意事项

- 修改入库管理前，必须先阅读本文档、`docs/PROJECT_ARCHITECTURE.md`、`docs/SYSTEM_MODULES_MAP.md` 和 `md/入库管理接口文档.md`。
- 入库管理虽然位于 `src/views/task/inbound`，但其数据会影响核算和账务处理，状态流转不能只按普通 CRUD 理解。
- 不要绕过 `dataStatus` 和 `auditStatus` 的组合判断新增操作按钮。
- 已确认数据的修改需要保留审核链路，不应改成直接覆盖。
- 调拨依据级联字段 `_transferSelected` 是前端中间态，不应提交给后端。
- 库位选择必须继续过滤占用和锁定状态，避免同一库位被重复入库。
- Excel 导入的两类模板是互补关系，修改字段时要同时检查导入预览、明细编辑和提交 DTO。
- 若后续补充出库、移库、盘存或账目管理页面，请在本文档追加独立章节，说明入口文件、业务状态、关键接口、数据来源和修改风险。

