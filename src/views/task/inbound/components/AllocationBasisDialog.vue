<template>
  <el-dialog :close-on-click-modal="false"
    :title="form.id ? '编辑调拨依据' : '新增调拨依据'"
    :visible.sync="visible"
    width="600px"
    custom-class="show-footer-dialog"
    append-to-body
    @close="handleClose"
  >
    <div v-loading="loading">
      <el-form ref="form" :model="form" :rules="rules" label-width="60px" size="small">
      <el-form-item label="文号" prop="documentNoId">
        <div class="flex-row">
          <el-select
            v-model="form.documentNoId"
            placeholder="请选择或输入文号"
            filterable
            clearable
            style="flex: 1"
            @change="handleDocNumberChange"
          >
            <el-option
              v-for="item in docNumberOptions"
              :key="item.id"
              :label="item.docName"
              :value="item.id"
            >
              <div class="doc-option">
                <span class="doc-label">{{ item.docName }}</span>
                <span class="doc-actions">
                  <el-button type="text" icon="el-icon-edit" @click.stop="handleEditDoc(item)"></el-button>
                  <el-button type="text" icon="el-icon-delete" style="color: #f56c6c" @click.stop="handleDeleteDoc(item)"></el-button>
                </span>
              </div>
            </el-option>
          </el-select>
          <el-button
            type="primary"
            icon="el-icon-plus"
            class="ml-10"
            @click="handleAddDoc"
          >
            新增
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio label="0">调入</el-radio>
          <el-radio label="1">调出</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="0">未完成</el-radio>
          <el-radio :label="1">已完成</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 材料表格 -->
      <div class="table-section">
        <div class="table-header">
          <span>材料明细</span>
          <el-button type="text" icon="el-icon-plus" @click="addMaterial">添加材料</el-button>
        </div>
        <el-table :data="form.goodsList" border stripe size="mini" max-height="250">
          <el-table-column prop="goodCode" label="材料编码">
            <template slot-scope="scope">
              <el-input v-model="scope.row.goodCode" placeholder="请输入" />
            </template>
          </el-table-column>
          <el-table-column prop="goodNum" label="批准件数" width="100">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.goodNum"
                :precision="0"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column prop="goodWeight" label="批准量" width="100">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.goodWeight"
                :precision="3"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template slot-scope="scope">
              <el-button type="text" style="color: #f56c6c" @click="removeMaterial(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-form>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="visible = false">取 消</el-button>
      <el-button type="primary" size="small" @click="submit">保 存</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { 
  addTransferBasis, 
  updateTransferBasis, 
  getAllTransferBasisList, 
  getTransferBasisDetail,
  addDocNumber,
  deleteDocNumber,
  getAllDocNumberList,
  updateDocNumber
} from './api'

export default {
  name: 'AllocationBasisDialog',
  data() {
    return {
      loading: false,
      visible: false,
      isAddingNew: false,
      form: {
        id: '',
        documentNoId: '',
        type: '0',
        status: 0,
        goodsList: []
      },
      docNumberOptions: [],
      rules: {
        documentNoId: [{ required: true, message: '请选择或输入文号', trigger: 'change' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      }
    }
  },
  methods: {
    open(data) {
      this.resetForm()
      this.visible = true
      this.fetchDocNumbers()
      
      if (data && data.id) {
        this.loading = true
        getTransferBasisDetail(data.id).then(res => {
          if (res.code === 1) {
            const detail = res.data
            this.form = {
              ...this.form,
              ...detail,
              // 确保 ID 同步到 documentNoId 供下拉框回显
              documentNoId: detail.documentNoId || detail.documentNo
            }
          }
        }).finally(() => {
          this.loading = true
          this.loading = false
        })
      }
    },
    resetForm() {
      this.form = {
        id: '',
        documentNo: '',
        documentNoId: '',
        type: '0',
        status: 0,
        goodsList: []
      }
    },
    handleClose() {
      this.$refs.form && this.$refs.form.resetFields()
    },
    handleDocNumberChange(id) {
      const doc = this.docNumberOptions.find(i => i.id === id)
      if (doc) {
        this.form.documentNo = doc.docName
      } else {
        this.form.documentNo = ''
      }
    },
    fetchDocNumbers() {
      return getAllDocNumberList().then(res => {
        if (res.code === 1) {
          this.docNumberOptions = res.data || []
        }
      })
    },
    handleAddDoc() {
      this.$prompt('请输入新增文号', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '文号不能为空'
      }).then(({ value }) => {
        addDocNumber({ docCode: value, docName: value }).then(res => {
          if (res.code === 1) {
            this.fetchDocNumbers().then(() => {
              const doc = this.docNumberOptions.find(i => i.docName === value)
              if (doc) {
                this.form.documentNoId = doc.id
                this.form.documentNo = doc.docName
              }
            })
          }
        })
      })
    },
    handleEditDoc(item) {
      this.$prompt('请输入新文号', '编辑文号', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: item.docName,
        inputPattern: /.+/,
        inputErrorMessage: '文号不能为空'
      }).then(({ value }) => {
        updateDocNumber({ id: item.id, docCode: value, docName: value }).then(res => {
          if (res.code === 1) {
            this.fetchDocNumbers()
            if (this.form.documentNoId === item.id) {
              // 更新完成可能 ID 不变，但这里为了逻辑严谨刷新下
            }
          }
        })
      })
    },
    handleDeleteDoc(item) {
      this.$confirm(`确认删除文号 "${item.docName}" 吗？`, '警告', {
        type: 'warning'
      }).then(() => {
        deleteDocNumber({ id: item.id }).then(res => {
          if (res.code === 1) {
            this.fetchDocNumbers()
            if (this.form.documentNoId === item.id) {
              this.form.documentNoId = ''
            }
          }
        })
      })
    },
    addMaterial() {
      this.form.goodsList.push({
        goodCode: '',
        goodNum: '1',
        goodWeight: '0'
      })
    },
    removeMaterial(index) {
      this.form.goodsList.splice(index, 1)
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (!this.form.goodsList || this.form.goodsList.length === 0) {
            this.$message.warning('请至少添加一条材料明细')
            return
          }
          for (let i = 0; i < this.form.goodsList.length; i++) {
            const item = this.form.goodsList[i]
            if (!item.goodCode) {
              this.$message.warning(`第 ${i + 1} 行材料明细的材料编码不能为空`)
              return
            }
          }
          const apiMethod = this.form.id ? updateTransferBasis : addTransferBasis
          const payload = {
            ...this.form,
            documentNo: this.form.documentNo, // 传名称
            documentNoId: this.form.documentNoId // 传 ID
          }
          apiMethod(payload).then(res => {
            if (res.code === 1) {
              this.$message.success('保存成功')
              this.$emit('success')
              this.visible = false
            }
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.flex-row {
  display: flex;
  align-items: center;
}
.ml-10 {
  margin-left: 10px;
}
.table-section {
  margin-top: 20px;
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: bold;
    color: #606266;
  }
}
.dialog-footer {
  text-align: center;
  padding-top: 10px;
}

.doc-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.doc-actions {
  .el-button--text {
    padding: 0 5px;
  }
}
::v-deep .el-table {
  .el-input__inner {
    border: none;
    padding: 0 5px;
  }
  .el-input-number.is-controls-right .el-input__inner {
    padding-left: 5px;
    padding-right: 30px;
  }
}
</style>
