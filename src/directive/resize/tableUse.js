/*
 * @Descripttion: 监听元素宽高变化
 * @Author: zhangkunhe
 * @Date: 2022-05-26 17:42:43
 * @LastEditors: zhangkunhe
 * @LastEditTime: 2022-05-26 18:34:18
 */
export default {
  bind(el, binding) {
    let width = '',
      height = '';
    function get() {
      if (el) {
        const style = document.defaultView.getComputedStyle(el);
        if (width !== style.width || height !== style.height) {
          binding.value({ width, height });
        }
        width = style.width;
        height = style.height;
      }
    }

    el.__vueReize__ = setInterval(get, 200);
  },
  unbind(el) {
    clearInterval(el.__vueReize__);
  },
};
