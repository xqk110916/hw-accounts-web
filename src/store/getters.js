/*
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2022-03-29 09:35:19
 * @LastEditTime: 2022-06-08 16:18:40
 * @LastEditors: MingWei.Wu
 */

const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  tokenName: state => state.user.tokenName,
  tokenValue: state => state.user.tokenValue,
  theme: state => state.user.theme,
  userInfo: state => state.user.userInfo,
  menuList: state => state.user.menuList,
  permission_routes: state => state.permission.routes,
  permissions: state => state.permission.permissions,
  topbarRouters: state => state.permission.topbarRouters,
  defaultRoutes: state => state.permission.defaultRoutes,
  sidebarRouters: state => state.permission.sidebarRouters,
};

export default getters;
