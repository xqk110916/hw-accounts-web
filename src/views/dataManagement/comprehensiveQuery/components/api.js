export const listComprehensiveQuery = params => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 1,
        data: {
          list: [
            { id: 1, location: 'XXXXXXXX', containerId: 'xxxxxxxx', inInfo: '「入库编号」\n入库时间', outInfo: '「出库编号」\n出库时间', materialName: 'XXXXXXXX', sealInfo: 'XXXXXXXX', allocateBase: 'XXXXXXXX' },
            { id: 2, location: 'XXXXXXXX', containerId: 'xxxxxxxx', inInfo: '「入库编号」\n入库时间', outInfo: '', materialName: 'XXXXXXXX', sealInfo: 'XXXXXXXX', allocateBase: 'XXXXXXXX' },
            { id: 3, location: 'XXXXXXXX', containerId: 'xxxxxxxx', inInfo: '「入库编号」\n入库时间', outInfo: '', materialName: 'XXXXXXXX', sealInfo: 'XXXXXXXX', allocateBase: 'XXXXXXXX' },
            { id: 4, location: 'XXXXXXXX', containerId: 'xxxxxxxx', inInfo: '「入库编号」\n入库时间', outInfo: '「出库编号」\n出库时间', materialName: 'XXXXXXXX', sealInfo: 'XXXXXXXX', allocateBase: 'XXXXXXXX' },
            { id: 5, location: 'XXXXXXXX', containerId: 'xxxxxxxx', inInfo: '「入库编号」\n入库时间', outInfo: '', materialName: 'XXXXXXXX', sealInfo: 'XXXXXXXX', allocateBase: 'XXXXXXXX' }
          ],
          pagination: { total: 400 }
        }
      })
    }, 500)
  })
}
