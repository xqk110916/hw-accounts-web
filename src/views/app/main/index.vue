<template>
  <div style="height: 100%">
    <zcMainAppPage></zcMainAppPage>
  </div>
</template>

<script>
import zcMainAppPage from 'zcLowCodeUI/app';
export default {
  name: 'MainAppPage',
  components: {
    zcMainAppPage,
  },
  beforeDestroy() {
    localStorage.removeItem('layout-theme');
  },
};
</script>

<style lang="scss" scoped></style>
