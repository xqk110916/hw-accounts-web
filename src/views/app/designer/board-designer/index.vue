<!--
 * @Author: wangguixing
 * @Date: 2023-08-01 16:16:43
 * @LastEditors: wangguixing
 * @LastEditTime: 2023-08-01 17:07:00
 * @FilePath: \src\views\app\designer\board-designer\index.vue
-->
<template>
  <div style="height: 100%">
    <zcBoardDesigner></zcBoardDesigner>
  </div>
</template>

<script>
import zcBoardDesigner from 'zcLowCodeUI/designerPage/boardDesigner';
export default {
  name: 'boardDesigner',
  components: {
    zcBoardDesigner,
  },
};
</script>

<style lang="scss" scoped></style>
