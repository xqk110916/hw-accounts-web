<template>
  <div class="search_content">
    <el-row :gutter="10" class="search-row">
      <el-col :span="item.col || 5" v-for="item in renderOptions" :key="item.prop" class="search-col">
        <div class="btn-slot" v-if="item.type === 'slot'">
          <slot :name="item.slotName"></slot>
          <el-button v-if="showToggle && item.slotName === 'footer'" type="text" class="toggle-btn" @click="isExpanded = !isExpanded">
            {{ isExpanded ? '收起' : '展开' }}<i :class="isExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
          </el-button>
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
            <el-date-picker
              v-else-if="item.type === 'year'"
              v-model="form[item.prop]"
              type="year"
              :placeholder="`默认全${item.label}`"
              value-format="yyyy"
              size="small"
              style="width: 100%"
            ></el-date-picker>
            <el-select
              v-else-if="item.type === 'select'"
              v-model="form[item.prop]"
              :placeholder="'请选择' + item.label"
              size="small"
              clearable
              filterable
              :multiple="item.multiple"
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
            <el-radio-group v-else-if="item.type === 'radioGroup'" v-model="form[item.prop]" size="small">
              <el-radio-button v-for="opt in item.option" :key="opt.value" :label="opt.value">{{ opt.label }}</el-radio-button>
            </el-radio-group>
            <el-checkbox-group v-else-if="item.type === 'checkboxGroup'" v-model="form[item.prop]" size="small">
              <el-checkbox v-for="opt in item.option" :key="opt.value" :label="opt.value">{{ opt.label }}</el-checkbox>
            </el-checkbox-group>
            <slot v-else-if="item.type === 'custom'" :name="item.prop"></slot>
            <el-input
              v-else-if="!item.type || item.type === 'text'"
              v-model="form[item.prop]"
              :placeholder="`请输入${item.label}`"
              size="small"
              clearable
            ></el-input>
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
  data() {
    return {
      isExpanded: false
    }
  },
  computed: {
    showToggle() {
      let sum = 0;
      this.options.forEach(item => {
        sum += (item.col || 5);
      });
      return sum > 24;
    },
    renderOptions() {
      if (this.isExpanded || !this.showToggle) {
        return this.options;
      }
      
      const footerOption = this.options.find(item => item.type === 'slot' && item.slotName === 'footer');
      const footerCol = footerOption ? (footerOption.col || 5) : 0;
      
      let sum = 0;
      const result = [];
      for (let item of this.options) {
        if (item === footerOption) continue;
        if (sum + (item.col || 5) + footerCol <= 24) {
          result.push(item);
          sum += (item.col || 5);
        } else {
          break;
        }
      }
      if (footerOption) {
        result.push(footerOption);
      }
      return result;
    }
  }
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
    .toggle-btn {
      margin-left: 10px;
    }
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
