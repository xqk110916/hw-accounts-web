<template>
  <div class="index-wrap">
    <!-- Top Row: Action Buttons and Todo List -->
    <el-row :gutter="20" class="row-container">
      <el-col :span="14">
        <el-card shadow="hover" class="box-card action-wrapper-card" :body-style="{ padding: '20px' }">
          <div class="action-buttons">
            <div class="action-card color-1" @click="handleAction('task/inbound')">
              <i class="el-icon-receiving"></i>
              <span>入库管理</span>
            </div>
            <div class="action-card color-2" @click="handleAction('task/inventory')">
              <i class="el-icon-pie-chart"></i>
              <span>盘存管理</span>
            </div>
            <div class="action-card color-3" @click="handleAction('task/outbound')">
              <i class="el-icon-sell"></i>
              <span>出库管理</span>
            </div>
            <div class="action-card color-4" @click="handleAction('dataManagement/comprehensiveQuery')">
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
              <li v-for="(item, index) in todoList" :key="index">
                <div class="todo-left">
                  <span class="dot" :class="{ 'done-dot': activeTodoTab === 'done' }"></span>
                  <span class="todo-title" :title="'【' + item.typeName + '】' + item.taskNum" @click="handleTodoClick(item)">
                    【{{ item.typeName }}】{{ item.taskNum }}
                  </span>
                </div>
                <span class="todo-time">{{ item.createTime || '' }}</span>
              </li>
            </ul>
            <el-empty v-if="todoList.length === 0" description="暂无数据"></el-empty>
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
              <el-select v-model="inOutWarehouse" size="small" class="filter-select" placeholder="全部库房" clearable @change="fetchInOutStats">
                <el-option v-for="wh in warehouseOptions" :key="wh" :label="wh" :value="wh" />
              </el-select>
              <el-select v-model="inOutProduct" size="small" class="filter-select-lg" placeholder="全部材料" clearable filterable @change="fetchInOutStats">
                <el-option v-for="opt in productOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
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

    <!-- Bottom Row: Warehouse Capacity and Material Statistics -->
    <el-row :gutter="20" class="row-container">
      <el-col :span="12">
        <el-card shadow="hover" class="box-card stats-card">
          <div slot="header" class="section-header">
            <span class="section-title">库房容量</span>
          </div>
          <div class="warehouse-capacity-list">
            <div
              v-for="(wh, index) in warehouseStats"
              :key="wh.id"
              class="warehouse-capacity-item"
            >
              <div class="wh-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
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
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="box-card stats-card">
          <div slot="header" class="section-header">
            <div class="header-left">
              <span class="section-title">材料统计</span>
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
          <div class="chart-container pie-container" ref="pieChart" v-loading="loadingProductStats"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { getProductStatistics, getInOutStatistics } from '@/api/warehouse/warehouse';
import { getLocationHierarchy } from '@/views/task/inbound/components/api.js';
import { listAllMaterialCode } from '@/views/dataManagement/materialManagement/components/api.js';
import { getAuditTaskList } from './api.js';

// 业务类型 -> 路由路径 映射
const BIZ_TYPE_ROUTE_MAP = {
  1: 'task/inbound',       // 入库
  2: 'task/outbound',      // 出库
  3: 'task/move',          // 位置移动
  4: 'task/inventory',     // 实物盘存
};

export default {
  name: 'Index',
  components: {},
  data() {
    return {
      // Todo Tab State
      activeTodoTab: 'todo',
      todoList: [],
      loadingTodos: false,

      // Middle row filters
      inOutWarehouse: '',
      inOutProduct: '',
      lineChartType: 'quantity',
      lineChartInstance: null,
      loadingLineChart: false,
      warehouseOptions: [],
      productOptions: [],
      inOutStatsData: [],

      // Bottom row
      pieChartType: 'quantity',
      pieChartInstance: null,
      loadingProductStats: false,
      productStatsData: [],

      // Warehouse state
      warehouseStats: []
    };
  },
  async activated() {
    this.resizeCharts();
  },
  async created() {
    this.warehouseStats = this.getDefaultStats();
    this.loadFilterOptions();
    this.fetchProductStats();
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
    pieChartType() {
      this.fetchProductStats();
    },
    productStatsData() {
      this.$nextTick(() => this.updatePieChart());
    },
    lineChartType() {
      this.fetchInOutStats();
    }
  },
  methods: {
    handleAction(path) {
      this.$router.push('/' + path);
    },

    getDefaultStats() {
      const required = ['库房A', '库房B', '库房C', '库房D', '库房E', '库房F', '库房G', '库房H'];
      return required.map((name, i) => ({
        id: 'wh_' + i,
        name,
        capacity: 253,
        stock: 120 - i * 12,
        usageRate: Math.round(((120 - i * 12) / 253) * 100)
      })).sort((a, b) => b.usageRate - a.usageRate);
    },

    // 材料统计 - 调用 /busin/warehouse/product/statistic
    async fetchProductStats() {
      this.loadingProductStats = true;
      try {
        const res = await getProductStatistics({
          statisticType: this.pieChartType === 'quantity' ? 2 : 1
        });
        const list = res.data || res || [];
        const arr = Array.isArray(list) ? list : [list];
        this.productStatsData = arr.map(item => ({
          name: item.goodsName || item.goodsCode || '未知',
          value: this.pieChartType === 'quantity'
            ? (item.totalQuantity || 0)
            : (Number(item.totalGrossWeight) || 0)
        })).filter(item => item.value > 0);
      } catch (e) {
        console.error('获取材料统计失败', e);
        this.productStatsData = [];
      } finally {
        this.loadingProductStats = false;
      }
    },

    changeTodoTab(tab) {
      if (this.activeTodoTab === tab) return;
      this.activeTodoTab = tab;
      this.fetchTodoData();
    },

    // 点击待办/已办条目，跳转到对应任务页面并代入任务编号查询
    handleTodoClick(item) {
      const route = BIZ_TYPE_ROUTE_MAP[item.type];
      if (!route) {
        this.$message.warning('未知的业务类型');
        return;
      }
      this.$router.push({
        path: '/' + route,
        query: { taskNum: item.taskNum },
      });
    },

    fetchTodoData() {
      this.loadingTodos = true;
      const auditType = this.activeTodoTab === 'todo' ? 0 : 1; // 0=待审核, 1=已审核
      getAuditTaskList({ currentPage: 1, pageSize: 50, auditType }).then(res => {
        if (res.code === 1) {
          this.todoList = res.data.list || [];
        } else {
          this.todoList = [];
        }
      }).catch(() => {
        this.todoList = [];
      }).finally(() => {
        this.loadingTodos = false;
      });
    },

    handleLineChartChange() {
      this.fetchInOutStats();
    },

    handlePieChartChange() {
      // pieChartType watch triggers fetchProductStats
    },

    initLineChart() {
      if (!this.$refs.lineChart) return;
      this.lineChartInstance = echarts.init(this.$refs.lineChart);
      this.fetchInOutStats();
    },

    async loadFilterOptions() {
      try {
        const res = await listAllMaterialCode();
        const list = res.data || res || [];
        const arr = Array.isArray(list) ? list : [];
        this.productOptions = arr.map(item => ({
          label: `${item.goodCode || ''}${item.goodName ? ' - ' + item.goodName : ''}`,
          value: item.goodCode,
        })).filter(item => item.value);
      } catch (e) {
        console.error('加载材料列表失败', e);
      }
      try {
        const res = await getLocationHierarchy(2);
        const list = res.data || res || [];
        const arr = Array.isArray(list) ? list : [];
        this.warehouseOptions = arr.map(item => item.warehouseName).filter(Boolean);
      } catch (e) {
        console.error('加载库房列表失败', e);
      }
    },

    async fetchInOutStats() {
      this.loadingLineChart = true;
      try {
        const params = {
          statType: this.lineChartType === 'quantity' ? 'COUNT' : 'WEIGHT',
        };
        if (this.inOutWarehouse) params.warehouseName = this.inOutWarehouse;
        if (this.inOutProduct) params.goodsCode = this.inOutProduct;

        const res = await getInOutStatistics(params);
        const list = res.data || res || [];
        this.inOutStatsData = Array.isArray(list) ? list : [];
        this.updateLineChart();
      } catch (e) {
        console.error('获取出入库统计失败', e);
        this.inOutStatsData = [];
        this.updateLineChart();
      } finally {
        this.loadingLineChart = false;
      }
    },

    updateLineChart() {
      if (!this.lineChartInstance) return;

      const stats = this.inOutStatsData || [];
      const months = stats.map(item => item.month || '');
      const inboundData = stats.map(item => item.inboundValue || 0);
      const outboundData = stats.map(item => item.outboundValue || 0);

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
            data: inboundData
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
            data: outboundData
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
            name: '材料统计',
            type: 'pie',
            radius: ['15%', '85%'],
            center: ['50%', '50%'],
            data: this.productStatsData,
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

    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }

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

        &:last-child { margin-bottom: 0; }

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
            background-color: #67C23A;
          }

          .todo-title {
            color: #606266;
            cursor: pointer;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: color 0.2s;

            &:hover { color: #409EFF; }
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
  overflow-y: auto;
  max-height: 250px;
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
  flex-shrink: 0;

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

.pie-container {
  height: 100%;
  min-height: 250px;
}
</style>
