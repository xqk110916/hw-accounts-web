import { isNotBlank, objIsEmpty } from '@/utils'

//设计表单属性预处理
export function formDataPretreatment(formData) {
  if (
    !formData ||
    objIsEmpty(formData) ||
    !formData.fields ||
    formData.fields.length <= 0
  ) {
    return
  }

  formData.fields.map((el) => {
    if (el.customStyle && isNotBlank(el.customStyle)) {
      el.customStyle.split(';').map((item) => {
        if (item.indexOf(':') <= 0) {
          return
        }
        el.style[item.split[0]] = item.split[1]
      })
    }
  })
}
