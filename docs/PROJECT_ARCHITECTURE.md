# 项目架构说明文档 (PROJECT_ARCHITECTURE.md)

## 1. 技术栈总览

根据对项目 `package.json` 及核心配置文件的只读扫描，当前工作区为**前端独立仓库**（未检测到后端 `package.json` 或标准后端服务目录）。项目的核心技术栈与工程化依赖如下：

### 前端核心框架与库
- **核心框架**：Vue `v2.7.14` （支持 Composition API 语法的 Vue 2 最终版本）
- **状态管理**：Vuex `v3.6.0`
- **路由管理**：Vue Router `v3.4.9`
- **UI 组件库**：Element UI `v2.15.9` (主 UI 框架), `zc-framework-ui` (定制框架扩展组件)

### 网络与数据流
- **HTTP 客户端**：Axios `v0.21.0`
- **Cookie 操作**：js-cookie `v2.2.1`

### 数据可视化与图形
- **图表库**：Echarts `v5.4.2`
- **3D 渲染库**：Three.js `v0.182.0`
- **甘特图组件**：wl-gantt `v1.0.6`

### 其他关键业务依赖
- **日期处理**：dayjs `v1.10.8`
- **加密处理**：crypto-js `v4.1.1`, jsencrypt `v3.0.0-rc.1`, js-md5 `v0.7.3`
- **拖拽与裁剪**：vuedraggable `v2.24.3`, vue3-dnd `v2.0.4`, vue-cropper `v0.5.5`
- **文件保存**：file-saver `v2.0.5`

### 工程化与构建工具
- **构建核心**：Vue CLI (`@vue/cli-service v5.0.8`)，底层基于 Webpack `v5.88.2`
- **编译转换**：Babel (`babel-core`, `@vue/babel-preset-app`)
- **样式预处理器**：Sass (`sass v1.32.13`, `sass-loader v10.0.2`)
- **代码规范检查**：Prettier, EditorConfig (基于根目录配置文件推断)

---

## 2. 核心目录结构树

经过对工作区顶层及 `src/` 二级目录的渐进式扫描，过滤冗余与打包生成文件，核心目录骨架如下：

```text
hw-accounts-web/
├── .agent/                 # Agent 工作流及技能配置文件目录
├── .claude/                # Claude AI 辅助工具相关配置
├── .env.*                  # 多环境配置文件（development, production, test 等）
├── package.json            # 项目依赖描述文件
├── vue.config.js           # Vue CLI 核心构建、代理及优化配置
├── README.md               # 项目说明文档
├── public/                 # 静态资源存放目录（不经过 Webpack 编译，直接复制）
└── src/                    # 核心源码目录
    ├── api/                # API 网络请求统一封装层（按业务分包）
    ├── assets/             # 静态资源（图片、样式、SVG 图标等）
    ├── components/         # 全局通用及业务基础组件（如 Echarts封装、上传组件等）
    ├── directive/          # 自定义指令目录
    ├── layout/             # 页面整体布局组件（导航、侧边栏、AppMain 等）
    ├── pages/              # 页面级组件或独立静态页面
    ├── plugins/            # Vue 插件配置注入（如三方组件的集中注册）
    ├── router/             # 路由配置与全局路由权限拦截
    ├── store/              # Vuex 全局状态管理中心
    ├── utils/              # 通用工具函数与基础库（拦截器、校验、加密等）
    └── views/              # 核心业务视图（按功能模块划分的页面群）
```

---

## 3. 模块职责映射表

基于抽样读取的入口引导文件（`main.js`, `bootstrap.js`）及业务核心目录（`views`, `api`, `utils`），系统模块的核心业务职责映射如下：

| 目录/文件路径 | 核心职责概述 | 备注 |
| --- | --- | --- |
| **`src/main.js`** | 极简应用入口文件。主要负责执行 bootstrap 引导逻辑与个别全局样式加载。 | 设计上做了解耦 |
| **`src/bootstrap.js`** | 核心引导与初始化程序。负责 Vue 插件（Vuex, Router, ElementUI, zcUI 等）、自定义指令、全局组件及 Axios 的挂载、引入和注册。 | - |
| **`src/router/`** | 路由与权限控制中心。包含路由映射表（`index.js`）、低代码平台的路由动态生成（`zcLowCode.js`）及基于 token/角色的全局路由守卫拦截（`permission.js`）。 | - |
| **`src/store/`** | Vuex 状态管理中心。采用模块化拆分（`modules/`），并通过 `getters.js` 提供全局状态的快捷访问入口。 | - |
| **`src/utils/`** | 基础工具包封装。包含：网络请求 Axios 拦截器封装（`request.js`）、权限处理（`permission.js` / `auth.js`）、表单数据校验规则（`validate.js`）、以及加密算法封装（`jsencrypt.js`）等。 | 核心基建层 |
| **`src/components/`** | 全局高频复用组件。包含文件上传（`FileUpload` / `ImageUpload`）、图表容器（`Echarts`）、通用检索过滤组件（`SearchFilter`）、签核流组件（`countersign`）等。 | 支撑业务开发 |
| **`src/api/`** | 业务请求接口聚合层。严格按照微服务或业务域划分子目录（如 `accounting`, `warehouse`, `statistic`），使 API 与视图层的职责解耦。 | - |
| **`src/views/accounting/`** | 财务与核算核心业务模块。负责账务数据处理、财务凭证与账单的业务逻辑与页面渲染。 | 核心业务线 |
| **`src/views/warehouse/`** | 仓储管理模块。涉及仓库设立、库存流水、出入库操作等仓储全生命周期相关的界面渲染。 | 核心业务线 |
| **`src/views/dataManagement/`**| 数据管理模块。通常负责主数据、字典数据及系统层面基础业务数据的维护。 | - |
| **`src/views/system/`** | 系统底层设置模块。包含用户管理、角色权限分配、菜单与组织架构管理等底层 RBAC 功能。 | 系统级模块 |
| **`src/views/task/`** | 任务管理及流程模块。集中处理业务审批流程中的待办任务、已办追踪及节点控制的可视化。 | 工作流支撑 |
| **`src/views/index/`** | 系统首页/工作台。负责聚合呈现系统的核心运行指标、统计图表与快捷入口。 | 仪表盘属性 |
| **`src/views/login/`** | 登录鉴权模块。专门处理用户的认证流程、Token 获取与本地缓存逻辑。 | - |
| **`src/views/userCenter/`** | 个人中心模块。提供当前登录用户的个人资料修改、密码重置及界面偏好设置等功能。 | - |
