<template>
  <div class="color-legend">
    <div class="legend-header">
      <h4 class="legend-title">
        <i class="el-icon-s-data"></i>
        入库时间图例
      </h4>
      <el-button 
        type="text" 
        size="mini" 
        @click="toggleExpand"
      >
        {{ isExpanded ? '收起' : '展开' }}
        <i :class="isExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
      </el-button>
    </div>
    
    <div class="legend-content" v-show="isExpanded">
      <div class="legend-list" v-if="legendItems.length > 0">
        <div 
          v-for="(item, index) in legendItems" 
          :key="index"
          class="legend-item"
          :class="{ 'active': selectedDate === item.date }"
          @click="handleItemClick(item)"
        >
          <div 
            class="color-block" 
            :style="{ backgroundColor: item.color }"
          ></div>
          <div class="item-info">
            <span class="item-date">{{ item.date }}</span>
            <span class="item-count">{{ item.count }}个容器</span>
          </div>
        </div>
      </div>
      
      <div class="empty-legend" v-else>
        <i class="el-icon-info"></i>
        <span>暂无入库记录</span>
      </div>
      
      <div class="legend-footer" v-if="legendItems.length > 0">
        <div class="total-info">
          <span class="total-label">共计:</span>
          <span class="total-value">{{ totalContainers }}个容器</span>
        </div>
        <el-button 
          v-if="selectedDate"
          type="text"
          size="mini"
          @click="clearSelection"
        >
          清除筛选
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorLegend',
  props: {
    dateColorMap: {
      type: Object,
      default: () => ({})
    },
    containerStats: {
      type: Object,
      default: () => ({})  // { '2026-01-15': 5, '2026-01-16': 3 }
    }
  },
  data() {
    return {
      isExpanded: true,
      selectedDate: null
    };
  },
  computed: {
    legendItems() {
      const items = [];
      const dates = Object.keys(this.containerStats).sort().reverse();
      
      dates.forEach(date => {
        items.push({
          date: date,
          color: this.dateColorMap[date] || '#e0e0e0',
          count: this.containerStats[date]
        });
      });
      
      return items;
    },
    totalContainers() {
      return Object.values(this.containerStats).reduce((sum, count) => sum + count, 0);
    }
  },
  methods: {
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
    },
    handleItemClick(item) {
      if (this.selectedDate === item.date) {
        this.selectedDate = null;
        this.$emit('filter-clear');
      } else {
        this.selectedDate = item.date;
        this.$emit('filter-date', item.date);
      }
    },
    clearSelection() {
      this.selectedDate = null;
      this.$emit('filter-clear');
    }
  }
};
</script>

<style lang="scss" scoped>
.color-legend {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  
  .legend-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    .legend-title {
      margin: 0;
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
      
      i {
        font-size: 16px;
      }
    }
    
    .el-button {
      color: rgba(255, 255, 255, 0.9);
      padding: 0;
      
      &:hover {
        color: #fff;
      }
    }
  }
  
  .legend-content {
    padding: 12px;
    max-height: 300px;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 2px;
    }
  }
  
  .legend-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    
    &:hover {
      background: #f5f7fa;
    }
    
    &.active {
      background: #ecf5ff;
      border-color: #409EFF;
    }
    
    .color-block {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      flex-shrink: 0;
    }
    
    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .item-date {
        font-size: 13px;
        color: #303133;
        font-weight: 500;
      }
      
      .item-count {
        font-size: 11px;
        color: #909399;
        margin-top: 2px;
      }
    }
  }
  
  .empty-legend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px;
    color: #909399;
    font-size: 13px;
    
    i {
      font-size: 16px;
    }
  }
  
  .legend-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    margin-top: 12px;
    border-top: 1px solid #ebeef5;
    
    .total-info {
      font-size: 12px;
      
      .total-label {
        color: #909399;
      }
      
      .total-value {
        color: #303133;
        font-weight: 600;
        margin-left: 4px;
      }
    }
  }
}
</style>
