【字段清单 JSON】

```json
{
  "pages": [
    {
      "page_name": "list.png",
      "fields": [
        {
          "label": "添加时间:",
          "component": "el-date-picker",
          "attributes": {
            "placeholder": "开始日期 — 结束日期",
            "default_value": "",
            "options": [],
            "position": "搜索区第 1 行左侧",
            "notes": "日期范围输入框右侧可见日历图标"
          }
        },
        {
          "label": "状态",
          "component": "el-checkbox-group",
          "attributes": {
            "placeholder": "",
            "default_value": "全部",
            "options": ["全部", "待提交", "待审核", "审核通过", "审核拒绝"],
            "position": "搜索区第 1 行中部",
            "notes": "全部复选框为选中状态，其余复选框为空"
          }
        },
        {
          "label": "查询",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "搜索区右侧第 1 行",
            "notes": "蓝色实心按钮"
          }
        },
        {
          "label": "重置",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "搜索区右侧第 1 行",
            "notes": "白底蓝色描边按钮"
          }
        },
        {
          "label": "添加",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "操作区右侧第 2 行",
            "notes": "蓝色实心按钮"
          }
        },
        {
          "label": "",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格区最左列",
            "notes": "表头与各行均为未选中的多选框"
          }
        },
        {
          "label": "数据类型",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 2 列",
            "notes": "可见单元格文本为“材料信息”"
          }
        },
        {
          "label": "导入时间",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 3 列",
            "notes": "可见单元格文本为“2025-10-10 09:00:00”"
          }
        },
        {
          "label": "导入人",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 4 列",
            "notes": "可见单元格文本为“张三”"
          }
        },
        {
          "label": "审批时间",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 5 列",
            "notes": "部分行为空，部分行可见“2025-10-11 09:00:00”"
          }
        },
        {
          "label": "审批人",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 6 列",
            "notes": "可见单元格文本为“李四”"
          }
        },
        {
          "label": "据条数",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 7 列",
            "notes": "可见单元格文本为“100100”"
          }
        },
        {
          "label": "状态",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": ["待审核", "审核通过", "审核拒绝", "待提交"],
            "position": "表格表头第 8 列",
            "notes": "列内可见状态文案"
          }
        },
        {
          "label": "操作",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": ["详情", "审核", "编辑", "删除", "提交"],
            "position": "表格表头第 9 列",
            "notes": "操作列内为蓝色文字操作项"
          }
        },
        {
          "label": "详情",
          "component": "el-link / el-button(type=\"text\")",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格操作列",
            "notes": "蓝色文字操作项"
          }
        },
        {
          "label": "审核",
          "component": "el-link / el-button(type=\"text\")",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格操作列第 1 行",
            "notes": "蓝色文字操作项"
          }
        },
        {
          "label": "编辑",
          "component": "el-link / el-button(type=\"text\")",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格操作列",
            "notes": "蓝色文字操作项"
          }
        },
        {
          "label": "删除",
          "component": "el-link / el-button(type=\"text\")",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格操作列",
            "notes": "蓝色文字操作项"
          }
        },
        {
          "label": "提交",
          "component": "el-link / el-button(type=\"text\")",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格操作列",
            "notes": "蓝色文字操作项"
          }
        },
        {
          "label": "共 400 条",
          "component": "el-pagination",
          "attributes": {
            "placeholder": "",
            "default_value": "1",
            "options": ["1", "2", "3", "4", "5", "…", "6", "20 条/页", "前往", "3", "页"],
            "position": "分页区底部右侧",
            "notes": "当前页码 1 为蓝色选中；可见左翻页、右翻页按钮"
          }
        }
      ]
    },
    {
      "page_name": "add.png",
      "fields": [
        {
          "label": "类型",
          "component": "el-select",
          "attributes": {
            "placeholder": "",
            "default_value": "封记台账",
            "options": [],
            "position": "上传表单区第 1 行左侧",
            "notes": "选择框右侧可见下拉箭头"
          }
        },
        {
          "label": "下载模板",
          "component": "el-link / el-button(type=\"text\")",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "上传表单区第 1 行右侧",
            "notes": "蓝色文字链接"
          }
        },
        {
          "label": "选择文件",
          "component": "el-upload",
          "attributes": {
            "placeholder": "未选择任何文件",
            "default_value": "",
            "options": [],
            "position": "上传表单区第 2 行左侧",
            "notes": "左侧为标签“选择文件”，上传控件按钮文字同为“选择文件”"
          }
        },
        {
          "label": "导入",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "上传表单区第 3 行右侧",
            "notes": "蓝色实心按钮"
          }
        },
        {
          "label": "导入内容",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "导入结果区标题左侧",
            "notes": "加粗大号文本"
          }
        },
        {
          "label": "成功xxxx条，失败xxx条",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "导入结果区标题右侧",
            "notes": "普通文本"
          }
        },
        {
          "label": "导出问题",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "导入结果区右侧",
            "notes": "白底蓝色描边按钮"
          }
        },
        {
          "label": "重新导入",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "导入结果区右侧",
            "notes": "白底蓝色描边按钮"
          }
        },
        {
          "label": "行号",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 1 列",
            "notes": "可见行号为 1、2、3"
          }
        },
        {
          "label": "字段1",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 2 列",
            "notes": "可见单元格文本为“xxxxx”"
          }
        },
        {
          "label": "字段2",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 3 列",
            "notes": "可见单元格文本为“xxxxx”"
          }
        },
        {
          "label": "字段3",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 4 列",
            "notes": "可见单元格文本为“xxxxx”"
          }
        },
        {
          "label": "字段4",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 5 列",
            "notes": "可见单元格文本为“xxxxx”"
          }
        },
        {
          "label": "问题",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 6 列",
            "notes": "第 1 行可见单元格文本为“xxxxxx”"
          }
        },
        {
          "label": "备注",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "备注区标题",
            "notes": "位于文本域上方"
          }
        },
        {
          "label": "",
          "component": "el-input",
          "attributes": {
            "placeholder": "请输入",
            "default_value": "",
            "options": [],
            "position": "备注区多行文本框",
            "notes": "textarea 形态"
          }
        },
        {
          "label": "提交审核",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "底部操作区右侧",
            "notes": "蓝色实心按钮"
          }
        }
      ]
    },
    {
      "page_name": "approve.png",
      "fields": [
        {
          "label": "XXXX",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "顶部标题区居中",
            "notes": "普通文本"
          }
        },
        {
          "label": "导入内容",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "详情展示区左上",
            "notes": "加粗大号文本"
          }
        },
        {
          "label": "行号",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 1 列",
            "notes": "可见行号为 1、2、3"
          }
        },
        {
          "label": "字段1",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 2 列",
            "notes": "可见单元格文本为“xxxxx”"
          }
        },
        {
          "label": "字段2",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 3 列",
            "notes": "可见单元格文本为“xxxxx”"
          }
        },
        {
          "label": "字段3",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 4 列",
            "notes": "可见单元格文本为“xxxxx”"
          }
        },
        {
          "label": "字段4",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 5 列",
            "notes": "可见单元格文本为“xxxxx”"
          }
        },
        {
          "label": "问题",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 6 列",
            "notes": "第 1 行可见单元格文本为“xxxxxx”"
          }
        },
        {
          "label": "备注",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "备注展示区左侧",
            "notes": "下方为空白区域，未见输入框边框"
          }
        },
        {
          "label": "通过",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "底部操作区右侧",
            "notes": "蓝色实心按钮"
          }
        },
        {
          "label": "拒绝",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "底部操作区右侧",
            "notes": "白底蓝色描边按钮"
          }
        }
      ]
    }
  ]
}
```

【页面布局 Markdown 描述】

## list.png

### 1. 页面整体结构
- 页面为列表页视觉结构，从上到下依次为搜索区、操作区、表格区、分页区。
- 未见左侧树，主体为单列内容区。
- 视觉上符合列表页的 `wrapper / content / right / search / operation / table / pagination` 典型区块顺序：顶部为筛选与按钮区，中部为表格，底部为分页。

### 2. 区块拆解
- 搜索区：
  第 1 行左侧横向排列“添加时间:”日期范围选择器、“状态”复选框组。日期框内显示占位符“开始日期 — 结束日期”。状态选项依次为“全部”“待提交”“待审核”“审核通过”“审核拒绝”，其中“全部”为选中状态。
- 操作区：
  页面右上区域纵向分两行。第 1 行靠右显示“查询”“重置”两个按钮；第 2 行在其下方显示“添加”按钮。
- 表格区：
  位于搜索与操作区下方。表格左侧有多选框列，表头从左到右依次为“数据类型”“导入时间”“导入人”“审批时间”“审批人”“据条数”“状态”“操作”。表格可见 4 行数据，后续区域显示空白斑马纹行。
- 分页区：
  位于页面底部右侧。可见“共 400 条”、左翻页按钮、页码“1”“2”“3”“4”“5”“…”“6”、右翻页按钮、“20 条/页”、“前往”、页码输入框“3”、“页”。

### 3. 可见文本汇总
- 添加时间:
- 开始日期 — 结束日期
- 状态
- 全部
- 待提交
- 待审核
- 审核通过
- 审核拒绝
- 查询
- 重置
- 添加
- 数据类型
- 导入时间
- 导入人
- 审批时间
- 审批人
- 据条数
- 操作
- 材料信息
- 2025-10-10 09:00:00
- 张三
- 2025-10-11 09:00:00
- 李四
- 100100
- 详情
- 审核
- 编辑
- 删除
- 提交
- 共 400 条
- 1
- 2
- 3
- 4
- 5
- …
- 6
- 20 条/页
- 前往
- 页

## add.png

### 1. 页面整体结构
- 页面为新增/导入页视觉结构，从上到下依次为上传表单区、导入结果区、表格区、备注区、底部操作区。
- 页面内容整体居于白色画布内，右侧按钮多为右对齐。

### 2. 区块拆解
- 上传表单区：
  第 1 行横向排列“类型”下拉框与“下载模板”文字链接，下拉框默认显示“封记台账”。第 2 行显示“选择文件”标签、上传按钮“选择文件”和文本“未选择任何文件”。第 3 行右侧显示“导入”按钮。
- 导入结果区：
  左侧显示大号加粗“导入内容”，其右侧显示“成功xxxx条，失败xxx条”。同一行右侧显示“导出问题”“重新导入”两个描边按钮。
- 表格区：
  表格位于导入结果区下方，表头依次为“行号”“字段1”“字段2”“字段3”“字段4”“问题”。可见 3 行数据，行号为“1”“2”“3”，单元格内可见“xxxxx”和“xxxxxx”。
- 备注区：
  表格下方显示“备注”标签，下方为大尺寸多行输入框，输入框占位符为“请输入”。
- 底部操作区：
  页面底部右侧显示一个蓝色按钮“提交审核”。

### 3. 可见文本汇总
- 类型
- 封记台账
- 下载模板
- 选择文件
- 未选择任何文件
- 导入
- 导入内容
- 成功xxxx条，失败xxx条
- 导出问题
- 重新导入
- 行号
- 字段1
- 字段2
- 字段3
- 字段4
- 问题
- 1
- 2
- 3
- xxxxx
- xxxxxx
- 备注
- 请输入
- 提交审核

## approve.png

### 1. 页面整体结构
- 页面为审批页视觉结构，从上到下依次为顶部标题区、详情展示区、表格区、备注展示区、底部操作区。
- 页面上方居中显示标题文本，内容区左侧对齐，底部按钮靠右对齐。

### 2. 区块拆解
- 顶部标题区：
  页面顶部居中显示文本“XXXX”。
- 详情展示区：
  左侧显示大号加粗“导入内容”。
- 表格区：
  表格位于“导入内容”下方，表头依次为“行号”“字段1”“字段2”“字段3”“字段4”“问题”。可见 3 行数据，行号为“1”“2”“3”，单元格内可见“xxxxx”和“xxxxxx”。
- 备注展示区：
  表格下方左侧显示“备注”，其下方区域为空白，未见输入框边框或占位符。
- 底部操作区：
  页面右下方横向排列“通过”“拒绝”两个按钮，“通过”为蓝色实心按钮，“拒绝”为白底蓝色描边按钮。

### 3. 可见文本汇总
- XXXX
- 导入内容
- 行号
- 字段1
- 字段2
- 字段3
- 字段4
- 问题
- 1
- 2
- 3
- xxxxx
- xxxxxx
- 备注
- 通过
- 拒绝
