<template>
  <div class="inventory-container" v-if="tabList.length > 0">
    <el-tabs :value="activeTab" @input="$emit('update:activeTab', $event)" type="border-card">
      <el-tab-pane v-for="tab in tabList" :key="tab.id" :label="tab.name" :name="tab.id">
        <div class="inventory-header">
          <span class="inventory-title">({{ tab.name }}) 实物盘存清单</span>
        </div>

        <!-- 优化后的表单布局 -->
        <div class="inventory-form" v-if="inventoryFormMap[tab.id]">
          <!-- 第1行：盘存时间 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="form-item">
                <span class="label required">盘存时间</span>
                <el-date-picker v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].inventoryTime" @input="updateForm(tab.id, 'inventoryTime', $event)" type="datetime" size="small" placeholder="选择时间" value-format="yyyy-MM-dd HH:mm:ss" />
                <span class="text-value" v-else>{{ inventoryFormMap[tab.id].inventoryTime || '-' }}</span>
              </div>
            </el-col>
          </el-row>
          <!-- 第2行：盘存人、封记检查人 -->
          <el-row :gutter="20" class="mt-15">
            <el-col :span="12">
              <div class="form-item">
                <span class="label required">盘存人</span>
                <el-input v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].inventoryUser" @input="updateForm(tab.id, 'inventoryUser', $event)" size="small" placeholder="请输入" />
                <span class="text-value" v-else>{{ inventoryFormMap[tab.id].inventoryUser || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="form-item">
                <span class="label required">封记检查人</span>
                <el-input v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].sealChecker" @input="updateForm(tab.id, 'sealChecker', $event)" size="small" placeholder="请输入" />
                <span class="text-value" v-else>{{ inventoryFormMap[tab.id].sealChecker || '-' }}</span>
              </div>
            </el-col>
          </el-row>
          <!-- 第3行：负责人、监盘人 -->
          <el-row :gutter="20" class="mt-15">
            <el-col :span="12">
              <div class="form-item">
                <span class="label required">负责人</span>
                <el-input v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].responsibleUser" @input="updateForm(tab.id, 'responsibleUser', $event)" size="small" placeholder="请输入" />
                <span class="text-value" v-else>{{ inventoryFormMap[tab.id].responsibleUser || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="form-item">
                <span class="label">监盘人</span>
                <el-input v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].supervisor" @input="updateForm(tab.id, 'supervisor', $event)" size="small" placeholder="请输入" />
                <span class="text-value" v-else>{{ inventoryFormMap[tab.id].supervisor || '-' }}</span>
              </div>
            </el-col>
          </el-row>

          <!-- 盘存结果 -->
          <div class="result-section mt-15">
            <div class="result-title">盘存结果</div>
            <div class="result-content-col">
              <!-- checkbox行 -->
              <div class="status-checks">
                <el-radio-group
                  v-if="type === 'inputResult'"
                  :value="inventoryFormMap[tab.id].inventoryResult"
                  size="small"
                  @input="handleInventoryResultChange(tab.id, $event)"
                >
                  <el-radio label="all_normal">全部正常</el-radio>
                  <el-radio label="partial_abnormal">部分异常</el-radio>
                </el-radio-group>
                <span class="text-value" v-if="isReadonlyResultMode">{{ getInventoryResultText(inventoryFormMap[tab.id].inventoryResult) }}</span>
              </div>
              <div v-if="type === 'inputResult' && inventoryFormMap[tab.id].inventoryResult === 'partial_abnormal'" class="abnormal-select mt-15">
                <span class="stat-label">盘盈容器</span>
                <el-select
                  :value="inventoryFormMap[tab.id].excessContainerCodes || []"
                  multiple
                  filterable
                  collapse-tags
                  size="small"
                  placeholder="请选择盘盈容器"
                  class="abnormal-select-input"
                  @input="handleAbnormalContainerChange(tab.id, 'excess', $event)"
                >
                  <el-option
                    v-for="item in goodsListMap[tab.id] || []"
                    :key="getGoodsKey(item)"
                    :label="item.containerCode || '-'"
                    :value="getGoodsKey(item)"
                    :disabled="isOppositeContainerSelected(tab.id, 'excess', item)"
                  />
                </el-select>
              </div>
              <div v-if="type === 'inputResult' && inventoryFormMap[tab.id].inventoryResult === 'partial_abnormal'" class="abnormal-select mt-15">
                <span class="stat-label">盘亏容器</span>
                <el-select
                  :value="inventoryFormMap[tab.id].deficitContainerCodes || []"
                  multiple
                  filterable
                  collapse-tags
                  size="small"
                  placeholder="请选择盘亏容器"
                  class="abnormal-select-input"
                  @input="handleAbnormalContainerChange(tab.id, 'deficit', $event)"
                >
                  <el-option
                    v-for="item in goodsListMap[tab.id] || []"
                    :key="getGoodsKey(item)"
                    :label="item.containerCode || '-'"
                    :value="getGoodsKey(item)"
                    :disabled="isOppositeContainerSelected(tab.id, 'deficit', item)"
                  />
                </el-select>
              </div>
              <!-- 输入框行 -->
              <div class="stats-inputs mt-15">
                <el-row :gutter="20">
                  <!-- 正常数 -->
                  <el-col :span="24" class="stat-col">
                    <div class="stat-item-row">
                      <span class="stat-label">正常数</span>
                      <el-input-number v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].normalCount" @change="updateForm(tab.id, 'normalCount', $event)" size="small" :min="0" class="num-input" />
                      <span class="text-value" v-else>{{ inventoryFormMap[tab.id].normalCount }}</span>
                    </div>
                  </el-col>
                  <!-- 盘盈数 + 备注 -->
                  <el-col :span="24" class="stat-col mt-15">
                    <div class="stat-item-row">
                      <span class="stat-label">盘盈数</span>
                      <el-input-number v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].excessCount" @change="updateForm(tab.id, 'excessCount', $event)" size="small" :min="0" class="num-input" />
                      <span class="text-value" v-else>{{ inventoryFormMap[tab.id].excessCount }}</span>
                      <span class="stat-label ml-15">备注</span>
                      <el-input v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].excessRemark" @input="updateForm(tab.id, 'excessRemark', $event)" size="small" placeholder="盘盈备注" class="remark-input flex-1" />
                      <span class="text-value flex-1" v-else>{{ inventoryFormMap[tab.id].excessRemark || '-' }}</span>
                    </div>
                  </el-col>
                  <!-- 盘亏数 + 备注 -->
                  <el-col :span="24" class="stat-col mt-15">
                    <div class="stat-item-row">
                      <span class="stat-label">盘亏数</span>
                      <el-input-number v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].deficitCount" @change="updateForm(tab.id, 'deficitCount', $event)" size="small" :min="0" class="num-input" />
                      <span class="text-value" v-else>{{ inventoryFormMap[tab.id].deficitCount }}</span>
                      <span class="stat-label ml-15">备注</span>
                      <el-input v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].deficitRemark" @input="updateForm(tab.id, 'deficitRemark', $event)" size="small" placeholder="盘亏备注" class="remark-input flex-1" />
                      <span class="text-value flex-1" v-else>{{ inventoryFormMap[tab.id].deficitRemark || '-' }}</span>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
        </div>

        <!-- 明细列表 -->
        <div class="detail-section-wrap mt-15">
          <div class="detail-section-title">明细</div>
          <el-table :data="goodsListMap[tab.id] || []" border size="small" max-height="400">
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="warehouseName" label="位置" width="120" show-overflow-tooltip />
            <el-table-column prop="containerCode" label="容器号" min-width="120" show-overflow-tooltip />
            <el-table-column prop="storageTime" label="入库时间" min-width="120" show-overflow-tooltip />
            <el-table-column prop="productionUnit" label="生产单位" width="100" show-overflow-tooltip />
            <el-table-column prop="sealCode1" label="封记编号1" width="100" show-overflow-tooltip />
            <el-table-column prop="sealCode2" label="封记编号2" width="100" show-overflow-tooltip />
            <el-table-column label="结果" width="220" v-if="type === 'inputResult'">
              <template slot-scope="scope">
                <div class="result-cell">
                  <el-radio-group v-model="scope.row.result" size="mini" @change="handleGoodsResultChange(tab.id)">
                    <el-radio label="0">正常</el-radio>
                    <el-radio label="1">盘亏</el-radio>
                    <el-radio label="2">盘盈</el-radio>
                  </el-radio-group>
                  <el-input v-model="scope.row.resultRemark" size="mini" placeholder="备注" class="cell-remark mt-5" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="结果" width="220" v-if="isReadonlyResultMode">
              <template slot-scope="scope">
                <span :class="getResultClass(scope.row.result)">{{ getResultText(scope.row.result) }}</span>
                <span v-if="scope.row.resultRemark" class="ml-10">({{ scope.row.resultRemark }})</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'InventoryContainer',
  props: {
    type: {
      type: String,
      default: 'add',
    },
    tabList: {
      type: Array,
      default: () => [],
    },
    activeTab: {
      type: String,
      default: '',
    },
    inventoryFormMap: {
      type: Object,
      default: () => ({}),
    },
    goodsListMap: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    isReadonlyResultMode() {
      return this.type === 'view' || this.type === 'audit'
    },
  },
  methods: {
    updateForm(warehouseId, field, value) {
      this.$emit('update:inventoryFormMap', {
        warehouseId,
        field,
        value,
      })
    },
    handleInventoryResultChange(warehouseId, value) {
      this.$emit('inventory-result-change', {
        warehouseId,
        value,
      })
    },
    handleAbnormalContainerChange(warehouseId, resultType, value) {
      this.$emit('abnormal-container-change', {
        warehouseId,
        resultType,
        value,
      })
    },
    handleGoodsResultChange(warehouseId) {
      this.$emit('goods-result-change', {
        warehouseId,
      })
    },
    getGoodsKey(item) {
      return String(item.id || item.containerCode || '')
    },
    isOppositeContainerSelected(warehouseId, resultType, item) {
      const form = this.inventoryFormMap[warehouseId] || {}
      const oppositeField = resultType === 'excess' ? 'deficitContainerCodes' : 'excessContainerCodes'
      return (form[oppositeField] || []).map(value => String(value)).includes(this.getGoodsKey(item))
    },
    getInventoryResultText(result) {
      const map = { all_normal: '全部正常', partial_abnormal: '部分异常', '1': '全部正常', '2': '部分异常' }
      return map[result] || '-'
    },
    getResultText(result) {
      const map = { '0': '正常', '1': '盘亏', '2': '盘盈', '-1': '--' }
      return map[result] || result || '-'
    },
    getResultClass(result) {
      const map = { '0': 'result-normal', '1': 'result-deficit', '2': 'result-excess' }
      return map[result] || ''
    },
  },
}
</script>

<style lang="scss" scoped>
.inventory-container {
  padding: 0 20px 20px;

  // 可滚动的 tab 样式
  ::v-deep .el-tabs {
    .el-tabs__header {
      margin-bottom: 0;
    }
    .el-tabs__nav-wrap {
      overflow-x: auto;
      overflow-y: hidden;
      &::-webkit-scrollbar {
        height: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #c0c4cc;
        border-radius: 3px;
      }
      &::-webkit-scrollbar-track {
        background-color: #f5f7fa;
      }
    }
    .el-tabs__nav-scroll {
      display: inline-block;
      white-space: nowrap;
    }
    .el-tabs__item {
      display: inline-block;
      float: none;
    }
  }
  .inventory-header {
    text-align: center;
    margin-bottom: 15px;
    padding: 10px 0;
    background-color: #f5f7fa;
    border-radius: 4px;
    .inventory-title {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
    }
  }

  .inventory-form {
    padding: 15px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    margin-bottom: 15px;

    .form-item {
      display: flex;
      align-items: center;
      .label {
        width: 80px;
        color: #606266;
        font-size: 14px;
        flex-shrink: 0;
        &.required::before {
          content: '*';
          color: #f56c6c;
          margin-right: 4px;
        }
      }
      .text-value {
        color: #303133;
        font-size: 14px;
      }
      ::v-deep .el-date-editor {
        width: 100%;
      }
    }

    .result-section {
      border-top: 1px dashed #ebeef5;
      padding-top: 15px;

      .result-title {
        font-weight: bold;
        color: #606266;
        margin-bottom: 10px;
      }

      .result-content-col {
        display: flex;
        flex-direction: column;
      }
    }
  }

  .stat-col {
    display: flex;
    align-items: center;
  }
  .stat-item-row {
    display: flex;
    align-items: center;
    width: 100%;
    .stat-label {
      width: 60px;
      color: #606266;
      font-size: 14px;
      flex-shrink: 0;
    }
    .flex-1 {
      flex: 1;
    }
  }

  .abnormal-select {
    display: flex;
    align-items: center;
    .stat-label {
      width: 60px;
      color: #606266;
      font-size: 14px;
      flex-shrink: 0;
    }
    .abnormal-select-input {
      flex: 1;
    }
  }

  .detail-section-wrap {
    .detail-section-title {
      font-weight: bold;
      color: #303133;
      margin-bottom: 10px;
      padding-left: 10px;
      border-left: 3px solid #409eff;
    }
  }
}

.mt-15 {
  margin-top: 15px;
}
.mt-5 {
  margin-top: 5px;
}
.ml-15 {
  margin-left: 15px;
}

.result-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  .cell-remark {
    margin-top: 4px;
  }
}

.ml-10 {
  margin-left: 10px;
}

.result-normal { color: #2e7d32; }
.result-deficit { color: #c62828; }
.result-excess { color: #e68600; }
</style>
