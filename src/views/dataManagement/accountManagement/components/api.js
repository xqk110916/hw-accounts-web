export const listAccount = params => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 1,
        data: {
          title: `${params.year || '2026'}年总账`,
          list: [
            { id: 1, date: '2026-01-01', abstract: '期初余额', income: '', expense: '', balance: '500000', reviewer: 'admin' },
            { id: 2, date: '2026-02-15', abstract: '采购批次A', income: '10000', expense: '', balance: '510000', reviewer: 'admin' },
          ],
          pagination: { total: 2 }
        }
      })
    }, 500)
  })
}
