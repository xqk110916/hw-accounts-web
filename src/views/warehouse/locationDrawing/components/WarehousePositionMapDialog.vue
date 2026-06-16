<template>
  <el-dialog
    :visible.sync="visible"
    :fullscreen="isFullscreen"
    width="92vw"
    top="4vh"
    custom-class="warehouse-position-dialog"
    :close-on-click-modal="false"
    append-to-body
    @closed="handleClosed"
  >
    <div slot="title" class="dialog-header-custom">
      <span class="el-dialog__title">{{ dialogTitle }}</span>
      <button
        type="button"
        class="el-dialog__headerbtn"
        style="right: 48px; top: 16px;"
        @click="isFullscreen = !isFullscreen"
        title="全屏"
      >
        <i :class="isFullscreen ? 'el-icon-zoom-out' : 'el-icon-full-screen'"></i>
      </button>
    </div>
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
          hide-internal-aisle-settings
          @aisle-visible-change="handleAisleVisibleChange"
          @aisle-settings-change="handleAisleSettingsChange"
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
        <template v-if="editing && aisleVisible">
          <div class="side-card">
            <div class="side-title">过道设置</div>
            <div class="aisle-section">
              <div class="aisle-section-label">
                <span>排间过道</span>
                <span class="width-config">
                  ( 宽
                  <el-input-number v-model="newRowAisleWidth" size="mini" :min="1" :max="5" :controls="false" class="width-input" />
                  格 )
                </span>
              </div>
              <div v-for="(row, idx) in aisleSettings.rows" :key="'r'+idx" class="aisle-item">
                <span class="aisle-badge badge-row">排 {{ row.afterIndex }}</span>
                <span class="aisle-desc">宽 {{ row.width }} 格</span>
                <button type="button" class="aisle-delete-btn" @click="removeRowAisle(idx)" title="删除">
                  <i class="el-icon-close"></i>
                </button>
              </div>
              <div class="aisle-add">
                <el-select v-model="newRowAisleAfter" size="mini" placeholder="选择排">
                  <el-option v-for="i in ($refs.gridMap ? $refs.gridMap.shelfRowCount : 0)" :key="i" :label="'第'+i+'排后'" :value="i" />
                </el-select>
                <el-button size="mini" type="primary" style="padding: 6px 14px;" @click="handleAddRowAisle">添加</el-button>
              </div>
            </div>
            <div class="aisle-section">
              <div class="aisle-section-label">
                <span>列间过道</span>
                <span class="width-config">
                  ( 宽
                  <el-input-number v-model="newColAisleWidth" size="mini" :min="1" :max="5" :controls="false" class="width-input" />
                  格 )
                </span>
              </div>
              <div v-for="(col, idx) in aisleSettings.cols" :key="'c'+idx" class="aisle-item">
                <span class="aisle-badge badge-col">列 {{ col.afterIndex }}</span>
                <span class="aisle-desc">宽 {{ col.width }} 格</span>
                <button type="button" class="aisle-delete-btn" @click="removeColAisle(idx)" title="删除">
                  <i class="el-icon-close"></i>
                </button>
              </div>
              <div class="aisle-add">
                <el-select v-model="newColAisleAfter" size="mini" placeholder="选择列">
                  <el-option v-for="i in ($refs.gridMap ? $refs.gridMap.shelfColCount : 0)" :key="i" :label="'第'+i+'列后'" :value="i" />
                </el-select>
                <el-button size="mini" type="primary" style="padding: 6px 14px;" @click="handleAddColAisle">添加</el-button>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="side-card">
            <div class="side-title">当前库房</div>
            <p>总货位数：{{ totalPositions }}</p>
            <p>已用数：{{ usedPositions }}</p>
            <p>空闲数：{{ freePositions }}</p>
          </div>
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
            <div class="side-title">容器信息</div>
            <template v-if="selectedContainer">
              <p>位置：{{ getPositionText(selectedContainer) }}</p>
              <p>材料代码：{{ selectedContainer.goodCode || '-' }}</p>
              <p>容器号：{{ selectedContainer.containerCode || '-' }}</p>
              <p>入库时间：{{ selectedContainer.createTime || '-' }}</p>
            </template>
            <el-empty v-else description="未选中容器" :image-size="72"></el-empty>
          </div>
        </template>
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
import { buildShelvesFromWarehouse, findNodeById, generateInitialLayout, applyLayoutToShelves, generateDefaultAisles, parseCodeNumber } from '../../warehouse/utils/locationLayoutAdapter';

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
      layoutSource: '自动生成',
      isFullscreen: false,
      aisleVisible: false,
      aisleSettings: { rows: [], cols: [] },
      newRowAisleAfter: 1,
      newRowAisleWidth: 2,
      newColAisleAfter: 1,
      newColAisleWidth: 2
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
    },
    totalPositions() {
      return this.displayShelves.reduce((sum, shelf) => {
        return sum + (shelf.layers || []).length;
      }, 0);
    },
    usedPositions() {
      return this.displayShelves.reduce((sum, shelf) => {
        return sum + (shelf.layers || []).filter(layer => {
          const container = (layer.containers || [])[0];
          return container && (container.materialCode || String(container.status) === '1');
        }).length;
      }, 0);
    },
    freePositions() {
      return Math.max(this.totalPositions - this.usedPositions, 0);
    },
    selectedContainer() {
      if (!this.selectedShelf) return null
      const allContainers = (this.selectedShelf.layers || []).flatMap(layer => (layer.containers || []))
      return allContainers.length > 0 ? allContainers[0] : null
    }
  },
  methods: {
    async open(row) {
      this.visible = true;
      this.loading = true;
      this.editing = false;
      this.viewMode = '2d';
      this.isFullscreen = false;
      this.aisleVisible = false;
      this.aisleSettings = { rows: [], cols: [] };
      try {
        const [detailRes, treeRes, positionRes, dictRes, oldDictRes] = await Promise.all([
          getHierarchyDetail(row.id),
          getHierarchyTree(),
          getPositionMap({ nodeId: row.id, nodeType: '2' }),
          getDictionaryList({ parentId: SHELF_TYPE_PARENT_ID, currentPage: 1, pageSize: 999 }),
          getDictionaryList({ parentId: '2051955496598659073', currentPage: 1, pageSize: 999 })
        ]);
        this.detail = detailRes.data || row || {};
        const tree = Array.isArray(treeRes.data) ? treeRes.data : [treeRes.data].filter(Boolean);
        this.warehouseNode = findNodeById(tree, row.id, 2) || row;
        this.positions = Array.isArray(positionRes.data) ? positionRes.data : [];
        
        const newDictList = (dictRes.data && dictRes.data.list) || [];
        const oldDictList = (oldDictRes.data && oldDictRes.data.list) || [];
        this.shelfTypeOptions = normalizeShelfTypeOptions([...newDictList, ...oldDictList]);
        
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
      let layout = null;
      if (detailExtra.layout2d) {
        layout = detailExtra.layout2d;
        this.layoutSource = '接口 extra';
      } else {
        layout = generateInitialLayout(this.shelves);
        this.layoutSource = '自动生成';
      }
      // 历史布局回填：旧 layout2d 可能没有 aisleSettings，用默认过道补齐，
      // 保证 3D 也能按默认过道显示（单一数据源）
      if (layout && !layout.aisleSettings) {
        const shelfRowCount = Math.max(1, ...this.shelves.map(s => Number(s.rowCode) || 0));
        const shelfColCount = Math.max(1, ...this.shelves.map(s => parseCodeNumber(s.columnCode)));
        layout = {
          ...layout,
          aisleSettings: {
            rows: generateDefaultAisles(shelfRowCount),
            cols: generateDefaultAisles(shelfColCount)
          }
        };
      }
      this.savedLayout = clone(layout);
      this.draftLayout = clone(layout);
      if (layout && layout.aisleSettings) {
        this.aisleSettings = clone(layout.aisleSettings);
      } else {
        this.aisleSettings = { rows: [], cols: [] };
      }
      this.selectedShelf = this.displayShelves[0] || null;
    },
    startEdit() {
      this.editing = true;
      this.savedLayout = clone(this.draftLayout);
    },
    cancelEdit() {
      this.draftLayout = clone(this.savedLayout);
      if (this.savedLayout && this.savedLayout.aisleSettings) {
        this.aisleSettings = clone(this.savedLayout.aisleSettings);
      } else {
        this.aisleSettings = { rows: [], cols: [] };
      }
      this.editing = false;
      this.aisleVisible = false;
      if (this.$refs.gridMap) {
        this.$refs.gridMap.aisleVisible = false;
        this.$refs.gridMap.tool = 'select';
      }
    },
    handleLayoutChange(layout) {
      this.draftLayout = clone(layout);
      if (layout && layout.aisleSettings) {
        this.aisleSettings = clone(layout.aisleSettings);
      }
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
          id: this.detail.id,
          warehouseCode: this.detail.warehouseCode || this.detail.nodeCode,
          extra: JSON.stringify(extra)
        });
        this.detail = { ...this.detail, extra };
        this.savedLayout = clone(this.draftLayout);
        this.editing = false;
        this.aisleVisible = false;
        if (this.$refs.gridMap) {
          this.$refs.gridMap.aisleVisible = false;
          this.$refs.gridMap.tool = 'select';
        }
        this.layoutSource = '接口 extra';
        this.$message.success('布局保存成功');
        this.$emit('saved', this.detail);
      } catch (error) {
        console.error(error);
        this.detail = { ...this.detail, extra };
        this.savedLayout = clone(this.draftLayout);
        this.editing = false;
        this.aisleVisible = false;
        if (this.$refs.gridMap) {
          this.$refs.gridMap.aisleVisible = false;
          this.$refs.gridMap.tool = 'select';
        }
        this.layoutSource = '接口 extra';
        this.$message.error('布局保存失败');
      }
    },
    getPositionText(container) {
      if (!container) return '-'
      const values = [container.shelfCode, container.rowCode, container.columnCode].filter(Boolean)
      return values.length ? values.join('-') : '-'
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
    handleAisleVisibleChange(val) {
      this.aisleVisible = val;
    },
    handleAisleSettingsChange(val) {
      this.aisleSettings = clone(val);
    },
    removeRowAisle(idx) {
      if (this.$refs.gridMap) {
        this.$refs.gridMap.removeRowAisle(idx);
      }
    },
    removeColAisle(idx) {
      if (this.$refs.gridMap) {
        this.$refs.gridMap.removeColAisle(idx);
      }
    },
    handleAddRowAisle() {
      if (this.$refs.gridMap) {
        this.$refs.gridMap.addRowAisle(this.newRowAisleAfter, this.newRowAisleWidth);
      }
    },
    handleAddColAisle() {
      if (this.$refs.gridMap) {
        this.$refs.gridMap.addColAisle(this.newColAisleAfter, this.newColAisleWidth);
      }
    },
    handleClosed() {
      this.editing = false;
      this.selectedShelf = null;
      this.isFullscreen = false;
      this.aisleVisible = false;
    }
  }
};
</script>

<style lang="scss">
.warehouse-position-dialog {
  .el-dialog__body {
    padding: 20px;
  }
  &.is-fullscreen {
    .el-dialog__body {
      padding: 10px 20px;
    }
    .position-shell {
      height: calc(100vh - 100px);
    }
  }
}
</style>

<style lang="scss" scoped>
.position-shell {
  height: calc(86vh - 140px);
  min-height: 500px;
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

  .aisle-section {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px dashed #e3e8f0;
    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
  }
  .aisle-section-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 700;
    color: #4a5568;
    font-size: 13px;
    margin-bottom: 8px;

    .width-config {
      font-size: 11px;
      color: #718096;
      font-weight: normal;
      display: flex;
      align-items: center;
      gap: 3px;

      .width-input {
        width: 32px;
        ::v-deep .el-input__inner {
          padding: 0 !important;
          text-align: center;
          height: 20px !important;
          line-height: 20px !important;
          font-size: 11px;
        }
      }
    }
  }
  .aisle-item {
    display: flex;
    align-items: center;
    background: #f4f6fa;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 6px 8px;
    margin-bottom: 6px;
    gap: 8px;
    transition: all 0.2s ease;

    &:hover {
      background: #edf2f7;
      border-color: #cbd5e0;
    }

    .aisle-badge {
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      line-height: 1;

      &.badge-row {
        background: #409eff;
      }
      &.badge-col {
        background: #67c23a;
      }
    }

    .aisle-desc {
      font-size: 12px;
      color: #4a5568;
      font-weight: 500;
      flex: 1;
    }

    .aisle-delete-btn {
      background: transparent;
      border: none;
      color: #a0aec0;
      cursor: pointer;
      padding: 2px;
      line-height: 1;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;

      &:hover {
        background: #feb2b2;
        color: #e53e3e;
      }

      i {
        font-size: 12px;
      }
    }
  }
  .aisle-add {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    margin-top: 8px;

    ::v-deep .el-select--mini {
      flex: 1;
    }
  }
}
</style>
