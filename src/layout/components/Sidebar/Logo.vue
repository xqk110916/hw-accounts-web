<!--
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2022-03-29 09:35:19
 * @LastEditTime: 2022-06-09 11:30:46
 * @LastEditors: MingWei.Wu
-->
<template>
  <div
    class="sidebar-logo-container"
    :class="{ collapse: collapse }"
    :style="{
      backgroundColor: sideTheme === 'theme-dark' ? variables.menuBackground : variables.menuLightBackground,
    }"
  >
    <transition name="sidebarLogoFade">
      <router-link class="sidebar-logo-link" key="collapse" to="/userCenter/index">
        <img class="sidebar-avatar" :style="{ 'margin-right': collapse ? '0' : '12px' }" :src="userInfo.headIcon" />
        <span class="sidebar-name">{{ userInfo.realName }}</span>
      </router-link>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import variables from 'zc-framework-ui/style/variables.module.scss';

export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    ...mapGetters(['userInfo']),
    variables() {
      return variables;
    },
    sideTheme() {
      return this.$store.state.settings.sideTheme;
    },
  },
};
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: #2b2f3a;
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;

    & .sidebar-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      vertical-align: middle;
    }

    & .sidebar-name {
      display: inline-block;
      margin: 0;
      color: #fff;
      font-weight: 600;
      line-height: 50px;
      font-size: 14px;
      vertical-align: middle;
    }
  }
}
</style>
