export const listInitialEntry = params => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 1,
        data: {
          list: [
            { id: 1, dataType: '材料信息', importTime: '2025-10-10 09:00:00', importUser: '张三', auditTime: '', auditUser: '李四', count: '100100', status: 'pending' },
            { id: 2, dataType: '材料信息', importTime: '2025-10-10 09:00:00', importUser: '张三', auditTime: '2025-10-11 09:00:00', auditUser: '李四', count: '100100', status: 'approved' },
            { id: 3, dataType: '材料信息', importTime: '2025-10-10 09:00:00', importUser: '张三', auditTime: '2025-10-11 09:00:00', auditUser: '李四', count: '100100', status: 'rejected' },
            { id: 4, dataType: '材料信息', importTime: '2025-10-10 09:00:00', importUser: '张三', auditTime: '', auditUser: '', count: '', status: 'unsubmitted' }
          ],
          pagination: { total: 400 }
        }
      })
    }, 500)
  })
}

export const auditInitialEntry = data => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 1, msg: '审核成功' })
    }, 500)
  })
}

export const submitInitialEntry = data => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 1, msg: '操作成功' })
    }, 500)
  })
}

export const deleteInitialEntry = data => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 1, msg: '删除成功' })
    }, 500)
  })
}
