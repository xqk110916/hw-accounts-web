---
name: 菜单管理技能 (Menu Management Skill)
description: 用于在项目中新增页面或功能后，自动调用后端接口完成菜单的同步注册和配置。
---

# 菜单管理技能 (Menu Management Skill)

本技能旨在规范和自动化后台菜单的维护流程。当你作为 Agent 在 `src/views/` 目录下新增、移动或删除业务页面时，**必须**同步维护后台菜单。

## 适用优先级 (Agent 注意)
> [!IMPORTANT]
> 这是一个 **强制性技能**。每当你执行以下操作时，必须首先通过 `view_file` 阅读并执行本技能：
> 1. 在 `src/views/` 下创建了新的文件夹（对应菜单模块 `M`）。
> 2. 在 `src/views/` 下创建了新的 `.vue` 文件（对应菜单界面 `C`）。
> 3. 修改了已有页面的访问路径或功能名称。

## 环境信息
- **API 基地址**: `http://10.10.41.179:40000/api` (参考 `.env.development`)
- **客户端类型 (clientType)**: `0`

## 操作手册

### 第一步：查询当前结构
在进行任何修改前，先获取现有的菜单树以确定 `parentId`：
- **GET** `/base/menu/treeListByClientType?clientType=0`

### 第二步：获取鉴权 Token (自动获取)
由于接口需要 `Authorization` 请求头，Agent **可以且应当**尝试自动获取 Token：
1. 使用 `browser_subagent` 工具访问 `http://localhost:8080/`。
2. 在浏览器控制台执行 JS 脚本读取 `tokenName` 和 `tokenValue` Cookies。
3. 如果本地未登录，请告知用户并请求提供 Token。

### 第三步：确定新增逻辑
1. **新增目录 (M)**：
   - 如果是一个全新的模块（如 `src/views/newItem`），先创建类型为 `M` 的菜单。
   - `parentId` 通常为 `0` 或对应的父级模块 ID。
2. **新增菜单 (C)**：
   - 如果是在已有目录下新增页面，使用该目录的 `id` 作为 `parentId`。
   - `path` 应与 `src/views/` 下的路径对应。
   - `perms` 和 `enCode` 必须唯一。

### 第四步：调用接口 (Curl/Request)
获取 Token 并确认逻辑后，使用 `run_command` 发起同步请求。
- **Header**: 使用第二步获取到的 Token 名和值。
- **Payload**: 详见下方模板。

**新增菜单 Payload 模板：**
```json
{
    "parentId": "父级ID",
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

## 维护建议
- ** enCode 规范**：使用模块简写+功能简写（如 `task_inbound`）。
- ** perms 规范**：通常与路径或功能英文名一致。
- ** 错误处理**：如果接口报错，请及时告知用户并检查参数是否符合 `md/菜单管理-接口.md` 中的格式。

---
*本技能由 Antigravity 自动维护，详见 [菜单管理-接口.md](file:///f:/testCode/hw-accounts-web/md/%E8%8F%9C%E5%8D%95%E7%AE%A1%E7%90%86-%E6%8E%A5%E5%8F%A3.md)*
