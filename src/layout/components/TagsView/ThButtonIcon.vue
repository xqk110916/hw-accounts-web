<template>
  <div class="ui-box">
    <div class="ui-btnIcon" :class="{ active: active }">
      <span class="ui-btnIcon__item item-btn">{{ text }}</span>
      <i class="item-icon el-icon-close" v-if="!isAffix" @click.stop="deleteBtn"></i>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    text: [String],
    isAffix: [Boolean],
    active: [Boolean],
  },
  methods: {
    deleteBtn() {
      this.$emit('close');
    },
  },
};
</script>
<style lang="scss" scoped>
.ui {
  &-btnIcon {
    margin-left: 10px;
    box-sizing: border-box;
    cursor: pointer;
    padding: 7px;
    display: flex;
    align-items: center;
    color: #666;
    height: 28px;
    font-size: 14px;
    line-height: 28px;
    background: #ffffff;
    border: 1px solid #ededed;
    border-radius: 3px;

    &__item {
      font-weight: 400;
    }
    .el-icon-close {
      margin-left: 4px;
      font-size: 12px;
    }
  }

  &-btnIcon:hover,
  &-btnIcon:focus {
    color: #1890ff;
    border-color: #badeff;
    background-color: #e8f4ff;
  }

  &-box {
    height: 39px;
    display: flex;
    align-items: center;
    .active {
      color: #fff;
      background: #1890ff;
      border: 1px solid #1890ff;
    }
    .active:hover {
      opacity: 0.6;
    }
  }
}
</style>
