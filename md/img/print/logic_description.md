# 打印模块界面逻辑描述说明书

## 1. 页面定位

打印模块用于标签打印记录管理、标签数据新增/打印，以及标签模板配置。页面由 `list.png`、`template.png`、`add.png` 三类界面组成。

适配技术栈为 Vue 2 + Element UI。列表检索建议使用项目全局 `search-filter`，记录表格使用 `el-table`，模板配置使用左侧 `el-form` + 右侧预览区，新增/详情/编辑/导入建议使用独立 Dialog 组件。

## 2. 列表页逻辑

### 2.1 数据结构定义

`searchForm`：

| 字段名 | 来源字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| 日期范围 | el-date-picker | Array / String | [] | UI 未提供 label，按“打印时间”范围筛选 |
| currentPage | 分页 | Number | 1 | 当前页码 |
| pageSize | 分页 | Number | 20 | 每页条数 |
| total | 分页 | Number | 0 | 总条数 |

`tableData`：

| 字段名 | 来源列名 | 类型 | 说明 |
| --- | --- | --- | --- |
| 打印时间 | 打印时间 | String | 打印记录生成时间 |
| 标签数量 | 标签数量 | Number | 本次打印标签数量 |
| 备注 | 备注 | String | 打印备注 |
| 操作 | 操作 | Array | 行内动作集合 |

必要状态变量：

| 变量名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| listLoading | Boolean | false | 列表加载状态 |
| importDialogVisible | Boolean | false | 导入弹窗显隐 |
| addDialogVisible | Boolean | false | 添加弹窗显隐 |
| detailDialogVisible | Boolean | false | 详情弹窗显隐 |
| editDialogVisible | Boolean | false | 编辑弹窗显隐 |
| templateDrawerVisible | Boolean | false | 编辑模版页面显隐 |
| deleteLoading | Boolean | false | 删除操作 loading |

### 2.2 表单校验规则

| 字段名 | 校验规则 |
| --- | --- |
| 日期范围 | 非必填；选择后必须为合法日期范围，开始日期不得晚于结束日期；建议限制未来时间不可选 |

### 2.3 操作按钮与显示规则

顶部按钮：

| 按钮 | 触发方法 | 逻辑 |
| --- | --- | --- |
| 查询 | handleQuery | 按日期范围查询打印记录 |
| 重置 | handleReset | 清空日期范围并刷新列表 |
| 导入 | handleImport | 打开批量导入标签数据弹窗 |
| 添加 | handleAdd | 打开添加页，手动录入标签数据 |
| 编辑模版 | handleEditTemplate | 进入模板配置页 |

行内按钮：

| 操作 | 逻辑 |
| --- | --- |
| 详情 | 打开只读详情，展示“选择模板”、“备注”、标签字段与二维码 |
| 编辑 | 打开编辑页，回填当前记录字段，允许保存或重新打印 |
| 删除 | 二次确认后删除打印记录 |

### 2.4 关键 methods 逻辑流

`handleQuery`：

1. 校验日期范围。
2. `listLoading = true`。
3. 将日期范围拆为开始时间、结束时间。
4. 调用列表 API。
5. 返回数据赋值给 `tableData`，总数赋值给 `total`。
6. `listLoading = false`。

`handleReset`：

1. 清空日期范围。
2. 重置 `currentPage = 1`、`pageSize = 20`。
3. 调用 `handleQuery`。

`handleImport`：

1. 打开导入弹窗。
2. 用户选择文件。
3. 校验文件格式与大小。
4. 调用导入 API。
5. 导入成功后刷新列表。

`handleAdd`：

1. 清空 `formData`。
2. 默认选中“选择模板”的第一个模板，例如“模板1”。
3. 根据模板配置生成字段输入区。
4. 打开添加页。

`handleEditTemplate`：

1. 查询模板列表。
2. 默认选中“模板1”。
3. 查询模板详情。
4. 初始化左侧设置面板和右侧“预览区域图片”。

`handleDelete(row)`：

1. 弹出 `this.$confirm("确定要删除吗?")`。
2. `deleteLoading = true`。
3. 调用删除 API。
4. 删除成功后刷新列表。
5. `deleteLoading = false`。

## 3. 模板配置页逻辑

### 3.1 数据结构定义

`templateForm`：

| 字段名 | 来源字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| 模板 | el-select | String | "模板1" | UI 首个下拉框未提供 label，作为模板选择 |
| 标题 | 标题 | String | "材料管理卡" | 标签卡片标题 |
| 标题显示状态 | el-select | String | "显示" | UI 未提供 label，表示标题是否显示 |
| 标题字号 | el-select | String | "16号" | UI 未提供 label，表示标题字号 |
| 标题状态 | el-select | String | "正常" | UI 未提供 label，表示标题字重/状态 |
| 字段1 | 字段1 | String | "材料编码" | 模板字段名称 |
| 字段2 | 字段2 | String | "生产单位" | 模板字段名称 |
| 字段3 | 字段3 | String | "库房" | 模板字段名称 |
| 字段4 | 字段4 | String | "入库人" | 模板字段名称 |
| 字段5 | 字段5 | String | "容器号" | 模板字段名称 |
| 字段6 | 字段6 | String | "入库时间" | 模板字段名称 |
| 排版 | 排版 | String | "单排" | 字段排版方式 |
| 字号 | 字号 | String | "16号" | 字段字号 |
| 状态 | 状态 | String | "正常" | 字段启用或样式状态 |
| 二维码 | 二维码 | String | "50mm×50mm" | 二维码尺寸 |
| 显示状态 | 显示状态 | String | "显示" | 二维码是否显示 |
| 上边距 | 上边距 | String | "10mm" | 打印上边距 |
| 下边距 | 下边距 | String | "10mm" | 打印下边距 |
| 左边距 | 左边距 | String | "10mm" | 打印左边距 |
| 右边距 | 右边距 | String | "10mm" | 打印右边距 |

`fieldConfigList`：

| 字段名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| label | String | 字段1-字段6 | 原始字段序号 |
| value | String | 材料编码等 | 字段展示名称 |
| 排版 | String | 单排 | 当前字段排版 |
| 字号 | String | 16号 | 当前字段字号 |
| 状态 | String | 正常 | 当前字段状态 |

必要状态变量：

| 变量名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| templateLoading | Boolean | false | 模板详情加载状态 |
| previewLoading | Boolean | false | 预览刷新 loading |
| saveTemplateLoading | Boolean | false | 保存模板 loading |
| templateOptions | Array | [] | 模板下拉选项 |
| previewImageUrl | String | "" | 预览区域图片地址 |

### 3.2 表单校验规则

| 字段名 | 校验规则 |
| --- | --- |
| 模板 | 必填；必须从模板列表选择 |
| 标题 | 必填；1-30 字；禁止纯空格 |
| 标题显示状态 | 必填；只能为“显示”或“隐藏” |
| 标题字号 | 必填；建议从字号枚举选择，例如“12号”、“14号”、“16号”、“18号” |
| 标题状态 | 必填；建议枚举“正常”、“加粗”、“禁用” |
| 字段1 | 必填；1-20 字；字段名称不可与其他字段重复 |
| 字段2 | 必填；1-20 字；字段名称不可与其他字段重复 |
| 字段3 | 必填；1-20 字；字段名称不可与其他字段重复 |
| 字段4 | 必填；1-20 字；字段名称不可与其他字段重复 |
| 字段5 | 必填；1-20 字；字段名称不可与其他字段重复 |
| 字段6 | 必填；1-20 字；字段名称不可与其他字段重复 |
| 排版 | 必填；只能从排版枚举选择，默认“单排” |
| 字号 | 必填；只能从字号枚举选择，默认“16号” |
| 状态 | 必填；只能从状态枚举选择，默认“正常” |
| 二维码 | 必填；格式建议为 `数字mm×数字mm`，如“50mm×50mm” |
| 显示状态 | 必填；只能为“显示”或“隐藏” |
| 上边距 | 必填；格式建议为 `数字mm`；数值范围 0-100 |
| 下边距 | 必填；格式建议为 `数字mm`；数值范围 0-100 |
| 左边距 | 必填；格式建议为 `数字mm`；数值范围 0-100 |
| 右边距 | 必填；格式建议为 `数字mm`；数值范围 0-100 |

### 3.3 操作逻辑

`模板`切换：

1. `templateLoading = true`。
2. 根据选中的“模板”查询模板详情。
3. 回填 `templateForm` 与 `fieldConfigList`。
4. 调用 `refreshPreview`。
5. `templateLoading = false`。

`新增`：

1. 弹出新增模板名称输入框。
2. 校验名称必填且不重复。
3. 创建模板，默认复制当前模板配置或使用系统默认配置。
4. 新模板加入 `templateOptions` 并自动选中。
5. 刷新预览。

`字段1` 至 `字段6` 修改：

1. 实时更新 `fieldConfigList`。
2. 触发表单校验，检查名称为空、超长、重复。
3. 校验通过后节流刷新“预览区域图片”。

`排版`、`字号`、`状态` 修改：

1. 更新对应字段配置。
2. 刷新预览。
3. 若状态为隐藏或禁用，预览区应同步弱化或隐藏对应字段。

`二维码` 和 `显示状态` 修改：

1. 校验二维码尺寸格式。
2. 若“显示状态”为“隐藏”，预览区不展示二维码。
3. 若为“显示”，按“二维码”尺寸渲染二维码占位。

`上边距`、`下边距`、`左边距`、`右边距` 修改：

1. 校验 `数字mm` 格式。
2. 更新预览卡片内边距。
3. 预览区同步显示最新排版。

`保存模板`（UI 未直接给出，按 B 端模板配置闭环补全）：

1. 校验整个 `templateForm`。
2. `saveTemplateLoading = true`。
3. 组装模板配置，包括标题、字段、二维码、边距。
4. 调用保存模板 API。
5. 成功后提示“保存成功”。
6. `saveTemplateLoading = false`。

## 4. 添加/打印页逻辑

### 4.1 数据结构定义

`formData`：

| 字段名 | 来源字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| 选择模板 | 选择模板 | String | "模板1" | 当前标签使用模板 |
| 备注 | 备注 | String | "" | 打印记录备注 |
| 材料编码 | 材料编码 | String | "" | 标签字段 |
| 生成单位 | 生成单位 | String | "" | UI 原字段为“生成单位”，用于标签字段输入 |
| 库房 | 库房 | String | "" | 标签字段 |
| 入库人 | 入库人 | String | "" | 标签字段 |
| 容器号 | 容器号 | String | "" | 标签字段 |
| 入库时间 | 入库时间 | String | "" | 标签字段 |
| 二维码 | 二维码 | String | "" | 二维码图片或编码内容 |

必要状态变量：

| 变量名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| formLoading | Boolean | false | 详情或编辑回显 loading |
| saveLoading | Boolean | false | 保存 loading |
| printLoading | Boolean | false | 打印 loading |
| qrCodeLoading | Boolean | false | 二维码生成 loading |
| templateOptions | Array | [] | “选择模板”下拉选项 |
| qrCodeUrl | String | "" | “二维码”图片地址 |
| mode | String | "add" | 页面模式：add/detail/edit |

### 4.2 表单校验规则

| 字段名 | 校验规则 |
| --- | --- |
| 选择模板 | 必填；必须从模板列表选择 |
| 备注 | 非必填；长度 0-200；禁止纯空格 |
| 材料编码 | 必填；1-50 字；建议允许英文、数字、短横线、下划线 |
| 生成单位 | 必填；1-100 字 |
| 库房 | 必填；1-50 字 |
| 入库人 | 必填；1-30 字 |
| 容器号 | 必填；1-50 字；建议允许英文、数字、短横线、下划线 |
| 入库时间 | 必填；建议改为日期时间选择；若保持输入框，需校验合法日期时间 |
| 二维码 | 保存和打印前必须生成成功 |

### 4.3 操作逻辑

`选择模板`：

1. 查询模板详情。
2. 按模板配置动态显示字段、字号、二维码尺寸和边距。
3. 清空旧的“二维码”。
4. 重新生成预览。

`材料编码`、`生成单位`、`库房`、`入库人`、`容器号`、`入库时间`输入：

1. 写入 `formData`。
2. 根据模板配置更新卡片预览。
3. 字段满足二维码生成条件时，节流调用二维码生成逻辑。

`保存`：

1. 校验 `formData`。
2. 确认“二维码”已生成。
3. `saveLoading = true`。
4. 调用保存 API，保存打印记录和字段快照。
5. 成功后提示“保存成功”，刷新列表。
6. `saveLoading = false`。

`打印`：

1. 校验 `formData`。
2. 若当前记录未保存，先提示用户保存或自动保存。
3. `printLoading = true`。
4. 调用打印 API 或本地打印服务，传入模板配置、字段值和二维码。
5. 打印成功后记录“打印时间”和“标签数量”。
6. 成功后提示“打印成功”，刷新列表。
7. `printLoading = false`。

`详情`：

1. `formLoading = true`。
2. 根据行记录查询详情。
3. 回填“选择模板”、“备注”、“材料编码”、“生成单位”、“库房”、“入库人”、“容器号”、“入库时间”、“二维码”。
4. 设置所有表单项只读，仅保留关闭按钮。
5. `formLoading = false`。

`编辑`：

1. 查询详情并回填。
2. 允许修改除系统生成字段外的所有表单项。
3. 保存后刷新列表。

## 5. 数据字典

### 5.1 模板状态字典

| 字段 | 可选值 | 说明 |
| --- | --- | --- |
| 标题显示状态 | 显示、隐藏 | 控制标题是否渲染 |
| 标题状态 | 正常、加粗、禁用 | 控制标题样式或状态 |
| 排版 | 单排、双排 | 控制字段布局 |
| 字号 | 12号、14号、16号、18号 | 控制文字字号 |
| 状态 | 正常、隐藏、禁用 | 控制字段展示状态 |
| 显示状态 | 显示、隐藏 | 控制二维码是否展示 |

### 5.2 页面字段字典

| 页面 | 字段/列名 | 组件 | 数据用途 |
| --- | --- | --- | --- |
| list.png | el-date-picker | el-date-picker | 按日期范围筛选打印记录 |
| list.png | 查询 | el-button | 执行查询 |
| list.png | 重置 | el-button | 清空条件 |
| list.png | 导入 | el-button | 批量导入打印数据 |
| list.png | 添加 | el-button | 手动新增打印数据 |
| list.png | 编辑模版 | el-button | 进入模板配置 |
| list.png | 打印时间 | el-table-column | 展示打印时间 |
| list.png | 标签数量 | el-table-column | 展示标签数量 |
| list.png | 备注 | el-table-column | 展示备注 |
| list.png | 操作 | el-table-column | 展示详情、编辑、删除 |
| template.png | 模板1 | el-select | 当前模板选择默认值 |
| template.png | 新增 | el-button | 新增模板 |
| template.png | 标题 | el-input | 配置卡片标题 |
| template.png | 字段1 | el-input | 配置字段名称 |
| template.png | 字段2 | el-input | 配置字段名称 |
| template.png | 字段3 | el-input | 配置字段名称 |
| template.png | 字段4 | el-input | 配置字段名称 |
| template.png | 字段5 | el-input | 配置字段名称 |
| template.png | 字段6 | el-input | 配置字段名称 |
| template.png | 排版 | el-select | 配置字段排版 |
| template.png | 字号 | el-select | 配置字段字号 |
| template.png | 状态 | el-select | 配置字段状态 |
| template.png | 二维码 | el-input | 配置二维码尺寸 |
| template.png | 显示状态 | el-select | 配置二维码显示 |
| template.png | 上边距 | el-input | 配置上边距 |
| template.png | 下边距 | el-input | 配置下边距 |
| template.png | 左边距 | el-input | 配置左边距 |
| template.png | 右边距 | el-input | 配置右边距 |
| template.png | 预览区域图片 | el-image | 展示模板预览 |
| add.png | 选择模板 | el-select | 选择打印模板 |
| add.png | 备注 | el-input | 输入打印备注 |
| add.png | 材料编码 | el-input | 输入标签字段 |
| add.png | 生成单位 | el-input | 输入标签字段 |
| add.png | 库房 | el-input | 输入标签字段 |
| add.png | 入库人 | el-input | 输入标签字段 |
| add.png | 容器号 | el-input | 输入标签字段 |
| add.png | 入库时间 | el-input | 输入标签字段 |
| add.png | 二维码 | el-image | 展示二维码 |
| add.png | 保存 | el-button | 保存打印记录 |
| add.png | 打印 | el-button | 执行打印 |
