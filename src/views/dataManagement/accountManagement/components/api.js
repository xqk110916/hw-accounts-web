import request from '@/utils/request'

export const listLedger = data => {
  return request({ url: '/busin/statist/ledger', method: 'post', data })
}

export const exportLedger = data => {
  return request({ url: '/busin/statist/ledger/export', method: 'post', data, responseType: 'blob' })
}

export const listLedgerSummary = data => {
  return request({ url: '/busin/statist/ledger/summary', method: 'post', data })
}

export const listLedgerDetail = data => {
  return request({ url: '/busin/statist/ledger/detail', method: 'post', data })
}

export const exportLedgerSummary = data => {
  return request({ url: '/busin/statist/ledger/summary/export', method: 'post', data, responseType: 'blob' })
}

export const exportLedgerDetail = data => {
  return request({ url: '/busin/statist/ledger/detail/export', method: 'post', data, responseType: 'blob' })
}
