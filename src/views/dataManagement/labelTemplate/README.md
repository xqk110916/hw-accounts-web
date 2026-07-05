# 标签模板管理

标签模板管理用于维护标签打印记录、配置材料管理卡模板，并通过 `public/js/ZPL_JSSdk0.0.0.3.js` 对接本机 JSSDK 打印服务。

## 文件结构

```
src/views/dataManagement/labelTemplate/
├── index.vue                          # 主页面：打印记录列表
├── README.md
├── components/
│   ├── api.js                         # 接口定义（标签数据 + 模板 CRUD）
│   ├── storage.js                     # 数据转换层：前后端结构映射、默认配置
│   ├── print-builder.js              # ZPL 打印指令构建
│   ├── LabelTemplatePreview.vue      # 模板预览/编辑组件（三种模式）
│   ├── TemplateManageDialog.vue      # 模板管理列表弹窗
│   ├── TemplateDialog.vue            # 单个模板配置弹窗（新增/编辑）
│   ├── PrintRecordDialog.vue         # 打印记录新增/编辑/详情弹窗
│   ├── PrintImportDialog.vue         # 标签数据导入弹窗
│   └── index.js
```

## 主页面（index.vue）

打印记录列表页面，提供以下功能：

- **筛选区**：按打印时间范围、模板筛选记录
- **操作区**：导入、添加、模板管理三个按钮
- **表格列**：容器号、库房、材料代码、模板名称、创建时间、备注、操作（详情/编辑/删除）；创建时间只展示日期部分，格式为 `yyyy-MM-dd`
- **分页**：支持切换每页条数和页码
- 页面加载时自动拉取模板选项供筛选使用；模板管理变更后同步刷新筛选选项和已打开的打印记录弹窗

## 打印记录管理（PrintRecordDialog.vue）

打印记录的新增、编辑、详情弹窗。

### 表单结构

- **模板选择**：下拉选择已有模板，切换模板后自动加载模板配置并重置字段
- **备注**：自由文本
- **标签卡片**：基于 `LabelTemplatePreview` 组件以 `edit` 模式渲染，展示当前模板的所有字段

### 字段交互

部分字段使用下拉选择而非文本输入，由 `selectFieldKeys` 控制：

- `materialCode`（材料代码）：从入库接口拉取物料列表
- `warehouse`（库房）：从库房层级接口拉取，选择后联动加载位置选项
- `position`（位置）：依赖库房选择，基于库房 ID 拉取位置映射
- `sealType1`、`sealType2`（封记类型）：从封记类型工具函数获取选项

日期字段由 `dateFieldKeys` 控制，使用 `el-date-picker` 组件：

- `inboundTime`（入库时间）：日期选择器，格式 `yyyy-MM-dd`

列表、模板管理弹窗和标签预览中展示日期时统一经过 `formatDisplayDateValue()` 处理，字符串日期会截取为 `yyyy-MM-dd`。

选择控件通过 `selectBindValues` 存储选中值的 ID，通过 `formData` 存储显示文本（label），两者分开管理。

### 数据流

1. **新增**：`resetForm()` → 加载模板选项 → 加载下拉选项 → `loadCurrentTemplate()`
2. **编辑/详情**：调用 `getLabelDataDetail` → `labelDataToRow()` 转换 → `fillRow()` 填充表单 → 加载模板和下拉选项 → 恢复选择绑定值
3. **保存**：校验表单 → 校验标签字段非空 → `buildLabelDataPayload()` 构建请求体 → 调用 add/update 接口
4. **打印**：校验 → 获取打印机配置 → 连接打印服务 → `buildLabelPrintData()` 生成 ZPL 指令 → 发送打印 → 保存记录

## 模板管理

### 模板列表（TemplateManageDialog.vue）

模板管理弹窗，内嵌模板列表和 `TemplateDialog`：

- 按模板名称搜索，分页展示
- 支持新增、编辑、删除模板
- 删除时自动修正当前页码
- 变更后通过 `saved` 事件通知主页面刷新模板选项

### 模板配置（TemplateDialog.vue）

单个模板的新增/编辑弹窗，左右分栏布局。

**左侧配置区**：

| 配置项 | 说明 |
|--------|------|
| 模板名称 | 必填，自由文本 |
| 标题设置 | 标题文本 + 显示/隐藏 + 字号 + 状态（正常/加粗/禁用） |
| 字段设置 | 可动态增删排序的字段列表 |
| 二维码 | 宽×高（mm） + 显示/隐藏 |
| 边距设置 | 上/下/左/右（mm） |

**右侧预览区**：基于 `LabelTemplatePreview` 的 `design` 模式实时展示模板效果。

#### 字段设置规则

- **字段列表**：每行包含上移/下移、字段标签、字段选择下拉、布局（单排/双排）、字号、状态（正常/隐藏/禁用）、新增/删除按钮
- **字段去重**：字段选择下拉框中已被其他行选中的字段自动置灰（disabled），同一字段不允许重复选择
- **字段选项**：定义在 `fieldOptions` 数组中，每个选项包含 `label`（显示名）、`value`（字段名）、`fileValue`（后端字段 key），可选字段包括：材料代码、容器号、生产单位、库房、位置、货箱号、封记编码1/2、封记类型1/2、重量（毛重/皮重/净重）
- **固定字段**：`containerNo`（容器号）和 `warehouse`（库房）为固定字段，不可删除
- **字段标签**：按序号自动生成（字段1、字段2……），增删后自动重新编号

#### 校验规则

保存时校验：模板名称非空、标题非空、字段名称非空、字段名称不重复、边距格式为数字 mm 且不超过 100mm、二维码格式为数字 mm × 数字 mm

## 预览组件（LabelTemplatePreview.vue）

支持三种模式的标签卡片渲染组件：

| 模式 | 用途 | 行为 |
|------|------|------|
| `design` | 模板配置弹窗右侧预览 | 仅展示字段名标签，不渲染输入控件 |
| `edit` | 打印记录新增/编辑 | 为每个字段渲染输入框或下拉选择 |
| `preview` | 打印记录详情 | 只读展示字段值 |

### 布局结构

- 外层：应用边距样式的白色卡片容器
- 标题栏：居中展示标题文本，支持字号和加粗/禁用样式
- 内容区：左右分栏（grid 布局）
  - 左侧：字段列表，每个字段包含标签列和值列；`double` 布局时标签列占 50%，默认占 30%
  - 右侧：二维码区域 + 插槽（`qrcode` slot 用于自定义二维码内容）

### 过滤逻辑

- `visibleFields`：过滤掉 `status` 为 `hidden` 或 `隐藏` 的字段
- `status` 为 `disabled` 或 `禁用` 的字段保留展示但降低透明度

## 数据转换层（storage.js）

负责前端模板结构与后端接口格式之间的双向转换，不作为数据源。

### 默认字段

```
containerNo（容器号）、warehouse（库房）、materialCode（材料代码）、
productionUnit（生产单位）、inboundTime（入库时间）
```

### 核心转换函数

| 函数 | 方向 | 说明 |
|------|------|------|
| `backendToTemplate` | 后端 → 前端 | 将接口返回的模板数据转换为前端模板结构 |
| `templateToBackend` | 前端 → 后端 | 将前端模板结构转换为接口请求体 |
| `templateToForm` | 模板 → 表单 | 提取模板的表单相关字段（标题、二维码、边距等） |
| `formToTemplate` | 表单 → 模板 | 将表单数据 + 字段列表合并为模板结构 |
| `templateToFields` | 模板 → 字段列表 | 提取字段配置供 TemplateDialog 使用 |
| `labelDataToRow` | 后端 → 表单行 | 将标签数据接口返回转换为表单可用的行数据 |
| `buildLabelDataPayload` | 表单 → 请求体 | 构建标签数据保存/更新的请求体 |

### 枚举转换

- 布尔值：`visible/normal/bold/显示/正常/加粗` ↔ `true`；其他 ↔ `false`
- 布局：`single/单排` ↔ `single`；`double/双排` ↔ `double`
- 字段状态：`normal/hidden/disabled` ↔ `正常/隐藏/禁用`
- 标题状态：`normal/bold/disabled`，其中 `bold` 对应后端 `titleBold: 'true'`
- 字号：`数字号` 格式，如 `16号`
- 尺寸：`数字mm` 格式，如 `50mm`

### 打印配置

默认打印机配置由 `defaultPrinterConfig` 定义，运行时与 `window.globalConfig.ZPL_PRINTER_CONFIG` 合并。支持 USB、NET、COM 三种连接方式。

## 打印指令构建（print-builder.js）

基于 ZPL JSSDK 构建打印指令数据：

- 根据模板边距计算打印区域边界
- 绘制外框、标题分割线、字段分隔线、二维码区域分割线
- 按模板配置渲染标题文本、字段标签和值、二维码、条形码（材料代码）
- 字段仅渲染 `status` 为 `normal` 的字段
- 二维码内容：打印时如后端未返回二维码，前端基于模板名称 + 表单字段临时生成 JSON 内容
- 条形码：当 `materialCode` 非空时在右下区域生成 Code128 条形码

## 数据导入（PrintImportDialog.vue）

- 选择模板 + 上传 Excel 文件（.xls/.xlsx）
- 支持下载导入模板（调用 `exportLabelDataTemplate` 接口）
- 导入时调用 `importLabelData` 接口，传递文件、模板 ID 和备注

## 接口清单（api.js）

### 标签数据

| 接口 | 方法 | 路径 |
|------|------|------|
| 列表查询 | GET | `/busin/label/data/list` |
| 详情 | GET | `/busin/label/data/detail/:id` |
| 新增 | POST | `/busin/label/data/add` |
| 更新 | PUT | `/busin/label/data/update` |
| 删除 | DELETE | `/busin/label/data/delete/:id` |
| 导入 | POST | `/busin/label/data/import` |
| 刷新二维码 | POST | `/busin/label/data/refreshQrcode/:id` |
| 导出模板 | GET | `/busin/label/template/export` |

### 标签模板

| 接口 | 方法 | 路径 |
|------|------|------|
| 全量列表 | GET | `/busin/label/template/listAll` |
| 分页列表 | GET | `/busin/label/template/list` |
| 详情 | GET | `/busin/label/template/detail/:id` |
| 新增 | POST | `/busin/label/template/add` |
| 更新 | PUT | `/busin/label/template/update` |
| 删除 | DELETE | `/busin/label/template/delete/:id` |

## 二维码

- **生成时机**：二维码由后端在保存标签数据时自动生成，前端不发送 `qrcodeBase64` 字段
- **显示逻辑**：新增记录时显示"保存后生成"占位符；编辑/查看时显示后端返回的 Base64 二维码图片
- **打印处理**：打印时如后端未返回二维码，前端基于当前表单数据临时生成 JSON 内容用于 ZPL 打印指令
