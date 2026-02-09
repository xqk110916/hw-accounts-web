<template>
  <div class="floating-panel" :class="{ 'collapsed': collapsed }">
    <div class="panel-toggle" @click="togglePanel">
      <i :class="collapsed ? 'el-icon-arrow-left' : 'el-icon-arrow-right'"></i>
      <span v-if="collapsed">统计信息</span>
    </div>
    <div class="panel-content" v-show="!collapsed">
      <!-- 库房选择 -->
      <div class="panel-section warehouse-section">
        <h4 class="section-title">
          <i class="el-icon-office-building"></i>
          库房选择
        </h4>
        <div class="warehouse-tags">
          <el-tag
            v-for="wh in warehouseList"
            :key="wh.id"
            :type="selectedWarehouseIds.includes(wh.id) ? '' : 'info'"
            :effect="selectedWarehouseIds.includes(wh.id) ? 'dark' : 'plain'"
            :closable="selectedWarehouseIds.includes(wh.id) && selectedWarehouseIds.length > 1"
            size="small"
            class="warehouse-tag"
            @click="toggleWarehouse(wh.id)"
            @close.stop="removeWarehouse(wh.id)"
          >
            {{ wh.name }}
          </el-tag>
        </div>
      </div>
      
      <div class="panel-divider"></div>
      
      <!-- 并排显示: 入库时间图例 + 库容库存统计 -->
      <div class="side-by-side">
        <!-- 颜色图例 -->
        <div class="panel-section legend-section">
          <h4 class="section-title">
            <i class="el-icon-time"></i>
            入库时间图例
          </h4>
          <ColorLegend
            :date-color-map="filteredDateColorMap"
            :container-stats="filteredContainerStats"
            @filter-date="$emit('filter-date', $event)"
            @filter-clear="$emit('filter-clear')"
          />
        </div>
        
        <!-- 库房统计 -->
        <div class="panel-section stats-section">
          <h4 class="section-title">
            <i class="el-icon-data-analysis"></i>
            库容库存统计
          </h4>
          
          <!-- 单个库房统计 -->
          <div class="warehouse-stats-list">
            <div 
              v-for="wh in selectedWarehouseStats" 
              :key="wh.id" 
              class="warehouse-stat-card"
            >
              <div class="warehouse-name">{{ wh.name }}</div>
              <div class="stat-grid">
                <div class="stat-cell">
                  <span class="label">货架</span>
                  <span class="value">{{ wh.shelfCount }}</span>
                </div>
                <div class="stat-cell">
                  <span class="label">库容</span>
                  <span class="value">{{ wh.capacity }}</span>
                </div>
                <div class="stat-cell">
                  <span class="label">库存</span>
                  <span class="value">{{ wh.stock }}</span>
                </div>
                <div class="stat-cell">
                  <span class="label">未使用</span>
                  <span class="value warning">{{ wh.capacity - wh.stock }}</span>
                </div>
                <div class="stat-cell">
                  <span class="label">使用率</span>
                  <span class="value highlight">{{ wh.usageRate }}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 汇总统计 -->
          <div class="summary-section" v-if="selectedWarehouseIds.length > 0">
            <div class="summary-title">
              <i class="el-icon-s-data"></i>
              汇总 ({{ selectedWarehouseIds.length }}个库房)
            </div>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">总货架</span>
                <span class="value">{{ summaryStats.totalShelves }}</span>
              </div>
              <div class="summary-item">
                <span class="label">总库容</span>
                <span class="value">{{ summaryStats.totalCapacity }}</span>
              </div>
              <div class="summary-item">
                <span class="label">总库存</span>
                <span class="value">{{ summaryStats.totalStock }}</span>
              </div>
              <div class="summary-item">
                <span class="label">未使用</span>
                <span class="value" style="color: #ffa500;">{{ summaryStats.totalCapacity - summaryStats.totalStock }}</span>
              </div>
              <div class="summary-item">
                <span class="label">总使用率</span>
                <span class="value highlight">{{ summaryStats.totalUsageRate }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ColorLegend from './ColorLegend.vue';
import { getWarehouseList, getWarehouseById } from '../config/warehouseConfig';

export default {
  name: 'StatisticsPanel',
  components: {
    ColorLegend
  },
  props: {
    dateColorMap: {
      type: Object,
      default: () => ({})
    },
    containerStats: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      collapsed: true,
      warehouseList: [],
      selectedWarehouseIds: []
    };
  },
  computed: {
    // 选中库房的详细统计
    selectedWarehouseStats() {
      return this.selectedWarehouseIds.map(id => {
        const warehouse = getWarehouseById(id);
        if (!warehouse) return null;
        
        const shelves = warehouse.shelves || [];
        let capacity = 0;
        let stock = 0;
        
        shelves.forEach(shelf => {
          if (shelf.layers) {
            shelf.layers.forEach(layer => {
              if (layer.containers) {
                layer.containers.forEach(container => {
                  capacity++;
                  if (container.materialCode) {
                    stock++;
                  }
                });
              }
            });
          }
        });
        
        return {
          id: warehouse.id,
          name: warehouse.name,
          shelfCount: shelves.length,
          capacity,
          stock,
          usageRate: capacity > 0 ? Math.round(stock / capacity * 100) : 0
        };
      }).filter(Boolean);
    },
    
    // 基于选中库房过滤的日期颜色映射
    filteredDateColorMap() {
      const allDates = new Set();
      this.selectedWarehouseIds.forEach(id => {
        const warehouse = getWarehouseById(id);
        if (warehouse && warehouse.shelves) {
          warehouse.shelves.forEach(shelf => {
            if (shelf.layers) {
              shelf.layers.forEach(layer => {
                if (layer.containers) {
                  layer.containers.forEach(container => {
                    if (container.storageDate) {
                      allDates.add(container.storageDate);
                    }
                  });
                }
              });
            }
          });
        }
      });
      
      // 只保留选中库房中存在的日期
      const filtered = {};
      allDates.forEach(date => {
        if (this.dateColorMap[date]) {
          filtered[date] = this.dateColorMap[date];
        }
      });
      return filtered;
    },
    
    // 基于选中库房过滤的容器统计
    filteredContainerStats() {
      const stats = {};
      this.selectedWarehouseIds.forEach(id => {
        const warehouse = getWarehouseById(id);
        if (warehouse && warehouse.shelves) {
          warehouse.shelves.forEach(shelf => {
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
        }
      });
      return stats;
    },
    
    // 汇总统计
    summaryStats() {
      const stats = this.selectedWarehouseStats;
      const totalShelves = stats.reduce((sum, wh) => sum + wh.shelfCount, 0);
      const totalCapacity = stats.reduce((sum, wh) => sum + wh.capacity, 0);
      const totalStock = stats.reduce((sum, wh) => sum + wh.stock, 0);
      
      return {
        totalShelves,
        totalCapacity,
        totalStock,
        totalUsageRate: totalCapacity > 0 ? Math.round(totalStock / totalCapacity * 100) : 0
      };
    }
  },
  created() {
    this.warehouseList = getWarehouseList();
    // 默认选中所有库房
    this.selectedWarehouseIds = this.warehouseList.map(wh => wh.id);
  },
  methods: {
    togglePanel() {
      this.collapsed = !this.collapsed;
    },
    toggleWarehouse(id) {
      const index = this.selectedWarehouseIds.indexOf(id);
      if (index > -1) {
        // 至少保留一个库房选中
        if (this.selectedWarehouseIds.length > 1) {
          this.selectedWarehouseIds.splice(index, 1);
        }
      } else {
        this.selectedWarehouseIds.push(id);
      }
    },
    removeWarehouse(id) {
      if (this.selectedWarehouseIds.length > 1) {
        const index = this.selectedWarehouseIds.indexOf(id);
        if (index > -1) {
          this.selectedWarehouseIds.splice(index, 1);
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.floating-panel {
  position: fixed;
  top: 60px;
  right: 5px;
  width: 800px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
  transition: all 0.3s ease;
  
  &.collapsed {
    width: auto;
    
    .panel-content {
      display: none;
    }
    
    .panel-toggle {
      border-radius: 8px;
      padding: 10px;
      
      span {
        display: block;
        writing-mode: vertical-lr;
        margin-top: 8px;
      }
    }
  }
  
  .panel-toggle {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px;
    cursor: pointer;
    color: #409EFF;
    font-size: 14px;
    border-bottom: 1px solid #ebeef5;
    transition: background 0.2s;
    
    &:hover {
      background: #f5f7fa;
    }
    
    i {
      font-size: 16px;
    }
    
    span {
      font-size: 12px;
      margin-top: 4px;
    }
  }
  
  .panel-content {
    padding: 16px;
    max-height: calc(100vh - 150px);
    overflow-y: auto;
  }
  
  // 并排布局
  .side-by-side {
    display: flex;
    gap: 20px;
    
    > .panel-section {
      min-width: 0;
      margin-bottom: 0;
    }
    
    .legend-section {
      flex: 1;
    }
    
    .stats-section {
      flex: 0 0 320px;
    }
  }
  
  .panel-section {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .section-title {
    margin: 0 0 12px 0;
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 6px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
    
    i {
      color: #409EFF;
    }
  }
  
  .panel-divider {
    height: 1px;
    background: #ebeef5;
    margin: 16px 0;
  }
  
  // 库房选择
  .warehouse-section {
    .warehouse-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .warehouse-tag {
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        transform: scale(1.05);
      }
    }
  }
  
  // 库房统计
  .stats-section {
    .section-title i {
      color: #67C23A;
    }
  }
  
  .warehouse-stats-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .warehouse-stat-card {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 12px;
    border: 1px solid #ebeef5;
    
    .warehouse-name {
      font-size: 13px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px dashed #dcdfe6;
    }
    
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    
    .stat-cell {
      text-align: center;
      
      .label {
        display: block;
        font-size: 11px;
        color: #909399;
        margin-bottom: 4px;
      }
      
      .value {
        display: block;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        
        &.highlight {
          color: #409EFF;
        }
        
        &.warning {
          color: #E6A23C;
        }
      }
    }
  }
  
  // 汇总统计
  .summary-section {
    margin-top: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    padding: 14px;
    color: #fff;
    
    .summary-title {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      
      i {
        font-size: 14px;
      }
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    
    .summary-item {
      text-align: center;
      
      .label {
        display: block;
        font-size: 11px;
        opacity: 0.8;
        margin-bottom: 4px;
      }
      
      .value {
        display: block;
        font-size: 18px;
        font-weight: 600;
        
        &.highlight {
          color: #ffd700;
        }
      }
    }
  }
}
</style>
