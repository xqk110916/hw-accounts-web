if (!window.ZPL_JSSDK) {
    window.ZPL_JSSDK = {};
}

ZPL_JSSDK.Printer = function () {
    var args = arguments.length;
    this.ip = args > 0 ? arguments[0] : "127.0.0.1";
    this.model = args > 1 ? arguments[1] : "iD4P";
    this.timeout = args > 2 ? arguments[2] : 3000;
    this.port = args > 3 ? arguments[3] : "9099";
    this.interfacePort = args > 4 ? arguments[4] : "USB";
    this.tag = args > 5 ? arguments[5] : "";
    this.tag_port = args > 6 ? arguments[6] : "";
    this.COM_DATA = arguments[7];
    this.E_TIMEOUT = -5;
    this.E_UNKNOWN = -1;
    this.onError = this.onComplete = null;
    this.sentSuccess = false;
    this.inTransaction = false;
    this.status = "";
    this.Printdata = "";
};
ZPL_JSSDK.Printer.prototype.setPrintData = function (data) {
    this.Printdata = data;
};
ZPL_JSSDK.Printer.prototype.setIp = function (ip) {
    this.ip = ip;
};
ZPL_JSSDK.Printer.prototype.setPort = function (port) {
    this.port = port;
};
ZPL_JSSDK.Printer.prototype.setModel = function (model) {
    this.model = model;
};

//打印
ZPL_JSSDK.Printer.prototype.print = function () {
    var ip = this.ip;
    var port = this.port;
    var model = this.model;
    var interfacePort = this.interfacePort;
    var tag = this.tag;
    var tag_port = this.tag_port;
    var COM_DATA = this.COM_DATA;
    if (!this.Printdata) {
        return false;
    }

    senddata(
        ip,
        port,
        model,
        this.Printdata,
        interfacePort,
        tag,
        tag_port,
        COM_DATA
    );
};

function senddata(
    ip,
    port,
    model,
    data,
    interfacePort,
    tag,
    tag_port,
    COM_DATA
) {
    let interface_detail = {};

    if (interfacePort === "USB") {
        interface_detail = {
            usb: {
                sn: tag || "", // 传空则自动识别，sn号可为空
            },
        };
    } else if (interfacePort.startsWith("COM")) {
        interface_detail = {
            com: {
                port: COM_DATA.port, // 选择串口号
                baudrate: COM_DATA.baudrate, // 选择波特率
                party: COM_DATA.party, // 奇偶校验
                databit: COM_DATA.databit, // 数据位
                stopbit: COM_DATA.stopbit, // 停止位
                ctl: COM_DATA.ctl, // 流控
            },
        };
    } else if (interfacePort === "NET") {
        interface_detail = {
            net: {
                ip: tag,
                port: tag_port,
            },
        };
    } 
	else {
        console.error("不支持的接口类型");
    }

    let sendDataString = `{
    "model": "${model}",
    "printerID": "ZPL",
    "interface": "",
    "interface_detail": ${JSON.stringify(interface_detail)},
    "printers": [{
        "Items": [${data}]
      }]
    }`;

    pushData(ip, port, decodeURIComponent(sendDataString));
}

ZPL_JSSDK.Printer.prototype.ZPL_GetPrinterStatus = function () {
    var ip = this.ip;
    var port = this.port;
    var model = this.model;
    var interfacePort = this.interfacePort;

    let interface_detail = {};

    if (interfacePort === "USB") {
        interface_detail = {
            usb: {
                sn: tag || "", // 传空则自动识别，sn号可为空
            },
        };
    } else if (interfacePort.startsWith("COM")) {
        interface_detail = {
            com: {
                port: COM_DATA.port, // 选择串口号
                baudrate: COM_DATA.baudrate, // 选择波特率
                party: COM_DATA.party, // 奇偶校验
                databit: COM_DATA.databit, // 数据位
                stopbit: COM_DATA.stopbit, // 停止位
                ctl: COM_DATA.ctl, // 流控
            },
        };
    } else if (interfacePort === "NET") {
        interface_detail = {
            net: {
                ip: tag,
                port: tag_port,
            },
        };
    } 
	else {
        console.error("不支持的接口类型");
    }
    let sendDataString = `{
        "model": "${model}",
        "printerID": "ZPL",
        "interface": "",
          "interface_detail": ${JSON.stringify(interface_detail)},
        "printers": [{
            "Items": [{
                "itemtype": "ZPL_GetPrinterStatus"
            }]
        }]
    }`;

    pushData(ip, port, sendDataString);

    return false;
};

//===================================================================================================================================
//===================================================================================================================================
//===================================================================================================================================

ZPL_JSSDK.Builder = function () {
    this.PrintData = "";
    validateAlign = /^(left|center|right)$/;
    validateFont = /^(font_[ab]|special_[ab])$/;
    validateColor = /^(none|color_[1-4])$/;
    validateFeed = /^(peeling|cutting|current_tof|next_tof)$/;
    validateMode = /^(mono|gray16)$/;
    validateBarcode =
        /^(upc_[ae]|[ej]an13|[ej]an8|code(39|93|128)|itf|codabar|gs1_128|gs1_databar_(omnidirectional|truncated|limited|expanded))$/;
    validateHri = /^(none|above|below|both)$/;
    validateSymbol =
        /^(pdf417_(standard|truncated)|qrcode_model_[12]|maxicode_mode_[2-6]|gs1_databar_(stacked(_omnidirectional)?|expanded_stacked)|azteccode_(fullrange|compact)|datamatrix_(square|rectangle_(8|12|16)))$/;
    validateLevel = /^(level_[0-8lmqh]|default)$/;
    validateLine = /^(thin|medium|thick)(_double)?$/;
    validateDirection =
        /^(left_to_right|bottom_to_top|right_to_left|top_to_bottom)$/;
    validateCut = /^(Full Cut|Partial Cut)$/;
    validateDrawer = /^drawer_[12]$/;
    validatePulse = /^pulse_[1-5]00$/;
    validatePattern = /^(none|pattern_(10|[1-9a-e])|error|paper_end)$/;
    validateLayout = /^(receipt|label)(_bm)?$/;
};

ZPL_JSSDK.Builder.prototype.getPrintData = function () {
    return this.PrintData;
};

function createTypeString(typeName) {
    return '"itemtype":"' + typeName.toString() + '"';
}

function createStr(paramNa, paramVa, valiString) {
    if (valiString && valiString.length > 0) {
        if (!valiString.test(paramVa)) {
            throw new Error('Parameter "' + paramNa + '" is invalid');
        } else {
            return ',"' + paramNa.toString() + '":"' + paramVa.toString() + '"';
        }
    } else {
        return ',"' + paramNa.toString() + '":"' + paramVa.toString() + '"';
    }
}
function createText(paramNa, paramVa, valiString) {
    if (valiString && valiString.length > 0) {
        if (!valiString.test(paramVa)) {
            throw new Error('Parameter "' + paramNa + '" is invalid');
        } else {
            return (
                ',"' + paramNa.toString() + '":"' + encodeURI(paramVa.toString()) + '"'
            );
        }
    } else {
        return (
            ',"' + paramNa.toString() + '":"' + encodeURI(paramVa.toString()) + '"'
        );
    }
}
function createUnStr(paramNa, paramVa, valiString) {
    if (valiString && valiString.length > 0) {
        if (!valiString.test(paramVa)) {
            throw new Error('Parameter "' + paramNa + '"is invalid');
        } else {
            return ',"' + paramNa.toString() + '":' + paramVa.toString();
        }
    } else {
        return ',"' + paramNa.toString() + '":' + paramVa.toString();
    }
}

ZPL_JSSDK.Builder.prototype.ZPL_StartFormat = function () {
    var d = '{"itemtype":"ZPL_StartFormat"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_EndFormat = function () {
    var d = '{"itemtype":"ZPL_EndFormat"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;

    return d;
};

ZPL_JSSDK.Builder.prototype.ZPL_ScalableFontText = function (
    xPos,
    yPos,
    fontName,
    orientation,
    fontWidth,
    fontHeight,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_ScalableFontText");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createStr("fontName", fontName);
    d += createUnStr("orientation", orientation);
    d += createUnStr("fontWidth", fontWidth);
    d += createUnStr("fontHeight", fontHeight);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetUserFontName = function (text) {
    var d = "{";
    d += createTypeString("ZPL_SetUserFontName");
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_Text = function (
    xPos,
    yPos,
    fontNum,
    orientation,
    fontWidth,
    fontHeight,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_Text");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("fontNum", fontNum);
    d += createUnStr("orientation", orientation);
    d += createUnStr("fontWidth", fontWidth);
    d += createUnStr("fontHeight", fontHeight);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;

    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_Text_extend = function (
    xPos,
    yPos,
    fontNum,
    orientation,
    fontWidth,
    fontHeight,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_Text_extend");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("fontNum", fontNum);
    d += createUnStr("orientation", orientation);
    d += createUnStr("fontWidth", fontWidth);
    d += createUnStr("fontHeight", fontHeight);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;

    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_Text_Block = function (
    xPos,
    yPos,
    fontNum,
    orientation,
    fontWidth,
    fontHeight,
    textblockWidth,
    textblockHeight,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_Text_Block");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("fontNum", fontNum);
    d += createUnStr("orientation", orientation);
    d += createUnStr("fontWidth", fontWidth);
    d += createUnStr("fontHeight", fontHeight);
    d += createUnStr("textblockWidth", textblockWidth);
    d += createUnStr("textblockHeight", textblockHeight);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_FieldHexadecimalIndicator = function () {
    var d = '{"itemtype":"ZPL_FieldHexadecimalIndicator"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_AztecBarcode = function (
    xPos,
    yPos,
    orientation,
    dpi,
    extChannel,
    eccLevel,
    menuSymbol,
    symbols,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_AztecBarcode");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("dpi", dpi);
    d += createStr("extChannel", extChannel);
    d += createUnStr("eccLevel", eccLevel);
    d += createStr("menuSymbol", menuSymbol);
    d += createUnStr("symbols", symbols);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_BarCode11 = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    line,
    lineAboveCode,
    digit,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_BarCode11");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("line", line);
    d += createStr("lineAboveCode", lineAboveCode);
    d += createStr("digit", digit);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_BarCode25 = function (
    type,
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    line,
    lineAboveCode,
    digit,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_BarCode25");
    d += createStr("type", type);
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("line", line);
    d += createStr("lineAboveCode", lineAboveCode);
    d += createStr("digit", digit);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_BarCode39 = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    line,
    lineAboveCode,
    digit,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_BarCode39");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("line", line);
    d += createStr("lineAboveCode", lineAboveCode);
    d += createStr("digit", digit);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_BarCode49 = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    line,
    mode,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_BarCode49");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("line", line);
    d += createStr("mode", mode);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_PlanetCode = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    line,
    lineAboveCode,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_PlanetCode");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("line", line);
    d += createStr("lineAboveCode", lineAboveCode);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_Pdf417 = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    securityLevel,
    columns,
    rows,
    truncate,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_Pdf417");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createUnStr("securityLevel", securityLevel);
    d += createUnStr("columns", columns);
    d += createUnStr("rows", rows);
    d += createStr("truncate", truncate);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_CodeEan8 = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    line,
    lineAboveCode,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_CodeEan8");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("line", line);
    d += createStr("lineAboveCode", lineAboveCode);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_UpceCode = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    line,
    lineAboveCode,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_UpceCode");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("line", line);
    d += createStr("lineAboveCode", lineAboveCode);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_BarCode93 = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    line,
    lineAboveCode,
    digit,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_BarCode93");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("line", line);
    d += createStr("lineAboveCode", lineAboveCode);
    d += createStr("digit", digit);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_BarCode128 = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    line,
    lineAboveCode,
    checkDigit,
    mode,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_BarCode128");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("line", line);
    d += createStr("lineAboveCode", lineAboveCode);
    d += createStr("checkDigit", checkDigit);
    d += createStr("mode", mode);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_CodeEan13 = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    line,
    lineAboveCode,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_CodeEan13");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("line", line);
    d += createStr("lineAboveCode", lineAboveCode);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_MicroPdf417 = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    mode,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_MicroPdf417");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createUnStr("mode", mode);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_AnsiCodebar = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    line,
    lineAboveCode,
    startChar,
    stopChar,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_AnsiCodebar");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("line", line);
    d += createStr("lineAboveCode", lineAboveCode);
    d += createStr("startChar", startChar);
    d += createStr("stopChar", stopChar);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_LogMarsBarcode = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    lineAboveCode,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_LogMarsBarcode");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("lineAboveCode", lineAboveCode);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_MsiBarcode = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    line,
    lineAbovecode,
    checkDigit,
    insertCheck,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_MsiBarcode");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("line", line);
    d += createStr("lineAbovecode", lineAbovecode);
    d += createStr("checkDigit", checkDigit);
    d += createStr("insertCheck", insertCheck);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_PlesseyBarcode = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    line,
    lineAboveCode,
    checkDigit,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_PlesseyBarcode");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("line", line);
    d += createStr("lineAboveCode", lineAboveCode);
    d += createStr("checkDigit", checkDigit);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
// modify by wjz 20210317
//ZPL_JSSDK.Builder.prototype.ZPL_QRCode = function (xPos, yPos, orientation, model, dpi, eccLevel, charMode, text) {
ZPL_JSSDK.Builder.prototype.ZPL_QRCode = function (
    xPos,
    yPos,
    orientation,
    model,
    dpi,
    eccLevel,
    input,
    charMode,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_QRCode");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("model", model);
    d += createUnStr("dpi", dpi);
    d += createStr("eccLevel", eccLevel);
    d += createStr("input", input);
    d += createStr("charMode", charMode);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_UpcExtensions = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    line,
    lineAboveCode,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_UpcExtensions");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("line", line);
    d += createStr("lineAboveCode", lineAboveCode);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_UpcaBarcode = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    line,
    lineAboveCode,
    digit,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_UpcaBarcode");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("line", line);
    d += createStr("lineAboveCode", lineAboveCode);
    d += createStr("digit", digit);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_DataMatrixBarcode = function (
    xPos,
    yPos,
    orientation,
    codeHeight,
    level,
    columns,
    rows,
    formatId,
    aspectRatio,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_DataMatrixBarcode");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("codeHeight", codeHeight);
    d += createUnStr("level", level);
    d += createUnStr("columns", columns);
    d += createUnStr("rows", rows);
    d += createUnStr("formatId", formatId);
    d += createUnStr("aspectRatio", aspectRatio);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetChangeFontEncoding = function (encodeType) {
    var d = "{";
    d += createTypeString("ZPL_SetChangeFontEncoding");
    d += createUnStr("encodeType", encodeType);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetVietMode = function (vietmode) {
    var d = "{";
    d += createTypeString("ZPL_SetVietMode");
    d += createUnStr("vietmode", vietmode);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetVietFontEncoding = function () {
    var d = '{"itemtype":"ZPL_SetVietFontEncoding"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetChangeCaret = function (charactor) {
    var d = "{";
    d += createTypeString("ZPL_SetChangeCaret");
    d += createStr("charactor", charactor);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_PostalBarcode = function (
    xPos,
    yPos,
    orientation,
    moduleWidth,
    codeHeight,
    line,
    lineAboveCode,
    postalType,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_PostalBarcode");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("moduleWidth", moduleWidth);
    d += createUnStr("codeHeight", codeHeight);
    d += createStr("line", line);
    d += createStr("lineAboveCode", lineAboveCode);
    d += createUnStr("postalType", postalType);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetChangeDelimiter = function (charactor) {
    var d = "{";
    d += createTypeString("ZPL_SetChangeDelimiter");
    d += createStr("charactor", charactor);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetChangeDefaultFont = function (
    fontName,
    width,
    height
) {
    var d = "{";
    d += createTypeString("ZPL_SetChangeDefaultFont");
    d += createStr("fontName", fontName);
    d += createUnStr("width", width);
    d += createUnStr("height", height);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetChangeTilde = function (charactor) {
    var d = "{";
    d += createTypeString("ZPL_SetChangeTilde");
    d += createStr("charactor", charactor);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_GraphicBox = function (
    xPos,
    yPos,
    width,
    height,
    thickness,
    rounding
) {
    var d = "{";
    d += createTypeString("ZPL_GraphicBox");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("width", width);
    d += createUnStr("height", height);
    d += createUnStr("thickness", thickness);
    d += createUnStr("rounding", rounding);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_GraphicCircle = function (
    xPos,
    yPos,
    diameter,
    thickness
) {
    var d = "{";
    d += createTypeString("ZPL_GraphicCircle");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("diameter", diameter);
    d += createUnStr("thickness", thickness);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_GraphicDiagonalLine = function (
    xPos,
    yPos,
    orientation,
    width,
    height,
    thickness
) {
    var d = "{";
    d += createTypeString("ZPL_GraphicDiagonalLine");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("width", width);
    d += createUnStr("height", height);
    d += createUnStr("thickness", thickness);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_GraphicEllipse = function (
    xPos,
    yPos,
    width,
    height,
    thickness
) {
    var d = "{";
    d += createTypeString("ZPL_GraphicEllipse");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("width", width);
    d += createUnStr("height", height);
    d += createUnStr("thickness", thickness);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_PrintImage = function (xPos, yPos, imgName) {
    var d = "{";
    d += createTypeString("ZPL_PrintImage");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createStr("imgName", imgName);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_GraphicSymbol = function (
    xPos,
    yPos,
    orientation,
    width,
    height,
    symbol
) {
    var d = "{";
    d += createTypeString("ZPL_GraphicSymbol");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("orientation", orientation);
    d += createUnStr("width", width);
    d += createUnStr("height", height);
    d += createStr("symbol", symbol);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_HostStatusReturn = function (statuString) {
    var d = "{";
    d += createTypeString("ZPL_HostStatusReturn");
    d += createStr("statuString", statuString);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetMediaSensorCalibration = function () {
    var d = '{"itemtype":"ZPL_SetMediaSensorCalibration"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetDiagnosticsMode = function (isEnable) {
    var d = "{";
    d += createTypeString("ZPL_SetDiagnosticsMode");
    d += createUnStr("isEnable", isEnable);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetPowerOnReset = function () {
    var d = '{"itemtype":"ZPL_SetPowerOnReset"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetLabelHome = function (xPos, yPos) {
    var d = "{";
    d += createTypeString("ZPL_SetLabelHome");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetLabelLength = function (length) {
    var d = "{";
    d += createTypeString("ZPL_SetLabelLength");
    d += createUnStr("length", length);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetLabelReversePrint = function (enable) {
    var d = "{";
    d += createTypeString("ZPL_SetLabelReversePrint");
    d += createStr("enable", enable);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetLabelShift = function (shift) {
    var d = "{";
    d += createTypeString("ZPL_SetLabelShift");
    d += createUnStr("shift", shift);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetLabelTop = function (top) {
    var d = "{";
    d += createTypeString("ZPL_SetLabelTop");
    d += createUnStr("top", top);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetPrintMode = function (mode, prePeelSelect) {
    var d = "{";
    d += createTypeString("ZPL_SetPrintMode");
    d += createStr("mode", mode);
    d += createStr("prePeelSelect", prePeelSelect);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetMediaTracking = function (
    mediaType,
    offset
) {
    var d = "{";
    d += createTypeString("ZPL_SetMediaTracking");
    d += createStr("mediaType", mediaType);
    d += createUnStr("offset", offset);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetMediaType = function (type) {
    var d = "{";
    d += createTypeString("ZPL_SetMediaType");
    d += createStr("type", type);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SlewToHomePosition = function (type) {
    var d = "{";
    d += createTypeString("ZPL_SlewToHomePosition");
    d += createUnStr("type", type);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetPrintingMirrorImage = function (enable) {
    var d = "{";
    d += createTypeString("ZPL_SetPrintingMirrorImage");
    d += createStr("enable", enable);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetPrintOrientation = function (orientation) {
    var d = "{";
    d += createTypeString("ZPL_SetPrintOrientation");
    d += createUnStr("orientation", orientation);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetPrintQuantity = function (
    totalQuantity,
    pauseAndCutValue,
    replicatesOfEachSerialNumber,
    overridePauseCount
) {
    var d = "{";
    d += createTypeString("ZPL_SetPrintQuantity");
    d += createUnStr("totalQuantity", totalQuantity);
    d += createUnStr("pauseAndCutValue", pauseAndCutValue);
    d += createUnStr(
        "replicatesOfEachSerialNumber",
        replicatesOfEachSerialNumber
    );
    d += createStr("overridePauseCount", overridePauseCount);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetPrintRate = function (
    printSpeed,
    slewSpeed,
    backfeedSpeed
) {
    var d = "{";
    d += createTypeString("ZPL_SetPrintRate");
    d += createUnStr("printSpeed", printSpeed);
    d += createUnStr("slewSpeed", slewSpeed);
    d += createUnStr("backfeedSpeed", backfeedSpeed);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetPrintWidth = function (width) {
    var d = "{";
    d += createTypeString("ZPL_SetPrintWidth");
    d += createUnStr("width", width);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetSerialCommunications = function (
    baudRate,
    wordLength,
    parity,
    stopBits,
    protocolMode
) {
    var d = "{";
    d += createTypeString("ZPL_SetSerialCommunications");
    d += createUnStr("baudRate", baudRate);
    d += createUnStr("wordLength", wordLength);
    d += createStr("parity", parity);
    d += createUnStr("stopBits", stopBits);
    d += createStr("protocolMode", protocolMode);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetPrintDarkness = function (darkness) {
    var d = "{";
    d += createTypeString("ZPL_SetPrintDarkness");
    d += createUnStr("darkness", darkness);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetSerializationField = function (
    xPos,
    yPos,
    mask,
    increment,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_SetSerializationField");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createStr("mask", mask);
    d += createStr("increment", increment);
    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetTearOffAdjustPosition = function (position) {
    var d = "{";
    d += createTypeString("ZPL_SetTearOffAdjustPosition");
    d += createUnStr("position", position);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_PrintConfigurationLabel = function () {
    var d = '{"itemtype":"ZPL_PrintConfigurationLabel"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_GetPrinterIpAddress = function () {
    var d = '{"itemtype":"ZPL_GetPrinterIpAddress"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_GetPrinterStatus = function () {
    var d = '{"itemtype":"ZPL_GetPrinterStatus"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_GetPrinterOdometer = function () {
    var d = '{"itemtype":"ZPL_GetPrinterOdometer"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_GetLabelLength = function () {
    var d = '{"itemtype":"ZPL_GetLabelLength"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_GetLabelWidth = function () {
    var d = '{"itemtype":"ZPL_GetLabelWidth"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_GetPrinterSeriesNumber = function () {
    var d = '{"itemtype":"ZPL_GetPrinterSeriesNumber"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_GetPrinterMacAddress = function () {
    var d = '{"itemtype":"ZPL_GetPrinterMacAddress"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_GetPrinterName = function () {
    var d = '{"itemtype":"ZPL_GetPrinterName"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_GetPrinterFirmwareVersion = function (version) {
    var d = '{"itemtype":"ZPL_GetPrinterFirmwareVersion"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_GetPrinterDpi = function (dpi) {
    var d = '{"itemtype":"ZPL_GetPrinterDpi"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_LearnLabel = function () {
    var d = '{"itemtype":"ZPL_LearnLabel"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetReprintAfterError = function (pEnable) {
    var d = "{";
    d += createTypeString("ZPL_SetReprintAfterError");
    d += createStr("pEnable", pEnable);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetPrintIpAddress = function (ipaddress) {
    var d = "{";
    d += createTypeString("ZPL_SetPrintIpAddress");
    d += createStr("ipaddress", ipaddress);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetPrintSubnetMask = function (mask) {
    var d = "{";
    d += createTypeString("ZPL_SetPrintSubnetMask");
    d += createStr("mask", mask);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetPrintDefaultGateway = function (gateway) {
    var d = "{";
    d += createTypeString("ZPL_SetPrintDefaultGateway");
    d += createStr("gateway", gateway);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetNetworkSetting = function (network) {
    var d = "{";
    d += createTypeString("ZPL_SetNetworkSetting");
    d += createStr("network", network);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_PrintDirectoryLabel = function (
    device,
    name,
    type
) {
    var d = "{";
    d += createTypeString("ZPL_PrintDirectoryLabel");
    d += createStr("device", device);
    d += createStr("name", name);
    d += createStr("type", type);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_SetWriteQuery = function (type) {
    var d = "{";
    d += createTypeString("ZPL_SetWriteQuery");
    d += createStr("type", type);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_RfidWrite = function (
    format,
    begin,
    size,
    memoryBlock,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_RfidWrite");
    d += createStr("format", format);
    d += createUnStr("begin", begin);
    d += createUnStr("size", size);
    d += createStr("memoryBlock", memoryBlock);
    d += createStr("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_RfidRead = function (
    format,
    begin,
    size,
    memoryBlock,
    headText,
    tailText
) {
    var d = "{";
    d += createTypeString("ZPL_RfidRead");
    d += createStr("format", format);
    d += createUnStr("begin", begin);
    d += createUnStr("size", size);
    d += createStr("memoryBlock", memoryBlock);
    d += createStr("headText", headText);
    d += createStr("tailText", tailText);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
ZPL_JSSDK.Builder.prototype.ZPL_RfidCalibration = function () {
    var d = '{"itemtype":"ZPL_RfidCalibration"}';

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};

ZPL_JSSDK.Builder.prototype.ReadData = function (readNum, customid, wait) {
    var d = "{";
    d += createTypeString("ReadData");
    d += createUnStr("readNum", readNum);
    d += createStr("customid", customid); //自定义id标记，会跟随放到返回消息中，可以为空
    d += createUnStr("wait", wait); //后端会一直阻塞直到读到数据
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};

//add by wjz 20210528
ZPL_JSSDK.Builder.prototype.ZPL_SetInverse = function () {
    var d = "{";
    d += createTypeString("ZPL_SetInverse");
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;

    return d;
};

//add by wjz 20210528
ZPL_JSSDK.Builder.prototype.DirectIO = function (
    readNum,
    customid,
    datatype,
    converttype,
    writedata
) {
    var d = "{";
    d += createTypeString("DirectIO");
    d += createStr("writedata", writedata);
    d += createUnStr("readNum", readNum); //这个字段会影响等待时间，请根据实际需要设置，当没有返回时设置0即可。
    d += createStr("customid", customid); //自定义id标记，会跟随放到返回消息中，可选填
    d += createUnStr("datatype", datatype); //输入数据类型（0：十六进制（默认），1：字符串），可选填
    d += createUnStr("converttype", converttype); //若输入数据有文本内容（当输入数据类型为十六进制时，此参数将被忽略），还能控制输入数据将要转码的类型（0：utf8编码（默认），1：gbk编码）（例如最终想要转成GBK的内容），可选填
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;

    return d;
};

//add by wjz 20210528
ZPL_JSSDK.Builder.prototype.ZPL_Text_BlockEx = function (
    xPos,
    yPos,
    fontNum,
    orientation,
    fontWidth,
    fontHeight,
    textblockWidth,
    maxline,
    align,
    hline_spacing,
    vline_spacing,
    text
) {
    var d = "{";
    d += createTypeString("ZPL_Text_BlockEx");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("fontNum", fontNum);
    d += createUnStr("orientation", orientation);
    d += createUnStr("fontWidth", fontWidth);
    d += createUnStr("fontHeight", fontHeight);

    d += createUnStr("textblockWidth", textblockWidth);
    d += createUnStr("maxline", maxline);
    d += createUnStr("align", align);
    d += createUnStr("hline_spacing", hline_spacing);
    d += createUnStr("vline_spacing", vline_spacing);

    d += createText("text", text);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};

//add by wjz 20220506
ZPL_JSSDK.Builder.prototype.ZPL_PrintPDF = function (
    xPos,
    yPos,
    width,
    height,
    xspace,
    yspace,
    dpi,
    pdfdata
) {
    var d = "{";
    d += createTypeString("ZPL_PrintPDF");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createUnStr("width", width);
    d += createUnStr("height", height);
    d += createUnStr("xspace", xspace);
    d += createUnStr("yspace", yspace);
    d += createUnStr("dpi", dpi);
    d += createStr("pdfdata", pdfdata);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};

//add by wjz 20220506
ZPL_JSSDK.Builder.prototype.ZPL_PrintImageStream = function (
    xPos,
    yPos,
    imgdata
) {
    var d = "{";
    d += createTypeString("ZPL_PrintImageStream");
    d += createUnStr("xPos", xPos);
    d += createUnStr("yPos", yPos);
    d += createStr("imgdata", imgdata);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};

//add by wjz 20220617
ZPL_JSSDK.Builder.prototype.ZPL_SetPrintQuantity = function (
    totalQuantity,
    pauseAndCutValue,
    replicatesOfEachSerialNumber,
    overridePauseCount
) {
    var d = "{";
    d += createTypeString("ZPL_SetPrintQuantity");
    d += createUnStr("totalQuantity", totalQuantity);
    d += createUnStr("pauseAndCutValue", pauseAndCutValue);
    d += createUnStr(
        "replicatesOfEachSerialNumber",
        replicatesOfEachSerialNumber
    );
    d += createStr("overridePauseCount", overridePauseCount);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};

ZPL_JSSDK.Builder.prototype.TimeSleep = function (time) {
    var d = "{";
    d += createTypeString("TimeSleep");
    d += createUnStr("time", time);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};

ZPL_JSSDK.Builder.prototype.ZPL_SetRFIDResultUploadingEnable = function (
    enable
) {
    var d = "{";
    d += createTypeString("ZPL_SetRFIDResultUploadingEnable");
    d += createUnStr("enable", 1);
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};

ZPL_JSSDK.Builder.prototype.ZPL_RfidReadDataPersistent = function (customid) {
    var d = "{";
    d += createTypeString("ZPL_RfidReadDataPersistent");
    d += createStr("customid", customid); //自定义id标记，会跟随放到返回消息中，可以为空
    d += "}";

    if (this.PrintData != "") {
        this.PrintData += ", ";
    }
    this.PrintData += d;
    return d;
};
