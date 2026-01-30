/*
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2022-03-29 09:35:19
 * @LastEditTime: 2022-06-08 15:58:46
 * @LastEditors: MingWei.Wu
 */
import axios from 'axios';
import { saveAs } from 'file-saver';
import { Message } from 'element-ui';
import { getTokenValue } from '@/utils/auth';

const baseURL = process.env.VUE_APP_BASE_API;

export default {
  name(name, isDelete = true) {
    var url = baseURL + '/common/download?fileName=' + encodeURI(name) + '&delete=' + isDelete;
    axios({
      method: 'get',
      url: url,
      responseType: 'blob',
      headers: { Authorization: 'Bearer ' + getTokenValue() },
    }).then(async res => {
      const isLogin = await this.blobValidate(res.data);
      if (isLogin) {
        const blob = new Blob([res.data]);
        this.saveAs(blob, decodeURI(res.headers['download-filename']));
      } else {
        Message.error('无效的会话，或者会话已过期，请重新登录。');
      }
    });
  },
  resource(resource) {
    var url = baseURL + '/common/download/resource?resource=' + encodeURI(resource);
    axios({
      method: 'get',
      url: url,
      responseType: 'blob',
      headers: { Authorization: 'Bearer ' + getTokenValue() },
    }).then(async res => {
      const isLogin = await this.blobValidate(res.data);
      if (isLogin) {
        const blob = new Blob([res.data]);
        this.saveAs(blob, decodeURI(res.headers['download-filename']));
      } else {
        Message.error('无效的会话，或者会话已过期，请重新登录。');
      }
    });
  },
  zip(url, name) {
    var url = baseURL + url;
    axios({
      method: 'get',
      url: url,
      responseType: 'blob',
      headers: { Authorization: 'Bearer ' + getTokenValue() },
    }).then(async res => {
      const isLogin = await this.blobValidate(res.data);
      if (isLogin) {
        const blob = new Blob([res.data], { type: 'application/zip' });
        this.saveAs(blob, name);
      } else {
        Message.error('无效的会话，或者会话已过期，请重新登录。');
      }
    });
  },
  saveAs(text, name, opts) {
    saveAs(text, name, opts);
  },
  async blobValidate(data) {
    try {
      const text = await data.text();
      JSON.parse(text);
      return false;
    } catch (error) {
      return true;
    }
  },
};
