<!--
 * @Author: wangguixing
 * @Date: 2023-08-01 16:16:43
 * @LastEditors: wangguixing
 * @LastEditTime: 2023-08-01 16:17:06
 * @FilePath: \src\views\app\designer\card-designer\index.vue
-->
<template>
  <div style="height: 100%">
    <zcCardDesigner></zcCardDesigner>
  </div>
</template>

<script>
import zcCardDesigner from 'zcLowCodeUI/designerPage/cardDesigner';
export default {
  name: 'cardDesigner',
  components: {
    zcCardDesigner,
  },
};
</script>

<style lang="scss" scoped></style>
