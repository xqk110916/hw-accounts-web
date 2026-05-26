<template>
  <div>
    <!-- 触发按钮 -->
    <el-button
      size="small"
      type="primary"
      icon="el-icon-data-analysis"
      @click="dialogVisible = true"
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
        :capacity-loading="false"
        :chart-loading="false"
      />
    </el-dialog>
  </div>
</template>

<script>
import WarehouseStatsPanel from '@/components/WarehouseStatsPanel';

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
    shelves: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      statsType: 'quantity'
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
    },

    productStatsData() {
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
        name,
        quantity: productMap[name].quantity,
        weight: productMap[name].weight
      }));
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
    }
  }
};
</script>
