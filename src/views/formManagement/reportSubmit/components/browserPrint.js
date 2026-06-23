import { REPORT_PRINT_STYLES } from './reportPrintStyles.js'

/**
 * 打开新窗口执行浏览器打印
 * @param {HTMLElement} element - 需要打印的 DOM 节点
 * @param {Object} options
 * @param {string} [options.title='打印'] - 打印窗口标题
 * @param {string} [options.styles] - 注入的打印样式
 */
export function openBrowserPrint(element, options = {}) {
  if (!element) return false

  const { title = '打印', styles = REPORT_PRINT_STYLES } = options
  const newWin = window.open('', '_blank')
  if (!newWin) return false

  newWin.document.write(`
    <html><head><title>${title}</title>
    <style>
      ${styles}
    </style>
    </head><body>${element.innerHTML}</body></html>
  `)
  newWin.document.close()
  newWin.focus()
  newWin.print()
  newWin.close()
  return true
}