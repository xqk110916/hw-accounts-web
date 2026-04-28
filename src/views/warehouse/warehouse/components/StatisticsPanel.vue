<template>
  <div class="floating-panel" :class="{ 'collapsed': collapsed }">
    <div class="panel-toggle" @click="togglePanel">
      <i :class="collapsed ? 'el-icon-arrow-left' : 'el-icon-arrow-right'"></i>
      <span>{{ collapsed ? '统计信息' : '收起' }}</span>
    </div>
    <div class="panel-content" v-show="!collapsed">
      <div class="side-by-side">
        
        <!-- 左侧：库房容量 -->
        <div class="panel-section warehouse-section">
          <div class="section-title">库房容量</div>
          <div class="warehouse-capacity-list">
            <div 
              v-for="wh in computedWarehouseStats" 
              :key="wh.id" 
              class="warehouse-capacity-item"
            >
              <div class="wh-name">{{ wh.name }}</div>
              <div class="wh-progress">
                <el-progress 
                  :percentage="wh.usageRate" 
                  :stroke-width="10" 
                  :show-text="false"
                  color="#1862df"
                ></el-progress>
              </div>
              <div class="wh-percentage">{{ wh.usageRate }}%</div>
              <div class="wh-ratio">{{ wh.stock }}/{{ wh.capacity }}</div>
            </div>
          </div>
        </div>
        
        <!-- 右侧：产品统计 -->
        <div class="panel-section product-section">
          <div class="product-header">
            <div class="section-title">产品统计</div>
            <div class="stat-toggle">
              <el-radio-group v-model="statsType" size="small" @change="updateChart">
                <el-radio-button label="quantity">
                  <i class="el-icon-s-data"></i> 按数量
                </el-radio-button>
                <el-radio-button label="weight">
                  <i class="el-icon-s-finance"></i> 按重量
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="pie-chart-container" ref="pieChart"></div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'StatisticsPanel',
  props: {
    dateColorMap: {
      type: Object,
      default: () => ({})
    },
    containerStats: {
      type: Object,
      default: () => ({})
    },
    warehouseList: {
      type: Array,
      default: () => []
    },
    currentWarehouse: {
      type: Object,
      default: null
    },
    shelves: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      collapsed: true,
      statsType: 'quantity',
      chartInstance: null
    };
  },
  computed: {
    // 库房的详细统计，用于左侧的库房容量进度条
    computedWarehouseStats() {
      const current = this.currentWarehouse || this.warehouseList[0];
      if (!current) return [];
      const shelves = this.shelves || [];
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
        
      return [{
        id: current.id,
        name: current.name,
        capacity,
        stock,
        usageRate: capacity > 0 ? Math.round((stock / capacity) * 100) : 0
      }];
    },
    
    // 用于右侧产品统计的数据聚合
    productPieData() {
      const productMap = {};
      
      this.getContainersFromShelves(this.shelves).forEach(container => {
        const materialName = container.materialName || container.materialCode;
        if (materialName) {
          if (!productMap[materialName]) {
            productMap[materialName] = { quantity: 0, weight: 0 };
          }
          productMap[materialName].quantity += 1;
          productMap[materialName].weight += Number(container.netWeight || container.grossWeight || 0) || 0;
        }
      });
      
      return Object.keys(productMap).map(name => ({
        name: name,
        value: this.statsType === 'quantity' ? productMap[name].quantity : productMap[name].weight,
        quantity: productMap[name].quantity,
        weight: productMap[name].weight
      })).sort((a, b) => b.value - a.value);
    }
  },
  created() {
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
    window.addEventListener('resize', this.resizeChart);
  },
  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }
    window.removeEventListener('resize', this.resizeChart);
  },
  watch: {
    productPieData: {
      handler() {
        this.updateChart();
      },
      deep: true
    }
  },
  methods: {
    getContainersFromShelves(shelves) {
      const containers = [];
      (shelves || []).forEach(shelf => {
        (shelf.layers || []).forEach(layer => {
          (layer.containers || []).forEach(container => {
            if (container && (container.materialCode || String(container.status) === '1')) {
              containers.push(container);
            }
          });
        });
      });
      return containers;
    },
    togglePanel() {
      this.collapsed = !this.collapsed;
      if (!this.collapsed) {
        this.$nextTick(() => {
          this.resizeChart();
        });
      }
    },
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
          formatter: (params) => {
            return `${params.name}<br/>${this.statsType === 'quantity' ? '数量' : '重量'}: ${params.value} ${this.statsType === 'quantity' ? '个' : 'kg'} (${params.percent}%)`;
          }
        },
        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
        series: [
          {
            name: '产品统计',
            type: 'pie',
            radius: ['0%', '75%'],
            center: ['50%', '50%'],
            data: this.productPieData,
            label: {
              formatter: '{b}\n{c}',
              lineHeight: 18,
              fontSize: 12
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      
      this.chartInstance.setOption(option);
    },
    resizeChart() {
      if (this.chartInstance) {
        this.chartInstance.resize();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.floating-panel {
  position: absolute; /* Changed to absolute to stay within container, or use fixed if needed */
  top: 60px;
  right: 5px;
  width: 900px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transition: all 0.3s ease;
  
  &.collapsed {
    width: auto;
    
    .panel-content {
      display: none;
    }
    
    .panel-toggle {
      padding: 10px;
      
      span {
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
    background: #fdfdfd;
    border-radius: 4px 4px 0 0;
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
    padding: 20px;
  }
  
  .side-by-side {
    display: flex;
    gap: 40px;
  }
  
  .panel-section {
    flex: 1;
  }
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
  }
  
  /* 左侧：库房容量 */
  .warehouse-capacity-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .warehouse-capacity-item {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #333;
    
    .wh-name {
      width: 70px;
      font-weight: 600;
    }
    
    .wh-progress {
      flex: 1;
      margin: 0 15px;
      /* Remove default border-radius to match flat design if needed */
      ::v-deep .el-progress-bar__outer {
        border-radius: 0;
        background-color: #f0f0f0;
      }
      ::v-deep .el-progress-bar__inner {
        border-radius: 0;
      }
    }
    
    .wh-percentage {
      width: 40px;
      text-align: right;
      font-weight: 600;
      margin-right: 15px;
    }
    
    .wh-ratio {
      width: 65px;
      text-align: right;
      font-weight: 600;
    }
  }
  
  /* 右侧：产品统计 */
  .product-section {
    display: flex;
    flex-direction: column;
  }
  
  .product-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    
    .section-title {
      margin-bottom: 0;
    }
  }
  
  .pie-chart-container {
    height: 250px;
    width: 100%;
  }
}
</style>
