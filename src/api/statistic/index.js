/*
 * @Descripttion:
 * @Author: zhangkai
 * @Date: 2024-03-18 10:08:00
 * @LastEditors: zhangkai
 * @LastEditTime: 2024-03-29 17:41:56
 */
import request from '@/utils/request';

// 获取施工班组
export const sgbzbaInfoList = data => {
  return request({
    url: `busin/daily/sgbzbaInfoList`,
    method: 'post',
    data,
  });
};
// 部门
export const treeLocal = data => {
  return request({
    url: `base/dept/treeLocal`,
    method: 'get',
  });
};
// 项目类型
export const dictionaryList = data => {
  return request({
    url: `base/dictionary/list?currentPage=` + data.currentPage + `&pageSize=` + data.pageSize + `&parentId=` + data.parentId,
    method: 'get',
  });
};
// 获取项目统计概况
export const getProjectCountInfo = data => {
  return request({
    url: `busin/report/getProjectCountInfo`,
    method: 'post',
    data,
  });
};
// 获取项目量占比分析
export const getProjectTypeCountInfo = data => {
  return request({
    url: `busin/report/getProjectTypeCountInfo`,
    method: 'post',
    data,
  });
};
// 获取项目合同款项执行情况
export const getProjectContractAmount = data => {
  return request({
    url: `busin/report/getProjectContractAmount`,
    method: 'post',
    data,
  });
};
// 获取报销费用统计
export const getExpenseAmount = data => {
  return request({
    url: `busin/report/getExpenseAmount`,
    method: 'post',
    data,
  });
};
// 获取项目启动和验收数据
export const getProjectAcceptStatisticst = data => {
  return request({
    url: `busin/report/getProjectAcceptStatistics`,
    method: 'post',
    data,
  });
};
