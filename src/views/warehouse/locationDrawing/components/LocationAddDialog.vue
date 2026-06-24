<template>
  <div class="add-form-panel">
    <div class="panel-header">
      <span class="panel-title">
        <i :class="mode === 'view' ? 'el-icon-document' : 'el-icon-edit-outline'" class="header-icon"></i>
        {{ dialogTitle }}
      </span>
      <div class="panel-header-actions" v-if="mode === 'view'">
        <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit">编辑库房</el-button>
      </div>
    </div>

    <div class="panel-body">
      <el-form :model="form" :rules="formRules" ref="form" label-width="100px" size="small">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="平衡区" prop="balanceArea">
              <el-select
                v-model="form.balanceArea"
                placeholder="请选择平衡区"
                style="width: 100%"
                :disabled="isParentFixed || isReadonly || isEdit"
                @change="handleChange"
              >
                <el-option
                  v-for="item in balanceAreaOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库房编号" prop="warehouseCode">
              <el-input v-model="form.warehouseCode" placeholder="请输入库房编号" :disabled="isReadonly || isEdit"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库房名称" prop="warehouseName">
              <el-input v-model="form.warehouseName" placeholder="请输入库房名称" :disabled="isReadonly"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="材料名称" prop="materialType">
              <el-select v-model="form.materialType" placeholder="请选择材料名称" style="width: 100%" :disabled="isReadonly || isEdit" multiple collapse-tags>
                <el-option
                  v-for="item in materialTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                type="textarea"
                v-model="form.remark"
                placeholder="请输入备注"
                :rows="3"
                :disabled="isReadonly"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="库房类型" prop="warehouseType">
              <el-radio-group v-model="form.warehouseType" size="small" :disabled="isReadonly || isEdit">
                <el-radio-button label="0">新库</el-radio-button>
                <el-radio-button label="2">老库</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 货架配置（新库/老库通用） -->
        <el-divider content-position="left">
          <span class="divider-text"><i class="el-icon-setting"></i> 货架配置</span>
        </el-divider>
        <div class="config-section shelf-config">
          <div class="header-actions">
            <span class="section-title">货架列表</span>
            <el-button v-if="!isReadonly && !isEdit" type="primary" size="mini" icon="el-icon-plus" plain @click="addColumn">添加列</el-button>
          </div>
          <el-table :data="form.columns" border style="width: 100%" size="mini" class="shelf-table">
            <el-table-column label="列" width="100" align="center">
              <template slot-scope="scope">
                <span class="column-code">{{ scope.row.code || `第 ${scope.$index + 1} 列` }}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="form.warehouseType === '2'" label="区域编号" width="120" align="center">
              <template slot-scope="scope">
                <el-select
                  v-model="scope.row.areaCode"
                  filterable
                  allow-create
                  default-first-option
                  size="mini"
                  placeholder="请选择或输入"
                  :disabled="isReadonly || isEdit"
                  style="width: 100%"
                  @change="triggerColumnsValidate"
                >
                  <el-option
                    v-for="item in areaOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="类型" prop="type" min-width="150">
              <template slot-scope="scope">
                <el-select v-model="scope.row.type" placeholder="请选择类型" size="mini" style="width: 100%" :disabled="isReadonly || isEdit" @change="triggerColumnsValidate">
                  <el-option
                    v-for="item in currentShelfTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="排" width="90" align="center">
              <template slot-scope="scope">
                <span class="badge-info">{{ getShelfInfo(scope.row.type, 'row') }}</span>
              </template>
            </el-table-column>
            <el-table-column label="层" width="90" align="center">
              <template slot-scope="scope">
                <span class="badge-info">{{ getShelfInfo(scope.row.type, 'level') }}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="!isReadonly && !isEdit" label="操作" width="80" align="center">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  icon="el-icon-delete"
                  style="color: #f56c6c"
                  @click="removeColumn(scope.$index)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form>
    </div>

    <div class="panel-footer">
      <el-button @click="handleCancel" size="small">{{ isReadonly ? '关闭面板' : '取 消' }}</el-button>
      <el-button v-if="!isReadonly" type="primary" @click="handleSubmit" size="small">确 定</el-button>
    </div>
  </div>
</template>

<script>
import { getBalanceAreaPageList } from '@/api/warehouse/balanceArea';
import { getDictionaryList } from '@/api/common/dictionary';
import { listAllMaterialCode } from '@/views/dataManagement/materialManagement/components/api.js';
import { normalizeShelfTypeOptions } from '../../warehouse/utils/locationLayoutStorage';

const DICT_PARENT_IDS = {
  shelfType: '2046473482554638338',
  oldShelfType: '2051955496598659073'
};

export default {
  name: 'LocationAddDialog',
  data() {
    return {
      isEdit: false,
      mode: 'add',
      isParentFixed: false,
      form: {
        balanceArea: '',
        warehouseName: '',
        warehouseCode: '',
        warehouseType: '0',
        materialType: [],
        remark: '',
        columns: [],
        rawNode: null
      },
      rules: {
        balanceArea: [{ required: true, message: '请选择平衡区', trigger: 'change' }],
        warehouseName: [{ required: true, message: '请输入库房名称', trigger: 'blur' }],
        warehouseCode: [{ required: true, message: '请输入库房编号', trigger: 'blur' }],
        warehouseType: [{ required: true, message: '请选择库房类型', trigger: 'change' }],
        materialType: [{ required: true, message: '请选择材料名称', trigger: 'change' }],
        // 货架列表中的类型、区域编号等信息必填校验通过自定义validator在formRules中附加
        columns: []
      },
      balanceAreaOptions: [],
      materialTypeOptions: [],
      shelfTypeOptions: [],
      oldShelfTypeOptions: [],
      originalDataBackup: null,
      areaOptions: ['A', 'B', 'C', 'D', 'E', 'F']
    };
  },
  created() {
    this.fetchBalanceAreas();
    this.fetchMaterialTypes();
    this.fetchDictOptions(DICT_PARENT_IDS.shelfType, 'shelfTypeOptions');
    this.fetchDictOptions(DICT_PARENT_IDS.oldShelfType, 'oldShelfTypeOptions');
  },
  computed: {
    isReadonly() {
      return this.mode === 'view';
    },
    dialogTitle() {
      if (this.mode === 'view') return '查看库房详情';
      if (this.mode === 'edit') return '编辑库房详情';
      return '添加库位图纸';
    },
    formRules() {
      const baseRules = this.mode === 'edit'
        ? {
            balanceArea: this.rules.balanceArea,
            warehouseName: this.rules.warehouseName,
            warehouseCode: this.rules.warehouseCode,
            warehouseType: this.rules.warehouseType
          }
        : { ...this.rules };

      // 始终附加货架列表必填校验（类型 + 老库时区域编号）
      // 使用箭头函数包裹以保留 this 上下文（Element UI 调用 validator 时会丢失 method this）
      baseRules.columns = [{
        validator: (rule, value, callback) => this.validateColumns(rule, value, callback),
        trigger: 'change'
      }];
      return baseRules;
    },
    currentShelfTypeOptions() {
      return this.form.warehouseType === '2' ? this.oldShelfTypeOptions : this.shelfTypeOptions;
    }
  },
  watch: {
    'form.warehouseType'(val) {
      // 库房类型切换时不再自动修改已有列的类型
      // 但需重新校验货架列表（老库需要 areaCode）
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.validateField('columns');
        }
      });
    }
  },
  methods: {
    async fetchBalanceAreas() {
      try {
        const res = await getBalanceAreaPageList({ currentPage: 1, pageSize: 100 });
        if (res && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.list || []);
          this.balanceAreaOptions = list.map(item => ({
            label: item.name,
            value: item.id
          }));
        }
      } catch (e) {
        console.error('Failed to fetch balance areas', e);
      }
    },
    async fetchMaterialTypes() {
      try {
        const res = await listAllMaterialCode();
        if (res && res.data) {
          const list = Array.isArray(res.data) ? res.data : [];
          this.materialTypeOptions = list.map(item => ({
            label: item.goodName || item.goodCode,
            value: item.goodCode
          }));
        }
      } catch (e) {
        console.error('Failed to fetch material types', e);
      }
    },
    async fetchDictOptions(parentId, optionsKey) {
      try {
        const res = await getDictionaryList({ parentId, currentPage: 1, pageSize: 999 });
        const children = (res.data && res.data.list) || [];
        this[optionsKey] = normalizeShelfTypeOptions(children).map(d => ({
          label: d.label,
          value: d.value,
          bizCode: d.bizCode
        }));
      } catch (e) {
        console.error('Failed to fetch dict: ' + parentId, e);
      }
    },
    open(data = null, options = {}) {
      this.mode = options.mode || (data ? 'edit' : 'add');
      this.isEdit = this.mode === 'edit';
      this.isParentFixed = !!options.isParentFixed;

      if (data) {
        this.resetForm();
        // materialType 后端返回逗号分隔字符串，多选需要转为数组
        if (data.materialType && typeof data.materialType === 'string') {
          data.materialType = data.materialType.split(',').filter(Boolean);
        }
        this.form = { ...this.form, ...data };
        this.originalDataBackup = JSON.parse(JSON.stringify(this.form));
      } else if (options.prefill) {
        this.resetForm();
        this.form = { ...this.form, ...options.prefill };
        this.initDefaultColumns();
        this.originalDataBackup = null;
      } else {
        this.resetForm();
        this.initDefaultColumns();
        this.originalDataBackup = null;
      }
    },
    resetForm() {
      this.form = {
        balanceArea: '',
        warehouseName: '',
        warehouseCode: '',
        warehouseType: this.form.warehouseType || '0',
        materialType: [],
        remark: '',
        columns: [],
        rawNode: null
      };
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate();
        }
      });
    },
    setViewMode() {
      this.mode = 'view';
      this.isEdit = false;
    },
    handleEdit() {
      this.mode = 'edit';
      this.isEdit = true;
      this.originalDataBackup = JSON.parse(JSON.stringify(this.form));
    },
    initDefaultColumns() {
      const len = this.form.columns.length || 6;
      this.form.columns = Array.from({ length: len }, (_, i) => {
        const col = { code: `S${i + 1}`, type: '' };
        if (this.form.warehouseType === '2') col.areaCode = 'A';
        return col;
      });
      // 初始化时不立即 validateField，避免无谓错误状态；提交时和用户操作时校验
    },
    addColumn() {
      const col = { code: `S${this.form.columns.length + 1}`, type: '' };
      if (this.form.warehouseType === '2') col.areaCode = 'A';
      this.form.columns.push(col);
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.validateField('columns');
      });
    },
    removeColumn(index) {
      if (this.form.columns.length > 1) {
        this.form.columns.splice(index, 1);
        this.$nextTick(() => {
          if (this.$refs.form) this.$refs.form.validateField('columns');
        });
      } else {
        this.$message.warning('至少需要保留一列');
      }
    },
    handleCancel() {
      if (this.mode === 'add') {
        this.$emit('cancel');
      } else if (this.mode === 'edit') {
        if (this.originalDataBackup) {
          this.form = JSON.parse(JSON.stringify(this.originalDataBackup));
        }
        this.setViewMode();
        this.$nextTick(() => {
          if (this.$refs.form) {
            this.$refs.form.clearValidate();
          }
        });
      } else {
        this.$emit('cancel');
      }
    },
    handleSubmit() {
      // 先执行货架列表必填显式校验（保证无论 form rule 是否触发都生效）
      if (!this.validateColumnsBeforeSubmit()) {
        return;
      }

      this.$refs.form.validate((valid, invalidFields) => {
        if (valid) {
          const result = JSON.parse(JSON.stringify(this.form));
          result.mode = this.mode;
          // 处理每列详细数据（新库/老库通用）
          result.columns = result.columns.map(col => ({
            ...col,
            rows: this.getShelfInfo(col.type, 'row'),
            levels: this.getShelfInfo(col.type, 'level')
          }));
          this.$emit('submit', result);
        } else {
          console.log('error submit!!');
          if (invalidFields && invalidFields.columns && invalidFields.columns.length) {
            this.$message.error(invalidFields.columns[0].message);
          }
          return false;
        }
      });
    },
    getShelfInfo(typeValue, key) {
      if (!typeValue) return '-';
      const option = this.currentShelfTypeOptions.find(item => item.value === typeValue || item.bizCode === typeValue);
      const parts = String((option && option.bizCode) || typeValue).split('-'); // 5-3-2-10
      if (key === 'row') return parts[0] ? `${parts[0]}排` : '-';
      if (key === 'level') return parts[1] ? `${parts[1]}层` : '-';
      return '-';
    },
    handleChange(value) {
      console.log(value, this.balanceAreaOptions)
    },
    // 货架列表信息必填校验（位置图管理 - 添加库位）
    validateColumns(rule, value, callback) {
      // 编辑/只读模式下跳过货架列表必填（字段已禁用）
      if (this.isEdit || this.isReadonly) {
        return callback();
      }
      const columns = Array.isArray(value) ? value : (this.form.columns || []);
      if (!columns || columns.length === 0) {
        return callback(new Error('货架列表至少需要保留一列'));
      }
      const isOld = this.form.warehouseType === '2';
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i] || {};
        if (!col.type) {
          return callback(new Error(`第 ${i + 1} 列的“类型”不能为空`));
        }
        if (isOld && !col.areaCode) {
          return callback(new Error(`第 ${i + 1} 列的“区域编号”不能为空`));
        }
      }
      callback();
    },
    // 提交前同步必填校验（确保即使 form rule 未触发也生效）
    validateColumnsBeforeSubmit() {
      // 编辑模式下货架列表字段禁用，不再强制新校验（避免历史数据阻断）
      if (this.isEdit || this.isReadonly) {
        return true;
      }
      const columns = this.form.columns || [];
      if (!columns.length) {
        this.$message.error('货架列表至少需要保留一列');
        return false;
      }
      const isOld = this.form.warehouseType === '2';
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i] || {};
        if (!col.type) {
          this.$message.error(`第 ${i + 1} 列的“类型”不能为空`);
          return false;
        }
        if (isOld && !col.areaCode) {
          this.$message.error(`第 ${i + 1} 列的“区域编号”不能为空`);
          return false;
        }
      }
      return true;
    },
    triggerColumnsValidate() {
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.validateField('columns');
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.add-form-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #ffffff;

  .panel-header {
    padding: 16px 24px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fafbfe;

    .panel-title {
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
      display: flex;
      align-items: center;

      .header-icon {
        margin-right: 8px;
        color: #409eff;
        font-size: 18px;
      }
    }
  }

  .panel-body {
    flex: 1;
    padding: 24px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: #e4e7ed;
      border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: #c0c4cc;
    }
  }

  .panel-footer {
    padding: 12px 24px;
    border-top: 1px solid #ebeef5;
    text-align: right;
    background-color: #fafbfe;
  }
}

.config-section {
  margin-top: 15px;
  &.shelf-config {
    padding-left: 10px;
  }
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 5px 12px;

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #606266;
    }
  }
}

.divider-text {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 6px;
}

.shelf-table {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  overflow: hidden;

  ::v-deep th {
    background-color: #f5f7fa !important;
    color: #515a6e;
    font-weight: 600;
  }

  .column-code {
    font-weight: 600;
    color: #409eff;
  }

  .badge-info {
    display: inline-block;
    padding: 2px 8px;
    background-color: #ecf5ff;
    color: #409eff;
    border-radius: 12px;
    font-size: 12px;
  }
}

.el-divider--horizontal {
  margin: 24px 0 15px 0;
}
</style>
