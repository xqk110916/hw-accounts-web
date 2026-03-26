<template>
  <div class="warehouse-map">
    <div class="map-header">
      <span class="title">平面图</span>
    </div>

    <!-- 平衡区切换 -->
    <div class="area-section" v-if="balanceAreas && balanceAreas.length">
      <div class="section-label">平衡区</div>
      <div class="area-list">
        <div
          v-for="area in balanceAreas"
          :key="area.id"
          class="area-tag"
          :class="{ 'active': selectedAreaId === area.id }"
          @click="handleAreaSelect(area)"
        >
          <span class="area-dot" :style="{ background: areaColorHex(area.color) }"></span>
          {{ area.name }}
        </div>
      </div>
    </div>

    <!-- 库房列表 -->
    <div class="section-label" style="margin-top: 12px">库房</div>
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
    },
    balanceAreas: {
      type: Array,
      default: () => []
    },
    selectedAreaId: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleSelect(warehouse) {
      this.$emit('select', warehouse);
    },
    handleAreaSelect(area) {
      this.$emit('select-area', area);
    },
    areaColorHex(color) {
      if (!color) return '#409EFF';
      return '#' + color.toString(16).padStart(6, '0');
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
  overflow-y: auto;

  .map-header {
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
    flex-shrink: 0;

    .title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }

  .section-label {
    font-size: 12px;
    color: #909399;
    font-weight: 500;
    margin-bottom: 8px;
    flex-shrink: 0;
  }

  // 平衡区标签组
  .area-section {
    flex-shrink: 0;
    margin-bottom: 4px;

    .area-list {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .area-tag {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 7px 10px;
        border-radius: 6px;
        font-size: 13px;
        color: #606266;
        background: #f5f7fa;
        cursor: pointer;
        border: 1.5px solid transparent;
        transition: all 0.25s;

        &:hover {
          background: #ecf5ff;
          color: #409EFF;
        }

        &.active {
          background: #ecf5ff;
          border-color: #409EFF;
          color: #409EFF;
          font-weight: 600;
        }

        .area-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
        }
      }
    }
  }

  .warehouse-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  .warehouse-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: #f5f7fa;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    flex-shrink: 0;

    &:hover {
      background: #ecf5ff;
      transform: translateX(4px);
    }

    &.active {
      background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
      border-color: #409EFF;

      .warehouse-icon i { color: #fff; }
      .warehouse-name { color: #fff; }
      .warehouse-desc { color: rgba(255, 255, 255, 0.8); }
    }

    .warehouse-icon {
      width: 36px;
      height: 36px;
      background: rgba(64, 158, 255, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      i { font-size: 18px; color: #409EFF; }
    }

    .warehouse-info {
      flex: 1;
      min-width: 0;

      .warehouse-name {
        font-size: 13px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .warehouse-desc {
        font-size: 11px;
        color: #909399;
      }
    }
  }
}
</style>
