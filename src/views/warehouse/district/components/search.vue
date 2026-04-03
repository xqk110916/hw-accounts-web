<template>
  <div class="search_content">
    <el-row>
      <el-col :span="item.col || 5" v-for="item in options" :key="item.prop">
        <div class="btn" v-if="item.type === 'slot'">
          <slot :name="item.slotName"></slot>
        </div>
        <div class="col" v-else>
          <span class="label">{{ item.label }}: </span>
          <div class="value">
            <el-input v-if="!item.type || item.type === 'text'" v-model="form[item.prop]" :placeholder="`请输入${item.label}`" clearable></el-input>
            <el-select v-if="item.type === 'select'" v-model="form[item.prop]" :placeholder="'请选择' + item.label" clearable filterable>
              <el-option v-for="list in item.option" :key="list.value" :label="list.label" :value="list.value"> </el-option>
            </el-select>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  props: {
    form: {
      type: Object,
      default() {
        return {};
      },
    },
    options: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.search_content {
  .col {
    display: flex;
    font-size: 14px;
    // border: 1px solid #c4c9cf;
    border-radius: 3px;
    padding-left: 12px;
    box-sizing: border-box;
    margin-right: 12px;
    margin-bottom: 8px;
    .label {
      display: inline-block;
      display: flex;
      align-items: center;
      color: #626c78;
      margin-right: 16px;
    }
    .value {
      flex: 1;

      // ::v-deep .el-input__inner {
      //   border: 0;
      // }
    }
  }
}
</style>
