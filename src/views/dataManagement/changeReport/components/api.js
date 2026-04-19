export const listChangeReport = params => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 1,
        data: {
          list: [
            { id: 1, type: 'in', materialCode: 'XXXXXXXX', materialName: '材料A', time: '2025-10-10', changeAmount: '+10', stockLocation: '位置A' },
            { id: 2, type: 'out', materialCode: 'XXXXXXXX', materialName: '材料B', time: '2025-10-11', changeAmount: '-5', stockLocation: '位置B' },
          ],
          pagination: { total: 200 }
        }
      })
    }, 500)
  })
}
