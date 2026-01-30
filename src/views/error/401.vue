<template>
  <div class="errPage-container">
    <el-row>
      <el-col :span="12">
        <h2>您没有访问权限！</h2>
        <h6>对不起，您没有访问权限，请联系系统管理员开通相关权限。</h6>
        <ul class="list-unstyled">
          <li class="link-type">
            <span @click.stop="back"> 返回登录页 </span>
          </li>
        </ul>
      </el-col>
      <el-col :span="12">
        <img :src="errGif" width="313" height="428" alt="Girl has dropped her ice cream." />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import errGif from '@/assets/images/401.gif';

export default {
  name: 'Page401',
  data() {
    return {
      errGif: errGif + '?' + +new Date(),
    };
  },
  methods: {
    back() {
      this.$store.dispatch('LogOut').then(() => {
        location.href = '/login';
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.errPage-container {
  width: 800px;
  max-width: 100%;
  margin: 100px auto;
  .list-unstyled {
    font-size: 14px;

    li {
      padding-bottom: 5px;
      color: #20a0ff;

      &:focus,
      &:hover {
        color: #20a0ff;
        cursor: pointer;
      }
    }
    a {
      color: #008489;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
