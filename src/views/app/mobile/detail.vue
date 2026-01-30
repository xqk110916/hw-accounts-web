<!--
 * @Author: wangguixing
 * @Date: 2023-08-01 16:16:43
 * @LastEditors: wangguixing
 * @LastEditTime: 2023-08-01 17:10:26
 * @FilePath: \src\views\app\mobile\detail.vue
-->
<template>
  <div style="height: 100%">
    <zcMobileDetail></zcMobileDetail>
  </div>
</template>

<script>
import zcMobileDetail from 'zcLowCodeUI/zcMobileDetail';
import MobileMixins from './mobile.mixins';
export default {
  name: 'mobileDetail',
  mixins: [MobileMixins],
  components: {
    zcMobileDetail,
  },
};
</script>

<style lang="scss" scoped></style>
