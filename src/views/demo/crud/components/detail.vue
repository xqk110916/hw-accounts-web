<template>
  <theme-edit :show="show" showFooterSlot title="编辑" :column="1" @cancle="close">
    <el-form ref="form" class="form" :model="form" :rules="rules" label-width="130px">
      <el-form-item v-for="item in formKeys" :label="item.label" :prop="item.prop" v-if="judgeRowShow(item)">
        <el-input
          v-if="judgeInput(item)"
          v-model="form[item.prop]"
          :type="item.type || 'text'"
          size="small"
          :placeholder="`请输入${item.label}`"
          @blur="value => changeFormValue(value, item)"
          clearable
        ></el-input>
        <el-select
          v-if="item.type === 'select'"
          v-model="form[item.prop]"
          size="small"
          :placeholder="`请选择${item.label}`"
          @change="value => changeFormValue(value, item)"
          clearable
        >
          <el-option v-for="item in options[item.prop]" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <el-cascader
          v-if="item.type === 'cascader'"
          v-model="form[item.prop]"
          :options="options[item.prop]"
          size="small"
          :placeholder="`请选择${item.label}`"
          @change="value => changeFormValue(value, item)"
          :props="item.props || defaultProps"
          clearable
        >
        </el-cascader>
      </el-form-item>
    </el-form>
    <div class="footer">
      <el-button size="small" @click="close">取消</el-button>
      <el-button type="primary" size="small" @click="submitForm">确定</el-button>
    </div>
  </theme-edit>
</template>

<script>
import { deepClone } from '@/utils';

import { config, requestFun, beforeSubmit, beforeRecurrence } from './index.js';
export default {
  data() {
    return {
      row: {},
      show: false,
      type: 'add', // add 添加 edit 编辑 view 查看
      formKeys: [],
      form: {},
      rules: {},
      options: {},
      defaultProps: {
        label: 'label',
        value: 'id',
      },
    };
  },
  computed: {},
  created() {
    this.handleParams();
  },
  methods: {
    open(row) {
      console.warn(row);
      this.row = row || {};
      if (this.row.id) {
        this.getDetails(this.row.id).then(res => {
          this.show = true;
        });
      } else {
        this.show = true;
      }
    },
    close() {
      this.resetForm();
      this.$nextTick(() => {
        this.show = false;
      });
    },
    openMap() {
      this.$refs.baiduMap.open();
    },
    getDetails(id) {
      return requestFun.detail({ id }).then(res => {
        let data = res.data;
        config.detail.forEach(item => {
          if (data[item.prop]) {
            this.$set(this.form, item.prop, data[item.prop]);
            // this.form[item.prop] = data[item.prop];
          }
        });
        if (beforeRecurrence) beforeRecurrence(this.form, this);
        console.log('this.form', this.form);
        return data;
      });
    },
    async submitForm() {
      let payload = deepClone(this.form);
      if (this.row.id) payload.id = this.row.id;
      this.$refs.form.validate(async valid => {
        if (valid) {
          if (beforeSubmit) payload = await beforeSubmit(payload);
          console.log(payload);
          requestFun.edit(payload).then(res => {
            if (res.code === 1) {
              this.$message.success('操作成功');
              this.$emit('query');
              this.close();
            }
          });
        } else {
          return false;
        }
      });
    },
    resetForm() {
      this.row = {};
      // this.form = this.clearObjectValues(this.form)
      this.form = this.$options.data().form;
      this.$refs.form.resetFields();
    },
    changeFormValue(value, item) {
      // this.$nextTick(() => this.$forceUpdate())
      if (item.change && typeof item.change === 'function') {
        item.change(value, this.form);
      }
    },

    judgeInput(row) {
      if (!row.type || row.type === 'text' || row.type === 'textarea') {
        return true;
      } else {
        return false;
      }
    },
    judgeRowShow(item) {
      let handle = null;
      switch (this.type) {
        case 'add':
          handle = item.isAdd;
          break;
        case 'edit':
          handle = item.isUpdate;
          break;
        case 'view':
          handle = item.isView;
          break;
        default:
          handle = () => true;
          break;
      }
      let flag = true;
      switch (typeof handle) {
        case 'function':
          flag = handle(this.form);
          break;
        case 'boolean':
          flag = handle;
          break;
        case 'undefined':
          flag = true;
          break;
      }
      return flag;
    },
    handleParams() {
      config.detail.forEach(item => {
        this.formKeys.push(item);
        let defaultValue = this.form[item.prop] || item.defaultValue || '';
        this.$set(this.form, item.prop, defaultValue);
        if (item.option) this.getOptions(item);

        if (item.required || item.required !== false) {
          let isInput = this.judgeInput(item);
          let rule = { required: true, message: `请${isInput ? '请输入' : '请选择'}${item.label}`, trigger: isInput ? 'blur' : 'change' };
          this.$set(this.rules, item.prop, [rule]);
        }
      });
    },
    getOptions(item) {
      if (!Array.isArray(item.option)) {
        item.option.then(res => {
          let ary = Array.isArray(res.data) ? res.data : res.data.list;
          this.$set(this.options, item.prop, ary);
        });
      } else {
        this.$set(this.options, item.prop, item.option);
      }
      console.log(this.options);
    },
    clearObjectValues(obj) {
      for (let key in obj) {
        obj[key] = '';
      }
      return obj;
    },
    // 获取选项列表中指定值对应的label
    getLabelByValue(value, options, keyValue = { label: 'label', value: 'id' }) {
      const findLabel = (values, opts) => {
        let label = '';
        for (const item of opts) {
          if (values.includes(item[keyValue.value])) {
            label = item[keyValue.label];
            if (item.children) {
              const nextValue = values.slice(values.indexOf(item[keyValue.value]) + 1);
              if (nextValue.length > 0) {
                label += ',' + findLabel(nextValue, item.children);
              }
            }
            return label;
          } else if (item.children) {
            const found = findLabel(values, item.children);
            if (found) return found;
          }
        }
        return label;
      };
      return findLabel(value, options);
    },
    // 根据元素ID在树中查找所有祖先节点
    findAncestors(key, trees, targetId, ancestors = []) {
      console.log(trees, targetId);
      for (let i = 0; i < trees.length; i++) {
        const tree = trees[i];
        const result = this.findAncestorInTree(key, tree, targetId, ancestors);
        if (result) {
          return result; // 如果在某一棵树中找到，直接返回结果
        }
      }
      return null; // 如果在所有树中都没有找到，返回null
    },

    findAncestorInTree(key, tree, target, ancestors) {
      console.log('====', tree, target);
      // 检查当前节点的子节点
      if (tree.children) {
        for (let i = 0; i < tree.children.length; i++) {
          const child = tree.children[i];
          if (child[key] === target) {
            // 如果找到目标ID，返回当前的祖先列表（不包含目标ID）
            return ancestors.concat(tree[key]); // 或者使用 [...ancestors, tree.id]
          }
          // 否则，递归地在子树中查找
          const result = this.findAncestorInTree(key, child, target, ancestors.concat(tree[key]));
          if (result) {
            return result; // 如果在子树中找到，返回结果
          }
        }
      }
      return null; // 如果当前树或子树中没有找到，返回null
    },
  },
};
</script>

<style lang="scss" scoped>
.form {
  padding: 20px;

  ::v-deep .el-cascader,
  ::v-deep .el-select,
  ::v-deep .el-input__inner {
    width: 100%;
  }
}
.footer {
  padding: 12px 32px 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #c4c9cf;
}
</style>
