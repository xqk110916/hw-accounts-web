/*
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2022-05-27 11:31:40
 * @LastEditTime: 2022-06-07 17:42:26
 * @LastEditors: MingWei.Wu
 */
import request from '@/utils/request';

// 上传文件
export const uploadFile = data => request({ url: `/file/upload`, method: 'post', data });
