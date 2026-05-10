# Global AI Instructions

This repository uses shared instructions for Gemini, Codex, and Claude.

Before starting any feature development, analysis, debugging, UI generation, routing change, or documentation task, you MUST first read:

1. `docs/AGENTS.md`
2. `docs/PROJECT_ARCHITECTURE.md`
3. `docs/SYSTEM_MODULES_MAP.md`
4. `.agent/rules/project_rules.md`

If the task targets a page, first locate the page module by finding its `index.vue` or the nearest page directory under `src/views`. If that page directory, its parent module directory, or another direct child directory under `src/views` that owns the target page contains `README.md` or `README.MD`, you MUST read it before making changes or conclusions. The README that should be updated for page/module behavior changes is the README in that same `src/views` page/module location.

Always update the related docs when introducing architectural changes, new routes, menus, or module-level behavior.

## Menu Registration & Architecture Rule

When generating a new page, component, route, menu, or standard List/CRUD interface:

1. Verify the existing routing and business scope in `docs/SYSTEM_MODULES_MAP.md`.
2. Update `menu.json`, `docs/SYSTEM_MODULES_MAP.md`, and the relevant module README.
3. Do not inspect, evaluate, or run the `Menu Management Skill` located at `.agent/skills/menu_management/SKILL.md` as part of the default workflow. Only consider or trigger it when the user mentions menu registration, permission registration, or explicitly names this skill in the current conversation.

## Tech Stack Reminder

- Framework: Vue 2.7.14
- UI & State: Element UI 2.15.9, Vuex 3.6.0, Vue Router 3.4.9
- Build Tool: Vue CLI / Webpack 5

## Dialog 组件规范

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
