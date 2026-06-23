---
name: system-admin
description: 系统管理综合技能。当用户要求管理系统用户、菜单、角色、字典、岗位，或执行用户创建、角色分配、菜单权限分配、按钮权限配置等系统管理操作时触发。通过 MCP cdp-bridge 从浏览器获取认证信息，调用后端 /base/* 接口完成操作。支持单条和批量操作，支持复合工作流（如创建用户→分配角色→分配菜单权限）。
---

# 系统管理综合技能

本技能覆盖系统管理模块的所有核心操作，通过浏览器 fetch 调用后端 API 实现。

完整 API 文档请参考 [api_reference.md](references/api_reference.md)。
复合工作流指南请参考 [workflow_guide.md](references/workflow_guide.md)。

---

## 基础设施

### 第零步：认证与 API 调用准备

**所有 API 请求必须通过浏览器 fetch 发起，禁止使用 curl（Windows 终端编码会导致中文乱码）。**

> **cdp-bridge 工具速查**（共 10 个，本技能常用前 3 个）：
> - `browser_get_tabs()`：列出所有标签页 + 当前活动 tab id。
> - `browser_execute_js(script, switch_tab_id="", no_monitor=false)`：`script` 必填；切 tab 用 **`switch_tab_id`**（不是 `tab_id`）；纯 API 调用不关心 DOM 变更，传 `no_monitor=true` 提速。
> - `browser_wait(condition_js, timeout=10, interval=0.5, switch_tab_id="")`：轮询等待 `condition_js` 为真，用于等 fetch 异步结果。
> - 其余：`browser_scan` / `browser_switch_tab`(用 `tab_id`) / `browser_focus_tab`(用 `tab_id`) / `browser_batch` / `browser_navigate` / `browser_screenshot` / `browser_save_image`。**无 `browser_cookies`**，读 cookie 一律用 `execute_js`。

**1. 定位标签页并获取 Token：**

- `mcp__cdp-bridge__browser_get_tabs` → 找到 `http://localhost:8080/` 标签页，记录 tab id。
- `mcp__cdp-bridge__browser_execute_js`（`switch_tab_id=<tab>`、`no_monitor=true`）读取 cookie 并缓存到页面全局：
```javascript
var c = document.cookie.split(';').reduce(function(a,x){var p=x.trim().split('=');a[p[0]]=p[1];return a;},{});
window.__authInfo = JSON.stringify({ tokenName: c.tokenName, tokenValue: c.tokenValue });
'ok';
```
> 读 cookie 是同步操作，`execute_js` 直接返回；`window.__authInfo` 仅供后续 fetch 复用，无需轮询等待。

**2. 调用 API 的三步范式（fetch 异步，`execute_js` 不会 await Promise）：**

- **a 发起**：`browser_execute_js`（`no_monitor=true`）执行 fetch，结果存入 `window.__xxx`：
```javascript
var tokenName = JSON.parse(window.__authInfo).tokenName;
var tokenValue = JSON.parse(window.__authInfo).tokenValue;
fetch('/base/{module}/{action}', {
  method: 'POST',  // 或 GET/PUT/DELETE
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify(data)  // GET 请求无 body
}).then(function(r){return r.json();}).then(function(d){ window.__apiResult = JSON.stringify(d); });
```
- **b 等待**：`mcp__cdp-bridge__browser_wait`（`condition_js="window.__apiResult !== undefined"`、`timeout=15`）。
- **c 读取**：`browser_execute_js`（`no_monitor=true`）返回 `window.__apiResult`；读完置 `window.__apiResult=undefined` 便于下次复用。

**如果 Token 获取失败**，提示用户确保浏览器已打开系统页面（localhost:8080）并已登录。

---

## 一、用户管理

### 1.1 查询用户列表

```javascript
var tokenName = JSON.parse(window.__authInfo).tokenName;
var tokenValue = JSON.parse(window.__authInfo).tokenValue;

fetch('/base/user/pageList', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    [tokenName]: tokenValue
  },
  body: JSON.stringify({
    currentPage: 1,
    pageSize: 100,
    account: '',     // 可选筛选
    realName: '',    // 可选筛选
    telephone: '',   // 可选筛选
    enableFlag: ''   // 可选: 1=启用, 2=禁用, 3=锁定
  })
}).then(r => r.json()).then(function(d) {
  window.__userList = JSON.stringify(d);
});
```

### 1.2 获取用户详情

```javascript
fetch('/base/user/getInfoById', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({ id: '用户ID' })
}).then(r => r.json()).then(function(d) {
  window.__userDetail = JSON.stringify(d);
});
```

### 1.3 创建用户

**前置准备** - 需要先获取组织树、岗位列表、角色列表：

```javascript
// 获取组织/部门树
fetch('/base/dept/treeLocal', {
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__deptTree = JSON.stringify(d);
});

// 获取岗位列表（按 orgId）
fetch('/base/post/listAll', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({ orgId: '组织ID' })
}).then(r => r.json()).then(function(d) {
  window.__postList = JSON.stringify(d);
});

// 获取角色列表（按 orgId）
fetch('/base/role/listAll', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({ orgId: '组织ID' })
}).then(r => r.json()).then(function(d) {
  window.__roleList = JSON.stringify(d);
});
```

**创建用户请求体：**

```javascript
fetch('/base/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    account: 'zhangsan',           // 必填, 最长20
    realName: '张三',              // 必填, 最长10
    telephone: '13800138000',      // 必填, 手机号格式
    email: 'zs@example.com',      // 可选, 邮箱格式
    description: '',               // 可选, 最长200
    sortNum: 99,                   // 默认99
    enableFlag: 1,                 // 1=启用, 2=禁用
    loginServerFlag: 0,            // 1=允许登录管理端, 0=不允许
    mainDept: {
      orgId: '组织ID',
      deptId: '部门ID',
      deptName: '部门名称',
      orgName: '组织名称',
      postId: '岗位ID',
      postName: '岗位名称'
    },
    roleIds: ['角色ID1', '角色ID2'],  // 角色ID数组
    gender: 1,                     // 1=男, 2=女, 3=未知
    workStatus: 1                  // 1=试用, 2=在职, 3=离职
  })
}).then(r => r.json()).then(function(d) {
  window.__userAddResult = JSON.stringify(d);
});
```

### 1.4 编辑用户

```javascript
fetch('/base/user/' + userId, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    id: userId,
    // 同创建用户的字段，加上 id
    account: 'zhangsan',
    realName: '张三',
    // ... 其他字段
  })
}).then(r => r.json()).then(function(d) {
  window.__userEditResult = JSON.stringify(d);
});
```

### 1.5 删除用户

```javascript
fetch('/base/user/' + userId, {
  method: 'DELETE',
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__userDeleteResult = JSON.stringify(d);
});
```

### 1.6 修改用户状态（启用/禁用/锁定）

```javascript
fetch('/base/user/changeStatus', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    id: '用户ID',
    enableFlag: 1  // 1=启用, 2=禁用, 3=锁定
  })
}).then(r => r.json()).then(function(d) {
  window.__userStatusResult = JSON.stringify(d);
});
```

### 1.7 重置用户密码

```javascript
fetch('/base/user/resetPassword/' + userId, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({ id: userId })
}).then(r => r.json()).then(function(d) {
  window.__resetPwdResult = JSON.stringify(d);
});
```

---

## 二、菜单管理

### 2.1 查询菜单树

```javascript
// 全量菜单树
fetch('/base/menu/treeList', {
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__menuTree = JSON.stringify(d);
});

// 按当前组织类型过滤
fetch('/base/menu/treeListByCurrentOrgType', {
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__menuTree = JSON.stringify(d);
});

// 按客户端类型过滤
fetch('/base/menu/treeListByClientType?clientType=0', {
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__menuTree = JSON.stringify(d);
});
```

### 2.2 获取菜单详情

```javascript
fetch('/base/menu/' + menuId, {
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__menuDetail = JSON.stringify(d);
});
```

### 2.3 创建菜单

**菜单类型说明：**

| menuType | 类型 | 说明 | 关键字段 |
|----------|------|------|----------|
| `'M'` | 目录 | 顶部导航容器 | fullName, parentId, icon |
| `'C'` | 菜单 | 实际页面路由 | fullName, path, parentId |
| `'A'` | 按钮 | 操作权限点 | fullName, perms, parentId |

**链接类型（仅 menuType='C' 时有效）：**

| linkType | 说明 | 字段要求 |
|----------|------|----------|
| `0` | 内部链接 | path 必填 |
| `1` | 嵌入外链 | path + linkUrl 必填 |
| `2` | 跳转外链 | linkUrl 必填 |

```javascript
fetch('/base/menu', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    parentId: '0',               // 父级菜单ID, '0' 为顶级
    menuType: 'C',               // M=目录, C=菜单, A=按钮
    fullName: '菜单名称',         // 必填, 最长50
    enCode: 'menuCode',          // 必填, 无中文, 可用拼音自动生成
    linkType: 0,                 // 0=内部, 1=嵌入外链, 2=跳转外链
    path: 'system/user',         // 路由路径
    linkUrl: '',                 // 外链URL
    perms: 'system:user:list',   // 权限标识
    sortNum: 99,                 // 排序
    icon: 'user',                // SVG图标标识
    visibleFlag: '1',            // '1'=显示, '0'=隐藏
    clientType: '0'              // '0'=管理端, '1'=手机端
  })
}).then(r => r.json()).then(function(d) {
  window.__menuAddResult = JSON.stringify(d);
});
```

### 2.4 编辑菜单

```javascript
fetch('/base/menu/' + menuId, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    id: menuId,
    // 同创建菜单字段
  })
}).then(r => r.json()).then(function(d) {
  window.__menuEditResult = JSON.stringify(d);
});
```

### 2.5 删除菜单

```javascript
fetch('/base/menu/' + ids, {
  method: 'DELETE',
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__menuDeleteResult = JSON.stringify(d);
});
```

**注意：ids 支持逗号分隔的批量删除，如 `'id1,id2,id3'`。删除目录会级联删除所有子菜单。**

### 2.6 修改菜单显示状态

```javascript
fetch('/base/menu/changeStatus', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    id: '菜单ID',
    visibleFlag: '0'  // '0'=隐藏, '1'=显示
  })
}).then(r => r.json()).then(function(d) {
  window.__menuStatusResult = JSON.stringify(d);
});
```

---

## 三、角色管理

### 3.1 查询角色列表

```javascript
// 分页查询
fetch('/base/role/pageList?currentPage=1&pageSize=100', {
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__roleList = JSON.stringify(d);
});

// 获取全部角色（按 orgId 筛选）
fetch('/base/role/listAll', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({ orgId: '组织ID' })
}).then(r => r.json()).then(function(d) {
  window.__roleAllList = JSON.stringify(d);
});

// 角色树
fetch('/base/role/tree', {
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__roleTree = JSON.stringify(d);
});
```

### 3.2 获取角色详情

```javascript
fetch('/base/role/' + roleId, {
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__roleDetail = JSON.stringify(d);
});
```

### 3.3 创建角色（含菜单权限分配）

```javascript
fetch('/base/role', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    fullName: '角色名称',         // 必填, 最长20
    enCode: 'roleCode',          // 必填, 无中文
    sortNum: 99,                 // 排序
    description: '',             // 可选, 最长200
    shareFlag: '0',              // '1'=跨单位共享, '0'=否（仅 sys_manager 可见）
    sysFlag: '0',                // '1'=系统内置, '0'=否（仅 sys_manager 可见）
    menuIds: [                   // 菜单权限列表
      { clientType: '0', menuId: '菜单ID1' },
      { clientType: '0', menuId: '菜单ID2' },
      { clientType: '1', menuId: '菜单ID3' }
    ]
  })
}).then(r => r.json()).then(function(d) {
  window.__roleAddResult = JSON.stringify(d);
});
```

### 3.4 编辑角色

```javascript
fetch('/base/role/' + roleId, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    id: roleId,
    // 同创建角色字段
  })
}).then(r => r.json()).then(function(d) {
  window.__roleEditResult = JSON.stringify(d);
});
```

### 3.5 删除角色

```javascript
fetch('/base/role/' + roleId, {
  method: 'DELETE',
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__roleDeleteResult = JSON.stringify(d);
});
```

### 3.6 查看/管理角色关联用户

```javascript
// 查询角色下的用户列表
fetch('/base/role/listUserByRoleId', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    roleId: '角色ID',
    currentPage: 1,
    pageSize: 100
  })
}).then(r => r.json()).then(function(d) {
  window.__roleUsers = JSON.stringify(d);
});

// 为角色关联用户
fetch('/base/role/saveUserRelation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    roleId: '角色ID',
    userIds: ['用户ID1', '用户ID2']
  })
}).then(r => r.json()).then(function(d) {
  window.__roleUserSave = JSON.stringify(d);
});

// 移除角色关联用户
fetch('/base/role/deleteUserRelation?userIds=用户ID1,用户ID2&roleId=角色ID', {
  method: 'DELETE',
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__roleUserDelete = JSON.stringify(d);
});
```

### 3.7 管理 角色-权限组 关联

```javascript
// 查询权限组树
fetch('/base/permission-group/tree', {
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__permGroupTree = JSON.stringify(d);
});

// 为角色分配权限组
fetch('/base/role/savePermsGroupRelation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    roleId: '角色ID',
    permissionGroupIds: ['权限组ID1', '权限组ID2']
  })
}).then(r => r.json()).then(function(d) {
  window.__permGroupSave = JSON.stringify(d);
});

// 移除角色的权限组
fetch('/base/role/deletePermsGroupRelation', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    roleId: '角色ID',
    permissionGroupIds: ['权限组ID1']
  })
}).then(r => r.json()).then(function(d) {
  window.__permGroupDelete = JSON.stringify(d);
});
```

---

## 四、字典管理

### 4.1 查询字典树

```javascript
fetch('/base/dictionary/listTree', {
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__dictTree = JSON.stringify(d);
});
```

### 4.2 查询字典列表（按父级）

```javascript
fetch('/base/dictionary/list?parentId=父级ID', {
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__dictList = JSON.stringify(d);
});

// 按业务编码查询
fetch('/base/dictionary/listByCode/' + bizCode, {
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__dictByCode = JSON.stringify(d);
});
```

### 4.3 创建字典项

**dictType 规则：parentId='0' 时为 'category'（分类），否则为 'detail'（明细）。**

```javascript
fetch('/base/dictionary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    parentId: '0',               // '0'=顶级分类
    fullName: '字典名称',         // 必填, 最长20
    dictValue: 'dict_code',      // 必填, 最长100, 无中文
    bizCode: 'BIZ_CODE',         // 必填, 最长100, 无中文
    dictType: 'category',        // 'category' 或 'detail'
    sortNum: 99,                 // 排序
    enableFlag: 1,               // 1=启用, 0=禁用
    description: ''              // 可选, 最长200
  })
}).then(r => r.json()).then(function(d) {
  window.__dictAddResult = JSON.stringify(d);
});
```

### 4.4 编辑字典项

```javascript
fetch('/base/dictionary/' + dictId, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    id: dictId,
    // 同创建字典字段
  })
}).then(r => r.json()).then(function(d) {
  window.__dictEditResult = JSON.stringify(d);
});
```

### 4.5 删除字典项

```javascript
fetch('/base/dictionary/' + dictCode, {
  method: 'DELETE',
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__dictDeleteResult = JSON.stringify(d);
});
```

---

## 五、岗位管理

### 5.1 查询岗位列表

```javascript
fetch('/base/post/list', {
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__postList = JSON.stringify(d);
});
```

### 5.2 获取岗位详情

```javascript
fetch('/base/post/' + postId, {
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__postDetail = JSON.stringify(d);
});
```

### 5.3 创建岗位

```javascript
fetch('/base/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    fullName: '岗位名称',         // 必填, 最长50
    bizCode: 'post_code',        // 必填, 最长25, 无中文
    sortNum: 99,                 // 排序
    enableFlag: 1,               // 1=启用, 0=禁用
    description: ''              // 可选, 最长200
  })
}).then(r => r.json()).then(function(d) {
  window.__postAddResult = JSON.stringify(d);
});
```

### 5.4 编辑岗位

```javascript
fetch('/base/post/' + postId, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    id: postId,
    // 同创建岗位字段
  })
}).then(r => r.json()).then(function(d) {
  window.__postEditResult = JSON.stringify(d);
});
```

### 5.5 删除岗位

```javascript
fetch('/base/post/' + postId, {
  method: 'DELETE',
  headers: { [tokenName]: tokenValue }
}).then(r => r.json()).then(function(d) {
  window.__postDeleteResult = JSON.stringify(d);
});
```

### 5.6 修改岗位状态

```javascript
fetch('/base/post/changeStatus', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    id: '岗位ID',
    enableFlag: 0  // 0=禁用, 1=启用
  })
}).then(r => r.json()).then(function(d) {
  window.__postStatusResult = JSON.stringify(d);
});
```

---

## 六、操作确认机制

**所有创建/编辑/删除操作在执行前，必须使用 `AskUserQuestion` 工具展示参数表供用户确认。**

确认格式示例：
```
即将执行以下操作：
| 字段 | 值 |
|------|------|
| 操作类型 | 创建用户 |
| 账号 | zhangsan |
| 姓名 | 张三 |
| 手机 | 13800138000 |
| 所属部门 | 技术部 |
| 角色 | 开发人员 |

请确认是否继续？
```

---

## 七、注意事项

1. **禁止使用 curl 调用 API** — Windows 终端编码会导致中文乱码，必须通过浏览器 fetch
2. **所有中文参数必须使用 `encodeURIComponent()` 编码**（当使用 form-urlencoded 时）或 JSON 序列化（当使用 application/json 时）
3. **后端可能有防重复提交机制** — 批量操作需逐个串行，间隔 ≥ 2.5 秒
4. **菜单权限分配格式** — `menuIds` 是 `[{ clientType, menuId }]` 数组，按客户端类型分组
5. **角色和岗位选项依赖组织** — `roleAllList` 和 `allListPost` 需要 `orgId` 参数
6. **字典类型自动判断** — `parentId='0'` → `dictType='category'`，否则 → `dictType='detail'`
7. **菜单类型** — `'M'`=目录, `'C'`=菜单, `'A'`=按钮（注意是字母，不是数字）
8. **客户端类型** — `'0'`=管理端, `'1'`=手机端
