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
        </el-breadcrumb>
      </div>
      <div class="header-right">
        <el-select 
          v-model="selectedWarehouseId" 
          placeholder="选择库房"
          size="small"
          style="width: 180px"
          @change="handleWarehouseChange"
        >
          <el-option
            v-for="warehouse in warehouseList"
            :key="warehouse.id"
            :label="warehouse.name"
            :value="warehouse.id"
          ></el-option>
        </el-select>
        
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          size="small"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          style="width: 260px"
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

    <!-- 主内容区 -->
    <div class="page-content">
      <!-- 左侧：二维平面图 -->
      <div class="content-left">
        <LocationMap2D
          :warehouse-name="currentWarehouse ? currentWarehouse.name : '库房'"
          :warehouse-width="currentWarehouse ? currentWarehouse.width : 20"
          :warehouse-height="currentWarehouse ? currentWarehouse.height : 15"
          :shelves="displayShelves"
          :date-color-map="dateColorMap"
          @shelf-select="handleShelfSelect"
        />
      </div>
      
      <!-- 右侧：图例 -->
      <div class="content-right">
        <ColorLegend
          :date-color-map="dateColorMap"
          :container-stats="containerStats"
          @filter-date="handleFilterDate"
          @filter-clear="handleFilterClear"
        />
        
        <!-- 库房统计 -->
        <div class="statistics-card">
          <h4 class="card-title">
            <i class="el-icon-data-analysis"></i>
            库房统计
          </h4>
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.totalShelves }}</div>
              <div class="stat-label">货架数量</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ statistics.totalContainers }}</div>
              <div class="stat-label">容器总数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ statistics.usedContainers }}</div>
              <div class="stat-label">已使用</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ statistics.usageRate }}%</div>
              <div class="stat-label">使用率</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部：三维货架视图 -->
    <div class="page-bottom">
      <ShelfView3D
        :shelf-name="selectedShelf ? selectedShelf.name : ''"
        :layers="selectedShelfLayers"
        :date-color-map="dateColorMap"
        @container-click="handleContainerClick"
      />
    </div>

    <!-- 容器详情弹窗 -->
    <el-dialog
      title="容器详情"
      :visible.sync="containerDialogVisible"
      width="500px"
      append-to-body
    >
      <div class="container-detail" v-if="selectedContainer">
        <div class="detail-row">
          <span class="label">容器编号:</span>
          <span class="value">{{ selectedContainer.code }}</span>
        </div>
        <div class="detail-row">
          <span class="label">物料代码:</span>
          <span class="value">{{ selectedContainer.materialCode || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">物料名称:</span>
          <span class="value">{{ selectedContainer.materialName || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">物料类型:</span>
          <span class="value">{{ selectedContainer.materialType || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">入库时间:</span>
          <span class="value">{{ selectedContainer.storageDate || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">所在位置:</span>
          <span class="value">{{ getContainerLocation() }}</span>
        </div>
      </div>
      <span slot="footer">
        <el-button @click="containerDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="viewContainerHistory">查看入库信息</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import LocationMap2D from './components/LocationMap2D.vue';
import ShelfView3D from './components/ShelfView3D.vue';
import ColorLegend from './components/ColorLegend.vue';
import { generateDateColorMap, formatDate } from './utils/colorHelper';

export default {
  name: 'LocationIndex',
  components: {
    LocationMap2D,
    ShelfView3D,
    ColorLegend
  },
  data() {
    return {
      // 基础数据
      currentBalanceArea: '一号平衡区',
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
    // 根据筛选条件显示的货架
    displayShelves() {
      if (!this.filterDate) {
        return this.shelves;
      }
      // 根据日期筛选容器
      return this.shelves.map(shelf => ({
        ...shelf,
        containers: shelf.containers.filter(c => c.storageDate === this.filterDate)
      }));
    },
    // 选中货架的层数据
    selectedShelfLayers() {
      if (!this.selectedShelf) return [];
      return this.selectedShelf.layers || [];
    },
    // 容器统计（按日期分组）
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
        // 兼容扁平容器结构
        if (shelf.containers) {
          shelf.containers.forEach(container => {
            if (container.storageDate) {
              stats[container.storageDate] = (stats[container.storageDate] || 0) + 1;
            }
          });
        }
      });
      return stats;
    }
  },
  created() {
    this.initMockData();
  },
  methods: {
    // 初始化模拟数据
    initMockData() {
      // 模拟库房列表
      this.warehouseList = [
        { id: 'wh001', name: '一号库房', width: 20, height: 15 },
        { id: 'wh002', name: '二号库房', width: 18, height: 12 },
        { id: 'wh003', name: '三号库房', width: 22, height: 16 }
      ];
      
      this.selectedWarehouseId = 'wh001';
      this.currentWarehouse = this.warehouseList[0];
      
      // 模拟货架数据
      this.shelves = this.generateMockShelves();
      
      // 生成颜色映射
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
      
      // 计算统计数据
      this.calculateStatistics();
    },
    
    // 生成模拟货架数据
    generateMockShelves() {
      const shelves = [];
      const materialNames = ['核废料A类', '核废料B类', '放射性废渣', '低放废物', '中放废物'];
      const dates = ['2026-01-10', '2026-01-15', '2026-01-18', '2026-01-22', '2026-01-25', '2026-01-28'];
      
      // 生成6个货架（2行3列）
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          const shelfIndex = row * 3 + col + 1;
          const shelf = {
            id: `shelf_${shelfIndex}`,
            name: `A-${String(shelfIndex).padStart(2, '0')}`,
            position: { 
              x: col * 5 + 1 + (col >= 1 ? 2 : 0), // 中间留通道
              y: row * 5 + 2
            },
            width: 4,
            height: 3,
            layerCount: 3,
            layers: [],
            containers: [] // 扁平结构用于2D展示
          };
          
          // 每层3个容器
          for (let layer = 1; layer <= 3; layer++) {
            const layerData = {
              level: layer,
              containers: []
            };
            
            for (let slot = 1; slot <= 3; slot++) {
              const isEmpty = Math.random() > 0.75; // 25%空位
              const container = {
                id: `container_${shelfIndex}_${layer}_${slot}`,
                code: isEmpty ? '' : `C${shelfIndex}${layer}${slot}`,
                materialCode: isEmpty ? '' : `MAT-${Math.floor(Math.random() * 1000)}`,
                materialName: isEmpty ? '' : materialNames[Math.floor(Math.random() * materialNames.length)],
                materialType: isEmpty ? '' : '放射性物质',
                storageDate: isEmpty ? '' : dates[Math.floor(Math.random() * dates.length)]
              };
              layerData.containers.push(container);
              shelf.containers.push(container);
            }
            
            shelf.layers.push(layerData);
          }
          
          shelves.push(shelf);
        }
      }
      
      return shelves;
    },
    
    // 计算统计数据
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
        totalContainers: totalContainers,
        usedContainers: usedContainers,
        usageRate: totalContainers > 0 ? Math.round(usedContainers / totalContainers * 100) : 0
      };
    },
    
    // 库房切换
    handleWarehouseChange(warehouseId) {
      this.currentWarehouse = this.warehouseList.find(w => w.id === warehouseId);
      this.selectedShelf = null;
      // 实际项目中这里应该调用API获取数据
      this.shelves = this.generateMockShelves();
      this.calculateStatistics();
    },
    
    // 日期范围筛选
    handleDateFilter(dateRange) {
      // 实际项目中根据日期范围筛选数据
      console.log('日期筛选:', dateRange);
    },
    
    // 单日期筛选（来自图例）
    handleFilterDate(date) {
      this.filterDate = date;
    },
    
    // 清除筛选
    handleFilterClear() {
      this.filterDate = null;
    },
    
    // 货架选择
    handleShelfSelect(shelf) {
      this.selectedShelf = shelf;
    },
    
    // 容器点击
    handleContainerClick(container) {
      if (container && container.code) {
        this.selectedContainer = container;
        this.containerDialogVisible = true;
      }
    },
    
    // 获取容器位置描述
    getContainerLocation() {
      if (!this.selectedShelf || !this.selectedContainer) return '-';
      return `${this.currentWarehouse?.name || '库房'} - ${this.selectedShelf.name}`;
    },
    
    // 查看容器入库信息
    viewContainerHistory() {
      this.$message.info('跳转到入库信息页面...');
      // 实际项目中跳转到入库信息页面
      // this.$router.push({ path: '/inventory/history', query: { containerId: this.selectedContainer.id } });
    },
    
    // 导出位置图
    handleExport() {
      this.$message.info('正在生成导出文件...');
      // 实际项目中调用导出API
    }
  }
};
</script>

<style lang="scss" scoped>
.location-page {
  padding: 20px;
  background: #f0f2f5;
  min-height: 100%;
  
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
    margin-bottom: 20px;
    
    .content-left {
      flex: 1;
      min-width: 0;
    }
    
    .content-right {
      width: 280px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  }
  
  .statistics-card {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    
    .card-title {
      margin: 0 0 16px 0;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      display: flex;
      align-items: center;
      gap: 6px;
      
      i {
        color: #67C23A;
      }
    }
    
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .stat-item {
      text-align: center;
      padding: 12px 8px;
      background: #f5f7fa;
      border-radius: 6px;
      
      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: #409EFF;
      }
      
      .stat-label {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }
  
  .page-bottom {
    margin-top: 20px;
  }
  
  .container-detail {
    .detail-row {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid #ebeef5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .label {
        width: 100px;
        color: #909399;
        flex-shrink: 0;
      }
      
      .value {
        color: #303133;
        font-weight: 500;
      }
    }
  }
}
</style>
