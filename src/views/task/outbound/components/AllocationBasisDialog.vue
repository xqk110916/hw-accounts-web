<template>
  <el-dialog :close-on-click-modal="false"
    :title="form.id ? '编辑调拨依据' : '新增调拨依据'"
    :visible.sync="visible"
    width="850px"
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

      <el-form-item label="类型">
        <el-radio-group v-model="form.type" disabled>
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
        <el-table :data="form.goodsList" border stripe size="mini" max-height="300">
          <el-table-column prop="goodCode" label="材料代码" width="140">
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.goodCode"
                placeholder="请选择"
                clearable
                filterable
              >
                <el-option
                  v-for="item in materialCodeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="goodWeight" label="批准量" width="90">
            <template slot-scope="scope">
              <el-input v-model="scope.row.goodWeight" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column prop="remainWeight" label="已用量" width="90">
            <template slot-scope="scope">
              <el-input v-model="scope.row.remainWeight" style="width: 100%" />
            </template>
          </el-table-column>

          <el-table-column label="浮动值">
            <template slot-scope="scope">
              <div class="float-cell">
                <span v-if="getFloatDisplay(scope.row)" class="float-text">{{ getFloatDisplay(scope.row) }}</span>
                <span v-else class="float-text">-</span>
                <el-button type="text" size="mini" @click="openFloatDialog(scope.row, scope.$index)">设置</el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
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

    <FloatValueDialog ref="floatDialog" @confirm="handleFloatConfirm" />
  </el-dialog>
</template>

<script>
import {
  addTransferBasis,
  updateTransferBasis,
  getTransferBasisDetail,
  addDocNumber,
  deleteDocNumber,
  getAllDocNumberList,
  getMaterialCodeListAll,
  updateDocNumber
} from '@/views/task/inbound/components/api'
import FloatValueDialog from './FloatValueDialog.vue'

export default {
  name: 'OutboundAllocationBasisDialog',
  components: { FloatValueDialog },
  data() {
    return {
      loading: false,
      visible: false,
      form: {
        id: '',
        documentNoId: '',
        documentNo: '',
        type: '1',
        status: 0,
        goodsList: []
      },
      docNumberOptions: [],
      materialCodeOptions: [],
      rules: {
        documentNoId: [{ required: true, message: '请选择或输入文号', trigger: 'change' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      }
    }
  },
  methods: {
    open(data) {
      this.resetForm()
      this.visible = true
      this.fetchDocNumbers()
      this.fetchMaterialCodes()

      if (data && data.id) {
        this.loading = true
        getTransferBasisDetail(data.id).then(res => {
          if (res.code === 1) {
            const detail = res.data
            this.form = {
              ...this.form,
              ...detail,
              type: '1',
              documentNoId: detail.documentNoId || detail.documentNo,
              goodsList: (detail.goodsList || []).map(item => ({
                goodCode: item.goodCode || '',
                goodWeight: item.goodWeight || '',
                remainWeight: item.remainWeight || '',
                goodNum: item.goodNum || '',
                remainNum: item.remainNum || '',
                floatMax: item.floatMax || '',
                floatMin: item.floatMin || '',
                floatUnit: item.floatUnit || ''
              }))
            }
          }
        }).finally(() => {
          this.loading = false
        })
      }
    },
    resetForm() {
      this.form = {
        id: '',
        documentNo: '',
        documentNoId: '',
        type: '1',
        status: 0,
        goodsList: []
      }
    },
    handleClose() {
      this.$refs.form && this.$refs.form.resetFields()
    },
    handleDocNumberChange(id) {
      const doc = this.docNumberOptions.find(i => i.id === id)
      this.form.documentNo = doc ? doc.docName : ''
    },
    fetchDocNumbers() {
      return getAllDocNumberList().then(res => {
        if (res.code === 1) {
          this.docNumberOptions = res.data || []
        }
      })
    },
    fetchMaterialCodes() {
      return getMaterialCodeListAll().then(res => {
        if (res.code === 1) {
          this.materialCodeOptions = (res.data || [])
            .map(item => {
              const goodCode = item.goodCode
              const name = item.goodName
              return {
                label: name && name !== goodCode ? `${goodCode} - ${name}` : goodCode,
                value: goodCode
              }
            })
            .filter(item => item.value)
        }
      }).catch(() => {
        this.materialCodeOptions = []
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
        goodWeight: '',
        remainWeight: '',
        goodNum: '',
        remainNum: '',
        floatMax: '',
        floatMin: '',
        floatUnit: ''
      })
    },
    removeMaterial(index) {
      this.form.goodsList.splice(index, 1)
    },
    getFloatDisplay(row) {
      const upper = row.floatMax
      const lower = row.floatMin
      const unit = row.floatUnit
      if (!upper && !lower) return ''
      const parts = []
      if (upper) parts.push(`+${upper}`)
      if (lower) parts.push(`-${lower}`)
      return parts.join(' / ') + (unit ? ` / ${unit}` : '')
    },
    openFloatDialog(row, index) {
      this.$refs.floatDialog.open(row, index)
    },
    handleFloatConfirm(data, index) {
      if (index >= 0 && index < this.form.goodsList.length) {
        this.$set(this.form.goodsList[index], 'floatMax', data.floatMax)
        this.$set(this.form.goodsList[index], 'floatMin', data.floatMin)
        this.$set(this.form.goodsList[index], 'floatUnit', data.floatUnit)
      }
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
              this.$message.warning(`第 ${i + 1} 行材料明细的材料代码不能为空`)
              return
            }
          }
          const apiMethod = this.form.id ? updateTransferBasis : addTransferBasis
          const payload = {
            ...this.form,
            type: '1'
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
.float-cell {
  display: flex;
  align-items: center;
  .float-text {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    color: #606266;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
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
  .el-select {
    width: 100%;
  }
  .el-input__inner {
    border: none;
    padding: 0 5px;
  }
}
</style>
