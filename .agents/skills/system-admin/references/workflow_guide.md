# 系统管理复合工作流指南

本文档描述常见系统管理操作的完整工作流程，供 Agent 按步骤自动执行。

---

## 工作流 1：新用户入职全流程

**场景**：为新员工创建账号、分配部门/岗位/角色

### 执行步骤

```
步骤 1: 获取认证信息（参见 SKILL.md 第零步）

步骤 2: 查询组织架构
  → GET /base/dept/treeLocal
  → 从树中找到目标部门，记录 orgId, deptId, deptName, orgName

步骤 3: 查询该组织下的岗位
  → POST /base/post/listAll  { orgId }
  → 找到目标岗位，记录 postId, postName

步骤 4: 查询该组织下的角色
  → POST /base/role/listAll  { orgId }
  → 找到目标角色，记录 roleIds

步骤 5: 展示完整参数表供用户确认
  | 字段 | 值 |
  |------|------|
  | 账号 | zhangsan |
  | 姓名 | 张三 |
  | 手机 | 13800138000 |
  | 组织 | XX公司 |
  | 部门 | 技术部 |
  | 岗位 | 前端开发 |
  | 角色 | 开发人员 |

步骤 6: 创建用户
  → POST /base/user
  → 记录新用户 ID

步骤 7: 反馈结果
  → 成功：报告用户ID和初始信息
  → 失败：报告具体错误原因
```

### 关键注意事项
- `mainDept` 对象必须包含 `orgId`, `deptId`, `postId` 等完整信息
- `roleIds` 是字符串数组，直接传角色ID列表
- 手机号有格式校验，必须匹配 `/^1[3-9]\d{9}$/`

---

## 工作流 2：新模块/功能的菜单权限配置

**场景**：为新增的系统功能配置完整的菜单结构（目录 + 菜单 + 按钮权限）

### 执行步骤

```
步骤 1: 获取认证信息

步骤 2: 查询现有菜单树
  → GET /base/menu/treeList
  → 找到父级菜单位置，确定 parentId 和 menuLevel

步骤 3: 按层级顺序创建菜单（串行，每次间隔 ≥ 2.5 秒）

  3a. 创建目录（menuType='M'）
    → POST /base/menu
    → 记录新目录 ID

  3b. 创建菜单（menuType='C'）
    → POST /base/menu  { parentId: 目录ID }
    → 记录新菜单 ID

  3c. 创建按钮权限（menuType='A'）
    → POST /base/menu  { parentId: 菜单ID, menuType: 'A', enCode: '模块_操作', perms: '模块_操作' }

  注意：如果批量添加，需要先查询获取新建目录的ID，再创建子菜单

步骤 4: 验证菜单结构
  → GET /base/menu/treeList
  → 确认新菜单已正确创建

步骤 5: 反馈结果
```

### 按钮权限命名规范
- 格式：`模块_操作`，如 `system_user_add`、`system_menu_edit`、`system_dict_del`
- 常见操作后缀：`add`（新增）、`edit`（编辑）、`del`（删除）、`export`（导出）、`batchDel`（批量删除）、`resetPwd`（重置密码）
- **`enCode` 是前端 `v-hasPermi` 指令实际匹配的值**，后端将 `menuType='A'` 节点的 `enCode` 收集到用户权限列表
- `perms` 建议与 `enCode` 保持一致
- 前端使用：`v-hasPermi="['system_user_add']"`

### enCode 与 perms 的关系
| 字段 | 作用 | 使用场景 |
|------|------|----------|
| `enCode` | 权限匹配的实际标识 | 前端 `v-hasPermi` 传入此值，后端收集此值到 `permissions` 数组 |
| `perms` | 后端权限标识 | 存储在菜单记录中，供后端权限校验使用 |

> **最佳实践**：`enCode` 和 `perms` 填写相同的值，以 `模块_操作` 格式命名。

### 批量创建示例脚本

```javascript
var tokenName = JSON.parse(window.__authInfo).tokenName;
var tokenValue = JSON.parse(window.__authInfo).tokenValue;

// 第一轮：创建目录
fetch('/base/menu', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
  body: JSON.stringify({
    parentId: '0',
    menuType: 'M',
    fullName: '项目管理',
    enCode: 'project',
    icon: 'project',
    visibleFlag: '1',
    clientType: '0',
    sortNum: 10
  })
}).then(r => r.json()).then(function(d) {
  window.__dirId = d.data ? d.data.id || d.data : null;
  window.__menuCreateStep1 = JSON.stringify(d);
});

// 等待获取目录ID后，第二轮：创建菜单
// POST /base/menu { parentId: 目录ID, menuType: 'C', ... }

// 第三轮：创建按钮权限
// POST /base/menu { parentId: 菜单ID, menuType: 'A', perms: 'xxx', ... }
```

---

## 工作流 3：创建角色并分配菜单权限

**场景**：创建新的系统角色，并为其分配特定的菜单访问权限

### 执行步骤

```
步骤 1: 获取认证信息

步骤 2: 查询菜单树
  → GET /base/menu/treeListByCurrentOrgType
  → 记录要分配的菜单ID列表

步骤 3: 展示参数确认
  | 字段 | 值 |
  |------|------|
  | 角色名称 | 部门管理员 |
  | 角色编码 | dept_admin |
  | 管理端菜单 | 系统管理, 用户管理, ... |
  | 手机端菜单 | （如需）|

步骤 4: 创建角色
  → POST /base/role
  → body.menuIds = [
      { clientType: '0', menuId: '菜单ID1' },
      { clientType: '0', menuId: '菜单ID2' },
      ...
    ]

步骤 5: 记录角色ID

步骤 6: （可选）分配权限组
  → POST /base/role/savePermsGroupRelation
  → { roleId, permissionGroupIds: [...] }
```

### menuIds 格式说明
- 必须是 `[{ clientType, menuId }]` 数组格式
- 同一菜单可以同时分配给管理端和手机端（两个不同 clientType 的条目）
- `clientType`: `'0'`=管理端, `'1'`=手机端

---

## 工作流 4：为现有角色添加/修改菜单权限

**场景**：修改已有角色的菜单权限配置

### 执行步骤

```
步骤 1: 获取认证信息

步骤 2: 查询角色列表
  → GET /base/role/pageList
  → 找到目标角色，记录 roleId

步骤 3: 查询角色详情（获取当前权限）
  → GET /base/role/{roleId}

步骤 4: 查询菜单树
  → GET /base/menu/treeListByCurrentOrgType

步骤 5: 对比现有权限和用户需求
  → 展示当前已分配的菜单列表
  → 展示待新增/移除的菜单列表
  → 等待用户确认

步骤 6: 更新角色
  → PUT /base/role/{roleId}
  → body.menuIds = 新的完整权限列表（全量替换，非增量）
```

### 注意事项
- 编辑角色时 `menuIds` 是**全量替换**，不是增量追加
- 必须发送该角色应拥有的所有菜单权限，遗漏的权限将被移除
- 编辑前应先获取当前角色的完整权限列表，合并后再提交

---

## 工作流 5：为用户分配/变更角色

**场景**：修改已有用户的角色配置

### 执行步骤

```
步骤 1: 获取认证信息

步骤 2: 查询用户
  → POST /base/user/pageList { realName: '张三' }
  → 记录 userId

步骤 3: 查询用户详情
  → POST /base/user/getInfoById { id: userId }
  → 记录当前 roleIds

步骤 4: 查询可用角色
  → POST /base/role/listAll { orgId: 用户所属组织ID }

步骤 5: 展示变更对比
  | 字段 | 当前值 | 新值 |
  |------|--------|------|
  | 角色 | 开发人员 | 开发人员, 项目经理 |

步骤 6: 编辑用户
  → PUT /base/user/{userId}
  → 提交完整的用户数据（包括新的 roleIds）
```

---

## 工作流 6：批量创建字典项

**场景**：为某个功能模块创建一组配置字典

### 执行步骤

```
步骤 1: 获取认证信息

步骤 2: 查询字典树（确认父级位置）
  → GET /base/dictionary/listTree

步骤 3: 串行创建字典项（每次间隔 ≥ 2.5 秒）
  → 如果是顶级分类：parentId='0', dictType='category'
  → 如果是子级明细：parentId=父级ID, dictType='detail'

步骤 4: 反馈结果
```

### 批量创建脚本

```javascript
var tokenName = JSON.parse(window.__authInfo).tokenName;
var tokenValue = JSON.parse(window.__authInfo).tokenValue;

var items = [
  { fullName: '启用', dictValue: '1', bizCode: 'status_1', parentId: '父级ID', dictType: 'detail', sortNum: 1 },
  { fullName: '禁用', dictValue: '0', bizCode: 'status_0', parentId: '父级ID', dictType: 'detail', sortNum: 2 }
];

function addOne(index) {
  if (index >= items.length) {
    window.__batchDictResult = JSON.stringify({ count: window.__batchResults.length, results: window.__batchResults });
    return;
  }
  var item = items[index];
  fetch('/base/dictionary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', [tokenName]: tokenValue },
    body: JSON.stringify(item)
  }).then(r => r.json()).then(function(d) {
    window.__batchResults.push({ index: index, name: item.fullName, result: d });
    setTimeout(function() { addOne(index + 1); }, 2500);
  });
}

window.__batchResults = [];
addOne(0);
'started'
```

---

## 工作流 7：完整的模块上线流程

**场景**：新模块从零到上线的完整配置

### 执行步骤

```
1. 创建菜单结构（目录 → 菜单 → 按钮权限）
   → 参见工作流 2

2. 创建/更新角色并分配菜单权限
   → 参见工作流 3

3. 创建必要的字典数据
   → 参见工作流 6

4. 创建岗位（如需要）
   → POST /base/post

5. 创建用户并分配角色
   → 参见工作流 1

6. 验证
   → 查询菜单树确认结构
   → 查询角色权限确认分配
   → 查询用户信息确认角色绑定
```

---

## 通用错误处理

| 错误码/信息 | 原因 | 处理方式 |
|-------------|------|----------|
| `code: 70004` | 会话过期 | 提示用户重新登录 |
| `code: 500` | 服务器内部错误 | 检查参数格式，重试 |
| `code: 10001` | 参数校验失败 | 检查必填字段和格式 |
| 重复提交 | 后端防重机制 | 等待 ≥ 3 秒后重试 |
| 编码重复 | enCode/bizCode 已存在 | 更换唯一编码 |
| 手机号已存在 | 电话号码被占用 | 提示用户或使用关联用户功能 |
