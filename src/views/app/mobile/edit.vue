<!--
 * @Author: wangguixing
 * @Date: 2023-08-01 16:16:43
 * @LastEditors: wangguixing
 * @LastEditTime: 2023-08-01 17:10:20
 * @FilePath: \src\views\app\mobile\edit.vue
-->
<template>
  <div style="height: 100%">
    <zcMobileEdit></zcMobileEdit>
  </div>
</template>

<script>
import zcMobileEdit from 'zcLowCodeUI/zcMobileEdit';
import MobileMixins from './mobile.mixins';
export default {
  name: 'mobileEdit',
  mixins: [MobileMixins],
  components: {
    zcMobileEdit,
  },
};
</script>

<style lang="scss" scoped></style>
