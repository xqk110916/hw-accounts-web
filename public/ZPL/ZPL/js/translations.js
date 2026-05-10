// translations.js
// translations.js
const translations = {
  en: {
    // 基本设置
    paramsSettings: "Parameter Settings",
    portLabel: "Port Number:",
    modelLabel: "Model:",
    interfaceLabel: "Communication Port:",

    // 硬件设置
    comPortLabel: "Serial Port Number:",
    baudrateLabel: "Baud Rate:",
    partyLabel: "Parity Check:",
    None: "None",
    Odd: "Odd",
    Even: "Even",
    Mark: "Mark",
    Space: "Space",
    databitLabel: "Data Bit:",
    stopbitLabel: "Stop Bit:",
    flowControlLabel: "Flow Control:",

    // 功能按钮
    printTest: "Print Test",
    statusLabel: "Printer Status",
    printText: "Print Text",
    printWrapText: "Print Text (Word Wrap)",
    printQR: "Print QR Code",
    printPDF417: "Print Pdf417",
    printLocalImage: "Local Image Printing",
    printPDF: "Print PDF",
    rfid: "RFID Reading and Writing",
    inversePrint: "Reverse Color Printing",
    continuousPrint: "Continuous Printing",
    printText7: "Text (7 parameters)",
    printText8: "Text (8 parameters)",
    printCut: "Cutting Knife Demonstration",
    printReceipt: "Print Receipt",
    printBarcode: "Print Barcode",
    statusQuery: "Printer Status",
    

    // 状态描述
    STATE_NORMAL: "Normal",
    STATE_HIGHT_TEMP: "High Temperature",
    STATE_STANDBY: "Standby",
    STATE_PRINTING: "Printing",
    STATE_TOF_ERROR: "Abnormal Label Position",
    STATE_LABEL_END: "Paper Out",
    STATE_RIBBON_END: "Ribbon Out",
    STATE_LABEL_SEIZING: "Paper Jam",
    STATE_LABEL_JUMPPING: "Skip Label",
    STATE_LABEL_CALIBRATING: "Label Calibration",
    STATE_CUTTER_ERROR: "Abnormal Cutter",
    STATE_FORM_ERROR: "Abnormal Label Format",
    STATE_MEMORY_WRITE_ERROR: "Abnormal Memory Write",
    STATE_ILLEGAL_COMMAND: "Invalid Command",
    STATE_COVER_OPEN: "Box cover not in place",
    STATE_RIBBON_NEAR_END: "Ribbon Near End",

    PL_PRINTER_STU_NORMAL: "Normal",
    PL_PRINTER_STU_COVER_OUT: "Cover Open",
    PL_PRINTER_STU_TPH_COVER_OUT: "Mechanism Cover Open",
    PL_PRINTER_STU_PAPER_OUT: "Paper Out",
    PL_PRINTER_STU_PRINTING: "Printing",
    PL_PRINTER_STU_TEMP_HIGH: "TPH Overtemperature",
    PL_PRINTER_STU_LOCAT_FAIL: "Label Positioning Failed",
    PL_PRINTER_STU_PAUSE: "Pause",
    PL_PRINTER_STU_LOCAT_LEARNING: "Label Calibration",
    PL_PRINTER_STU_RIBBON_OUT: "Ribbon Out",
    PL_PRINTER_STU_TPH_ERROR: "TPH Error",
    PL_PRINTER_STU_MEM_FAIL: "Abnormal Memory Write",
    PL_PRINTER_STU_PAPER_JAM: "Paper Jam",
    PL_PRINTER_STU_PAPER_STAY: "Paper not taken away",
    PL_PRINTER_STU_RIBBON_NEAR_END: "Ribbon Near End",
    PL_PRINTER_STU_PAPER_NEAR_END: "Paper Near End",
    PL_PRINTER_STU_CUTTER_ERROR: "Abnormal Cutter",
    PL_PRINTER_STU_FEED_PAPER_CHANNEL_ERROR: "Paper Path Error",
    PL_PRINTER_STU_DOOR_ERROR: "Door Detection Error",
    PL_PRINTER_STU_VOLTAGE_ERROR: "Abnormal Voltage",

    TSPL_STATE_HEAD_OPEN: "Print Head Is Open",
    TSPL_STATE_PAUSE: "Print Paused",
    TSPL_STATE_UNKNOW: "Other Error",

    STS_COVEROPEN: "Cover Is Open",
    STS_ERROR: "Error Retrieving Status",
    STS_NOT_OPEN: "Port Is Not Open",
    STS_OFFLINE: "Printer Is Offline",

    // 输入提示
    ipPlaceholder: "Please enter IP",
    portPlaceholder: "Please enter Port",
    modelPlaceholder: "Please enter Model",
    snPlaceholder: "Please enter SN",
    printerIPPlaceholder: "Please enter the printer IP",
    base64Placeholder: "Please enter the Base64 data of the image!",

    // 错误信息
    networkConnectionFailed: "Network connection service failed!",
    networkDisconnected: "Network disconnected, error code：",
    returnMessage: "Return Message：",
    returnData: "Return Data：",
  },
  zh: {
    // 基本设置
    paramsSettings: "参数设置",
    portLabel: "端口号:",
    modelLabel: "机型:",
    interfaceLabel: "通讯口:",

    // 硬件设置
    comPortLabel: "串口号:",
    baudrateLabel: "波特率:",
    partyLabel: "奇偶校验:",
    None: "无",
    Odd: "奇",
    Even: "偶",
    Mark: "标记",
    Space: "空格",
    databitLabel: "数据位:",
    stopbitLabel: "停止位:",
    flowControlLabel: "流控:",

    // 功能按钮
    printTest: "打印测试",
    statusLabel: "打印机状态",
    printText: "打印文本",
    printWrapText: "打印文本(自动换行)",
    printQR: "打印二维码",
    printPDF417: "打印Pdf417",
    printLocalImage: "本地图片打印",
    printPDF: "打印pdf",
    rfid: "RFID读写",
    inversePrint: "反色打印",
    continuousPrint: "连续打印",
    printText7: "文本(7个参数)",
    printText8: "文本(8个参数)",
    printCut: "切刀演示",
    printReceipt: "打印小票",
    printBarcode: "打印条码",
    statusQuery: "状态查询",

    // 状态描述
    STATE_NORMAL: "正常",
    STATE_HIGHT_TEMP: "高温",
    STATE_STANDBY: "待机",
    STATE_PRINTING: "打印中",
    STATE_TOF_ERROR: "标签定位异常",
    STATE_LABEL_END: "纸用尽",
    STATE_RIBBON_END: "碳带用尽",
    STATE_LABEL_SEIZING: "卡纸",
    STATE_LABEL_JUMPPING: "跳标",
    STATE_LABEL_CALIBRATING: "标签学习中",
    STATE_CUTTER_ERROR: "切刀异常",
    STATE_FORM_ERROR: "标签格式异常",
    STATE_MEMORY_WRITE_ERROR: "记忆体写入异常",
    STATE_ILLEGAL_COMMAND: "非法指令",
    STATE_COVER_OPEN: "盒盖未到位",
    STATE_RIBBON_NEAR_END: "碳带将尽",

    PL_PRINTER_STU_NORMAL: "正常",
    PL_PRINTER_STU_COVER_OUT: "开盖",
    PL_PRINTER_STU_TPH_COVER_OUT: "机芯盖开启",
    PL_PRINTER_STU_PAPER_OUT: "缺纸",
    PL_PRINTER_STU_PRINTING: "打印中",
    PL_PRINTER_STU_TEMP_HIGH: "头片过温",
    PL_PRINTER_STU_LOCAT_FAIL: "定位失败",
    PL_PRINTER_STU_PAUSE: "暂停",
    PL_PRINTER_STU_LOCAT_LEARNING: "标签学习中",
    PL_PRINTER_STU_RIBBON_OUT: "缺碳带",
    PL_PRINTER_STU_TPH_ERROR: "头片错误",
    PL_PRINTER_STU_MEM_FAIL: "记忆体写入异常",
    PL_PRINTER_STU_PAPER_JAM: "卡纸",
    PL_PRINTER_STU_PAPER_STAY: "未取纸",
    PL_PRINTER_STU_RIBBON_NEAR_END: "碳带将尽",
    PL_PRINTER_STU_PAPER_NEAR_END: "纸将尽",
    PL_PRINTER_STU_CUTTER_ERROR: "切刀异常",
    PL_PRINTER_STU_FEED_PAPER_CHANNEL_ERROR: "走纸通道错误",
    PL_PRINTER_STU_DOOR_ERROR: "门侦测错误",
    PL_PRINTER_STU_VOLTAGE_ERROR: "电压异常",

    TSPL_STATE_HEAD_OPEN: "打印头被打开",
    TSPL_STATE_PAUSE: "打印暂停",
    TSPL_STATE_UNKNOW: "其他错误",

    STS_COVEROPEN: "上盖打开",
    STS_ERROR: "获取状态时出错",
    STS_NOT_OPEN: "端口未打开",
    STS_OFFLINE: "打印机离线",

    // 输入提示
    ipPlaceholder: "请输入IP",
    portPlaceholder: "请输入端口号",
    modelPlaceholder: "请输入机型",
    snPlaceholder: "请输入SN",
    printerIPPlaceholder: "请输入打印机IP",
    base64Placeholder: "请输入图片Base64数据!",

    // 错误信息
    networkConnectionFailed: "网络连接服务失败!",
    networkDisconnected: "网络关闭，错误码:",
    returnMessage: "返回信息：",
    returnData: "返回数据：",
  },
};

window.translations = translations;

function detectLanguage() {
  // 获取浏览器语言
  const userLang = navigator.language || navigator.userLanguage; // 兼容性处理
  // 返回前两位字符作为语言代码，例如 "en-US" -> "en"
  return userLang.split("-")[0];
}

let currentLang = detectLanguage();

function setLanguage(lang) {
  currentLang = lang;
  applyTranslations();
  let interfacePort = document.getElementById('interfacePort').value;
  content_show(interfacePort);
}

function applyTranslations() {
  // 处理常规元素
  $("[data-i18n-text]").each(function () {
    const key = $(this).data("i18n-text");
    if (translations[currentLang][key]) {
      $(this).text(translations[currentLang][key]);
    }
  });

  // 处理placeholder
  $("[data-i18n-placeholder]").each(function () {
    const key = $(this).data("i18n-placeholder");
    if (translations[currentLang][key]) {
      $(this).attr("placeholder", translations[currentLang][key]);
    }
  });

  // 处理按钮value
  $("[data-i18n-val]").each(function () {
    const key = $(this).data("i18n-val");
    if (translations[currentLang][key]) {
      $(this).val(translations[currentLang][key]);
    }
  });
}

function applyI18nStatus(status) {
  const key = status.name;
  let translation = translations[currentLang][key];
  return translation || status.desc;
}

function applyI18nMsg(msg) {
  const key = Object.keys(translations.zh).find(
    (zhkey) => translations.zh[zhkey] === msg
  );
  // 返回翻译或原始消息
  return key ? translations[currentLang][key] || msg : msg;
}

// 页面加载完成后初始化
window.onload = function () {
  applyTranslations();
};
