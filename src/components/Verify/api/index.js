/*
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2022-05-31 09:27:08
 * @LastEditTime: 2022-05-31 11:39:29
 * @LastEditors: MingWei.Wu
 */
/**
 * 此处可直接引用自己项目封装好的 axios 配合后端联调
 */
import request from '@/utils/request';

// 获取验证图片  以及token
export function reqGet(data) {
  return request({
    url: '/base/captcha/get',
    method: 'post',
    data,
  });
}

// 滑动或者点选验证
export function reqCheck(data) {
  return request({
    url: '/base/captcha/check',
    method: 'post',
    data,
  });
}
