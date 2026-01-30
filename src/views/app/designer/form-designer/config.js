/*
 * @Author: zhoushuang
 * @Date: 2023-07-31 09:13:39
 * @LastEditors: zhangkai
 * @LastEditTime: 2024-03-26 11:34:21
 * @FilePath: \party-construction-web\src\views\app\designer\form-designer\config.js
 * @Description:
 */
export default [
  // {
  //   componentsName: '会议记实模板', //组件名称
  //   componentsType: 8, //组件类型，自定义控件格局传入的defaultValue类型与后端确认数字编号
  //   group: 'customWidgets', // 分组标识，会自动划分到设计器左侧自定义控件中
  //   tag: 'templateComponents', // 表单组件的tag，渲染vue组件
  //   iconClass: 'icon-radio', // 项目中的svg名称
  //   setting: {}, //自行扩展属性
  // },
  // {
  //   componentsName: '自定义标题', //组件名称
  //   componentsType: 1, //组件类型，自定义控件格局传入的defaultValue类型与后端确认数字编号
  //   group: 'customWidgets', // 分组标识，会自动划分到设计器左侧自定义控件中
  //   tag: 'partyCustTitle', // 表单组件的tag，渲染vue组件
  //   iconClass: 'icon-radio', // 项目中的svg名称
  //   placeholder: '请输入',
  //   setting: { custHidden: true, orgLifeType: '' }, //自行扩展属性
  // },
  {
    componentsName: '会签控件', //组件名称
    componentsType: 664, //组件类型，自定义控件格局传入的defaultValue类型与后端确认数字编号
    group: 'customWidgets', // 分组标识，会自动划分到设计器左侧自定义控件中
    tag: 'countersign', // 表单组件的tag，渲染vue组件
    iconClass: 'icon-radio', // 项目中的svg名称
    placeholder: '请输入',
    setting: {}, //自行扩展属性
  },
];
