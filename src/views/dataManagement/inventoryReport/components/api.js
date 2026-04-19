export const listInventoryReport = params => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 1,
        data: {
          list: [
            { id: 1, detail: '100100', materialCode: 'XXXXXXXX', materialName: '材料A', stock: '89.2', unit: '包', totalWeight: '942.2' },
            { id: 2, detail: '100101', materialCode: 'XXXXXXXX', materialName: '材料B', stock: '12.0', unit: 'kg', totalWeight: '12.0' },
          ],
          pagination: { total: 100 },
          extra: { totalStock: '101.2', totalWeight: '954.2' }
        }
      })
    }, 500)
  })
}
