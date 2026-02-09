<template>
  <div class="shelf-view-3d">
    <div class="view-header">
      <h3 class="shelf-title">
        <i class="el-icon-s-grid"></i>
        {{ shelfName || '货架视图' }}
      </h3>
      <div class="view-controls">
        <el-button-group size="mini">
          <el-button 
            :type="viewMode === 'front' ? 'primary' : 'default'"
            @click="viewMode = 'front'"
          >正视图</el-button>
          <el-button 
            :type="viewMode === '3d' ? 'primary' : 'default'"
            @click="viewMode = '3d'"
          >立体图</el-button>
        </el-button-group>
      </div>
    </div>

    <div class="shelf-container" :class="viewMode">
      <!-- 3D 货架 -->
      <div class="shelf-3d-wrapper">
        <div class="shelf-structure">
          <!-- 货架层 -->
          <div 
            v-for="layer in reversedLayers" 
            :key="layer.level"
            class="shelf-layer"
            :class="{ 'selected': selectedLayer === layer.level }"
            @click="handleLayerClick(layer)"
          >
            <div class="layer-label">第{{ layer.level }}层</div>
            <div class="layer-containers">
              <div
                v-for="container in layer.containers"
                :key="container.id"
                class="container-slot"
                :style="{ backgroundColor: getContainerColor(container) }"
                :class="{ 'empty': !container.materialCode }"
                @click.stop="handleContainerClick(container)"
                @mouseenter="showContainerInfo(container, $event)"
                @mouseleave="hideContainerInfo"
              >
                <div class="container-visual">
                  <div class="container-cap"></div>
                  <div class="container-body">
                    <span class="material-name">{{ container.materialName || '空' }}</span>
                  </div>
                  <div class="container-base"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 货架支柱 -->
          <div class="shelf-frame">
            <div class="frame-left"></div>
            <div class="frame-right"></div>
          </div>
          
          <!-- 货架底座 -->
          <div class="shelf-base">
            <div class="base-surface"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 容器详情弹出框 -->
    <div 
      v-if="containerTooltip.visible" 
      class="container-tooltip"
      :style="{ left: containerTooltip.x + 'px', top: containerTooltip.y + 'px' }"
    >
      <div class="tooltip-header">
        <span class="container-icon">🛢️</span>
        <span>{{ containerTooltip.container.code || '容器' }}</span>
      </div>
      <div class="tooltip-body">
        <div class="info-row">
          <span class="label">物料代码:</span>
          <span class="value">{{ containerTooltip.container.materialCode || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">物料名称:</span>
          <span class="value">{{ containerTooltip.container.materialName || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">入库时间:</span>
          <span class="value">{{ containerTooltip.container.storageDate || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">物料类型:</span>
          <span class="value">{{ containerTooltip.container.materialType || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!layers || layers.length === 0" class="empty-state">
      <i class="el-icon-box"></i>
      <p>请选择货架查看详情</p>
    </div>
  </div>
</template>

<script>
import { getColorByDate } from '../utils/colorHelper';

export default {
  name: 'ShelfView3D',
  props: {
    shelfName: {
      type: String,
      default: ''
    },
    layers: {
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
      viewMode: '3d', // 'front' 或 '3d'
      selectedLayer: null,
      containerTooltip: {
        visible: false,
        x: 0,
        y: 0,
        container: {}
      }
    };
  },
  computed: {
    reversedLayers() {
      // 从上到下排列（第3层在最上面）
      return [...this.layers].sort((a, b) => b.level - a.level);
    }
  },
  methods: {
    getContainerColor(container) {
      if (!container || !container.storageDate) {
        return '#e0e0e0';
      }
      return this.dateColorMap[container.storageDate] || getColorByDate(container.storageDate);
    },
    handleLayerClick(layer) {
      this.selectedLayer = layer.level;
      this.$emit('layer-select', layer);
    },
    handleContainerClick(container) {
      this.$emit('container-click', container);
    },
    showContainerInfo(container, event) {
      const rect = this.$el.getBoundingClientRect();
      this.containerTooltip = {
        visible: true,
        x: event.clientX - rect.left + 15,
        y: event.clientY - rect.top - 10,
        container: container
      };
    },
    hideContainerInfo() {
      this.containerTooltip.visible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.shelf-view-3d {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 20px;
  min-height: 400px;
  position: relative;
  overflow: hidden;

  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .shelf-title {
      margin: 0;
      color: #fff;
      font-size: 16px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      
      i {
        color: #67C23A;
      }
    }
  }

  .shelf-container {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    min-height: 320px;
    perspective: 1000px;
    
    &.front {
      .shelf-3d-wrapper {
        transform: rotateX(0deg) rotateY(0deg);
      }
    }
    
    &.3d {
      .shelf-3d-wrapper {
        transform: rotateX(15deg) rotateY(-20deg);
      }
    }
  }

  .shelf-3d-wrapper {
    transform-style: preserve-3d;
    transition: transform 0.5s ease;
  }

  .shelf-structure {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 20px;
  }

  .shelf-layer {
    display: flex;
    align-items: center;
    background: linear-gradient(180deg, #4a5568 0%, #2d3748 100%);
    border-radius: 4px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    
    &:hover {
      background: linear-gradient(180deg, #5a6778 0%, #3d4758 100%);
      transform: translateX(5px);
    }
    
    &.selected {
      border-color: #E6A23C;
      box-shadow: 0 0 20px rgba(230, 162, 60, 0.3);
    }
    
    .layer-label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
      min-width: 50px;
      text-align: center;
      padding-right: 12px;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .layer-containers {
      display: flex;
      gap: 12px;
      padding-left: 12px;
      flex: 1;
      justify-content: center;
    }
  }

  .container-slot {
    width: 70px;
    height: 80px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      transform: scale(1.08);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      z-index: 10;
    }
    
    &.empty {
      background: rgba(255, 255, 255, 0.1) !important;
      border: 2px dashed rgba(255, 255, 255, 0.2);
    }
    
    .container-visual {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      height: 100%;
      padding: 4px;
      
      .container-cap {
        width: 30px;
        height: 8px;
        background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%);
        border-radius: 3px 3px 0 0;
      }
      
      .container-body {
        flex: 1;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        
        .material-name {
          color: #fff;
          font-size: 10px;
          text-align: center;
          padding: 2px 4px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          word-break: break-all;
          line-height: 1.2;
        }
      }
      
      .container-base {
        width: 50px;
        height: 6px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 0 0 4px 4px;
      }
    }
  }

  .shelf-frame {
    position: absolute;
    top: 0;
    bottom: 30px;
    left: 0;
    right: 0;
    pointer-events: none;
    
    .frame-left,
    .frame-right {
      position: absolute;
      width: 8px;
      height: 100%;
      background: linear-gradient(90deg, #718096 0%, #4a5568 100%);
      border-radius: 2px;
    }
    
    .frame-left {
      left: 0;
    }
    
    .frame-right {
      right: 0;
    }
  }

  .shelf-base {
    margin-top: 8px;
    
    .base-surface {
      height: 20px;
      background: linear-gradient(180deg, #4a5568 0%, #2d3748 100%);
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }

  .container-tooltip {
    position: absolute;
    background: rgba(255, 255, 255, 0.98);
    border-radius: 8px;
    padding: 12px 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    z-index: 100;
    pointer-events: none;
    min-width: 180px;
    
    .tooltip-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ebeef5;
      
      .container-icon {
        font-size: 18px;
      }
    }
    
    .tooltip-body {
      .info-row {
        display: flex;
        justify-content: space-between;
        margin: 6px 0;
        font-size: 12px;
        
        .label {
          color: #909399;
        }
        
        .value {
          color: #303133;
          font-weight: 500;
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: rgba(255, 255, 255, 0.5);
    
    i {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    p {
      font-size: 14px;
    }
  }
}
</style>
