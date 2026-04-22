# SYSTEM_MODULES_MAP (系统模块映射表)

## 1. 系统业务全景 (System Business Overview)
本项目为一个专业化的仓储/物资库房管理系统。基于现有菜单定义，系统以库房位置基础数据管理、物资流转作业（入库、出库、移库、盘存）、以及多维度数据统计报表为主轴。

## 2. 菜单路由与功能映射字典 (Menu Routing & Feature Mapping)
> 该映射表数据来源于 `menu.json`，为全系统前端路由及其业务含义的统一参照表（Single Source of Truth）。

### 📦 模块 A：库房管理 (Warehouse) 
*核心职责：管理物理库房结构与拓扑信息*

| 菜单名称 | 路由标示 (path) | 权限标识 (perms) | 业务功能概述 |
| --- | --- | --- | --- |
| 库房管理 | `warehouse` | `warehouse` | 维护基础库房信息 |
| 平衡区管理 | `district` | `district` | 库房内部平衡或业务分区的规划与管理 |
| 位置图管理 | `locationDrawing` | `locationDrawing` | 库内具体位置点的图形化可视化及结构管理 |

### 📊 模块 B：数据管理 (Data Management)
*核心职责：主数据维护与多维度统计报表分析*

| 菜单名称 | 路由标示 (path) | 权限标识 (perms) | 业务功能概述 |
| --- | --- | --- | --- |
| 初始录入 | `initialEntry` | `initialEntry` | 系统建设初期的期初物资数据导入与录入 |
| 变化量报表 | `changeReport` | `changeReport` | 针对特定周期内物资变动、流水情况的报表统计 |
| 存量报表 | `inventoryReport` | `inventoryReport` | 反映库房在特定时点的结余物资库存统计 |
| 封记台账 | `sealLedger` | `sealLedger` | 核心物资或特定容器的封签、启封生命周期记录 |
| 材料管理 | `materialManagement`| `materialManagement`| 系统底层物资（材料）主数据字典信息的维护 |
| 标签模板管理| `labelTemplate` | `labelTemplate` | 实物管理所需的条码/二维码等标签打印模板配置 |
| 综合查询 | `comprehensiveQuery`| `comprehensiveQuery`| 提供跨业务流水的全局综合检索与快照查询能力 |
| 账目管理 | `accountManagement` | `accountManagement` | 针对实物资产变动产生的关联账务数据处理 |

### 📋 模块 C：任务管理 (Task)
*核心职责：实物库存的现场变动作业驱动*

| 菜单名称 | 路由标示 (path) | 权限标识 (perms) | 业务功能概述 |
| --- | --- | --- | --- |
| 入库管理 | `inbound` | `inbound` | 办理物资入库验收、入账的标准化作业流程 |
| 出库管理 | `outbound` | `outbound` | 办理物资调拨出库、消耗等离库作业流程 |
| 位置移动 | `move` | `move` | 处理库房内部特定位置间的转移、倒库作业 |
| 实物盘存 | `inventory` | `inventory` | 定期或临时的库房账实核对与盈亏确认作业 |

---

## 3. 🤖 架构维护红线 (AI Agent Maintenance Rules)

> [!CAUTION]
> **To All AI Agents:** 
> 当在本项目中通过工作流生成新的页面、菜单或功能模块时，必须强制遵守以下操作规范：

1. **模块地图同频机制**：
   - 任何涉及功能模块或菜单界面的增删改，必须同步更新本文档 (`SYSTEM_MODULES_MAP.md`)，确保映射字典的绝对准确性。
   - 同步修改和维护 `menu.json` 静态配置文件。

2. **自动联动后端注册**：
   - 页面代码或 JSON 修改完毕后，严禁遗漏后端权限配置。必须主动调用 `.agent/skills/menu_management/SKILL.md`（菜单管理技能），以完成新模块在后端接口及数据库的权限与菜单节点自动化注册。

3. **编码及路由规范**：
   - 新增的路由 `path` 及权限标示 `perms` 统一遵循英文小驼峰命名（CamelCase）。
   - 命名词汇必须与所属业务的实际操作逻辑保持精准匹配。
