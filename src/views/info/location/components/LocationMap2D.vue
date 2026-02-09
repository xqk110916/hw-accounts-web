<template>
  <div class="location-map-2d">
    <div class="map-header">
      <div class="warehouse-info">
        <span class="warehouse-name">{{ warehouseName }}</span>
        <span class="warehouse-size">尺寸: {{ warehouseWidth }}m × {{ warehouseHeight }}m</span>
      </div>
      <div class="map-scale">
        <div class="scale-bar"></div>
        <span>1米</span>
      </div>
    </div>
    
    <div class="map-container" ref="mapContainer">
      <div 
        class="warehouse-floor"
        :style="floorStyle"
      >
        <!-- 货架网格 -->
        <div
          v-for="shelf in shelves"
          :key="shelf.id"
          class="shelf-item"
          :style="getShelfStyle(shelf)"
          :class="{ 'selected': selectedShelf && selectedShelf.id === shelf.id }"
          @click="handleShelfClick(shelf)"
          @mouseenter="handleShelfHover(shelf, $event)"
          @mouseleave="handleShelfLeave"
        >
          <div class="shelf-label">{{ shelf.name }}</div>
          <!-- 容器格子 -->
          <div class="container-grid">
            <div
              v-for="container in shelf.containers"
              :key="container.id"
              class="container-cell"
              :style="{ backgroundColor: getContainerColor(container) }"
              :title="getContainerTooltip(container)"
            >
              <span class="container-code">{{ container.materialName || '-' }}</span>
            </div>
          </div>
        </div>
        
        <!-- 过道标记 -->
        <div 
          v-for="(aisle, index) in aisles" 
          :key="'aisle-' + index"
          class="aisle"
          :style="getAisleStyle(aisle)"
        >
          <span class="aisle-label">通道</span>
        </div>
      </div>
    </div>
    
    <!-- 悬浮信息框 -->
    <div 
      v-if="hoverInfo.visible" 
      class="hover-tooltip"
      :style="{ left: hoverInfo.x + 'px', top: hoverInfo.y + 'px' }"
    >
      <div class="tooltip-title">{{ hoverInfo.shelf.name }}</div>
      <div class="tooltip-content">
        <p>位置: ({{ hoverInfo.shelf.position.x }}m, {{ hoverInfo.shelf.position.y }}m)</p>
        <p>容器数量: {{ hoverInfo.shelf.containers ? hoverInfo.shelf.containers.length : 0 }}</p>
        <p>货架层数: {{ hoverInfo.shelf.layerCount || 3 }}层</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getColorByDate, generateDateColorMap } from '../utils/colorHelper';

export default {
  name: 'LocationMap2D',
  props: {
    warehouseName: {
      type: String,
      default: '库房'
    },
    warehouseWidth: {
      type: Number,
      default: 20
    },
    warehouseHeight: {
      type: Number,
      default: 15
    },
    shelves: {
      type: Array,
      default: () => []
    },
    dateColorMap: {
      type: Object,
      default: () => ({})
    },
    scale: {
      type: Number,
      default: 30 // 每米对应的像素数
    }
  },
  data() {
    return {
      selectedShelf: null,
      hoverInfo: {
        visible: false,
        x: 0,
        y: 0,
        shelf: {}
      }
    };
  },
  computed: {
    floorStyle() {
      return {
        width: this.warehouseWidth * this.scale + 'px',
        height: this.warehouseHeight * this.scale + 'px'
      };
    },
    aisles() {
      // 生成通道位置
      return [
        { x: this.warehouseWidth / 2 - 1, y: 0, width: 2, height: this.warehouseHeight }
      ];
    }
  },
  methods: {
    getShelfStyle(shelf) {
      return {
        left: shelf.position.x * this.scale + 'px',
        top: shelf.position.y * this.scale + 'px',
        width: (shelf.width || 2) * this.scale + 'px',
        height: (shelf.height || 1.5) * this.scale + 'px'
      };
    },
    getAisleStyle(aisle) {
      return {
        left: aisle.x * this.scale + 'px',
        top: aisle.y * this.scale + 'px',
        width: aisle.width * this.scale + 'px',
        height: aisle.height * this.scale + 'px'
      };
    },
    getContainerColor(container) {
      if (!container || !container.storageDate) {
        return '#e0e0e0';
      }
      return this.dateColorMap[container.storageDate] || getColorByDate(container.storageDate);
    },
    getContainerTooltip(container) {
      if (!container) return '';
      return `容器: ${container.code}\n物料: ${container.materialName || '-'}\n入库时间: ${container.storageDate || '-'}`;
    },
    handleShelfClick(shelf) {
      this.selectedShelf = shelf;
      this.$emit('shelf-select', shelf);
    },
    handleShelfHover(shelf, event) {
      const rect = this.$refs.mapContainer.getBoundingClientRect();
      this.hoverInfo = {
        visible: true,
        x: event.clientX - rect.left + 15,
        y: event.clientY - rect.top + 10,
        shelf: shelf
      };
    },
    handleShelfLeave() {
      this.hoverInfo.visible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.location-map-2d {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  position: relative;
  
  .map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;
    
    .warehouse-info {
      .warehouse-name {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-right: 16px;
      }
      .warehouse-size {
        font-size: 13px;
        color: #909399;
      }
    }
    
    .map-scale {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #606266;
      
      .scale-bar {
        width: 30px;
        height: 4px;
        background: linear-gradient(90deg, #409EFF, #67C23A);
        border-radius: 2px;
      }
    }
  }
  
  .map-container {
    overflow: auto;
    background: #fff;
    border-radius: 6px;
    padding: 20px;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.06);
    position: relative;
  }
  
  .warehouse-floor {
    position: relative;
    background: 
      linear-gradient(90deg, #f0f0f0 1px, transparent 1px),
      linear-gradient(#f0f0f0 1px, transparent 1px);
    background-size: 30px 30px;
    border: 2px solid #dcdfe6;
    border-radius: 4px;
  }
  
  .shelf-item {
    position: absolute;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    overflow: hidden;
    
    &:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
      z-index: 10;
    }
    
    &.selected {
      outline: 3px solid #E6A23C;
      outline-offset: 2px;
    }
    
    .shelf-label {
      position: absolute;
      top: 2px;
      left: 4px;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    .container-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
      padding: 18px 4px 4px 4px;
      height: 100%;
      box-sizing: border-box;
    }
    
    .container-cell {
      flex: 1;
      min-width: 20px;
      min-height: 18px;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .container-code {
        font-size: 8px;
        color: #fff;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
        padding: 0 2px;
      }
    }
  }
  
  .aisle {
    position: absolute;
    background: repeating-linear-gradient(
      45deg,
      #fafafa,
      #fafafa 5px,
      #f0f0f0 5px,
      #f0f0f0 10px
    );
    border: 1px dashed #c0c4cc;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .aisle-label {
      font-size: 12px;
      color: #909399;
      writing-mode: vertical-lr;
      letter-spacing: 4px;
    }
  }
  
  .hover-tooltip {
    position: absolute;
    background: rgba(48, 49, 51, 0.95);
    color: #fff;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 13px;
    z-index: 100;
    pointer-events: none;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    min-width: 160px;
    
    .tooltip-title {
      font-weight: 600;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .tooltip-content p {
      margin: 4px 0;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.85);
    }
  }
}
</style>
