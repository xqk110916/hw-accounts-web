/*
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2021-11-29 09:22:39
 * @LastEditTime: 2022-06-08 16:20:56
 * @LastEditors: MingWei.Wu
 */

import { Message } from 'element-ui';
import { getInfo } from '@/views/userCenter/api.js';
import { login, logout } from '@/views/login/api.js';
import { setTokenName, setTokenValue, removeToken } from '@/utils/auth';
import { isJsonString } from '@/utils/json.js';
import { deepClone } from '@/utils/index';
import { localUserInfo } from './localUserInfo';

const isUserLogin = (isJsonString(localStorage.getItem('isUserLogin')) && JSON.parse(localStorage.getItem('isUserLogin'))) || false;

const user = {
  state: {
    tokenName: 'Authorization',
    tokenValue: process.env.NODE_ENV === 'development' ? 'admin-token' : '',
    theme: {},
    userInfo: {},
    menuList: [],
    isUserLogin: isUserLogin ? isUserLogin?.isUserLoginFlag : true,
  },
  mutations: {
    SET_TOKENNAME: (state, tokenName) => {
      state.tokenName = tokenName;
    },
    SET_TOKENVALUE: (state, tokenValue) => {
      state.tokenValue = tokenValue;
    },
    SET_THEME: (state, theme) => {
      state.theme = theme;
    },
    SET_USERINFO: (state, userInfo) => {
      state.userInfo = userInfo;
    },
    SET_MENULIST: (state, menuList) => {
      state.menuList = menuList;
    },
    SET_USER_LOGIN: (state, flag) => {
      state.isUserLogin = flag;
    },
  },
  actions: {
    // 登录
    Login({ commit }, data) {
      return new Promise((resolve, reject) => {
        login(data)
          .then(res => {
            const tokenName = res.data.tokenInfo.tokenName;
            const tokenValue = res.data.tokenInfo.tokenValue;
            setTokenName(tokenName);
            setTokenValue(tokenValue);
            commit('SET_TOKENNAME', tokenName);
            commit('SET_TOKENVALUE', tokenValue);
            resolve(res);
          })
          .catch(error => {
            reject(error);
          });
      });
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo()
          .then(res => {
            const userInfo = res.data.userBo;
            userInfo.orgId = 1;
            userInfo.orgName = '中州国际饭店';
            userInfo.mainDept = res.data.mainDept;
            const menuList = res.data.menuTreeBoList;
            const headIcon =
              userInfo.headIcon == '' || userInfo.headIcon == null
                ? require('@/assets/images/header-photo.png')
                : process.env.VUE_APP_FILE_ACCESS_PATH + userInfo.headIcon;
            userInfo.headIcon = headIcon;
            commit('SET_USERINFO', userInfo);
            commit('SET_MENULIST', menuList);
            resolve(res);
          })
          .catch(error => {
            console.warn('后端服务异常，切换至本地菜单模式。', error);
            // git revert 要放弃的提交哈希值
            const res = deepClone(localUserInfo);
            const userInfo = res.data.userBo;
            userInfo.orgId = 1;
            userInfo.orgName = '中州国际饭店';
            userInfo.mainDept = res.data.mainDept;
            const menuList = res.data.menuTreeBoList;
            const headIcon =
              userInfo.headIcon == '' || userInfo.headIcon == null
                ? require('@/assets/images/header-photo.png')
                : process.env.VUE_APP_FILE_ACCESS_PATH + userInfo.headIcon;
            userInfo.headIcon = headIcon;
            commit('SET_USERINFO', userInfo);
            commit('SET_MENULIST', menuList);
            resolve(res);
          });
      });
    },

    // 退出系统
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token)
          .then(() => {
            commit('SET_TOKENNAME', '');
            commit('SET_TOKENVALUE', '');
            removeToken();
            resolve();
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    setIsUserLogin({ commit }, flag) {
      if (localStorage.getItem('isUserLogin')) {
        localStorage.removeItem('isUserLogin');
      }
      localStorage.setItem(
        'isUserLogin',
        JSON.stringify({
          isUserLoginFlag: flag,
        }),
      );
      commit('SET_USER_LOGIN', flag);
    },
  },
};

export default user;
