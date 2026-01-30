import request from '@/utils/request';

// 获取未读消息数量
export const myNoReadCount = data => request({ url: `/lowcode/messagelog/myNoReadCount`, method: 'post', data });
