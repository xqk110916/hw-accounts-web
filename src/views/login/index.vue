<template>
  <div class="login">
    <Verify
      ref="verify"
      :captcha-type="'blockPuzzle'"
      :img-size="{ width: '362px', height: '140px' }"
      @success="handleLogin"
      @stopLoade="stopLoade"
    />
    <el-form class="login-form" :model="loginForm" :rules="loginRules" ref="loginForm">
      <h3 class="title">{{ systemName }}</h3>
      <el-form-item prop="account">
        <el-input v-model="loginForm.account" type="text" auto-complete="off" placeholder="账号" ref="accountInp">
          <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="md5Password">
        <el-input v-model="loginForm.md5Password" type="password" auto-complete="off" placeholder="密码" ref="passwordInp" show-password>
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" :true-label="'1'" :false-label="'0'" style="margin: 0px 0px 25px 0px">记住密码</el-checkbox>
      <el-form-item style="width: 100%">
        <el-button :loading="loading" size="medium" type="primary" style="width: 100%" @click.native.prevent="checkParam">
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 组织切换 -->
    <div v-if="showSelectedOrg" class="selected-org-list">
      <div class="div-back" @click="backToLogin()">
        <svg class="svg-back" width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
            fill="none"
            stroke="#9ca0a6"
            stroke-width="3"
            stroke-linejoin="round"
          />
          <path d="M32.4917 24.5H14.4917" stroke="#9ca0a6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M23.4917 15.5L14.4917 24.5L23.4917 33.5" stroke="#9ca0a6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        返回
      </div>
      <span class="org-title"> 选择您要进入到组织 </span>
      <span class="org-tips"> 你在以下组织中均有相关角色 </span>
      <div class="org-list">
        <div class="org-item" :class="itm.lastLogin ? 'org-item-bg' : ''" v-for="itm in orgList" :key="itm.id" @click="orgLogin(itm.id)">
          <span class="span-last-login" v-if="itm.lastLogin">上次登录</span>
          <div class="org-short-name">{{ itm.shortName.substring(0, 4) }}</div>
          <span class="org-name">{{ itm.fullName }}</span>
          <svg
            :class="itm.lastLogin ? 'svg-selected-show' : 'svg-selected'"
            width="16"
            height="16"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M41.9999 24H5.99994" stroke="#1890ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M30 12L42 24L30 36" stroke="#1890ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>
    </div>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2024 河南众诚信息科技股份有限公司</span>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie';
import { encrypt, decrypt } from '@/utils/jsencrypt';
import md5 from 'js-md5';
import { getOrgList } from './api';
export default {
  name: 'Login',
  data() {
    return {
      systemName: process.env.VUE_APP_TITLE,
      codeUrl: '',
      cookiePassword: '',
      loginForm: {
        account: '',
        md5Password: '',
        rememberMe: '0',
      },
      loginRules: {
        account: [{ required: true, trigger: 'blur', message: '请输入您的账号' }],
        md5Password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
      },
      loading: false,
      // // 验证码开关
      // captchaOnOff: false,
      // 注册开关
      register: false,
      redirect: undefined,
      showSelectedOrg: false,
      orgList: [],
      postParams: {},
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  created() {
    this.getKeyCode();
    this.getCookie();
  },
  methods: {
    backToLogin() {
      this.showSelectedOrg = false;
      this.loading = false;
    },
    getKeyCode() {
      let self = this;
      document.onkeydown = function (e) {
        var key = window.event.keyCode;
        if (key == 13) {
          self.checkParam();
        }
      };
    },
    getCookie() {
      const account = Cookies.get('account');
      const md5Password = Cookies.get('md5Password');
      const rememberMe = Cookies.get('rememberMe');
      this.loginForm = {
        account: account === undefined ? this.loginForm.account : account,
        md5Password: md5Password === undefined ? this.loginForm.md5Password : decrypt(md5Password),
        rememberMe: rememberMe === undefined ? this.loginForm.rememberMe : rememberMe,
      };
    },
    checkParam() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          if (this.loginForm.rememberMe) {
            Cookies.set('account', this.loginForm.account, { expires: 30 });
            Cookies.set('md5Password', encrypt(this.loginForm.md5Password), {
              expires: 30,
            });
            Cookies.set('rememberMe', this.loginForm.rememberMe, {
              expires: 30,
            });
          } else {
            Cookies.remove('account');
            Cookies.remove('md5Password');
            Cookies.remove('rememberMe');
          }
          this.$refs.verify.show();
        }
      });
    },
    //获取组织列表
    async postOrgList() {
      try {
        const { code, data } = await getOrgList(this.postParams);
        if (code === 1) {
          if (data.length == 1) {
            this.postLogin({ ...this.postParams, orgId: data[0].id });
            return;
          }
          this.orgList = data;
          this.showSelectedOrg = true;
        }
      } catch (error) {
        console.error(error);
        this.loading = false;
      }
    },
    //组织登录
    orgLogin(id) {
      this.postLogin({ ...this.postParams, orgId: id });
    },
    handleLogin(captcha) {
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          this.loading = true;
          const { captchaVerification } = captcha;
          const { account, rememberMe, md5Password } = this.loginForm;
          const params = {
            account: account.trim(),
            password: md5(md5Password),
            rememberMe,
            captchaVerification,
          };
          if (this.loginForm.rememberMe) {
            Cookies.set('account', this.loginForm.account, { expires: 30 });
            Cookies.set('md5Password', encrypt(this.loginForm.md5Password), { expires: 30 });
            Cookies.set('rememberMe', this.loginForm.rememberMe, { expires: 30 });
          } else {
            Cookies.remove('account');
            Cookies.remove('md5Password');
            Cookies.remove('rememberMe');
          }

          this.postParams = {
            account: account.trim(),
            password: md5(md5Password),
            rememberMe,
            captchaVerification: captchaVerification,
            orgId: '',
          };
          await this.postOrgList();

          // this.$store
          //   .dispatch('Login', params)
          //   .then(res => {
          //     console.log(res);
          //     if (res.msg == '验证码已失效' || res.msg == '验证码错误') {
          //       return;
          //     } else {
          //       this.$router.push({ path: this.redirect || '/' });
          //     }
          //   })
          //   .catch(() => {
          //     this.loading = false;
          //   });
        }
      });
    },
    //登录
    postLogin(params) {
      this.$store
        .dispatch('Login', params)
        .then(res => {
          if (res.msg == '验证码已失效' || res.msg == '验证码错误') {
            return;
          } else {
            this.$store.dispatch('setIsUserLogin', false);
            this.$router.push({ path: this.redirect || '/' });
          }
        })
        .catch(() => {
          this.loading = false;
          this.backToLogin();
        });
    },
    stopLoade() {
      this.loading = false;
    },
  },
  beforeDestroy() {
    //取消键盘监听事件
    document.onkeydown = null;
  },
};
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url('~@/assets/images/login-background.png');
  background-size: cover;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  margin-left: 700px;
  .el-input {
    height: 38px;
    input {
      height: 38px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 38px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #666;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 38px;
}
</style>
