<!--
 * @Author: MingWei.Wu <minwwu@dingtalk.com>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2021-11-29 09:22:39
 * @LastEditTime: 2022-06-07 16:24:04
 * @LastEditors: MingWei.Wu
-->

### 工程说明文档

#### 1. 工程 clone

Git global setup: 本地配置 git 环境

```bash
  git config --global user.name "xxxxxx"
  git config --global user.email "xxxxxx@xxx"
```

clone repository: 克隆新仓库

```bash
git clone https://codeup.aliyun.com/60668a6432fceefde379c549/zcStandar/zc-frontend-cli.git

```

#### 2.工程运行与打包

##### 安装依赖(使用 yarn 包管理器的)

```bash
yarn install
```

###### 本地启动服务

```bsh
yarn dev
```

即可自动打开通过浏览器打开本地开发地址

###### 打包正式环境

```bash
yarn build:prod
```

###### 安装依赖(使用 npm 包管理器的)

```bash
npm install
```

###### 本地启动服务

```bsh
npm run dev
```

即可自动打开通过浏览器打开本地开发地址

###### 打包正式环境

```bash
npm run build:prod
```

##### 目录说明

```javascript
│
├── dist                            // 打包产物
├── node_modules                    // 依赖包
├── public                          // 工程模板
│   ├── html                        // html模板
│   │     └── ie.html               // IE兼容性提示html
│   ├── favicon.icon                // favicon 图标
│   ├── index.html                  // 主入口html模板
│   └── robots.txt                  // 防爬虫配置
│
├── src                             // 业务模块
│   ├── api                         // api配置
│   ├── assets                      // 静态资源
│   ├── components                  // 全局component组件
│   ├── directive                   // 自定义Vue 指令
│   ├── layout                      // 系统整体布局
│   ├── plugins                     // 全局方法
│   ├── router                      // 路由配置
│   ├── store                       // 数据流管理
│   ├── utils                       // 工具函数
│   ├── views                       // 业务视图
│   │     ├── error                 // error模块404等页面
│   │     ├── index                 // 首页
│   │     ├── login                 // 登录
│   │     ├── system                // 系统管理
│   │     └── userCenter            // 个人中心
│   │
│   ├── App.vue                     // 主入口组件
│   ├── main.js                     // 主入口JS模块
│
├── .editorconfig                   // vscode编辑器工程配置
├── .env.development                // 环境变量——开发环境
├── .env.producation                // 环境变量——生产环境
├── .env.test                       // 环境变量——测试环境
├── .eslintignore                   // eslint 忽略配置
├── .eslintrc.js                    // eslint 格式化规则
├── .gitignore                      // git 忽略配置
├── .prettierrc                      // prettier 格式化配置
├── babel.config.js                 // babel 转译规则
└── package.json                    // package 配置
└── README.md                       // 项目工程说明文档
└── vue.config.js                   // vue-cli 配置
└── yarn-error.log                   // yarn error 日志
└── yarn.lock                       // yarn lock文件
```
