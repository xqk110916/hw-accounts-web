# 封记管理界面逻辑描述说明书

## 1. 页面定位

封记管理属于数据管理模块下的 `sealLedger`（封记台账）业务，用于维护容器与两道封记之间的登记关系，记录封记编码、封记类型、封记状态、登记时间及关联容器信息。

适配技术栈为 Vue 2.7 + Element UI 2.15。列表页必须保持项目标准结构：`wrapper -> content -> right -> search -> operation -> table -> pagination`。搜索区使用全局 `search-filter` 组件；状态、类型、容器等枚举或字典筛选必须使用 `select / el-select`，不得使用 `checkbox / el-checkbox / el-checkbox-group`。截图中“封记状态”在搜索区为 `el-radio-group`，落地开发时应按项目规则调整为可清空 `el-select`。

页面不新增路由时，仍沿用 `src/views/dataManagement/sealLedger/index.vue`。若新增、编辑、详情、导入能力落地为弹窗，必须拆为独立 Dialog 组件，建议目录如下：

| 组件 | 用途 |
| --- | --- |
| `components/EditDialog.vue` | 新增 / 编辑封记记录 |
| `components/DetailDialog.vue` | 查看封记详情，只读展示 |
| `components/ImportDialog.vue` | 导入封记记录 |

## 2. 列表页逻辑

### 2.1 数据结构定义

`searchForm`：

| 字段名称 | UI 组件 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| 封记编码 | `el-input` | String | `""` | 模糊查询封记1或封记2的编码 |
| 封记类型 | `el-select` | String | `""` | 从封记类型字典选择，可清空 |
| 封记状态 | `el-select` | String | `""` | 搜索区按项目规则使用下拉；选项为全部、完好、破损 |
| 登记时间 | `el-date-picker` | Array | `[]` | 日期范围，提交前拆为开始日期、结束日期 |
| 容器 | `el-select` | String / Number | `""` | 选择容器，建议支持远程搜索 |
| currentPage | `el-pagination` | Number | `1` | 当前页 |
| pageSize | `el-pagination` | Number | `20` | 每页条数 |
| total | `el-pagination` | Number | `0` | 总条数 |

`tableData` 行数据：

| 字段名称 | UI 组件 | 类型 | 默认值 / 展示格式 | 说明 |
| --- | --- | --- | --- | --- |
| selection | `el-table-column type="selection"` | Boolean | false | 表格多选，不参与接口展示 |
| 容器 | `el-table-column` | String | `编号+名称+位置` | 由容器编号、名称、位置拼接展示 |
| 封记1 | `el-table-column` | String | `编码【类型】` | 由封记1编码与封记1类型拼接展示 |
| 封记2 | `el-table-column` | String | `编码【类型】` | 由封记2编码与封记2类型拼接展示 |
| 登记时间 | `el-table-column` | String | `YYYY-MM-DD HH:mm:ss` | 封记登记时间 |
| 状态 | `el-table-column` | String | `完好 / 破损` | 展示封记状态 |
| 操作 | `el-table-column` | Array | `详情 编辑 删除` | 行内文字按钮 |

隐藏但必要的行字段：

| 字段名称 | 类型 | 说明 |
| --- | --- | --- |
| id | String / Number | 主键，用于详情、编辑、删除 |
| containerId | String / Number | 容器主键，用于编辑回填 |
| sealCode1 | String | 封记编码1，对应“封记编码1”输入框 |
| sealType1 | String | 封记类型1，对应“封记类型1”下拉框 |
| sealCode2 | String | 封记编码2，对应“封记编码2”输入框 |
| sealType2 | String | 封记类型2，对应“封记类型2”下拉框 |
| status | String | 封记状态原始值 |
| registerTime | String | 登记时间原始值 |

必要状态变量：

| 变量名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| loading | Boolean | false | 列表查询 loading |
| dialogVisible | Boolean | false | 新增 / 编辑弹窗显隐；实际组件内可拆为本地状态 |
| detailDialogVisible | Boolean | false | 详情弹窗显隐 |
| importDialogVisible | Boolean | false | 导入弹窗显隐 |
| submitLoading | Boolean | false | 保存、删除、导入等提交 loading |
| selectedRows | Array | [] | 表格多选行缓存 |
| selectedIds | Array | [] | 从 `selectedRows` 派生的主键数组 |
| sealTypeOptions | Array | [] | 封记类型字典 |
| statusOptions | Array | `全部 / 完好 / 破损` | 封记状态选项 |
| containerOptions | Array | [] | 容器下拉选项 |
| pagination | Object | `{ currentPage: 1, pageSize: 20, total: 0 }` | 分页状态 |
| tableHeight | Number | 0 | 按 demo/crud 规则计算表格高度 |

### 2.2 搜索区校验规则

| 字段名称 | 校验规则 |
| --- | --- |
| 封记编码 | 非必填；去除首尾空格；长度 1-64；允许中文、英文、数字、短横线、下划线；禁止仅空白字符 |
| 封记类型 | 非必填；值必须存在于封记类型字典；清空时不传该条件 |
| 封记状态 | 非必填；只能为“完好”或“破损”；选择“全部”或清空时不传具体状态 |
| 登记时间 | 非必填；必须为合法日期范围；开始日期不得晚于结束日期；结束日期默认补到当天 `23:59:59` |
| 容器 | 非必填；值必须来自容器下拉数据；支持清空 |

### 2.3 操作按钮与显示规则

| 按钮 | 所在区域 | 触发方法 | 逻辑 |
| --- | --- | --- | --- |
| 查询 | 搜索区 | `handleQuery` | 校验筛选条件，重置页码为 1 后查询 |
| 重置 | 搜索区 | `handleReset` | 清空筛选条件，恢复分页默认值后查询 |
| 新增 | 操作区 | `handleAdd` | 打开 `EditDialog.vue`，表单为空，模式为新增 |
| 导入 | 操作区 | `handleImport` | 打开 `ImportDialog.vue`，用于 Excel 批量导入 |
| 删除 | 操作区 | `handleBatchDelete` | 对 `selectedRows` 执行批量删除，未选择时提示 |
| 详情 | 表格操作列 | `handleDetail(row)` | 打开 `DetailDialog.vue` 并加载详情 |
| 编辑 | 表格操作列 | `handleEdit(row)` | 打开 `EditDialog.vue`，按 `id` 获取详情后回填 |
| 删除 | 表格操作列 | `handleDelete(row)` | 二次确认后删除单条记录 |

列表页不应补充审批、提交、打印按钮。若后续业务要求这些能力，应先确认封记台账是否进入任务审批流或打印链路，再同步接口、路由菜单与模块 README。

### 2.4 关键 methods 逻辑流

`handleQuery`：

1. 触发表单校验，重点校验“封记编码”和“登记时间”。
2. 设置 `pagination.currentPage = 1`。
3. 调用 `getTableList`。

`getTableList`：

1. `loading = true`。
2. 组装查询参数：保留“封记编码”“封记类型”“封记状态”“容器”；将“登记时间”拆为开始时间、结束时间；追加 `currentPage`、`pageSize`。
3. 调用列表 API，接口路径必须统一使用 `/busin` 前缀。
4. 将返回的列表映射为 `tableData`；封记类型按字典转换展示名；“容器”“封记1”“封记2”在前端生成展示文本。
5. 将分页总数写入 `pagination.total`。
6. 异常时提示“查询失败”并保留当前筛选条件。
7. `loading = false`。

`handleReset`：

1. 清空“封记编码”“封记类型”“封记状态”“登记时间”“容器”。
2. 恢复 `pagination.currentPage = 1`、`pagination.pageSize = 20`。
3. 清空表格勾选。
4. 调用 `getTableList`。

`handleSelectionChange(rows)`：

1. 将 `rows` 赋值给 `selectedRows`。
2. 从 `rows` 提取 `id` 形成 `selectedIds`。
3. 批量删除按钮可保持可点击，但点击时必须判断是否已选择。

`handleAdd`：

1. 清空 `formData`，设置默认“封记状态 = 完好”。
2. 加载封记类型和容器选项。
3. 打开 `EditDialog.vue`，标题为“新增”。

`handleEdit(row)`：

1. 校验 `row.id` 存在。
2. 打开编辑弹窗并设置详情 loading。
3. 调用详情 API 获取完整数据，回填 `formData`。
4. 弹窗标题为“编辑”。

`handleDetail(row)`：

1. 校验 `row.id` 存在。
2. 打开详情弹窗。
3. 调用详情 API，赋值 `detailData`。
4. 详情字段只读展示，不允许编辑。

`handleDelete(row)`：

1. 弹出确认框：“确定要删除该封记记录吗？”。
2. 用户确认后设置 `submitLoading = true`。
3. 调用删除 API。
4. 成功后提示“删除成功”，刷新列表；若当前页删除后无数据且页码大于 1，页码前移一页再查。
5. `submitLoading = false`。

`handleBatchDelete`：

1. 判断 `selectedRows.length`，为空则提示“请先选择需要删除的记录”。
2. 弹出确认框：“确定要删除选中的封记记录吗？”。
3. 调用批量删除 API，参数使用 `selectedIds`。
4. 成功后清空勾选并刷新列表。

## 3. 新增 / 编辑弹窗逻辑

### 3.1 数据结构定义

`formData`：

| 字段名称 | UI 组件 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| 封记编码1 | `el-input` | String | `""` | 输入第一道封记编码 |
| 封记类型1 | `el-select` | String | `""` | 选择第一道封记类型，来源为封记类型字典 |
| 封记编码2 | `el-input` | String | `""` | 输入第二道封记编码 |
| 封记类型2 | `el-select` | String | `""` | 选择第二道封记类型，来源为封记类型字典 |
| 登记时间 | `el-date-picker` | String | `""` | 登记时间，建议精确到秒 |
| 封记状态 | `el-radio-group` | String | `"完好"` | 表单录入可保留单选，选项为完好、破损 |
| 容器 | `el-select` | String / Number | `""` | 关联容器，必选 |

说明：虽然上游 UI 截图将“封记1”“封记2”表现为一行组合控件，但新增和编辑表单的数据结构必须拆分为“封记编码1、封记类型1、封记编码2、封记类型2”四个独立字段，便于 Element UI 表单按字段粒度校验和向接口提交。

弹窗状态变量：

| 变量名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| visible | Boolean | false | 弹窗显隐 |
| mode | String | `add` | `add / edit` |
| title | String | `新增` | 根据模式展示“新增”或“编辑” |
| formLoading | Boolean | false | 详情回填 loading |
| submitLoading | Boolean | false | 保存 loading |
| sealTypeOptions | Array | [] | 封记类型选项 |
| containerOptions | Array | [] | 容器选项 |

### 3.2 表单校验规则

| 字段名称 | 校验规则 |
| --- | --- |
| 封记编码1 | 必填；长度 1-64；允许中文、英文、数字、短横线、下划线；禁止仅空白字符 |
| 封记类型1 | 必填；必须从封记类型字典中选择；值必须存在于 `sealTypeOptions` |
| 封记编码2 | 必填；长度 1-64；允许中文、英文、数字、短横线、下划线；禁止仅空白字符；不得与“封记编码1”重复 |
| 封记类型2 | 必填；必须从封记类型字典中选择；值必须存在于 `sealTypeOptions` |
| 登记时间 | 必填；必须为合法日期时间；不得晚于当前时间；编辑时允许保留接口原值 |
| 封记状态 | 必填；只能为“完好”或“破损” |
| 容器 | 必填；必须来自容器下拉选项 |

表单中的所有字段均为必填。若业务未来允许单封记容器，应先由产品或接口明确“封记编码2 / 封记类型2”可为空，再调整本规则。

### 3.3 保存逻辑

`handleSave`：

1. 调用 `this.$refs.form.validate()`。
2. 校验“封记编码1”和“封记编码2”的编码互斥关系。
3. `submitLoading = true`。
4. 组装提交参数：保留 `sealCode1`、`sealType1`、`sealCode2`、`sealType2`、登记时间、封记状态、容器；编辑时附加 `id`。
5. 根据 `mode` 调用新增或修改 API。
6. 成功后提示“保存成功”，关闭弹窗，通知父页面刷新列表。
7. 失败时保留弹窗和表单输入，便于用户修正。
8. `submitLoading = false`。

`handleCancel`：

1. 若表单未改动，直接关闭弹窗。
2. 若存在改动，弹出确认：“当前内容未保存，确定取消吗？”。
3. 关闭时清空校验状态和 `formData`。

## 4. 详情弹窗逻辑

`detailData`：

| 字段名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 容器 | String | `""` | 展示编号、名称、位置 |
| 封记1 | String | `""` | 展示 `编码【类型】` |
| 封记2 | String | `""` | 展示 `编码【类型】` |
| 登记时间 | String | `""` | 展示登记时间 |
| 状态 | String | `""` | 展示完好或破损 |

详情弹窗只读，不提供保存按钮。底部仅保留“关闭”或“取消”。若详情接口返回原始 `sealCode1`、`sealType1`、`sealCode2`、`sealType2`，前端需要按封记类型字典映射后再展示。

## 5. 导入弹窗逻辑

### 5.1 数据结构定义

`importForm`：

| 字段名称 | UI 组件 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| 选择文件 | `el-upload` | File | null | UI 未在截图展示，但“导入”按钮需要补全上传交互 |

`importResult`：

| 字段名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| totalNum | Number | 0 | 导入总数 |
| successNum | Number | 0 | 成功数 |
| failNum | Number | 0 | 失败数 |
| remindList | Array | [] | 失败或提醒明细 |
| failFilePath | String | `""` | 后端返回的问题文件地址 |

导入状态变量：

| 变量名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| visible | Boolean | false | 导入弹窗显隐 |
| fileList | Array | [] | 上传文件列表 |
| uploadLoading | Boolean | false | 文件解析 loading |
| downloadLoading | Boolean | false | 下载模板或问题文件 loading |

### 5.2 文件校验规则

| 字段名称 | 校验规则 |
| --- | --- |
| 选择文件 | 必填；仅允许 `.xls`、`.xlsx`；文件大小建议不超过 20MB；一次仅允许上传 1 个文件 |

### 5.3 导入逻辑

`handleImport`：

1. 打开 `ImportDialog.vue`，清空 `fileList` 和 `importResult`。
2. 用户选择文件时执行格式和大小校验。
3. 点击“导入”后以 `FormData` 上传文件。
4. `uploadLoading = true`。
5. 接口返回后展示成功数、失败数和提醒明细。
6. 若存在失败数据，提供下载问题文件能力。
7. 导入成功后通知父页面刷新列表。
8. `uploadLoading = false`。

## 6. 数据字典

### 6.1 封记状态

| 显示值 | 建议值 | 用途 | 说明 |
| --- | --- | --- | --- |
| 全部 | `""` | 搜索 | 仅用于筛选，不作为真实业务状态提交 |
| 完好 | `intact` / `normal` | 搜索、表单、表格 | 表示封记无破损 |
| 破损 | `damaged` | 搜索、表单、表格 | 表示封记破损 |

实际提交值以接口定义为准，但页面展示字段名称必须保持“封记状态”和“状态”。

### 6.2 封记类型

| 字段名称 | 来源 | 说明 |
| --- | --- | --- |
| 封记类型 | 字典接口 | 搜索区筛选使用 |
| 封记类型1 | 字典接口 | 与封记编码1成对维护 |
| 封记类型2 | 字典接口 | 与封记编码2成对维护 |

项目已有封记类型工具必须复用：`src/utils/sealType.js` 暴露 `getSealTypeOptions()` 与 `formatSealType()`，字典父级 ID 为 `2052628107427078145`。现有 `src/views/task/inbound/components/detail.vue`、`src/views/task/outbound/components/detail.vue`、`src/views/task/move/components/detail.vue`、`src/views/warehouse/warehouse/components/ContainerDetailDialog.vue` 等页面均通过该工具获取和格式化封记类型。开发封记管理时应沿用同一方式：页面初始化或弹窗打开时调用 `getSealTypeOptions()` 填充 `sealTypeOptions`，表格和详情展示时调用 `formatSealType(sealTypeOptions, value)` 映射名称，提交时保留字典值。

### 6.3 页面字段字典

| 页面 | 字段名称 | 组件 | 数据用途 | 备注 |
| --- | --- | --- | --- | --- |
| list.png | 封记编码 | `el-input` | 列表查询 | 模糊匹配封记1 / 封记2 |
| list.png | 封记类型 | `el-select` | 列表查询 | 字典下拉 |
| list.png | 封记状态 | `el-select` | 列表查询 | UI 截图为 radio，开发落地改为 select |
| list.png | 登记时间 | `el-date-picker` | 列表查询 | 日期范围 |
| list.png | 容器 | `el-select` | 列表查询 | 容器下拉或远程搜索 |
| list.png | 查询 | 按钮 | 查询列表 | 触发 `handleQuery` |
| list.png | 重置 | 按钮 | 重置筛选 | 触发 `handleReset` |
| list.png | 新增 | 按钮 | 新增记录 | 打开 `EditDialog.vue` |
| list.png | 导入 | 按钮 | 批量导入 | 打开 `ImportDialog.vue` |
| list.png | 删除 | 按钮 | 批量删除 | 依赖表格选择 |
| list.png | 容器 | 表格列 | 展示容器信息 | 格式为“编号+名称+位置” |
| list.png | 封记1 | 表格列 | 展示封记1 | 格式为“编码【类型】” |
| list.png | 封记2 | 表格列 | 展示封记2 | 格式为“编码【类型】” |
| list.png | 登记时间 | 表格列 | 展示登记时间 | `YYYY-MM-DD HH:mm:ss` |
| list.png | 状态 | 表格列 | 展示封记状态 | 完好 / 破损 |
| list.png | 操作 | 表格列 | 行内动作 | 详情、编辑、删除 |
| add.png | 封记编码1 | `el-input` | 录入第一道封记编码 | 必填 |
| add.png | 封记类型1 | `el-select` | 选择第一道封记类型 | 必填，来源为封记类型字典 |
| add.png | 封记编码2 | `el-input` | 录入第二道封记编码 | 必填，且不得与封记编码1重复 |
| add.png | 封记类型2 | `el-select` | 选择第二道封记类型 | 必填，来源为封记类型字典 |
| add.png | 登记时间 | `el-date-picker` | 录入登记时间 | 必填 |
| add.png | 封记状态 | `el-radio-group` | 录入业务状态 | 必填，选项为完好 / 破损 |
| add.png | 容器 | `el-select` | 关联容器 | 必填 |
| add.png | 保存 | 按钮 | 保存新增或编辑 | 触发表单校验和提交 |
| add.png | 取消 | 按钮 | 关闭弹窗 | 有改动时二次确认 |

## 7. 文档同步判断

本方案基于既有 `dataManagement/sealLedger` 页面进行字段与交互完善，不必新增路由或菜单。若后续仅实现列表字段、Dialog 组件、接口联调和页面行为，应同步更新 `src/views/dataManagement/README.MD` 中 `sealLedger/` 的说明；若创建 `src/views/dataManagement/sealLedger/README.md`，后续封记台账行为变化应优先更新该页面级 README。

若新增路由、菜单、权限标识、打印入口或审批入口，则必须同步更新 `menu.json`、`docs/SYSTEM_MODULES_MAP.md` 和对应模块 README，并确认是否需要后端菜单 / 权限注册。
