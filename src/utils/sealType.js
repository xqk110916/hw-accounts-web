import { getDictionaryList } from '@/api/common/dictionary.js'

export const SEAL_TYPE_PARENT_ID = '2052628107427078145'

let sealTypeOptionsCache = null

export function getSealTypeOptions() {
  if (sealTypeOptionsCache) return Promise.resolve(sealTypeOptionsCache)
  return getDictionaryList({
    parentId: SEAL_TYPE_PARENT_ID,
    currentPage: 1,
    pageSize: 999,
  }).then(res => {
    const list = (res && res.code === 1 && res.data && res.data.list) || []
    sealTypeOptionsCache = list.map(item => ({
      label: item.fullName,
      value: item.dictValue,
    }))
    return sealTypeOptionsCache
  })
}

export function formatSealType(options, value) {
  if (value === undefined || value === null || value === '') return '-'
  const option = (options || []).find(item => String(item.value) === String(value))
  return option ? option.label : value
}
