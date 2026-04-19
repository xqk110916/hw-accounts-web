import { listAccount } from './api.js'

export const config = {
  table: [
    { label: '日期', prop: 'date' },
    { label: '摘要', prop: 'abstract' },
    { label: '收入', prop: 'income' },
    { label: '支出', prop: 'expense' },
    { label: '结存', prop: 'balance' },
    { label: '审核人', prop: 'reviewer' },
  ],
  search: [
    { label: '年份', prop: 'year', type: 'year', col: 6 },
    { label: '项目类别', prop: 'category', type: 'select', col: 6, option: [{label: '类别1', value: '1'}] },
  ]
}

export const requestFun = { list: listAccount }
export const getDefaultOptions = async () => {}
