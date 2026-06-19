# Global AI Instructions

This file is the Codex/AGENTS entry point. The same baseline rules are mirrored for Claude in `CLAUDE.md` and Gemini in `GEMINI.md`.

Before starting any feature development, analysis, debugging, UI generation, routing change, or documentation task, you MUST first read the following background documents to understand the system architecture, business logic, and routing mapping:
1. `docs/AGENTS.md`
2. `docs/PROJECT_ARCHITECTURE.md`
3. `docs/SYSTEM_MODULES_MAP.md`
4. `.agent/rules/project_rules.md`

If the task targets a page, first locate the page module by finding its `index.vue` or the nearest page directory under `src/views`. If that page directory, its parent module directory, or another direct child directory under `src/views` that owns the target page contains `README.md` or `README.MD`, you MUST read it before making changes or conclusions. The README that should be updated for page/module behavior changes is the README in that same `src/views` page/module location.

When the user provides no extra context, default to reading `/docs` rules and the target module README before taking action.

Always refer back to these documents and update them if you introduce new architectural changes, module behavior changes, or add new routes/menus.

## Menu Registration & Architecture Rule

When generating a new page, component, route, menu, or standard List/CRUD interface:
1. **Understand Context**: Verify existing routing and business scopes in `docs/SYSTEM_MODULES_MAP.md`.
2. **Synchronize Documentation**: If you add a new route, update `menu.json`, `docs/SYSTEM_MODULES_MAP.md`, and the relevant module README to reflect the new feature's place in the ecosystem.
3. **Manual Skill Trigger Only**: Do not inspect, evaluate, or run the `Menu Management Skill` (`.agent/skills/menu_management/SKILL.md`) as part of the default workflow. Only consider or trigger it when the user mentions menu registration, permission registration, or explicitly names this skill in the current conversation.

## Tech Stack Reminder
- **Framework**: Vue 2.7.14 (supports Composition API style)
- **UI & State**: Element UI 2.15.9, Vuex 3.6.0, Vue Router 3.4.9
- **Build Tool**: Vue CLI / Webpack 5

## 列表页与筛选控件规范

- **筛选控件规范**：筛选条件中涉及状态、类型、类别、是否类等枚举选择时，必须使用 `select` / `el-select` 组件；禁止在筛选区使用 `checkbox` / `el-checkbox` / `el-checkbox-group` 作为筛选条件控件。
- **Demo 排版基准**：所有列表页、标准 CRUD 页面、表格查询页面的排版结构和样式必须严格参照 `src/views/demo/crud/index.vue`，保持系统界面风格严格一致。
- **结构要求**：列表页应保持 `wrapper -> content -> right` 的主体结构；如存在左侧树，应保持 `left + right` 分栏结构。
- **区域顺序**：右侧内容区必须按“搜索区 `.search` / 操作区 `.operation` / 表格区 `.table` / 分页 `.pagination`”的顺序组织。
- **样式要求**：列表页按钮、表头背景、表格文字颜色、分页位置、分页按钮样式、表格高度计算逻辑，应沿用 Demo 中的实现方式，避免自行引入不一致的卡片化或自定义排版风格。

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

## 浏览器操作规范（项目级）

- **必须使用 CDP-Bridge**：本项目需要登录才能访问（localhost:8080），进行界面调试或获取 Token 时，必须使用 MCP 工具 `CDP-Bridge` 连接本地浏览器
- **禁止使用 Playwright**：不要使用 Playwright 打开项目页面，因为它无法复用已登录的会话
- **原因**：项目有登录态，CDP-Bridge 可以连接已登录的 Chrome 浏览器，避免重复登录
- **调试验证**：调试过程中以 CDP-Bridge 为主进行界面验证和调试，当 CDP-Bridge 无法满足需求时，可调用 `open-computer-use` MCP 工具辅助完成

## 依赖管理规范（私有库保护）

- **私有库保护**：本项目中 `node_modules` 存在一个不在外部 npm 注册表且并未在 package.json 中显式定义包源的私有依赖库 `zc-framework-ui`。
- **禁止清空或覆盖安装**：在进行任何依赖安装、更新操作时，**绝对禁止**进行全量安装（如单纯运行 `yarn` / `npm install` 导致清除现有结构）或由于添加新依赖导致该私有包丢失。
- **操作要求**：安装新依赖时（如 `yarn add xxx`），如果因为环境或配置导致该私有包在 `node_modules` 中被意外清理或破坏，必须通过解压项目中或原有的备份将其恢复，确保构建过程不会出现找不到 `zc-framework-ui` 模块相关的报错。
