import Layout from '@/layout';
export const lowcodeRoutes = [
  {
    path: '/designerPage/:applicationId/:groupId/:workSheetId/:viewId',
    hidden: true,
    name: 'designerPage',
    component: resolve => require(['@/views/app/designer/index.vue'], resolve),
    redirect: '/designerPage/:applicationId/:groupId/:workSheetId/:viewId/formDesigner',
    meta: {
      auth: true,
    },
    children: [
      {
        name: 'formDesigner',
        path: 'formDesigner',
        hidden: true,
        component: resolve => require(['@/views/app/designer/form-designer/index.vue'], resolve),
        meta: {
          title: '表单设计器',
        },
      },
      {
        name: 'viewDesigner',
        path: 'viewDesigner',
        hidden: true,
        component: resolve => require(['@/views/app/designer/view-designer/index.vue'], resolve),
        meta: {
          title: '列表设计器',
        },
      },
      {
        name: 'calendarDesigner',
        path: 'calendarDesigner',
        hidden: true,
        component: resolve => require(['@/views/app/designer/calendar-designer/index.vue'], resolve),
        meta: {
          title: '日历设计器',
        },
      },
      {
        name: 'cardDesigner',
        path: 'cardDesigner',
        hidden: true,
        component: resolve => require(['@/views/app/designer/card-designer/index.vue'], resolve),
        meta: {
          title: '卡片设计器',
        },
      },

      {
        name: 'boardDesigner',
        path: 'boardDesigner',
        hidden: true,
        component: resolve => require(['@/views/app/designer/board-designer/index.vue'], resolve),
        meta: {
          title: '看板设计器',
        },
      },
      {
        name: 'processDesigner',
        path: 'processDesigner',
        hidden: true,
        component: resolve => require(['@/views/app/designer/process-designer/index.vue'], resolve),
        meta: {
          title: '流程设计器',
        },
      },
      {
        name: 'otherFeature',
        path: 'otherFeature',
        hidden: true,
        component: resolve => require(['@/views/app/designer/other-feature/index.vue'], resolve),
        redirect: 'otherFeature/functionalSwitch',
        meta: {
          title: '拓展功能',
        },
        children: [
          {
            path: 'submitForm',
            name: 'submitForm',
            component: resolve => require(['@/views/app/designer/setup/submitForm.vue'], resolve),
          },
          {
            path: 'formExtendDataSetting',
            name: 'formExtendDataSetting',
            component: resolve => require(['@/views/app/designer/setup/formExtendDataSetting.vue'], resolve),
          },
          {
            path: 'functionalSwitch',
            name: 'functionalSwitch',
            component: resolve => require(['@/views/app/designer/setup/functionalSwitch.vue'], resolve),
          },
          {
            path: 'display',
            name: 'display',
            component: resolve => require(['@/views/app/designer/setup/display.vue'], resolve),
          },
          {
            path: 'manageList',
            name: 'manageList',
            component: resolve => require(['@/views/app/designer/setup/manageList.vue'], resolve),
          },
          {
            path: 'printing',
            name: 'printing',
            component: resolve => require(['@/views/app/designer/setup/printing.vue'], resolve),
          },
          {
            path: 'messagePush',
            name: 'messagePush',
            component: resolve => require(['@/views/app/designer/setup/messagePush.vue'], resolve),
          },
          {
            path: 'retrieveHasten',
            name: 'retrieveHasten',
            component: resolve => require(['@/views/app/designer/setup/retrieveHasten.vue'], resolve),
          },
          // {
          //   path: 'customBtn',
          //   name: 'customBtn',
          //   component: resolve => require(['@/views/app/designer/setup/customBtn.vue'], resolve),
          // },
        ],
      },
      {
        name: 'formPublic',
        path: 'formPublic',
        hidden: true,
        component: resolve => require(['@/views/app/designer/form-public/index.vue'], resolve),
        redirect: 'formPublic/publicForm',
        meta: {
          title: '表单公开',
        },
        children: [
          {
            path: 'publicForm',
            name: 'publicForm',
            component: resolve => require(['@/views/app/designer/form-public/publicForm.vue'], resolve),
          },
          {
            path: 'publicSearch',
            name: 'publicSearch',
            component: resolve => require(['@/views/app/designer/form-public/publicSearch.vue'], resolve),
          },
        ],
      },
    ],
  },

  //打印路由开始
  {
    path: '/printing/:applicationId/:workSheetId/:viewId',
    hidden: true,
    name: 'printingView',
    component: resolve => require(['@/views/app/designer/setup/printing/components/setting.vue'], resolve),
    meta: { auth: true },
    children: [
      {
        path: 'record',
        name: 'record',
        component: resolve => require(['@/views/app/designer/setup/printing/components/record.vue'], resolve),
      },
      {
        path: 'bar',
        name: 'bar',
        component: resolve => require(['@/views/app/designer/setup/printing/components/barcode.vue'], resolve),
      },
      {
        path: 'qr',
        name: 'qr',
        component: resolve => require(['@/views/app/designer/setup/printing/components/qrcode.vue'], resolve),
      },
      {
        path: 'word',
        name: 'word',
        component: resolve => require(['@/views/app/designer/setup/printing/components/word.vue'], resolve),
      },
      {
        path: 'excel',
        name: 'excel',
        component: resolve => require(['@/views/app/designer/setup/printing/components/excel.vue'], resolve),
      },
    ],
  },
  {
    path: '/print/show/view',
    hidden: true,
    component: resolve => require(['@/views/app/designer/setup/printing/printView/index.vue'], resolve),
    meta: { auth: true },
  },
  {
    path: '/configPrint/show/view/:workSheetId/:viewId/:rowId',
    hidden: true,
    component: resolve => require(['@/views/app/designer/setup/printing/printView/configPrint.vue'], resolve),
    meta: { auth: true },
  },
  // 工作表视图
  {
    name: 'appView',
    hidden: true,
    path: '/appMain/:applicationId/group/:groupId/worksheet/:workSheetId/view/:viewId',
    component: resolve => require(['@/views/app/main/index.vue'], resolve),
    meta: {
      title: '应用视图',
      auth: true,
    },
  },
  // 图表视图
  {
    name: 'chartView',
    hidden: true,
    path: '/appMain/:applicationId/group/:groupId/chart/:chartId',
    component: resolve => require(['@/views/app/main/index.vue'], resolve),
    meta: {
      auth: true,
      title: '图表视图',
    },
  },
  // 图表设计器
  {
    name: 'chartViewEdit',
    path: '/chart/:applicationId/group/:groupId/chart/:chartId/edit',
    hidden: true,
    component: resolve => require(['@/views/app/chart/edit.vue'], resolve),
  },
  {
    path: '/application',
    component: Layout,
    children: [
      {
        path: '/application/develop',
        name: 'applicationDevelop',
        meta: {
          title: '应用开发',
        },
        component: resolve => require(['@/views/app/appDevelop.vue'], resolve),
      },
      {
        path: '/application/authoritySettings',
        name: 'applicationAuthoritySettings',
        meta: {
          title: '应用授权',
        },
        component: resolve => require(['@/views/app/views/authoritySettings.vue'], resolve),
      },
    ],
  },
  // 流程中心
  {
    path: '/flow',
    component: Layout,
    children: [
      {
        path: '/flow/zcFlowTodo',
        name: 'flowZcFlowTodo',
        meta: {
          title: '待办',
        },
        component: resolve => require(['@/views/app/flow/zcFlowTodo.vue'], resolve),
      },
      {
        path: '/flow/zcFlowCopyToMe',
        name: 'flowZcFlowCopyToMe',
        meta: {
          title: '抄送我的',
        },
        component: resolve => require(['@/views/app/flow/zcFlowTodoMe.vue'], resolve),
      },
      {
        path: '/flow/zcFlowDid',
        name: 'flowZcFlowDid',
        meta: {
          title: '我已办理',
        },
        component: resolve => require(['@/views/app/flow/zcFlowDid.vue'], resolve),
      },
      {
        path: '/flow/zcFlowLaunch',
        name: 'flowZcFlowLaunch',
        meta: {
          title: '我发起的',
        },
        component: resolve => require(['@/views/app/flow/zcFlowLaunch.vue'], resolve),
      },
    ],
  },
  //消息中心
  {
    path: '/messageIndex',
    component: resolve => require(['@/views/app/message/index'], resolve),
    name: 'messageIndex',
    hidden: true,
    meta: {
      title: '消息中心',
      auth: true,
    },
  },
  // 消息配置
  {
    path: '/message',
    component: Layout,
    children: [
      {
        path: '/message/zcMessageConfig',
        name: 'zcMessageConfig',
        meta: {
          title: '消息配置',
        },
        component: resolve => require(['@/views/app/message/zcMessageConfig.vue'], resolve),
      },
    ],
  },
  //打印阅览
  {
    name: 'configPrintShowView',
    hidden: true,
    path: '/configPrint/show/view/:applicationId/:groupId/:chartId',
    component: resolve => require(['@/views/app/message/zcMessageConfig.vue'], resolve),
  },

  // 移动端工作表，编辑、列表、详情
  // {
  //   name: 'mobileEdit',
  //   path: '/mobile/edit/:applicationId/:workSheetId',
  //   hidden: true,
  //   component: resolve => require(['@/views/app/mobile/edit.vue'], resolve),
  // },
  // {
  //   name: 'mobileList',
  //   path: '/mobile/list/:applicationId/:workSheetId/:viewId',
  //   hidden: true,
  //   component: resolve => require(['@/views/app/mobile/list.vue'], resolve),
  // },
  // {
  //   name: 'mobileDetail',
  //   path: '/mobile/detail/:applicationId/:workSheetId/:viewId/:id',
  //   hidden: true,
  //   component: resolve => require(['@/views/app/mobile/detail.vue'], resolve),
  // },
];
