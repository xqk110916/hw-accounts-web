<!--
 * @Author: wangguixing
 * @Date: 2023-09-07 15:28:25
 * @LastEditors: zhangkai
 * @LastEditTime: 2024-03-22 09:14:30
 * @FilePath: \src\components\partyCustTitle\setting.vue
-->
<template>
  <el-form label-position="top" size="mini" label-width="90px" style="margin-top: 12px !important">
    <el-form-item label="标题名"> <el-input v-model="activeData.componentsName" placeholder="请输入" maxlength="10" /> </el-form-item>
    <el-form-item label="展示标题"> <el-switch v-model="activeData.showLabel" /> </el-form-item>
    <el-form-item label="控件宽度">
      <el-radio-group v-model="activeData.span" size="mini">
        <el-radio-button size="mini" label="6">1/4</el-radio-button> <el-radio-button size="mini" label="8">1/3</el-radio-button>
        <el-radio-button size="mini" label="12">1/2</el-radio-button> <el-radio-button size="mini" label="16">2/3</el-radio-button>
        <el-radio-button size="mini" label="18">3/4</el-radio-button> <el-radio-button size="mini" label="24">1</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="是否禁用"> <el-switch v-model="activeData.disabled" /> </el-form-item>
    <el-form-item label="是否必填"> <el-switch v-model="activeData.required" /> </el-form-item>
    <el-form-item label="是否隐藏"> <el-switch v-model="activeData.hidden" /> </el-form-item>
    <el-form-item label="新增时隐藏"> <el-switch v-model="activeData.setting.hiddenWhenAdd" /> </el-form-item>
    <!-- <el-form-item label="自定义隐藏"> <el-switch v-model="activeData.setting.custHidden" /> </el-form-item> -->
  </el-form>
</template>

<script>
export default {
  name: 'countersignSetting',
  props: { activeData: Object },
  components: {},
  mixins: [],
  data() {
    return {};
  },
  mounted() {
    console.log(this.activeData);
  },
  methods: {
    // todo
  },
};
</script>
<style lang="scss" scoped>
::v-deep {
  .el-radio-button__inner {
    padding: 8px;
  }
  .el-radio-group {
    display: flex;
    height: 40px;
    align-items: center;
    .el-radio-button__inner {
      padding: 8px 8px;
    }
  }
  .el-form-item {
    margin-bottom: 12px !important;
    .el-form-item__label {
      padding: 0 !important;
      color: rgba(0, 0, 0, 0.9) !important;
    }
  }
}
</style>
