<!--
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2022-06-01 16:34:31
 * @LastEditTime: 2022-06-08 13:59:23
 * @LastEditors: MingWei.Wu
-->
<template>
  <div class="page-profile">
    <el-row :gutter="20">
      <el-col :span="8" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div>
            <userAvatar style="text-align: center" :user="userInformation" />

            <ul class="list-group list-group-striped">
              <li class="list-group__item">
                <svg-icon icon-class="user" />&nbsp;&nbsp;用户姓名
                <span class="value">{{ userInformation.realName }}</span>
              </li>
              <li class="list-group__item">
                <svg-icon icon-class="phone" />&nbsp;&nbsp;手机号码
                <span class="value">{{ userInformation.mobilePhone }}</span>
              </li>
              <li class="list-group__item">
                <svg-icon icon-class="email" />&nbsp;&nbsp;用户邮箱
                <span class="value">{{ userInformation.email }}</span>
              </li>
              <li class="list-group__item">
                <svg-icon icon-class="tree" />&nbsp;&nbsp;所属部门
                <span class="value" v-if="mainDept && mainDept.deptName">
                  {{ mainDept.deptName + (mainDept.postName ? `/${mainDept.postName}` : '') }}
                </span>
              </li>
              <li class="list-group__item">
                <svg-icon icon-class="peoples" />&nbsp;&nbsp;所属角色
                <span class="value">{{ roleStr }}</span>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16" :xs="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>基本资料</span>
          </div>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo @update="getUser" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd :user="userInformation" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import userAvatar from './userAvatar.vue';
import userInfo from './userInfo';
import resetPwd from './resetPwd';
import { getInfo } from './api';

export default {
  name: 'Profile',
  components: { userAvatar, userInfo, resetPwd },
  data() {
    return {
      userInformation: {},
      roleStr: '',
      mainDept: { deptName: '', postName: '' },
      activeTab: 'userinfo',
    };
  },
  mounted() {
    this.getUser();
  },
  methods: {
    async getUser() {
      const { code, msg, data } = await getInfo().then(res => res);
      if (code === 1) {
        console.log(data);
        const { userBo, mainDept, roleList } = data;
        this.userInformation = userBo;
        this.mainDept = mainDept;
        this.roleStr = roleList.map(item => item.roleName).join(',');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.page-profile {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 10px !important;
  margin: 0 !important;
  background: #f5f7f8 !important;

  .list-group {
    padding-left: 0px;
    list-style: none;
    font-size: 14px;

    &__item {
      color: #606266;
      padding: 10px 0;
      border-bottom: 1px solid #dcdfe6;
      .value {
        margin: 0;
        padding: 0;
        float: right;
        color: #1f2f3d;
      }

      &:last-child {
        border-bottom: none;
      }
    }

    &-striped > .list-group__item {
      border-left: 0;
      border-right: 0;
      border-radius: 0;
      padding-left: 0;
      padding-right: 0;
    }
  }
}
</style>
