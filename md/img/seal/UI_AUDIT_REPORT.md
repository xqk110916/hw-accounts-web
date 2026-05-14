# 封记管理 UI 审计报告 (md/img/seal)

本文档基于 `md/img/seal` 目录下的 `list.png` 与 `add.png` 截图，提取了高保真技术元数据，作为后续 Vue 2 + Element UI 开发的事实来源。

## 第一部分：字段清单 (JSON)

```json
{
  "pages": [
    {
      "page_name": "list.png (封记管理列表页)",
      "fields": [
        {
          "label": "封记编码",
          "component": "el-input",
          "attributes": {
            "placeholder": "请输入",
            "default_value": "",
            "options": [],
            "position": "搜索区 - 第一行第一项",
            "notes": ""
          }
        },
        {
          "label": "封记类型",
          "component": "el-select",
          "attributes": {
            "placeholder": "请选择",
            "default_value": "",
            "options": [],
            "position": "搜索区 - 第一行第二项",
            "notes": ""
          }
        },
        {
          "label": "封记状态",
          "component": "el-radio-group",
          "attributes": {
            "placeholder": "",
            "default_value": "全部",
            "options": ["全部", "完好", "破损"],
            "position": "搜索区 - 第一行第三项",
            "notes": "单选按钮形态"
          }
        },
        {
          "label": "登记时间",
          "component": "el-date-picker",
          "attributes": {
            "placeholder": "开始日期 - 结束日期",
            "default_value": "",
            "options": [],
            "position": "搜索区 - 第二行第一项",
            "notes": "范围选择器"
          }
        },
        {
          "label": "容器",
          "component": "el-select",
          "attributes": {
            "placeholder": "请选择",
            "default_value": "",
            "options": [],
            "position": "搜索区 - 第二行第二项",
            "notes": ""
          }
        },
        {
          "label": "查询",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "搜索区 - 右侧上方",
            "notes": "primary 类型"
          }
        },
        {
          "label": "重置",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "搜索区 - 右侧上方",
            "notes": "plain 类型"
          }
        },
        {
          "label": "新增",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "操作区 - 右侧",
            "notes": "primary 类型"
          }
        },
        {
          "label": "导入",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "操作区 - 右侧",
            "notes": "plain 类型"
          }
        },
        {
          "label": "删除",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "操作区 - 右侧",
            "notes": "plain 类型"
          }
        },
        {
          "label": "容器",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "编号+名称+位置",
            "options": [],
            "position": "表格区 - 第1列",
            "notes": "第0列为 selection 复选框"
          }
        },
        {
          "label": "封记1",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "编码【类型】",
            "options": [],
            "position": "表格区 - 第2列",
            "notes": ""
          }
        },
        {
          "label": "封记2",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "编码【类型】",
            "options": [],
            "position": "表格区 - 第3列",
            "notes": ""
          }
        },
        {
          "label": "登记时间",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "2020-10-10 10:00:00",
            "options": [],
            "position": "表格区 - 第4列",
            "notes": ""
          }
        },
        {
          "label": "状态",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "XXXXXXXX",
            "options": [],
            "position": "表格区 - 第5列",
            "notes": ""
          }
        },
        {
          "label": "操作",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "详情 编辑 删除",
            "options": [],
            "position": "表格区 - 第6列",
            "notes": "文字链接按钮 (el-button type=\"text\")"
          }
        },
        {
          "label": "共 400 条",
          "component": "el-pagination",
          "attributes": {
            "placeholder": "",
            "default_value": "400",
            "options": [],
            "position": "分页区 - 左侧",
            "notes": "total 文本"
          }
        },
        {
          "label": "20 条/页",
          "component": "el-pagination",
          "attributes": {
            "placeholder": "",
            "default_value": "20",
            "options": ["20 条/页"],
            "position": "分页区 - 右侧",
            "notes": "sizes 选择器"
          }
        },
        {
          "label": "前往 3 页",
          "component": "el-pagination",
          "attributes": {
            "placeholder": "",
            "default_value": "3",
            "options": [],
            "position": "分页区 - 右侧",
            "notes": "jumper 控件"
          }
        }
      ]
    },
    {
      "page_name": "add.png (新增/编辑封记表单)",
      "fields": [
        {
          "label": "封记1",
          "component": "div (layout)",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "第一行",
            "notes": "包含一个 el-input (请输入) 和一个 el-select (请选择)，横向排列"
          }
        },
        {
          "label": "封记2",
          "component": "div (layout)",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "第二行",
            "notes": "包含一个 el-input (请输入) 和一个 el-select (请选择)，横向排列"
          }
        },
        {
          "label": "登记时间",
          "component": "el-date-picker",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "第三行",
            "notes": "日期选择器，占位符为空"
          }
        },
        {
          "label": "封记状态",
          "component": "el-radio-group",
          "attributes": {
            "placeholder": "",
            "default_value": "完好",
            "options": ["完好", "破损"],
            "position": "第四行",
            "notes": "单选按钮形态"
          }
        },
        {
          "label": "容器",
          "component": "el-select",
          "attributes": {
            "placeholder": "请选择",
            "default_value": "",
            "options": [],
            "position": "第五行",
            "notes": ""
          }
        },
        {
          "label": "保存",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "底部操作区 - 左侧",
            "notes": "primary 类型"
          }
        },
        {
          "label": "取消",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "底部操作区 - 右侧",
            "notes": "plain 类型"
          }
        }
      ]
    }
  ]
}
```

## 第二部分：页面布局描述

### 封记管理列表页 (list.png)

#### 1. 页面整体结构
- 页面采用典型的后台管理系统列表布局，从上到下依次为：搜索筛选区、操作按钮区、数据表格区、分页控件区。
- 结构符合 `wrapper / content / right / search / operation / table / pagination` 的系统规范。

#### 2. 区块拆解
- **搜索区**：
  - 位于页面顶部。
  - 包含两行表单项：
    - 第一行：封记编码（输入框）、封记类型（下拉框）、封记状态（单选组）。
    - 第二行：登记时间（日期范围）、容器（下拉框）。
  - 右侧对齐放置“查询”和“重置”按钮。
- **操作区**：
  - 位于搜索区下方，表格区上方。
  - 按钮组整体靠左对齐。
  - 包含三个按钮：新增（蓝色高亮）、导入、删除。
- **表格区**：
  - 占据页面主体中心。
  - 表头背景为淡蓝色/灰色。
  - 包含 7 列：复选框列、容器、封记1、封记2、登记时间、状态、操作。
  - 操作列固定在最右侧，包含“详情”、“编辑”、“删除”三个蓝色文字链接。
- **分页区**：
  - 位于页面最底部，整体靠右对齐。
  - 包含总条数文案（左侧）、页码导航（中间）、每页条数切换和跳转页码输入框（右侧）。

#### 3. 可见文本汇总
- 封记编码、请输入、封记类型、请选择、封记状态、全部、完好、破损、查询、重置
- 登记时间、开始日期 - 结束日期、容器、新增、导入、删除
- 封记1、封记2、状态、操作、详情、编辑、删除
- 编号+名称+位置、编码【类型】、2020-10-10 10:00:00、XXXXXXXX
- 共 400 条、1、2、3、4、5、...、6、20 条/页、前往、页

---

### 新增/编辑封记表单 (add.png)

#### 1. 页面整体结构
- 看起来是一个独立的表单区块，可能用于弹窗 (Dialog) 内容。
- 布局紧凑，垂直排列 5 行表单项，底部放置操作按钮。

#### 2. 区块拆解
- **表单区**：
  - **封记1/封记2**：每行由一个 Label 和两个控件组成（一个短输入框 + 一个下拉选择框），横向组合布局。
  - **登记时间**：标准行，包含 Label 和一个带图标的日期选择控件。
  - **封记状态**：标准行，包含 Label 和两个单选按钮（完好、破损）。
  - **容器**：标准行，包含 Label 和一个占满行宽的下拉选择框。
- **底部操作区**：
  - 位于表单正下方。
  - 两个按钮居中排列：保存（蓝色高亮）、取消（描边样式）。

#### 3. 可见文本汇总
- 封记1、请输入、请选择
- 封记2、登记时间、封记状态、完好、破损、容器
- 保存、取消
