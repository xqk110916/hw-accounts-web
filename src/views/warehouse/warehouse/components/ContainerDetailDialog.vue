<template>
  <el-dialog
    title="容器详情"
    :visible.sync="dialogVisible"
    width="600px"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="container-detail" v-if="container">
      <!-- 基本信息描述列表 -->
      <div class="detail-section">
        <div class="section-header">
          <span>
            <i class="icon el-icon-document"></i>
            <span>基本信息</span>
          </span>
          <el-button type="text" size="mini" @click="handleViewHistory">查看入库信息</el-button>
        </div>
        <table class="custom-descriptions">
          <tr>
            <td class="label">容器编号</td>
            <td class="value">{{ detailValue('containerCode', 'code') }}</td>
            <td class="label">任务编号</td>
            <td class="value">{{ detailValue('taskNum') }}</td>
          </tr>
          <tr>
            <td class="label">材料类型</td>
            <td class="value">{{ materialTypesText }}</td>
            <td class="label">入库时间</td>
            <td class="value">{{ inboundTime }}</td>
          </tr>
          <tr>
            <td class="label">物料编码</td>
            <td class="value">{{ detailValue('goodCode', 'goodsCode', 'materialCode') }}</td>
            <td class="label">物料名称</td>
            <td class="value">{{ detailValue('goodsName', 'goodName', 'materialName') }}</td>
          </tr>
          <tr>
            <td class="label">生产单位</td>
            <td class="value">{{ detailValue('productionUnit') }}</td>
            <td class="label">货箱号</td>
            <td class="value">{{ detailValue('boxNum') }}</td>
          </tr>
          <tr>
            <td class="label">封记编码1</td>
            <td class="value">{{ detailValue('sealCode1') }}</td>
            <td class="label">封记编码2</td>
            <td class="value">{{ detailValue('sealCode2') }}</td>
          </tr>
          <tr>
            <td class="label">毛重</td>
            <td class="value">{{ formatWeight(detailValueRaw('grossWeight')) }}</td>
            <td class="label">皮重</td>
            <td class="value">{{ formatWeight(detailValueRaw('tareWeight')) }}</td>
          </tr>
          <tr>
            <td class="label">净重</td>
            <td class="value">{{ formatWeight(detailValueRaw('netWeight')) }}</td>
            <!-- <td class="label">重量单位</td>
            <td class="value">{{ detailValue('weightUnit') }}</td> -->
          </tr>
          <tr>
            <td class="label location-highlight"> <i class="el-icon-location"></i> 当前位置</td>
            <td class="value" colspan="3">
              <span class="location-highlight">{{ containerLocation }}</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- 移动容器操作区 -->
      <div class="detail-section mt20">
        <div class="section-header">
          <span>
            <i class="icon el-icon-location"></i>
            <span>位置信息</span>
          </span>
        </div>
        <div class="move-action-area">
          <div class="action-label">移动至:</div>
          <el-select
            v-model="targetWarehouseId"
            :loading="warehouseLoading"
            placeholder="请选择目标库房"
            size="small"
            class="warehouse-select"
            clearable
            filterable
            @change="handleWarehouseChange"
          >
            <el-option
              v-for="warehouse in warehouseOptions"
              :key="warehouse.id"
              :label="warehouse.warehouseName || warehouse.nodeName"
              :value="warehouse.id"
            />
          </el-select>
          <el-select
            v-model="targetPositionId"
            placeholder="请选择目标位置"
            size="small"
            class="position-select"
            clearable
            filterable
            :disabled="!targetWarehouseId"
            :loading="positionLoading"
            @change="handlePositionChange"
          >
            <el-option
              v-for="position in positionOptions"
              :key="position.id"
              :label="formatPositionLabel(position)"
              :value="position.id"
              :disabled="position.status !== 0"
            >
              <span>{{ formatPositionLabel(position) }}</span>
              <span v-if="position.status !== 0" style="color: #999; margin-left: 8px;">
                ({{ position.status === 1 ? '占用' : '锁定' }})
              </span>
            </el-option>
          </el-select>
          <el-button 
            type="primary" 
            size="small" 
            @click="handleMove" 
            :disabled="!targetWarehouseId || !targetPositionId"
          >
            确认移动
          </el-button>
          <el-button
            size="small"
            icon="el-icon-s-grid"
            @click="openMapSelector"
          >
            2D位置图选择
          </el-button>
        </div>
      </div>
    </div>
    <span slot="footer">
      <el-button @click="handleClose">关闭</el-button>
    </span>

    <el-dialog
      title="2D位置图选择"
      :visible.sync="mapDialogVisible"
      width="960px"
      append-to-body
      :close-on-click-modal="false"
      class="position-map-dialog"
    >
      <div class="map-selector">
        <div class="map-selector-toolbar">
          <el-select
            v-model="mapAreaId"
            size="small"
            filterable
            placeholder="请选择平衡区"
            :loading="mapAreaLoading"
            @change="handleMapAreaChange"
          >
            <el-option
              v-for="area in mapAreaOptions"
              :key="area.id"
              :label="area.name"
              :value="area.id"
            />
          </el-select>
          <el-select
            v-model="mapWarehouseId"
            size="small"
            filterable
            placeholder="请选择库房"
            :loading="mapWarehouseLoading"
            @change="handleMapWarehouseChange"
          >
            <el-option
              v-for="warehouse in mapWarehouseOptions"
              :key="warehouse.id"
              :label="warehouse.name || warehouse.warehouseName || warehouse.nodeName"
              :value="warehouse.id"
            />
          </el-select>
          <span class="map-selector-tip">点击空闲位置后自动回填目标库房和位置</span>
        </div>
        <div v-loading="mapLoading" class="map-selector-body">
          <WarehouseGridMap2D
            v-if="mapWarehouse"
            :warehouse-name="mapWarehouse.name || '库房'"
            :shelves="mapWarehouse.shelves || []"
            :layout="mapWarehouse.layout2d"
            :editable="false"
            :show-toolbar="false"
            :selected-shelf="mapSelectedShelf"
            @shelf-select="mapSelectedShelf = $event"
            @container-click="handleMapPositionClick"
          />
          <el-empty v-else description="请选择库房查看位置图" />
        </div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { getHierarchyListByNodeType, getPositionMap } from '@/api/warehouse/locationMap';
import { getBalanceAreaList, getWarehouseList, getWarehouseById } from '../config/warehouseConfig';
import WarehouseGridMap2D from './WarehouseGridMap2D.vue';

export default {
  name: 'ContainerDetailDialog',
  components: {
    WarehouseGridMap2D
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    container: {
      type: Object,
      default: null
    },
    containerLocation: {
      type: String,
      default: '-'
    },
    currentArea: {
      type: Object,
      default: null
    },
    currentWarehouse: {
      type: Object,
      default: null
    },
    selectedWarehouseId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      targetWarehouseId: '',
      targetPositionId: '',
      targetWarehouse: null,
      targetPosition: null,
      warehouseOptions: [],
      positionOptions: [],
      warehouseLoading: false,
      positionLoading: false,
      mapDialogVisible: false,
      mapAreaId: '',
      mapWarehouseId: '',
      mapAreaOptions: [],
      mapWarehouseOptions: [],
      mapWarehouse: null,
      mapSelectedShelf: null,
      mapAreaLoading: false,
      mapWarehouseLoading: false,
      mapLoading: false
    };
  },
  watch: {
    dialogVisible(val) {
      if (val) this.loadWarehouseOptions();
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    },
    goodsDetail() {
      return (this.container && this.container.inboundGoodsEntity) || {};
    },
    inboundTime() {
      return this.detailValue('lastInboundTime', 'inboundTime', 'createTime', 'storageDate');
    },
    materialTypesText() {
      const value = this.detailValueRaw('materialTypes');
      if (!value) return '-';
      if (Array.isArray(value)) return value.length ? value.join('、') : '-';
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.length ? parsed.map(item => {
            if (item && typeof item === 'object') {
              return item.name || item.label || item.value || item.materialType || JSON.stringify(item);
            }
            return item;
          }).join('、') : '-';
        }
      } catch (error) {
        return value || '-';
      }
      return value || '-';
    }
  },
  methods: {
    async loadWarehouseOptions() {
      this.warehouseLoading = true;
      try {
        const res = await getHierarchyListByNodeType(2);
        this.warehouseOptions = Array.isArray(res.data) ? res.data : [];
      } finally {
        this.warehouseLoading = false;
      }
    },
    normalizePositionOption(item = {}) {
      return {
        ...item,
        id: item.id || item.positionId || item.hierarchyId || item.columnId,
        status: Number(item.status == null ? 0 : item.status)
      };
    },
    async loadPositionOptions(warehouseId) {
      if (!warehouseId) {
        this.positionOptions = [];
        return;
      }
      this.positionLoading = true;
      try {
        const res = await getPositionMap({ nodeId: warehouseId, nodeType: '2' });
        const positions = Array.isArray(res.data) ? res.data : [];
        this.positionOptions = positions.map(this.normalizePositionOption);
      } finally {
        this.positionLoading = false;
      }
    },
    async handleWarehouseChange(warehouseId) {
      this.targetPositionId = '';
      this.targetPosition = null;
      this.positionOptions = [];
      this.targetWarehouse = this.warehouseOptions.find(item => String(item.id) === String(warehouseId)) || null;
      if (!warehouseId) return;
      await this.loadPositionOptions(warehouseId);
    },
    handlePositionChange(positionId) {
      this.targetPosition = this.positionOptions.find(item => String(item.id) === String(positionId)) || null;
    },
    async openMapSelector() {
      this.mapDialogVisible = true;
      await this.loadMapAreaOptions();

      const defaultAreaId = this.currentArea && this.currentArea.id;
      this.mapAreaId = defaultAreaId || (this.mapAreaOptions[0] && this.mapAreaOptions[0].id) || '';
      await this.loadMapWarehouseOptions();

      const defaultWarehouseId = this.selectedWarehouseId || (this.currentWarehouse && this.currentWarehouse.id);
      const hasDefaultWarehouse = this.mapWarehouseOptions.some(item => String(item.id) === String(defaultWarehouseId));
      this.mapWarehouseId = hasDefaultWarehouse
        ? defaultWarehouseId
        : ((this.mapWarehouseOptions[0] && this.mapWarehouseOptions[0].id) || '');
      await this.loadMapWarehouse();
    },
    async loadMapAreaOptions() {
      if (this.mapAreaOptions.length) return;
      this.mapAreaLoading = true;
      try {
        this.mapAreaOptions = await getBalanceAreaList();
      } finally {
        this.mapAreaLoading = false;
      }
    },
    async loadMapWarehouseOptions() {
      if (!this.mapAreaId) {
        this.mapWarehouseOptions = [];
        return;
      }
      this.mapWarehouseLoading = true;
      try {
        this.mapWarehouseOptions = await getWarehouseList(this.mapAreaId);
      } finally {
        this.mapWarehouseLoading = false;
      }
    },
    async loadMapWarehouse() {
      this.mapSelectedShelf = null;
      if (!this.mapWarehouseId) {
        this.mapWarehouse = null;
        return;
      }
      this.mapLoading = true;
      try {
        this.mapWarehouse = await getWarehouseById(this.mapWarehouseId);
      } finally {
        this.mapLoading = false;
      }
    },
    async handleMapAreaChange() {
      this.mapWarehouseId = '';
      this.mapWarehouse = null;
      await this.loadMapWarehouseOptions();
      this.mapWarehouseId = (this.mapWarehouseOptions[0] && this.mapWarehouseOptions[0].id) || '';
      await this.loadMapWarehouse();
    },
    async handleMapWarehouseChange() {
      await this.loadMapWarehouse();
    },
    async handleMapPositionClick(position) {
      const normalizedPosition = this.normalizePositionOption(position);
      if (!normalizedPosition.id || normalizedPosition.status !== 0) {
        this.$message.warning('请选择空闲位置');
        return;
      }

      this.targetWarehouseId = this.mapWarehouseId;
      this.targetWarehouse = this.warehouseOptions.find(item => String(item.id) === String(this.mapWarehouseId))
        || this.mapWarehouseOptions.find(item => String(item.id) === String(this.mapWarehouseId))
        || this.mapWarehouse;

      await this.loadPositionOptions(this.mapWarehouseId);
      this.targetPosition = this.positionOptions.find(item => String(item.id) === String(normalizedPosition.id)) || normalizedPosition;
      this.targetPositionId = this.targetPosition.id;
      this.mapDialogVisible = false;
    },
    formatPositionLabel(position = {}) {
      return [position.shelfCode, position.rowCode, position.columnCode].filter(Boolean).join('-') || '-';
    },
    detailValueRaw(...keys) {
      const detail = this.goodsDetail || {};
      const container = this.container || {};
      for (const key of keys) {
        const value = detail[key];
        if (value !== null && typeof value !== 'undefined' && value !== '') return value;
      }
      for (const key of keys) {
        const value = container[key];
        if (value !== null && typeof value !== 'undefined' && value !== '') return value;
      }
      return '';
    },
    detailValue(...keys) {
      const value = this.detailValueRaw(...keys);
      return value === '' ? '-' : value;
    },
    formatWeight(value) {
      if (value === null || typeof value === 'undefined' || value === '') return '-';
      const unit = this.detailValueRaw('weightUnit');
      return `${value}${unit ? ` ${unit}` : ''}`;
    },
    handleClose() {
      this.targetWarehouseId = '';
      this.targetPositionId = '';
      this.targetWarehouse = null;
      this.targetPosition = null;
      this.positionOptions = [];
      this.mapDialogVisible = false;
      this.$emit('update:visible', false);
      this.$emit('close');
    },
    handleMove() {
      if (!this.targetWarehouseId || !this.targetPositionId || !this.targetPosition) {
        this.$message.warning('请选择目标位置');
        return;
      }
      this.$emit('move-container', {
        warehouseId: this.targetWarehouseId,
        warehouseName: this.targetWarehouse?.warehouseName || this.targetWarehouse?.nodeName || this.targetWarehouse?.name || '',
        positionId: this.targetPositionId,
        shelfCode: this.targetPosition.shelfCode || '',
        rowCode: this.targetPosition.rowCode || '',
        columnCode: this.targetPosition.columnCode || '',
        positionLabel: this.formatPositionLabel(this.targetPosition)
      });
      this.targetWarehouseId = '';
      this.targetPositionId = '';
      this.targetWarehouse = null;
      this.targetPosition = null;
      this.positionOptions = [];
    },
    handleViewHistory() {
      this.$emit('view-history');
    }
  }
};
</script>

<style lang="scss" scoped>
.container-detail {
  .detail-section {
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #ebeef5;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .section-header {
      background: #f5f7fa;
      color: #303133;
      padding: 12px 20px;
      font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #ebeef5;
      display: flex;
      justify-content: space-between;
      
      i {
        font-size: 18px;
        color: #409EFF;
        margin-right: 3px;
      }
    }
    
    .custom-descriptions {
      width: 100%;
      border-collapse: collapse;
      
      td {
        border: 1px solid #ebeef5;
        padding: 12px 15px;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .label {
        background-color: #fafafa;
        color: #606266;
        font-weight: 600;
        width: 120px;
        white-space: nowrap;
      }
      
      .value {
        color: #303133;
      }

      .location-highlight {
        color: #409EFF;
      }
    }
  }
  
  .move-action-area {
    margin: 0 20px 20px 20px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
    
    .action-label {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
      white-space: nowrap;
    }
    
    .warehouse-select,
    .position-select {
      flex: 1;
      min-width: 180px;
    }
  }

  .mt20 {
    margin-top: 20px;
  }
}

.map-selector {
  .map-selector-toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 12px;

    .el-select {
      width: 220px;
    }
  }

  .map-selector-tip {
    color: #909399;
    font-size: 13px;
  }

  .map-selector-body {
    min-height: 520px;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    overflow: hidden;
    background: #f8fafc;
  }
}
</style>
