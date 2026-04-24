<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="600px"
    :before-close="handleClose">
    <div class="dialog-content">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px" size="small">
        <el-form-item label="材料代码" prop="goodCode">
          <el-input v-model="form.goodCode" placeholder="请输入材料代码"></el-input>
        </el-form-item>
        <el-form-item label="材料名称" prop="goodName">
          <el-input v-model="form.goodName" placeholder="请输入材料名称"></el-input>
        </el-form-item>
        <el-form-item label="通用名称" prop="commonName">
          <el-input v-model="form.commonName" placeholder="请输入通用名称"></el-input>
        </el-form-item>
        <el-form-item label="常用单位" prop="commonUnit">
          <el-select v-model="form.commonUnit" placeholder="请选择常用单位" clearable style="width: 100%">
            <el-option
              v-for="item in unitOptions"
              :key="item.id"
              :label="item.fullName"
              :value="item.dictValue">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 元素及同位素含量列表 -->
      <div class="elements-section">
        <div class="elements-header">
          <span>元素及同位素含量列表</span>
          <el-button type="text" icon="el-icon-plus" @click="addElement">添加元素</el-button>
        </div>
        <el-table :data="form.elements" border stripe size="mini" max-height="300">
          <el-table-column prop="element" label="元素名称">
            <template slot-scope="scope">
              <el-input v-model="scope.row.element" placeholder="请输入" size="mini" />
            </template>
          </el-table-column>
          <el-table-column prop="isotope" label="同位素">
            <template slot-scope="scope">
              <el-input v-model="scope.row.isotope" placeholder="请输入" size="mini" />
            </template>
          </el-table-column>
          <el-table-column prop="content" label="含量">
            <template slot-scope="scope">
              <el-input v-model="scope.row.content" placeholder="请输入" size="mini" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template slot-scope="scope">
              <el-button type="text" style="color: #f56c6c" @click="removeElement(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button size="small" type="primary" @click="submit">确定</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { requestFun } from './index.js'
import { getDictionaryList } from '@/api/common/dictionary.js'

export default {
  data() {
    return {
      visible: false, 
      title: '新增',
      form: { 
        id: '', 
        goodCode: '', 
        goodName: '', 
        commonName: '', 
        commonUnit: '', 
        elements: [] 
      },
      unitOptions: [],
      rules: {
        goodCode: [{ required: true, message: '请输入材料代码', trigger: 'blur' }],
        goodName: [{ required: true, message: '请输入材料名称', trigger: 'blur' }],
        commonName: [{ required: true, message: '请输入通用名称', trigger: 'blur' }]
      }
    }
  },
  methods: {
    open(row) {
      if (row && row.id) { 
        this.title = '编辑材料'
        requestFun.detail(row.id).then(res => {
          if (res.code === 1) {
            this.form = { ...res.data }
            if (!this.form.elements) this.form.elements = []
          }
        })
      } else { 
        this.title = '新增材料'
        this.resetForm()
      }
      this.getUnits()
      this.visible = true
    },
    getUnits() {
      // 常用单位字典父级 ID: 2046860711332478977
      getDictionaryList({ 
        parentId: '2046860711332478977', 
        currentPage: 1, 
        pageSize: 999 
      }).then(res => {
        if (res.code === 1) {
          this.unitOptions = res.data.list
        }
      })
    },
    resetForm() {
      this.form = { id: '', goodCode: '', goodName: '', commonName: '', commonUnit: '', elements: [] }
      this.$nextTick(() => { this.$refs.form && this.$refs.form.clearValidate() })
    },
    handleClose() { 
      this.resetForm()
      this.visible = false 
    },
    addElement() {
      this.form.elements.push({ element: '', isotope: '', content: '' })
    },
    removeElement(index) {
      this.form.elements.splice(index, 1)
    },
    submit() { 
      this.$refs.form.validate(valid => {
        if (valid) {
          const apiMethod = this.form.id ? requestFun.update : requestFun.add
          apiMethod(this.form).then(res => {
            if (res.code === 1) {
              this.$message.success('保存成功')
              this.visible = false
              this.resetForm()
              this.$emit('query')
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.dialog-content { padding: 10px 20px; }
.elements-section { display: flex; flex-direction: column; overflow: hidden; margin-top: 10px; }
.elements-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-weight: bold; font-size: 14px; }
.dialog-footer { text-align: right; margin-top: 20px; }
</style>
