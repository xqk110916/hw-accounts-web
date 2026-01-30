import request from '@/utils/request';

// 获取项目档案
export const xmdaInfoListByUser = data => {
  return request({
    url: `busin/daily/xmdaInfoListByUser`,
    method: 'post',
    data,
  });
};

// 获取施工班组
export const sgbzbaInfoList = data => {
  return request({
    url: `busin/daily/sgbzbaInfoList`,
    method: 'post',
    data,
  });
};
// 获取执行中的任务
export const xmjhjdNrInfoList = data => {
  return request({
    url: `busin/daily/xmjhjdNrInfoList`,
    method: 'post',
    data,
  });
};
// 获取明日启动任务
export const tomorrowTaskInfoList = data => {
  return request({
    url: `busin/daily/xmjhjdNrInfoList`,
    method: 'post',
    data,
  });
};

//新增
export const add = data => {
  return request({
    url: `busin/daily/create`,
    method: 'post',
    data,
  });
};

//获取列表
export const getList = data => {
  return request({
    url: `busin/daily/listPage`,
    method: 'post',
    data,
  });
};
//删除
export const del = data => {
  return request({
    url: `busin/daily/delete`,
    method: 'post',
    data,
  });
};
//详情
export const details = data => {
  return request({
    url: `busin/daily/getInfoById`,
    method: 'post',
    data,
  });
};
//编辑
export const edit = data => {
  return request({
    url: `busin/daily/update`,
    method: 'post',
    data,
  });
};

// 导出
export const listPageExport = data => {
  return request({
    url: `busin/daily/listPage/export`,
    method: 'post',
    responseType: 'blob',
    responseEncoding: 'utf8',
    data,
  });
};

//明日启动任务标题
export const mrqdrwbtInfoList = data => {
  return request({
    url: `busin/daily/mrqdrwbtInfoList`,
    method: 'post',
    data,
  });
};

//查询指定人员是否是部门经理
export const isLeaderByUserId = data => {
  return request({
    url: `busin/daily/isLeaderByUserId`,
    method: 'post',
    data,
  });
};
