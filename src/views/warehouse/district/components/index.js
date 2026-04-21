import * as balanceAreaApi from '@/api/warehouse/balanceArea';
import { getDictionaryList } from '@/api/common/dictionary';

function fetchDictByCategory(keyword, withAll = false) {
  return getDictionaryList({ keyword }).then(res => {
    const parent = (res.data?.list || []).find(d => d.fullName === keyword && d.parentId === '0');
    if (!parent) return { data: withAll ? [{ label: '全部', value: '' }] : [] };
    return getDictionaryList({ parentId: parent.id }).then(childRes => {
      const list = (childRes.data?.list || []).map(d => ({ label: d.fullName, value: d.dictValue }));
      return { data: withAll ? [{ label: '全部', value: '' }, ...list] : list };
    });
  });
}

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
    { label: '类型', prop: 'type', type: 'select', option: fetchDictByCategory('平衡区类型', true) },
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

let requestFun = {
  list: async (params) => {
    const apiParams = {
      currentPage: params.currentPage || 1,
      pageSize: params.pageSize || 10,
      code: params.code,
      name: params.name,
      type: params.type === 'proxy' ? '代存' : (params.type === 'local' ? '本地' : params.type)
    };
    try {
      const res = await balanceAreaApi.getBalanceAreaPageList(apiParams);
      if (res && res.data) {
        // Map backend fields to frontend fields
        const list = (res.data.list || []).map(item => ({
          ...item,
          inLicense: item.importLicense,
          outLicense: item.exportLicense,
          type: item.type === '代存' ? 'proxy' : 'local'
        }));
        return {
          code: 1,
          data: {
            list: list,
            pagination: res.data.pagination
          }
        };
      }
    } catch (error) {
      console.error(error);
    }
    return { code: 1, data: { list: [], pagination: { total: 0 } } };
  },
  detail: async ({ id }) => {
    try {
      const res = await balanceAreaApi.getBalanceAreaDetail(id);
      if (res && res.data) {
        const item = res.data;
        return {
          code: 1,
          data: {
            ...item,
            inLicense: item.importLicense,
            outLicense: item.exportLicense,
            type: item.type === '代存' ? 'proxy' : 'local'
          }
        };
      }
    } catch (error) {
      console.error(error);
    }
    return { code: 1, data: {} };
  },
  edit: async (data) => {
    const apiData = {
      ...data,
      importLicense: data.inLicense,
      exportLicense: data.outLicense,
      type: data.type === 'proxy' ? '代存' : '本地'
    };
    try {
      if (data.id) {
        await balanceAreaApi.updateBalanceArea(apiData);
      } else {
        await balanceAreaApi.addBalanceArea(apiData);
      }
      return { code: 1, message: '操作成功' };
    } catch (error) {
      console.error(error);
      return { code: 0, message: '操作失败' };
    }
  },
  delete: async ({ ids }) => {
    try {
      await balanceAreaApi.deleteBalanceArea(ids);
      return { code: 1, message: '删除成功' };
    } catch (error) {
      console.error(error);
      return { code: 0, message: '删除失败' };
    }
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
