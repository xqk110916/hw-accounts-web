import request from '@/utils/request'

// 查询所有备份配置
export const getBackupConfigList = () => {
  return request({
    url: '/busin/backup/config/list',
    method: 'get'
  })
}

// 修改备份配置状态（is_back改为1时自动执行备份）
export const updateBackupConfig = (id, isBack) => {
  return request({
    url: `/busin/backup/config/${id}`,
    method: 'put',
    params: { isBack }
  })
}

// 从备份恢复数据（恢复前会删除原表数据）
export const restoreBackup = (backType) => {
  return request({
    url: `/busin/backup/restore/${backType}`,
    method: 'post'
  })
}

// 全量导出数据库为 DMP 文件并下载（流式传输）
export const exportDmpStream = () => {
  return request({
    url: '/busin/backup/export/dmp/stream',
    method: 'get',
    responseType: 'blob'
  })
}

// 上传 DMP 文件并恢复数据库
export const restoreByUpload = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/busin/backup/restore/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const dataBackup = {
  list: getBackupConfigList,
  update: updateBackupConfig,
  restore: restoreBackup,
  exportDmp: exportDmpStream,
  restoreUpload: restoreByUpload
}
