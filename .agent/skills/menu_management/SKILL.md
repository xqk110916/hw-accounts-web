---
name: 菜单管理技能 (Menu Management Skill)
description: 仅在用户明确要求时，调用后端接口完成菜单的同步注册和配置。
---

# 菜单管理技能 (Menu Management Skill)

本技能旨在规范后台菜单的维护流程。默认情况下，Agent 不应自动触发本技能；只有当用户明确要求“注册菜单/权限”或“触发菜单管理技能”时，才使用本技能维护后台菜单。

## 适用优先级 (Agent 注意)
> [!IMPORTANT]
> 这是一个 **手动触发技能**。不要因为新增页面、文件夹、路由或功能名称变更而自动执行本技能。仅当用户明确要求时，再阅读并执行本技能。

## 环境信息
- **API 基地址**: `http://10.10.41.179:40000/api` (参考 `.env.development`)
- **客户端类型 (clientType)**: `0`

## 操作手册

### 第一步：查询当前结构
在进行任何修改前，先获取现有的菜单树以确定 `parentId`：
- **GET** `/base/menu/treeListByClientType?clientType=0`

### 第二步：获取鉴权 Token (自动获取)
由于接口需要鉴权，Agent **可以且应当**尝试自动获取 Token。请求头为动态 key，即 `headers[tokenName] = tokenValue`（`tokenName` 和 `tokenValue` 均从 Cookie 中读取）：
1. 使用 MCP 工具 `mcp__cdp-bridge__browser_cookies` 获取浏览器 Cookies。
2. 从 Cookies 中提取 `tokenName` 和 `tokenValue`。
3. 如果未登录或获取失败，请告知用户并请求提供 Token。

### 第三步：确定新增逻辑
1. **新增目录 (M)**：
   - 如果是一个全新的模块（如 `src/views/newItem`），先创建类型为 `M` 的菜单。
   - `parentId` 通常为 `0` 或对应的父级模块 ID。
2. **新增菜单 (C)**：
   - 如果是在已有目录下新增页面，使用该目录的 `id` 作为 `parentId`。
   - `path` 应与 `src/views/` 下的路径对应。
   - `perms` 和 `enCode` 必须唯一。
3. **新增按钮权限 (A)**：
   - 在已有菜单（C）下添加操作按钮的权限控制。
   - `parentId` 为所属菜单（C）的 `id`。
   - **`enCode` 是前端 `v-hasPermi` 指令实际匹配的值**，命名规范为 `模块_操作`（如 `system_user_add`、`system_menu_edit`）。
   - `perms` 与 `enCode` 建议填写相同值。

### 第四步：调用接口 (Curl/Request)
获取 Token 并确认逻辑后，使用 `run_command` 发起同步请求。
- **Header**: 使用第二步获取到的 Token 名和值。
- **Payload**: 详见下方模板。

**新增目录 Payload 模板（menuType='M'）：**
```json
{
    "parentId": "0",
    "menuType": "M",
    "fullName": "目录名称",
    "enCode": "目录编码",
    "sortNum": 99,
    "visibleFlag": "1",
    "clientType": "0",
    "icon": ""
}
```

**新增菜单 Payload 模板（menuType='C'）：**
```json
{
    "parentId": "父级目录ID",
    "menuType": "C",
    "fullName": "页面名称",
    "linkType": 0,
    "path": "view目录名",
    "perms": "唯一标识",
    "sortNum": 99,
    "visibleFlag": "1",
    "clientType": "0",
    "enCode": "唯一编码"
}
```

**新增按钮权限 Payload 模板（menuType='A'）：**
```json
{
    "parentId": "所属菜单ID",
    "menuType": "A",
    "fullName": "按钮名称（如：新增、编辑、删除）",
    "enCode": "权限标识（如 system_user_add，前端 v-hasPermi 匹配此值）",
    "perms": "权限标识（建议与 enCode 相同）",
    "sortNum": 99,
    "visibleFlag": "1",
    "clientType": "0"
}
```

> **关键说明**：`enCode` 是权限系统的核心标识。前端通过 `v-hasPermi="['enCode值']"` 控制按钮显示，后端将 `menuType='A'` 节点的 `enCode` 收集到用户权限列表中。因此 `enCode` 的值必须与前端代码中 `v-hasPermi` 传入的值完全一致。

## 维护建议
- **enCode 规范**：使用 `模块_操作` 格式（如 `system_user_add`、`system_menu_edit`、`system_dict_del`）。
- **perms 规范**：建议与 `enCode` 保持一致，避免混淆。
- **创建顺序**：先创建目录（M）→ 查询获取 ID → 创建菜单（C）→ 查询获取 ID → 创建按钮权限（A）。
- **错误处理**：如果接口报错，请及时告知用户并检查参数是否符合 `md/菜单管理-接口.md` 中的格式。

---
*本技能由 Antigravity 自动维护，详见 [菜单管理-接口.md](file:///f:/testCode/hw-accounts-web/md/%E8%8F%9C%E5%8D%95%E7%AE%A1%E7%90%86-%E6%8E%A5%E5%8F%A3.md)*
