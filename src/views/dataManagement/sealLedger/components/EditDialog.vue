<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="620px"
    append-to-body
    :close-on-click-modal="false"
    :before-close="handleCancel"
  >
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="rules" label-width="100px" size="small">
      <el-form-item label="封记编码1" prop="sealCode1">
        <el-input v-model="formData.sealCode1" maxlength="64" placeholder="请输入封记编码1" clearable />
      </el-form-item>
      <el-form-item label="封记类型1" prop="sealType1">
        <el-select v-model="formData.sealType1" class="full-input" placeholder="请选择封记类型1" clearable filterable>
          <el-option v-for="item in sealTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="封记编码2" prop="sealCode2">
        <el-input v-model="formData.sealCode2" maxlength="64" placeholder="请输入封记编码2" clearable />
      </el-form-item>
      <el-form-item label="封记类型2" prop="sealType2">
        <el-select v-model="formData.sealType2" class="full-input" placeholder="请选择封记类型2" clearable filterable>
          <el-option v-for="item in sealTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="登记时间" prop="registerTime">
        <el-date-picker
          v-model="formData.registerTime"
          class="full-input"
          type="datetime"
          placeholder="请选择登记时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          clearable
        />
      </el-form-item>
      <el-form-item label="封记状态" prop="sealStatus">
        <el-radio-group v-model="formData.sealStatus">
          <el-radio :label="0">完好</el-radio>
          <el-radio :label="1">破损</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="容器" prop="containerCode">
        <el-select v-model="formData.containerCode" class="full-input" placeholder="请选择容器" clearable filterable>
          <el-option v-for="item in containerOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button size="small" @click="handleCancel">取消</el-button>
      <el-button type="primary" size="small" :loading="submitLoading" @click="handleSave">保存</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { addSealRecord, getSealRecordDetail, updateSealRecord } from './api.js'

const emptyForm = () => ({
  id: '',
  sealCode1: '',
  sealType1: '',
  sealCode2: '',
  sealType2: '',
  registerTime: '',
  sealStatus: 0,
  containerCode: '',
})

export default {
  name: 'EditDialog',
  props: {
    sealTypeOptions: {
      type: Array,
      default() {
        return []
      },
    },
    containerOptions: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    const sealCodePattern = /^[\u4e00-\u9fa5A-Za-z0-9_-]+$/
    const validateSealCode = (rule, value, callback) => {
      const text = value ? String(value).trim() : ''
      if (!text) return callback(new Error(rule.message))
      if (text.length > 64) return callback(new Error('长度不能超过64个字符'))
      if (!sealCodePattern.test(text)) return callback(new Error('仅允许中文、英文、数字、短横线、下划线'))
      callback()
    }
    const validateSealCode2 = (rule, value, callback) => {
      const text = value ? String(value).trim() : ''
      if (!text) return callback(new Error('请输入封记编码2'))
      if (text === String(this.formData.sealCode1).trim()) return callback(new Error('封记编码2不能与封记编码1重复'))
      validateSealCode({ message: '请输入封记编码2' }, value, callback)
    }
    const validateRegisterTime = (rule, value, callback) => {
      if (!value) return callback(new Error('请选择登记时间'))
      const time = new Date(value.replace(/-/g, '/')).getTime()
      if (!time) return callback(new Error('请选择合法登记时间'))
      if (time > Date.now()) return callback(new Error('登记时间不能晚于当前时间'))
      callback()
    }
    return {
      visible: false,
      mode: 'add',
      formLoading: false,
      submitLoading: false,
      formData: emptyForm(),
      originalFormText: '',
      rules: {
        sealCode1: [{ required: true, validator: validateSealCode, message: '请输入封记编码1', trigger: 'blur' }],
        sealType1: [{ required: true, message: '请选择封记类型1', trigger: 'change' }],
        sealCode2: [{ required: true, validator: validateSealCode2, trigger: 'blur' }],
        sealType2: [{ required: true, message: '请选择封记类型2', trigger: 'change' }],
        registerTime: [{ required: true, validator: validateRegisterTime, trigger: 'change' }],
        sealStatus: [{ required: true, message: '请选择封记状态', trigger: 'change' }],
        containerCode: [{ required: true, message: '请选择容器', trigger: 'change' }],
      },
    }
  },
  computed: {
    title() {
      return this.mode === 'edit' ? '编辑' : '新增'
    },
  },
  methods: {
    async open(row) {
      this.visible = true
      this.mode = row && row.id ? 'edit' : 'add'
      this.formData = emptyForm()
      this.originalFormText = JSON.stringify(this.formData)
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
      if (this.mode === 'edit') {
        this.formLoading = true
        try {
          const res = await getSealRecordDetail(row.id)
          this.formData = {
            ...emptyForm(),
            ...(res.data || {}),
          }
          if (this.formData.sealStatus !== '' && this.formData.sealStatus !== null && this.formData.sealStatus !== undefined) {
            this.formData.sealStatus = Number(this.formData.sealStatus)
          }
          this.originalFormText = JSON.stringify(this.formData)
        } finally {
          this.formLoading = false
        }
      }
    },
    async handleSave() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        const payload = {
          containerCode: this.formData.containerCode,
          registerTime: this.formData.registerTime,
          sealCode1: String(this.formData.sealCode1).trim(),
          sealCode2: String(this.formData.sealCode2).trim(),
          sealType1: this.formData.sealType1,
          sealType2: this.formData.sealType2,
          sealStatus: this.formData.sealStatus,
        }
        if (this.mode === 'edit') payload.id = this.formData.id
        this.submitLoading = true
        try {
          const res = this.mode === 'edit' ? await updateSealRecord(payload) : await addSealRecord(payload)
          if (res.code === 1) {
            this.$message.success('保存成功')
            this.visible = false
            this.$emit('saved')
          }
        } finally {
          this.submitLoading = false
        }
      })
    },
    handleCancel(done) {
      const close = () => {
        this.visible = false
        if (typeof done === 'function') done()
      }
      if (JSON.stringify(this.formData) === this.originalFormText) {
        close()
        return
      }
      this.$confirm('当前内容未保存，确定取消吗？', '提示', { type: 'warning' })
        .then(close)
        .catch(() => {})
    },
  },
}
</script>

<style lang="scss" scoped>
.full-input {
  width: 100%;
}
</style>
