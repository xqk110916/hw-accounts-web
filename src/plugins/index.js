import auth from './auth'
import cache from './cache'
import modal from './modal'
import download from './download'
import zplPrinter from './zpl-printer'

export default {
  install(Vue) {
    // 认证对象
    Vue.prototype.$auth = auth
    // 缓存对象
    Vue.prototype.$cache = cache
    // 模态框对象
    Vue.prototype.$modal = modal
    // 下载文件
    Vue.prototype.$download = download
    // ZPL 标签打印
    Vue.prototype.$zplPrinter = zplPrinter
  }
}
