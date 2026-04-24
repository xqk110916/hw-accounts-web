import request from '@/utils/request'

// 1. 生成指定类型的批次号
export const generateBatchNo = params => {
  return request({
    url: '/busin/batchNo/generate',
    method: 'get',
    params, // 接受 batchType (必填) 和 prefix (可选)
  })
}

// 2. 重置序列号
export const resetBatchNo = data => {
  return request({
    url: '/busin/batchNo/reset',
    method: 'post',
    data, // 接受 batchType (必填) 和 year (可选)
  })
}
