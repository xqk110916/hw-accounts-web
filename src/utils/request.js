import axios from 'axios';
import { MessageBox, Message } from 'element-ui';
import store from '@/store';
import { getTokenName, getTokenValue } from '@/utils/auth';
import errorCode from '@/utils/errorCode';

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 20000,
});

// request拦截器
service.interceptors.request.use(
  config => {
    // 是否需要设置 token
    // TODO: 暂时注释掉 token 校验,因为没有后端服务
    // const isToken = (config.headers || {}).isToken === false;
    // const tokenName = getTokenName();
    // const tokenValue = getTokenValue();
    // if (tokenValue && !isToken) {
    //   config.headers[tokenName] = tokenValue; // 让每个请求携带自定义token 请根据实际情况自行修改
    // }
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = config.url + '?';
      for (const propName of Object.keys(config.params)) {
        const value = config.params[propName];
        var part = encodeURIComponent(propName) + '=';
        if (value !== null && typeof value !== 'undefined') {
          if (typeof value === 'object') {
            for (const key of Object.keys(value)) {
              if (value[key] !== null && typeof value[key] !== 'undefined') {
                let params = `${propName}[${key}]`;
                let subPart = `${encodeURIComponent(params)}=`;
                url += `${subPart}${encodeURIComponent(value[key])}&`;
              }
            }
          } else {
            url += `${part}${encodeURIComponent(value)}&`;
          }
        }
      }
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }
    return config;
  },
  error => {
    console.log(error);
    Promise.reject(error);
  },
);
// code码规范详见https://www.teambition.com/project/615551dd6c5883b81707769c/app/5eba5fba6a92214d420a3219/workspaces/6155a7c054b1e00041a50849/docs/6166d3504e16830001b12af0
const matchingList = [70004];
// 响应拦截器
service.interceptors.response.use(
  res => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 1;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode['default'];
    // TODO: 暂时注释掉 token 过期处理,因为没有后端服务
    // if (matchingList.indexOf(code) > -1) {
    //   MessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
    //     confirmButtonText: '重新登录',
    //     cancelButtonText: '取消',
    //     type: 'warning',
    //   }).then(() => {
    //     store.dispatch('LogOut').then(() => {
    //       location.href = '/admin/index';
    //     });
    //   });
    //   return Promise.reject('无效的会话，或者会话已过期，请重新登录。');
    // } else 
    if (code === 500) {
      Message({ message: 'code为' + code + msg, type: 'error' });
      return Promise.reject(new Error(msg));
    } else if (code === 10001) {
      Message({ message: res.data.data.map(item => item.message).join(',') || res.data.msg, type: 'error' });
      return Promise.reject('error');
    } else if (code !== 1) {
      Message({ message: msg, type: 'error' });
      return Promise.reject('error');
    } else {
      return res.data;
    }
  },
  error => {
    console.log('err' + error);
    let { message } = error;
    if (message == 'Network Error') {
      message = '后端接口连接异常';
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时';
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口' + message.substr(message.length - 3) + '异常';
    }
    // Message({ message: message, type: 'error', duration: 5 * 1000 });
    return Promise.reject(error);
  },
);

export default service;
