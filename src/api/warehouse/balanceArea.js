import request from '@/utils/request';

export function getBalanceAreaPageList(data) {
  return request({ url: '/busin/balanceArea/pageList', method: 'post', data });
}

export function getAllBalanceAreas() {
  return request({ url: '/busin/balanceArea/listAll', method: 'post' });
}

export function getBalanceAreaDetail(id) {
  return request({ url: `/busin/balanceArea/detail/${id}`, method: 'get' });
}

export function addBalanceArea(data) {
  return request({ url: '/busin/balanceArea/add', method: 'post', data });
}

export function updateBalanceArea(data) {
  return request({ url: '/busin/balanceArea/update', method: 'post', data });
}

export function deleteBalanceArea(id) {
  return request({ url: `/busin/balanceArea/delete/${id}`, method: 'post' });
}
