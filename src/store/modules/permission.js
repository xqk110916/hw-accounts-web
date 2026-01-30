import Vue from 'vue';
import { constantRoutes } from '@/router';
import Layouts from '@/layout/index';
import ParentView from '@/components/ParentView';
import lowcodeBridage from '@/views/app/preview/index.vue';
const permission = {
  state: {
    routes: [],
    addRoutes: [],
    defaultRoutes: [],
    topbarRouters: [],
    sidebarRouters: [],
    permissions: [],
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes;
      state.routes = constantRoutes.concat(routes);
    },
    SET_DEFAULT_ROUTES: (state, routes) => {
      state.defaultRoutes = constantRoutes.concat(routes);
    },
    SET_TOPBAR_ROUTES: (state, routes) => {
      // 顶部导航菜单默认添加统计报表栏指向首页
      const index = [
        {
          path: 'index',
          meta: { title: '首页', icon: 'dashboard' },
        },
      ];
      state.topbarRouters = routes.concat(index);
    },
    SET_SIDEBAR_ROUTERS: (state, routes) => {
      state.sidebarRouters = routes;
    },
    SET_PERMISSIONS: (state, bottonArr) => {
      Vue.prototype.$permissions = bottonArr;
      state.permissions = state.permissions.concat(bottonArr);
    },
    UPDATE_ROUTES: (state, route) => {
      for (let v of state.routes) {
        if (v.path === route.path) {
          v = Object.assign(v, route);
          break;
        }
      }
      state.sidebarRouters = state.routes;
    },
  },
  actions: {
    updateRoute({ commit }, route) {
      commit('UPDATE_ROUTES', route);
    },
    // 生成路由
    setRoutes({ commit, rootState }, res) {
      return new Promise(resolve => {
        //提取按钮数组
        let menuList = JSON.parse(JSON.stringify(res.menuTreeBoList));
        menuList.map(item => {
          if (item.menuType !== 'A') {
            item.component = 'Layouts';

            const pathList = item.path?.split('/');
            if (pathList.includes('zcstLowCodePreview') && !item.children.length) {
              item.component = 'app/preview';
            }
            if (item.clientType !== '1') {
              item.children = setMenuComponent(item.children, item.path);
            }
          }
        });
        let menuButton = setMenuButton(JSON.parse(JSON.stringify(res.menuTreeBoList)));
        commit('SET_PERMISSIONS', menuButton);
        // if (res.menuTreeBoList) {
        // let menuButton = res.buttonBoList.map(e => {
        //   return e.authName
        // })
        // }
        // //转换动态路由
        let sidebarRoutes = filterAsyncRouter(menuList, false, true);
        commit('SET_ROUTES', sidebarRoutes);
        commit('SET_SIDEBAR_ROUTERS', sidebarRoutes);
        commit('SET_DEFAULT_ROUTES', sidebarRoutes);
        commit('SET_TOPBAR_ROUTES', sidebarRoutes);
        resolve(sidebarRoutes); // 根据后端返回路由渲染(返回的)
      });
    },
  },
};
//遍历菜单树  添加component属性
function setMenuComponent(arr, parentPath = false, lastRouter = false) {
  let data = JSON.parse(JSON.stringify(arr));
  data.map(item => {
    if (item.menuType !== 'A') {
      if (item.children && item.children.length > 0 && item.children.filter(i => i.menuType === 'A').length === 0) {
        item.children = setMenuComponent(item.children, parentPath, item);
        item.component = 'ParentView';
      } else {
        if (parentPath) {
          const pathList = item.path.split('/');
          if (pathList.includes('zcstLowCodePreview')) {
            item.component = 'app/preview';
          } else {
            item.component = parentPath + '/' + item.path;
          }
        }
      }
      if (lastRouter) {
        item.component = parentPath + '/' + lastRouter.path + '/' + item.path;
      }
    }
  });
  return data;
}
//遍历菜单树 获取按钮权限以
function setMenuButton(arr, buttonArr = []) {
  let data = JSON.parse(JSON.stringify(arr));
  data.map(item => {
    if ((item.menuType === 'A' || item.menuType === 'C') && item.visibleFlag !== '0') {
      buttonArr.push(item.enCode);
    }
    if (item.children && item.children.length > 0) {
      setMenuButton(item.children, buttonArr);
    }
  });
  return buttonArr;
}

// 遍历后台传来的路由转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    route.meta = {
      title: route.fullName,
      icon: route.icon,
      noCache: false,
      link: null,
      alwaysShow: true,
      hidden: false,
    };
    route.name = route.enCode.replace(/\./g, '-');
    if (type && route.children) {
      route.children = filterChildren(route.children, false, route.path);
    }
    if (route.component) {
      if (route.component === 'Layouts') {
        route.component = Layouts;
      } else if (route.component === 'ParentView') {
        route.component = ParentView;
      } else if (route.component === 'app/preview') {
        route.component = lowcodeBridage;
      } else {
        route.component = loadView(route.component);
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type);
    }
    route.path = '/' + route.path;
    return route.menuType !== 'A' && route.visibleFlag !== '0';
  });
}

function filterChildren(childrenMap, lastRouter = false, parentPath = false) {
  childrenMap.forEach((el, index) => {
    if (el.menuType !== 'A') {
      el.meta = {
        title: el.fullName,
        icon: el.icon,
        noCache: false,
        link: null,
      };
      el.name = el.enCode.replace(/\./g, '-');
      if (el.children && el.children.length && el.children.filter(i => i.menuType === 'A').length === 0) {
        if (el.component === 'ParentView' && !lastRouter) {
          el.path = parentPath + '/' + el.path;
          el.children.forEach(c => {
            if (c.children && c.children.length) {
              c.children = filterChildren(c.children, c, parentPath);
            }
          });
          return;
        }
      } else if (el.component !== 'ParentView' && !lastRouter) {
        el.path = parentPath + '/' + el.path;
      }
      if (lastRouter) {
        el.path = lastRouter.path;
      }
    }
  });

  return childrenMap;
}

export const loadView = view => {
  return resolve => require([`@/views/${view}/index.vue`], resolve);
};
export default permission;
