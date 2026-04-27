<template>
  <div class="location-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <i class="el-icon-location-outline"></i>
          库房位置图
        </h2>
        <!-- 多层级面包屑 -->
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>
            <span class="breadcrumb-link" @click="goToLevel('balance')">
              {{ currentArea ? currentArea.name : balanceAreaName }}
            </span>
          </el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentLevel !== 'balance'">
            <span class="breadcrumb-link" @click="goToLevel('warehouse')">
              {{ currentWarehouse ? currentWarehouse.name : '' }}
            </span>
          </el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentLevel === 'interior' || currentLevel === 'shelf'">
            <span class="breadcrumb-link" @click="goToLevel('interior')">库房内部</span>
          </el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentLevel === 'shelf'">
            <span>{{ selectedShelf ? selectedShelf.name : '' }}</span>
          </el-breadcrumb-item>
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

    <!-- 主内容区：根据层级动态切换 -->
    <div class="page-content">

      <!-- 层级1：平衡区三维场景 -->
      <div v-if="currentLevel === 'balance'" class="level-view">
        <div class="level-tip">
          <i class="el-icon-info"></i> 点击平衡区进入库房层级
        </div>
        <!-- 右上角快捷进入按钮 -->
        <div class="balance-quick-enter">
          <el-button
            size="small"
            type="primary"
            icon="el-icon-s-grid"
            @click="quickEnterShelf"
          >2D平面图</el-button>
        </div>
        <BalanceArea3D
          :areas="balanceAreaList"
          @select-area="handleAreaSelect"
        />
      </div>


      <!-- 层级2：库房三维场景 -->
      <div v-else-if="currentLevel === 'warehouse'" class="level-view">
        <div class="level-tip">
          <i class="el-icon-info"></i> 点击库房建筑进入库房内部
        </div>
        <WarehouseScene3D
          :warehouses="warehouseList"
          :area-name="currentArea ? currentArea.name : ''"
          @select-warehouse="handleWarehouseEnter"
        />
      </div>

      <!-- 层级3：库房内部（2D/3D切换） -->
      <div v-else-if="currentLevel === 'interior'" class="level-view">
        <WarehouseInterior3D
          :warehouse-name="currentWarehouse ? currentWarehouse.name : '库房'"
          :shelf-layout="currentWarehouse ? (currentWarehouse.shelfLayout || { rows: 2, cols: 3 }) : { rows: 2, cols: 3 }"
          :shelves="shelves"
          :layout="layout2d"
          @select-shelf="handleShelfEnter"
        />
      </div>

      <!-- 层级4：货架详情（原有布局保持不变） -->
      <div v-else-if="currentLevel === 'shelf'" class="page-content-shelf">
        <!-- 左侧：平面图 -->
        <div class="content-warehouse">
          <WarehouseMap
            :warehouses="warehouseList"
            :selected-id="selectedWarehouseId"
            :balance-areas="balanceAreaList"
            :selected-area-id="currentArea ? currentArea.id : ''"
            @select="handleWarehouseSelect"
            @select-area="handleAreaSwitchInShelf"
          />
        </div>
        
        <!-- 中间：货架2D平面图 -->
        <div class="content-shelves">
          <LocationMap2D
            :warehouse-name="currentWarehouse ? currentWarehouse.name : '库房'"
            :warehouse-width="currentWarehouse ? currentWarehouse.width : 20"
            :warehouse-height="currentWarehouse ? currentWarehouse.height : 15"
            :shelves="displayShelves"
            :layout="layout2d"
            :date-color-map="dateColorMap"
            :selected-shelf="selectedShelf"
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

    </div>

    <!-- 右上角悬浮统计面板（仅在货架层级显示） -->
    <StatisticsPanel
      v-if="currentLevel === 'shelf'"
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
import BalanceArea3D from './components/BalanceArea3D.vue';
import WarehouseScene3D from './components/WarehouseScene3D.vue';
import WarehouseInterior3D from './components/WarehouseInterior3D.vue';
import WarehouseMap from './components/WarehouseMap.vue';
import LocationMap2D from './components/LocationMap2D.vue';
import ShelfView3D from './components/ShelfView3D.vue';
import StatisticsPanel from './components/StatisticsPanel.vue';
import ContainerDetailDialog from './components/ContainerDetailDialog.vue';
import { generateDateColorMap } from './utils/colorHelper';
import {
  getWarehouseList,
  getWarehouseById,
  getBalanceAreaName,
  getBalanceAreaList
} from './config/warehouseConfig';

export default {
  name: 'LocationIndex',
  components: {
    BalanceArea3D,
    WarehouseScene3D,
    WarehouseInterior3D,
    WarehouseMap,
    LocationMap2D,
    ShelfView3D,
    StatisticsPanel,
    ContainerDetailDialog
  },
  data() {
    return {
      // 层级状态: 'balance' | 'warehouse' | 'interior' | 'shelf'
      currentLevel: 'balance',

      // 平衡区数据
      balanceAreaName: '',
      balanceAreaList: [],
      currentArea: null,

      // 库房数据
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
      layout2d: null,

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
      if (!this.filterDate) return this.shelves;
      return this.shelves.map(shelf => ({
        ...shelf,
        layers: shelf.layers ? shelf.layers.map(layer => ({
          ...layer,
          containers: layer.containers ? layer.containers.filter(c => c.storageDate === this.filterDate) : []
        })) : []
      }));
    },
    locationCascaderOptions() {
      return this.warehouseList.map(wh => ({
        value: wh.id,
        label: wh.name,
        children: String(wh.id) === String(this.selectedWarehouseId)
          ? this.shelves.map(s => ({ value: s.name, label: s.name }))
          : []
      }));
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
    async initData() {
      this.balanceAreaName = getBalanceAreaName();
      this.balanceAreaList = await getBalanceAreaList();
    },

    // ==================== 层级导航 ====================

    /**
     * 进入平衡区层级（选定平衡区后进入库房层级）
     */
    async handleAreaSelect(area) {
      this.currentArea = area;
      // 根据平衡区查找库房
      this.warehouseList = await getWarehouseList(area.id);
      this.currentLevel = 'warehouse';
    },

    /**
     * 左侧面板切换平衡区 → 不跳三维，直接在货架层级切换
     * 自动选中该平衡区的第一个库房和第一个货架
     */
    async handleAreaSwitchInShelf(area) {
      this.currentArea = area;
      const filtered = await getWarehouseList(area.id);
      this.warehouseList = filtered;
      // 自动选第一个库房和第一个货架，保持在货架层级
      if (filtered && filtered.length > 0) {
        const firstWh = filtered[0];
        this.selectedWarehouseId = firstWh.id;
        await this.loadWarehouseData(firstWh.id);
        // loadWarehouseData 会自动设置 shelves 和 selectedShelf
      } else {
        this.selectedWarehouseId = null;
        this.currentWarehouse = null;
        this.shelves = [];
        this.selectedShelf = null;
        this.layout2d = null;
      }
      // 保持 shelf 层级不变（不切换到 warehouse 三维）
      this.currentLevel = 'shelf';
    },

    /**
     * 平衡区视图右上角快捷按钮 → 直接以默认第一个平衡区/库房/货架进入货架层级
     */
    async quickEnterShelf() {
      // 取第一个平衡区
      const firstArea = this.balanceAreaList[0];
      if (firstArea) {
        this.currentArea = firstArea;
        const filtered = await getWarehouseList(firstArea.id);
        this.warehouseList = filtered;
        if (filtered && filtered.length > 0) {
          const firstWh = filtered[0];
          this.selectedWarehouseId = firstWh.id;
          await this.loadWarehouseData(firstWh.id);
          // loadWarehouseData 会自动 selectedShelf = shelves[0]
        }
      } else {
        this.warehouseList = [];
        this.layout2d = null;
      }
      this.currentLevel = 'shelf';
    },

    /**
     * 点击库房建筑 → 进入库房内部层级
     */
    async handleWarehouseEnter(warehouse) {
      this.selectedWarehouseId = warehouse.id;
      await this.loadWarehouseData(warehouse.id);
      this.currentLevel = 'interior';
    },

    /**
     * 点击货架（内部层级）→ 进入货架层级
     */
    handleShelfEnter(shelf) {
      this.selectedShelf = shelf;
      this.currentLevel = 'shelf';
    },

    /**
     * 面包屑跳转到指定层级
     */
    goToLevel(level) {
      if (level === 'balance') {
        this.currentLevel = 'balance';
        this.currentArea = null;
        this.currentWarehouse = null;
        this.selectedShelf = null;
        this.layout2d = null;
      } else if (level === 'warehouse') {
        if (this.currentArea) {
          this.currentLevel = 'warehouse';
          this.selectedShelf = null;
        }
      } else if (level === 'interior') {
        if (this.currentWarehouse) {
          this.currentLevel = 'interior';
          this.selectedShelf = null;
        }
      }
    },

    // ==================== 货架层级内的交互（保持原有逻辑）====================

    async loadWarehouseData(warehouseId) {
      const warehouseData = await getWarehouseById(warehouseId);
      if (warehouseData) {
        this.currentWarehouse = warehouseData;
        this.shelves = warehouseData.shelves;
        this.layout2d = warehouseData.layout2d || null;

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

    async handleWarehouseSelect(warehouse) {
      this.selectedWarehouseId = warehouse.id;
      this.selectedShelf = null;
      await this.loadWarehouseData(warehouse.id);
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
        this.$message.success('容器移动成功');
        this.containerDialogVisible = false;
      }).catch(() => {
        this.$message.info('已取消移动');
      });
    },

    handleExport() {
      this.$message.info('请在 2D 平面图中使用“导出”按钮导出当前位置图');
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
    margin-bottom: 16px;
    padding: 12px 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    flex-shrink: 0;

    .header-left {
      .page-title {
        margin: 0 0 6px 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        display: flex;
        align-items: center;
        gap: 8px;
        i { color: #409EFF; }
      }

      .el-breadcrumb {
        font-size: 13px;

        .breadcrumb-link {
          cursor: pointer;
          color: #409EFF;
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .page-content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    .level-view {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      position: relative;

      .level-tip {
        position: absolute;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
        background: rgba(64, 158, 255, 0.12);
        border: 1px solid rgba(64, 158, 255, 0.3);
        color: #409EFF;
        font-size: 13px;
        padding: 6px 16px;
        border-radius: 20px;
        pointer-events: none;
        i { margin-right: 4px; }
      }

      .balance-quick-enter {
        position: absolute;
        top: 12px;
        right: 20px;
        z-index: 20;
      }

      // 使3D组件填满剩余空间
      > * { flex: 1; }
      > .level-tip, > .balance-quick-enter { flex: none; }
    }

    // 货架层级布局（原有三栏布局）
    .page-content-shelf {
      display: flex;
      gap: 16px;
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
}
</style>
