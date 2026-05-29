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

export const dataBackup = {
  list: getBackupConfigList,
  update: updateBackupConfig,
  restore: restoreBackup
}
