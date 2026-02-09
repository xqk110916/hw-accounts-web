<template>
  <div class="location-map-2d" ref="mapRoot">
    <div class="map-header">
      <div class="warehouse-info">
        <span class="warehouse-name">{{ warehouseName }}</span>
        <span class="warehouse-size">尺寸: {{ warehouseWidth }}m × {{ warehouseHeight }}m</span>
      </div>
    </div>
    
    <div class="map-container" ref="mapContainer">
      <div 
        class="warehouse-floor"
        :style="floorStyle"
      >
        <!-- 货架卡片 -->
        <div
          v-for="shelf in shelves"
          :key="shelf.id"
          class="shelf-card"
          :style="getShelfStyle(shelf)"
          :class="{ 'selected': selectedShelf && selectedShelf.id === shelf.id }"
          @click="handleShelfClick(shelf)"
        >
          <div class="shelf-header">
            <span class="shelf-name">{{ shelf.name }}</span>
            <span class="shelf-count">{{ getFilledCount(shelf) }}/{{ shelf.layers ? shelf.layers.length * 3 : 9 }}</span>
          </div>
          <div class="shelf-body">
            <!-- 显示容器层级 -->
            <div class="layer-row" v-for="layer in (shelf.layers || []).slice().reverse()" :key="layer.level">
              <div 
                v-for="container in layer.containers" 
                :key="container.id"
                class="container-box"
                :style="{ backgroundColor: getContainerColor(container) }"
                :title="getContainerTooltip(container)"
                @click.stop="handleContainerClick(container)"
              >
                <span class="container-label" v-if="container.materialName">
                  {{ container.materialName.slice(0, 4) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getColorByDate } from '../utils/colorHelper';

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
    }
  },
  data() {
    return {
      selectedShelf: null,
      scale: 30,
      containerWidth: 100,
      containerHeight: 100
    };
  },
  computed: {
    floorStyle() {
      return {
        width: '100%',
        minHeight: '100%',
        position: 'relative'
      };
    }
  },
  mounted() {
    this.updateScale();
    window.addEventListener('resize', this.updateScale);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateScale);
  },
  methods: {
    updateScale() {
      this.$nextTick(() => {
        if (this.$refs.mapContainer) {
          const containerWidth = this.$refs.mapContainer.clientWidth - 40;
          const containerHeight = this.$refs.mapContainer.clientHeight - 40;
          const scaleX = containerWidth / this.warehouseWidth;
          const scaleY = containerHeight / this.warehouseHeight;
          this.scale = Math.min(scaleX, scaleY, 60);
        }
      });
    },
    getShelfStyle(shelf) {
      // 计算货架卡片的大小和位置
      const shelfWidth = (shelf.width || 4) * this.scale;
      const shelfHeight = (shelf.height || 3) * this.scale;
      return {
        left: shelf.position.x * this.scale + 20 + 'px',
        top: shelf.position.y * this.scale + 20 + 'px',
        width: Math.max(shelfWidth, 120) + 'px',
        height: Math.max(shelfHeight, 100) + 'px'
      };
    },
    getContainerColor(container) {
      if (!container || !container.storageDate) {
        return 'rgba(255,255,255,0.3)';
      }
      return this.dateColorMap[container.storageDate] || getColorByDate(container.storageDate);
    },
    getContainerTooltip(container) {
      if (!container || !container.materialName) return '空位';
      return `容器: ${container.code}\n物料: ${container.materialName}\n入库: ${container.storageDate || '-'}`;
    },
    getFilledCount(shelf) {
      let count = 0;
      if (shelf.layers) {
        shelf.layers.forEach(layer => {
          layer.containers.forEach(c => {
            if (c.materialCode) count++;
          });
        });
      }
      return count;
    },
    handleShelfClick(shelf) {
      this.selectedShelf = shelf;
      this.$emit('shelf-select', shelf);
    },
    handleContainerClick(container) {
      if (container && container.materialCode) {
        this.$emit('container-click', container);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.location-map-2d {
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  
  .map-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    flex-shrink: 0;
    
    .warehouse-info {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .warehouse-name {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }
      .warehouse-size {
        font-size: 13px;
        color: #909399;
      }
    }
  }
  
  .map-container {
    flex: 1;
    overflow: auto;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
    padding: 20px;
    min-height: 0;
  }
  
  .warehouse-floor {
    position: relative;
    min-height: 100%;
  }
  
  .shelf-card {
    position: absolute;
    background: linear-gradient(145deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
    display: flex;
    flex-direction: column;
    
    &:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.45);
      z-index: 10;
    }
    
    &.selected {
      outline: 3px solid #E6A23C;
      outline-offset: 2px;
      box-shadow: 0 8px 24px rgba(230, 162, 60, 0.4);
    }
    
    .shelf-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 1px solid rgba(255,255,255,0.2);
      
      .shelf-name {
        font-size: 12px;
        font-weight: 600;
        color: #fff;
      }
      
      .shelf-count {
        font-size: 10px;
        color: rgba(255,255,255,0.8);
        background: rgba(0,0,0,0.2);
        padding: 2px 6px;
        border-radius: 10px;
      }
    }
    
    .shelf-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
      overflow: hidden;
    }
    
    .layer-row {
      display: flex;
      gap: 3px;
      flex: 1;
    }
    
    .container-box {
      flex: 1;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 20px;
      border: 1px solid rgba(255,255,255,0.3);
      transition: all 0.2s;
      
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      
      .container-label {
        font-size: 9px;
        color: #000;
        font-weight: 500;
        text-shadow: 0 1px 2px rgba(255,255,255, 0.5);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
