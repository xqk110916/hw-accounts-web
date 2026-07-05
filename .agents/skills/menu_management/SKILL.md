---
name: 菜单管理技能 (Menu Management Skill)
description: 仅在用户明确要求注册菜单/权限时，调用后端接口完成菜单与按钮权限的同步注册。手动触发技能。
---

# 菜单管理技能 (Menu Management Skill)

本技能规范后台菜单（目录 `M` / 菜单 `C` / 按钮 `A`）的维护流程。**默认不自动触发**，仅当用户明确要求"注册菜单/权限"或点名本技能时执行。完整接口字段见 `md/系统管理接口.md`。

## 适用优先级
> [!IMPORTANT]
> **手动触发技能**。新增页面/文件夹/路由/功能名称变更，均不自动执行本技能。仅当用户明确要求注册菜单、注册权限，或点名"菜单管理技能"时，才阅读并执行本流程。

## 环境信息
- **API 基地址**: 见 `.env.development` 的 `VUE_APP_BASE_API`（当前 `http://10.10.41.179:40000/api`，环境切换以该文件为准）
- **客户端类型 (clientType)**: `0`

## 关键约定（先读，避免返工）
- **鉴权头**: `headers[cookie.tokenName] = cookie.tokenValue`，动态 key（**不要**写死 `Authorization`）。`tokenName` 实际值为 `token`，`tokenValue` 是后端校验的真鉴权值（存 Redis）；`localStorage` 里的 JWT **不被使用**。
- **统一用浏览器 fetch 调接口（禁用 curl）**：通过 `mcp__cdp-bridge__browser_execute_js` 在已登录的 `localhost:8080` 页面发 fetch，天然 UTF-8、复用登录态、无中文乱码。cdp-bridge **无 `browser_cookies` 工具**，获取 cookie 一律用 `browser_execute_js` 读 `document.cookie`。
- **命名强一致**：本仓库现有菜单的 `path` = `perms` = `enCode`，均为 camelCase，与 `src/views/<module>/` 目录名一致（如 `comprehensiveQuery`、`sealLedger`）。新增菜单(C)须参照同父级现有菜单命名。
  - **按钮权限(A) 例外**：`enCode`/`perms` 用 `模块_操作` 格式（如 `system_user_add`），必须与前端 `v-hasPermi="['system_user_add']"` 传入值完全一致。
- **parentId 必须动态查询**：每次执行都先查菜单树定位父级 id，**禁止写死任何 id**（环境迁移/数据重置后 id 会变）。

## 操作手册

### 第零步：认证准备
1. `mcp__cdp-bridge__browser_get_tabs` 找到 `http://localhost:8080/` 标签页；未打开则提示用户先登录（不要用 Playwright）。
2. `mcp__cdp-bridge__browser_execute_js`（参数 `switch_tab_id=<该tab>`、`no_monitor=true`）读取认证信息并缓存到页面全局：
   ```js
   var c = document.cookie.split(';').reduce(function(a,x){var p=x.trim().split('=');a[p[0]]=p[1];return a;},{});
   window.__auth = JSON.stringify({ tokenName: c.tokenName, tokenValue: c.tokenValue });
   ```
后续所有接口调用复用 `window.__auth` 里的 `tokenName` / `tokenValue`。

> fetch 为异步：每个请求用 `execute_js`（`no_monitor=true`）发起并把结果存入 `window.__xxx`，再用 `browser_wait`（`condition_js="window.__xxx !== undefined"`）等待，最后用 `execute_js`（`no_monitor=true`）读取。

### 第一步：查询菜单树（定位 parentId + 查重 + 命名参照）
```js
var a = JSON.parse(window.__auth);
fetch('/base/menu/treeListByClientType?clientType=0', { headers: { [a.tokenName]: a.tokenValue } })
  .then(function(r){return r.json();})
  .then(function(d){ window.__menuTree = JSON.stringify(d); });
```
- **定位 parentId**：在结果中按 `enCode` 精确匹配父级目录（如数据管理 `enCode=dataManagement`），取其 `id`。**不写死**。
- **查重（必做）**：在目标父级 `children` 中查是否已存在相同 `path`；已存在则改走 PUT `/base/menu/{id}` 修改，不重复新增。
- **命名参照**：记录同父级现有菜单的 `path/perms/enCode/sortNum`，新菜单保持一致；`sortNum` 取现有最大值 +1。

### 第二步：确定新增逻辑
| menuType | 用途 | parentId 取值 | 关键字段 |
|---|---|---|---|
| `M` 目录 | 顶部导航容器 | 上级目录 id 或 `0` | fullName, enCode, icon |
| `C` 菜单 | 页面路由 | 所属目录 id | fullName, path, perms, enCode（三者同名 camelCase）|
| `A` 按钮 | 操作权限点 | 所属菜单(C) id | fullName, perms, enCode（`模块_操作`，匹配前端 v-hasPermi）|

创建顺序：目录(M) → 查询取 id → 菜单(C) → 查询取 id → 按钮(A)。

### 第三步：调用接口（POST /base/menu）
```js
var a = JSON.parse(window.__auth);
fetch('/base/menu', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [a.tokenName]: a.tokenValue },
  body: JSON.stringify(<payload>)
}).then(function(r){return r.json();})
  .then(function(d){ window.__menuAdd = JSON.stringify(d); });
```

**菜单(C) payload**：
```json
{
  "parentId": "<第一步动态查询的父级id>",
  "menuType": "C",
  "fullName": "页面名称",
  "linkType": 0,
  "path": "view目录名",
  "linkUrl": "",
  "perms": "与path同名",
  "sortNum": 9,
  "visibleFlag": "1",
  "clientType": "0",
  "icon": "",
  "enCode": "与path同名"
}
```

**目录(M) payload**：`menuType` 改 `M`，去掉 `linkType/path/linkUrl/perms`，保留 `fullName/enCode/icon/sortNum/visibleFlag/clientType/parentId`。

**按钮(A) payload**：
```json
{
  "parentId": "<所属菜单C的id>",
  "menuType": "A",
  "fullName": "新增",
  "perms": "system_user_add",
  "enCode": "system_user_add",
  "sortNum": 99,
  "visibleFlag": "1",
  "clientType": "0"
}
```
> `enCode` 是权限系统核心标识：前端 `v-hasPermi="['system_user_add']"` 匹配此值，后端把 menuType=A 节点的 enCode 收集进用户权限列表。**必须与前端代码一致**。

返回 `{"code":1,"msg":"操作成功","success":true}` 即成功。

### 第四步：验证（必做）
重新查菜单树（第一步），确认目标节点挂在正确 `parentId` 下，`path/perms/enCode` 符合预期。不符则 PUT `/base/menu/{id}` 修改或 DELETE `/base/menu/{id}` 重来。

### 第五步：提示权限分配
菜单注册后，前端路由由后端**按角色**动态下发。告知用户：到「系统管理 → 角色管理」给目标角色分配该 `perms`/`enCode` 后，侧边栏才可见。本技能不自动改角色权限（如需，用 `system-admin` 技能）。

## 常见坑
- ❌ 写死 parentId → 环境迁移后失效。✅ 每次查树动态定位。
- ❌ 用 localStorage 的 JWT 当 token → 401。✅ 用 cookie 的 `tokenValue`。
- ❌ 菜单(C) 自创 enCode 格式 → 与现有不一致。✅ `path=perms=enCode` camelCase。
- ❌ 按钮(A) 用 camelCase → `v-hasPermi` 匹配不上。✅ 用 `模块_操作`。
- ❌ 用 curl 传中文 → 乱码。✅ 浏览器 fetch。
- ❌ 跳过查重/验证 → 重复菜单或失败不可见。✅ 新增前查 path，新增后回查。

---
*完整接口字段见 [系统管理接口.md](file:///f:/testCode/hw-accounts-web/md/系统管理接口.md)*
