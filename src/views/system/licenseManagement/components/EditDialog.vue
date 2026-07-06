<template>
  <el-dialog
    :title="isEdit ? '编辑单位信息' : '新增单位信息'"
    :visible.sync="visible"
    width="500px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="100px" size="small">
      <el-form-item label="单位名称" prop="unitName">
        <el-input v-model="form.unitName" placeholder="请输入单位名称" clearable maxlength="20" show-word-limit></el-input>
      </el-form-item>
      <el-form-item label="单位代号" prop="unitCode">
        <el-input v-model="form.unitCode" placeholder="请输入单位代号" clearable maxlength="100"></el-input>
      </el-form-item>
      <el-form-item label="许可证号" prop="licenseNo">
        <el-input v-model="form.licenseNo" placeholder="请输入许可证号" clearable maxlength="100"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="visible = false">取 消</el-button>
      <el-button size="small" type="primary" :loading="submitLoading" @click="handleSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addDictionary, updateDictionary } from '@/api/common/dictionary.js'

export default {
  name: 'LicenseEditDialog',
  props: {
    parentId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      visible: false,
      submitLoading: false,
      isEdit: false,
      editId: '',
      form: {
        unitName: '',
        unitCode: '',
        licenseNo: '',
      },
      rules: {
        unitName: [{ required: true, message: '请输入单位名称', trigger: 'blur' }],
        unitCode: [{ required: true, message: '请输入单位代号', trigger: 'blur' }],
        licenseNo: [{ required: true, message: '请输入许可证号', trigger: 'blur' }],
      },
    }
  },
  methods: {
    open(row) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.form.resetFields()
        if (row) {
          this.isEdit = true
          this.editId = row.id
          this.form.unitName = row.unitName || ''
          this.form.unitCode = row.unitCode || ''
          this.form.licenseNo = row.licenseNo || ''
        } else {
          this.isEdit = false
          this.editId = ''
        }
      })
    },
    handleClosed() {
      this.isEdit = false
      this.editId = ''
      this.form = { unitName: '', unitCode: '', licenseNo: '' }
    },
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.doSubmit()
      })
    },
    async doSubmit() {
      if (!this.parentId) {
        this.$message.warning('未找到单位信息字典分类')
        return
      }
      this.submitLoading = true
      try {
        const payload = {
          parentId: this.parentId,
          fullName: this.form.unitName,
          dictValue: this.form.unitName,
          bizCode: this.form.unitName,
          description: `${this.form.unitCode}|${this.form.licenseNo}`,
          sortNum: 99,
          enableFlag: 1,
          dictType: 'detail',
        }
        let res
        if (this.isEdit) {
          res = await updateDictionary(this.editId, payload)
        } else {
          res = await addDictionary(payload)
        }
        if (res.code === 1) {
          this.$message.success(this.isEdit ? '编辑成功' : '新增成功')
          this.visible = false
          this.$emit('saved')
        } else {
          this.$message.error(res.msg || '操作失败')
        }
      } catch (e) {
        console.error('保存单位信息失败:', e)
        this.$message.error('保存失败')
      } finally {
        this.submitLoading = false
      }
    },
  },
}
</script>
