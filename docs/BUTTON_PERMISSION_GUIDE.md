# 按钮权限对接指南

本文档说明系统按钮级权限控制机制，并列出各管理界面需要对接的具体按钮权限项，供开发参照实施。

---

## 一、权限机制说明

### 1.1 核心概念

系统按钮权限基于菜单树中的 `menuType='A'`（按钮类型）节点实现。用户登录后，后端返回菜单树，前端通过 `setMenuButton()` 函数遍历树结构，将所有 `menuType='A'` 且 `visibleFlag !== '0'` 的节点的 **`enCode`** 值收集到 Vuex store 的 `permissions` 数组中。

### 1.2 关键字段

| 字段 | 作用 | 说明 |
|------|------|------|
| `enCode` | 前端权限匹配标识 | `v-hasPermi` 指令传入的值必须与此字段完全一致 |
| `perms` | 后端权限标识 | 存储在菜单记录中，供后端校验使用 |

> **最佳实践**：`enCode` 和 `perms` 填写相同值，命名格式为 `模块_操作`（如 `system_user_add`）。

### 1.3 前端使用方式

**方式一：指令式（推荐）**
```html
<el-button v-hasPermi="['system_user_add']" @click="handleAdd">新增</el-button>
<el-button v-hasPermi="['system_user_edit']" type="text" @click="handleEdit(row)">编辑</el-button>
```

**方式二：编程式**
```javascript
// this.$auth 插件
if (this.$auth.hasPermi('system_user_add')) { /* 有权限 */ }

// 工具函数
import { checkPermi } from '@/utils/permission';
if (checkPermi(['system_user_add'])) { /* 有权限 */ }
```

### 1.4 权限数据流

```
菜单管理中添加 menuType='A' 的按钮权限（填写 enCode）
  → 角色管理中为角色勾选该按钮权限
    → 用户登录时，后端根据角色返回菜单树
      → 前端 setMenuButton() 收集 enCode 到 store.permissions
        → v-hasPermi 指令根据 permissions 数组控制按钮显隐
```

### 1.5 相关源文件

| 文件 | 作用 |
|------|------|
| `src/directive/permission/hasPermi.js` | `v-hasPermi` 自定义指令实现 |
| `src/plugins/auth.js` | `this.$auth` 编程式权限校验 |
| `src/utils/permission.js` | `checkPermi()` 函数式校验 |
| `src/store/modules/permission.js` | Vuex store，`setMenuButton()` 收集权限 |
| `src/store/getters.js` | `permissions` getter |

---

## 二、各界面按钮权限规划表

### 用户管理

| 按钮操作 | enCode | 位置 |
|---------|--------|------|
| 新增用户 | `system_user_add` | 操作区 |
| 批量删除 | `system_user_batchDel` | 操作区 |
| 导出 | `system_user_export` | 操作区 |
| 编辑 | `system_user_edit` | 行内 |
| 重置密码 | `system_user_resetPwd` | 行内 |
| 锁定/解锁 | `system_user_lock` | 行内 |

### 菜单管理

| 按钮操作 | enCode | 位置 |
|---------|--------|------|
| 新增菜单 | `system_menu_add` | 操作区 |
| 批量删除 | `system_menu_batchDel` | 操作区 |
| 新增下级 | `system_menu_addChild` | 行内 |
| 编辑 | `system_menu_edit` | 行内 |
| 删除 | `system_menu_del` | 行内 |

### 角色管理

| 按钮操作 | enCode | 位置 |
|---------|--------|------|
| 新增角色 | `system_role_add` | 操作区 |
| 关联用户 | `system_role_bindUser` | 行内 |
| 编辑 | `system_role_edit` | 行内 |
| 删除 | `system_role_del` | 行内 |

### 字典管理

| 按钮操作 | enCode | 位置 |
|---------|--------|------|
| 新增字典 | `system_dict_add` | 操作区 |
| 编辑 | `system_dict_edit` | 行内 |
| 删除 | `system_dict_del` | 行内 |

### 岗位管理

| 按钮操作 | enCode | 位置 |
|---------|--------|------|
| 新增岗位 | `system_post_add` | 操作区 |
| 批量删除 | `system_post_batchDel` | 操作区 |
| 关联成员 | `system_post_bindUser` | 行内 |
| 编辑 | `system_post_edit` | 行内 |
| 删除 | `system_post_del` | 行内 |

### 部门管理

| 按钮操作 | enCode | 位置 |
|---------|--------|------|
| 新增部门 | `system_dept_add` | 操作区 |
| 批量删除 | `system_dept_batchDel` | 操作区 |
| 编辑 | `system_dept_edit` | 行内 |
| 删除 | `system_dept_del` | 行内 |

### 租户管理

| 按钮操作 | enCode | 位置 |
|---------|--------|------|
| 新增租户 | `system_org_add` | 操作区 |
| 编辑 | `system_org_edit` | 行内 |
| 续期 | `system_org_renew` | 行内 |
| 授权 | `system_org_grant` | 行内 |
| 新增下级 | `system_org_addChild` | 行内 |

### 部门类型管理

| 按钮操作 | enCode | 位置 |
|---------|--------|------|
| 新增 | `system_deptType_add` | 操作区 |
| 菜单授权 | `system_deptType_menuAuth` | 行内 |
| 编辑 | `system_deptType_edit` | 行内 |
| 删除 | `system_deptType_del` | 行内 |

---

## 三、对接步骤

每个页面的按钮权限对接分三步：

### 步骤 1：在菜单管理中注册按钮权限

在对应菜单（menuType='C'）下添加按钮权限项：

```json
{
    "parentId": "所属菜单ID",
    "menuType": "A",
    "fullName": "新增用户",
    "enCode": "system_user_add",
    "perms": "system_user_add",
    "sortNum": 1,
    "visibleFlag": "1",
    "clientType": "0"
}
```

### 步骤 2：在角色管理中分配按钮权限

编辑目标角色 → 勾选对应的按钮权限节点 → 保存。

### 步骤 3：在页面代码中添加权限指令

```html
<!-- 操作区按钮 -->
<el-button v-hasPermi="['system_user_add']" type="primary" @click="handleAdd">新增</el-button>
<el-button v-hasPermi="['system_user_batchDel']" @click="handleBatchDel">批量删除</el-button>

<!-- 行内按钮 -->
<el-button v-hasPermi="['system_user_edit']" type="text" @click="handleEdit(row)">编辑</el-button>
<el-button v-hasPermi="['system_user_resetPwd']" type="text" @click="handleResetPwd(row)">重置密码</el-button>
```

---

## 四、源文件路径

系统管理界面组件源码位于 `F:\workCode\zc-standar-fontend\src\views\system\`：

| 页面 | 源文件 |
|------|--------|
| 用户管理 | `system/user/index.vue` |
| 菜单管理 | `system/menu/index.vue` |
| 角色管理 | `system/role/index.vue` |
| 字典管理 | `system/dict/index.vue` |
| 岗位管理 | `system/postManagement/index.vue` |
| 部门管理 | `system/department/index.vue` |
| 租户管理 | `system/organization/index.vue` |
| 部门类型 | `system/departmentType/index.vue` |
