<!--
 * @Author: wangguixing
 * @Date: 2023-08-01 16:16:43
 * @LastEditors: wangguixing
 * @LastEditTime: 2023-08-01 16:53:15
 * @FilePath: \src\views\app\designer\form-public\publicForm.vue
-->
<template>
  <div style="height: 100%">
    <zcPublicForm></zcPublicForm>
  </div>
</template>

<script>
import zcPublicForm from 'zcLowCodeUI/designerPage/formPublic/publicForm';
export default {
  name: 'publicForm',
  components: {
    zcPublicForm,
  },
};
</script>

<style lang="scss" scoped></style>
