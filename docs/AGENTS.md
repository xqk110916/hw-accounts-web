# Docs Agent Rules

本文档是 `/docs` 目录下的 Agent 约束入口，供 Codex、Claude、Gemini 及其他 AI 工具在缺少额外上下文时统一读取。

## 一、启动必读

在本项目开始任何功能开发、代码分析、问题排查、UI 生成、路由调整或文档维护前，必须先读取：

1. `docs/PROJECT_ARCHITECTURE.md`
2. `docs/SYSTEM_MODULES_MAP.md`
3. `.agent/rules/project_rules.md`

如果任务涉及某个具体页面或业务目录，必须先定位该页面所属模块：优先寻找目标页面的 `index.vue`，或 `src/views` 下最近的页面目录。若该页面目录、其父级模块目录，或 `src/views` 下拥有该目标页面的直接下级目录中存在 `README.md` 或 `README.MD`，必须先读取并理解其中业务背景，再进行后续操作。涉及页面或模块行为变化时，需要更新的 README 就是该 `src/views` 页面/模块位置中的 README。

推荐查找顺序：

1. 目标页面 `index.vue` 所在目录。
2. 该页面的父级模块目录。
3. `src/views` 下拥有该目标页面的直接下级目录。

例如修改 `src/views/task/inbound/components/detail.vue` 时，应检查并读取：

- `src/views/task/README.md` 或 `README.MD`

## 二、无上下文默认行为

当用户没有提供明确背景、需求文档或业务解释时，Agent 不应直接假设业务含义。必须优先从 `/docs`、目标模块 README、`md/` 接口文档和现有代码中建立上下文。

最低上下文读取要求：

- 架构：`docs/PROJECT_ARCHITECTURE.md`
- 模块与菜单：`docs/SYSTEM_MODULES_MAP.md`
- 项目规则：`.agent/rules/project_rules.md`
- 页面背景：目标页面 `index.vue` 所在目录、其父级模块目录，或 `src/views` 下拥有该目标页面的直接下级目录中的 `README.md` / `README.MD`
- 接口背景：`md/` 中与页面名称匹配的接口文档

## 三、菜单与路由维护

新增页面、菜单、标准 CRUD 或路由时，必须同步维护：

- `menu.json`
- `docs/SYSTEM_MODULES_MAP.md`
- 对应模块 README

默认流程中不要检查、评估或调用 `.agent/skills/menu_management/SKILL.md` 中的菜单管理技能。仅当用户在当前会话中提到菜单注册、权限注册，或明确点名该技能时，才考虑或触发该技能完成后端菜单与权限注册。

## 四、跨 Agent 适配要求

本规则适用于：

- Codex：读取根目录 `AGENTS.md`，并继续读取本文档。
- Claude：读取根目录 `CLAUDE.md`，并继续读取本文档。
- Gemini：读取根目录 `GEMINI.md`，并继续读取本文档。

三类 Agent 的行为应保持一致：先读规则和背景，再分析或修改；如新增架构、路由、菜单或模块边界，必须同步更新文档。

## 五、Dialog 组件规范

- **独立文件**：生成页面时，如果需要添加 Dialog（对话框/弹窗），禁止将 Dialog 代码直接写在页面组件内。
- **组件目录**：Dialog 必须作为独立组件创建在当前模块的 `components` 文件夹下。
- **命名约定**：Dialog 组件文件名应以 `Dialog` 结尾，如 `EditDialog.vue`、`DetailDialog.vue`。
- **引入使用**：在页面组件中通过 `import` 引入 Dialog 组件并在模板中使用。
- **示例结构**：
  ```
  src/views/<module>/
  ├── index.vue              # 页面主组件
  ├── components/
  │   ├── EditDialog.vue     # 编辑弹窗
  │   └── DetailDialog.vue   # 详情弹窗
  └── ...
  ```
