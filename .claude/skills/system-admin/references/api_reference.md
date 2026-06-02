# 系统管理 API 接口完整参考

## 基础配置

- **前端地址**: `http://localhost:8080`
- **API 代理**: 前端 devServer 代理 `/base/*` 请求到后端
- **认证方式**: Cookie 中存储 `tokenName`（请求头名称）和 `tokenValue`（请求头值）
- **请求头**: `headers[tokenName] = tokenValue`
- **Content-Type**: `application/json`（默认）
- **Token 获取**: 从浏览器 `document.cookie` 解析 `tokenName` 和 `tokenValue`

---

## 一、用户管理 API

### 1.1 创建用户

- **端点**: `POST /base/user`
- **Content-Type**: `application/json`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `account` | string | 是 | 账号, 最长20 |
| `realName` | string | 是 | 姓名, 最长10 |
| `telephone` | string | 是 | 手机号, 格式 `/^1[3-9]\d{9}$/` |
| `email` | string | 否 | 邮箱 |
| `description` | string | 否 | 备注, 最长200 |
| `sortNum` | number | 否 | 排序, 默认99, 范围0.01-999.99 |
| `enableFlag` | number | 否 | 状态: 1=启用, 2=禁用, 3=锁定 |
| `loginServerFlag` | number | 否 | 登录管理端: 1=允许, 0=不允许 |
| `loginAppFlag` | number | 否 | 登录APP: 1=允许, 0=不允许 |
| `gender` | number | 否 | 性别: 1=男, 2=女, 3=未知 |
| `workStatus` | number | 否 | 工作状态: 1=试用, 2=在职, 3=离职 |
| `sourceType` | number | 否 | 来源: 1=内部, 2=外部 |
| `mainDept` | object | 是 | 主部门信息（见下） |
| `roleIds` | array | 否 | 角色ID数组 |
| `postIds` | array | 否 | 岗位ID数组 |
| `gradeIds` | array | 否 | 职级ID数组 |
| `managerUid` | string | 否 | 直属上级ID |

**mainDept 对象结构：**

| 字段 | 说明 |
|------|------|
| `orgId` | 组织ID（必填） |
| `deptId` | 部门ID（必填） |
| `deptIdModel` | 部门模型ID |
| `deptName` | 部门名称 |
| `orgName` | 组织名称 |
| `postId` | 岗位ID |
| `postName` | 岗位名称 |

### 1.2 编辑用户

- **端点**: `PUT /base/user/{id}`
- **请求体**: 同创建用户，加上 `id` 字段

### 1.3 删除用户

- **端点**: `DELETE /base/user/{id}`
- **支持批量**: 逗号分隔ID

### 1.4 用户列表（分页）

- **端点**: `POST /base/user/pageList`
- **请求体**: `{ currentPage, pageSize, account?, realName?, telephone?, enableFlag? }`

### 1.5 用户详情

- **端点**: `POST /base/user/getInfoById`
- **请求体**: `{ id: '用户ID' }`

### 1.6 修改用户状态

- **端点**: `POST /base/user/changeStatus`
- **请求体**: `{ id, enableFlag }`

### 1.7 重置密码

- **端点**: `POST /base/user/resetPassword/{id}`
- **请求体**: `{ id: '用户ID' }`

### 1.8 修改密码

- **端点**: `POST /base/user/changePassword`
- **请求体**: `{ oldPassword, newPassword }`

### 1.9 导出用户

- **端点**: `POST /base/user/export`
- **响应**: Blob (Excel文件)

### 1.10 获取全部用户列表

- **端点**: `POST /base/user/list`
- **请求体**: `{ keyword? }`

### 1.11 按手机号查询用户

- **端点**: `POST /base/user/getInfoByTel`
- **请求体**: `{ telephone }`

---

## 二、菜单管理 API

### 2.1 菜单树（全量）

- **端点**: `GET /base/menu/treeList`

### 2.2 菜单树（按当前组织类型）

- **端点**: `GET /base/menu/treeListByCurrentOrgType`

### 2.3 菜单树（按客户端类型）

- **端点**: `GET /base/menu/treeListByClientType?clientType=0`
- **参数**: `clientType` - `'0'`=管理端, `'1'`=手机端

### 2.4 菜单详情

- **端点**: `GET /base/menu/{id}`

### 2.5 创建菜单

- **端点**: `POST /base/menu`
- **Content-Type**: `application/json`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `parentId` | string | 是 | 父级菜单ID, `'0'` 为顶级 |
| `menuType` | string | 是 | `'M'`=目录, `'C'`=菜单, `'A'`=按钮 |
| `fullName` | string | 是 | 菜单名称, 最长50 |
| `enCode` | string | 是 | 编码, 最长50, 无中文。**按钮权限(menuType='A')时，此值是前端 `v-hasPermi` 指令实际匹配的标识**，建议格式 `模块_操作`（如 `system_user_add`） |
| `linkType` | number | 条件 | 0=内部, 1=嵌入外链, 2=跳转外链（仅 menuType='C'） |
| `path` | string | 条件 | 路由路径（内部链接/嵌入外链时必填） |
| `linkUrl` | string | 条件 | 外链URL（外链时必填） |
| `perms` | string | 否 | 权限标识, 最长200, 无中文。建议与 `enCode` 保持一致 |
| `sortNum` | number | 否 | 排序, 默认99 |
| `icon` | string | 否 | 图标标识 |
| `visibleFlag` | string | 否 | `'1'`=显示, `'0'`=隐藏 |
| `clientType` | string | 是 | `'0'`=管理端, `'1'`=手机端 |

**条件字段可见性：**

| menuType | linkType | 显示字段 |
|----------|----------|----------|
| `M`（目录） | - | fullName, parentId, enCode, sortNum, icon, visibleFlag, clientType |
| `C`（菜单） + linkType=0 | - | + path, perms |
| `C`（菜单） + linkType=1 | - | + path, linkUrl, perms |
| `C`（菜单） + linkType=2 | - | + linkUrl, perms（隐藏 path） |
| `A`（按钮） | - | fullName, parentId, enCode, perms, sortNum, visibleFlag, clientType |

### 2.6 编辑菜单

- **端点**: `PUT /base/menu/{id}`
- **请求体**: 同创建菜单，加上 `id` 字段

### 2.7 删除菜单

- **端点**: `DELETE /base/menu/{ids}`
- **支持批量**: 逗号分隔ID
- **注意**: 删除目录会级联删除所有子菜单

### 2.8 修改菜单状态

- **端点**: `POST /base/menu/changeStatus`
- **请求体**: `{ id, visibleFlag }`

### 2.9 菜单排序

- **端点**: `POST /base/group/quickSort`
- **请求体**: `{ id, sortNum }`（或排序数组）

---

## 三、角色管理 API

### 3.1 角色列表（分页）

- **端点**: `GET /base/role/pageList?currentPage=1&pageSize=100&keyword=`

### 3.2 全部角色列表

- **端点**: `POST /base/role/listAll`
- **请求体**: `{ orgId? }`

### 3.3 角色树

- **端点**: `GET /base/role/tree`

### 3.4 角色详情

- **端点**: `GET /base/role/{roleId}`

### 3.5 创建角色

- **端点**: `POST /base/role`
- **Content-Type**: `application/json`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fullName` | string | 是 | 角色名称, 最长20 |
| `enCode` | string | 是 | 角色编码, 最长20, 无中文 |
| `menuIds` | array | 是 | 菜单权限: `[{ clientType, menuId }]` |
| `sortNum` | number | 否 | 排序, 默认99 |
| `description` | string | 否 | 说明, 最长200 |
| `shareFlag` | string | 条件 | `'1'`=跨单位共享, `'0'`=否（仅 sys_manager） |
| `sysFlag` | string | 条件 | `'1'`=系统内置, `'0'`=否（仅 sys_manager） |

### 3.6 编辑角色

- **端点**: `PUT /base/role/{id}`
- **请求体**: 同创建角色，加上 `id` 字段

### 3.7 删除角色

- **端点**: `DELETE /base/role/{roleId}`

### 3.8 角色-用户关联

| 操作 | 方法 | 端点 | 请求体 |
|------|------|------|--------|
| 查询角色用户 | POST | `/base/role/listUserByRoleId` | `{ roleId, currentPage, pageSize }` |
| 添加用户关联 | POST | `/base/role/saveUserRelation` | `{ roleId, userIds: [] }` |
| 删除用户关联 | DELETE | `/base/role/deleteUserRelation` | Query: `userIds=...&roleId=...` |

### 3.9 角色-权限组关联

| 操作 | 方法 | 端点 | 请求体 |
|------|------|------|--------|
| 添加权限组关联 | POST | `/base/role/savePermsGroupRelation` | `{ roleId, permissionGroupIds: [] }` |
| 删除权限组关联 | DELETE | `/base/role/deletePermsGroupRelation` | `{ roleId, permissionGroupIds: [] }` |

### 3.10 角色排序

- **端点**: `POST /base/role/quickSort`
- **请求体**: 排序数据

---

## 四、字典管理 API

### 4.1 字典树

- **端点**: `GET /base/dictionary/listTree`

### 4.2 字典列表（按父级）

- **端点**: `GET /base/dictionary/list?parentId=父级ID`

### 4.3 字典详情

- **端点**: `GET /base/dictionary/{dictCode}`

### 4.4 按业务编码查询

- **端点**: `GET /base/dictionary/listByCode/{bizCode}` （列表）
- **端点**: `GET /base/dictionary/listTreeByCode/{bizCode}` （树形）
- **端点**: `GET /base/dictionary/list/category/{dictCode}` （按分类）

### 4.5 创建字典项

- **端点**: `POST /base/dictionary`
- **Content-Type**: `application/json`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `parentId` | string | 是 | 父级ID, `'0'` 为顶级 |
| `fullName` | string | 是 | 名称, 最长20 |
| `dictValue` | string | 是 | 编码值, 最长100, 无中文 |
| `bizCode` | string | 是 | 业务编码, 最长100, 无中文 |
| `dictType` | string | 是 | `'category'`（顶级）/ `'detail'`（子级） |
| `sortNum` | number | 否 | 排序, 默认99 |
| `enableFlag` | number | 否 | 1=启用, 0=禁用 |
| `description` | string | 否 | 说明, 最长200 |

### 4.6 编辑字典项

- **端点**: `PUT /base/dictionary/{id}`
- **请求体**: 同创建，加上 `id` 字段

### 4.7 删除字典项

- **端点**: `DELETE /base/dictionary/{dictCode}`

### 4.8 字典分类操作

| 操作 | 方法 | 端点 |
|------|------|------|
| 获取分类 | GET | `/base/dictionary-category/{dictId}` |
| 创建分类 | POST | `/base/dictionary-category` |
| 编辑分类 | PUT | `/base/dictionary-category/{id}` |
| 删除分类 | DELETE | `/base/dictionary-category/{dictId}` |

---

## 五、岗位管理 API

### 5.1 岗位列表

- **端点**: `GET /base/post/list`

### 5.2 岗位详情

- **端点**: `GET /base/post/{id}`

### 5.3 创建岗位

- **端点**: `POST /base/post`
- **Content-Type**: `application/json`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fullName` | string | 是 | 岗位名称, 最长50 |
| `bizCode` | string | 是 | 岗位编码, 最长25, 无中文 |
| `sortNum` | number | 否 | 排序, 默认99 |
| `enableFlag` | number | 否 | 1=启用, 0=禁用 |
| `description` | string | 否 | 说明, 最长200 |

### 5.4 编辑岗位

- **端点**: `PUT /base/post/{id}`
- **请求体**: 同创建，加上 `id` 字段

### 5.5 删除岗位

- **端点**: `DELETE /base/post/{id}`

### 5.6 修改岗位状态

- **端点**: `POST /base/post/changeStatus`
- **请求体**: `{ id, enableFlag }`

### 5.7 查看岗位关联用户

- **端点**: `POST /base/post/listUserByPost`
- **请求体**: `{ postId, currentPage, pageSize }`

### 5.8 按组织查询岗位树

- **端点**: `GET /base/post/listPostTreeByOrgId/{orgId}`

### 5.9 岗位排序

- **端点**: `PUT /base/post/quickSort`

---

## 六、部门/组织 API（辅助）

### 6.1 部门树

- **端点**: `GET /base/dept/treeLocal`

### 6.2 组织树

- **端点**: `GET /base/organization/tree/org`

### 6.3 部门详情

- **端点**: `GET /base/dept/{id}`

### 6.4 创建部门

- **端点**: `POST /base/dept`
- **关键字段**: `parentId, fullName, shortName, bizCode, deptTypeId, sortNum, enableFlag, managerUid, leaderUname, telephone, email, description, orgId`

### 6.5 部门类型列表

- **端点**: `POST /base/depttype/listAll`

---

## 七、权限组 API

### 7.1 权限组树

- **端点**: `GET /base/permission-group/tree`

### 7.2 权限组列表（分页）

- **端点**: `GET /base/permission-group/pageList?currentPage=1&pageSize=100`

### 7.3 创建权限组

- **端点**: `POST /base/permission-group`

### 7.4 编辑权限组

- **端点**: `PUT /base/permission-group/{id}`

### 7.5 删除权限组

- **端点**: `DELETE /base/permission-group/{id}`

### 7.6 权限组-菜单关联

| 操作 | 方法 | 端点 |
|------|------|------|
| 查询关联菜单 | GET | `/base/permission-group/getMenuRelation` |
| 分配菜单资源 | POST | `/base/permission-group/saveMenuRelation` |

### 7.7 权限组-角色关联

| 操作 | 方法 | 端点 |
|------|------|------|
| 查询关联角色 | GET | `/base/permission-group/getRoleRelation` |
| 分配角色资源 | POST | `/base/permission-group/saveRoleRelation` |
| 删除角色关联 | DELETE | `/base/permission-group/deleteRoleRelation` |

---

## 八、通用枚举值参考

### 用户状态 (enableFlag)
| 值 | 说明 |
|----|------|
| 1 | 启用 |
| 2 | 禁用 |
| 3 | 锁定 |

### 工作状态 (workStatus)
| 值 | 说明 |
|----|------|
| 1 | 试用期 |
| 2 | 在职 |
| 3 | 离职 |

### 性别 (gender)
| 值 | 说明 |
|----|------|
| 1 | 男 |
| 2 | 女 |
| 3 | 未知 |

### 菜单类型 (menuType)
| 值 | 说明 |
|----|------|
| `M` | 目录 |
| `C` | 菜单 |
| `A` | 按钮 |

### 客户端类型 (clientType)
| 值 | 说明 |
|----|------|
| `0` | 管理端 |
| `1` | 手机端 |

### 菜单状态 (visibleFlag)
| 值 | 说明 |
|----|------|
| `1` | 显示 |
| `0` | 隐藏 |

### 链接类型 (linkType)
| 值 | 说明 |
|----|------|
| 0 | 内部链接 |
| 1 | 嵌入外链 |
| 2 | 跳转外链 |

### 启用/禁用 (enableFlag)
| 值 | 说明 |
|----|------|
| 1 | 启用 |
| 0 | 禁用 |

### 用户来源 (sourceType)
| 值 | 说明 |
|----|------|
| 1 | 内部 |
| 2 | 外部 |
