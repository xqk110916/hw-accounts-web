# 初始录入界面逻辑描述说明书

## 1. 页面定位

初始录入用于系统建设初期的基础数据导入、问题数据复核、提交审核与审批闭环。页面由 `list.png (列表页)`、`add.png (新增/导入页)`、`approve.png (审批页)` 三类界面组成。

适配技术栈为 Vue 2 + Element UI。搜索区建议使用项目全局 `search-filter`，表格使用 `el-table`，分页使用 `el-pagination`，文件导入使用 `el-upload`，新增/编辑/详情/审批建议拆分为独立 Dialog 组件。

## 2. 列表页逻辑

### 2.1 数据结构定义

`searchForm`：

| 字段名 | 来源字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| 添加时间 | 添加时间: | Array / String | [] | 日期范围，存储开始日期与结束日期 |
| 状态 | 状态 | Array | ["全部"] | 多选状态，包含“全部”、“待提交”、“待审核”、“审核通过”、“审核拒绝” |
| currentPage | 分页 | Number | 1 | 当前页码 |
| pageSize | 分页 | Number | 20 | 每页条数 |
| total | 分页 | Number | 0 | 总条数 |

`tableData`：

| 字段名 | 来源列名 | 类型 | 说明 |
| --- | --- | --- | --- |
| selection | 选择框(多选) | Boolean | 表格多选状态 |
| 数据类型 | 数据类型 | String | 导入数据所属业务类型 |
| 导入时间 | 导入时间 | String | 数据导入时间 |
| 导入人 | 导入人 | String | 数据导入操作人 |
| 审批时间 | 审批时间 | String | 审批完成时间 |
| 审批人 | 审批人 | String | 审批操作人 |
| 据条数 | 据条数 | Number | 本次导入数据条数 |
| 状态 | 状态 | String | 当前单据状态 |
| 操作 | 操作 | Array | 行内可执行动作集合 |

必要状态变量：

| 变量名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| listLoading | Boolean | false | 列表查询 loading |
| selectedRows | Array | [] | 多选行缓存 |
| addDialogVisible | Boolean | false | 新增/导入弹窗显隐 |
| detailDialogVisible | Boolean | false | 详情弹窗显隐 |
| editDialogVisible | Boolean | false | 编辑弹窗显隐 |
| approveDialogVisible | Boolean | false | 审批弹窗显隐 |
| submitLoading | Boolean | false | 提交类操作 loading |

### 2.2 表单校验规则

搜索区规则：

| 字段名 | 校验规则 |
| --- | --- |
| 添加时间 | 非必填；选择后必须为合法日期范围，开始日期不得晚于结束日期 |
| 状态 | 非必填；若选择“全部”，应清空其他状态；若选择具体状态，应取消“全部” |

### 2.3 操作按钮与显示规则

顶部按钮：

| 按钮 | 触发方法 | 逻辑 |
| --- | --- | --- |
| 查询 | handleQuery | 重置 `currentPage = 1` 后查询列表 |
| 重置 | handleReset | 清空“添加时间:”，状态恢复为“全部”，重置分页并查询 |
| 添加 | handleAdd | 打开新增/导入页或导入 Dialog |

行内按钮：

| 操作 | 推荐状态 | 逻辑 |
| --- | --- | --- |
| 详情 | 全部状态 | 打开只读详情，展示导入内容、备注与审批信息 |
| 审核 | 待审核 | 进入审批页或打开审批 Dialog |
| 编辑 | 待提交、审核拒绝 | 回填当前导入记录，可修改“备注”或重新维护导入数据 |
| 删除 | 待提交、审核拒绝 | 二次确认后删除 |
| 提交 | 待提交、审核拒绝 | 二次确认后提交审核，状态变为“待审核” |

### 2.4 关键 methods 逻辑流

`handleQuery`：

1. 校验“添加时间:”范围。
2. `listLoading = true`。
3. 组装查询参数：添加时间拆为开始日期、结束日期；状态为“全部”时不传具体状态。
4. 调用列表 API。
5. 将返回记录赋值给 `tableData`，将总数赋值给 `total`。
6. `listLoading = false`。

`handleReset`：

1. 重置 `searchForm.添加时间 = []`。
2. 重置 `searchForm.状态 = ["全部"]`。
3. 重置 `currentPage = 1`、`pageSize = 20`。
4. 调用 `handleQuery`。

`handleAdd`：

1. 清空导入页 `formData`、`fileList`、`importResult`、问题表格。
2. 设置页面模式为新增。
3. 打开新增/导入页。

`handleDelete(row)`：

1. 弹出 `this.$confirm("确定要删除吗?")`。
2. 用户确认后设置 `submitLoading = true`。
3. 调用删除 API。
4. 成功后提示“删除成功”并刷新列表。
5. 关闭 `submitLoading`。

`handleSubmit(row)`：

1. 校验当前状态是否允许提交。
2. 弹出 `this.$confirm("确定要提交吗?")`。
3. 调用提交审核 API。
4. 成功后提示“提交成功”，刷新列表。

## 3. 新增/导入页逻辑

### 3.1 数据结构定义

`formData`：

| 字段名 | 来源字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| 类型 | 类型 | String | "封记台账" | 导入数据类型 |
| 选择文件 | 选择文件 | File / String | "" | 当前选择的导入文件 |
| 备注 | 备注 | String | "" | 提交审核备注 |

`importResult`：

| 字段名 | 来源字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| 导入内容 | 导入内容 | Object | { 成功: 0, 失败: 0 } | 导入结果统计，对应“成功xxxx条，失败xxx条” |

`problemTableData`：

| 字段名 | 来源列名 | 类型 | 说明 |
| --- | --- | --- | --- |
| 行号 | 行号 | Number | Excel 或导入数据行号 |
| 字段1 | 字段1 | String | 导入字段展示 |
| 字段2 | 字段2 | String | 导入字段展示 |
| 字段3 | 字段3 | String | 导入字段展示 |
| 字段4 | 字段4 | String | 导入字段展示 |
| 问题 | 问题 | String | 失败原因或校验提示 |

必要状态变量：

| 变量名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| uploadLoading | Boolean | false | 文件上传/导入 loading |
| submitAuditLoading | Boolean | false | 提交审核 loading |
| exportProblemLoading | Boolean | false | 导出问题 loading |
| fileList | Array | [] | `el-upload` 文件列表 |
| imported | Boolean | false | 是否已完成导入 |
| hasProblem | Boolean | false | 是否存在问题数据 |

### 3.2 表单校验规则

| 字段名 | 校验规则 |
| --- | --- |
| 类型 | 必填；必须从下拉选项中选择；默认“封记台账” |
| 选择文件 | 必填；仅允许 Excel 文件；建议扩展名限制为 `.xls`、`.xlsx`；大小建议不超过 20MB |
| 备注 | 非必填；长度 0-500；禁止只输入空白字符 |

### 3.3 操作逻辑

`下载模板`：

1. 校验“类型”已选择。
2. 调用模板下载 API 或跳转静态模板地址。
3. 浏览器下载对应“类型”的导入模板。

`选择文件`：

1. 使用 `el-upload` 的 `before-upload` 或 `on-change` 拦截。
2. 校验文件格式、文件大小。
3. 仅保留最后一个文件。
4. 将文件名展示到“未选择任何文件”所在区域。

`导入`：

1. 校验“类型”和“选择文件”。
2. `uploadLoading = true`。
3. 以 `FormData` 上传文件和“类型”。
4. 接口返回成功、失败统计后，更新“导入内容”。
5. 将问题数据赋值给 `problemTableData`。
6. 若失败数大于 0，展示“导出问题”和“重新导入”。
7. `uploadLoading = false`。

`导出问题`：

1. 判断 `problemTableData` 是否为空。
2. `exportProblemLoading = true`。
3. 调用问题数据导出 API。
4. 下载问题 Excel。
5. `exportProblemLoading = false`。

`重新导入`：

1. 清空 `fileList`。
2. 保留“类型”和“备注”。
3. 清空“导入内容”和 `problemTableData`。
4. 回到可选择文件状态。

`提交审核`：

1. 校验已完成“导入”。
2. 若存在“问题”，默认阻止提交；如业务允许带问题提交，应二次确认。
3. 校验“备注”长度。
4. `submitAuditLoading = true`。
5. 调用提交审核 API。
6. 成功后提示“提交成功”，关闭新增页并刷新列表。
7. `submitAuditLoading = false`。

## 4. 审批页逻辑

### 4.1 数据结构定义

`approveData`：

| 字段名 | 来源字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| XXXX | XXXX | String | "" | 审批页顶部标题，建议展示数据类型或导入批次名称 |
| 导入内容 | 导入内容 | Object | {} | 导入统计与明细信息 |
| 备注 | 备注 | String | "" | 申请人提交的备注，只读展示 |

`approveTableData`：

| 字段名 | 来源列名 | 类型 | 说明 |
| --- | --- | --- | --- |
| 行号 | 行号 | Number | 导入数据行号 |
| 字段1 | 字段1 | String | 明细字段 |
| 字段2 | 字段2 | String | 明细字段 |
| 字段3 | 字段3 | String | 明细字段 |
| 字段4 | 字段4 | String | 明细字段 |
| 问题 | 问题 | String | 问题说明；审批时应重点提示 |

`approveForm`：

| 字段名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 审批结果 | String | "" | 由“通过”或“拒绝”按钮触发赋值 |
| 审批意见 | String | "" | UI 未提供，按 B 端审批通用模式补全；拒绝时必填 |

必要状态变量：

| 变量名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| detailLoading | Boolean | false | 审批详情 loading |
| approveLoading | Boolean | false | 审批提交 loading |
| rejectDialogVisible | Boolean | false | 拒绝意见弹窗显隐 |

### 4.2 表单校验规则

| 字段名 | 校验规则 |
| --- | --- |
| 审批结果 | 必填；只能为“通过”或“拒绝” |
| 审批意见 | “拒绝”时必填，1-500 字；“通过”时非必填，最多 500 字 |

### 4.3 操作逻辑

`通过`：

1. 判断当前记录状态是否为“待审核”。
2. 弹出确认框：“确定审核通过吗?”。
3. `approveLoading = true`。
4. 调用审批 API，传入审批结果“通过”。
5. 成功后提示“审核通过”，返回列表并刷新。
6. `approveLoading = false`。

`拒绝`：

1. 打开拒绝意见弹窗。
2. 用户输入“审批意见”。
3. 校验审批意见必填。
4. `approveLoading = true`。
5. 调用审批 API，传入审批结果“拒绝”和审批意见。
6. 成功后提示“审核拒绝”，返回列表并刷新。
7. `approveLoading = false`。

## 5. 数据字典

### 5.1 状态字典

| 显示值 | 含义 | 可执行操作 |
| --- | --- | --- |
| 全部 | 搜索条件，不代表真实状态 | 查询 |
| 待提交 | 导入完成但未进入审批 | 详情、编辑、删除、提交 |
| 待审核 | 已提交，等待审批 | 详情、审核 |
| 审核通过 | 审批通过，数据生效 | 详情 |
| 审核拒绝 | 审批拒绝，允许修正后重提 | 详情、编辑、删除、提交 |

### 5.2 页面字段字典

| 页面 | 字段/列名 | 组件 | 数据用途 |
| --- | --- | --- | --- |
| list.png (列表页) | 添加时间: | el-date-picker | 按导入时间范围筛选 |
| list.png (列表页) | 状态 | el-checkbox-group | 按状态筛选 |
| list.png (列表页) | 查询 | el-button | 执行列表检索 |
| list.png (列表页) | 重置 | el-button | 清空筛选条件 |
| list.png (列表页) | 添加 | el-button | 新增导入 |
| list.png (列表页) | 数据类型 | el-table-column | 展示导入类型 |
| list.png (列表页) | 导入时间 | el-table-column | 展示导入时间 |
| list.png (列表页) | 导入人 | el-table-column | 展示导入人 |
| list.png (列表页) | 审批时间 | el-table-column | 展示审批时间 |
| list.png (列表页) | 审批人 | el-table-column | 展示审批人 |
| list.png (列表页) | 据条数 | el-table-column | 展示导入条数 |
| list.png (列表页) | 状态 | el-table-column | 展示业务状态 |
| list.png (列表页) | 操作 | el-table-column | 展示行内动作 |
| add.png (新增/导入页) | 类型 | el-select | 选择导入数据类型 |
| add.png (新增/导入页) | 下载模板 | el-link | 下载导入模板 |
| add.png (新增/导入页) | 选择文件 | el-upload | 选择导入文件 |
| add.png (新增/导入页) | 导入 | el-button | 上传并解析文件 |
| add.png (新增/导入页) | 导入内容 | html-text | 展示成功/失败统计 |
| add.png (新增/导入页) | 导出问题 | el-button | 导出失败明细 |
| add.png (新增/导入页) | 重新导入 | el-button | 清空结果重新选择文件 |
| add.png (新增/导入页) | 行号 | el-table-column | 问题数据行号 |
| add.png (新增/导入页) | 字段1 | el-table-column | 问题数据字段 |
| add.png (新增/导入页) | 字段2 | el-table-column | 问题数据字段 |
| add.png (新增/导入页) | 字段3 | el-table-column | 问题数据字段 |
| add.png (新增/导入页) | 字段4 | el-table-column | 问题数据字段 |
| add.png (新增/导入页) | 问题 | el-table-column | 问题原因 |
| add.png (新增/导入页) | 备注 | el-input | 提交审核备注 |
| add.png (新增/导入页) | 提交审核 | el-button | 提交审批流 |
| approve.png (审批页) | XXXX | html-text | 审批标题 |
| approve.png (审批页) | 导入内容 | html-text | 审批明细区标题 |
| approve.png (审批页) | 备注 | html-text | 申请备注只读展示 |
| approve.png (审批页) | 通过 | el-button | 审批通过 |
| approve.png (审批页) | 拒绝 | el-button | 审批拒绝 |
