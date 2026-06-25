# 表单报送模块业务说明

本文档用于沉淀 `src/views/formManagement/reportSubmit` 目录的业务背景、文件职责、R01-R09 报表差异、接口约定、数据规范化规则和关键修改点定位。后续修改本模块任意报表的卡片、筛选项、表格列、表单模板字段、页眉排版、导出逻辑或接口字段时，应先阅读本文档定位修改点，再动手，避免在全目录中逐文件检索。

## 一、模块定位

表单报送（路由 `reportSubmit`，权限 `formManagement_reportSubmit`）是"表单管理"模块下唯一的填报入口，承担 R01-R09 标准报表的：

- 卡片式入口选择报表；
- 按报表各自的筛选条件，从后端"接入/统计/生成"明细数据，或从历史已保存报表中加载；
- 在报表纸模板上填写表头（密级、单位、日期、报表编号、格式、表号等）；
- 在关联明细表格中查看/编辑数据；
- 保存为历史报表、导出 Excel（后端文件流）、下载表单（前端 ExcelJS 填充模板）。

本模块不是普通 CRUD：R01 的数据来自任务管理（入库/出库任务），R03-R09 的数据来自按年季或日期区间的统计/生成接口。修改时需要区分"任务接入型"与"统计生成型"两类数据来源。

## 二、文件结构与职责（修改前必读）

```
src/views/formManagement/reportSubmit/
├── index.vue                          # 主页面：list 卡片视图 / detail 填报视图 双状态切换
└── components/
    ├── reportConfigs.js               # 报表元信息与配置（卡片、筛选项、表格列、模板字段）
    ├── index.js                       # 接口分发、参数构建、数据规范化、字段白名单、字典加载
    ├── api.js                         # 所有后端接口定义
    ├── CommonTemplate.vue             # R03-R09 通用报表纸模板（页眉 + 两栏式表单）
    ├── R01Template.vue                # R01 专用报表纸模板（发方/收方对称布局）
    └── exportReportTemplate.js        # "表单下载"：ExcelJS 读取模板填充字段并下载
```

### 各文件内部关键结构定位

| 想修改的内容 | 文件 | 具体位置 |
| --- | --- | --- |
| 卡片名称、描述、展示哪些报表 | `components/reportConfigs.js` | 顶部 `reportCards` 数组 |
| 某报表的"表号/格式"默认值、标题 | `components/reportConfigs.js` | `reportConfigs[code]` 的 `title` / `tableNo` / `formatNo` |
| 某报表的筛选项（标签、控件类型、栅格、动作按钮） | `components/reportConfigs.js` | `reportConfigs[code].search` |
| 某报表的明细表格列（含多级表头） | `components/reportConfigs.js` | `reportConfigs[code].columns` |
| 某报表的两栏式表单填写字段 | `components/reportConfigs.js` | `templateConfigs[code].leftRows` |
| 视图切换、筛选交互、保存/导出/下载入口 | `index.vue` | `data` / `computed` / `methods` |
| 报表纸页眉排版（密级/标题/格式/表号） | `CommonTemplate.vue` 或 `R01Template.vue` | `.report-header` 区块及对应 `<style>` |
| 接口地址、请求方式 | `components/api.js` | 各 `export const` |
| 报表 → 接口函数的映射 | `components/index.js` | `requestFun` 对象 |
| 后端字段 ↔ 界面字段的别名兜底与清洗 | `components/index.js` | `normalizeRowsForDisplay` / `normalizeDetailData` / `normalizeTaskDetailRows` / `toTemplateData` |
| 保存时提交的字段白名单 | `components/index.js` | `headerFields` / `detailFields` / `buildHeader` / `buildSavePayload` |
| 查询参数构建（年季→起止日期推算等） | `components/index.js` | `buildQueryParams` / `buildTaskQueryParams` / `buildTaskDetailParams` |
| 字典与下拉选项加载 | `components/index.js` | `loadDefaultOptions` / `loadR01TaskOptions`（在 `index.vue`） |
| "表单下载"的 Excel 单元格映射 | `components/exportReportTemplate.js` | `CELL_MAPS` / `OPTIONAL_CELL_MAPS` |

## 三、R01-R09 报表清单与差异

报表卡片与配置均定义在 `reportConfigs.js`。`R02`、`R07` 在 `requestFun` 中为 `null`，当前未启用、不展示卡片。

| 编码 | 名称 | 数据来源 | 触发动作 | 特殊说明 |
| --- | --- | --- | --- | --- |
| R01 | 材料交接统计报表 | 任务管理（入库/出库任务） | 选择任务 → "接入报表" | 独立模板 `R01Template.vue`；明细按 `taskNum` 分组着色并带分组合计行 |
| R03 | 材料库存变化统计报表 | 年份 + 季度统计 | "统计" | 统计接口为专用 `/busin/form/quarter/list` |
| R04 | 材料实际库存统计报表 | 年份 + 季度统计 | "统计" | |
| R05 | 材料账目报表 | 年份 + 季度统计 | "统计"（默认 `disabled`） | 表单下载复用 R03 模板 |
| R06 | 材料注释统计报表 | 查询日期区间 | "统计"（默认 `disabled`） | 唯一支持明细行"新增/删除"的报表 |
| R08 | 材料库存变化综合统计表 | 统计日期 + 选择材料 | "生成" | 需选材料代码；表单下载复用 R03 模板 |
| R09 | 材料库存变化综合统计表 | 统计日期 + 选择材料 | "生成" | 需选材料代码；表单下载复用 R03 模板 |

筛选项控件类型由 `search[].type` 决定（`select` / `daterange` / `year`）；带 `actionBtn` 的筛选项会渲染"接入报表/统计/生成"按钮，点击调用 `handleAction` → `loadData`。

## 四、页面视图与操作流程

入口文件：`src/views/formManagement/reportSubmit/index.vue`

页面通过 `currentView` 在两个视图间切换：

- `currentView === 'list'`：卡片列表（`el-row` + `el-col :span="8"` 网格），遍历 `reportCards`，点击卡片调用 `openReport(code)`。
- `currentView === 'detail'`：报表填报详情，自上而下为工具栏、筛选面板、报表纸区域、关联明细表格。

### 1. 进入填报（openReport）

`openReport(code)` 切换到 detail 视图，并把 `searchParams` 默认置为当前年份与当前季度，清空 `templateData` / `tableData`，随后调用 `loadDefaultOptions` 预载：

- 所有报表：加载"从历史中选择"下拉（`historyList` 接口）+ 密级字典（`getDictionaryList`，父级 ID `2046869125529927682`）。
- R08 / R09：额外加载"选择材料"下拉（`listAllMaterialCode`）。
- R01 的"选择任务"下拉在用户选完任务类型与日期后由 `loadR01TaskOptions` 按需加载。

### 2. 筛选与数据加载

筛选控件统一通过 `handleFilterChange(item)` 响应变化，点击动作按钮通过 `handleAction(btnText)` → `loadData()`：

- **R01（任务接入型）**：选任务类型 + 日期区间 → `loadR01TaskOptions` 调 `POST /busin/form/task/list` 刷新"选择任务"下拉 → 选任务 → 点"接入报表" → `buildTaskDetailParams` 调 `POST /busin/form/task/detail`，结果经 `normalizeTaskDetailRows` 展开为按批次分组的明细行（含 `_isGroupTotal` 分组合计行），并回填发方/收方单位等表头。
- **R03-R09（统计生成型）**：按各报表筛选条件 → 点"统计/生成" → `buildQueryParams` 构建参数（年份+季度会自动推算 `startTime`/`endTime`）→ 调 `generate` 接口，结果经 `normalizeDetailData` 拆为 `report`（表头）与 `detailList`（明细）。
- **从历史加载（所有报表）**：在"从历史中选择"下拉选中已保存报表 → `handleFilterChange` 调 `detail` 接口 → `normalizeDetailData` 回填表头与明细；清空选择则清空数据。R01 历史报表的 `taskNum`（逗号分隔）会回填到"选择任务"多选。

### 3. 报表纸模板填报

报表纸区域根据 `activeReport` 选择模板组件：

- `activeReport === 'R01'` → `R01Template.vue`（发方/收方左右对称布局）。
- 其余 → `CommonTemplate.vue`（通用两栏式，字段来自 `templateConfigs[code].leftRows`）。

两个模板通过 `:form-data="templateData"` 接收表头、`:security-options="securityOptions"` 接收密级字典，编辑后通过 `@update="updateTemplateData"` 把变更合并回 `index.vue` 的 `templateData`。

**页眉布局（两个模板一致）**：自上而下三行——

1. 密级（左）；
2. 报表标题（居中）；
3. **格式（左）—— 表号（右）**：同处 `.header-sub-row`，由 `justify-content: space-between` 实现左右分布；格式输入框 `placeholder` 取 `config.formatNo`，表号输入框 `placeholder` 取 `config.tableNo`，打印态（`print-only`）与编辑态（`no-print`）分别渲染。

### 4. 关联明细表格

表格列由 `currentColumns`（即 `reportConfigs[code].columns`）动态渲染，支持多级表头（`children`）与序号列（`type: 'index'`）。表格高度受 `tableHeight` 限制，避免大页面无限拉长。

- **R06**：列配置含操作列 `{ type: 'operation', actions: ['新增', '删除'] }`，由 `handleRowAction(action, row)` 处理——"新增"复制当前行并标记 `_isNew` 后追加，"删除"按引用从 `tableData` 移除。
- **R01**：`cellStyle` 按 `taskNum` 对行分组着色（循环色板），`_isGroupTotal` 小计行使用金色底色与加粗文字。
- **R04**：当材料代码(goodsCode)以"物素代码"开头（如"物素代码：CL0001"）时为合计行，由 `normalizeRowsForDisplay` 标记 `_isTotalRow` 并将测量点代码置为"合计"；`span-method` 使该行"材料代码"与"材料类型代码"两列合并展示为单个单元格；`cellStyle` 使用与其他界面一致的微金色底色（`#fffbeb`，文字 `#b45309`，加粗），与 R01 的 `_isGroupTotal` 小计行保持一致；序号列显示"-"。
- **R08 / R09**：明细带 `seqNo` 序号，由 `normalizeRowsForDisplay` 兜底生成。

### 5. 保存（handleSave）

点击"保存报表"调用 `buildSavePayload(activeReport, templateData, tableData)`：

- 先过滤掉前端拼装的 `_isGroupTotal` 分组合计行以及 R04 的 `_isTotalRow` 合计行，避免污染存储；
- `buildHeader` 按 `headerFields[code]` 白名单提取表头，并清洗 `formNo` 开头的 `X`/`x`/`Ｘ` 前缀（兼容后端历史脏数据）；
- 明细按 `detailFields[code]` 白名单经 `normalizeRowForSave` 提取；
- 调用 `save` 接口（`POST /{code}/save`），成功后 `reloadHistoryOptions` 刷新"从历史中选择"下拉。

### 6. 导出与下载

工具栏提供三个出口，注意区分：

| 按钮 | 方法 | 行为 | 前置条件 |
| --- | --- | --- | --- |
| 保存报表 | `handleSave` | 提交表头+明细到后端保存 | — |
| 导出 Excel | `handleExport` | 调 `GET /{code}/export/{id}`（`responseType: 'blob'`）下载后端生成的文件 | 需有历史报表 `id`（取自 `templateData.id`，否则回退到历史下拉选中值） |
| 表单下载 | `handleTemplatePrint` | `exportReportWithTemplate` 用 ExcelJS 读取 `public/templates/{type}-表单.xlsx` 模板，按 `CELL_MAPS` 填充字段后下载 | 需已加载或填写 `templateData` |

- "导出 Excel"按钮在无历史 `id` 时禁用（`isExportDisabled`）。
- "表单下载"仅对 `['R01','R03','R04','R05','R06','R08','R09']` 显示；`R05/R08/R09` 复用 `R03-表单.xlsx` 模板（见 `exportReportTemplate.js` 中 `actualTemplateType`）。
- 表单下载前，对 R03/R05/R08/R09 会按当前年季兜底补全"起止年季"与"实际日期"区间字段。

## 五、接口约定

接口统一前缀 `/busin/form/report`（见 `api.js` 中 `reportBase`）。`code` 为报表小写编码（`r01`、`r03`…）。

| 用途 | 方法 | 路径 | 备注 |
| --- | --- | --- | --- |
| 历史列表 | GET | `/{code}/list` | R01 用 `/{code}/listAll` |
| 历史详情 | GET | `/{code}/detail/{id}` | |
| 导出文件 | GET | `/{code}/export/{id}` | `responseType: 'blob'` |
| 保存 | POST | `/{code}/save` | body 为 `buildSavePayload` 结果 |
| 统计/生成 | POST | `/{code}/query` | R03 专用 `/busin/form/quarter/list` |
| R01 任务列表 | POST | `/busin/form/task/list` | |
| R01 任务明细 | POST | `/busin/form/task/detail` | |

`requestFun`（`index.js`）按报表编码聚合上述接口；`R02`、`R07` 为 `null`。

## 六、数据规范化与字段映射（index.js 核心）

后端不同接口返回结构差异较大，`index.js` 中一组 `normalize*` / `build*` 函数负责屏蔽差异，修改字段时务必同步检查：

- **`normalizeDetailData(code, data)`**：兼容 `report + detailList`、`list`、`records`、`data`、`goodsList`、纯数组等多种返回结构；兜底会遍历对象寻找首个非空数组作为明细。返回 `{ report, detailList }`。
- **`normalizeRowsForDisplay(code, rows)`**：明细字段别名兜底，例如 `containerCount→itemCount`、`itemCount→itemsPerBatch`、`batchNo→batchNoCode`、`annotation→remarkSymbol`、`elementContent→elementQuantity`、`isotopeContent→isotopeQuantity`；R08/R09 补 `seqNo`。
- **`normalizeTaskDetailRows(data)`**：R01 专用，把任务的 `goodsList` 展平为明细行，若任务带 `totalInfo` 则追加 `_isGroupTotal` 分组合计行（容器编号位显示"小计"）。
- **`toTemplateData(code, report)`**：把后端表头字段映射为模板字段（如 `startYearQuarter→yearQuarterRangeStart`、`startDate→actualDateRangeStart`），并清洗 `formNo` 的 `X` 前缀。
- **`buildHeader` / `buildSavePayload`**：按 `headerFields[code]`、`detailFields[code]` 白名单提取保存数据；这是"哪些字段会提交给后端"的单一事实来源。
- **`buildQueryParams`**：年份+季度自动推算季度起止日期（`startTime`/`endTime`），`dateRange` 转起止日期，`goodsCodes` 透传，R01 透传 `type`。

> 字段新增/改名时，需要联动检查四处：`reportConfigs.js`（展示列）、`index.js` 的 `normalize*`（读取兜底）与 `headerFields/detailFields`（保存白名单）、`exportReportTemplate.js` 的 `CELL_MAPS`（表单下载）。只改一处会导致展示、保存、下载三者不一致。

## 七、关键状态字段（index.vue data）

| 字段 | 含义 |
| --- | --- |
| `currentView` | `'list'` 卡片视图 / `'detail'` 填报视图 |
| `activeReport` | 当前报表编码（`R01`-`R09`），驱动 `currentConfig`/`currentSearchConfig`/`currentColumns` |
| `searchParams` | 筛选条件（`year`/`quarter`/`dateRange`/`type`/`taskNums`/`historyId`/`historyIds`/`goodsCodes`） |
| `templateData` | 报表表头数据，双向绑定到模板组件 |
| `tableData` | 关联明细行数组，可能含 `_isGroupTotal`、`_isNew` 前端标记 |
| `searchOptions` | 各筛选下拉的选项集（`taskNums`/`historyId`/`historyIds`/`goodsCodes`） |
| `securityOptions` | 密级字典选项 |

## 八、开发与修改注意事项

- 修改任意报表前，先阅读本文档、`docs/PROJECT_ARCHITECTURE.md`、`docs/SYSTEM_MODULES_MAP.md`。
- **新增/停用报表**：在 `reportCards` 增删卡片，在 `reportConfigs` 增删配置，在 `requestFun` 增删接口映射（停用置 `null`，如 `R02`/`R07`），必要时在 `api.js` 补接口、在 `exportReportTemplate.js` 补 `CELL_MAPS`。
- **页眉排版调整**（密级/格式/表号/标题）：`CommonTemplate.vue` 与 `R01Template.vue` 结构对称，两处要同步修改；屏幕样式与 `@media print` 打印样式都要改，避免导出/打印效果不一致。
- **筛选项或表格列调整**：只改 `reportConfigs[code].search` / `.columns` 即可生效，控件类型必须用 `select`/`daterange`/`year`，不要在筛选区引入 `checkbox`（遵守全局列表页规范）。
- **字段映射变更**：遵循第六节"四处联动"原则，避免展示、保存、下载不一致。
- **R01 明细分组**：`_isGroupTotal` 是前端拼装的合计行，保存时已被 `handleSave` 过滤，不要把它写入保存白名单；`cellStyle` 的分组着色依赖 `taskNum`，调整 R01 列时保留 `taskNum` 字段。
- **R06 行操作**：依赖列配置 `type: 'operation'` + `handleRowAction`，目前仅 R06 启用；若其他报表需要明细新增/删除，沿用同一约定。
- **导出 Excel 与表单下载是两条独立链路**：前者走后端 `export/{id}`（需已保存的历史 id），后者走前端 ExcelJS 填充模板（无需保存）。需求要分清。
- **表单下载模板文件**：放在 `public/templates/{type}-表单.xlsx`，`R05/R08/R09` 共用 `R03-表单.xlsx`；调整单元格映射时同步改 `CELL_MAPS` 并确认模板文件存在。
- 若后续新增报表模板组件或重构数据流，请在本文档"文件结构与职责"和"修改定位速查表"中同步更新定位信息。
