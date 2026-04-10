/*
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2021-11-29 09:22:39
 * @LastEditTime: 2024-03-21 14:11:51
 * @LastEditors: zhangkai
 */

import Verify from './Verify/Verify.vue';
import ImageUpload from '@/components/ImageUpload';
import FileUpload from '@/components/FileUpload';
import Echarts from '@/components/Echarts';
import SearchFilter from '@/components/SearchFilter';
import countersign from '@/components/countersign/index';
import countersignSetting from '@/components/countersign/setting';

export default {
  install(Vue) {
    Vue.component('Verify', Verify);
    Vue.component('ImageUpload', ImageUpload);
    Vue.component('FileUpload', FileUpload);
    Vue.component('Echarts', Echarts);
    Vue.component('SearchFilter', SearchFilter);
    // 低代码组件注册
    Vue.component('zcFromEditComponent', () => import('zcLowCodeUI/zcFromEdit'));
    // // 详情页面
    Vue.component('zcFromDetailsComponent', () => import('zcLowCodeUI/zcFromDetails'));
    Vue.component('countersign', countersign);
    Vue.component('countersignSetting', countersignSetting);
  },
};
