<!--
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2022-06-01 16:34:31
 * @LastEditTime: 2022-06-06 11:23:45
 * @LastEditors: MingWei.Wu
-->
<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="用户姓名" prop="realName">
      <el-input v-model="user.realName" maxlength="30" />
    </el-form-item>
    <el-form-item label="手机号码" prop="mobilePhone">
      <el-input v-model="user.mobilePhone" maxlength="11" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="user.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="user.gender">
        <el-radio :label="0">未知</el-radio>
        <el-radio :label="1">男</el-radio>
        <el-radio :label="2">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">保存</el-button>
      <el-button type="danger" size="mini" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateBaseUserInfo } from './api.js';

export default {
  data() {
    return {
      // 表单校验
      rules: {
        realName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
        email: [
          { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
          {
            type: 'email',
            message: "'请输入正确的邮箱地址",
            trigger: ['blur', 'change'],
          },
        ],
        mobilePhone: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur',
          },
        ],
      },
      user: {
        realName: '',
        mobilePhone: '',
        email: '',
        gender: '',
      },
    };
  },
  mounted() {
    this.user = JSON.parse(JSON.stringify(this.$store.state.user.userInfo));
  },
  methods: {
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          let param = this.user;
          updateBaseUserInfo(param).then(res => {
            if (res.code === 1) {
              this.$modal.msgSuccess('修改成功');
              this.$store.commit('SET_USERINFO', this.user);
              this.$emit('update');
            }
          });
        }
      });
    },
    close() {
      this.$store.dispatch('tagsView/delView', this.$route);
      this.$router.push({ path: '/index' });
    },
  },
};
</script>
