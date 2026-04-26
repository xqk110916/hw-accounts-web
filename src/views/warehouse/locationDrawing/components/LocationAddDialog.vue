<template>
  <el-dialog :close-on-click-modal="false"
    :title="dialogTitle"
    :visible.sync="visible"
    width="650px"
    @close="handleClose"
    :append-to-body="true"
  >
    <el-form :model="form" :rules="formRules" ref="form" label-width="100px" size="small">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="平衡区" prop="balanceArea">
            <el-select
              v-model="form.balanceArea"
              placeholder="请选择平衡区"
              style="width: 100%"
              :disabled="isParentFixed || isReadonly"
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
            <el-input v-model="form.warehouseCode" placeholder="请输入库房编号" :disabled="isReadonly"></el-input>
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
          <el-form-item label="物料类型" prop="materialType">
            <el-select v-model="form.materialType" placeholder="请选择物料类型" style="width: 100%" :disabled="isReadonly">
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
            <el-radio-group v-model="form.warehouseType" size="small" :disabled="isReadonly">
              <el-radio-button label="0">新库</el-radio-button>
              <el-radio-button label="2">老库</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 新库特定配置 -->
      <template v-if="form.warehouseType === '0'">
        <el-divider content-position="left">货架配置</el-divider>
        <div class="config-section shelf-config">
          <div class="header-actions">
            <span>货架列表</span>
            <el-button v-if="!isReadonly" type="primary" size="mini" icon="el-icon-plus" plain @click="addColumn">添加列</el-button>
          </div>
          <el-table :data="form.columns" border style="width: 100%" size="mini">
            <el-table-column label="列" width="80" align="center">
              <template slot-scope="scope">
                <span>第 {{ scope.$index + 1 }} 列</span>
              </template>
            </el-table-column>
            <el-table-column label="类型" prop="type" min-width="150">
              <template slot-scope="scope">
                <el-select v-model="scope.row.type" placeholder="请选择类型" size="mini" style="width: 100%" :disabled="isReadonly">
                  <el-option
                    v-for="item in shelfTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="排" width="80" align="center">
              <template slot-scope="scope">
                <span>{{ getShelfInfo(scope.row.type, 'row') }}</span>
              </template>
            </el-table-column>
            <el-table-column label="层" width="80" align="center">
              <template slot-scope="scope">
                <span>{{ getShelfInfo(scope.row.type, 'level') }}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="!isReadonly" label="操作" width="60" align="center">
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
      </template>

      <!-- 老库特定配置 -->
      <template v-else>
        <el-divider content-position="left">规格配置</el-divider>
        <div class="config-section old-config">
          <div class="old-config-manual">
            <div class="config-item">
              <span class="label">自定义列数</span>
              <el-input-number v-model="form.columnCount" :min="1" size="small" :disabled="isReadonly"></el-input-number>
            </div>
            <div class="config-split">×</div>
            <div class="config-item">
              <span class="label">自定义排数</span>
              <el-input-number v-model="form.rowCount" :min="1" size="small" :disabled="isReadonly"></el-input-number>
            </div>
          </div>
          <div class="old-config-tip">注：老库环境下将根据上述规格自动生成相应数量的库位单元。</div>
        </div>
      </template>

      
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false" size="small">取 消</el-button>
      <el-button v-if="!isReadonly" type="primary" @click="handleSubmit" size="small">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getBalanceAreaPageList } from '@/api/warehouse/balanceArea';
import { getDictionaryList } from '@/api/common/dictionary';
import { normalizeShelfTypeOptions } from '../../warehouse/utils/locationLayoutStorage';

const DICT_PARENT_IDS = {
  materialType: '2046471902119919617',
  shelfType: '2046473482554638338'
};

export default {
  name: 'LocationAddDialog',
  data() {
    return {
      visible: false,
      isEdit: false,
      mode: 'add',
      isParentFixed: false,
      form: {
        balanceArea: '',
        warehouseName: '',
        warehouseCode: '',
        warehouseType: '0',
        materialType: '',
        remark: '',
        // 新库配置
        columns: [],
        rawNode: null,
        // 老库配置
        columnCount: 1,
        rowCount: 1
      },
      rules: {
        balanceArea: [{ required: true, message: '请选择平衡区', trigger: 'change' }],
        warehouseName: [{ required: true, message: '请输入库房名称', trigger: 'blur' }],
        warehouseCode: [{ required: true, message: '请输入库房编号', trigger: 'blur' }],
        warehouseType: [{ required: true, message: '请选择库房类型', trigger: 'change' }],
        materialType: [{ required: true, message: '请选择物料类型', trigger: 'change' }]
      },
      balanceAreaOptions: [],
      materialTypeOptions: [],
      shelfTypeOptions: []
    };
  },
  created() {
    this.fetchBalanceAreas();
    this.fetchDictOptions(DICT_PARENT_IDS.materialType, 'materialTypeOptions');
    this.fetchDictOptions(DICT_PARENT_IDS.shelfType, 'shelfTypeOptions');
  },
  computed: {
    isReadonly() {
      return this.mode === 'view';
    },
    dialogTitle() {
      if (this.mode === 'view') return '查看库位图纸';
      if (this.mode === 'edit') return '编辑库位图纸';
      return '添加库位图纸';
    },
    formRules() {
      if (this.mode === 'edit') {
        return {
          balanceArea: this.rules.balanceArea,
          warehouseName: this.rules.warehouseName,
          warehouseCode: this.rules.warehouseCode,
          warehouseType: this.rules.warehouseType
        };
      }
      return this.rules;
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
    async fetchDictOptions(parentId, optionsKey) {
      try {
        const res = await getDictionaryList({ parentId, currentPage: 1, pageSize: 999 });
        const children = res.data?.list || [];
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
        this.form = { ...this.form, ...data };
      } else if (options.prefill) {
        this.resetForm();
        this.form = { ...this.form, ...options.prefill };
      } else {
        this.resetForm();
      }
      this.visible = true;
    },
    resetForm() {
      this.form = {
        balanceArea: '',
        warehouseName: '',
        warehouseCode: '',
        warehouseType: '0',
        materialType: '',
        remark: '',
        columns: Array.from({ length: 6 }, () => ({ type: '5-3-2-10' })),
        rawNode: null,
        columnCount: 1,
        rowCount: 1
      };
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate();
        }
      });
    },
    addColumn() {
      this.form.columns.push({ type: '5-3-2-10' });
    },
    removeColumn(index) {
      if (this.form.columns.length > 1) {
        this.form.columns.splice(index, 1);
      } else {
        this.$message.warning('至少需要保留一列');
      }
    },
    handleClose() {
      this.resetForm();
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const result = JSON.parse(JSON.stringify(this.form));
          result.mode = this.mode;
          // 处理新库的每列详细数据
          if (this.form.warehouseType === '0') {
            result.columns = result.columns.map(col => ({
              ...col,
              rows: this.getShelfInfo(col.type, 'row'),
              levels: this.getShelfInfo(col.type, 'level')
            }));
          }
          this.$emit('submit', result);
          this.visible = false;
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    getShelfInfo(typeValue, key) {
      if (!typeValue) return '-';
      const option = this.shelfTypeOptions.find(item => item.value === typeValue || item.bizCode === typeValue);
      const parts = String((option && option.bizCode) || typeValue).split('-'); // 5-3-2-10
      if (key === 'row') return parts[0] ? `${parts[0]}排` : '-';
      if (key === 'level') return parts[1] ? `${parts[1]}层` : '-';
      return '-';
    },
    handleChange(value) {
      console.log(value, this.balanceAreaOptions)
    },
  }
};
</script>

<style lang="scss" scoped>
.config-section {
  margin-top: 10px;
  &.shelf-config {
    padding-left: 30px;
  }
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 5px 10px;
    font-size: 14px;
    font-weight: bold;
    color: #606266;
  }
}
.old-config {
  background: #f8f9fb;
  padding: 20px;
  border-radius: 4px;
  .old-config-manual {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    .config-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      .label {
        font-size: 12px;
        color: #909399;
      }
    }
    .config-split {
      font-size: 20px;
      color: #dcdfe6;
      padding-top: 20px;
    }
  }
  .old-config-tip {
    margin-top: 15px;
    text-align: center;
    font-size: 12px;
    color: #c0c4cc;
  }
}
.el-divider--horizontal {
  margin: 24px 0 15px 0;
}
</style>
