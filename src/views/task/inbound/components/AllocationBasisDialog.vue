<template>
  <el-dialog
    :title="form.id ? '编辑调拨依据' : '新增调拨依据'"
    :visible.sync="visible"
    width="600px"
    custom-class="show-footer-dialog"
    append-to-body
    @close="handleClose"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="60px" size="small">
      <el-form-item label="文号" prop="name">
        <div class="flex-row">
          <el-select
            v-if="!isAddingNew"
            v-model="form.name"
            placeholder="请选择文号"
            filterable
            clearable
            style="flex: 1"
          >
            <el-option
              v-for="item in nameOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-input
            v-else
            v-model="form.name"
            placeholder="请输入文号"
            style="flex: 1"
          />
          <el-button
            type="primary"
            class="ml-10"
            @click="isAddingNew = !isAddingNew"
          >
            {{ isAddingNew ? '选择' : '新增' }}
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio label="inbound">调入</el-radio>
          <el-radio label="outbound">调出</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio label="unfinished">未完成</el-radio>
          <el-radio label="completed">已完成</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 材料表格 -->
      <div class="table-section">
        <div class="table-header">
          <span>材料明细</span>
          <el-button type="text" icon="el-icon-plus" @click="addMaterial">添加材料</el-button>
        </div>
        <el-table :data="form.materials" border stripe size="mini" max-height="250">
          <el-table-column prop="materialCode" label="材料编码">
            <template slot-scope="scope">
              <el-input v-model="scope.row.materialCode" placeholder="请输入" />
            </template>
          </el-table-column>
          <el-table-column prop="approveCount" label="批准件数" width="100">
            <template slot-scope="scope">
              <el-input-number
                v-model="scope.row.approveCount"
                :precision="0"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column prop="approveWeight" label="批准量" width="100">
            <template slot-scope="scope">
              <el-input-number
                v-model="scope.row.approveWeight"
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

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="visible = false">取 消</el-button>
      <el-button type="primary" size="small" @click="submit">保 存</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'AllocationBasisDialog',
  data() {
    return {
      visible: false,
      isAddingNew: false,
      form: {
        id: '',
        name: '',
        type: 'inbound',
        status: 'unfinished',
        materials: []
      },
      nameOptions: [],
      rules: {
        name: [{ required: true, message: '请输入或选择文号', trigger: 'change' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      }
    }
  },
  methods: {
    open(data) {
      if (data) {
        this.form = {
          ...this.form,
          ...JSON.parse(JSON.stringify(data))
        }
      } else {
        this.form = {
          id: '',
          name: '',
          type: 'inbound',
          status: 'unfinished',
          materials: []
        }
      }
      this.visible = true
      this.isAddingNew = false
      this.fetchNames()
    },
    handleClose() {
      this.$refs.form && this.$refs.form.resetFields()
    },
    fetchNames() {
      // 模拟加载已有文号
      this.nameOptions = [
        { label: 'xx【2025】01号', value: 'xx【2025】01号' },
        { label: 'xx【2025】02号', value: 'xx【2025】02号' }
      ]
    },
    addMaterial() {
      this.form.materials.push({
        materialCode: '',
        approveCount: 1,
        approveWeight: 0
      })
    },
    removeMaterial(index) {
      this.form.materials.splice(index, 1)
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$message.success('保存成功')
          this.$emit('success')
          this.visible = false
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
