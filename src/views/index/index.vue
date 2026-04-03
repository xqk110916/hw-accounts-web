<template>
  <div class="index-wrap">
    <!-- Top Row: Action Buttons and Todo List -->
    <el-row :gutter="20" class="row-container">
      <el-col :span="14">
        <el-card shadow="hover" class="box-card action-wrapper-card" :body-style="{ padding: '20px' }">
          <div class="action-buttons">
            <div class="action-card color-1" @click="handleAction('inbound')">
              <i class="el-icon-receiving"></i>
              <span>入库管理</span>
            </div>
            <div class="action-card color-2" @click="handleAction('inventory')">
              <i class="el-icon-pie-chart"></i>
              <span>盘存管理</span>
            </div>
            <div class="action-card color-3" @click="handleAction('outbound')">
              <i class="el-icon-sell"></i>
              <span>出库管理</span>
            </div>
            <div class="action-card color-4" @click="handleAction('data')">
              <i class="el-icon-data-analysis"></i>
              <span>数据管理</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="10">
        <el-card shadow="hover" class="box-card todo-card">
          <div slot="header" class="todo-header">
            <span :class="activeTodoTab === 'todo' ? 'active-tab' : 'inactive-tab'" @click="changeTodoTab('todo')">待办</span> / 
            <span :class="activeTodoTab === 'done' ? 'active-tab' : 'inactive-tab'" @click="changeTodoTab('done')">已办</span>
          </div>
          <div class="todo-content" v-loading="loadingTodos">
            <ul class="todo-items">
              <li v-for="(item, index) in mockTodos" :key="index">
                <div class="todo-left">
                  <span class="dot" :class="{ 'done-dot': activeTodoTab === 'done' }"></span>
                  <span class="todo-title" :title="'【' + item.type + '】' + item.desc">
                    【{{ item.type }}】{{ item.desc }}
                  </span>
                </div>
                <span class="todo-time">{{ item.time }}</span>
              </li>
            </ul>
            <el-empty v-if="mockTodos.length === 0" description="暂无数据"></el-empty>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Middle Row: Line Chart -->
    <el-row class="row-container">
      <el-col :span="24">
        <el-card shadow="hover" class="box-card">
          <div slot="header" class="section-header">
            <div class="header-left">
              <span class="section-title">出入库统计</span>
              <el-select v-model="inOutStatus" size="small" class="filter-select">
                <el-option label="全部" value="all"></el-option>
              </el-select>
              <el-select v-model="inOutProduct" size="small" class="filter-select-lg">
                <el-option label="选择产品" value="all"></el-option>
              </el-select>
            </div>
            <div class="header-right">
              <el-radio-group v-model="lineChartType" size="small" @change="handleLineChartChange">
                <el-radio-button label="quantity">
                  <i class="el-icon-s-data"></i> 按数量
                </el-radio-button>
                <el-radio-button label="weight">
                  <i class="el-icon-s-finance"></i> 按重量
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="chart-container" ref="lineChart" v-loading="loadingLineChart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Bottom Row: Warehouse Capacity and Product Statistics -->
    <el-row :gutter="20" class="row-container">
      <!-- Left: Warehouse Capacity -->
      <el-col :span="12">
        <el-card shadow="hover" class="box-card stats-card">
          <div slot="header" class="section-header">
            <span class="section-title">库房容量</span>
          </div>
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
                  :stroke-width="8" 
                  :show-text="false"
                  color="#1862df"
                ></el-progress>
              </div>
              <div class="wh-percentage">{{ wh.usageRate }}%</div>
              <div class="wh-ratio">{{ wh.stock }}/{{ wh.capacity }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Right: Product Statistics Pie Chart -->
      <el-col :span="12">
        <el-card shadow="hover" class="box-card stats-card">
          <div slot="header" class="section-header">
            <div class="header-left">
              <span class="section-title">产品统计</span>
              <el-select v-model="pieChartProduct" size="small" class="filter-select">
                <el-option label="全部" value="all"></el-option>
              </el-select>
            </div>
            <div class="header-right">
              <el-radio-group v-model="pieChartType" size="small" @change="handlePieChartChange">
                <el-radio-button label="quantity">
                  <i class="el-icon-s-data"></i> 按数量
                </el-radio-button>
                <el-radio-button label="weight">
                  <i class="el-icon-s-finance"></i> 按重量
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="chart-container pie-container" ref="pieChart" v-loading="loadingPieChart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts';
// 这里复用 warehouseConfig.js 中的模拟数据作为底部统计的数据源
import { getWarehouseList, getWarehouseById } from '../warehouse/warehouse/config/warehouseConfig';

export default {
  name: 'Index',
  components: {},
  data() {
    return {
      // Todo Tab State
      activeTodoTab: 'todo',
      mockTodos: [],
      loadingTodos: false,
      
      // Middle row filters
      inOutStatus: 'all',
      inOutProduct: 'all',
      lineChartType: 'quantity',
      lineChartInstance: null,
      loadingLineChart: false,
      
      // Bottom row filters
      pieChartProduct: 'all',
      pieChartType: 'quantity',
      pieChartInstance: null,
      loadingPieChart: false,
      
      // Warehouse state
      warehouseList: []
    };
  },
  computed: {
    computedWarehouseStats() {
      // Replace generic names with A, B, C etc to match image
      const nameMap = {
        'wh001': '库房A',
        'wh002': '库房B',
        'wh003': '库房C',
        'wh004': '库房D',
        'wh005': '库房E',
        'wh006': '库房F',
      };
      
      let stats = this.warehouseList.map(whConfig => {
        const warehouse = getWarehouseById(whConfig.id);
        if (!warehouse) return null;
        
        let capacity = 0;
        let stock = 0;
        const shelves = warehouse.shelves || [];
        
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
          name: nameMap[warehouse.id] || warehouse.name,
          capacity,
          stock,
          usageRate: capacity > 0 ? Math.round((stock / capacity) * 100) : 0
        };
      }).filter(Boolean);

      // Pad to have 6 warehouses to match image exactly, if not enough
      const required = ['库房A', '库房B', '库房C', '库房D', '库房E', '库房F'];
      if (stats.length < 6) {
        let i = stats.length;
        while (stats.length < 6) {
          stats.push({
            id: 'mock_wh_' + i,
            name: required[i],
            capacity: 253,
            stock: 120,
            usageRate: 60
          });
          i++;
        }
      }
      return stats;
    },
    
    productPieData() {
      // Return dynamically based on pieChartType toggle
      if (this.pieChartType === 'quantity') {
        return [
          { name: '产品1', value: 100 },
          { name: '产品2', value: 150 },
          { name: '产品3', value: 212 },
          { name: '产品4', value: 198 },
          { name: '产品5', value: 218 }
        ];
      } else {
        return [
          { name: '产品1', value: 5400 },
          { name: '产品2', value: 8500 },
          { name: '产品3', value: 11200 },
          { name: '产品4', value: 9200 },
          { name: '产品5', value: 12800 }
        ];
      }
    }
  },
  async activated() {
    this.resizeCharts();
  },
  async created() {
    this.warehouseList = getWarehouseList();
    this.fetchTodoData();
  },
  mounted() {
    this.$nextTick(() => {
      this.initLineChart();
      this.initPieChart();
    });
    window.addEventListener('resize', this.resizeCharts);
  },
  beforeDestroy() {
    if (this.lineChartInstance) {
      this.lineChartInstance.dispose();
      this.lineChartInstance = null;
    }
    if (this.pieChartInstance) {
      this.pieChartInstance.dispose();
      this.pieChartInstance = null;
    }
    window.removeEventListener('resize', this.resizeCharts);
  },
  watch: {
    productPieData: {
      handler() {
        if (this.pieChartInstance) {
          this.updatePieChart();
        }
      },
      deep: true
    }
  },
  methods: {
    handleAction(type) {
      this.$message.info(`Clicked ${type}`);
    },

    changeTodoTab(tab) {
      if (this.activeTodoTab === tab) return;
      this.activeTodoTab = tab;
      this.fetchTodoData();
    },

    fetchTodoData() {
      this.loadingTodos = true;
      // Simulate network request refresh
      setTimeout(() => {
        if (this.activeTodoTab === 'todo') {
          this.mockTodos = [
            { type: '入库信息修改', desc: '任务编号+时间', time: '1分钟前' },
            { type: '出库信息修改', desc: '任务编号+时间', time: '2小时前' },
            { type: '出库审核', desc: '任务编号+时间', time: '1分钟前' },
            { type: '实物盘存', desc: '任务编号+时间', time: '2小时前' },
            { type: 'PAD盘存', desc: '任务编号+时间', time: '2小时前' }
          ];
        } else {
          this.mockTodos = [
            { type: '系统权限审批', desc: '已通过审核，待通知', time: '1天前' },
            { type: '安全检查记录', desc: '消防隐患排查已完成', time: '1天前' },
            { type: '季度库房盘点', desc: '盘点报告已归档保存', time: '3天前' },
            { type: '资产入库核收', desc: '完成接收并记录编号', time: '5天前' }
          ];
        }
        this.loadingTodos = false;
      }, 300);
    },

    handleLineChartChange() {
      this.loadingLineChart = true;
      setTimeout(() => {
        this.updateLineChart();
        this.loadingLineChart = false;
      }, 300);
    },

    handlePieChartChange() {
      this.loadingPieChart = true;
      setTimeout(() => {
        // Computed property productPieData updates automatically
        // Which triggers the watcher -> calls updatePieChart
        this.loadingPieChart = false;
      }, 300);
    },
    
    initLineChart() {
      if (!this.$refs.lineChart) return;
      this.lineChartInstance = echarts.init(this.$refs.lineChart);
      this.updateLineChart();
    },
    
    updateLineChart() {
      if (!this.lineChartInstance) return;
      
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      let data1, data2;

      if (this.lineChartType === 'quantity') {
        data1 = [100, 140, 230, 100, 130, 150, 160, 220, 210, 100, 170, 130];
        data2 = [250, 240, 430, 240, 230, 320, 320, 380, 410, 240, 280, 360];
      } else {
        // Mock weight data (larger numbers conceptually)
        data1 = [1500, 2100, 3450, 1500, 1950, 2250, 2400, 3300, 3150, 1500, 2550, 1950];
        data2 = [3750, 3600, 6450, 3600, 3450, 4800, 4800, 5700, 6150, 3600, 4200, 5400];
      }

      const option = {
        tooltip: { trigger: 'axis' },
        grid: {
          left: '2%',
          right: '3%',
          bottom: '3%',
          top: '5%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: months,
          axisLine: { lineStyle: { color: '#e0e0e0' } },
          axisLabel: { color: '#666' }
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { type: 'dashed', color: '#eaeaea' } },
          axisLabel: {
            formatter: (value) => {
              if (value >= 1000) return (value / 1000) + 'k';
              return value;
            }
          }
        },
        series: [
          {
            name: '入库',
            type: 'line',
            smooth: true,
            symbol: 'emptyCircle',
            symbolSize: 6,
            itemStyle: { color: '#409EFF' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
              ])
            },
            data: data1
          },
          {
            name: '出库',
            type: 'line',
            smooth: true,
            symbol: 'emptyCircle',
            symbolSize: 6,
            itemStyle: { color: '#73dcd1' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(115, 220, 209, 0.3)' },
                { offset: 1, color: 'rgba(115, 220, 209, 0.05)' }
              ])
            },
            data: data2
          }
        ]
      };
      
      this.lineChartInstance.setOption(option);
    },
    
    initPieChart() {
      if (!this.$refs.pieChart) return;
      this.pieChartInstance = echarts.init(this.$refs.pieChart);
      this.updatePieChart();
    },
    
    updatePieChart() {
      if (!this.pieChartInstance) return;
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}<br/>{c} ({d}%)'
        },
        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
        series: [
          {
            name: '产品统计',
            type: 'pie',
            radius: ['15%', '85%'],
            center: ['50%', '50%'],
            data: this.productPieData,
            label: {
              formatter: '{b}\n{c}',
              fontSize: 12,
              lineHeight: 16
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 2
            }
          }
        ]
      };
      this.pieChartInstance.setOption(option);
    },
    
    resizeCharts() {
      if (this.lineChartInstance) this.lineChartInstance.resize();
      if (this.pieChartInstance) this.pieChartInstance.resize();
    }
  }
};
</script>

<style lang="scss" scoped>
.index-wrap {
  width: 100%;
  padding: 20px;
  background-color: #f0f2f5;
  overflow-x: hidden;
  
  .row-container {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.box-card {
  border-radius: 6px;
  border: none;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08) !important;
  
  ::v-deep .el-card__header {
    border-bottom: 1px solid #f0f0f0;
    padding: 15px 20px;
  }
}

.action-wrapper-card {
  height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Base header layout */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-left {
    display: flex;
    align-items: center;
  }
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-right: 20px;
    position: relative;
    padding-left: 10px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 16px;
      background: #409EFF;
      border-radius: 2px;
    }
  }
  
  .filter-select {
    width: 100px;
    margin-right: 15px;
  }
  
  .filter-select-lg {
    width: 140px;
  }
}

/* ---------- Top Row ---------- */
.action-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 16px;
  height: 100%;
  
  .action-card {
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 2px;
    position: relative;
    overflow: hidden;
    height: 78px;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }
    
    i {
      font-size: 28px;
      margin-right: 12px;
      opacity: 0.9;
    }
    
    &::after {
      content: "⚡";
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 14px;
      opacity: 0.4;
    }
  }
  
  .color-1 { background: linear-gradient(135deg, #74aefc 0%, #468dfa 100%); }
  .color-2 { background: linear-gradient(135deg, #81befd 0%, #68a5f8 100%); }
  .color-3 { background: linear-gradient(135deg, #7fcbd8 0%, #61b3c4 100%); }
  .color-4 { background: linear-gradient(135deg, #a3aaff 0%, #8b92fa 100%); }
}

.todo-card {
  height: 220px;
  display: flex;
  flex-direction: column;
  
  ::v-deep .el-card__body {
    flex: 1;
    overflow: hidden;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  
  .todo-header {
    font-size: 15px;
    .active-tab {
      color: #409EFF;
      font-weight: bold;
      cursor: pointer;
    }
    .inactive-tab {
      color: #909399;
      cursor: pointer;
      transition: color 0.2s;
      &:hover { color: #606266; }
    }
  }
  
  .todo-content {
    flex: 1;
    padding: 15px 20px;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: #ddd;
      border-radius: 3px;
    }
    
    .todo-items {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        font-size: 13px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .todo-left {
          display: flex;
          align-items: center;
          flex: 1;
          overflow: hidden;
          margin-right: 15px;
          
          .dot {
            width: 6px;
            height: 6px;
            background-color: #F56C6C;
            border-radius: 50%;
            margin-right: 10px;
            flex-shrink: 0;
          }
          .done-dot {
            background-color: #67C23A; // Green for "done"
          }
          
          .todo-title {
            color: #606266;
            cursor: pointer;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: color 0.2s;
            
            &:hover { 
              color: #409EFF;
            }
          }
        }
        
        .todo-time {
          color: #909399;
          font-size: 12px;
          flex-shrink: 0;
        }
      }
    }
  }
}

/* ---------- Middle Row ---------- */
.chart-container {
  width: 100%;
  height: 320px;
}

/* ---------- Bottom Row ---------- */
.stats-card {
  height: 340px;
  display: flex;
  flex-direction: column;
  
  ::v-deep .el-card__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
  }
}

.warehouse-capacity-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.warehouse-capacity-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #606266;
  
  .wh-name {
    width: 60px;
    font-weight: 500;
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

.pie-container {
  height: 100%;
  min-height: 250px;
}
</style>
