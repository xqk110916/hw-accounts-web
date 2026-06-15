/**
 * title: 全局配置参数
 * description: 使用参数挂载至window.globalConfig 的方式，注册为系统全局变量
 * 理论上：系统依赖的动态变量，静态常量都可以以此种方式定义为 系统全局变量，利用浏览器顶级window的全局性，传递相关参数
 */
window.globalConfig = {
  /********文件预览相关全局配置*****start************/
  // office 在线预览服务地址，用于iframe的方式打开预览文件
  OFFICE_ONLINE_VIEW_URL: 'http://218.29.222.2:53602/op/view.aspx',
  // pdf 在线预览服务地址，用于iframe的方式打开预览文件
  PDF_ONLINE_VIEW_URL: 'http://10.10.216.27:8080/pdfviewer/web/viewer.html',
  // 文件预览基础服务地址，用于文件在预览中的文件加密解析、下载等功能
  SERVER_BASE_URL: 'http://10.10.216.27:8080/api',
  /********文件预览相关全局配置*****end************/

  /********ZPL 标签打印配置*****start************/
  // serviceIp/servicePort 为本机 JSSDK 服务地址，不是打印机 IP。
  // interfaceType 支持 USB、NET、COM。NET 模式下通过 netIp/netPort 配置打印机地址。
  ZPL_PRINTER_CONFIG: {
    serviceIp: '127.0.0.1',
    servicePort: 9099,
    model: 'iX4P',
    dpi: 300,
    labelWidth: 160,    // 标签宽度(mm)
    labelHeight: 120,   // 标签高度(mm)
    interfaceType: 'USB',
    sn: '',
    netIp: '192.168.1.58',
    netPort: 9100,
    comData: {
      port: 'COM1',
      baudrate: 115200,
      party: 'n',
      databit: 8,
      stopbit: 1,
      ctl: 'n',
    },
  },
  /********ZPL 标签打印配置*****end************/
};
