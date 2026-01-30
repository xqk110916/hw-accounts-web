<!--
 * @Descripttion: 
 * @Author: suo
 * @Date: 2023-07-03 18:55:12
 * @LastEditors: suo
 * @LastEditTime: 2023-07-04 18:32:48
-->
<template>
  <div style="height: 100%">
    <zc-lowcode-preview-page ref="121312"></zc-lowcode-preview-page>
  </div>
</template>

<script>
import zcLowcodePreviewPage from 'zcLowCodeUI/zcLowcodePreview';
export default {
  name: 'zcLowcodePreviewPageOps',
  components: {
    zcLowcodePreviewPage,
  },
  computed: {
    visitedViews() {
      return this.$store.state.tagsView.visitedViews;
    },
    routes() {
      return this.$store.state.permission.routes;
    },
  },
  beforeRouteEnter(to, form, next) {
    const pathList = to.path.split('/');
    Object.assign(to.params);
    const pathLength = pathList.length;
    if (pathLength > 4) {
      const paramsList = pathList.splice(-4);
      if (paramsList.length === 4) {
        Object.assign(to.params, { applicationId: paramsList[0], groudId: paramsList[1], workSheetId: paramsList[2], viewId: paramsList[3] });
        next();
      }
    }
    if (to.params?.applicationId && to.params?.workSheetId && to.params?.viewId) {
      next();
    }
  },
  mounted() {},
};
</script>

<style lang="scss" scoped></style>
