<template>
  <div class="inventory-container" v-if="tabList.length > 0">
    <el-tabs :value="activeTab" @input="$emit('update:activeTab', $event)" type="border-card">
      <el-tab-pane v-for="tab in tabList" :key="tab.id" :name="tab.id">
        <span slot="label" class="tab-label">
          {{ tab.name }}
          <el-tag v-if="showImportStatus" size="mini" :type="getImportTagType(tab.id)" class="tab-status-tag">{{ getImportTagText(tab.id) }}</el-tag>
        </span>
        <!-- Word风格表格表单 -->
        <div class="inventory-form-table" v-if="inventoryFormMap[tab.id]">
          <table class="word-table" cellpadding="0" cellspacing="0">
            <colgroup>
              <col style="width: 100px" />
              <col />
              <col style="width: 100px" />
              <col style="width: 165px" />
              <col style="width: 60px" />
              <col style="width: 185px" />
            </colgroup>
            <tbody>
              <!-- 标题行 -->
              <tr>
                <td colspan="6" class="title-cell">({{ tab.name }}) 实物盘存清单</td>
              </tr>
              <!-- 盘存时间 -->
              <tr>
                <td class="label-cell"><span class="required-star">*</span>盘存时间</td>
                <td colspan="5">
                  <el-date-picker v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].inventoryTime" @input="updateForm(tab.id, 'inventoryTime', $event)" type="datetime" size="small" placeholder="选择时间" value-format="yyyy-MM-dd HH:mm:ss" style="width: 100%" />
                  <span class="cell-value" v-else>{{ inventoryFormMap[tab.id].inventoryTime || '' }}</span>
                </td>
              </tr>
              <!-- 盘存人、封记检查人 -->
              <tr>
                <td class="label-cell"><span class="required-star">*</span>盘存人</td>
                <td>
                  <el-input v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].inventoryUser" @input="updateForm(tab.id, 'inventoryUser', $event)" size="small" placeholder="请输入" />
                  <span class="cell-value" v-else>{{ inventoryFormMap[tab.id].inventoryUser || '' }}</span>
                </td>
                <td class="label-cell"><span class="required-star">*</span>封记检查人</td>
                <td colspan="3">
                  <el-input v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].sealChecker" @input="updateForm(tab.id, 'sealChecker', $event)" size="small" placeholder="请输入" />
                  <span class="cell-value" v-else>{{ inventoryFormMap[tab.id].sealChecker || '' }}</span>
                </td>
              </tr>
              <!-- 负责人、监盘人 -->
              <tr>
                <td class="label-cell"><span class="required-star">*</span>负责人</td>
                <td>
                  <el-input v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].responsibleUser" @input="updateForm(tab.id, 'responsibleUser', $event)" size="small" placeholder="请输入" />
                  <span class="cell-value" v-else>{{ inventoryFormMap[tab.id].responsibleUser || '' }}</span>
                </td>
                <td class="label-cell">监盘人</td>
                <td colspan="3">
                  <el-input v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].supervisor" @input="updateForm(tab.id, 'supervisor', $event)" size="small" placeholder="请输入" />
                  <span class="cell-value" v-else>{{ inventoryFormMap[tab.id].supervisor || '' }}</span>
                </td>
              </tr>
              <tr>
                <td class="label-cell result-label" rowspan="2">盘存结果</td>
                <td rowspan="2">
                  <el-radio-group
                    v-if="type === 'inputResult'"
                    :value="inventoryFormMap[tab.id].inventoryResult"
                    size="small"
                    @input="handleInventoryResultChange(tab.id, $event)"
                  >
                    <el-radio label="all_normal">全部正常</el-radio>
                    <el-radio label="partial_abnormal">部分异常</el-radio>
                  </el-radio-group>
                  <span class="cell-value" v-if="isReadonlyResultMode">{{ getInventoryResultText(inventoryFormMap[tab.id].inventoryResult) }}</span>
                </td>
                <td class="label-cell">正常数量</td>
                <td>
                  <el-input-number v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].normalCount" @input="updateForm(tab.id, 'normalCount', $event)" size="small" :min="0" controls-position="right" style="width: 100%" />
                  <span class="cell-value" v-else>{{ inventoryFormMap[tab.id].normalCount }}</span>
                </td>
                <td class="label-cell">备注</td>
                <td>
                  <el-input v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].excessRemark" @input="updateForm(tab.id, 'excessRemark', $event)" size="small" placeholder="请输入" />
                  <span class="cell-value" v-else>{{ inventoryFormMap[tab.id].excessRemark || '' }}</span>
                </td>
              </tr>
              <tr>
                <td class="label-cell">不正常数量</td>
                <td>
                  <el-input-number v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].abnormalCount" @input="updateForm(tab.id, 'abnormalCount', $event)" size="small" :min="0" controls-position="right" style="width: 100%" />
                  <span class="cell-value" v-else>{{ inventoryFormMap[tab.id].abnormalCount }}</span>
                </td>
                <td class="label-cell">备注</td>
                <td>
                  <el-input v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].deficitRemark" @input="updateForm(tab.id, 'deficitRemark', $event)" size="small" placeholder="请输入" />
                  <span class="cell-value" v-else>{{ inventoryFormMap[tab.id].deficitRemark || '' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 明细列表 -->
        <div class="detail-section-wrap mt-15">
          <div class="detail-section-header">
            <div class="detail-section-title">明细</div>
            <!-- 批量设置状态按钮（仅录入结果模式显示） -->
            <div v-if="type === 'inputResult' && selectedGoodsMap[tab.id] && selectedGoodsMap[tab.id].length > 0" class="batch-actions">
              <span class="batch-info">已选 {{ selectedGoodsMap[tab.id].length }} 项</span>
              <el-button type="success" size="mini" @click="batchSetResult(tab.id, '0')">批量设为正常</el-button>
              <el-button type="danger" size="mini" @click="batchSetResult(tab.id, '1')">批量设为不正常</el-button>
            </div>
          </div>
            <el-table
            ref="goodsTable"
            :data="goodsListMap[tab.id] || []"
            border
            size="small"
            max-height="400"
            :row-class-name="getGoodsRowClassName"
            @selection-change="(selection) => handleSelectionChange(tab.id, selection)"
          >
            <el-table-column v-if="type === 'inputResult'" type="selection" width="45" fixed="left" />
            <el-table-column type="index" label="序号" width="60" fixed="left" />
            <el-table-column prop="location" label="位置" width="120" show-overflow-tooltip fixed="left" />
            <el-table-column prop="containerCode" label="容器号" min-width="120" show-overflow-tooltip fixed="left" />
            <el-table-column prop="storageTime" label="入库时间" min-width="120" show-overflow-tooltip />
            <el-table-column prop="productionUnit" label="生产单位" width="100" show-overflow-tooltip />
            <el-table-column prop="sealCode1" label="封记编号1" width="100" show-overflow-tooltip />
            <el-table-column prop="sealCode2" label="封记编号2" width="100" show-overflow-tooltip />
            <el-table-column label="结果" width="220" v-if="type === 'inputResult'" fixed="right">
              <template slot-scope="scope">
                <div class="result-cell">
                  <el-radio-group :value="scope.row.result" size="mini" @input="value => handleSingleResultInput(tab.id, scope.row, value)">
                    <el-radio label="0">正常</el-radio>
                    <el-radio label="1">不正常</el-radio>
                  </el-radio-group>
                  <el-input v-model="scope.row.resultRemark" size="mini" placeholder="备注" class="cell-remark mt-5" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="结果" width="220" v-if="isReadonlyResultMode" fixed="right">
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
  data() {
    return {
      selectedGoodsMap: {},
    }
  },
  computed: {
    isReadonlyResultMode() {
      return this.type === 'view' || this.type === 'audit'
    },
    // 仅录入结果/查看模式展示导入状态标签
    showImportStatus() {
      return this.type === 'inputResult' || this.type === 'view'
    },
  },
  methods: {
    isWarehouseImported(wId) {
      return this.inventoryFormMap[wId] && this.inventoryFormMap[wId].dataStatus === 1
    },
    getImportTagType(wId) {
      return this.isWarehouseImported(wId) ? 'success' : 'info'
    },
    getImportTagText(wId) {
      return this.isWarehouseImported(wId) ? '已导入' : '未导入'
    },
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
    handleAbnormalContainerChange(warehouseId, value) {
      this.$emit('abnormal-container-change', {
        warehouseId,
        value,
      })
    },
    handleGoodsResultChange(warehouseId) {
      this.$emit('goods-result-change', {
        warehouseId,
      })
    },
    escapeHtml(value) {
      return String(value === undefined || value === null || value === '' ? '-' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    },
    handleSingleResultInput(warehouseId, row, value) {
      if (String(row.result) === String(value)) return
      const labelMap = { '0': '正常', '1': '不正常' }
      const location = this.escapeHtml(row.location)
      const containerCode = this.escapeHtml(row.containerCode)
      this.$confirm(`位置：${location}<br/>容器号：${containerCode}<br/>确定将该容器结果修改为「${labelMap[value] || value}」吗？`, '结果修改确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        type: 'warning',
      }).then(() => {
        this.$set(row, 'result', value)
        this.handleGoodsResultChange(warehouseId)
      }).catch(() => {})
    },
    handleSelectionChange(warehouseId, selection) {
      this.$set(this.selectedGoodsMap, warehouseId, selection)
    },
    batchSetResult(warehouseId, result) {
      const selected = this.selectedGoodsMap[warehouseId] || []
      if (selected.length === 0) {
        this.$message.warning('请先选择需要操作的明细')
        return
      }
      const labelMap = { '0': '正常', '1': '不正常' }
      const applyResult = (remark) => {
        selected.forEach(item => {
          this.$set(item, 'result', result)
          if (remark !== undefined) this.$set(item, 'resultRemark', remark)
        })
        this.handleGoodsResultChange(warehouseId)
        this.$message.success(`已将 ${selected.length} 项设为「${labelMap[result]}」`)
      }
      // 不正常弹出备注输入框
      if (result === '1') {
        this.$prompt(`请输入「${labelMap[result]}」备注信息`, '批量设置备注', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: '请输入备注（可选）',
        }).then(({ value }) => {
          applyResult(value || '')
        }).catch(() => {})
        return
      }
      applyResult()
    },
    getGoodsKey(item, idx) {
      return item.id ? String(item.id) : String(idx)
    },
    getInventoryResultText(result) {
      const map = { all_normal: '全部正常', partial_abnormal: '部分异常', '1': '全部正常', '2': '部分异常' }
      return map[result] || '-'
    },
    getResultText(result) {
      const map = { '0': '正常', '1': '不正常', '-1': '--' }
      return map[result] || result || '-'
    },
    getResultClass(result) {
      const map = { '0': 'result-normal', '1': 'result-deficit' }
      return map[result] || ''
    },
    getGoodsRowClassName({ row }) {
      return String(row.result) === '1' || String(row.result) === '2' ? 'abnormal-row' : ''
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
  .inventory-form-table {
    margin-bottom: 15px;
  }

  .word-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #333;
    table-layout: fixed;

    td {
      border: 1px solid #333;
      padding: 8px 12px;
      font-size: 14px;
      color: #303133;
      vertical-align: middle;
    }

    .title-cell {
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      color: #303133;
      padding: 12px;
    }

    .label-cell {
      background-color: #f5f7fa;
      color: #303133;
      font-weight: 500;
      text-align: center;
      white-space: nowrap;
    }

    .result-label {
      vertical-align: middle;
    }

    .empty-cell {
      background-color: #fff;
    }

    .required-star {
      color: #f56c6c;
      margin-right: 2px;
    }

    .cell-value {
      color: #303133;
    }

    .inline-field {
      display: inline-flex;
      align-items: center;
      .inline-label {
        color: #606266;
        font-weight: 500;
        white-space: nowrap;
        margin-right: 4px;
      }
      .inline-input {
        width: 200px;
      }
    }

    .ml-20 {
      margin-left: 20px;
    }

    ::v-deep .el-input__inner {
      border: none;
      border-radius: 0;
      padding-left: 0;
      background: transparent;
    }
    ::v-deep .el-date-editor {
      width: 100%;
    }
    ::v-deep .el-input-number {
      width: 100%;
      .el-input__inner {
        text-align: left;
      }
    }
  }

  .detail-section-wrap {
    .detail-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .detail-section-title {
      font-weight: bold;
      color: #303133;
      padding-left: 10px;
      border-left: 3px solid #409eff;
    }
    .batch-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      .batch-info {
        font-size: 13px;
        color: #909399;
        margin-right: 4px;
      }
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

::v-deep .el-table__body tr.abnormal-row > td {
  background: #fde2e2 !important;
}

.tab-label {
  display: inline-flex;
  align-items: center;
}
.tab-status-tag {
  margin-left: 6px;
}
</style>
