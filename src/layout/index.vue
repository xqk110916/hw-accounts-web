<template>
  <div :class="appClass" class="theme-layout" :style="{ '--current-color': theme }">
    <div class="theme-layout__mobile-bg" v-if="device === 'mobile' && sidebar.opened" @click="handleClickOutside" />
    <!-- 侧边菜单栏 -->
    <sidebar class="theme-layout__sidebar" />
    <!-- 右侧容器 -->
    <div :class="{ 'theme-layout__container': true, hasTagsView: needTagsView }">
      <!-- header -->
      <div :class="{ 'theme-layout__fixed-header': true, 'fixed-header': fixedHeader }">
        <!-- 头部nav条 -->
        <navbar class="theme-layout__navbar" />
        <!-- 当前打开页面tag -->
        <tags-view class="theme-layout__tags-view" v-if="needTagsView" />
      </div>
      <!-- 内容区 -->
      <app-main class="theme-layout__app-main" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ResizeMixin from './mixin/ResizeHandler';
import { AppMain, Navbar, Sidebar, TagsView } from './components';

export default {
  name: 'Layout',
  components: { AppMain, Navbar, Sidebar, TagsView },
  mixins: [ResizeMixin],
  computed: {
    ...mapState({
      theme: state => state.settings.theme,
      sidebar: state => state.app.sidebar,
      device: state => state.app.device,
      sideTheme: state => state.settings.sideTheme,
      needTagsView: state => state.settings.tagsView,
      fixedHeader: state => state.settings.fixedHeader,
    }),
    appClass() {
      return {
        'theme-layout': true,
        mobile: this.device === 'mobile',
        openSidebar: this.sidebar.opened,
        hideSidebar: !this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
      };
    },
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false });
    },
  },
};
</script>

<style lang="scss">
@import 'zc-framework-ui/style/layout.scss';

.theme-layout .theme-layout__container .theme-layout__fixed-header + .theme-layout__app-main {
  padding-top: 105px !important;
}
</style>
