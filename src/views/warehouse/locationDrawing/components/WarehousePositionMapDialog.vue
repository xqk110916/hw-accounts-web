<template>
  <el-dialog
    :visible.sync="visible"
    :title="dialogTitle"
    width="92vw"
    top="4vh"
    custom-class="warehouse-position-dialog"
    :close-on-click-modal="false"
    append-to-body
    @closed="handleClosed"
  >
    <div class="position-shell" v-loading="loading">
      <div class="position-header">
        <div class="meta">
          <strong>{{ warehouseName }}</strong>
          <span>{{ warehouseCode }}</span>
        </div>
        <div class="actions">
          <el-button-group size="small">
            <el-button :type="viewMode === '2d' ? 'primary' : 'default'" @click="viewMode = '2d'">2D</el-button>
            <el-button :type="viewMode === '3d' ? 'primary' : 'default'" @click="viewMode = '3d'">3D</el-button>
          </el-button-group>
          <template v-if="viewMode === '2d'">
            <el-button v-if="!editing" size="small" type="primary" icon="el-icon-edit" @click="startEdit">编辑布局</el-button>
            <template v-else>
              <el-button size="small" @click="cancelEdit">取消</el-button>
              <el-button size="small" type="primary" icon="el-icon-check" @click="saveLayout">保存</el-button>
            </template>
          </template>
        </div>
      </div>

      <div class="position-body">
        <WarehouseGridMap2D
          v-show="viewMode === '2d'"
          ref="gridMap"
          :warehouse-name="warehouseName"
          :shelves="displayShelves"
          :layout="draftLayout"
          :editable="editing"
          :selected-shelf="selectedShelf"
          @layout-change="handleLayoutChange"
          @reset-layout="resetLayout"
          @shelf-select="selectedShelf = $event"
          @container-click="$emit('container-click', $event)"
        />
        <WarehouseInterior3D
          v-if="viewMode === '3d'"
          :warehouse-name="warehouseName"
          :shelves="displayShelves"
          :layout="draftLayout"
          :show-mode-switch="false"
          :show-shelf-enter-hint="false"
          initial-mode="3d"
          @select-shelf="selectedShelf = $event"
        />
      </div>

      <div class="position-side">
        <div class="side-card">
          <div class="side-title">当前货架</div>
          <template v-if="selectedShelf">
            <p><b>{{ selectedShelf.name }}</b></p>
            <p>列：{{ selectedShelf.columnCode }}，排：{{ selectedShelf.rowCode }}</p>
            <p>层数：{{ (selectedShelf.layers || []).length }}</p>
            <p>占用：{{ getFilledCount(selectedShelf) }} / {{ getTotalCount(selectedShelf) }}</p>
          </template>
          <el-empty v-else description="请选择货架" :image-size="72"></el-empty>
        </div>
        <div class="side-card">
          <div class="side-title">布局状态</div>
          <p>货架：{{ displayShelves.length }}</p>
          <p>过道：{{ (draftLayout.aisles || []).length }}</p>
          <p>来源：{{ layoutSource }}</p>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { getDictionaryList } from '@/api/common/dictionary';
import { getHierarchyDetail, getHierarchyTree, getPositionMap, updateHierarchyNode } from '@/api/warehouse/locationMap';
import WarehouseGridMap2D from '../../warehouse/components/WarehouseGridMap2D.vue';
import WarehouseInterior3D from '../../warehouse/components/WarehouseInterior3D.vue';
import { SHELF_TYPE_PARENT_ID, normalizeExtra, normalizeShelfTypeOptions, saveLocalExtra, getLocalExtra } from '../../warehouse/utils/locationLayoutStorage';
import { buildShelvesFromWarehouse, findNodeById, generateInitialLayout, applyLayoutToShelves } from '../../warehouse/utils/locationLayoutAdapter';

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

export default {
  name: 'WarehousePositionMapDialog',
  components: { WarehouseGridMap2D, WarehouseInterior3D },
  data() {
    return {
      visible: false,
      loading: false,
      editing: false,
      viewMode: '2d',
      warehouseNode: null,
      detail: {},
      positions: [],
      shelfTypeOptions: [],
      shelves: [],
      draftLayout: { grid: { rows: 12, cols: 20, cellSize: 32 }, shelves: [], aisles: [] },
      savedLayout: null,
      selectedShelf: null,
      layoutSource: '自动生成'
    };
  },
  computed: {
    warehouseName() {
      return this.detail.warehouseName || this.detail.nodeName || (this.warehouseNode && this.warehouseNode.nodeName) || '库房';
    },
    warehouseCode() {
      return this.detail.warehouseCode || this.detail.nodeCode || (this.warehouseNode && this.warehouseNode.nodeCode) || '-';
    },
    dialogTitle() {
      return `查看位置图 - ${this.warehouseName}`;
    },
    displayShelves() {
      return applyLayoutToShelves(this.shelves, this.draftLayout);
    }
  },
  methods: {
    async open(row) {
      this.visible = true;
      this.loading = true;
      this.editing = false;
      this.viewMode = '2d';
      try {
        const [detailRes, treeRes, positionRes, dictRes] = await Promise.all([
          getHierarchyDetail(row.id),
          getHierarchyTree(),
          getPositionMap({ nodeId: row.id, nodeType: '2' }),
          getDictionaryList({ parentId: SHELF_TYPE_PARENT_ID, currentPage: 1, pageSize: 999 })
        ]);
        this.detail = detailRes.data || row || {};
        const tree = Array.isArray(treeRes.data) ? treeRes.data : [treeRes.data].filter(Boolean);
        this.warehouseNode = findNodeById(tree, row.id, 2) || row;
        this.positions = Array.isArray(positionRes.data) ? positionRes.data : [];
        this.shelfTypeOptions = normalizeShelfTypeOptions((dictRes.data && dictRes.data.list) || []);
        this.shelves = buildShelvesFromWarehouse(this.warehouseNode, this.positions, this.shelfTypeOptions);
        this.initLayout();
      } catch (error) {
        console.error(error);
        this.$message.error('获取位置图失败');
      } finally {
        this.loading = false;
      }
    },
    initLayout() {
      const detailExtra = normalizeExtra(this.detail.extra);
      const localExtra = getLocalExtra(this.detail.id);
      let layout = null;
      if (detailExtra.layout2d) {
        layout = detailExtra.layout2d;
        this.layoutSource = '接口 extra';
      } else if (localExtra.layout2d) {
        layout = localExtra.layout2d;
        this.layoutSource = '本地 extra';
      } else {
        layout = generateInitialLayout(this.shelves);
        this.layoutSource = '自动生成';
      }
      this.savedLayout = clone(layout);
      this.draftLayout = clone(layout);
      this.selectedShelf = this.displayShelves[0] || null;
    },
    startEdit() {
      this.editing = true;
      this.savedLayout = clone(this.draftLayout);
    },
    cancelEdit() {
      this.draftLayout = clone(this.savedLayout);
      this.editing = false;
    },
    handleLayoutChange(layout) {
      this.draftLayout = clone(layout);
    },
    resetLayout() {
      this.draftLayout = generateInitialLayout(this.shelves);
      this.$message.success('已重置为初始布局');
    },
    async saveLayout() {
      const extra = {
        ...normalizeExtra(this.detail.extra),
        layout2d: clone(this.draftLayout)
      };
      try {
        await updateHierarchyNode({
          ...this.detail,
          id: this.detail.id,
          balanceId: this.detail.balanceAreaId || this.detail.parentId,
          warehouseCode: this.detail.warehouseCode || this.detail.nodeCode,
          warehouseName: this.detail.warehouseName || this.detail.nodeName,
          warehouseType: this.detail.warehouseType,
          materialTypes: this.detail.materialTypes,
          remark: this.detail.remark,
          sortOrder: this.detail.sortOrder || 1,
          extra
        });
        saveLocalExtra(this.detail.id, extra);
        this.detail = { ...this.detail, extra };
        this.savedLayout = clone(this.draftLayout);
        this.editing = false;
        this.layoutSource = '本地 extra';
        this.$message.success('布局保存成功');
        this.$emit('saved', this.detail);
      } catch (error) {
        console.error(error);
        saveLocalExtra(this.detail.id, extra);
        this.detail = { ...this.detail, extra };
        this.savedLayout = clone(this.draftLayout);
        this.editing = false;
        this.layoutSource = '本地 extra';
        this.$message.warning('接口保存失败，已保存到本地用于布局测试');
      }
    },
    getFilledCount(shelf) {
      return (shelf.layers || []).reduce((count, layer) => {
        const item = (layer.containers || [])[0] || {};
        return count + ((item.materialCode || String(item.status) === '1') ? 1 : 0);
      }, 0);
    },
    getTotalCount(shelf) {
      return (shelf.layers || []).length;
    },
    handleClosed() {
      this.editing = false;
      this.selectedShelf = null;
    }
  }
};
</script>

<style lang="scss">
.warehouse-position-dialog {
  .el-dialog__body {
    padding: 0 18px 18px;
  }
}
</style>

<style lang="scss" scoped>
.position-shell {
  height: 78vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  grid-template-rows: 48px minmax(0, 1fr);
  gap: 12px;

  .position-header {
    grid-column: 1 / 3;
    border-bottom: 1px solid #e6ebf2;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .meta {
      display: flex;
      align-items: center;
      gap: 12px;
      strong { color: #1f2d3d; font-size: 16px; }
      span { color: #7b8794; }
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .position-body {
    min-width: 0;
    min-height: 0;
  }

  .position-side {
    min-height: 0;
    overflow: auto;
  }

  .side-card {
    border: 1px solid #e3e8f0;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    background: #fbfcfe;

    .side-title {
      color: #1f2d3d;
      font-weight: 700;
      margin-bottom: 10px;
    }

    p {
      margin: 6px 0;
      color: #5d6673;
      font-size: 13px;
    }
  }
}
</style>
