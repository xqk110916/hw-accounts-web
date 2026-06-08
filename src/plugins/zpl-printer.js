import { getPrinterConfig } from '@/views/dataManagement/labelTemplate/components/storage'

const SDK_URL = `${process.env.BASE_URL || '/'}js/ZPL_JSSdk0.0.0.3.js`

class ZplPrinter {
  constructor() {
    this.ws = null
    this.isConnected = false
    this.isConnecting = false
    this.connectPromise = null
    this.messageHandlers = []
  }

  loadSdk() {
    if (window.ZPL_JSSDK) return Promise.resolve(window.ZPL_JSSDK)
    const existed = document.querySelector(`script[src="${SDK_URL}"]`)
    if (existed) {
      return new Promise((resolve, reject) => {
        existed.addEventListener('load', () => resolve(window.ZPL_JSSDK))
        existed.addEventListener('error', () => reject(new Error('ZPL SDK 加载失败')))
      })
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = SDK_URL
      script.onload = () => {
        if (window.ZPL_JSSDK) {
          resolve(window.ZPL_JSSDK)
        } else {
          reject(new Error('ZPL SDK 加载失败'))
        }
      }
      script.onerror = () => reject(new Error('ZPL SDK 加载失败'))
      document.body.appendChild(script)
    })
  }

  async getSdk() {
    return this.loadSdk()
  }

  connect(ip = '127.0.0.1', port = 9099) {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve()
    }
    if (this.isConnecting && this.connectPromise) return this.connectPromise

    this.disconnect()
    this.isConnecting = true
    this.connectPromise = new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://${ip}:${port}`)
      const timer = window.setTimeout(() => {
        this.isConnecting = false
        reject(new Error('连接打印服务超时，请确认 JSSDK 服务已启动'))
        this.disconnect()
      }, 5000)

      ws.onopen = () => {
        window.clearTimeout(timer)
        this.ws = ws
        this.isConnected = true
        this.isConnecting = false
        resolve()
      }
      ws.onerror = () => {
        window.clearTimeout(timer)
        this.isConnecting = false
        this.isConnected = false
        reject(new Error('无法连接打印服务，请确认 JSSDK 服务已启动'))
      }
      ws.onclose = () => {
        this.isConnecting = false
        this.isConnected = false
        if (this.ws === ws) this.ws = null
      }
      ws.onmessage = evt => {
        this.handleMessage(evt.data)
      }
    })

    return this.connectPromise
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
    this.isConnecting = false
    this.connectPromise = null
  }

  /**
   * 构建 interface_detail，格式严格复制 SDK senddata() 函数
   */
  buildInterfaceDetail(interfaceType, options) {
    if (interfaceType === 'USB') {
      return { usb: { sn: options.sn || '' } }
    }
    if (interfaceType === 'NET') {
      return { net: { ip: options.netIp || '', port: String(options.netPort || 9100) } }
    }
    if (interfaceType && interfaceType.startsWith('COM')) {
      const comData = options.comData || {}
      return {
        com: {
          port: comData.port || 'COM1',
          baudrate: comData.baudrate || 115200,
          party: comData.party || 'n',
          databit: comData.databit || 8,
          stopbit: comData.stopbit || 1,
          ctl: comData.ctl || 'n',
        },
      }
    }
    throw new Error('不支持的打印机连接方式')
  }

  /**
   * 发送打印数据，JSON 格式严格复制 SDK senddata() 函数
   * SDK 原始格式：模板字符串拼接 + decodeURIComponent 后整体发送
   */
  sendData(model, builderData, options = {}) {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('打印机未连接，请先连接 JSSDK 服务')
    }
    const config = getPrinterConfig()
    const interfaceType = options.interfaceType || 'USB'
    const interfaceDetail = this.buildInterfaceDetail(interfaceType, options)

    // 严格复制 SDK senddata() 中的模板字符串格式
    const sendDataString = `{
    "model": "${model || config.model}",
    "printerID": "ZPL",
    "interface": "",
    "interface_detail": ${JSON.stringify(interfaceDetail)},
    "printers": [{
        "Items": [${builderData}]
      }]
    }`

    this.ws.send(decodeURIComponent(sendDataString))
  }

  /**
   * 查询打印机状态
   * JSON 格式严格复制 SDK ZPL_GetPrinterStatus 原型方法
   */
  getStatus(model, options = {}) {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('打印机未连接，请先连接 JSSDK 服务')
    }
    const config = getPrinterConfig()
    const interfaceType = options.interfaceType || 'USB'
    const interfaceDetail = this.buildInterfaceDetail(interfaceType, options)

    // 严格复制 SDK ZPL_GetPrinterStatus 中的模板字符串格式
    const sendDataString = `{
        "model": "${model || config.model}",
        "printerID": "ZPL",
        "interface": "",
          "interface_detail": ${JSON.stringify(interfaceDetail)},
        "printers": [{
            "Items": [{
                "itemtype": "ZPL_GetPrinterStatus"
            }]
        }]
    }`

    this.ws.send(sendDataString)
  }

  onMessage(callback) {
    if (typeof callback !== 'function') return () => {}
    this.messageHandlers.push(callback)
    return () => {
      this.messageHandlers = this.messageHandlers.filter(item => item !== callback)
    }
  }

  handleMessage(data) {
    let message = data
    try {
      message = JSON.parse(data)
    } catch (e) {
      message = { raw: data }
    }
    this.messageHandlers.forEach(handler => handler(message))
  }
}

const zplPrinter = new ZplPrinter()

export { ZplPrinter, zplPrinter }
export default zplPrinter
