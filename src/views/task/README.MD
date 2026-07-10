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

- `status`：入库数据确认状态，当前前端映射为 `0=待确认`、`1=已确认`、`2=已拒绝`。
- `auditStatus`：变更审核状态，当前前端映射为 `7=待审核`、`8=审核通过`、`9=审核驳回`。

列表行操作根据状态动态生成：

- 待确认：可查看、编辑、确认、删除。
- 已拒绝：可查看、编辑、删除。
- 已确认：可查看；非待审核时可发起修改。
- 待审核：可查看并进入审核操作。

删除入库任务调用 `GET /busin/inbound/deleteByIds`，参数为 `ids`。

### 2. 新增入库任务

新增时由 `generateBatchNo({ batchType: 1 })` 自动生成任务编号。表单核心字段包括任务编号、调拨依据、入库人、入库时间、出方单位、密级和备注。

调拨依据使用级联选择，数据来源为 `getAllTransferBasisList()`。选择规则是同一入库任务只允许围绕一个文号/调拨依据选择材料代码：选中第一个文号后，其他文号会在前端置灰，避免跨依据混合入库。
调拨依据级联启用父子联动：勾选文号父级时自动勾选其材料代码子级，取消子级时同步影响父级半选/选中状态。新增、编辑或删除调拨依据后，维护弹窗会向任务弹窗抛出刷新事件，任务弹窗重新加载级联数据并保留仍然有效的已选项。

提交前通过 `beforeSubmit` 移除 `_transferSelected` 这类前端中间绑定字段，只向后端提交 `transferId`、`goodCodes` 和明细数据。

### 3. 明细维护与库位选择

入库明细包含材料代码、容器号、生产单位、库房、位置、货箱号、封记编码、封记类型、毛重、皮重、净重、百分比含量和元素量等字段。封记类型字段为 `sealType1`、`sealType2`，使用字典父级 ID `2052628107427078145`；手工编辑明细时，填写对应封记编码后必须选择对应封记类型。每条明细需要选择库房和库位：

- 库房列表来自 `GET /busin/locationMap/hierarchy/listByNodeType/2`。
- 库位列表来自 `POST /busin/locationMap/positionMap`，请求体包含 `nodeId` 和 `nodeType: '2'`。
- 位置下拉中非空闲位置会被禁用，避免选择已占用或锁定库位。

表单提交前还会检查明细中是否存在被标记为占用的位置，发现占用时阻止提交。

百分比含量前端仍使用接口字段 `metalPercentage` 交互，显示文案为“百分比含量”。选择材料代码时，默认取材料管理 `elements[0].content` 回填；如果材料未维护该值，则不设置默认值。毛重、皮重、净重和元素量都至少保留小数点后三位，不足三位补 0，超过三位时保留有效小数位。元素量字段使用 `elementQuantity`，按 `百分比含量 / 100 * 净重` 自动计算，并显示在百分比含量之后。

### 4. Excel 导入

导入弹窗支持两类入库模板（后端已调整字段归属：库房移至类型2，重量类移至类型1）：

- 信息导入 1：材料代码、容器号、生产单位、重量(毛、皮、净)、百分比含量。
- 信息导入 2：容器号、封记编码/类型×2、库房、货箱号、位置。

导入接口为 `POST /busin/excelImport/import`，参数包含 `importType=inbound` 和 `inboundImportType`。类型 1 建立基础预览数据（基础信息 + 重量 + 百分比含量），类型 2 通过 `containerCode` 合并补充封记、库房、货箱号和位置。导入异常时会展示行级提示，并支持下载后端返回的错误文件。导入成功/失败提示以后端返回的 `successNum`、`failNum`、`remindList` 为准，预览阶段直接展示后端 `successList` 的全部数据，不再在前端二次过滤。

确认提交导入结果后，父组件会把预览数据合并到入库明细表格中，并在缺少 `elementQuantity` 时按 `百分比含量 / 100 * 净重` 计算，元素量至少保留小数点后三位。确认提交与明细回填会跳过两类模板字段不完整的记录（含库房 `warehouseName`），只回填两类模板字段均完整的记录。若存在 `position` 字符串，会按 `列-排-层` 的格式解析为 `shelfCode`、`rowCode`、`columnCode`。

### 5. 确认、修改与审核

待确认任务可通过 `POST /busin/inbound/confirm` 按 `taskNum` 确认。确认后的数据进入已确认状态，普通编辑不再作为直接修改入口。

已确认数据如需变更，使用详情弹窗的 `modify` 模式提交，前端会带上 `updateType=1`，由后端生成变更审核记录。待审核状态下，详情弹窗以 `audit` 模式打开：

- 表单字段以只读方式展示。
- 修改过的字段会高亮，并展示修改前后差异。
- 审核同意或驳回调用 `POST /busin/inbound/executeAuditedUpdate`。
- 驳回时需要输入驳回原因。
详情模式通过详情接口返回的 `modifyRecords` 展示“变更记录”，展示样式与位置移动保持一致；记录 `status=7` 时在记录后提供“撤回”按钮，调用 `GET /busin/inbound/cancelApply`，参数为该变更记录的 `id`（作为 `modifyId`）；记录 `status=9` 且返回 `auditRemark` 时，在申请人、申请时间同一行展示驳回原因。

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

调拨依据中维护材料代码、批准件数和批准量，入库任务通过调拨依据选择材料范围。

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

列表页通过 `POST /busin/outbound/list` 查询出库任务，筛选项对齐入库管理，包括任务编号、生产单位、库房、出库时间、调拨依据、容器号、收方单位和状态。出库时间在前端转换为 `startTime/endTime`，新增/编辑详情中的出库时间只选择和提交日期，格式为 `yyyy-MM-dd`。

页面状态由 `status` 和 `auditStatus` 共同决定：

- `status=0`：待审核，提交后直接进入审核链路，不再提供前端确认操作。
- `status=2`：已拒绝，可编辑、删除。
- `status=4`：暂存，可编辑、删除。
- `status=1`：已确认；若 `auditStatus=0/7` 表示修改申请待审核，只允许进入审核，不允许再次修改；若 `auditStatus` 为空或非待审核状态，则可发起修改。
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
- 容器列表：调用 `POST /busin/inbound/goodsPageList`，支持容器号、材料代码和入库时间筛选。
- 入库单：调用 `POST /busin/inbound/goodsPageList`，按 `taskNum` 查询入库单容器，弃用 `getByTaskNumAndContainerCode`。

确认选择后，前端统一规范化为出库明细字段：`containerCode`、`goodCode`、`warehouseId`、`warehouseName`、`boxNum`、`grossWeight`、`tareWeight`、`netWeight`、`productionUnit`、`shelfCode`、`rowCode`、`columnCode`、`sealCode1`、`sealType1`、`sealCode2`、`sealType2`。已选容器区域会展示净重合计。

### 4. 自动配重

出库明细的“自动配重”打开“自动配重”弹窗，由用户在弹窗内自行维护待出库物料，可新增或删除多条物料条件。修改已确认出库任务时不允许自动配重。待出库物料按“物料、库房、任务批次、出方单位、入库时间、重量”的顺序配置：物料名称通过 `GET /busin/inbound/getGoodsList` 获取已入库物料并单选，选中值使用 `goodCode`；库房、任务批次、出方单位不再单独请求接口，而是由所选物料返回的 `warehouse`、`batchNo`、`productionUnit` 数组生成各自下拉选项；入库时间拆分为开始时间和结束时间。保存条件后点击“重新计算”调用 `POST /busin/pick/auto-weight` 获取取货方案。

自动配重不再从调拨依据所选材料自动生成待出库物料，调拨依据仍作为出库任务主表字段参与原有提交链路。使用某个方案时，方案容器会规范化为出库明细字段并覆盖当前明细；若当前已有明细，弹窗会二次确认。
自动配重方案容器返回的 `warehouse`、`boxNo` 会在前端明确映射为出库明细展示和提交使用的 `warehouseName`、`boxNum`。

### 5. 审核

出库任务提交后默认进入待审核状态，列表不再提供“确认”操作。审核入口与入库管理保持一致，打开出库详情弹窗的 `audit` 模式：

- 初次审核：若详情接口没有返回修改记录，则按普通详情内容只读展示，并提供“同意/不同意”审核操作。
- 变更审核：若详情接口返回 `modifyRecords`，则展示修改内容列表，并高亮有变更的表单字段。
- 初次审核同意或驳回调用 `POST /busin/outbound/confirmAudit`，参数包含 `taskNum`、`approved` 和 `remark`。
- 已审核数据再次修改产生的变更审核调用 `POST /busin/outbound/executeAudited`，参数包含 `operationId`、`approved` 和 `remark`。

详情模式通过详情接口返回的 `modifyRecords` 展示“变更记录”。该区域仅在点击列表“详情”打开弹窗时显示；记录 `status=7` 时在记录后提供“撤回”按钮，调用 `GET /busin/outbound/cancelApply`，参数为该变更记录的 `id`（作为 `modifyId`）。记录 `status=9` 且返回 `auditRemark` 时，在申请人、申请时间同一行展示驳回原因；驳回审核提交参数仍使用 `remark`。

## 四、已完成界面：位置移动

入口文件：

- `src/views/task/move/index.vue`
- `src/views/task/move/components/detail.vue`
- `src/views/task/move/components/index.js`
- `src/views/task/move/components/api.js`
- `src/views/task/move/components/ImportDialog.vue`

接口参考：

- `docs/移库管理-接口文档.md`

位置移动用于处理库内已入库容器从原位置到目标位置的移库申请，支持从位置移动列表创建，也支持在库房管理的容器详情中直接提交移库申请。

### 1. 列表查询与状态

列表页通过 `POST /busin/move/list` 查询移库任务，筛选项包括任务编号、容器号、位置、移动时间和状态。移动时间在前端转换为 `startTime/endTime`，状态以 `statusList` 数组提交。

页面状态沿用出库管理的组合判断方式：

- `status=0`：待审核，显示审核入口。
- `status=1`：已确认；若 `auditStatus=0/7` 表示修改申请待审核，只允许审核；否则可发起修改。
- `status=2`：已拒绝，可编辑。
- `status=4`：暂存，可编辑。

接口文档未提供删除接口，前端不提供删除按钮。

### 2. 新增、暂存与提交

新增移库任务时调用 `generateBatchNo({ batchType: 'move', prefix: 'YK' })` 生成移库任务编号。主表字段包括任务编号、执行人、移动时间和备注。

底部提供“暂存”和“提交”两个动作：

- 暂存传 `saveType=4`。
- 提交传 `saveType=0`。

新增时明细通过 `goodsList` 提交；编辑和修改时按打开详情时的原始明细和当前明细对比：新增明细放入 `dtoList`，当前版本不允许直接编辑已有移库明细，所以 `editList` 固定传空数组，删除明细的 `id` 和 `containerCode` 分别汇总到 `goodIds`、`containerCodes`。已审核任务修改时传 `updateType=1` 进入变更审核链路。

### 明细导入（Excel）

位置移动支持通过 Excel 批量导入移库明细，导入入口位于详情弹窗“移库明细”操作区。

- 下载模板：`GET /busin/inbound/downTemplate`，参数 `tempType=5`（复用入库通用模板接口）。
- 导入接口：`POST /busin/move/import`，参数 `file`（multipart/form-data）。
- 导入返回数据兼容数组、`successList`、`list` 三种结构，预览确认后按 `containerCode` 去重合并到移库明细，并跳过已存在的容器号。

### 3. 源位置与目标位置选择

明细编辑采用库房和位置联动选择：

- 库房列表来自 `GET /busin/locationMap/hierarchy/listByNodeType/2`。
- 位置列表来自 `POST /busin/locationMap/positionMap`，请求体包含 `nodeId` 和 `nodeType: '2'`。
- 原位置只允许选择 `status=1` 且有容器号的位置，选择后自动回填入库任务编号、容器号、材料代码、生产单位、重量、元素量（`elementQuantity`）、封记编码、封记类型和原排/行/列。
- 明细编辑弹窗详情预览中，重量后展示“元素量”；“封记编码1”“封记编码2”分字段独立显示。
- 移库明细表格与导入预览均展示“元素量”，导入后端会返回该字段；提交 `POST /busin/move/submit` 时 `goodsList` 同步传 `elementQuantity`。
- 目标位置沿用入库管理规则：下拉展示全部位置，但 `status !== 0` 的位置置灰不可选。
- 提交前会阻止原位置和目标位置完全相同的明细。
- 明细中 `sourceWarehouse` / `targetWarehouse` 字段实际存储库房编号（`warehouseCode`），与后端交互时字段名保持不变；旧数据在重新编辑库房后会按新规则刷新为库房编号。

### 4. 审核、修改与变更记录

初次提交后的审核调用 `POST /busin/move/confirm`，参数包含 `taskNum`、`approved` 和 `remark`。

已审核数据再次修改后进入变更审核，审核调用 `POST /busin/move/executeAudited`，参数通过 query string 传 `modifyRecordId`、`approved` 和 `remark`。

详情模式展示 `modifyRecords` 变更记录，记录 `status=7` 时提供“撤回”按钮，调用 `GET /busin/move/cancelApply`，参数为该变更记录的 `id`（作为 `modifyId`）。记录 `status=9` 且返回 `auditRemark` 时，在申请人、申请时间同一行展示驳回原因；驳回审核提交参数仍使用 `remark`。审核模式解析 `beforeData`、`afterData` 和 `modifyDescList`，高亮有变更的主表字段并展示修改内容。

## 五、已完成界面：实物盘存

入口文件：

- `src/views/task/inventory/index.vue`
- `src/views/task/inventory/components/detail.vue`
- `src/views/task/inventory/components/index.js`
- `src/views/task/inventory/components/api.js`

接口参考：

- `md/任务管理接口.md`

实物盘存用于管理仓库的实物盘存任务，支持创建盘存任务、审核、导出清单、录入盘存结果和标记异常。

### 1. 列表查询与状态

列表页通过 `POST /busin/inventory/page/list` 查询盘存任务，筛选项包括任务编号、库房名称和盘存时间。盘存时间在前端转换为 `startTime/endTime`。

页面状态由 `status` 决定，行操作按钮通过 `getRowBtns(row)` 根据 `status` 动态生成：

| status | 含义 | 可用操作 |
|------------|------|----------|
| 4 | 待提交(暂存) | 详情、编辑、录入结果、删除 |
| 0 | 待审核 | 详情、编辑、审核 |
| 1 | 审核通过 | 详情 |
| 2 | 审核拒绝 | 详情、编辑、删除 |

### 2. 新增盘存任务

新增时由 `generateBatchNo({ batchType: 3 })` 自动生成任务编号。表单核心字段包括任务编号、盘存方式（全部库房/指定库房）和备注。

盘存方式选择"指定库房"时，需通过 `GET /busin/locationMap/hierarchy/listByNodeType/2` 获取库房列表进行多选。

货物清单通过 `POST /busin/inventory/goods/list` 获取，参数 `type` 为 `all`（全部库房）或 `selected`（指定库房），`warehouseId` 为库房ID数组。

底部提供"提交"按钮，默认执行暂存操作（`submitType=4`）。

### 3. 编辑盘存任务

编辑调用 `POST /busin/inventory/edit`，参数包含 `id`、`taskNum`、`selectType`、`warehouseIds`、`warehouseNames`、`remark`、`wareList`（按库房组织的任务清单数据，结构与新增提交一致，由 `buildWareList()` 统一构建）。

### 4. 审核盘存任务

审核通过详情弹窗的 `audit` 模式打开，提供"同意/驳回"操作。审核调用 `POST /busin/inventory/audit`：

- 同意：`auditStatus=1`
- 驳回：`auditStatus=2`，需填写 `auditRemark`

### 5. 导出功能

- 导出盘存清单：`GET /busin/inventory/export`，参数 `taskNum`，返回文件流（blob 下载）。
- 导出到PAD：`GET /busin/inventory/exportToPad`，参数 `taskNum`，返回字符串提示。
- 下载PAD盘存数据：`POST /busin/inventory/exportToPad/stream`（JSON），传 `taskNum` + `wareHouseIds`（数组），返回文件流（JSON，用于设备导入）。

### 6. 录入盘存结果

暂存状态（`status=4`）可直接录入盘存结果，调用 `POST /busin/inventory/result/submit`。

录入结果模式下：
- 实物盘存清单字段可编辑：盘存时间、盘存人、封记检查人、负责人、监盘人；其中盘存时间、盘存人、封记检查人、负责人为提交结果必填项。
- 盘存结果区域可编辑：全部正常/部分异常、正常数量及备注、不正常数量及备注；正常和不正常分两行展示。
- 盘存结果使用单选且初始不默认选择：选择"全部正常"时，正常数量自动等于当前库房明细数量，不正常数量清零，明细结果全部置为正常；选择"部分异常"时，可在明细行手动标记正常/不正常，对应数量自动汇总。手动修改单条明细结果时会弹出二次确认，并展示当前行的位置和容器号。查看详情时优先展示接口返回的库房层统计数。
- 明细列表显示"结果"列，每条货物可标记为：
  - `result=0`：正常
  - `result=1`：不正常（查看详情时兼容历史 `1` 与 `2` 状态为不正常）
- 盘存明细展示并提交封记编码和封记类型字段：`sealCode1`、`sealType1`、`sealCode2`、`sealType2`。

录入结果提交时，`wareList[].goodsList` 按接口文档提交完整 `PhysicalInventoryGoodsDTO` 字段，不正常明细的 `resultRemark` 可为空。为兼容后端历史字段，库房层提交时仍会把 `abnormalCount` 同步到 `deficitCount`，并将 `excessCount` 置为 0。

### 7. 标记异常

调用 `POST /busin/inventory/markError`，参数包含 `ids`（货物ID，逗号分隔）、`result`（0正常/1不正常）和 `remark`。

### 8. 删除盘存任务

删除调用 `GET /busin/inventory/delete`，参数为 `taskNum`。

## 六、开发与修改注意事项

- 修改入库管理前，必须先阅读本文档、`docs/PROJECT_ARCHITECTURE.md`、`docs/SYSTEM_MODULES_MAP.md` 和 `md/入库管理接口文档.md`。
- 入库管理虽然位于 `src/views/task/inbound`，但其数据会影响核算和账务处理，状态流转不能只按普通 CRUD 理解。
- 不要绕过 `status` 和 `auditStatus` 的组合判断新增操作按钮。
- 已确认数据的修改需要保留审核链路，不应改成直接覆盖。
- 调拨依据级联字段 `_transferSelected` 是前端中间态，不应提交给后端。
- 库位选择必须继续过滤占用和锁定状态，避免同一库位被重复入库。
- Excel 导入的两类模板是互补关系，修改字段时要同时检查导入预览、明细编辑和提交 DTO。
- 出库管理选择容器时只允许加入有容器号的库存记录，避免把空闲库位作为出库明细提交。
- 若后续补充移库、盘存或账目管理页面，请在本文档追加独立章节，说明入口文件、业务状态、关键接口、数据来源和修改风险。
- 盘存模块 API 路径统一使用 `/busin/inventory/` 前缀。
- 盘存状态使用数字枚举：0=待审核、1=审核通过、2=审核拒绝、4=待提交。
- 按钮逻辑：暂存(4)=详情/编辑/录入结果/删除，待审核(0)=详情/编辑/审核，审核通过(1)=详情，审核拒绝(2)=详情/编辑/删除。
- 录入盘存结果时，不正常明细的结果备注可为空。
- 导出盘存清单使用 blob 下载模式，需设置 `responseType: 'blob'`。
- 新增模式下"生成任务清单"按钮始终显示，可重复生成覆盖已有清单。
- 添加/编辑模式下，修改"盘存方式"或"指定库房"后，必须重新点击"生成任务清单"使清单与最新盘存范围同步，否则点击"提交/保存"时会弹出提示并阻止提交（由 `goodsListDirty` 标记控制，清单生成成功后自动清除）。
