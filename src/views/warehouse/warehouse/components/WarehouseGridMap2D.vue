<template>
  <div class="warehouse-grid-map">
    <div class="grid-toolbar" v-if="showToolbar">
      <div class="toolbar-left">
        <strong>{{ warehouseName }}</strong>
        <template v-if="editable">
          <span>网格</span>
          <el-input-number
            v-model="gridRowsInput"
            size="mini"
            :min="minGridRows"
            :max="120"
            controls-position="right"
            @change="applyGridSize"
          />
          <span>×</span>
          <el-input-number
            v-model="gridColsInput"
            size="mini"
            :min="minGridCols"
            :max="120"
            controls-position="right"
            @change="applyGridSize"
          />
        </template>
        <span v-else>网格 {{ currentLayout.grid.rows }} × {{ currentLayout.grid.cols }}</span>
      </div>
      <div class="toolbar-actions">
        <el-button-group size="mini" v-if="editable">
          <el-button :type="tool === 'select' ? 'primary' : 'default'" icon="el-icon-rank" @click="tool = 'select'">选择</el-button>
          <el-button :type="tool === 'aisle' ? 'primary' : 'default'" icon="el-icon-s-operation" @click="tool = 'aisle'">过道</el-button>
          <el-button :type="tool === 'erase' ? 'primary' : 'default'" icon="el-icon-delete" @click="tool = 'erase'">擦除</el-button>
        </el-button-group>
        <el-button v-if="editable" size="mini" icon="el-icon-refresh-left" @click="$emit('reset-layout')">重置</el-button>
        <el-button size="mini" icon="el-icon-download" @click="exportImage">导出</el-button>
      </div>
    </div>

    <div class="grid-scroll">
      <div
        ref="floor"
        class="grid-floor"
        :style="floorStyle"
        :class="{ editing: editable }"
        @mousedown="handleFloorMouseDown"
        @mousemove="handleFloorMouseMove"
        @contextmenu.prevent="handleContextMenu"
      >
        <div
          v-for="aisle in currentLayout.aisles"
          :key="aisle.id"
          class="aisle-block"
          :style="rectStyle(aisle)"
          title="过道"
          @click.stop="handleAisleClick(aisle)"
        >
          <span>过道</span>
        </div>

        <div
          v-for="shelf in viewShelves"
          :key="shelf.id"
          class="grid-shelf"
          :class="{
            selected: selectedShelf && selectedShelf.id === shelf.id,
            dragging: dragging && dragging.id === shelf.id,
            invalid: dragging && dragging.id === shelf.id && !dragging.valid
          }"
          :style="shelfStyle(shelf)"
          @mousedown.stop="startDrag($event, shelf)"
          @click.stop="$emit('shelf-select', shelf)"
        >
          <div class="shelf-head">
            <span class="shelf-name">{{ shelf.name }}</span>
            <span class="shelf-count">{{ getFilledCount(shelf) }}/{{ getTotalCount(shelf) }}</span>
          </div>
          <div class="shelf-meta">{{ shelf.columnCode }} / {{ shelf.rowCode }} · {{ shelf.width }}m×{{ shelf.height }}m</div>
          <div class="layer-strip">
            <button
              v-for="layer in shelf.layers"
              :key="layer.id"
              type="button"
              class="layer-dot"
              :class="getLayerStatus(layer)"
              :title="getLayerTitle(layer)"
              @click.stop="handleLayerClick(layer)"
            ></button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-legend">
      <span><i class="free"></i>空闲</span>
      <span><i class="used"></i>占用</span>
      <span><i class="locked"></i>锁定</span>
      <span><i class="aisle"></i>过道</span>
    </div>
  </div>
</template>

<script>
function cloneLayout(layout) {
  return JSON.parse(JSON.stringify(layout || { grid: { rows: 12, cols: 20, cellSize: 32 }, shelves: [], aisles: [] }));
}

function isOverlap(a, b) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

export default {
  name: 'WarehouseGridMap2D',
  props: {
    warehouseName: { type: String, default: '库房' },
    shelves: { type: Array, default: () => [] },
    layout: { type: Object, default: null },
    editable: { type: Boolean, default: false },
    showToolbar: { type: Boolean, default: true },
    selectedShelf: { type: Object, default: null }
  },
  data() {
    return {
      localLayout: cloneLayout(this.layout),
      tool: 'select',
      dragging: null,
      painting: false,
      paintedCells: new Set(),
      gridColsInput: 20,
      gridRowsInput: 12
    };
  },
  computed: {
    currentLayout() {
      const layout = this.localLayout || {};
      return {
        grid: { rows: 12, cols: 20, cellSize: 32, ...(layout.grid || {}) },
        shelves: layout.shelves || [],
        aisles: layout.aisles || []
      };
    },
    cellSize() {
      return this.currentLayout.grid.cellSize || 32;
    },
    floorStyle() {
      const grid = this.currentLayout.grid;
      return {
        width: `${grid.cols * this.cellSize}px`,
        height: `${grid.rows * this.cellSize}px`,
        backgroundSize: `${this.cellSize}px ${this.cellSize}px`
      };
    },
    viewShelves() {
      const layoutMap = new Map(this.currentLayout.shelves.map(item => [String(item.id), item]));
      return this.shelves.map(shelf => {
        const hit = layoutMap.get(String(shelf.id));
        return {
          ...shelf,
          ...(hit ? { position: { x: hit.x, y: hit.y }, width: hit.w, height: hit.h, layout: hit } : {})
        };
      });
    },
    minGridCols() {
      return Math.max(1, ...this.currentLayout.shelves.map(item => item.x + item.w), ...this.currentLayout.aisles.map(item => item.x + item.w));
    },
    minGridRows() {
      return Math.max(1, ...this.currentLayout.shelves.map(item => item.y + item.h), ...this.currentLayout.aisles.map(item => item.y + item.h));
    }
  },
  watch: {
    layout: {
      deep: true,
      handler(value) {
        this.localLayout = cloneLayout(value);
        this.syncGridInputs();
      }
    }
  },
  mounted() {
    this.syncGridInputs();
  },
  beforeDestroy() {
    this.removeDragListeners();
    this.removePaintListeners();
  },
  methods: {
    syncGridInputs() {
      this.gridColsInput = this.currentLayout.grid.cols;
      this.gridRowsInput = this.currentLayout.grid.rows;
    },
    rectStyle(rect) {
      return {
        left: `${rect.x * this.cellSize}px`,
        top: `${rect.y * this.cellSize}px`,
        width: `${rect.w * this.cellSize}px`,
        height: `${rect.h * this.cellSize}px`
      };
    },
    shelfStyle(shelf) {
      const rect = {
        x: shelf.position ? shelf.position.x : 0,
        y: shelf.position ? shelf.position.y : 0,
        w: shelf.width || 1,
        h: shelf.height || 1
      };
      return this.rectStyle(rect);
    },
    getFilledCount(shelf) {
      let count = 0;
      (shelf.layers || []).forEach(layer => {
        (layer.containers || []).forEach(item => {
          if (item.materialCode || item.status === '1') count++;
        });
      });
      return count;
    },
    getTotalCount(shelf) {
      return (shelf.layers || []).reduce((total, layer) => total + Math.max((layer.containers || []).length, 1), 0);
    },
    getLayerStatus(layer) {
      const container = (layer.containers || [])[0] || {};
      if (String(container.status) === '2') return 'locked';
      if (container.materialCode || String(container.status) === '1') return 'used';
      return 'free';
    },
    getLayerTitle(layer) {
      const container = (layer.containers || [])[0] || {};
      return container.materialName ? `${container.materialName} ${container.code || ''}` : '空位';
    },
    handleLayerClick(layer) {
      const container = (layer.containers || [])[0];
      if (container) this.$emit('container-click', container);
    },
    startDrag(event, shelf) {
      if (!this.editable || this.tool !== 'select') return;
      event.preventDefault();
      const item = this.currentLayout.shelves.find(row => String(row.id) === String(shelf.id));
      if (!item) return;
      this.dragging = {
        id: shelf.id,
        origin: { ...item },
        startX: event.clientX,
        startY: event.clientY,
        current: { ...item },
        valid: true
      };
      document.addEventListener('mousemove', this.handleDragMove);
      document.addEventListener('mouseup', this.handleDragEnd);
    },
    handleDragMove(event) {
      if (!this.dragging) return;
      const dx = Math.round((event.clientX - this.dragging.startX) / this.cellSize);
      const dy = Math.round((event.clientY - this.dragging.startY) / this.cellSize);
      const next = {
        ...this.dragging.origin,
        x: this.dragging.origin.x + dx,
        y: this.dragging.origin.y + dy
      };
      const valid = this.validateShelf(next, next.id);
      this.dragging.current = next;
      this.dragging.valid = valid;
      this.updateShelfRect(next);
    },
    handleDragEnd() {
      if (!this.dragging) return;
      if (!this.dragging.valid) {
        this.updateShelfRect(this.dragging.origin);
        this.$message.warning('该位置与货架或过道冲突');
      } else {
        this.$emit('layout-change', cloneLayout(this.currentLayout));
      }
      this.dragging = null;
      this.removeDragListeners();
    },
    removeDragListeners() {
      document.removeEventListener('mousemove', this.handleDragMove);
      document.removeEventListener('mouseup', this.handleDragEnd);
    },
    removePaintListeners() {
      document.removeEventListener('mouseup', this.stopPainting);
    },
    updateShelfRect(rect) {
      const shelves = this.currentLayout.shelves.map(item => String(item.id) === String(rect.id) ? { ...item, ...rect } : item);
      this.localLayout = { ...this.currentLayout, shelves };
    },
    validateShelf(rect, shelfId) {
      const grid = this.currentLayout.grid;
      if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > grid.cols || rect.y + rect.h > grid.rows) return false;
      const otherShelves = this.currentLayout.shelves.filter(item => String(item.id) !== String(shelfId));
      if (otherShelves.some(item => isOverlap(rect, item))) return false;
      return !this.currentLayout.aisles.some(item => isOverlap(rect, item));
    },
    handleFloorMouseDown(event) {
      if (!this.editable || this.tool === 'select') return;
      if (event.button !== 0) return;
      event.preventDefault();
      const rect = this.$refs.floor.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / this.cellSize);
      const y = Math.floor((event.clientY - rect.top) / this.cellSize);
      this.painting = true;
      this.paintedCells = new Set();
      this.paintCell(x, y);
      document.addEventListener('mouseup', this.stopPainting);
    },
    handleFloorMouseMove(event) {
      if (!this.editable || !this.painting || this.tool === 'select') return;
      const rect = this.$refs.floor.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / this.cellSize);
      const y = Math.floor((event.clientY - rect.top) / this.cellSize);
      this.paintCell(x, y);
    },
    paintCell(x, y) {
      if (x < 0 || y < 0 || x >= this.currentLayout.grid.cols || y >= this.currentLayout.grid.rows) return;
      const key = `${x}_${y}`;
      if (this.paintedCells.has(key)) return;
      this.paintedCells.add(key);
      if (this.tool === 'aisle') this.addAisle(x, y);
      if (this.tool === 'erase') this.eraseAisle(x, y);
    },
    stopPainting() {
      this.painting = false;
      this.paintedCells = new Set();
      this.removePaintListeners();
    },
    handleContextMenu() {
      return false;
    },
    addAisle(x, y) {
      const aisle = { id: `aisle_${x}_${y}_${Date.now()}`, x, y, w: 1, h: 1 };
      if (this.currentLayout.shelves.some(item => isOverlap(aisle, item))) {
        this.$message.warning('过道不能覆盖货架');
        return;
      }
      if (this.currentLayout.aisles.some(item => isOverlap(aisle, item))) return;
      this.localLayout = { ...this.currentLayout, aisles: [...this.currentLayout.aisles, aisle] };
      this.$emit('layout-change', cloneLayout(this.currentLayout));
    },
    eraseAisle(x, y) {
      const aisles = this.currentLayout.aisles.filter(item => !(x >= item.x && x < item.x + item.w && y >= item.y && y < item.y + item.h));
      this.localLayout = { ...this.currentLayout, aisles };
      this.$emit('layout-change', cloneLayout(this.currentLayout));
    },
    handleAisleClick(aisle) {
      if (this.editable && this.tool === 'erase') this.eraseAisle(aisle.x, aisle.y);
    },
    applyGridSize() {
      if (!this.editable) return;
      const oldGrid = this.currentLayout.grid;
      const newCols = Math.max(Number(this.gridColsInput) || oldGrid.cols, this.minGridCols);
      const newRows = Math.max(Number(this.gridRowsInput) || oldGrid.rows, this.minGridRows);
      this.gridColsInput = newCols;
      this.gridRowsInput = newRows;
      if (newCols === oldGrid.cols && newRows === oldGrid.rows) return;

      const deltaCols = newCols - oldGrid.cols;
      const deltaRows = newRows - oldGrid.rows;
      const shiftX = deltaCols > 0 ? Math.ceil(deltaCols / 2) : Math.min(0, Math.ceil(deltaCols / 2));
      const shiftY = deltaRows > 0 ? Math.ceil(deltaRows / 2) : Math.min(0, Math.ceil(deltaRows / 2));

      const moveRect = item => ({
        ...item,
        x: Math.max(0, item.x + shiftX),
        y: Math.max(0, item.y + shiftY)
      });
      this.localLayout = {
        ...this.currentLayout,
        grid: { ...oldGrid, cols: newCols, rows: newRows },
        shelves: this.currentLayout.shelves.map(moveRect),
        aisles: this.currentLayout.aisles.map(moveRect).filter(item => item.x + item.w <= newCols && item.y + item.h <= newRows)
      };
      this.$emit('layout-change', cloneLayout(this.currentLayout));
    },
    exportImage() {
      const layout = this.currentLayout;
      const canvas = document.createElement('canvas');
      const width = layout.grid.cols * this.cellSize;
      const height = layout.grid.rows * this.cellSize + 44;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f7f9fc';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#1f2d3d';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(this.warehouseName, 16, 28);
      ctx.translate(0, 44);
      ctx.strokeStyle = '#d8dee9';
      for (let x = 0; x <= layout.grid.cols; x++) {
        ctx.beginPath(); ctx.moveTo(x * this.cellSize, 0); ctx.lineTo(x * this.cellSize, layout.grid.rows * this.cellSize); ctx.stroke();
      }
      for (let y = 0; y <= layout.grid.rows; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * this.cellSize); ctx.lineTo(layout.grid.cols * this.cellSize, y * this.cellSize); ctx.stroke();
      }
      layout.aisles.forEach(item => {
        ctx.fillStyle = '#d9dde6';
        ctx.fillRect(item.x * this.cellSize, item.y * this.cellSize, item.w * this.cellSize, item.h * this.cellSize);
      });
      this.viewShelves.forEach(shelf => {
        const rect = { x: shelf.position.x * this.cellSize, y: shelf.position.y * this.cellSize, w: shelf.width * this.cellSize, h: shelf.height * this.cellSize };
        ctx.fillStyle = '#2f6f73';
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.fillText(shelf.name, rect.x + 8, rect.y + 20);
      });
      const link = document.createElement('a');
      link.download = `${this.warehouseName || '位置图'}-2D.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    },
    getLayout() {
      return cloneLayout(this.currentLayout);
    }
  }
};
</script>

<style lang="scss" scoped>
.warehouse-grid-map {
  height: 100%;
  background: #fff;
  border: 1px solid #dfe5ee;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .grid-toolbar {
    height: 44px;
    padding: 0 12px;
    border-bottom: 1px solid #e6ebf2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #1f2d3d;
      span { color: #7b8794; font-size: 12px; }
      ::v-deep .el-input-number--mini {
        width: 82px;
      }
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .grid-scroll {
    flex: 1;
    overflow: auto;
    min-height: 0;
    background: #eef2f6;
    padding: 16px;
  }

  .grid-floor {
    position: relative;
    background-color: #fbfcfe;
    background-image:
      linear-gradient(to right, #dbe2ea 1px, transparent 1px),
      linear-gradient(to bottom, #dbe2ea 1px, transparent 1px);
    border: 2px solid #9aa8b8;
    box-shadow: 0 8px 22px rgba(31,45,61,.12);

    &.editing {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }
  }

  .aisle-block {
    position: absolute;
    background: repeating-linear-gradient(135deg, #d9dde6, #d9dde6 8px, #c8ced8 8px, #c8ced8 16px);
    border: 1px solid #aeb8c5;
    color: #5d6673;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    span { transform: scale(.9); }
  }

  .grid-shelf {
    position: absolute;
    background: #2f6f73;
    border: 2px solid #174d51;
    color: #fff;
    padding: 6px;
    box-sizing: border-box;
    cursor: pointer;
    overflow: hidden;
    transition: box-shadow .15s, border-color .15s;

    &.selected { border-color: #f2b84b; box-shadow: 0 0 0 3px rgba(242,184,75,.28); }
    &.dragging { opacity: .86; z-index: 8; }
    &.invalid { border-color: #d94f4f; background: #9c3f3f; }

    .shelf-head {
      display: flex;
      justify-content: space-between;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
    }

    .shelf-meta {
      margin-top: 3px;
      font-size: 11px;
      color: rgba(255,255,255,.78);
      white-space: nowrap;
    }

    .layer-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 3px;
      margin-top: 6px;
    }

    .layer-dot {
      width: 12px;
      height: 12px;
      border: 1px solid rgba(255,255,255,.65);
      padding: 0;
      cursor: pointer;
      &.free { background: #f8fbff; }
      &.used { background: #f2b84b; }
      &.locked { background: #d94f4f; }
    }
  }

  .grid-legend {
    height: 34px;
    border-top: 1px solid #e6ebf2;
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 0 12px;
    color: #5d6673;
    font-size: 12px;
    flex-shrink: 0;

    i {
      display: inline-block;
      width: 10px;
      height: 10px;
      margin-right: 6px;
      border: 1px solid #aeb8c5;
      vertical-align: -1px;
      &.free { background: #f8fbff; }
      &.used { background: #f2b84b; }
      &.locked { background: #d94f4f; }
      &.aisle { background: #d9dde6; }
    }
  }
}
</style>
