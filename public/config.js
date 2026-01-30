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
};
