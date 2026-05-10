【字段清单 JSON】

```json
{
  "pages": [
    {
      "page_name": "list.png",
      "fields": [
        {
          "label": "打印时间:",
          "component": "el-date-picker",
          "attributes": {
            "placeholder": "开始日期 — 结束日期",
            "default_value": "",
            "options": [],
            "position": "搜索区左侧",
            "notes": "日期范围输入框右侧可见日历图标"
          }
        },
        {
          "label": "查询",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "搜索区中部",
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
            "position": "搜索区中部",
            "notes": "白底蓝色描边按钮"
          }
        },
        {
          "label": "导入",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "操作区右侧",
            "notes": "蓝色实心按钮"
          }
        },
        {
          "label": "添加",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "操作区右侧",
            "notes": "蓝色实心按钮"
          }
        },
        {
          "label": "编辑模版",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "操作区右侧",
            "notes": "白底蓝色描边按钮"
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
          "label": "打印时间",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 2 列",
            "notes": "可见单元格文本为“2025-10-10”"
          }
        },
        {
          "label": "标签数量",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 3 列",
            "notes": "可见单元格文本为“XXXXXXXX”"
          }
        },
        {
          "label": "备注",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格表头第 4 列",
            "notes": "可见单元格文本为“XXXXXXXX”"
          }
        },
        {
          "label": "操作",
          "component": "el-table-column",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": ["详情", "编辑", "删除"],
            "position": "表格表头第 5 列",
            "notes": "操作列内为蓝色文字操作项"
          }
        },
        {
          "label": "1",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "表格操作列表头附近",
            "notes": "黄色圆角标记，位于“操作”表头右下附近"
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
      "page_name": "template.png",
      "fields": [
        {
          "label": "模板名称",
          "component": "el-select",
          "attributes": {
            "placeholder": "",
            "default_value": "模板1",
            "options": [],
            "position": "左侧配置区顶部",
            "notes": "选择框右侧可见下拉箭头"
          }
        },
        {
          "label": "新增",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "左侧配置区顶部，模板名称右侧",
            "notes": "白底蓝色描边按钮"
          }
        },
        {
          "label": "预览",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "右侧预览区顶部",
            "notes": "加粗标题文字，右侧有刷新图标"
          }
        },
        {
          "label": "保存",
          "component": "el-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "页面右上角",
            "notes": "蓝色实心按钮"
          }
        },
        {
          "label": "标题",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "左侧配置区标题设置行左侧",
            "notes": "表单标签"
          }
        },
        {
          "label": "",
          "component": "el-input",
          "attributes": {
            "placeholder": "",
            "default_value": "材料管理卡",
            "options": [],
            "position": "左侧配置区标题设置行",
            "notes": "标题文本输入框"
          }
        },
        {
          "label": "",
          "component": "el-select",
          "attributes": {
            "placeholder": "",
            "default_value": "显示",
            "options": [],
            "position": "左侧配置区标题设置行",
            "notes": "标题显示状态下拉框"
          }
        },
        {
          "label": "",
          "component": "el-select",
          "attributes": {
            "placeholder": "",
            "default_value": "16号",
            "options": [],
            "position": "左侧配置区标题设置行",
            "notes": "标题字号下拉框"
          }
        },
        {
          "label": "",
          "component": "el-select",
          "attributes": {
            "placeholder": "",
            "default_value": "正常",
            "options": [],
            "position": "左侧配置区标题设置行",
            "notes": "标题状态下拉框"
          }
        },
        {
          "label": "字段1",
          "component": "el-input",
          "attributes": {
            "placeholder": "",
            "default_value": "材料编码",
            "options": [],
            "position": "左侧配置区字段第 1 行",
            "notes": "左侧可见向下箭头图标；行内还包含“单排”“16号”“正常”和“+”“-”图标按钮"
          }
        },
        {
          "label": "字段2",
          "component": "el-input",
          "attributes": {
            "placeholder": "",
            "default_value": "生产单位",
            "options": [],
            "position": "左侧配置区字段第 2 行",
            "notes": "左侧可见向上、向下箭头图标；行内还包含“单排”“16号”“正常”和“+”“-”图标按钮"
          }
        },
        {
          "label": "字段3",
          "component": "el-input",
          "attributes": {
            "placeholder": "",
            "default_value": "库房",
            "options": [],
            "position": "左侧配置区字段第 3 行",
            "notes": "左侧可见向上、向下箭头图标；行内还包含“单排”“16号”“正常”和“+”“-”图标按钮"
          }
        },
        {
          "label": "字段4",
          "component": "el-input",
          "attributes": {
            "placeholder": "",
            "default_value": "入库人",
            "options": [],
            "position": "左侧配置区字段第 4 行",
            "notes": "左侧可见向上、向下箭头图标；行内还包含“单排”“16号”“正常”和“+”“-”图标按钮"
          }
        },
        {
          "label": "字段5",
          "component": "el-input",
          "attributes": {
            "placeholder": "",
            "default_value": "容器号",
            "options": [],
            "position": "左侧配置区字段第 5 行",
            "notes": "左侧可见向上、向下箭头图标；行内还包含“单排”“16号”“正常”和“+”“-”图标按钮"
          }
        },
        {
          "label": "字段6",
          "component": "el-input",
          "attributes": {
            "placeholder": "",
            "default_value": "入库时间",
            "options": [],
            "position": "左侧配置区字段第 6 行",
            "notes": "左侧可见向上、向下箭头图标；行内还包含“单排”“16号”“正常”和“+”“-”图标按钮"
          }
        },
        {
          "label": "单排",
          "component": "el-select",
          "attributes": {
            "placeholder": "",
            "default_value": "单排",
            "options": [],
            "position": "左侧配置区字段行内",
            "notes": "字段1至字段6行内均可见"
          }
        },
        {
          "label": "16号",
          "component": "el-select",
          "attributes": {
            "placeholder": "",
            "default_value": "16号",
            "options": [],
            "position": "左侧配置区字段行内",
            "notes": "字段1至字段6行内均可见"
          }
        },
        {
          "label": "正常",
          "component": "el-select",
          "attributes": {
            "placeholder": "",
            "default_value": "正常",
            "options": [],
            "position": "左侧配置区字段行内",
            "notes": "字段1至字段6行内均可见"
          }
        },
        {
          "label": "+",
          "component": "el-button / icon-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "左侧配置区字段行右侧",
            "notes": "蓝色加号小按钮，字段1至字段6行内均可见"
          }
        },
        {
          "label": "-",
          "component": "el-button / icon-button",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "左侧配置区字段行右侧",
            "notes": "橙色减号小按钮，字段1至字段6行内均可见"
          }
        },
        {
          "label": "二维码",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "左侧配置区二维码设置行",
            "notes": "左侧可见向上箭头图标"
          }
        },
        {
          "label": "",
          "component": "el-input",
          "attributes": {
            "placeholder": "",
            "default_value": "50mm",
            "options": [],
            "position": "左侧配置区二维码设置行宽度输入框",
            "notes": "位于“二维码”右侧"
          }
        },
        {
          "label": "×",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "左侧配置区二维码尺寸两个输入框之间",
            "notes": "尺寸分隔符"
          }
        },
        {
          "label": "",
          "component": "el-input",
          "attributes": {
            "placeholder": "",
            "default_value": "50mm",
            "options": [],
            "position": "左侧配置区二维码设置行高度输入框",
            "notes": "位于“×”右侧"
          }
        },
        {
          "label": "",
          "component": "el-select",
          "attributes": {
            "placeholder": "",
            "default_value": "显示",
            "options": [],
            "position": "左侧配置区二维码设置行右侧",
            "notes": "二维码显示状态下拉框"
          }
        },
        {
          "label": "边距设置",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "左侧配置区边距设置标题",
            "notes": "加粗大号文本"
          }
        },
        {
          "label": "上边距",
          "component": "el-input",
          "attributes": {
            "placeholder": "",
            "default_value": "10mm",
            "options": [],
            "position": "左侧配置区边距设置第 1 行左侧",
            "notes": "输入框位于标签右侧"
          }
        },
        {
          "label": "下边距",
          "component": "el-input",
          "attributes": {
            "placeholder": "",
            "default_value": "10mm",
            "options": [],
            "position": "左侧配置区边距设置第 1 行右侧",
            "notes": "输入框位于标签右侧"
          }
        },
        {
          "label": "左边距",
          "component": "el-input",
          "attributes": {
            "placeholder": "",
            "default_value": "10mm",
            "options": [],
            "position": "左侧配置区边距设置第 2 行左侧",
            "notes": "输入框位于标签右侧"
          }
        },
        {
          "label": "右边距",
          "component": "el-input",
          "attributes": {
            "placeholder": "",
            "default_value": "10mm",
            "options": [],
            "position": "左侧配置区边距设置第 2 行右侧",
            "notes": "输入框位于标签右侧"
          }
        },
        {
          "label": "材料管理卡",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "右侧预览卡片顶部左侧",
            "notes": "预览卡片标题"
          }
        },
        {
          "label": "材料编码",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "右侧预览卡片左侧表格",
            "notes": "预览文本"
          }
        },
        {
          "label": "生产单位",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "右侧预览卡片左侧表格",
            "notes": "预览文本"
          }
        },
        {
          "label": "库房",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "右侧预览卡片左侧表格",
            "notes": "预览文本"
          }
        },
        {
          "label": "入库人",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "右侧预览卡片左侧表格",
            "notes": "预览文本"
          }
        },
        {
          "label": "容器号",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "右侧预览卡片左侧表格",
            "notes": "预览文本"
          }
        },
        {
          "label": "入库时间",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "右侧预览卡片左侧表格",
            "notes": "预览文本"
          }
        },
        {
          "label": "二维码",
          "component": "el-image",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "右侧预览卡片右侧",
            "notes": "上方显示“二维码”，下方为二维码图片"
          }
        }
      ]
    },
    {
      "page_name": "add.png",
      "fields": [
        {
          "label": "选择模板",
          "component": "el-select",
          "attributes": {
            "placeholder": "",
            "default_value": "模板1",
            "options": [],
            "position": "页面顶部第 1 行",
            "notes": "选择框右侧可见下拉箭头"
          }
        },
        {
          "label": "备注",
          "component": "el-input",
          "attributes": {
            "placeholder": "请输入",
            "default_value": "",
            "options": [],
            "position": "页面顶部第 2 行",
            "notes": "单行输入框"
          }
        },
        {
          "label": "材料管理卡",
          "component": "html-text",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "卡片表单区顶部居中",
            "notes": "加粗大号标题"
          }
        },
        {
          "label": "材料编码",
          "component": "el-input",
          "attributes": {
            "placeholder": "请输入",
            "default_value": "",
            "options": [],
            "position": "卡片表单区第 1 行左侧",
            "notes": "标签在左，输入框在右"
          }
        },
        {
          "label": "生成单位",
          "component": "el-input",
          "attributes": {
            "placeholder": "请输入",
            "default_value": "",
            "options": [],
            "position": "卡片表单区第 1 行右侧",
            "notes": "标签在左，输入框在右"
          }
        },
        {
          "label": "库房",
          "component": "el-input",
          "attributes": {
            "placeholder": "请输入",
            "default_value": "",
            "options": [],
            "position": "卡片表单区第 2 行左侧",
            "notes": "标签在左，输入框在右"
          }
        },
        {
          "label": "入库人",
          "component": "el-input",
          "attributes": {
            "placeholder": "请输入",
            "default_value": "",
            "options": [],
            "position": "卡片表单区第 2 行右侧",
            "notes": "标签在左，输入框在右"
          }
        },
        {
          "label": "容器号",
          "component": "el-input",
          "attributes": {
            "placeholder": "请输入",
            "default_value": "",
            "options": [],
            "position": "卡片表单区第 3 行",
            "notes": "标签在左，输入框横向占据右侧大部分宽度"
          }
        },
        {
          "label": "入库时间",
          "component": "el-input",
          "attributes": {
            "placeholder": "请输入",
            "default_value": "",
            "options": [],
            "position": "卡片表单区第 4 行",
            "notes": "标签在左，输入框横向占据右侧大部分宽度"
          }
        },
        {
          "label": "二维码",
          "component": "el-image",
          "attributes": {
            "placeholder": "",
            "default_value": "",
            "options": [],
            "position": "卡片表单区二维码区域",
            "notes": "“二维码”文字右侧可见刷新图标，下方为二维码图片"
          }
        },
        {
          "label": "保存",
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
          "label": "打印",
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
  页面顶部左侧横向排列“打印时间:”日期范围选择器，日期框内显示占位符“开始日期 — 结束日期”。日期框右侧偏中位置显示“查询”“重置”两个按钮。
- 操作区：
  页面顶部右侧横向排列“导入”“添加”“编辑模版”三个按钮。
- 表格区：
  表格位于顶部按钮区下方。表格左侧有多选框列，表头从左到右依次为“打印时间”“标签数量”“备注”“操作”。“操作”表头右下附近可见黄色圆角标记“1”。每行操作列显示“详情”“编辑”“删除”三个蓝色文字操作项。
- 分页区：
  位于页面底部右侧。可见“共 400 条”、左翻页按钮、页码“1”“2”“3”“4”“5”“…”“6”、右翻页按钮、“20 条/页”、“前往”、页码输入框“3”、“页”。

### 3. 可见文本汇总
- 打印时间:
- 开始日期 — 结束日期
- 查询
- 重置
- 导入
- 添加
- 编辑模版
- 打印时间
- 标签数量
- 备注
- 操作
- 1
- 2025-10-10
- XXXXXXXX
- 详情
- 编辑
- 删除
- 共 400 条
- 2
- 3
- 4
- 5
- …
- 6
- 20 条/页
- 前往
- 页

## template.png

### 1. 页面整体结构
- 页面为左右分栏结构。左侧为模板配置区，右侧为预览区。
- 左侧配置区从上到下依次为模板名称行、标题设置行、字段配置行组、二维码配置行、边距设置区。
- 右侧预览区顶部显示“预览”和刷新图标，右上角显示“保存”按钮；下方显示预览卡片。

### 2. 区块拆解
- 模板选择区：
  左侧顶部横向排列“模板名称”标签、默认值为“模板1”的下拉框和“新增”按钮。
- 标题设置区：
  位于模板选择区下方，横向排列“标题”标签、默认值为“材料管理卡”的输入框、默认值为“显示”的下拉框、默认值为“16号”的下拉框、默认值为“正常”的下拉框。
- 字段配置区：
  纵向排列“字段1”至“字段6”共 6 行。每行左侧可见向上或向下箭头图标；行内依次显示字段标签、字段名输入框、默认值为“单排”的下拉框、默认值为“16号”的下拉框、默认值为“正常”的下拉框、蓝色“+”小按钮、橙色“-”小按钮。字段名默认值依次为“材料编码”“生产单位”“库房”“入库人”“容器号”“入库时间”。
- 二维码配置区：
  位于字段配置区下方。左侧可见向上箭头图标和“二维码”标签，右侧为两个输入框，默认值均为“50mm”，中间显示“×”，末尾为默认值“显示”的下拉框。
- 边距设置区：
  左侧下方显示大号加粗“边距设置”。下方为两行两列输入区：第 1 行为“上边距 10mm”“下边距 10mm”，第 2 行为“左边距 10mm”“右边距 10mm”。
- 预览区：
  右侧预览卡片左半部分为表格样式，顶部标题为“材料管理卡”，表格内可见“材料编码”“生产单位”“库房”“入库人”“容器号”“入库时间”。右半部分顶部显示“二维码”，下方为二维码图片。

### 3. 可见文本汇总
- 模板名称
- 模板1
- 新增
- 预览
- 保存
- 标题
- 材料管理卡
- 显示
- 16号
- 正常
- 字段1
- 字段2
- 字段3
- 字段4
- 字段5
- 字段6
- 材料编码
- 单排
- 生产单位
- 库房
- 入库人
- 容器号
- 入库时间
- +
- -
- 二维码
- 50mm
- ×
- 边距设置
- 上边距
- 下边距
- 左边距
- 右边距
- 10mm

## add.png

### 1. 页面整体结构
- 页面为表单与卡片预览/填报结构，从上到下依次为公共配置区、卡片表单区、二维码区、底部操作区。
- 页面整体为单列布局，底部操作按钮靠右排列。

### 2. 区块拆解
- 公共配置区：
  第 1 行横向排列“选择模板”标签和默认值为“模板1”的下拉框。第 2 行横向排列“备注”标签和单行输入框，输入框占位符为“请输入”。
- 卡片表单区：
  下方为带黑色边框的卡片区域。顶部居中显示大号“材料管理卡”。表单使用表格边框布局：第 1 行左侧为“材料编码”加输入框，右侧为“生成单位”加输入框；第 2 行左侧为“库房”加输入框，右侧为“入库人”加输入框；第 3 行为“容器号”加横向长输入框；第 4 行为“入库时间”加横向长输入框。所有可见输入框占位符均为“请输入”。
- 二维码区：
  卡片表单区下半部分居中显示“二维码”，其右侧可见刷新图标。下方为大尺寸二维码图片。
- 底部操作区：
  页面底部右侧横向排列“保存”“打印”两个蓝色实心按钮。

### 3. 可见文本汇总
- 选择模板
- 模板1
- 备注
- 请输入
- 材料管理卡
- 材料编码
- 生成单位
- 库房
- 入库人
- 容器号
- 入库时间
- 二维码
- 保存
- 打印
