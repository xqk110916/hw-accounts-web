<template>
  <div>
    <!-- 触发按钮 -->
    <el-button
      size="small"
      type="primary"
      icon="el-icon-data-analysis"
      @click="openDialog"
    >统计信息</el-button>

    <!-- 弹窗 -->
    <el-dialog
      title="统计信息"
      :visible.sync="dialogVisible"
      width="900px"
      append-to-body
      :close-on-click-modal="false"
    >
      <WarehouseStatsPanel
        :warehouse-stats="warehouseStatsData"
        :product-data="productStatsData"
        :chart-type.sync="statsType"
        :show-rank="true"
        :capacity-loading="capacityLoading"
        :chart-loading="chartLoading"
      />
    </el-dialog>
  </div>
</template>

<script>
import WarehouseStatsPanel from '@/components/WarehouseStatsPanel';
import { getProductStatistics } from '@/api/warehouse/warehouse';

export default {
  name: 'StatisticsPanel',
  components: { WarehouseStatsPanel },
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
    currentArea: {
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
      dialogVisible: false,
      statsType: 'quantity',
      capacityLoading: false,
      chartLoading: false,
      productStatsData: []
    };
  },
  computed: {
    warehouseStatsData() {
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
    }
  },
  watch: {
    statsType() {
      this.fetchProductStats();
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true;
      this.fetchProductStats();
    },

    async fetchProductStats() {
      this.chartLoading = true;
      try {
        const currentWarehouse = this.currentWarehouse || this.warehouseList[0];
        const res = await getProductStatistics({
          balanceAreaId: this.currentArea ? this.currentArea.id : '',
          warehouseId: currentWarehouse ? currentWarehouse.id : '',
          statisticType: this.statsType === 'quantity' ? 2 : 1
        });
        const list = res.data || res || [];
        const arr = Array.isArray(list) ? list : [list];
        this.productStatsData = arr.map(item => ({
          name: item.goodsName || item.goodsCode || '未知',
          quantity: item.totalQuantity || 0,
          weight: Number(item.totalGrossWeight) || 0
        }));
      } catch (e) {
        console.error('获取材料统计失败', e);
        this.productStatsData = [];
      } finally {
        this.chartLoading = false;
      }
    }
  }
};
</script>
