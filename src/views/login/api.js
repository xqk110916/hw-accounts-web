/*
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2022-06-08 13:52:01
 * @LastEditTime: 2022-06-08 13:59:28
 * @LastEditors: MingWei.Wu
 */
import request from '@/utils/request';

// 登录方法
export const login = data => request({ url: '/base/login/withPwd', headers: { isToken: true }, method: 'post', data: data });
// 退出方法
export const logout = () => request({ url: '/base/logout', method: 'post' });

// 注册方法
export const register = data => request({ url: '/register', headers: { isToken: false }, method: 'post', data: data });
// 获取验证码
export const getCodeImg = () => request({ url: '/captchaImage', headers: { isToken: false }, method: 'get', timeout: 20000 });

// 登录获取组织
export const getOrgList = data => request({ url: '/base/login/getOrgList', headers: { isToken: false }, method: 'post', data: data });
