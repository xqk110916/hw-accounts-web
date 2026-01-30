<template>
  <div style="height: 100%; padding: 16px">
    <zcFlowDid></zcFlowDid>
  </div>
</template>
      
<script>
import zcFlowDid from 'zcLowCodeUI/zcFlowDid';
export default {
  name: 'FlowDid',
  components: {
    zcFlowDid,
  },
  created() {
    this.$router.push({ path: '/flow/zcFlowDid', query: { status: 2 } });
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
      