import { api } from './api.js';

let btns = {
  operation: [
    { label: '添加', execute: 'add' }
  ],
  table: [
    { label: '编辑', execute: 'update' },
    { label: '删除', execute: 'delete' },
  ],
};

let config = {
  table: [
    { label: '编号', prop: 'code' },
    { label: '名称', prop: 'name' },
    { label: '调入许可证', prop: 'inLicense' },
    { label: '调出许可证', prop: 'outLicense' },
    { label: '类型', prop: 'type' },
    { label: '备注', prop: 'remark' },
  ],
  search: [
    { label: '编号', prop: 'code' },
    { label: '名称', prop: 'name' },
    { label: '类型', prop: 'type', type: 'select', option: [{label: '全部', value: ''}, {label: '本地', value: 'local'}, {label: '代存', value: 'proxy'}] },
  ],
  detail: [
    { label: '编号', prop: 'code', isAdd: true, isUpdate: true },
    { label: '名称', prop: 'name', isAdd: true, isUpdate: true },
    { label: '调入许可证', prop: 'inLicense', isAdd: true, isUpdate: true },
    { label: '调出许可证', prop: 'outLicense', isAdd: true, isUpdate: true },
    { 
      label: '类型', 
      prop: 'type', 
      type: 'switch',
      props: {
        activeValue: 'proxy',
        inactiveValue: 'local',
        activeText: '代存',
        inactiveText: '本地'
      },
      defaultValue: 'local',
      isAdd: true, 
      isUpdate: true 
    },
    { label: '备注', prop: 'remark', type: 'textarea', isAdd: true, isUpdate: true, required: false },
  ],
};

let cacheList = [];

// 模拟接口
let requestFun = {
  list: async (params) => {
    let filteredList = cacheList.filter(item => {
      let match = true;
      if (params.code && !item.code?.includes(params.code)) match = false;
      if (params.name && !item.name?.includes(params.name)) match = false;
      if (params.type && item.type !== params.type) match = false;
      return match;
    });
    return {
      code: 1,
      data: {
        list: filteredList,
        pagination: { total: filteredList.length }
      }
    };
  },
  detail: async ({ id }) => {
    let item = cacheList.find(i => i.id === id);
    return { code: 1, data: item || {} };
  },
  edit: async (data) => {
    if (data.id) {
      let index = cacheList.findIndex(i => i.id === data.id);
      if (index > -1) cacheList.splice(index, 1, data);
    } else {
      data.id = String(Date.now());
      cacheList.push(data);
    }
    return { code: 1, message: '操作成功' };
  },
  delete: async ({ ids }) => {
    cacheList = cacheList.filter(i => i.id !== ids);
    return { code: 1, message: '删除成功' };
  }
};

let handleTbaleMap = (data) => {
  return data.map(item => {
    item.type = item.type === 'proxy' ? '代存' : '本地';
    return item;
  });
};

let getDefaultOptions = async () => {};

export { config, requestFun, btns, handleTbaleMap, getDefaultOptions };
