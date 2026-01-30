/*
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2022-06-08 13:57:17
 * @LastEditTime: 2022-06-08 13:57:46
 * @LastEditors: MingWei.Wu
 */

import request from '@/utils/request';

// 用户头像上传
export const uploadAvatar = data => request({ url: '/file/upload', method: 'post', data });
// 获取用户详细信息
export const getInfo = () => request({ url: '/base/user/userInfo', method: 'get' });
// 新增用户
export const addUser = data => request({ url: '/base/user', method: 'post', data });
// 锁定-解锁
export const changeStatus = data => request({ url: '/base/user/changeStatus', method: 'post', data });
// 调整人员
export const changeUserDept = data => request({ url: '/base/user/changeUserDept', method: 'post', data });
// 用户分页列表
export const userPageList = query => request({ url: '/base/user/pageList', method: 'get', params: query });
// 重置密码
export const resetPassword = params => request({ url: `/base/user/resetPassword/${params.id}`, method: 'post', params });
// 树形-选择器
export const selectorTree = query => request({ url: '/base/user/selectorTree', method: 'get', params: query });
// 删除用户
export const deleteUser = id => request({ url: '/base/user/' + id, method: 'delete' });
// 修改用户
export const editUser = data => request({ url: '/base/user/' + data.id, method: 'put', data });
// 修改用户基本信息
export const updateBaseUserInfo = data => request({ url: `/base/user/updateBase/${data.id}`, method: 'put', data });
// 通过id获取用户信息
export const getUserInfoById = params => request({ url: '/base/user/getInfoById', method: 'post', params });
// 通过orgId、deptId获取用户列表
export const getUserList = params => request({ url: '/base/user/list', method: 'post', params });
// 修改密码
export const updateUserPwd = data => request({ url: '/base/user/changePassword', method: 'post', data });
