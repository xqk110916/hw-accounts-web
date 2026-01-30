import request from '@/utils/request';

// 获取全体人员投入情况汇总
export const monthlyReportUserSummary = data => {
  return request({
    url: `busin/daily/monthlyReportUserSummary`,
    method: 'post',
    data,
  });
};
// 全体人员投入情况汇总-导出
export const monthlyReportUserSummaryExport = data => {
  return request({
    url: `busin/daily/monthlyReportUserSummary/export`,
    method: 'post',
    responseType: 'blob',
    responseEncoding: 'utf8',
    data,
  });
};
// 获取施工班组投入情况汇总
export const monthlyReportGroupSummary = data => {
  return request({
    url: `busin/daily/monthlyReportGroupSummary`,
    method: 'post',
    data,
  });
};
// 施工班组投入情况汇总-导出
export const monthlyReportGroupSummaryExport = data => {
  return request({
    url: `busin/daily/monthlyReportGroupSummary/export`,
    method: 'post',
    responseType: 'blob',
    responseEncoding: 'utf8',
    data,
  });
};
