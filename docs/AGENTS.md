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

## 六、列表页与筛选控件规范

- **筛选控件规范**：筛选条件中涉及状态、类型、类别、是否类等枚举选择时，必须使用 `select` / `el-select` 组件；禁止在筛选区使用 `checkbox` / `el-checkbox` / `el-checkbox-group` 作为筛选条件控件。
- **Demo 排版基准**：所有列表页、标准 CRUD 页面、表格查询页面的排版结构和样式必须严格参照 `src/views/demo/crud/index.vue`，保持系统界面风格严格一致。
- **结构要求**：列表页应保持 `wrapper -> content -> right` 的主体结构；如存在左侧树，应保持 `left + right` 分栏结构。
- **区域顺序**：右侧内容区必须按“搜索区 `.search` / 操作区 `.operation` / 表格区 `.table` / 分页 `.pagination`”的顺序组织。
- **样式要求**：列表页按钮、表头背景、表格文字颜色、分页位置、分页按钮样式、表格高度计算逻辑，应沿用 Demo 中的实现方式，避免自行引入不一致的卡片化或自定义排版风格。

## 七、验证命令与开发服务器执行规则

- **禁止盲目运行开发服务器**：严禁在未检查或未询问用户本地运行状态的情况下，盲目或主动执行 `npm run dev`、`npm run serve`、`npm start` 等启动开发服务的命令，以防止产生 8081 等冗余的服务进程并造成系统资源浪费与端口冲突。
- **验证前检索**：在执行任何前台命令行、构建或测试前，应优先通过 `manage_task` 检索当前是否有正在运行的后台 background 任务，防止重复创建进程。
- **小改动默认不构建**：仅涉及文案、样式微调、请求触发时机、简单条件判断等小范围改动时，默认不运行 `npm run build` 验证。
- **需要构建的情况**：新增/删除组件、调整路由、改动构建配置、修改大量模板结构、引入新依赖、或存在明显编译风险时，再运行构建验证。
- **用户优先**：如果用户明确要求运行构建、测试、启动服务或其他验证命令，应按用户要求执行。
