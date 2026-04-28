import Vue from 'vue';
import App from '@/App';
import Cookies from 'js-cookie';
import Element from 'element-ui';
import 'element-ui/lib/theme-chalk/icon.css';
import '@/assets/styles/index.scss';

// //标准框架UI组件库npm 方式引入
import zcUI from 'zc-framework-ui/lib/index/index';
import 'zc-framework-ui/lib/index/style.css';

import store from '@/store';
import router from '@/router';
import '@/router/permission';
import VueMeta from 'vue-meta';
import Plugins from '@/plugins';
import Directive from '@/directive';
import Components from '@/components';
import axios from 'axios';
import './assets/icons';
import * as echarts from 'echarts';

const originalWarnHandler = Vue.config.warnHandler;
Vue.config.warnHandler = (msg, vm, trace) => {
  const isElementDatePickerPlacementWarning =
    msg && msg.includes('Prop being mutated: "placement"') &&
    trace && trace.includes('<ElDatePicker>');

  if (isElementDatePickerPlacementWarning) return;

  if (originalWarnHandler) {
    originalWarnHandler(msg, vm, trace);
    return;
  }

  console.error(`[Vue warn]: ${msg}${trace || ''}`);
};

Vue.use(zcUI);
Vue.use(VueMeta);
Vue.use(Plugins);
Vue.use(Directive);
Vue.use(Components);
Vue.use(Element, { size: Cookies.get('size') || 'small' });
Vue.config.productionTip = false;
Vue.prototype.$axios = axios;
Vue.prototype.$echarts = echarts;
Vue.prototype.$eventBus = new Vue();
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
Vue.config.devtools = process.env.NODE_ENV === 'development';
