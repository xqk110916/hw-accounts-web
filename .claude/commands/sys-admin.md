---
description: '系统管理综合操作。支持用户/菜单/角色/字典/岗位的 CRUD 和权限分配等操作。'
allowed-tools: Bash, Read, Glob, Grep, Agent, AskUserQuestion
argument-hint: <自然语言描述要执行的系统管理操作，如: 创建用户张三并分配开发人员角色>
---

# 系统管理命令

用户要求执行系统管理操作：**$ARGUMENTS**

请按照 [system-admin 技能](../skills/system-admin/SKILL.md) 中定义的流程执行。

## 核心规则

**禁止使用 curl 调用 API，Windows 终端编码会导致中文乱码。所有 API 请求必须通过浏览器 fetch 发起。**

## 操作识别

根据 "$ARGUMENTS" 识别操作类型：

| 关键词 | 操作类型 | 涉及模块 |
|--------|----------|----------|
| 添加用户/创建用户/新增用户 | 用户管理 | user |
| 修改用户/编辑用户/分配角色 | 用户管理 | user + role |
| 添加菜单/创建菜单/新增菜单 | 菜单管理 | menu |
| 添加目录/创建目录 | 菜单管理 | menu (menuType='M') |
| 添加按钮/按钮权限/权限标识 | 菜单管理 | menu (menuType='A') |
| 添加角色/创建角色/分配权限 | 角色管理 | role + menu |
| 添加字典/创建字典/字典项 | 字典管理 | dictionary |
| 添加岗位/创建岗位 | 岗位管理 | post |
| 重置密码 | 用户管理 | user (resetPassword) |
| 禁用/启用/锁定 | 状态管理 | user/post/menu |

## 执行流程

### 1. 认证准备

使用 MCP cdp-bridge 工具：
1. `mcp__cdp-bridge__browser_get_tabs` → 找到 `localhost:8080` 标签页
2. `mcp__cdp-bridge__browser_execute_js` → 从 cookie 获取 tokenName 和 tokenValue

### 2. 查询现有数据

根据操作类型查询必要的参考数据：
- 创建用户前 → 查询部门树、岗位列表、角色列表
- 创建菜单前 → 查询现有菜单树
- 创建角色前 → 查询菜单树（用于权限选择）
- 创建字典前 → 查询字典树

### 3. 参数确认

使用 `AskUserQuestion` 展示完整参数表。**必须等待用户确认后才执行写操作。**

### 4. 执行操作

通过浏览器 fetch 调用对应 API。批量操作必须串行，间隔 ≥ 2.5 秒。

### 5. 反馈结果

报告操作成功/失败，包含关键 ID 信息。

## 复合工作流

当用户描述包含多个步骤时（如 "创建用户并分配角色和菜单权限"），参考 [workflow_guide.md](../skills/system-admin/references/workflow_guide.md) 按顺序执行。

完整 API 文档参考 [api_reference.md](../skills/system-admin/references/api_reference.md)。
