<template>
  <el-dialog
    title="设置浮动值"
    :visible.sync="visible"
    width="400px"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="90px" size="small">
      <el-form-item label="浮动上限(+)" prop="floatMax">
        <el-input
          v-model="form.floatMax"
          placeholder="请输入浮动上限"
          clearable
        />
      </el-form-item>
      <el-form-item label="浮动下限(-)" prop="floatMin">
        <el-input
          v-model="form.floatMin"
          placeholder="请输入浮动下限"
          clearable
        />
      </el-form-item>
      <el-form-item label="单位" prop="floatUnit">
        <el-select
          v-model="form.floatUnit"
          placeholder="请选择单位"
          clearable
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in unitOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="visible = false">取 消</el-button>
      <el-button type="primary" size="small" @click="submit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getDictionaryList } from '@/api/common/dictionary.js'

export default {
  name: 'FloatValueDialog',
  data() {
    return {
      visible: false,
      rowIndex: -1,
      form: {
        floatMax: '',
        floatMin: '',
        floatUnit: ''
      },
      unitOptions: [],
      rules: {}
    }
  },
  methods: {
    open(row, index) {
      this.visible = true
      this.rowIndex = index
      this.form = {
        floatMax: row.floatMax || '',
        floatMin: row.floatMin || '',
        floatUnit: row.floatUnit || ''
      }
      this.fetchUnitOptions()
    },
    fetchUnitOptions() {
      getDictionaryList({
        parentId: '2046860711332478977',
        currentPage: 1,
        pageSize: 999
      }).then(res => {
        if (res.code === 1) {
          this.unitOptions = (res.data.list || []).map(i => ({
            label: i.fullName,
            value: i.dictValue
          }))
        }
      })
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('confirm', { ...this.form }, this.rowIndex)
          this.visible = false
        }
      })
    },
    handleClose() {
      this.$refs.form && this.$refs.form.resetFields()
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: center;
}
</style>
