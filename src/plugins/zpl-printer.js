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

  buildInterfaceDetail(options) {
    const interfaceType = options.interfaceType || 'USB'
    if (interfaceType === 'USB') {
      return { usb: { sn: options.sn || '' } }
    }
    if (interfaceType === 'NET') {
      if (!options.netIp) throw new Error('请输入打印机 IP')
      return { net: { ip: options.netIp, port: options.netPort || 9100 } }
    }
    if (interfaceType === 'COM') {
      const comData = options.comData || {}
      if (!comData.port) throw new Error('请输入串口号')
      return {
        com: {
          port: comData.port,
          baudrate: Number(comData.baudrate) || 115200,
          party: comData.party || 'n',
          databit: Number(comData.databit) || 8,
          stopbit: Number(comData.stopbit) || 1,
          ctl: comData.ctl || 'n',
        },
      }
    }
    throw new Error('不支持的打印机连接方式')
  }

  sendData(model, builderData, options = {}) {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('打印机未连接，请先连接 JSSDK 服务')
    }
    const printData = decodeURIComponent(builderData)
    const payload = {
      model: model || 'HT300',
      printerID: 'ZPL',
      interface: '',
      interface_detail: this.buildInterfaceDetail(options),
      printers: [{ Items: JSON.parse(`[${printData}]`) }],
    }
    this.ws.send(JSON.stringify(payload))
  }

  getStatus(model, options = {}) {
    if (!window.ZPL_JSSDK) throw new Error('ZPL SDK 未加载')
    const builder = new window.ZPL_JSSDK.Builder()
    builder.ZPL_StartFormat()
    builder.ZPL_GetPrinterStatus()
    builder.ZPL_EndFormat()
    this.sendData(model, builder.getPrintData(), options)
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
