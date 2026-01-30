<!--
 * @Author: wangguixing
 * @Date: 2023-08-01 16:16:43
 * @LastEditors: wangguixing
 * @LastEditTime: 2023-08-01 16:53:54
 * @FilePath: \src\views\app\designer\form-public\publicSearch.vue
-->
<template>
  <div style="height: 100%">
    <zcPublicSearch></zcPublicSearch>
  </div>
</template>

<script>
import zcPublicSearch from 'zcLowCodeUI/designerPage/formPublic/publicSearch';
export default {
  name: 'publicSearch',
  components: {
    zcPublicSearch,
  },
};
</script>

<style lang="scss" scoped></style>
