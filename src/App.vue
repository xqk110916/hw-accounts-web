<!--
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2022-06-01 14:10:11
 * @LastEditTime: 2022-06-10 12:26:03
 * @LastEditors: MingWei.Wu
-->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  metaInfo() {
    return {
      title: this.$store.state.settings.dynamicTitle && this.$store.state.settings.title,
      titleTemplate: title => {
        return title ? `${title} - ${process.env.VUE_APP_TITLE}` : process.env.VUE_APP_TITLE;
      },
    };
  },
};
</script>
