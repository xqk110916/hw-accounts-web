export const listTemplate = params => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      code: 1, data: {
        list: [{ id: 1, name: '标签模板A', type: 'label', updateTime: '2026-01-01 10:00:00' }],
        pagination: { total: 1 }
      }
    }), 500)
  })
}
export const deleteTemplate = data => { return new Promise(resolve => setTimeout(() => resolve({code:1}), 300)) }
