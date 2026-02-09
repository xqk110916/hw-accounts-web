<template>
  <div class="location-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <i class="el-icon-location-outline"></i>
          库房位置图
        </h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>{{ currentBalanceArea }}</el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentWarehouse">{{ currentWarehouse.name }}</el-breadcrumb-item>
          <el-breadcrumb-item v-if="selectedShelf">{{ selectedShelf.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-right">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          size="small"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          style="width: 260px"
          placement="bottom-start"
          @change="handleDateFilter"
        ></el-date-picker>
        
        <el-button 
          type="primary" 
          size="small" 
          icon="el-icon-download"
          @click="handleExport"
        >
          导出位置图
        </el-button>
      </div>
    </div>

    <!-- 主内容区 - 三栏布局 -->
    <div class="page-content">
      <!-- 左侧：库房平面图 -->
      <div class="content-warehouse">
        <WarehouseMap
          :warehouses="warehouseList"
          :selected-id="selectedWarehouseId"
          @select="handleWarehouseSelect"
        />
      </div>
      
      <!-- 中间：货架2D平面图 -->
      <div class="content-shelves">
        <LocationMap2D
          :warehouse-name="currentWarehouse ? currentWarehouse.name : '库房'"
          :warehouse-width="currentWarehouse ? currentWarehouse.width : 20"
          :warehouse-height="currentWarehouse ? currentWarehouse.height : 15"
          :shelves="displayShelves"
          :date-color-map="dateColorMap"
          @shelf-select="handleShelfSelect"
          @container-click="handleContainerClick"
        />
      </div>
      
      <!-- 右侧：三维货架视图 -->
      <div class="content-3d">
        <ShelfView3D
          :shelf-name="selectedShelf ? selectedShelf.name : ''"
          :layers="selectedShelfLayers"
          :date-color-map="dateColorMap"
          @container-click="handleContainerClick"
        />
      </div>
    </div>

    <!-- 右上角悬浮统计面板 -->
    <StatisticsPanel
      :date-color-map="dateColorMap"
      :container-stats="containerStats"
      @filter-date="handleFilterDate"
      @filter-clear="handleFilterClear"
    />

    <!-- 容器详情弹窗 -->
    <ContainerDetailDialog
      :visible.sync="containerDialogVisible"
      :container="selectedContainer"
      :container-location="getContainerLocation()"
      :location-options="locationCascaderOptions"
      @move-container="handleMoveContainer"
      @view-history="viewContainerHistory"
      @close="containerDialogVisible = false"
    />
  </div>
</template>

<script>
import WarehouseMap from './components/WarehouseMap.vue';
import LocationMap2D from './components/LocationMap2D.vue';
import ShelfView3D from './components/ShelfView3D.vue';
import StatisticsPanel from './components/StatisticsPanel.vue';
import ContainerDetailDialog from './components/ContainerDetailDialog.vue';
import { generateDateColorMap } from './utils/colorHelper';
import { getWarehouseList, getWarehouseById, getBalanceAreaName, shelfData } from './config/warehouseConfig';

export default {
  name: 'LocationIndex',
  components: {
    WarehouseMap,
    LocationMap2D,
    ShelfView3D,
    StatisticsPanel,
    ContainerDetailDialog
  },
  data() {
    return {
      // 基础数据
      currentBalanceArea: '',
      warehouseList: [],
      selectedWarehouseId: '',
      currentWarehouse: null,
      
      // 筛选条件
      dateRange: [],
      filterDate: null,
      
      // 货架和容器数据
      shelves: [],
      selectedShelf: null,
      selectedContainer: null,
      containerDialogVisible: false,
      
      // 颜色映射
      dateColorMap: {},
      
      // 统计数据
      statistics: {
        totalShelves: 0,
        totalContainers: 0,
        usedContainers: 0,
        usageRate: 0
      }
    };
  },
  computed: {
    displayShelves() {
      if (!this.filterDate) {
        return this.shelves;
      }
      return this.shelves.map(shelf => ({
        ...shelf,
        layers: shelf.layers ? shelf.layers.map(layer => ({
          ...layer,
          containers: layer.containers ? layer.containers.filter(c => c.storageDate === this.filterDate) : []
        })) : []
      }));
    },
    locationCascaderOptions() {
      return this.warehouseList.map(wh => {
        const shelves = shelfData[wh.id] || [];
        return {
          value: wh.id,
          label: wh.name,
          children: shelves.map(s => ({
            value: s.name, // 使用名称作为值,因为原逻辑是用名称
            label: s.name
          }))
        };
      });
    },
    selectedShelfLayers() {
      if (!this.selectedShelf) return [];
      return this.selectedShelf.layers || [];
    },
    containerStats() {
      const stats = {};
      this.shelves.forEach(shelf => {
        if (shelf.layers) {
          shelf.layers.forEach(layer => {
            if (layer.containers) {
              layer.containers.forEach(container => {
                if (container.storageDate) {
                  stats[container.storageDate] = (stats[container.storageDate] || 0) + 1;
                }
              });
            }
          });
        }
      });
      return stats;
    }
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      this.currentBalanceArea = getBalanceAreaName();
      this.warehouseList = getWarehouseList();
      
      if (this.warehouseList.length > 0) {
        this.selectedWarehouseId = this.warehouseList[0].id;
        this.loadWarehouseData(this.selectedWarehouseId);
      }
    },
    
    loadWarehouseData(warehouseId) {
      const warehouseData = getWarehouseById(warehouseId);
      if (warehouseData) {
        this.currentWarehouse = warehouseData;
        this.shelves = warehouseData.shelves;
        
        if (this.shelves.length > 0) {
          this.selectedShelf = this.shelves[0];
        } else {
          this.selectedShelf = null;
        }
        
        this.generateColorMap();
        this.calculateStatistics();
      }
    },
    
    generateColorMap() {
      const allDates = [];
      this.shelves.forEach(shelf => {
        if (shelf.layers) {
          shelf.layers.forEach(layer => {
            layer.containers.forEach(c => {
              if (c.storageDate) allDates.push(c.storageDate);
            });
          });
        }
      });
      this.dateColorMap = generateDateColorMap(allDates);
    },
    
    calculateStatistics() {
      let totalContainers = 0;
      let usedContainers = 0;
      
      this.shelves.forEach(shelf => {
        if (shelf.layers) {
          shelf.layers.forEach(layer => {
            layer.containers.forEach(c => {
              totalContainers++;
              if (c.materialCode) usedContainers++;
            });
          });
        }
      });
      
      this.statistics = {
        totalShelves: this.shelves.length,
        totalContainers,
        usedContainers,
        usageRate: totalContainers > 0 ? Math.round(usedContainers / totalContainers * 100) : 0
      };
    },
    
    handleWarehouseSelect(warehouse) {
      this.selectedWarehouseId = warehouse.id;
      this.selectedShelf = null;
      this.loadWarehouseData(warehouse.id);
    },
    
    handleDateFilter(dateRange) {
      console.log('日期筛选:', dateRange);
    },
    
    handleFilterDate(date) {
      this.filterDate = date;
    },
    
    handleFilterClear() {
      this.filterDate = null;
    },
    
    handleShelfSelect(shelf) {
      this.selectedShelf = shelf;
    },
    
    handleContainerClick(container) {
      if (container && container.code) {
        this.selectedContainer = container;
        this.containerDialogVisible = true;
      }
    },
    
    getContainerLocation() {
      if (!this.selectedShelf || !this.selectedContainer) return '-';
      return `${this.currentWarehouse?.name || '库房'} - ${this.selectedShelf.name}`;
    },
    
    
    viewContainerHistory() {
      this.$message.info('跳转到入库信息页面...');
    },
    
    handleMoveContainer(targetLocation) {
      if (!targetLocation || targetLocation.length < 2) {
        this.$message.warning('请选择目标位置');
        return;
      }
      
      const warehouseId = targetLocation[0];
      const shelfName = targetLocation[1];
      const warehouseName = this.warehouseList.find(w => w.id === warehouseId)?.name || warehouseId;
      
      this.$confirm(`确定要将容器 ${this.selectedContainer.code} 移动到 ${warehouseName} - ${shelfName} 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 这里实现移动逻辑
        this.$message.success('容器移动成功');
        this.containerDialogVisible = false;
      }).catch(() => {
        this.$message.info('已取消移动');
      });
    },
    
    handleExport() {
      this.$message.info('正在生成导出文件...');
    }
  }
};
</script>

<style lang="scss" scoped>
.location-page {
  padding: 20px;
  background: #f0f2f5;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    
    .header-left {
      .page-title {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        display: flex;
        align-items: center;
        gap: 8px;
        
        i {
          color: #409EFF;
        }
      }
      
      .el-breadcrumb {
        font-size: 13px;
      }
    }
    
    .header-right {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }
  
  .page-content {
    display: flex;
    gap: 20px;
    flex: 1;
    min-height: 0;
    
    .content-warehouse {
      width: 200px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
    }
    
    .content-shelves {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    
    .content-3d {
      width: 35%;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
