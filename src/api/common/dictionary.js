import request from '@/utils/request';

export function getDictionaryList(params) {
  return request({ url: '/base/dictionary/list', method: 'get', params });
}

export function addDictionary(data) {
  return request({ url: '/base/dictionary', method: 'post', data });
}

export function updateDictionary(id, data) {
  return request({ url: `/base/dictionary/${id}`, method: 'put', data });
}

export function deleteDictionary(id) {
  return request({ url: `/base/dictionary/${id}`, method: 'delete' });
}

export function getDictionaryDetail(id) {
  return request({ url: `/base/dictionary/${id}`, method: 'get' });
}
