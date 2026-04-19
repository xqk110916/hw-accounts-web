export const listMaterial = params => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 1,
        data: {
          list: [
            { id: 1, materialCode: 'M1001', materialName: '材料A', unit: '本', specification: 'A4', price: '10.5', status: 'enable' },
            { id: 2, materialCode: 'M1002', materialName: '材料B', unit: '个', specification: 'X1', price: '2.5', status: 'disable' },
          ],
          pagination: { total: 20 }
        }
      })
    }, 500)
  })
}
export const deleteMaterial = data => { return new Promise(resolve => setTimeout(() => resolve({code:1}), 300)) }
