/*
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2021-11-29 09:22:38
 * @LastEditTime: 2022-06-08 10:37:38
 * @LastEditors: MingWei.Wu
 */

import router from './index';
import store from '@/store';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { getTokenValue } from '@/utils/auth';

NProgress.configure({ showSpinner: false });
const whiteList = ['/login', '/register', '/test', '/test/test'];

router.beforeEach((to, from, next) => {
  NProgress.start();

  const hasToken = getTokenValue() || store.getters.tokenValue;

  if (hasToken) {
    // 设置网页title
    if (to.meta.title) {
      store.dispatch('settings/setTitle', to.meta.title);
    }

    if (to.path === '/login') {
      next({ path: '/' });
    } else {
      const hasMenu = store.getters?.menuList?.length > 0;
      const hasUserID = store.getters?.userInfo?.id;
      return next()
      if (hasMenu) {
        next();
      } else if (hasUserID && !hasMenu) {
        // 无权限访问（判断依据：存在个人信息并且菜单权限数据为空）
        if (to.path === '/401') {
          next();
        } else {
          next('/401');
        }
      } else {
        //
        // 首次访问（判断依据：个人信息并且菜单权限数据为空）
        store.dispatch('GetInfo').then(res => {
          store.dispatch('setRoutes', res.data).then(accessRoutes => {
            // 动态添加可访问路由表
            router.addRoutes(accessRoutes);
            next({ ...to, replace: true });
          });
        });
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      next(`/login?redirect=${to.fullPath}`); // 否则全部重定向到登录页
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});
