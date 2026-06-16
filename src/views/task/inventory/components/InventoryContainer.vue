<template>
  <div class="inventory-container" v-if="tabList.length > 0">
    <el-tabs :value="activeTab" @input="$emit('update:activeTab', $event)" type="border-card">
      <el-tab-pane v-for="tab in tabList" :key="tab.id" :label="tab.name" :name="tab.id">
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
              <!-- 盘存结果区域：左侧label合并3行，右侧3列布局 -->
              <tr>
                <td class="label-cell result-label" rowspan="3">盘存结果</td>
                <td class="empty-cell"></td>
                <td class="label-cell">正常数</td>
                <td>
                  <el-input-number v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].normalCount" @input="updateForm(tab.id, 'normalCount', $event)" size="small" :min="0" controls-position="right" style="width: 100%" />
                  <span class="cell-value" v-else>{{ inventoryFormMap[tab.id].normalCount }}</span>
                </td>
                <td colspan="2"></td>
              </tr>
              <tr>
                <td>
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
                <td class="label-cell">盘盈数</td>
                <td>
                  <el-input-number v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].excessCount" @input="updateForm(tab.id, 'excessCount', $event)" size="small" :min="0" controls-position="right" style="width: 100%" />
                  <span class="cell-value" v-else>{{ inventoryFormMap[tab.id].excessCount }}</span>
                </td>
                <td class="label-cell">备注</td>
                <td>
                  <el-input v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].excessRemark" @input="updateForm(tab.id, 'excessRemark', $event)" size="small" placeholder="备注" />
                  <span class="cell-value" v-else>{{ inventoryFormMap[tab.id].excessRemark || '' }}</span>
                </td>
              </tr>
              <tr>
                <td class="empty-cell"></td>
                <td class="label-cell">盘亏数</td>
                <td>
                  <el-input-number v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].deficitCount" @input="updateForm(tab.id, 'deficitCount', $event)" size="small" :min="0" controls-position="right" style="width: 100%" />
                  <span class="cell-value" v-else>{{ inventoryFormMap[tab.id].deficitCount }}</span>
                </td>
                <td class="label-cell">备注</td>
                <td>
                  <el-input v-if="type === 'inputResult'" :value="inventoryFormMap[tab.id].deficitRemark" @input="updateForm(tab.id, 'deficitRemark', $event)" size="small" placeholder="备注" />
                  <span class="cell-value" v-else>{{ inventoryFormMap[tab.id].deficitRemark || '' }}</span>
                </td>
              </tr>
              <!-- 异常时：盘盈容器 -->
              <tr v-if="type === 'inputResult' && inventoryFormMap[tab.id].inventoryResult === 'partial_abnormal'">
                <td class="label-cell">盘盈容器</td>
                <td colspan="5">
                  <el-select
                    :value="inventoryFormMap[tab.id].excessContainerCodes || []"
                    multiple
                    filterable
                    collapse-tags
                    size="small"
                    placeholder="请选择盘盈容器"
                    style="width: 100%"
                    @input="handleAbnormalContainerChange(tab.id, 'excess', $event)"
                  >
                    <el-option
                      v-for="(item, idx) in goodsListMap[tab.id] || []"
                      :key="'excess_' + idx"
                      :label="item.containerCode || '-'"
                      :value="getGoodsKey(item, idx)"
                      :disabled="isOppositeContainerSelected(tab.id, 'excess', item, idx)"
                    />
                  </el-select>
                </td>
              </tr>
              <!-- 异常时：盘亏容器 -->
              <tr v-if="type === 'inputResult' && inventoryFormMap[tab.id].inventoryResult === 'partial_abnormal'">
                <td class="label-cell">盘亏容器</td>
                <td colspan="5">
                  <el-select
                    :value="inventoryFormMap[tab.id].deficitContainerCodes || []"
                    multiple
                    filterable
                    collapse-tags
                    size="small"
                    placeholder="请选择盘亏容器"
                    style="width: 100%"
                    @input="handleAbnormalContainerChange(tab.id, 'deficit', $event)"
                  >
                    <el-option
                      v-for="(item, idx) in goodsListMap[tab.id] || []"
                      :key="'deficit_' + idx"
                      :label="item.containerCode || '-'"
                      :value="getGoodsKey(item, idx)"
                      :disabled="isOppositeContainerSelected(tab.id, 'deficit', item, idx)"
                    />
                  </el-select>
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
              <el-button type="warning" size="mini" @click="batchSetResult(tab.id, '2')">批量设为盘盈</el-button>
              <el-button type="danger" size="mini" @click="batchSetResult(tab.id, '1')">批量设为盘亏</el-button>
            </div>
          </div>
          <el-table
            ref="goodsTable"
            :data="goodsListMap[tab.id] || []"
            border
            size="small"
            max-height="400"
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
                  <el-radio-group v-model="scope.row.result" size="mini" @change="handleGoodsResultChange(tab.id)">
                    <el-radio label="0">正常</el-radio>
                    <el-radio label="1">盘亏</el-radio>
                    <el-radio label="2">盘盈</el-radio>
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
    handleSelectionChange(warehouseId, selection) {
      this.$set(this.selectedGoodsMap, warehouseId, selection)
    },
    batchSetResult(warehouseId, result) {
      const selected = this.selectedGoodsMap[warehouseId] || []
      if (selected.length === 0) {
        this.$message.warning('请先选择需要操作的明细')
        return
      }
      const labelMap = { '0': '正常', '1': '盘亏', '2': '盘盈' }
      const applyResult = (remark) => {
        selected.forEach(item => {
          this.$set(item, 'result', result)
          if (remark !== undefined) this.$set(item, 'resultRemark', remark)
        })
        this.handleGoodsResultChange(warehouseId)
        this.$message.success(`已将 ${selected.length} 项设为「${labelMap[result]}」`)
      }
      // 盘盈/盘亏弹出备注输入框
      if (result === '1' || result === '2') {
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
    isOppositeContainerSelected(warehouseId, resultType, item, idx) {
      const form = this.inventoryFormMap[warehouseId] || {}
      const oppositeField = resultType === 'excess' ? 'deficitContainerCodes' : 'excessContainerCodes'
      return (form[oppositeField] || []).map(value => String(value)).includes(this.getGoodsKey(item, idx))
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
</style>
