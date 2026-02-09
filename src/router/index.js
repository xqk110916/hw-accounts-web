import Vue from 'vue';
import Router from 'vue-router';
/* Layout */
import Layout from '@/layout';
import { lowcodeRoutes } from './zcLowCode';
Vue.use(Router);

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
    name: 'User',                   // name一定要有,不然不会渲染到面包屑当中
    auth: true,                     // auth鉴权处理
  }
 */

// 公共路由
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: resolve => require(['@/views/login/redirect'], resolve),
      },
    ],
  },
  {
    path: '/login',
    hidden: true,
    component: resolve => require(['@/views/login/index'], resolve),
  },
  {
    path: '/register',
    hidden: true,
    component: resolve => require(['@/views/login/register'], resolve),
  },
  {
    path: '/404',
    hidden: true,
    component: resolve => require(['@/views/error/404'], resolve),
  },
  {
    path: '/401',
    hidden: true,
    component: resolve => require(['@/views/error/401'], resolve),
  },
  // 内置首页，
  {
    path: '/',
    component: Layout,
    redirect: 'index',
    children: [
      {
        path: 'index',
        name: 'Index',
        component: resolve => require(['@/views/index/index.vue'], resolve),
        meta: {
          title: '首页',
          icon: 'dashboard',
          affix: true,
          auth: true,
        },
      },
    ],
  },
  {
    path: '/test',
    component: Layout,
    children: [
      {
        path: 'test',
        name: 'Test',
        component: resolve => require(['@/views/info/location/index.vue'], resolve),
        meta: {
          title: '测试',
          icon: 'dashboard',
          auth: true,
        },
      },
    ],
  },
  // 固定的路由配置项，用于点击侧边菜单栏头像，跳转至个人信息页面
  {
    path: '/usercenter',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'index',
        component: resolve => require(['@/views/userCenter/index'], resolve),
        name: 'userCenterIndex',
        meta: {
          title: '个人中心',
          icon: 'user',
          auth: true,
        },
      },
    ],
  },
  ...lowcodeRoutes,
];

export default new Router({
  mode: 'history',
  base: '/admin/',
  scrollBehavior: () => ({
    y: 0,
  }),
  routes: constantRoutes,
});
