# 库房管理菜单业务说明

本文档用于说明 `src/views/warehouse` 菜单下三个主要界面的业务边界、数据来源和关键约定，方便后续 Agent 或开发者修改时快速理解上下文。

## 一、菜单结构

当前目录主要包含三个业务界面：

- `warehouse/`：库房管理，负责库房 2D/3D 可视化展示、货架详情和库位状态查看。
- `locationDrawing/`：位置图管理，负责平衡区、库房、列、排、层的树形维护，并提供库房位置图 2D 编辑和 3D 查看。
- `district/`：平衡区管理，负责平衡区基础资料的列表、详情、新增、编辑和删除。

三个界面共享同一套层级概念：

```text
平衡区 nodeType=1 > 库房 nodeType=2 > 列 nodeType=3 > 排 nodeType=4 > 层 nodeType=5
```

其中 `列 + 排` 唯一确定一个货架，排节点下的 `children` 表示该货架的层数。层节点本身不代表独立货架，只代表货架内的层位。

## 二、库房管理 warehouse

入口文件：`warehouse/index.vue`

库房管理用于展示平衡区下的库房、货架和库位状态，主要是只读查看场景。页面支持从平衡区列表进入库房列表，再进入单个库房的 2D/3D 视图，也支持进入货架详情查看层位状态。

核心组件：

- `components/WarehouseInterior3D.vue`：库房 3D 展示组件，也内置 2D/3D 模式切换。库房管理中保留鼠标移入货架时的“点击进入货架视图”提示。
- `components/LocationMap2D.vue`：库房 2D 展示包装组件，内部复用共享的 2D 网格组件，只读展示。
- `components/WarehouseGridMap2D.vue`：共享 2D 网格组件，可用于只读展示或编辑。
- `config/warehouseConfig.js`：库房管理的数据适配和接口聚合层。

主要数据来源：

- 平衡区：优先调用 `getAllBalanceAreas()`。
- 库房列表：优先调用 `getWarehouseListByBalanceArea({ balanceAreaId })`，必要时兜底 `getHierarchyListByNodeType(2)`。
- 库房详情：调用 `getHierarchyDetail(warehouseId)`。
- 层级树：调用 `getHierarchyTree()`，用于获取库房下的列、排、层结构。
- 库位占用：调用 `getPositionMap({ nodeId: warehouseId, nodeType: '2' })`。
- 货架类型字典：调用 `getDictionaryList({ parentId: '2046473482554638338' })`。

布局读取规则：

1. 优先使用库房详情接口返回的 `extra.layout2d`。
2. 后端暂不回传 `extra` 时，使用前端 `localStorage` 中按库房 ID 缓存的布局。
3. 如果没有缓存，则根据接口树自动生成初始布局。

库房管理中的 2D/3D 都需要显示过道，但 2D 不提供编辑能力。布局编辑统一在位置图管理中完成。

## 三、位置图管理 locationDrawing

入口文件：`locationDrawing/index.vue`

位置图管理用于维护位置图层级树，并在库房节点上提供“位置图”功能。该功能用于查看库房 2D/3D 图，其中 2D 支持编辑布局，3D 只展示。

核心组件：

- `components/LocationAddDialog.vue`：新增/编辑树节点弹窗。货架类型字典需要保留 `bizCode`，尺寸解析优先使用 `bizCode`。
- `components/NodeDetailDrawer.vue`：节点详情抽屉。
- `components/WarehousePositionMapDialog.vue`：库房位置图弹窗，包含 2D 编辑和 3D 查看。
- `../warehouse/components/WarehouseGridMap2D.vue`：复用的 2D 网格编辑组件。
- `../warehouse/components/WarehouseInterior3D.vue`：复用的 3D 展示组件。位置图管理中会关闭“点击进入货架视图”提示。

位置图弹窗加载数据：

- `getHierarchyDetail(warehouseId)` 获取库房详情。
- `getHierarchyTree()` 获取完整树，并定位当前库房节点。
- `getPositionMap({ nodeId: warehouseId, nodeType: '2' })` 获取库位占用。
- `getDictionaryList({ parentId: '2046473482554638338' })` 获取货架类型及尺寸。

2D 编辑能力：

- 支持拖拽货架。
- 支持添加、擦除过道。
- 支持鼠标左键长按涂抹过道或擦除过道。
- 支持编辑网格行列数。网格扩展时新增格子从四周均分，奇数优先加在上方和左侧。
- 支持导出 2D 图片，图片中需要包含货架、库位状态和过道。
- 编辑态仅在画布区域禁用右键菜单和文字选择。

保存规则：

- 保存时调用 `updateHierarchyNode`，请求体中带上 `extra.layout2d`。
- 由于后端暂不回传 `extra`，保存时同时写入本地缓存。
- 保存布局不修改节点层级，不新增或删除列、排、层节点。

## 四、平衡区管理 district

入口文件：`district/index.vue`

平衡区管理用于维护平衡区基础资料，页面基于项目通用 CRUD 页面配置实现。

核心文件：

- `district/index.vue`：列表页入口。
- `district/components/index.js`：CRUD 配置、接口函数和按钮配置。
- `district/components/detail.vue`：平衡区详情和表单字段配置。

主要接口：

- `src/api/warehouse/balanceArea.js`
- 列表、详情、新增、编辑、删除都通过该接口文件封装。

主要字段：

- 平衡区编码。
- 平衡区名称。
- 入库许可证。
- 出库许可证。
- 平衡区类型。
- 备注。

平衡区类型通过字典 `平衡区类型` 加载。前端存在类型值映射逻辑，修改字段或接口入参时需要同步检查 `district/components/index.js` 中的映射处理。

## 五、共享布局模型

`extra.layout2d` 是库房 2D 布局的核心结构，当前既写入接口请求体，也写入本地缓存兜底。

```json
{
  "layout2d": {
    "grid": { "rows": 20, "cols": 20, "cellSize": 32 },
    "shelves": [
      {
        "id": "列ID-排ID",
        "columnId": "列节点ID",
        "rowId": "排节点ID",
        "columnCode": "S1",
        "rowCode": "1",
        "x": 1,
        "y": 1,
        "w": 10,
        "h": 2,
        "shelfType": "5-3-2-10"
      }
    ],
    "aisles": [
      { "id": "aisle_0_0", "x": 0, "y": 0, "w": 1, "h": 1 }
    ]
  }
}
```

布局工具：

- `warehouse/utils/locationLayoutStorage.js`：负责 `extra` 规范化、本地缓存、货架类型解析。
- `warehouse/utils/locationLayoutAdapter.js`：负责接口树转货架、初始布局生成、布局应用。

货架类型字典：

- 字典父级 ID：`2046473482554638338`。
- 字典项优先解析 `bizCode`。
- 示例 `bizCode=5-3-2-10` 表示 `5排、3层、2m*10m`。
- 2D 占位优先使用尺寸中的长宽；缺少类型时根据树结构生成默认尺寸。

## 六、修改注意事项

- 不要把库房管理重新改回写死数据，主流程应优先使用真实接口。
- 不要在库房管理中开放 2D 布局编辑，编辑入口放在位置图管理。
- 修改 `WarehouseGridMap2D.vue` 时要同时考虑位置图管理编辑态和库房管理只读态。
- 修改 `WarehouseInterior3D.vue` 时要区分两个入口：库房管理显示货架进入提示，位置图管理不显示。
- 后端支持回传 `extra` 后，读取优先级不用调整，接口返回会自然覆盖本地缓存兜底。
