<template>
  <div class="search_content">
    <el-row :gutter="10" class="search-row">
      <el-col :span="item.col || 5" v-for="item in options" :key="item.prop" class="search-col">
        <div class="btn-slot" v-if="item.type === 'slot'">
          <slot :name="item.slotName"></slot>
        </div>
        <div class="filter-item" v-else>
          <span class="label" :style="{ width: item.labelWidth || '70px' }">{{ item.label }}:</span>
          <div class="value">
            <el-date-picker
              v-if="item.type === 'daterange'"
              v-model="form[item.prop]"
              type="daterange"
              range-separator="至"
              start-placeholder="开始"
              end-placeholder="结束"
              value-format="yyyy-MM-dd"
              size="small"
              clearable
              style="width: 100%"
            >
            </el-date-picker>
            <el-input
              v-else-if="!item.type || item.type === 'text'"
              v-model="form[item.prop]"
              :placeholder="`请输入${item.label}`"
              size="small"
              clearable
            ></el-input>
            <el-select
              v-else-if="item.type === 'select'"
              v-model="form[item.prop]"
              :placeholder="'请选择' + item.label"
              size="small"
              clearable
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="list in item.option"
                :key="list.value"
                :label="list.label"
                :value="list.value"
              >
              </el-option>
            </el-select>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'SearchFilter',
  props: {
    form: {
      type: Object,
      default() {
        return {}
      },
    },
    options: {
      type: Array,
      default() {
        return []
      },
    },
  },
}
</script>

<style lang="scss" scoped>
.search_content {
  .search-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .search-col {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
  }

  .btn-slot {
    display: flex;
    align-items: center;
  }

  .filter-item {
    display: flex;
    align-items: center;
    width: 100%;
    font-size: 14px;
    
    .label {
      flex-shrink: 0;
      color: #626c78;
      text-align: right;
      padding-right: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .value {
      flex: 1;
      display: flex;
      align-items: center;
      min-width: 0; 

      ::v-deep .el-range-editor.el-input__inner {
        width: 100% !important;
        display: flex;
      }
    }
  }
}
</style>
