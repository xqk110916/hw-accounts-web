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

## YOLO 模式（直接行动规范）

- **默认激活**：本项目全局启用并推荐采用 YOLO（You Only Look Once）开发模式。
- **直接行动**：Gemini 在执行任务时，对于日常需求（包括但不限于修改文件、调试接口、更新样式、分析文档等），禁止进行冗余的多阶段规划（Planning Mode）或要求用户先批准设计图。直接使用文件读写和命令工具完成修改，行动要果断迅速。
- **减少打扰**：除非遇到严重冲突或不可恢复的风险，否则不需要向用户反复进行确认和询问。保持自信，一步到位地解决问题。

## 浏览器操作规范（项目级）

- **必须使用 CDP-Bridge**：本项目需要登录才能访问（localhost:8080），进行界面调试或获取 Token 时，必须使用 MCP 工具 `CDP-Bridge` 连接本地浏览器
- **禁止使用 Playwright**：不要使用 Playwright 打开项目页面，因为它无法复用已登录的会话
- **原因**：项目有登录态，CDP-Bridge 可以连接已登录的 Chrome 浏览器，避免重复登录
- **调试验证**：调试过程中以 CDP-Bridge 为主进行界面验证和调试，当 CDP-Bridge 无法满足需求时，可调用 `open-computer-use` MCP 工具辅助完成

