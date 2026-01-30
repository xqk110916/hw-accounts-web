<!--
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2022-06-01 16:34:31
 * @LastEditTime: 2022-06-06 13:49:26
 * @LastEditors: MingWei.Wu
-->
<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model="user.oldPassword" placeholder="请输入旧密码" type="password" show-password clearable />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="user.newPassword" placeholder="请输入新密码" type="password" show-password clearable />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" placeholder="请确认密码" type="password" show-password clearable />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">保存</el-button>
      <el-button type="danger" size="mini" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserPwd } from './api.js';
export default {
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.user.newPassword !== value) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };
    return {
      user: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      // 表单校验
      rules: {
        oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
        newPassword: [
          { required: true, message: '新密码不能为空', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
        ],
        confirmPassword: [
          { required: true, message: '确认密码不能为空', trigger: 'blur' },
          { required: true, validator: equalToPassword, trigger: 'blur' },
        ],
      },
      timer: null,
    };
  },
  mounted() {
    this.user = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  },
  methods: {
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          let param = {
            newPassword: this.user.newPassword,
            oldPassword: this.user.oldPassword,
          };
          updateUserPwd(param).then(() => {
            this.$modal.msgSuccess('修改成功,请重新登录！');
            this.timer = setTimeout(() => {
              this.$store.dispatch('LogOut').then(() => {
                this.$router.replace({ path: '/login' });
              }, 1000);
            });
          });
        }
      });
    },
    close() {
      this.$store.dispatch('tagsView/delView', this.$route);
      this.$router.push({ path: '/index' });
    },
  },
  beforeDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  },
};
</script>
