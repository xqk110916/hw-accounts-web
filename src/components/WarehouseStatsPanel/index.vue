<template>
  <div class="warehouse-stats-panel" :class="{ 'panel-vertical': vertical }">
    <!-- 库房容量 -->
    <div class="stats-section warehouse-section">
      <div class="section-title-bar">
        <span class="section-title">库房容量</span>
      </div>
      <div class="warehouse-capacity-list" v-loading="capacityLoading">
        <div
          v-for="(wh, index) in warehouseStats"
          :key="wh.id || index"
          class="warehouse-capacity-item"
        >
          <div v-if="showRank" class="wh-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
          <div class="wh-name" :title="wh.name">{{ wh.name }}</div>
          <div class="wh-progress">
            <el-progress
              :percentage="wh.usageRate"
              :stroke-width="8"
              :show-text="false"
              color="#1862df"
            ></el-progress>
          </div>
          <div class="wh-percentage">{{ wh.usageRate }}%</div>
          <div class="wh-ratio">{{ wh.stock }}/{{ wh.capacity }}</div>
        </div>
        <el-empty v-if="!warehouseStats || warehouseStats.length === 0" description="暂无数据" :image-size="60"></el-empty>
      </div>
    </div>

    <!-- 材料统计 -->
    <div class="stats-section product-section">
      <div class="section-title-bar">
        <span class="section-title">材料统计</span>
        <el-radio-group v-model="localChartType" size="small" @change="handleChartTypeChange">
          <el-radio-button label="quantity">
            <i class="el-icon-s-data"></i> 按数量
          </el-radio-button>
          <el-radio-button label="weight">
            <i class="el-icon-s-finance"></i> 按重量
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="pie-chart-container" ref="pieChart" v-loading="chartLoading"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'WarehouseStatsPanel',
  props: {
    warehouseStats: {
      type: Array,
      default: () => []
    },
    productData: {
      type: Array,
      default: () => []
    },
    chartType: {
      type: String,
      default: 'quantity'
    },
    showRank: {
      type: Boolean,
      default: false
    },
    vertical: {
      type: Boolean,
      default: false
    },
    capacityLoading: {
      type: Boolean,
      default: false
    },
    chartLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      chartInstance: null,
      localChartType: this.chartType
    };
  },
  watch: {
    chartType(val) {
      this.localChartType = val;
    },
    pieChartData: {
      handler() {
        this.$nextTick(() => this.updateChart());
      },
      deep: true
    }
  },
  computed: {
    pieChartData() {
      return this.productData.map(item => ({
        name: item.name,
        value: this.localChartType === 'quantity' ? item.quantity : item.weight
      })).filter(item => item.value > 0);
    }
  },
  mounted() {
    this.$nextTick(() => this.initChart());
    window.addEventListener('resize', this.resizeChart);
  },
  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }
    window.removeEventListener('resize', this.resizeChart);
  },
  methods: {
    initChart() {
      if (!this.$refs.pieChart) return;
      this.chartInstance = echarts.init(this.$refs.pieChart);
      this.updateChart();
    },
    updateChart() {
      if (!this.chartInstance) return;
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}<br/>{c} ({d}%)'
        },
        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
        series: [{
          name: '材料统计',
          type: 'pie',
          radius: ['15%', '85%'],
          center: ['50%', '50%'],
          data: this.pieChartData,
          label: {
            formatter: '{b}\n{c}',
            fontSize: 12,
            lineHeight: 16
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2
          }
        }]
      };
      this.chartInstance.setOption(option);
    },
    resizeChart() {
      if (this.chartInstance) this.chartInstance.resize();
    },
    handleChartTypeChange(val) {
      this.$emit('update:chartType', val);
    }
  }
};
</script>

<style lang="scss" scoped>
.warehouse-stats-panel {
  display: flex;
  gap: 20px;

  &.panel-vertical {
    flex-direction: column;
  }
}

.stats-section {
  flex: 1;
  min-width: 0;
}

.section-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
}

.warehouse-capacity-list {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 6px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #e4e7ed; border-radius: 2px; }
  &::-webkit-scrollbar-track { background: transparent; }
}

.warehouse-capacity-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #606266;
  padding: 10px 0;
  border-bottom: 1px solid #f5f7fa;

  &:last-child { border-bottom: none; }

  .wh-rank {
    width: 18px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    border-radius: 50%;
    font-size: 11px;
    font-weight: bold;
    color: #909399;
    background-color: #f4f4f5;
    margin-right: 8px;
    flex-shrink: 0;

    &.rank-1 { color: #fff; background-color: #f56c6c; }
    &.rank-2 { color: #fff; background-color: #e6a23c; }
    &.rank-3 { color: #fff; background-color: #409eff; }
  }

  .wh-name {
    width: 110px;
    font-weight: 500;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .wh-progress {
    flex: 1;
    margin: 0 15px;

    ::v-deep .el-progress-bar__outer {
      border-radius: 4px;
      background-color: #ebeef5;
    }
    ::v-deep .el-progress-bar__inner {
      border-radius: 4px;
      transition: width 0.6s ease;
    }
  }

  .wh-percentage {
    width: 40px;
    text-align: right;
    font-weight: 500;
    margin-right: 15px;
  }

  .wh-ratio {
    width: 65px;
    text-align: right;
    font-weight: 500;
    color: #909399;
  }
}

.pie-chart-container {
  width: 100%;
  height: 250px;
}
</style>
