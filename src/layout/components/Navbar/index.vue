<template>
  <div class="navbar">
    <div class="navbar-left">
      <hamburger class="hamburger-container" :is-active="sidebar.opened" @toggleClick="toggleSideBar" />
      <span class="navbar-name">{{ systemName }}</span>
    </div>
    <div class="navbar-right">
      <el-badge :is-dot="noReadCount != '0'">
        <svg-icon icon-class="bell" @click.native="toMessage"></svg-icon>
      </el-badge>

      <screenfull v-if="device !== 'mobile'" class="right-menu-item hover-effect" />
      <span class="navbar-right__logout" @click="logout"> <el-icon class="el-icon-switch-button" />退出登录</span>
    </div>
  </div>
</template>

<script>
import { myNoReadCount } from '@/api/common/message';

import { mapGetters } from 'vuex';
import Hamburger from './Hamburger.vue';
import Screenfull from './Screenfull.vue';

export default {
  components: { Hamburger, Screenfull },
  data() {
    return {
      systemName: process.env.VUE_APP_TITLE,
      noReadCount: '0',
      // largeScreenUrl: process.env.VUE_APP_LARGE_SCREEN_URL,
    };
  },
  created() {
    this.getMyNoReadCount();
  },
  computed: {
    ...mapGetters(['sidebar', 'userInfo', 'device']),
    setting: {
      get() {
        return this.$store.state.settings.showSettings;
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val,
        });
      },
    },
    topNav: {
      get() {
        return this.$store.state.settings.topNav;
      },
    },
    largeScreenShow: {
      get() {
        const hasMenu = this.$store.getters?.menuList?.length > 0;
        if (hasMenu) {
          let flag = false;
          this.$store.getters.menuList.map(item => {
            if (item.path === 'information') {
              item.children.map(val => {
                if (val.path === 'largeScreen') {
                  return (flag = true);
                }
              });
            }
          });
          return flag;
        } else {
          return false;
        }
      },
    },
  },
  methods: {
    // toLargeScreen() {
    //   window.open(this.largeScreenUrl);
    // },
    getMyNoReadCount() {
      myNoReadCount().then(res => {
        this.noReadCount = res.data;
      });
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar');
    },
    toMessage() {
      this.$router.push('/messageIndex');
    },
    async logout() {
      this.$confirm('确定退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = '/admin/index';
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'zc-framework-ui/style/variables.module.scss';

.navbar {
  box-sizing: border-box;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &-left {
    display: flex;
    align-items: center;

    .hamburger-container {
      padding: $base-nav-left-icon-padding;
      height: 100%;
      float: left;
      cursor: pointer;
      color: #303133;
      font-size: 18px;
      transition: background 0.3s;

      &:hover {
        background: rgba(0, 0, 0, 0.025);
      }
      .navbar-name {
        display: inline-block;
        height: 28px;
        line-height: 28px;
        font-size: $base-nav-font-size;
        font-family: $base-nav-font-family;
        color: $base-nav-text-color;
      }
    }
  }

  &-right {
    margin-right: 10px;
    height: 100%;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;

    .largeScreen {
      margin-right: 24px;
      width: 24px;
      height: 24px;
    }
    .right-menu-item {
      margin-left: 20px;
    }
    .navbar-right__logout {
      margin: 0 10px;
      display: flex;
      align-items: center;
      height: 13px;
      font-size: 14px;
      font-weight: 400;
      color: $base-nav-right-text-color;

      .el-icon-switch-button {
        margin-right: 3px;
        color: #666;
        font-size: 18px;
        font-weight: bold;
      }
    }

    &:focus {
      outline: none;
    }
  }
}
</style>
