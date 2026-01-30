import { parseTime } from './theseus';

/**
 * 日期时间格式化
 * @param {String|Date} dateTime [日期时间]
 * @return {String} [日期时间字符串，eg: xxxx-xx-xx xx:xx:xx]
 */
export function formatDate(dateTime) {
  if (dateTime == null || dateTime == '') return '';
  var date = new Date(dateTime);
  var year = date.getFullYear();
  var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  var hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  var seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}

/** 格式化时间
 * @param {number} timeStamp [时间戳]
 * @param {string} option  [配置项]
 * @returns {string} [时间字符串，eg: xx月xx日 xx时xx分]
 */
export function formatTime(timeStamp, option) {
  if (('' + timeStamp).length === 10) {
    timeStamp = parseInt(timeStamp) * 1000;
  } else {
    timeStamp = +timeStamp;
  }
  const d = new Date(timeStamp);
  const now = Date.now();
  const diff = (now - d) / 1000;
  if (diff < 30) {
    return '刚刚';
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前';
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前';
  } else if (diff < 3600 * 24 * 2) {
    return '1天前';
  }
  if (option) {
    return parseTime(timeStamp, option);
  } else {
    return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分';
  }
}

/**
 * 获取参数对象
 * @param {string} url [url链接]
 * @returns {Object} [参数对象]
 */
export function getQueryObject(url) {
  url = url == null ? window.location.href : url;
  const search = url.substring(url.lastIndexOf('?') + 1);
  const obj = {};
  const reg = /([^?&=]+)=([^?&=]*)/g;
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1);
    let val = decodeURIComponent($2);
    val = String(val);
    obj[name] = val;
    return rs;
  });
  return obj;
}

/**
 * @param {String} str [字符串]
 * @returns {Number}  [字节长度]
 */
export function byteLength(str) {
  // returns the byte length of an utf8 string
  let s = str.length;
  for (var i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s += 2;
    if (code >= 0xdc00 && code <= 0xdfff) i--;
  }
  return s;
}

/**
 * 深复制数组
 * @param {Array} actual [源数据]
 * @returns {Array} [结果]
 */
export function cleanArray(actual) {
  const newArray = [];
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}

/**
 * @param {Object} json
 * @returns {Array}
 */
export function param(json) {
  if (!json) return '';
  return cleanArray(
    Object.keys(json).map(key => {
      if (json[key] === undefined) return '';
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
    }),
  ).join('&');
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ');
  if (!search) {
    return {};
  }
  const obj = {};
  const searchArr = search.split('&');
  searchArr.forEach(v => {
    const index = v.indexOf('=');
    if (index !== -1) {
      const name = v.substring(0, index);
      const val = v.substring(index + 1, v.length);
      obj[name] = val;
    }
  });
  return obj;
}

/**
 * @param {string} val
 * @returns {string}
 */
export function html2Text(val) {
  const div = document.createElement('div');
  div.innerHTML = val;
  return div.textContent || div.innerText;
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
export function objectMerge(target, source) {
  if (typeof target !== 'object') {
    target = {};
  }
  if (Array.isArray(source)) {
    return source.slice();
  }
  Object.keys(source).forEach(property => {
    const sourceProperty = source[property];
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty);
    } else {
      target[property] = sourceProperty;
    }
  });
  return target;
}

/**
 * @param {HTMLElement} element
 * @param {string} className
 */
export function toggleClass(element, className) {
  if (!element || !className) {
    return;
  }
  let classString = element.className;
  const nameIndex = classString.indexOf(className);
  if (nameIndex === -1) {
    classString += '' + className;
  } else {
    classString = classString.substr(0, nameIndex) + classString.substr(nameIndex + className.length);
  }
  element.className = classString;
}

/**
 * @param {string} type
 * @returns {Date}
 */
export function getTime(type) {
  if (type === 'start') {
    return new Date().getTime() - 3600 * 1000 * 24 * 90;
  } else {
    return new Date(new Date().toDateString());
  }
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result;

  const later = function () {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp;

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function (...args) {
    context = this;
    timestamp = +new Date();
    const callNow = immediate && !timeout;
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone');
  }
  const targetObj = source.constructor === Array ? [] : {};
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys]);
    } else {
      targetObj[keys] = source[keys];
    }
  });
  return targetObj;
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr) {
  return Array.from(new Set(arr));
}

/**
 * @returns {string}
 */
export function createUniqueString() {
  const timestamp = +new Date() + '';
  const randomNum = parseInt((1 + Math.random()) * 65536) + '';
  return (+(randomNum + timestamp)).toString(32);
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls;
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
    ele.className = ele.className.replace(reg, ' ');
  }
}

export function makeMap(str, expectsLowerCase) {
  const map = Object.create(null);
  const list = str.split(',');
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val];
}

export const exportDefault = 'export default ';

export const beautifierConf = {
  html: {
    indent_size: '2',
    indent_char: ' ',
    max_preserve_newlines: '-1',
    preserve_newlines: false,
    keep_array_indentation: false,
    break_chained_methods: false,
    indent_scripts: 'separate',
    brace_style: 'end-expand',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: false,
    end_with_newline: true,
    wrap_line_length: '110',
    indent_inner_html: true,
    comma_first: false,
    e4x: true,
    indent_empty_lines: true,
  },
  js: {
    indent_size: '2',
    indent_char: ' ',
    max_preserve_newlines: '-1',
    preserve_newlines: false,
    keep_array_indentation: false,
    break_chained_methods: false,
    indent_scripts: 'normal',
    brace_style: 'end-expand',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: true,
    end_with_newline: true,
    wrap_line_length: '110',
    indent_inner_html: true,
    comma_first: false,
    e4x: true,
    indent_empty_lines: true,
  },
};

// 首字母大小
export function titleCase(str) {
  return str.replace(/( |^)[a-z]/g, L => L.toUpperCase());
}

// 下划转驼峰
export function camelCase(str) {
  return str.replace(/-[a-z]/g, str1 => str1.substr(-1).toUpperCase());
}

export function isNumberStr(str) {
  return /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(str);
}

export function objIsEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
/**
 * 压缩图片
 * @param {*} file 原始文件
 * @param {*} callback 回调
 * @param {*} config  overSize：需要压缩的图片大小(M) outFileType:压缩后的图片格式(传空为默认格式) quality 压缩的图片质量
 */
export function compressImg(file, callback, config = {}) {
  config.overSize = config.overSize || 0.5;
  config.quality = config.quality || 0.8;
  config.outFileType = config.outFileType || file.type;
  const { overSize, outFileType, quality } = config;
  if (file.size > overSize * 1024 * 1024) {
    let reader = new FileReader(),
      img = new Image();
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    img.onload = function () {
      //显示原始宽高--originWidth + "*" + originHeight;   显示原始大小(file.size / 1024 / 1024) + "M"
      // 图片原始尺寸
      let originWidth = this.width;
      let originHeight = this.height;
      let sizes = 0.5;
      let maxWidth = originWidth * sizes,
        maxHeight = originHeight * sizes;
      let targetWidth = originWidth,
        targetHeight = originHeight;
      if (originWidth > maxWidth || originHeight > maxHeight) {
        // 判断缩放后的尺寸是否与原图片的尺寸等比
        if (originWidth / originHeight > maxWidth / maxHeight) {
          targetWidth = maxWidth;
          targetHeight = Math.round(maxWidth * (originHeight / originWidth));
        } else {
          targetHeight = maxHeight;
          targetWidth = Math.round(maxHeight * (originWidth / originHeight));
        }
      }
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      context.clearRect(0, 0, targetWidth, targetHeight);
      // 图片压缩 ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);  sx（裁剪x轴） , sy（裁剪y轴） , swidth（原始裁剪宽） , sheight（原始裁剪高）  //裁剪原图片                dx（x轴）, dy（y轴）, dWidth(缩放宽), dHeigh(缩放高)//绘图图片位置与缩放
      context.drawImage(img, 0, 0, originWidth, originHeight, 0, 0, targetWidth, targetHeight);

      // 获取图片压缩后的base64文件，0.9的质量
      let img_base64 = canvas.toDataURL(outFileType, quality); //type----图片格式，默认为 图片原格式。encoderOptions----在指定图片格式为 image/jpeg 或 image/webp的情况下，可以从 0 到 1 的区间内选择图片的质量。如果超出取值范围，将会使用默认值 0.92。其他参数会被忽略。
      let initName = file.name;
      initName = initName.substring(0, initName.lastIndexOf('.') + 1) + outFileType.substring(outFileType.indexOf('/') + 1);
      file = base64toFile(img_base64, initName);
      let base64Img = img_base64;
      callback({ file, base64Img }); //压缩后的文件流
    };
    reader.onload = function (e) {
      // 文件base64化，以便获知图片原始尺寸
      img.src = e.target.result;
    };
    reader.readAsDataURL(file); //读取文件
  } else {
    callback({ file, base64Img: '' });
  }
}
export function base64toFile(base64Data, filename = new Date().getTime()) {
  //将base64转换为blob
  function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }
  //将blob转换为file
  function blobToFile(theBlob, fileName = new Date().getTime()) {
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
  }
  return blobToFile(dataURLtoBlob(base64Data), filename);
}

/**
 * @descripttion: 通过url 获取blob对象
 * @author: fanfuda
 * @param {*} url 文件地址
 * @return {*} Promise
 * @example:  urlGetBlob(url).then(blob => {})
 */
export function urlGetBlob(url) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      }
    };
    xhr.send();
  });
}
/**
 * @descripttion: blob 对象保存为 excel
 * @author: fanfuda
 * @param {*} blob
 * @param {*} fileName 保存的文件名称
 * @return {*}
 * @example:  blobSaveExcel(res, '核酸检测记录' );
 */
export function blobSaveExcel(blob, fileName) {
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, fileName); //允许用户在客户端上保存文件
  } else {
    const link = document.createElement('a');
    const body = document.querySelector('body');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.style.display = 'none';
    body.appendChild(link);
    link.click();
    body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  }
}

/**
 * @descripttion: url保存excel
 * @author: fanfuda
 * @param {*} url 文件地址
 * @param {*} fileName 保存的文件名称
 * @return {*}
 * @example:urlToExcel( url, this.failFileName + '.xls');
 */
export function urlToExcel(url, fileName) {
  urlGetBlob(url).then(blob => {
    blobSaveExcel(blob, fileName);
  });
}
/**
 * @descripttion: 获取请求地址完整路径
 * @author: fanfuda
 * @param {urls} 接口地址
 * @return {*} 完整接口地址
 * @example:
 */
export function getFullUrl(urls) {
  return (process.env.NODE_ENV === 'development' ? '' : window.location.origin) + process.env.VUE_APP_BASE_API + urls;
}

// 拖拽改变两个div宽度
export function dragTwoColDiv(contentId, leftBoxId, resizeId, rightBoxId) {
  let resize = document.getElementById(resizeId);
  let leftBox = document.getElementById(leftBoxId);
  let rightBox = document.getElementById(rightBoxId);
  let box = document.getElementById(contentId);
  resize.onmousedown = function (e) {
    let startX = e.clientX;
    resize.left = resize.offsetLeft;
    document.onmousemove = function (e) {
      let endX = e.clientX;
      let moveLen = resize.left + (endX - startX);
      let minT = 200;
      let maxT = parseInt(box.clientWidth / 2) + minT;
      if (moveLen < minT) moveLen = minT;
      if (moveLen > maxT - minT) moveLen = maxT - minT;
      resize.style.left = moveLen;
      leftBox.style.width = moveLen + 'px';
      rightBox.style.width = box.clientWidth - moveLen - 5 + 'px';
    };
    document.onmouseup = function () {
      document.onmousemove = null;
      document.onmouseup = null;
      resize.releaseCapture && resize.releaseCapture();
    };
    resize.setCapture && resize.setCapture();
    return false;
  };
}

// 节流
export function TreeDebounce(fun, delay) {
  return function (args) {
    let that = this;
    let _args = args;
    clearTimeout(fun.id);
    fun.id = setTimeout(function () {
      fun.call(that, _args);
    }, delay);
  };
}

export function isNotBlank(s) {
  if (typeof s == 'string' && s.length > 0) {
    return true;
  }
  return false;
}
