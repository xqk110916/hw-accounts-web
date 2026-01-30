/*
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2022-03-29 09:35:19
 * @LastEditTime: 2022-06-08 16:17:55
 * @LastEditors: MingWei.Wu
 */

import Vue from 'vue';
import Vuex from 'vuex';
import app from './modules/app';
import permission from './modules/permission';
import settings from './modules/settings';
import tagsView from './modules/tagsView';
import user from './modules/user';
import getters from './getters';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    app,
    permission,
    settings,
    tagsView,
    user,
  },
  getters,
});

export default store;
