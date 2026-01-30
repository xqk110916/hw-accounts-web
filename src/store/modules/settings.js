/*
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2022-03-29 09:35:19
 * @LastEditTime: 2022-06-08 16:17:28
 * @LastEditors: MingWei.Wu
 */
const defaultSettings = {
  // 侧边栏主题 深色主题theme-dark，浅色主题theme-light
  sideTheme: 'theme-dark',

  // 是否系统布局配置
  showSettings: false,

  // 是否显示 tagsView
  tagsView: true,

  // 是否固定头部
  fixedHeader: true,

  // 是否显示logo
  sidebarLogo: true,

  // 是否显示动态标题
  dynamicTitle: false,

  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: 'production',
};

const { sideTheme, showSettings, topNav, tagsView, fixedHeader, sidebarLogo, dynamicTitle } = defaultSettings;

const storageSetting = JSON.parse(localStorage.getItem('layout-setting')) || '';
const state = {
  title: '',
  theme: storageSetting.theme || '#409EFF',
  sideTheme: storageSetting.sideTheme || sideTheme,
  showSettings: showSettings,
  topNav: storageSetting.topNav === undefined ? topNav : storageSetting.topNav,
  tagsView: storageSetting.tagsView === undefined ? tagsView : storageSetting.tagsView,
  fixedHeader: storageSetting.fixedHeader === undefined ? fixedHeader : storageSetting.fixedHeader,
  sidebarLogo: storageSetting.sidebarLogo === undefined ? sidebarLogo : storageSetting.sidebarLogo,
  dynamicTitle: storageSetting.dynamicTitle === undefined ? dynamicTitle : storageSetting.dynamicTitle,
};
const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value;
    }
  },
};

const actions = {
  // 修改布局设置
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data);
  },
  // 设置网页标题
  setTitle({ commit }, title) {
    state.title = title;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
