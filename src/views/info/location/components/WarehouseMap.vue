<template>
  <div class="warehouse-map">
    <div class="map-header">
      <span class="title">库房平面图</span>
    </div>
    <div class="warehouse-list">
      <div
        v-for="warehouse in warehouses"
        :key="warehouse.id"
        class="warehouse-item"
        :class="{ 'active': selectedId === warehouse.id }"
        @click="handleSelect(warehouse)"
      >
        <div class="warehouse-icon">
          <i class="el-icon-office-building"></i>
        </div>
        <div class="warehouse-info">
          <div class="warehouse-name">{{ warehouse.name }}</div>
          <div class="warehouse-desc">{{ warehouse.width }}m × {{ warehouse.height }}m</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WarehouseMap',
  props: {
    warehouses: {
      type: Array,
      default: () => []
    },
    selectedId: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleSelect(warehouse) {
      this.$emit('select', warehouse);
    }
  }
};
</script>

<style lang="scss" scoped>
.warehouse-map {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  
  .map-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;
    
    .title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .warehouse-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .warehouse-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    
    &:hover {
      background: #ecf5ff;
      transform: translateX(4px);
    }
    
    &.active {
      background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
      border-color: #409EFF;
      
      .warehouse-icon i {
        color: #fff;
      }
      
      .warehouse-name {
        color: #fff;
      }
      
      .warehouse-desc {
        color: rgba(255, 255, 255, 0.8);
      }
    }
    
    .warehouse-icon {
      width: 40px;
      height: 40px;
      background: rgba(64, 158, 255, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      i {
        font-size: 20px;
        color: #409EFF;
      }
    }
    
    .warehouse-info {
      flex: 1;
      
      .warehouse-name {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }
      
      .warehouse-desc {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
