<template>
  <div style="height: 100%">
    <zcFormDesignerPage :customWidgetsConfig="config"></zcFormDesignerPage>
  </div>
</template>

<script>
import config from './config';
import zcFormDesignerPage from 'zcLowCodeUI/designerPage/formDesigner';
export default {
  name: 'FormDesignerPage',
  data() {
    return {
      config,
    };
  },
  components: {
    zcFormDesignerPage,
  },
};
</script>

<style lang="scss" scoped></style>
