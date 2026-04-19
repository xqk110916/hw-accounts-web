export const listSealLedger = params => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 1,
        data: {
          list: [
            { id: 1, materialCode: 'XXXXXXXX', materialName: '材料A', status: 'normal', amount: '10' },
            { id: 2, materialCode: 'XXXXXXXX', materialName: '材料B', status: 'damaged', amount: '2' },
          ],
          pagination: { total: 50 }
        }
      })
    }, 500)
  })
}
export const batchDeleteSeal = data => {
  return new Promise(resolve => { setTimeout(() => resolve({code: 1}), 500) })
}
