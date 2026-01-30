<!--
 * @Author: wangguixing
 * @Date: 2023-08-01 16:16:43
 * @LastEditors: wangguixing
 * @LastEditTime: 2023-08-02 09:32:23
 * @FilePath: \src\views\app\mobile\list.vue
-->
<template>
  <div style="height: 100%">
    <zcMobileList></zcMobileList>
  </div>
</template>

<script>
import zcMobileList from 'zcLowCodeUI/zcMobileList';
import MobileMixins from './mobile.mixins';
export default {
  name: 'mobileList',
  mixins: [MobileMixins],
  components: {
    zcMobileList,
  },
};
</script>

<style lang="scss" scoped></style>
