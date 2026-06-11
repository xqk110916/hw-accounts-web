# ZPL JSSDK Vue 对接文档

## 目录

- [1. 概述](#1-概述)
- [2. 环境准备](#2-环境准备)
- [3. SDK 集成](#3-sdk-集成)
- [4. 核心架构](#4-核心架构)
- [5. 连接管理](#5-连接管理)
- [6. 指令构建器 API 详解](#6-指令构建器-api-详解)
- [7. 业务场景：材料卡模板打印](#7-业务场景材料卡模板打印)
- [8. 完整 Vue 组件示例](#8-完整-vue-组件示例)
- [9. 状态查询](#9-状态查询)
- [10. 错误处理与最佳实践](#10-错误处理与最佳实践)
- [11. 常见问题 FAQ](#11-常见问题-faq)

---

## 1. 概述

本文档描述如何在 Vue 项目中集成 ZPL 标签打印机 JSSDK，实现标签模板（如材料卡）的编辑和打印功能。

### 工作原理

```
Vue 前端 ──WebSocket──> JSSDK 后端服务(localhost:9099) ──USB/NET/COM──> ZPL 打印机
```

- **前端**：通过 JS SDK 构建打印指令，经 WebSocket 发送到本地 JSSDK 后端服务
- **后端服务**：JSSDK 服务程序（需安装），负责与打印机硬件通信
- **打印机**：通过 USB、网络或串口连接

### 支持的连接方式

| 连接方式 | 说明 | 适用场景 |
|----------|------|----------|
| USB | 通过 USB 线直连打印机 | 单机使用，最常见 |
| NET | 通过 TCP/IP 网络连接 | 网络打印机，多终端共享 |
| COM | 通过串口连接 | 工业环境，老式设备 |

---

## 2. 环境准备

### 2.1 安装 JSSDK 后端服务

根据操作系统选择安装包：

| 系统 | 安装包 |
|------|--------|
| Windows | `package/win/jssdk_v2.0.2.22_win.exe` |
| Linux x86_64 (Ubuntu) | `package/nix/x86_64/ubuntu/jssdk_v2.0.2.22_x86_64.deb` |
| Linux aarch64 (Kylin) | `package/nix/aarch64/kylin/jssdk_v2.0.2.22_aarch64.deb` |

**Windows 安装**：双击 `jssdk_v2.0.2.22_win.exe`，按提示完成安装。

**验证服务运行**：

```bash
# 检查 9099 端口是否监听
netstat -an | findstr 9099    # Windows
netstat -an | grep 9099       # Linux
```

服务启动后监听 `ws://127.0.0.1:9099`。

### 2.2 Vue 项目要求

- Vue 2.x 或 Vue 3.x 均可
- 浏览器需支持 WebSocket（所有现代浏览器均支持）

---

## 3. SDK 集成

### 3.1 引入 SDK 文件

将 `demo/ZPL/js/ZPL_JSSdk0.0.0.3.js` 复制到 Vue 项目的 `public/js/` 或 `src/utils/` 目录下。

**方式一：通过 public/index.html 引入（推荐，简单直接）**

```html
<!-- public/index.html -->
<script src="<%= BASE_URL %>js/ZPL_JSSdk0.0.0.3.js"></script>
```

引入后，`ZPL_JSSDK` 对象挂载在 `window` 上，全局可访问。

**方式二：在 Vue 组件中动态加载**

```js
// src/utils/loadZplSdk.js
export function loadZplSdk() {
  return new Promise((resolve, reject) => {
    if (window.ZPL_JSSDK) {
      resolve(window.ZPL_JSSDK)
      return
    }
    const script = document.createElement('script')
    script.src = '/js/ZPL_JSSdk0.0.0.3.js'
    script.onload = () => resolve(window.ZPL_JSSDK)
    script.onerror = () => reject(new Error('ZPL SDK 加载失败'))
    document.head.appendChild(script)
  })
}
```

### 3.2 封装 Vue 插件（推荐）

创建 `src/plugins/zpl-printer.js`：

```js
// src/plugins/zpl-printer.js

/**
 * ZPL 打印机 Vue 插件
 * 提供连接管理、指令构建、打印发送的完整能力
 */
class ZplPrinter {
  constructor() {
    this.ws = null
    this.isConnected = false
    this.isConnecting = false
    this._resolveConnect = null
    this._rejectConnect = null
  }

  /**
   * 建立 WebSocket 连接
   * @param {string} ip - JSSDK 服务地址，默认 127.0.0.1
   * @param {string|number} port - JSSDK 服务端口，默认 9099
   * @returns {Promise}
   */
  connect(ip = '127.0.0.1', port = 9099) {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve()
        return
      }
      if (this.isConnecting) {
        // 如果正在连接中，等待连接完成
        this._resolveConnect = resolve
        this._rejectConnect = reject
        return
      }

      this.isConnecting = true
      this._resolveConnect = resolve
      this._rejectConnect = reject

      try {
        this.ws = new WebSocket(`ws://${ip}:${port}`)
      } catch (e) {
        this.isConnecting = false
        reject(new Error('WebSocket 创建失败，请检查 JSSDK 服务是否运行'))
        return
      }

      this.ws.onopen = () => {
        console.log('[ZPL] 连接已建立')
        this.isConnecting = false
        this.isConnected = true
        this._resolveConnect && this._resolveConnect()
      }

      this.ws.onerror = (e) => {
        console.error('[ZPL] 连接错误', e)
        this.isConnecting = false
        this._rejectConnect && this._rejectConnect(new Error('网络连接服务失败，请检查 JSSDK 服务是否启动'))
      }

      this.ws.onclose = (e) => {
        console.log('[ZPL] 连接已关闭', e.code)
        this.isConnected = false
        this.isConnecting = false
        this.ws = null
      }

      this.ws.onmessage = (evt) => {
        this._handleMessage(evt.data)
      }
    })
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.isConnected = false
      this.ws = null
    }
  }

  /**
   * 发送打印数据
   * @param {string} model - 打印机型号，如 'HT300', 'iD4P'
   * @param {string} builderData - Builder 构建的指令数据
   * @param {object} options - 连接选项
   * @param {string} options.interfaceType - 接口类型: 'USB' | 'NET' | 'COM'
   * @param {string} options.sn - USB 设备 SN 号（可为空，自动识别）
   * @param {string} options.netIp - NET 模式下打印机 IP
   * @param {string|number} options.netPort - NET 模式下打印机端口
   * @param {object} options.comData - COM 模式下的串口参数
   */
  sendData(model, builderData, options = {}) {
    if (!this.isConnected) {
      throw new Error('打印机未连接，请先调用 connect()')
    }

    const {
      interfaceType = 'USB',
      sn = '',
      netIp = '',
      netPort = 9100,
      comData = {}
    } = options

    let interfaceDetail = {}

    if (interfaceType === 'USB') {
      interfaceDetail = { usb: { sn: sn || '' } }
    } else if (interfaceType === 'NET') {
      interfaceDetail = { net: { ip: netIp, port: netPort } }
    } else if (interfaceType === 'COM') {
      interfaceDetail = {
        com: {
          port: comData.port || 'COM1',
          baudrate: comData.baudrate || 115200,
          party: comData.party || 'n',
          databit: comData.databit || 8,
          stopbit: comData.stopbit || 1,
          ctl: comData.ctl || 'n'
        }
      }
    }

    const sendData = JSON.stringify({
      model: model,
      printerID: 'ZPL',
      interface: '',
      interface_detail: interfaceDetail,
      printers: [{
        Items: JSON.parse(`[${builderData}]`)
      }]
    })

    this.ws.send(sendData)
  }

  /**
   * 处理返回消息
   * @private
   */
  _handleMessage(data) {
    const obj = JSON.parse(data)
    // 触发自定义事件，让 Vue 组件监听
    if (this._onMessage) {
      this._onMessage(obj)
    }
  }

  /**
   * 设置消息回调
   * @param {Function} callback
   */
  onMessage(callback) {
    this._onMessage = callback
  }
}

// 创建单例
const zplPrinter = new ZplPrinter()

// Vue 插件安装方法
const ZplPrinterPlugin = {
  install(app) {
    // Vue 3
    if (app.config && app.config.globalProperties) {
      app.config.globalProperties.$zplPrinter = zplPrinter
      app.provide('zplPrinter', zplPrinter)
    }
    // Vue 2
    else if (app.prototype) {
      app.prototype.$zplPrinter = zplPrinter
    }
  }
}

export { zplPrinter, ZplPrinterPlugin }
export default ZplPrinterPlugin
```

### 3.3 注册插件

**Vue 3 (`main.js`)**：

```js
import { createApp } from 'vue'
import App from './App.vue'
import ZplPrinterPlugin from './plugins/zpl-printer'

const app = createApp(App)
app.use(ZplPrinterPlugin)
app.mount('#app')
```

**Vue 2 (`main.js`)**：

```js
import Vue from 'vue'
import App from './App.vue'
import ZplPrinterPlugin from './plugins/zpl-printer'

Vue.use(ZplPrinterPlugin)

new Vue({
  render: h => h(App)
}).$mount('#app')
```

---

## 4. 核心架构

### 4.1 两个核心对象

| 对象 | 职责 | 说明 |
|------|------|------|
| `ZPL_JSSDK.Builder` | 构建打印指令 | 链式调用各种方法组装打印数据 |
| `ZPL_JSSDK.Printer` | 管理打印机连接和发送 | 配置打印机参数，发送数据 |

### 4.2 打印流程

```
1. 创建 Builder 实例
2. 调用 Builder 方法构建打印指令（文本、条码、图形等）
3. 获取构建好的数据字符串 builder.getPrintData()
4. 通过 WebSocket 发送到 JSSDK 后端
5. 后端转发给打印机执行
```

### 4.3 指令数据格式

Builder 构建的每条指令都是一个 JSON 对象，多个指令以逗号拼接：

```json
[
  {"itemtype": "ZPL_StartFormat"},
  {"itemtype": "ZPL_SetLabelLength", "length": 600},
  {"itemtype": "ZPL_Text", "xPos": 100, "yPos": 100, "fontNum": 16, "orientation": 0, "fontWidth": 30, "fontHeight": 30, "text": "Hello"},
  {"itemtype": "ZPL_EndFormat"}
]
```

---

## 5. 连接管理

### 5.1 连接参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| ip | 127.0.0.1 | JSSDK 后端服务地址（非打印机 IP） |
| port | 9099 | JSSDK 后端服务端口 |

> **注意**：这里的 IP/端口是 JSSDK 后端服务的地址，不是打印机的地址。打印机地址在 `interface_detail` 中配置。

### 5.2 USB 连接（最常用）

```js
// 连接 JSSDK 服务
await zplPrinter.connect('127.0.0.1', 9099)

// 发送打印（USB 模式，SN 为空自动识别）
zplPrinter.sendData('HT300', builderData, {
  interfaceType: 'USB',
  sn: ''  // 传空则自动识别 USB 设备
})

// 如果有多个 USB 打印机，可通过 SN 号指定
zplPrinter.sendData('HT300', builderData, {
  interfaceType: 'USB',
  sn: 'S/N:ABC123456'  // 打印机底部标签上的 SN 号
})
```

### 5.3 网络连接

```js
await zplPrinter.connect('127.0.0.1', 9099)

zplPrinter.sendData('HT300', builderData, {
  interfaceType: 'NET',
  netIp: '192.168.1.100',   // 打印机的 IP 地址
  netPort: 9100               // 打印机的端口，默认 9100
})
```

### 5.4 串口连接

```js
await zplPrinter.connect('127.0.0.1', 9099)

zplPrinter.sendData('HT300', builderData, {
  interfaceType: 'COM',
  comData: {
    port: 'COM1',        // 串口号
    baudrate: 115200,     // 波特率
    party: 'n',           // 奇偶校验: n/o/e/m/s
    databit: 8,           // 数据位: 4/5/6/7/8
    stopbit: 1,           // 停止位: 1/1.5/2
    ctl: 'n'              // 流控: n/p/c/d/x
  }
})
```

---

## 6. 指令构建器 API 详解

### 6.1 格式控制

每个打印任务必须以 `ZPL_StartFormat` 开始，以 `ZPL_EndFormat` 结束。

```js
const builder = new ZPL_JSSDK.Builder()

builder.ZPL_StartFormat()
// ... 打印内容 ...
builder.ZPL_EndFormat()
```

### 6.2 标签设置

| 方法 | 参数 | 说明 |
|------|------|------|
| `ZPL_SetLabelLength(length)` | `length`: 标签长度(dot) | 设置标签长度，1mm ≈ 8dot (203dpi) |
| `ZPL_SetPrintWidth(width)` | `width`: 打印宽度(dot) | 设置打印宽度 |
| `ZPL_SetPrintDarkness(darkness)` | `darkness`: 0-30 | 设置打印浓度 |
| `ZPL_SetPrintRate(printSpeed, slewSpeed, backfeedSpeed)` | 速度值 | 设置打印速度 |
| `ZPL_SetLabelTop(top)` | `top`: 偏移量(dot) | 标签顶部偏移 |
| `ZPL_SetLabelShift(shift)` | `shift`: 偏移量(dot) | 标签左右偏移 |

```js
builder.ZPL_StartFormat()
builder.ZPL_SetLabelLength(600)    // 标签长度 600dot ≈ 75mm
builder.ZPL_SetPrintWidth(800)     // 打印宽度 800dot ≈ 100mm
builder.ZPL_SetPrintDarkness(15)   // 浓度 15（中等）
// ... 打印内容 ...
builder.ZPL_EndFormat()
```

### 6.3 中文与编码

打印中文前必须设置字体编码：

```js
builder.ZPL_SetChangeFontEncoding(14)  // 14 = GBK 编码，支持中文
```

**已知的 encodeType 值**：

| 值 | 编码 | 适用场景 |
|----|------|----------|
| 14 | GBK | 中文（Demo 中使用，推荐） |

> **注意**：如果中文打印出现乱码，尝试不同的 encodeType 值，或联系打印机厂商确认。

### 6.4 文本打印

#### 单行文本 `ZPL_Text`

```js
builder.ZPL_Text(xPos, yPos, fontNum, orientation, fontWidth, fontHeight, text)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| xPos | Number | X 坐标(dot) |
| yPos | Number | Y 坐标(dot) |
| fontNum | Number | 字体编号（0-9，A-Z，a-z），常用 16 |
| orientation | Number | 方向：0=正常, 1=90°, 2=180°, 3=270° |
| fontWidth | Number | 字体宽度(dot) |
| fontHeight | Number | 字体高度(dot) |
| text | String | 文本内容（支持中文，需先设置编码） |

```js
// 在坐标(100, 100)处打印"材料名称"，字体 30x30 dot
builder.ZPL_Text(100, 100, 16, 0, 30, 30, '材料名称：钢材A3')
```

#### 可缩放字体文本 `ZPL_ScalableFontText`

```js
builder.ZPL_ScalableFontText(xPos, yPos, fontName, orientation, fontWidth, fontHeight, text)
```

| 参数 | 说明 |
|------|------|
| fontName | 字体名称，如 "C"（内置中文字体） |

```js
builder.ZPL_ScalableFontText(100, 100, 'C', 0, 25, 25, '可缩放字体文本')
```

#### 多行文本（自动换行）`ZPL_Text_Block`

```js
builder.ZPL_Text_Block(xPos, yPos, fontNum, orientation, fontWidth, fontHeight, textblockWidth, textblockHeight, text)
```

| 参数 | 说明 |
|------|------|
| textblockWidth | 文本块宽度(dot)，超过此宽度自动换行 |
| textblockHeight | 文本块高度(dot) |

```js
// 在(100, 400)处打印多行文本，文本块宽 500dot，高 200dot
builder.ZPL_Text_Block(100, 400, 16, 0, 24, 24, 500, 200, '备注：这是一段很长的备注信息，会自动换行显示')
```

#### 增强多行文本 `ZPL_Text_BlockEx`

```js
builder.ZPL_Text_BlockEx(xPos, yPos, fontNum, orientation, fontWidth, fontHeight, textblockWidth, maxline, align, hline_spacing, vline_spacing, text)
```

| 参数 | 说明 |
|------|------|
| textblockWidth | 文本块宽度(dot) |
| maxline | 最大行数 |
| align | 对齐方式：0=左对齐, 1=居中, 2=右对齐 |
| hline_spacing | 水平行间距(dot) |
| vline_spacing | 垂直行间距(dot) |

```js
// 居中对齐，最大 3 行，行间距 5dot
builder.ZPL_Text_BlockEx(100, 400, 16, 0, 24, 24, 500, 3, 1, 5, 5, '备注内容自动换行居中显示')
```

### 6.5 二维码 `ZPL_QRCode`

```js
builder.ZPL_QRCode(xPos, yPos, orientation, model, dpi, eccLevel, input, charMode, text)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| xPos | Number | X 坐标(dot) |
| yPos | Number | Y 坐标(dot) |
| orientation | Number | 方向：0/1/2/3 |
| model | Number | 型号：1=Model 1, 2=Model 2（推荐） |
| dpi | Number | 密度，影响二维码大小 |
| eccLevel | String | 纠错等级：L/M/Q/H |
| input | String | 输入模式："A"=自动 |
| charMode | String | 编码模式："A"=自动, "B"=手动 |
| text | String | 二维码内容 |

```js
// 打印二维码，内容为材料代码
builder.ZPL_QRCode(600, 100, 0, 2, 6, 'M', 'A', 'A', 'MAT-20250101-001')
```

### 6.6 条形码

#### Code 128（最常用）`ZPL_BarCode128`

```js
builder.ZPL_BarCode128(xPos, yPos, orientation, moduleWidth, codeHeight, line, lineAboveCode, checkDigit, mode, text)
```

| 参数 | 说明 |
|------|------|
| moduleWidth | 模块宽度(dot) |
| codeHeight | 条码高度(dot) |
| line | 是否显示校验位："Y"/"N" |
| lineAboveCode | 条码上方是否显示字符："Y"/"N" |
| checkDigit | 校验位模式 |
| mode | 编码模式 |

```js
builder.ZPL_BarCode128(100, 500, 0, 2, 60, 'Y', 'Y', 'Y', 'A', 'ABC123456')
```

#### Code 39 `ZPL_BarCode39`

```js
builder.ZPL_BarCode39(xPos, yPos, orientation, moduleWidth, codeHeight, line, lineAboveCode, digit, text)
```

#### EAN-13 `ZPL_CodeEan13`

```js
builder.ZPL_CodeEan13(xPos, yPos, orientation, moduleWidth, codeHeight, line, lineAboveCode, text)
```

### 6.7 图形绘制

#### 矩形框 `ZPL_GraphicBox`（用于表格边框和格线）

```js
builder.ZPL_GraphicBox(xPos, yPos, width, height, thickness, rounding)
```

| 参数 | 说明 |
|------|------|
| xPos | X 坐标(dot) |
| yPos | Y 坐标(dot) |
| width | 宽度(dot) |
| height | 高度(dot) |
| thickness | 线条粗细(dot)，0=填充 |
| rounding | 圆角半径(0-8)，0=直角 |

```js
// 画一个矩形框，线宽 2dot，直角
builder.ZPL_GraphicBox(50, 50, 700, 500, 2, 0)

// 画一条横线（高度为 1 的矩形）
builder.ZPL_GraphicBox(50, 150, 700, 1, 2, 0)

// 画一条竖线（宽度为 1 的矩形）
builder.ZPL_GraphicBox(400, 50, 1, 200, 2, 0)
```

#### 圆形 `ZPL_GraphicCircle`

```js
builder.ZPL_GraphicCircle(xPos, yPos, diameter, thickness)
```

#### 椭圆 `ZPL_GraphicEllipse`

```js
builder.ZPL_GraphicEllipse(xPos, yPos, width, height, thickness)
```

### 6.8 图片打印

#### 打印机存储图片 `ZPL_PrintImage`

```js
builder.ZPL_PrintImage(xPos, yPos, imgName)
```

`imgName` 为打印机存储器中的图片名称（需先通过其他方式下载到打印机）。

#### Base64 图片流打印 `ZPL_PrintImageStream`

```js
builder.ZPL_PrintImageStream(xPos, yPos, imgdata)
```

`imgdata` 为图片的 Base64 编码字符串。

#### PDF 打印 `ZPL_PrintPDF`

```js
builder.ZPL_PrintPDF(xPos, yPos, width, height, xspace, yspace, dpi, pdfdata)
```

### 6.9 打印控制

| 方法 | 参数 | 说明 |
|------|------|------|
| `ZPL_SetPrintQuantity(total, pause, replicates, override)` | 打印份数相关参数 | 设置打印数量 |
| `ZPL_SetPrintMode(mode, prePeelSelect)` | mode, prePeelSelect | 设置打印模式 |
| `ZPL_SetPrintOrientation(orientation)` | orientation | 设置打印方向 |
| `ZPL_SetLabelReversePrint(enable)` | enable | 反转打印（镜像） |
| `ZPL_SetReprintAfterError(pEnable)` | pEnable | 错误后重新打印 |

```js
// 打印 3 份
builder.ZPL_SetPrintQuantity(3, 0, 1, 'Y')
```

### 6.10 查询指令

| 方法 | 说明 |
|------|------|
| `ZPL_GetPrinterStatus()` | 查询打印机状态 |
| `ZPL_GetPrinterName()` | 查询打印机名称 |
| `ZPL_GetPrinterDpi()` | 查询打印机分辨率 |
| `ZPL_GetPrinterFirmwareVersion()` | 查询固件版本 |
| `ZPL_GetPrinterMacAddress()` | 查询 MAC 地址 |
| `ZPL_GetPrinterSeriesNumber()` | 查询序列号 |
| `ZPL_GetPrinterOdometer()` | 查询打印里程 |
| `ZPL_GetLabelLength()` | 查询标签长度 |
| `ZPL_GetLabelWidth()` | 查询标签宽度 |

---

## 7. 业务场景：材料卡模板打印

### 7.1 材料卡布局设计

```
标签尺寸: 100mm × 75mm (800 × 600 dot @ 203dpi)

┌───────────────────────────────────────────────┐ Y=50
│                  材 料 卡                      │
├────────────────┬──────────────────────────────┤ Y=130
│ 材料名称       │                              │
│                │                              │
├────────────────┤          二维码               │
│ 规    格       │         (QR Code)            │
├────────────────┤                              │
│ 批 次 号       │                              │
├────────────────┼──────────────────────────────┤ Y=350
│ 数    量       │                              │
├────────────────┤     条形码                    │
│ 生产日期       │     (Barcode)                │
├────────────────┼──────────────────────────────┤ Y=480
│ 备    注       │                              │
└────────────────┴──────────────────────────────┘ Y=550
X=50    X=250    X=350                    X=750
```

### 7.2 坐标规划表

| 元素 | X | Y | 宽度 | 字号 | 说明 |
|------|---|---|------|------|------|
| 标题"材料卡" | 300 | 60 | - | 40×40 | 居中，加粗 |
| "材料名称"标签 | 60 | 140 | - | 24×24 | 左侧标签 |
| 材料名称值 | 250 | 140 | 350 | 24×24 | 右侧值 |
| "规格"标签 | 60 | 200 | - | 24×24 | |
| 规格值 | 250 | 200 | 350 | 24×24 | |
| "批次号"标签 | 60 | 260 | - | 24×24 | |
| 批次号值 | 250 | 260 | 350 | 24×24 | |
| "数量"标签 | 60 | 320 | - | 24×24 | |
| 数量值 | 250 | 320 | 350 | 24×24 | |
| "生产日期"标签 | 60 | 380 | - | 24×24 | |
| 生产日期值 | 250 | 380 | 350 | 24×24 | |
| "备注"标签 | 60 | 440 | - | 24×24 | |
| 备注值 | 250 | 440 | 350 | 24×24 | 多行文本 |
| 二维码 | 580 | 140 | - | - | 包含材料代码 |
| 条形码 | 500 | 400 | - | - | 包含材料代码 |

### 7.3 构建打印数据

```js
function buildMaterialCard(data) {
  const builder = new ZPL_JSSDK.Builder()

  // ========== 格式开始 ==========
  builder.ZPL_StartFormat()

  // ========== 基础设置 ==========
  builder.ZPL_SetLabelLength(600)         // 标签长度 600dot
  builder.ZPL_SetPrintWidth(800)          // 打印宽度 800dot
  builder.ZPL_SetChangeFontEncoding(14)   // GBK 编码，支持中文
  builder.ZPL_SetPrintQuantity(1, 0, 1, 'Y')  // 打印 1 份

  // ========== 表格外框 ==========
  // 整个表格外框: (50, 50) 到 (750, 550)
  builder.ZPL_GraphicBox(50, 50, 700, 500, 2, 0)

  // ========== 标题行 ==========
  // 标题横线 (Y=130)
  builder.ZPL_GraphicBox(50, 120, 700, 1, 2, 0)
  // 标题文字
  builder.ZPL_Text(280, 65, 16, 0, 40, 40, '材 料 卡')

  // ========== 左侧标签列分隔线 ==========
  // 标签列右竖线 (X=250, Y=130 到 Y=480)
  builder.ZPL_GraphicBox(250, 120, 1, 360, 2, 0)

  // ========== 右侧区域分隔线（二维码/条码区域） ==========
  // 右侧竖线 (X=550, Y=130 到 Y=480)
  builder.ZPL_GraphicBox(550, 120, 1, 360, 2, 0)

  // ========== 各行横线 ==========
  const rowY = [190, 250, 310, 370, 430]
  rowY.forEach(y => {
    builder.ZPL_GraphicBox(50, y, 500, 1, 1, 0)  // 左侧行线到竖线处
  })

  // ========== 填写标签文字（左侧固定标签） ==========
  builder.ZPL_Text(70, 140, 16, 0, 24, 24, '材料名称')
  builder.ZPL_Text(70, 200, 16, 0, 24, 24, '规    格')
  builder.ZPL_Text(70, 260, 16, 0, 24, 24, '批 次 号')
  builder.ZPL_Text(70, 320, 16, 0, 24, 24, '数    量')
  builder.ZPL_Text(70, 380, 16, 0, 24, 24, '生产日期')
  builder.ZPL_Text(70, 440, 16, 0, 24, 24, '备    注')

  // ========== 填写数据值（右侧动态内容） ==========
  builder.ZPL_Text(260, 140, 16, 0, 24, 24, data.name || '')
  builder.ZPL_Text(260, 200, 16, 0, 24, 24, data.spec || '')
  builder.ZPL_Text(260, 260, 16, 0, 24, 24, data.batch || '')
  builder.ZPL_Text(260, 320, 16, 0, 24, 24, data.quantity || '')
  builder.ZPL_Text(260, 380, 16, 0, 24, 24, data.date || '')

  // 备注（多行文本）
  if (data.remark) {
    builder.ZPL_Text_Block(260, 440, 16, 0, 20, 20, 280, 50, data.remark)
  }

  // ========== 二维码 ==========
  // 二维码内容：材料代码（JSON 格式方便扫码解析）
  const qrContent = JSON.stringify({
    code: data.code,
    name: data.name,
    batch: data.batch
  })
  builder.ZPL_QRCode(590, 160, 0, 2, 6, 'M', 'A', 'A', qrContent)

  // ========== 条形码 ==========
  builder.ZPL_BarCode128(560, 400, 0, 2, 60, 'Y', 'Y', 'Y', 'A', data.code || '')

  // ========== 格式结束 ==========
  builder.ZPL_EndFormat()

  return builder.getPrintData()
}
```

### 7.4 调用打印

```js
import { zplPrinter } from '@/plugins/zpl-printer'

async function printMaterialCard(materialData) {
  try {
    // 1. 建立连接
    await zplPrinter.connect('127.0.0.1', 9099)

    // 2. 构建打印数据
    const printData = buildMaterialCard(materialData)

    // 3. 发送打印
    zplPrinter.sendData('HT300', printData, {
      interfaceType: 'USB',
      sn: ''
    })

    console.log('打印任务已发送')
  } catch (error) {
    console.error('打印失败:', error.message)
  }
}

// 使用示例
printMaterialCard({
  code: 'MAT-20250101-001',
  name: 'Q235B 碳钢板',
  spec: '10mm × 1500mm × 6000mm',
  batch: 'B2025010101',
  quantity: '50 张',
  date: '2025-01-01',
  remark: '存放于A区3号库位，注意防潮'
})
```

---

## 8. 完整 Vue 组件示例

### 8.1 MaterialCardPrinter.vue

```vue
<template>
  <div class="material-card-printer">
    <!-- 连接状态 -->
    <div class="connection-bar">
      <span :class="['status-dot', isConnected ? 'connected' : 'disconnected']"></span>
      <span>{{ isConnected ? '已连接' : '未连接' }}</span>
      <button @click="handleConnect" :disabled="isConnecting">
        {{ isConnecting ? '连接中...' : (isConnected ? '断开' : '连接') }}
      </button>
    </div>

    <!-- 打印机配置 -->
    <div class="printer-config">
      <div class="form-row">
        <label>JSSDK 服务地址：</label>
        <input v-model="config.ip" placeholder="127.0.0.1" />
        <label>端口：</label>
        <input v-model="config.port" placeholder="9099" />
      </div>
      <div class="form-row">
        <label>打印机型号：</label>
        <input v-model="config.model" placeholder="HT300" />
        <label>连接方式：</label>
        <select v-model="config.interfaceType">
          <option value="USB">USB</option>
          <option value="NET">网络</option>
          <option value="COM">串口</option>
        </select>
      </div>
      <!-- 网络模式配置 -->
      <div v-if="config.interfaceType === 'NET'" class="form-row">
        <label>打印机 IP：</label>
        <input v-model="config.netIp" placeholder="192.168.1.100" />
        <label>端口：</label>
        <input v-model="config.netPort" placeholder="9100" />
      </div>
      <!-- 串口模式配置 -->
      <div v-if="config.interfaceType === 'COM'" class="form-row">
        <label>串口号：</label>
        <select v-model="config.comData.port">
          <option v-for="n in 10" :key="n" :value="'COM' + n">COM{{ n }}</option>
        </select>
        <label>波特率：</label>
        <select v-model="config.comData.baudrate">
          <option value="9600">9600</option>
          <option value="19200">19200</option>
          <option value="38400">38400</option>
          <option value="57600">57600</option>
          <option value="115200">115200</option>
        </select>
      </div>
    </div>

    <!-- 材料信息表单 -->
    <div class="material-form">
      <h3>材料信息</h3>
      <div class="form-grid">
        <div class="form-item">
          <label>材料代码：</label>
          <input v-model="material.code" placeholder="MAT-20250101-001" />
        </div>
        <div class="form-item">
          <label>材料名称：</label>
          <input v-model="material.name" placeholder="Q235B 碳钢板" />
        </div>
        <div class="form-item">
          <label>规格：</label>
          <input v-model="material.spec" placeholder="10mm × 1500mm × 6000mm" />
        </div>
        <div class="form-item">
          <label>批次号：</label>
          <input v-model="material.batch" placeholder="B2025010101" />
        </div>
        <div class="form-item">
          <label>数量：</label>
          <input v-model="material.quantity" placeholder="50 张" />
        </div>
        <div class="form-item">
          <label>生产日期：</label>
          <input v-model="material.date" type="date" />
        </div>
        <div class="form-item full-width">
          <label>备注：</label>
          <textarea v-model="material.remark" rows="2" placeholder="存放于A区3号库位"></textarea>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button @click="handleCheckStatus" :disabled="!isConnected">查询状态</button>
      <button @click="handlePrint" :disabled="!isConnected || isPrinting" class="btn-print">
        {{ isPrinting ? '打印中...' : '打印材料卡' }}
      </button>
      <button @click="handlePrintTest" :disabled="!isConnected">打印测试页</button>
    </div>

    <!-- 打印结果/状态消息 -->
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { zplPrinter } from '@/plugins/zpl-printer'

export default {
  name: 'MaterialCardPrinter',
  data() {
    return {
      isConnected: false,
      isConnecting: false,
      isPrinting: false,
      message: '',
      messageType: 'info',
      config: {
        ip: '127.0.0.1',
        port: '9099',
        model: 'HT300',
        interfaceType: 'USB',
        netIp: '',
        netPort: '9100',
        comData: {
          port: 'COM1',
          baudrate: '115200',
          party: 'n',
          databit: '8',
          stopbit: '1',
          ctl: 'n'
        }
      },
      material: {
        code: '',
        name: '',
        spec: '',
        batch: '',
        quantity: '',
        date: '',
        remark: ''
      }
    }
  },
  created() {
    // 监听打印机返回消息
    zplPrinter.onMessage((obj) => {
      this.handlePrinterResponse(obj)
    })
  },
  beforeDestroy() {
    zplPrinter.disconnect()
  },
  methods: {
    // ========== 连接管理 ==========
    async handleConnect() {
      if (this.isConnected) {
        zplPrinter.disconnect()
        this.isConnected = false
        this.showMessage('已断开连接', 'info')
        return
      }

      this.isConnecting = true
      try {
        await zplPrinter.connect(this.config.ip, this.config.port)
        this.isConnected = true
        this.showMessage('连接成功', 'success')
      } catch (error) {
        this.showMessage(error.message, 'error')
      } finally {
        this.isConnecting = false
      }
    },

    // ========== 打印材料卡 ==========
    async handlePrint() {
      // 表单验证
      if (!this.material.code || !this.material.name) {
        this.showMessage('请至少填写材料代码和材料名称', 'warning')
        return
      }

      this.isPrinting = true
      try {
        const printData = this.buildMaterialCard(this.material)

        zplPrinter.sendData(this.config.model, printData, {
          interfaceType: this.config.interfaceType,
          sn: '',
          netIp: this.config.netIp,
          netPort: this.config.netPort,
          comData: this.config.comData
        })

        this.showMessage('打印任务已发送', 'success')
      } catch (error) {
        this.showMessage('打印失败: ' + error.message, 'error')
      } finally {
        this.isPrinting = false
      }
    },

    // ========== 构建材料卡打印数据 ==========
    buildMaterialCard(data) {
      const builder = new ZPL_JSSDK.Builder()

      // 格式开始
      builder.ZPL_StartFormat()

      // 基础设置
      builder.ZPL_SetLabelLength(600)
      builder.ZPL_SetPrintWidth(800)
      builder.ZPL_SetChangeFontEncoding(14)
      builder.ZPL_SetPrintQuantity(1, 0, 1, 'Y')

      // 表格外框
      builder.ZPL_GraphicBox(50, 50, 700, 500, 2, 0)

      // 标题行
      builder.ZPL_GraphicBox(50, 120, 700, 1, 2, 0)
      builder.ZPL_Text(280, 65, 16, 0, 40, 40, '材 料 卡')

      // 左侧标签列分隔线
      builder.ZPL_GraphicBox(250, 120, 1, 360, 2, 0)

      // 右侧区域分隔线
      builder.ZPL_GraphicBox(550, 120, 1, 360, 2, 0)

      // 各行横线
      ;[190, 250, 310, 370, 430].forEach(y => {
        builder.ZPL_GraphicBox(50, y, 500, 1, 1, 0)
      })

      // 左侧标签
      builder.ZPL_Text(70, 140, 16, 0, 24, 24, '材料名称')
      builder.ZPL_Text(70, 200, 16, 0, 24, 24, '规    格')
      builder.ZPL_Text(70, 260, 16, 0, 24, 24, '批 次 号')
      builder.ZPL_Text(70, 320, 16, 0, 24, 24, '数    量')
      builder.ZPL_Text(70, 380, 16, 0, 24, 24, '生产日期')
      builder.ZPL_Text(70, 440, 16, 0, 24, 24, '备    注')

      // 右侧数据
      builder.ZPL_Text(260, 140, 16, 0, 24, 24, data.name || '')
      builder.ZPL_Text(260, 200, 16, 0, 24, 24, data.spec || '')
      builder.ZPL_Text(260, 260, 16, 0, 24, 24, data.batch || '')
      builder.ZPL_Text(260, 320, 16, 0, 24, 24, data.quantity || '')
      builder.ZPL_Text(260, 380, 16, 0, 24, 24, data.date || '')

      // 备注多行
      if (data.remark) {
        builder.ZPL_Text_Block(260, 440, 16, 0, 20, 20, 280, 50, data.remark)
      }

      // 二维码
      const qrContent = JSON.stringify({
        code: data.code,
        name: data.name,
        batch: data.batch
      })
      builder.ZPL_QRCode(590, 160, 0, 2, 6, 'M', 'A', 'A', qrContent)

      // 条形码
      builder.ZPL_BarCode128(560, 400, 0, 2, 60, 'Y', 'Y', 'Y', 'A', data.code || '')

      // 格式结束
      builder.ZPL_EndFormat()

      return builder.getPrintData()
    },

    // ========== 打印测试页 ==========
    handlePrintTest() {
      const builder = new ZPL_JSSDK.Builder()
      builder.ZPL_StartFormat()
      builder.ZPL_SetLabelLength(300)
      builder.ZPL_SetChangeFontEncoding(14)
      builder.ZPL_Text(100, 100, 16, 0, 30, 30, 'ZPL 打印测试')
      builder.ZPL_Text(100, 150, 16, 0, 20, 20, '连接正常，打印功能可用')
      builder.ZPL_QRCode(100, 200, 0, 2, 4, 'M', 'A', 'A', 'TEST_OK')
      builder.ZPL_EndFormat()

      zplPrinter.sendData(this.config.model, builder.getPrintData(), {
        interfaceType: this.config.interfaceType,
        netIp: this.config.netIp,
        netPort: this.config.netPort,
        comData: this.config.comData
      })

      this.showMessage('测试页已发送', 'success')
    },

    // ========== 查询打印机状态 ==========
    handleCheckStatus() {
      const builder = new ZPL_JSSDK.Builder()
      builder.ZPL_StartFormat()
      builder.ZPL_GetPrinterStatus()
      builder.ZPL_EndFormat()

      zplPrinter.sendData(this.config.model, builder.getPrintData(), {
        interfaceType: this.config.interfaceType,
        netIp: this.config.netIp,
        netPort: this.config.netPort,
        comData: this.config.comData
      })
    },

    // ========== 处理打印机返回消息 ==========
    handlePrinterResponse(obj) {
      if (obj.code === 0 && obj.fun === 'ZPL_GetPrinterStatus') {
        // 状态查询返回
        const statusList = this.parseStatus(obj.data)
        if (statusList.length === 0 || (statusList.length === 1 && statusList[0] === '正常')) {
          this.showMessage('打印机状态：正常', 'success')
        } else {
          this.showMessage('打印机状态：' + statusList.join('；'), 'warning')
        }
      } else if (obj.code === 0) {
        this.showMessage('操作成功: ' + (obj.msg || ''), 'success')
      } else {
        this.showMessage('操作失败: ' + (obj.msg || '未知错误'), 'error')
      }
    },

    // ========== 解析状态码 ==========
    parseStatus(data) {
      const statusMap = {
        'STATE_NORMAL': '正常',
        'STATE_HIGHT_TEMP': '高温',
        'STATE_PRINTING': '打印中',
        'STATE_TOF_ERROR': '标签定位异常',
        'STATE_LABEL_END': '纸用尽',
        'STATE_RIBBON_END': '碳带用尽',
        'STATE_LABEL_SEIZING': '卡纸',
        'STATE_CUTTER_ERROR': '切刀异常',
        'STATE_COVER_OPEN': '盒盖未到位',
        'STATE_RIBBON_NEAR_END': '碳带将尽',
        'PL_PRINTER_STU_NORMAL': '正常',
        'PL_PRINTER_STU_COVER_OUT': '开盖',
        'PL_PRINTER_STU_PAPER_OUT': '缺纸',
        'PL_PRINTER_STU_PRINTING': '打印中',
        'PL_PRINTER_STU_TEMP_HIGH': '头片过温',
        'PL_PRINTER_STU_RIBBON_OUT': '缺碳带',
        'PL_PRINTER_STU_PAPER_JAM': '卡纸',
        'PL_PRINTER_STU_RIBBON_NEAR_END': '碳带将尽',
        'PL_PRINTER_STU_PAPER_NEAR_END': '纸将尽'
      }

      const result = []
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.value === 1 && statusMap[item.name]) {
            result.push(statusMap[item.name])
          }
        })
      }
      return result
    },

    // ========== 显示消息 ==========
    showMessage(msg, type = 'info') {
      this.message = msg
      this.messageType = type
      setTimeout(() => {
        this.message = ''
      }, 5000)
    }
  }
}
</script>

<style scoped>
.material-card-printer {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft YaHei', sans-serif;
}

.connection-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 20px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-dot.connected { background: #52c41a; }
.status-dot.disconnected { background: #ff4d4f; }

.printer-config,
.material-form {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}

.form-row,
.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 8px;
}

.form-row label,
.form-item label {
  min-width: 100px;
  text-align: right;
  font-size: 14px;
}

.form-item.full-width {
  flex-direction: column;
  align-items: flex-start;
}

.form-item.full-width label {
  margin-bottom: 5px;
}

.form-item.full-width textarea {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.form-grid .full-width {
  grid-column: 1 / -1;
}

input,
select,
textarea {
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  flex: 1;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #1890ff;
}

.actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

button {
  padding: 8px 20px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}

button:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-print {
  background: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.btn-print:hover:not(:disabled) {
  background: #40a9ff;
  color: #fff;
}

.message {
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 14px;
}

.message.info { background: #e6f7ff; border: 1px solid #91d5ff; color: #1890ff; }
.message.success { background: #f6ffed; border: 1px solid #b7eb8f; color: #52c41a; }
.message.warning { background: #fffbe6; border: 1px solid #ffe58f; color: #faad14; }
.message.error { background: #fff2f0; border: 1px solid #ffccc7; color: #ff4d4f; }
</style>
```

---

## 9. 状态查询

### 9.1 状态码对照表

SDK 返回的状态分为两套格式，取决于打印机型号：

**20 字节版本（通用）**：

| 状态名 | 中文说明 | 值=1 时含义 |
|--------|----------|-------------|
| STATE_NORMAL | 正常 | 打印机正常 |
| STATE_HIGHT_TEMP | 高温 | 打印头温度过高 |
| STATE_STANDBY | 待机 | 待机状态 |
| STATE_PRINTING | 打印中 | 正在打印 |
| STATE_TOF_ERROR | 标签定位异常 | 标签传感器异常 |
| STATE_LABEL_END | 纸用尽 | 缺纸 |
| STATE_RIBBON_END | 碳带用尽 | 缺碳带 |
| STATE_LABEL_SEIZING | 卡纸 | 纸张卡住 |
| STATE_CUTTER_ERROR | 切刀异常 | 切刀故障 |
| STATE_COVER_OPEN | 盒盖未到位 | 上盖未关好 |
| STATE_RIBBON_NEAR_END | 碳带将尽 | 碳带即将用完 |

**5 字节版本（部分机型）**：

| 状态名 | 中文说明 |
|--------|----------|
| PL_PRINTER_STU_NORMAL | 正常 |
| PL_PRINTER_STU_COVER_OUT | 开盖 |
| PL_PRINTER_STU_PAPER_OUT | 缺纸 |
| PL_PRINTER_STU_PRINTING | 打印中 |
| PL_PRINTER_STU_TEMP_HIGH | 头片过温 |
| PL_PRINTER_STU_RIBBON_OUT | 缺碳带 |
| PL_PRINTER_STU_PAPER_JAM | 卡纸 |
| PL_PRINTER_STU_RIBBON_NEAR_END | 碳带将尽 |
| PL_PRINTER_STU_PAPER_NEAR_END | 纸将尽 |
| PL_PRINTER_STU_CUTTER_ERROR | 切刀异常 |

### 9.2 状态查询与解析

```js
// 查询状态
function checkPrinterStatus() {
  const builder = new ZPL_JSSDK.Builder()
  builder.ZPL_StartFormat()
  builder.ZPL_GetPrinterStatus()
  builder.ZPL_EndFormat()

  zplPrinter.sendData('HT300', builder.getPrintData(), {
    interfaceType: 'USB'
  })
}

// 解析返回（在 onMessage 回调中）
zplPrinter.onMessage((obj) => {
  if (obj.code === 0 && obj.fun === 'ZPL_GetPrinterStatus') {
    const statusMap = {
      'STATE_NORMAL': '正常',
      'STATE_LABEL_END': '纸用尽',
      'STATE_RIBBON_END': '碳带用尽',
      'STATE_COVER_OPEN': '盒盖未到位',
      // ... 其他状态
    }

    const alerts = []
    obj.data.forEach(item => {
      if (item.value === 1 && statusMap[item.name]) {
        alerts.push(statusMap[item.name])
      }
    })

    if (alerts.length === 0 || alerts.includes('正常')) {
      console.log('打印机正常')
    } else {
      console.warn('打印机异常:', alerts.join('；'))
    }
  }
})
```

---

## 10. 错误处理与最佳实践

### 10.1 错误处理

```js
async function safePrint(materialData) {
  try {
    // 连接
    await zplPrinter.connect(config.ip, config.port)
  } catch (e) {
    // 连接失败通常是 JSSDK 服务未启动
    alert('无法连接到打印服务，请确认 JSSDK 服务已启动。\n错误: ' + e.message)
    return
  }

  try {
    // 先查询状态
    const statusBuilder = new ZPL_JSSDK.Builder()
    statusBuilder.ZPL_StartFormat()
    statusBuilder.ZPL_GetPrinterStatus()
    statusBuilder.ZPL_EndFormat()

    zplPrinter.sendData(config.model, statusBuilder.getPrintData(), {
      interfaceType: config.interfaceType
    })

    // 等待状态返回后再打印（可根据实际需求调整）
    // 这里简化处理，实际建议用 Promise 包装 onMessage 回调
  } catch (e) {
    alert('状态查询失败: ' + e.message)
    return
  }

  try {
    // 构建并发送打印
    const printData = buildMaterialCard(materialData)
    zplPrinter.sendData(config.model, printData, {
      interfaceType: config.interfaceType
    })
  } catch (e) {
    alert('打印失败: ' + e.message)
  }
}
```

### 10.2 最佳实践

1. **先查状态再打印**：每次打印前查询打印机状态，确认无缺纸、卡纸等异常
2. **中文编码**：打印中文内容前必须调用 `ZPL_SetChangeFontEncoding(14)`
3. **坐标单位**：所有坐标单位为 dot（点），203dpi 下 1mm ≈ 8dot
4. **格式包裹**：每条打印任务必须用 `ZPL_StartFormat` / `ZPL_EndFormat` 包裹
5. **连接复用**：WebSocket 连接建立后可复用，无需每次打印都重新连接
6. **长连接设置**：SDK 的 `autoDisConnect` 默认为 `false`（长连接），建议保持长连接
7. **打印份数**：通过 `ZPL_SetPrintQuantity` 控制，不要循环调用 print

### 10.3 常见打印问题排查

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 中文乱码 | 未设置编码或编码值错误 | 调用 `ZPL_SetChangeFontEncoding(14)` |
| 二维码扫码无内容 | charMode 参数错误 | `ZPL_QRCode` 的 `charMode` 传 `"A"` |
| 文字超出标签 | 坐标或字号超出标签范围 | 检查标签尺寸设置和文字坐标 |
| 打印空白 | 未调用 StartFormat/EndFormat | 确保指令被正确包裹 |
| 连接失败 | JSSDK 服务未启动 | 检查 9099 端口是否监听 |
| 打印位置偏移 | 标签尺寸设置不正确 | 通过 `ZPL_SetLabelLength` 和 `ZPL_SetPrintWidth` 调整 |

---

## 11. 常见问题 FAQ

**Q: 需要安装驱动吗？**
A: 不需要打印机驱动。但需要安装 JSSDK 后端服务程序，它负责与打印机通信。

**Q: 支持多台打印机同时打印吗？**
A: 支持。通过不同的 `interface_detail`（如不同的 USB SN、不同的 NET IP）区分打印机。

**Q: 标签尺寸如何确定？**
A: 标签尺寸以 dot 为单位。203dpi 打印机下：1mm ≈ 8dot。例如 100mm × 75mm 的标签为 800 × 600 dot。

**Q: 如何调试打印效果？**
A: 建议先用少量内容测试坐标定位，逐步添加元素。可先打印一个文本 + 一个矩形框确认位置正确。

**Q: ZPL_Text 和 ZPL_ScalableFontText 的区别？**
A: `ZPL_Text` 使用打印机内置字体编号（fontNum），`ZPL_ScalableFontText` 使用字体名称（如 "C"）。打印中文建议用 `ZPL_Text` + `ZPL_SetChangeFontEncoding(14)`。

**Q: 打印内容超出标签范围会怎样？**
A: 超出部分不会被打印，不会报错。需要自行确保坐标在标签范围内。
