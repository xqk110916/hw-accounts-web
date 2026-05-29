import request from '@/utils/request';

// 获取数据备份列表
export const getDataBackupList = params => {
  return request({
    url: '/system/dataBackup/listPage',
    method: 'post',
    params
  })
}

// 获取数据备份详情
export const getDataBackupDetail = params => {
  return request({
    url: '/system/dataBackup/getInfoById',
    method: 'post',
    params
  })
}

// 导入数据
export const importData = data => {
  return request({
    url: '/system/dataBackup/import',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 导出数据
export const exportData = params => {
  return request({
    url: '/system/dataBackup/export',
    method: 'post',
    params,
    responseType: 'blob'
  })
}

export const dataBackup = {
  list: getDataBackupList,
  detail: getDataBackupDetail,
  import: importData,
  export: exportData
}
