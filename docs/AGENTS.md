# Docs Agent Rules

本文档是 `/docs` 目录下的 Agent 约束入口，供 Codex、Claude、Gemini 及其他 AI 工具在缺少额外上下文时统一读取。

## 一、启动必读

在本项目开始任何功能开发、代码分析、问题排查、UI 生成、路由调整或文档维护前，必须先读取：

1. `docs/PROJECT_ARCHITECTURE.md`
2. `docs/SYSTEM_MODULES_MAP.md`
3. `.agent/rules/project_rules.md`

如果任务涉及某个具体页面或业务目录，还必须检查该页面所在目录及其父级目录是否存在 `README.md` 或 `README.MD`。一旦存在，必须先读取并理解其中业务背景，再进行后续操作。

推荐查找顺序：

1. 目标文件所在目录。
2. 目标文件父级目录。
3. 继续向上查找到 `src/views/<module>` 为止。

例如修改 `src/views/task/inbound/components/detail.vue` 时，应检查并读取：

- `src/views/task/inbound/README.md` 或 `README.MD`
- `src/views/task/README.md` 或 `README.MD`
- 若任务与核算背景相关，还应读取 `src/views/accounting/README.MD`

## 二、无上下文默认行为

当用户没有提供明确背景、需求文档或业务解释时，Agent 不应直接假设业务含义。必须优先从 `/docs`、目标模块 README、`md/` 接口文档和现有代码中建立上下文。

最低上下文读取要求：

- 架构：`docs/PROJECT_ARCHITECTURE.md`
- 模块与菜单：`docs/SYSTEM_MODULES_MAP.md`
- 项目规则：`.agent/rules/project_rules.md`
- 页面背景：目标目录及父级目录中的 `README.md` / `README.MD`
- 接口背景：`md/` 中与页面名称匹配的接口文档

## 三、菜单与路由维护

新增页面、菜单、标准 CRUD 或路由时，必须同步维护：

- `menu.json`
- `docs/SYSTEM_MODULES_MAP.md`
- 对应模块 README

新增菜单默认不自动调用 `.agent/skills/menu_management/SKILL.md` 中的菜单管理技能。仅当用户明确要求注册菜单/权限，或明确要求触发菜单管理技能时，才使用该技能完成后端菜单与权限注册。

## 四、跨 Agent 适配要求

本规则适用于：

- Codex：读取根目录 `AGENTS.md`，并继续读取本文档。
- Claude：读取根目录 `CLAUDE.md`，并继续读取本文档。
- Gemini：读取根目录 `GEMINI.md`，并继续读取本文档。

三类 Agent 的行为应保持一致：先读规则和背景，再分析或修改；如新增架构、路由、菜单或模块边界，必须同步更新文档。
