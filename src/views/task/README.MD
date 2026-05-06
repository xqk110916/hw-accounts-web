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

- `dataStatus`：入库数据确认状态，当前前端映射为 `0=待确认`、`1=已确认`、`2=已拒绝`。
- `auditStatus`：变更审核状态，当前前端映射为 `7=待审核`、`8=审核通过`、`9=审核驳回`。

列表行操作根据状态动态生成：

- 待确认：可查看、编辑、确认、删除。
- 已拒绝：可查看、编辑、删除。
- 已确认：可查看；非待审核时可发起修改。
- 待审核：可查看并进入审核操作。

### 2. 新增入库任务

新增时由 `generateBatchNo({ batchType: 1 })` 自动生成任务编号。表单核心字段包括任务编号、调拨依据、入库人、入库时间、出方单位、密级和备注。

调拨依据使用级联选择，数据来源为 `getAllTransferBasisList()`。选择规则是同一入库任务只允许围绕一个文号/调拨依据选择材料编码：选中第一个文号后，其他文号会在前端置灰，避免跨依据混合入库。
调拨依据级联启用父子联动：勾选文号父级时自动勾选其材料编码子级，取消子级时同步影响父级半选/选中状态。新增、编辑或删除调拨依据后，维护弹窗会向任务弹窗抛出刷新事件，任务弹窗重新加载级联数据并保留仍然有效的已选项。

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

确认提交导入结果后，父组件会把预览数据合并到入库明细表格中。导入预览和最终填充都会跳过信息不完整的数据，只填充两类模板字段均完整的记录。若存在 `position` 字符串，会按 `排-行-列` 的格式解析为 `shelfCode`、`rowCode`、`columnCode`。

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

## 三、已完成界面：出库管理

入口文件：

- `src/views/task/outbound/index.vue`
- `src/views/task/outbound/components/detail.vue`
- `src/views/task/outbound/components/index.js`
- `src/views/task/outbound/components/api.js`
- `src/views/task/outbound/components/SelectContainerDialog.vue`

接口参考：

- `md/出库管理-取货方案接口文档.md`
- `md/出库管理-需求.md`

### 1. 列表查询与状态

列表页通过 `POST /busin/outbound/list` 查询出库任务，筛选项对齐入库管理，包括任务编号、生产单位、库房、出库时间、调拨依据、容器号、收方单位和状态。出库时间在前端转换为 `startTime/endTime`。

页面状态由 `dataStatus` 和 `auditStatus` 共同决定：

- `dataStatus=0`：待审核，提交后直接进入审核链路，不再提供前端确认操作。
- `dataStatus=2`：已拒绝，可编辑、删除。
- `dataStatus=4`：暂存，可编辑、删除。
- `dataStatus=1`：已确认；若 `auditStatus=0/7` 表示修改申请待审核，只允许进入审核，不允许再次修改；若 `auditStatus` 为空或非待审核状态，则可发起修改。
- `auditStatus=0/7`：待审核，显示审核入口。

### 2. 新增、暂存与提交

新增出库任务的表单字段保持原有业务含义，提交字段映射为 `taskNum`、`transferId`、`securityLevel`、`outboundMan`、`receiveUnit`、`goodCodes` 和 `remark`。

底部提供“暂存”和“提交”两个动作：

- 暂存传 `submitType=4`。
- 提交传 `submitType=0`。

新增时明细通过 `goodsList` 提交；编辑和修改时以打开详情时的原始明细和提交时的当前明细进行对比：新增明细放入 `dtoList`，当前版本暂不支持修改材料信息所以 `editList` 固定传空数组，删除明细的 `id` 和 `containerCode` 分别汇总到 `goodIds`、`containerCodes`，修改模式保留 `updateType=1` 进入审核链路。

### 3. 手工选择容器

出库明细的“手工选择”打开“选择容器”弹窗，不再使用旧的明细编辑弹窗。弹窗左侧提供三个选择维度：

- 位置图：先选平衡区，再选库房，调用 `POST /busin/locationMap/positionMap` 以 2D 位置图展示已占用容器；空闲位置不可加入。
- 容器列表：调用 `POST /busin/inbound/goodsPageList`，支持容器号、货物编码和入库时间筛选。
- 入库单：调用 `POST /busin/inbound/goodsPageList`，按 `taskNum` 查询入库单容器，弃用 `getByTaskNumAndContainerCode`。

确认选择后，前端统一规范化为出库明细字段：`containerCode`、`goodCode`、`warehouseId`、`warehouseName`、`boxNum`、`grossWeight`、`tareWeight`、`netWeight`、`productionUnit`、`shelfCode`、`rowCode`、`columnCode`、`sealCode1`、`sealCode2`。

### 4. 自动配重

出库明细的“自动配重”打开“自动配重”弹窗，由用户在弹窗内自行维护待出库物料，可新增或删除多条物料条件。修改已确认出库任务时不允许自动配重。待出库物料按“物料、库房、任务批次、出方单位、入库时间、重量”的顺序配置：物料名称通过 `GET /busin/inbound/getGoodsList` 获取已入库物料并单选，选中值使用 `goodCode`；库房、任务批次、出方单位不再单独请求接口，而是由所选物料返回的 `warehouse`、`batchNo`、`productionUnit` 数组生成各自下拉选项；入库时间拆分为开始时间和结束时间。保存条件后点击“重新计算”调用 `POST /busin/pick/auto-weight` 获取取货方案。

自动配重不再从调拨依据所选材料自动生成待出库物料，调拨依据仍作为出库任务主表字段参与原有提交链路。使用某个方案时，方案容器会规范化为出库明细字段并覆盖当前明细；若当前已有明细，弹窗会二次确认。

### 5. 审核

出库任务提交后默认进入待审核状态，列表不再提供“确认”操作。审核入口与入库管理保持一致，打开出库详情弹窗的 `audit` 模式：

- 初次审核：若详情接口没有返回修改记录，则按普通详情内容只读展示，并提供“同意/不同意”审核操作。
- 变更审核：若详情接口返回 `modifyRecords`，则展示修改内容列表，并高亮有变更的表单字段。
- 初次审核同意或驳回调用 `POST /busin/outbound/confirmAudit`，参数包含 `taskNum`、`approved` 和 `remark`。
- 已审核数据再次修改产生的变更审核调用 `POST /busin/outbound/executeAudited`，参数包含 `operationId`、`approved` 和 `remark`。

详情模式通过详情接口返回的 `modifyRecords` 展示“变更记录”。该区域仅在点击列表“详情”打开弹窗时显示；记录 `status=7` 时在记录后提供“撤回”按钮，调用 `GET /busin/outbound/cancelApply`，参数为该变更记录的 `id`（作为 `modifyId`）。

## 四、已完成界面：位置移动

入口文件：

- `src/views/task/move/index.vue`
- `src/views/task/move/components/detail.vue`
- `src/views/task/move/components/index.js`
- `src/views/task/move/components/api.js`

接口参考：

- `docs/移库管理-接口文档.md`

位置移动用于处理库内已入库容器从原位置到目标位置的移库申请，支持从位置移动列表创建，也支持在库房管理的容器详情中直接提交移库申请。

### 1. 列表查询与状态

列表页通过 `POST /busin/move/list` 查询移库任务，筛选项包括任务编号、容器号、位置、移动时间和状态。移动时间在前端转换为 `startTime/endTime`，状态以 `statusList` 数组提交。

页面状态沿用出库管理的组合判断方式：

- `dataStatus=0`：待审核，显示审核入口。
- `dataStatus=1`：已确认；若 `auditStatus=0/7` 表示修改申请待审核，只允许审核；否则可发起修改。
- `dataStatus=2`：已拒绝，可编辑。
- `dataStatus=4`：暂存，可编辑。

接口文档未提供删除接口，前端不提供删除按钮。

### 2. 新增、暂存与提交

新增移库任务时调用 `generateBatchNo({ batchType: 'move' })` 生成移库任务编号。主表字段包括任务编号、执行人、移动时间和备注。

底部提供“暂存”和“提交”两个动作：

- 暂存传 `saveType=4`。
- 提交传 `saveType=0`。

新增时明细通过 `goodsList` 提交；编辑和修改时按打开详情时的原始明细和当前明细对比：新增明细放入 `dtoList`，已有明细放入 `editList`，删除明细的 `id` 和 `containerCode` 分别汇总到 `goodIds`、`containerCodes`。已审核任务修改时传 `updateType=1` 进入变更审核链路。

### 3. 源位置与目标位置选择

明细编辑采用库房和位置联动选择：

- 库房列表来自 `GET /busin/locationMap/hierarchy/listByNodeType/2`。
- 位置列表来自 `POST /busin/locationMap/positionMap`，请求体包含 `nodeId` 和 `nodeType: '2'`。
- 原位置只允许选择 `status=1` 且有容器号的位置，选择后自动回填入库任务编号、容器号、材料编码、生产单位、重量、封记和原排/行/列。
- 目标位置沿用入库管理规则：下拉展示全部位置，但 `status !== 0` 的位置置灰不可选。
- 提交前会阻止原位置和目标位置完全相同的明细。

### 4. 审核、修改与变更记录

初次提交后的审核调用 `POST /busin/move/confirm`，参数包含 `taskNum`、`approved` 和 `remark`。

已审核数据再次修改后进入变更审核，审核调用 `POST /busin/move/executeAudited`，参数通过 query string 传 `modifyRecordId`、`approved` 和 `remark`。

详情模式展示 `modifyRecords` 变更记录，记录 `status=7` 时提供“撤回”按钮，调用 `GET /busin/move/cancelApply`，参数为该变更记录的 `id`（作为 `modifyId`）。审核模式解析 `beforeData`、`afterData` 和 `modifyDescList`，高亮有变更的主表字段并展示修改内容。

## 五、开发与修改注意事项

- 修改入库管理前，必须先阅读本文档、`docs/PROJECT_ARCHITECTURE.md`、`docs/SYSTEM_MODULES_MAP.md` 和 `md/入库管理接口文档.md`。
- 入库管理虽然位于 `src/views/task/inbound`，但其数据会影响核算和账务处理，状态流转不能只按普通 CRUD 理解。
- 不要绕过 `dataStatus` 和 `auditStatus` 的组合判断新增操作按钮。
- 已确认数据的修改需要保留审核链路，不应改成直接覆盖。
- 调拨依据级联字段 `_transferSelected` 是前端中间态，不应提交给后端。
- 库位选择必须继续过滤占用和锁定状态，避免同一库位被重复入库。
- Excel 导入的两类模板是互补关系，修改字段时要同时检查导入预览、明细编辑和提交 DTO。
- 出库管理选择容器时只允许加入有容器号的库存记录，避免把空闲库位作为出库明细提交。
- 若后续补充移库、盘存或账目管理页面，请在本文档追加独立章节，说明入口文件、业务状态、关键接口、数据来源和修改风险。
