<template>
  <div style="height: 100%; padding: 16px">
    <zcFlowLaunch></zcFlowLaunch>
  </div>
</template>
      
<script>
import zcFlowLaunch from 'zcLowCodeUI/zcFlowLaunch';
export default {
  name: 'FlowLaunch',
  components: {
    zcFlowLaunch,
  },
  created() {
    this.$router.push({ path: '/flow/zcFlowLaunch', query: { status: 0 } });
  },
};
</script>
      
<style lang="scss" scoped>
::v-deep {
  .el-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    box-sizing: border-box;
    padding: 40px 0;
    .el-empty__image {
      width: 160px;
    }
    .el-empty__description {
      margin-top: 20px;
      p {
        margin: 0;
        font-size: 14px;
        color: grey;
      }
    }
  }
}
</style>