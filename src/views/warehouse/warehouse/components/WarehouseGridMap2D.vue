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
          <!-- <el-button :type="tool === 'select' ? 'primary' : 'default'" icon="el-icon-rank" @click="tool = 'select'">选择</el-button> -->
          <el-button :type="tool === 'aisleSettings' ? 'primary' : 'default'" icon="el-icon-s-operation" @click="toggleAisleSettings">过道设置</el-button>
        </el-button-group>
        <span class="zoom-indicator">{{ zoomPercent }}%</span>
        <el-button size="mini" :disabled="zoom === 1" @click="resetZoom">重置缩放</el-button>
        <span class="zoom-hint">Ctrl + 滚轮缩放</span>
        <el-button v-if="editable" size="mini" icon="el-icon-refresh-left" @click="$emit('reset-layout')">重置</el-button>
        <el-button size="mini" icon="el-icon-download" @click="exportImage">导出</el-button>
      </div>
    </div>

    <div class="grid-scroll" :class="{ panning: isPanning }" @wheel="handleWheel" @mousedown="handlePanStart">
      <div class="grid-floor-wrapper" :style="floorWrapperStyle">
      <div
        class="grid-floor"
        :style="floorStyle"
        :class="{ editing: editable }"
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
          :style="[shelfStyle(shelf), getShelfAreaStyle(shelf)]"
          @mousedown.stop="startDrag($event, shelf)"
          @click.stop="$emit('shelf-select', shelf)"
        >
          <!-- 货架头部：名称 + 占用比 + 元信息全在一行 -->
          <div class="shelf-head">
            <span
              v-if="getShelfAreaLabel(shelf)"
              class="shelf-area-tag"
              :style="{ background: getShelfAreaColor(shelf) }"
            >{{ getShelfAreaLabel(shelf) }}</span>
            <span class="shelf-name">{{ shelf.name }}</span>
            <!-- 老库房只有一层，层数与占位统计无意义，隐藏 -->
            <span class="shelf-meta-inline" v-if="!isOldShelf(shelf) && shelf.layers && shelf.layers.length">{{ shelf.layers.length }}层</span>
            <span class="shelf-count" v-if="!isOldShelf(shelf)" :class="getUsageClass(shelf)">{{ getFilledCount(shelf) }}/{{ getTotalCount(shelf) }}</span>
          </div>
          <!-- 所有容器色块平铺展示（2D模式下新老库统一） -->
          <div class="layers-grid">
            <template v-for="layer in shelf.layers">
              <button
                v-for="(container, ci) in getLayerContainers(layer)"
                :key="layer.id + '_' + ci"
                type="button"
                class="container-dot"
                :class="[getContainerStatus(container), { selected: isContainerSelected(container) }]"
                :style="getContainerStyle(container)"
                :title="getContainerTitle(container)"
                @click.stop="handleContainerDotClick(container)"
              ></button>
            </template>
          </div>
        </div>
      </div>
      </div>
    </div>

    <div v-if="aisleVisible && !hideInternalAisleSettings" class="aisle-settings">
      <div class="aisle-settings-title">过道设置</div>
      <div class="aisle-section">
        <div class="aisle-section-label">排间过道</div>
        <div v-for="(row, idx) in aisleSettings.rows" :key="'r'+idx" class="aisle-row">
          <span>第 {{ row.afterIndex }} 排后 · 宽 {{ row.width }} 格</span>
          <el-button type="text" size="mini" style="color:#f56c6c" @click="removeRowAisle(idx)">删除</el-button>
        </div>
        <div class="aisle-add">
          <el-select v-model="newRowAisleAfter" size="mini" placeholder="选择排" style="width:100px">
            <el-option v-for="i in shelfRowCount" :key="i" :label="'第'+i+'排后'" :value="i" />
          </el-select>
          <el-input-number v-model="newRowAisleWidth" size="mini" :min="1" :max="5" style="width:90px" />
          <el-button size="mini" type="primary" @click="addRowAisle()">添加</el-button>
        </div>
      </div>
      <div class="aisle-section">
        <div class="aisle-section-label">列间过道</div>
        <div v-for="(col, idx) in aisleSettings.cols" :key="'c'+idx" class="aisle-row">
          <span>第 {{ col.afterIndex }} 列后 · 宽 {{ col.width }} 格</span>
          <el-button type="text" size="mini" style="color:#f56c6c" @click="removeColAisle(idx)">删除</el-button>
        </div>
        <div class="aisle-add">
          <el-select v-model="newColAisleAfter" size="mini" placeholder="选择列" style="width:100px">
            <el-option v-for="i in shelfColCount" :key="i" :label="'第'+i+'列后'" :value="i" />
          </el-select>
          <el-input-number v-model="newColAisleWidth" size="mini" :min="1" :max="5" style="width:90px" />
          <el-button size="mini" type="primary" @click="addColAisle()">添加</el-button>
        </div>
      </div>
    </div>

    <div class="grid-legend">
      <span><i class="free"></i>空闲</span>
      <span><i class="used"></i>有物料</span>
      <span><i class="locked"></i>锁定</span>
      <span><i class="aisle"></i>过道</span>
      <template v-if="areaLegend.length">
        <span class="legend-divider"></span>
        <span v-for="area in areaLegend" :key="'area-'+area.code" class="legend-area">
          <i :style="{ background: area.color, borderColor: area.color }"></i>区域{{ area.code }}
        </span>
      </template>
      <span class="legend-hint">容器颜色按状态着色</span>
    </div>
  </div>
</template>

<script>
import { getContainerColor, buildAreaColorMap, normalizeAreaCode } from '../utils/colorHelper';
import { buildColumnOrder } from '../utils/locationLayoutAdapter';

function cloneLayout(layout) {
  return JSON.parse(JSON.stringify(layout || { grid: { rows: 12, cols: 20, cellSize: 32 }, shelves: [], aisles: [], aisleSettings: { rows: [], cols: [] } }));
}

function isOverlap(a, b) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

// 生成默认过道配置：两边为单（靠墙只显示一排/列），中间两个一组
function generateDefaultAisles(count) {
  if (count <= 1) return [];
  const set = new Set();
  set.add(1);
  set.add(count - 1);
  let i = 3;
  while (i < count - 1) {
    set.add(i);
    i += 2;
  }
  return Array.from(set).sort((a, b) => a - b).map(idx => ({ afterIndex: idx, width: 2 }));
}

export default {
  name: 'WarehouseGridMap2D',
  props: {
    warehouseName: { type: String, default: '库房' },
    shelves: { type: Array, default: () => [] },
    layout: { type: Object, default: null },
    editable: { type: Boolean, default: false },
    showToolbar: { type: Boolean, default: true },
    selectedShelf: { type: Object, default: null },
    dateColorMap: { type: Object, default: () => ({}) },
    selectedContainerCodes: { type: Array, default: () => [] },
    hideInternalAisleSettings: { type: Boolean, default: false }
  },
  data() {
    return {
      localLayout: cloneLayout(this.layout),
      tool: 'select',
      dragging: null,
      painting: false,
      aisleVisible: false,
      aisleSettings: { rows: [], cols: [] },
      newRowAisleAfter: 1,
      newRowAisleWidth: 2,
      newColAisleAfter: 1,
      newColAisleWidth: 2,
      gridColsInput: 20,
      gridRowsInput: 12,
      zoom: 1,
      isPanning: false,
      panStart: null
    };
  },
  computed: {
    // 基础布局（不含过道偏移）
    baseLayout() {
      const layout = this.localLayout || {};
      return {
        grid: { rows: 12, cols: 20, cellSize: 32, ...(layout.grid || {}) },
        shelves: layout.shelves || [],
        aisles: layout.aisles || []
      };
    },
    // 排数：基于 rowCode
    shelfRowCount() {
      return Math.max(1, ...this.shelves.map(s => Number(s.rowCode) || 0));
    },
    // 列编码 -> 列序号(1-based) 映射：A1/B1 视为不同列，避免只取数字导致的重叠
    columnOrderMap() {
      return buildColumnOrder(this.shelves);
    },
    // 列数：去重后的列编码数量
    shelfColCount() {
      return Math.max(1, Object.keys(this.columnOrderMap).length);
    },
    // 构建排索引 -> 布局 y 位置和高度的映射
    rowLayoutMap() {
      const map = {};
      const shelves = this.baseLayout.shelves;
      shelves.forEach(s => {
        const rowIdx = Number(s.rowCode) || 0;
        if (!rowIdx) return;
        if (!map[rowIdx]) {
          map[rowIdx] = { y: s.y, h: s.h };
        } else {
          map[rowIdx].y = Math.min(map[rowIdx].y, s.y);
          map[rowIdx].h = Math.max(map[rowIdx].h, s.h);
        }
      });
      return map;
    },
    // 构建列索引 -> 布局 x 位置和宽度的映射
    colLayoutMap() {
      const map = {};
      const shelves = this.baseLayout.shelves;
      shelves.forEach(s => {
        const colIdx = this.columnOrderMap[String(s.columnCode || s.columnId || '1')] || 0;
        if (!colIdx) return;
        if (!map[colIdx]) {
          map[colIdx] = { x: s.x, w: s.w };
        } else {
          map[colIdx].x = Math.min(map[colIdx].x, s.x);
          map[colIdx].w = Math.max(map[colIdx].w, s.w);
        }
      });
      return map;
    },
    // 根据 aisleSettings 计算每个排/列的偏移量
    rowShiftMap() {
      const map = {};
      const sorted = this.aisleSettings.rows.slice().sort((a, b) => a.afterIndex - b.afterIndex);
      let cumShift = 0;
      sorted.forEach(r => {
        cumShift += r.width;
        map[r.afterIndex] = cumShift;
      });
      return map;
    },
    colShiftMap() {
      const map = {};
      const sorted = this.aisleSettings.cols.slice().sort((a, b) => a.afterIndex - b.afterIndex);
      let cumShift = 0;
      sorted.forEach(c => {
        cumShift += c.width;
        map[c.afterIndex] = cumShift;
      });
      return map;
    },
    // 过道偏移后的货架位置
    aisleShiftedShelves() {
      const shelves = this.baseLayout.shelves;
      const { rows, cols } = this.aisleSettings;
      if (!rows.length && !cols.length) return shelves;

      return shelves.map(s => {
        let dx = 0, dy = 0;
        const rowIdx = Number(s.rowCode) || 0;
        const colIdx = this.columnOrderMap[String(s.columnCode || s.columnId || '1')] || 0;
        // 累积所有 afterIndex < 当前排/列的偏移
        Object.keys(this.rowShiftMap).forEach(k => {
          if (rowIdx > Number(k)) dy = this.rowShiftMap[k];
        });
        Object.keys(this.colShiftMap).forEach(k => {
          if (colIdx > Number(k)) dx = this.colShiftMap[k];
        });
        return { ...s, x: s.x + dx, y: s.y + dy };
      });
    },
    // 计算过道的实际位置
    computedAisles() {
      const { rows, cols } = this.aisleSettings;
      if (!rows.length && !cols.length) return [];
      const aisles = [];
      const grid = this.aisleGrid;

      // 排间过道
      rows.slice().sort((a, b) => a.afterIndex - b.afterIndex).forEach(r => {
        const rowInfo = this.rowLayoutMap[r.afterIndex];
        if (!rowInfo) return;
        // 过道 y = 该排底部 + 之前所有过道累积偏移
        let yShift = 0;
        Object.keys(this.rowShiftMap).forEach(k => {
          if (r.afterIndex > Number(k)) yShift = this.rowShiftMap[k];
        });
        const aisleY = rowInfo.y + rowInfo.h + yShift;
        aisles.push({
          id: 'aisle_r_' + r.afterIndex,
          x: 0,
          y: aisleY,
          w: grid.cols,
          h: r.width
        });
      });

      // 列间过道
      cols.slice().sort((a, b) => a.afterIndex - b.afterIndex).forEach(c => {
        const colInfo = this.colLayoutMap[c.afterIndex];
        if (!colInfo) return;
        let xShift = 0;
        Object.keys(this.colShiftMap).forEach(k => {
          if (c.afterIndex > Number(k)) xShift = this.colShiftMap[k];
        });
        const aisleX = colInfo.x + colInfo.w + xShift;
        aisles.push({
          id: 'aisle_c_' + c.afterIndex,
          x: aisleX,
          y: 0,
          w: c.width,
          h: grid.rows
        });
      });

      return aisles;
    },
    // 最终展示的 layout（含过道）
    currentLayout() {
      const base = this.baseLayout;
      const { rows, cols } = this.aisleSettings;
      const hasAisleSettings = rows.length > 0 || cols.length > 0;
      return {
        grid: base.grid,
        shelves: base.shelves,
        aisles: hasAisleSettings ? this.computedAisles : base.aisles,
        aisleSettings: this.aisleSettings
      };
    },
    // 含过道偏移的网格尺寸
    aisleGrid() {
      const grid = this.baseLayout.grid;
      const { rows, cols } = this.aisleSettings;
      const totalRowShift = rows.reduce((sum, r) => sum + r.width, 0);
      const totalColShift = cols.reduce((sum, c) => sum + c.width, 0);
      return { ...grid, rows: grid.rows + totalRowShift, cols: grid.cols + totalColShift };
    },
    cellSize() {
      return this.baseLayout.grid.cellSize || 32;
    },
    zoomPercent() {
      return Math.round(this.zoom * 100);
    },
    floorStyle() {
      const grid = this.aisleGrid;
      return {
        width: `${grid.cols * this.cellSize}px`,
        height: `${grid.rows * this.cellSize}px`,
        backgroundSize: `${this.cellSize}px ${this.cellSize}px`,
        transform: `scale(${this.zoom})`,
        transformOrigin: '0 0'
      };
    },
    floorWrapperStyle() {
      const grid = this.aisleGrid;
      return {
        width: `${grid.cols * this.cellSize * this.zoom}px`,
        height: `${grid.rows * this.cellSize * this.zoom}px`,
        position: 'relative'
      };
    },
    viewShelves() {
      const layoutMap = new Map(this.aisleShiftedShelves.map(item => [String(item.id), item]));
      return this.shelves.map(shelf => {
        const hit = layoutMap.get(String(shelf.id));
        return {
          ...shelf,
          ...(hit ? { position: { x: hit.x, y: hit.y }, width: hit.w, height: hit.h, layout: hit } : {})
        };
      });
    },
    minGridCols() {
      const aisles = this.computedAisles;
      return Math.max(1, ...this.aisleShiftedShelves.map(item => item.x + item.w), ...aisles.map(item => item.x + item.w));
    },
    minGridRows() {
      const aisles = this.computedAisles;
      return Math.max(1, ...this.aisleShiftedShelves.map(item => item.y + item.h), ...aisles.map(item => item.y + item.h));
    },
    // 是否老库房（仅老库做 areaCode 区域高亮）
    isOldWarehouse() {
      return this.shelves.some(s => String(s.warehouseType) === '2');
    },
    // areaCode -> 颜色 映射（仅老库房构建）
    areaColorMap() {
      if (!this.isOldWarehouse) return {};
      return buildAreaColorMap(this.shelves.map(s => s.areaCode));
    },
    // 底部图例用的区域列表 [{ code, color }]
    areaLegend() {
      if (!this.isOldWarehouse) return [];
      const codes = [...new Set(this.shelves.map(s => normalizeAreaCode(s.areaCode)))].sort();
      return codes.map(code => ({ code, color: this.areaColorMap[code] }));
    }
  },
  watch: {
    editable: {
      immediate: true,
      handler(val) {
        if (val) {
          this.tool = 'aisleSettings';
          this.aisleVisible = true;
        } else {
          this.tool = 'select';
          this.aisleVisible = false;
        }
      }
    },
    tool(newTool) {
      if (newTool !== 'aisleSettings') {
        this.aisleVisible = false;
      }
    },
    aisleVisible(val) {
      this.$emit('aisle-visible-change', val);
    },
    aisleSettings: {
      deep: true,
      handler(val) {
        this.$emit('aisle-settings-change', val);
      }
    },
    layout: {
      deep: true,
      handler(value) {
        this.localLayout = cloneLayout(value);
        this.syncGridInputs();
        if (value && value.aisleSettings) {
          this.aisleSettings = JSON.parse(JSON.stringify(value.aisleSettings));
        } else {
          this.aisleSettings = { rows: [], cols: [] };
          this.initDefaultAisleSettings();
        }
      }
    },
    shelves: {
      deep: true,
      handler() {
        this.initDefaultAisleSettings();
      }
    }
  },
  mounted() {
    this.syncGridInputs();
    this.$nextTick(() => {
      this.initDefaultAisleSettings();
    });
  },
  beforeDestroy() {
    this.removeDragListeners();
    this.removePaintListeners();
    this.removePanListeners();
  },
  methods: {
    handlePanStart(event) {
      if (event.button !== 0) return;
      if (this.editable && this.tool !== 'select') return;
      event.preventDefault();
      this.isPanning = true;
      const scrollEl = this.$el.querySelector('.grid-scroll');
      this.panStart = {
        x: event.clientX,
        y: event.clientY,
        scrollLeft: scrollEl.scrollLeft,
        scrollTop: scrollEl.scrollTop
      };
      document.addEventListener('mousemove', this.handlePanMove);
      document.addEventListener('mouseup', this.handlePanEnd);
    },
    handlePanMove(event) {
      if (!this.isPanning || !this.panStart) return;
      const scrollEl = this.$el.querySelector('.grid-scroll');
      scrollEl.scrollLeft = this.panStart.scrollLeft - (event.clientX - this.panStart.x);
      scrollEl.scrollTop = this.panStart.scrollTop - (event.clientY - this.panStart.y);
    },
    handlePanEnd() {
      this.isPanning = false;
      this.panStart = null;
      document.removeEventListener('mousemove', this.handlePanMove);
      document.removeEventListener('mouseup', this.handlePanEnd);
    },
    removePanListeners() {
      document.removeEventListener('mousemove', this.handlePanMove);
      document.removeEventListener('mouseup', this.handlePanEnd);
    },
    handleWheel(event) {
      if (!event.ctrlKey) return;
      event.preventDefault();
      const direction = event.deltaY > 0 ? -1 : 1;
      const newZoom = Math.round((this.zoom + direction * 0.1) * 10) / 10;
      const clamped = Math.min(2, Math.max(0.5, newZoom));
      if (clamped === this.zoom) return;
      const scrollEl = this.$el.querySelector('.grid-scroll');
      const rect = scrollEl.getBoundingClientRect();
      const mouseX = event.clientX - rect.left + scrollEl.scrollLeft;
      const mouseY = event.clientY - rect.top + scrollEl.scrollTop;
      const gridX = mouseX / this.zoom;
      const gridY = mouseY / this.zoom;
      this.zoom = clamped;
      this.$nextTick(() => {
        scrollEl.scrollLeft = gridX * this.zoom - (event.clientX - rect.left);
        scrollEl.scrollTop = gridY * this.zoom - (event.clientY - rect.top);
      });
    },
    resetZoom() {
      this.zoom = 1;
    },
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
      const containers = (layer.containers || []).filter(c => c.materialCode || String(c.status) === '1');
      if (!containers.length) return `第${layer.level || ''}层 - 空`;
      return containers.map(c => c.materialName || c.materialCode || c.code || '').filter(Boolean).join(', ');
    },
    getLayerContainers(layer) {
      return layer.containers && layer.containers.length ? layer.containers : [{}];
    },
    getContainerStatus(container) {
      if (!container || (!container.materialCode && String(container.status) !== '1' && String(container.status) !== '2')) return 'free';
      if (String(container.status) === '2') return 'locked';
      return 'used';
    },
    isContainerSelected(container) {
      if (!container) return false
      const code = container.containerCode || container.code || ''
      return code && this.selectedContainerCodes.includes(code)
    },
    getContainerStyle(container) {
      if (!container || !container.materialCode) return {};
      return {};
    },
    getContainerTitle(container) {
      if (!container) return '空位';
      if (String(container.status) === '2') {
        const parts = ['[锁定]'];
        if (container.materialName || container.materialCode) parts.push(container.materialName || container.materialCode);
        if (container.code) parts.push(container.code);
        return parts.join(' ');
      }
      if (!container.materialCode) return '空位';
      const parts = [container.materialName || container.materialCode];
      if (container.code) parts.push(container.code);
      if (container.storageDate) parts.push(container.storageDate);
      return parts.join(' | ');
    },
    isOldShelf(shelf) {
      return String(shelf.warehouseType) === '2';
    },
    getUsageClass(shelf) {
      const total = this.getTotalCount(shelf);
      if (total === 0) return '';
      const rate = this.getFilledCount(shelf) / total;
      if (rate >= 0.9) return 'usage-high';
      if (rate >= 0.5) return 'usage-mid';
      return 'usage-low';
    },
    // 货架区域色（仅老库房）：返回 hex 或 null
    getShelfAreaColor(shelf) {
      if (!this.isOldWarehouse) return null;
      return this.areaColorMap[normalizeAreaCode(shelf.areaCode)] || null;
    },
    // 老库货架的区域边框 + 半透明底色样式（叠加在默认渐变背景之上）
    getShelfAreaStyle(shelf) {
      const color = this.getShelfAreaColor(shelf);
      if (!color) return {};
      return {
        borderColor: color,
        boxShadow: `inset 0 0 0 2px ${color}`,
        // 用半透明色块叠加在原渐变上做区域底色区分
        backgroundImage: `linear-gradient(${color}55, ${color}55), linear-gradient(160deg, #1e5c60 0%, #2f6f73 100%)`
      };
    },
    // 货架内区域标签文本（仅老库房）
    getShelfAreaLabel(shelf) {
      if (!this.isOldWarehouse) return '';
      return normalizeAreaCode(shelf.areaCode);
    },
    handleContainerDotClick(container) {
      if (container && (container.materialCode || String(container.status) === '1')) {
        this.$emit('container-click', container);
      }
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
      const dx = Math.round((event.clientX - this.dragging.startX) / (this.cellSize * this.zoom));
      const dy = Math.round((event.clientY - this.dragging.startY) / (this.cellSize * this.zoom));
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
      const shelves = this.baseLayout.shelves.map(item => String(item.id) === String(rect.id) ? { ...item, ...rect } : item);
      this.localLayout = { ...this.baseLayout, shelves };
    },
    validateShelf(rect, shelfId) {
      const grid = this.baseLayout.grid;
      if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > grid.cols || rect.y + rect.h > grid.rows) return false;
      const otherShelves = this.baseLayout.shelves.filter(item => String(item.id) !== String(shelfId));
      if (otherShelves.some(item => isOverlap(rect, item))) return false;
      return !this.currentLayout.aisles.some(item => isOverlap(rect, item));
    },
    handleFloorMouseDown(event) {
      if (!this.editable || this.tool === 'select') return;
      if (event.button !== 0) return;
      event.preventDefault();
      const rect = this.$refs.floor.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / (this.cellSize * this.zoom));
      const y = Math.floor((event.clientY - rect.top) / (this.cellSize * this.zoom));
      this.painting = true;
      this.paintedCells = new Set();
      this.paintCell(x, y);
      document.addEventListener('mouseup', this.stopPainting);
    },
    handleFloorMouseMove(event) {
      if (!this.editable || !this.painting || this.tool === 'select') return;
      const rect = this.$refs.floor.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / (this.cellSize * this.zoom));
      const y = Math.floor((event.clientY - rect.top) / (this.cellSize * this.zoom));
      this.paintCell(x, y);
    },
    paintCell(x, y) {
      if (x < 0 || y < 0 || x >= this.baseLayout.grid.cols || y >= this.baseLayout.grid.rows) return;
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
      if (this.baseLayout.shelves.some(item => isOverlap(aisle, item))) {
        this.$message.warning('过道不能覆盖货架');
        return;
      }
      if (this.baseLayout.aisles.some(item => isOverlap(aisle, item))) return;
      this.localLayout = { ...this.baseLayout, aisles: [...this.baseLayout.aisles, aisle] };
      this.$emit('layout-change', cloneLayout(this.baseLayout));
    },
    eraseAisle(x, y) {
      const aisles = this.baseLayout.aisles.filter(item => !(x >= item.x && x < item.x + item.w && y >= item.y && y < item.y + item.h));
      this.localLayout = { ...this.baseLayout, aisles };
      this.$emit('layout-change', cloneLayout(this.baseLayout));
    },
    toggleAisleSettings() {
      this.aisleVisible = !this.aisleVisible;
      if (this.aisleVisible) {
        this.tool = 'aisleSettings';
      } else {
        this.tool = 'select';
      }
    },
    addRowAisle(afterIndex, width) {
      const targetAfter = afterIndex !== undefined ? afterIndex : this.newRowAisleAfter;
      const targetWidth = width !== undefined ? width : this.newRowAisleWidth;
      const idx = this.aisleSettings.rows.findIndex(r => r.afterIndex === targetAfter);
      if (idx >= 0) {
        this.$set(this.aisleSettings.rows, idx, { afterIndex: targetAfter, width: targetWidth });
      } else {
        this.aisleSettings.rows.push({ afterIndex: targetAfter, width: targetWidth });
      }
      this.$emit('layout-change', cloneLayout(this.currentLayout));
    },
    removeRowAisle(idx) {
      this.aisleSettings.rows.splice(idx, 1);
      this.$emit('layout-change', cloneLayout(this.currentLayout));
    },
    addColAisle(afterIndex, width) {
      const targetAfter = afterIndex !== undefined ? afterIndex : this.newColAisleAfter;
      const targetWidth = width !== undefined ? width : this.newColAisleWidth;
      const idx = this.aisleSettings.cols.findIndex(c => c.afterIndex === targetAfter);
      if (idx >= 0) {
        this.$set(this.aisleSettings.cols, idx, { afterIndex: targetAfter, width: targetWidth });
      } else {
        this.aisleSettings.cols.push({ afterIndex: targetAfter, width: targetWidth });
      }
      this.$emit('layout-change', cloneLayout(this.currentLayout));
    },
    removeColAisle(idx) {
      this.aisleSettings.cols.splice(idx, 1);
      this.$emit('layout-change', cloneLayout(this.currentLayout));
    },
    handleAisleClick(aisle) {
      if (this.editable && this.tool === 'erase') this.eraseAisle(aisle.x, aisle.y);
    },
    applyGridSize() {
      if (!this.editable) return;
      const oldGrid = this.baseLayout.grid;
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
        ...this.baseLayout,
        grid: { ...oldGrid, cols: newCols, rows: newRows },
        shelves: this.baseLayout.shelves.map(moveRect),
        aisles: this.baseLayout.aisles.map(moveRect).filter(item => item.x + item.w <= newCols && item.y + item.h <= newRows)
      };
      this.$emit('layout-change', cloneLayout(this.baseLayout));
    },
    getShelfStats() {
      const total = this.viewShelves.reduce((s, sh) => s + this.getTotalCount(sh), 0)
      const filled = this.viewShelves.reduce((s, sh) => s + this.getFilledCount(sh), 0)
      const free = total - filled
      return { total, filled, free }
    },
    // 初始化默认过道设置（当没有已保存保持过道时自动生成）
    initDefaultAisleSettings() {
      // If layout already has aisleSettings, load it and return
      if (this.layout && this.layout.aisleSettings) {
        this.aisleSettings = JSON.parse(JSON.stringify(this.layout.aisleSettings));
        return;
      }
      // 如果已经有手动设置的过道，不覆盖
      if (this.aisleSettings.rows.length > 0 || this.aisleSettings.cols.length > 0) return;
      const rowCount = this.shelfRowCount;
      const colCount = this.shelfColCount;
      if (rowCount <= 0 && colCount <= 0) return;
      this.aisleSettings = {
        rows: generateDefaultAisles(rowCount),
        cols: generateDefaultAisles(colCount)
      };
    },
    exportImage() {
      const grid = this.aisleGrid;
      const aisles = this.aisleSettings.rows.length || this.aisleSettings.cols.length ? this.computedAisles : this.baseLayout.aisles;
      const canvas = document.createElement('canvas');
      const stats = this.getShelfStats()
      const width = grid.cols * this.cellSize;
      const height = grid.rows * this.cellSize + 64;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f7f9fc';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#1f2d3d';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(this.warehouseName, 16, 28);
      ctx.fillStyle = '#7b8794';
      ctx.font = '12px sans-serif';
      ctx.fillText(`总货位数: ${stats.total}    已用数: ${stats.filled}    空闲数: ${stats.free}`, 16, 46);
      ctx.translate(0, 64);
      ctx.strokeStyle = '#d8dee9';
      for (let x = 0; x <= grid.cols; x++) {
        ctx.beginPath(); ctx.moveTo(x * this.cellSize, 0); ctx.lineTo(x * this.cellSize, grid.rows * this.cellSize); ctx.stroke();
      }
      for (let y = 0; y <= grid.rows; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * this.cellSize); ctx.lineTo(grid.cols * this.cellSize, y * this.cellSize); ctx.stroke();
      }
      aisles.forEach(item => {
        ctx.fillStyle = '#d9dde6';
        ctx.fillRect(item.x * this.cellSize, item.y * this.cellSize, item.w * this.cellSize, item.h * this.cellSize);
      });
      this.viewShelves.forEach(shelf => {
        if (!shelf.position) return;
        const rx = shelf.position.x * this.cellSize;
        const ry = shelf.position.y * this.cellSize;
        const rw = shelf.width * this.cellSize;
        const rh = shelf.height * this.cellSize;
        // 老库房：货架底色/边框反映区域色
        const areaColor = this.getShelfAreaColor(shelf);
        if (areaColor) {
          ctx.fillStyle = '#2f6f73';
          ctx.fillRect(rx, ry, rw, rh);
          ctx.fillStyle = areaColor + '66';
          ctx.fillRect(rx, ry, rw, rh);
          ctx.strokeStyle = areaColor;
          ctx.lineWidth = 2;
        } else {
          ctx.fillStyle = '#2f6f73';
          ctx.fillRect(rx, ry, rw, rh);
          ctx.strokeStyle = '#174d51';
          ctx.lineWidth = 1.5;
        }
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        const nameText = areaColor ? `[${this.getShelfAreaLabel(shelf)}] ${shelf.name}` : shelf.name;
        ctx.fillText(nameText, rx + 5, ry + 14);
        // 绘制容器色块 - 按状态着色，与界面一致
        const dotSize = 14;
        const dotGap = 3;
        let dotX = rx + 5;
        let dotY = ry + 20;
        (shelf.layers || []).forEach(layer => {
          (layer.containers || []).forEach(container => {
            if (dotX + dotSize > rx + rw - 2) { dotX = rx + 5; dotY += dotSize + dotGap; }
            if (dotY + dotSize > ry + rh - 2) return;
            // 使用与界面一致的状态颜色
            const status = this.getContainerStatus(container);
            if (status === 'used') {
              ctx.fillStyle = '#67C23A'; // 绿色 - 有物料
            } else if (status === 'locked') {
              ctx.fillStyle = '#E6A23C'; // 黄色 - 锁定
            } else {
              ctx.fillStyle = '#ffffff'; // 白色 - 空闲
            }
            ctx.fillRect(dotX, dotY, dotSize, dotSize);
            dotX += dotSize + dotGap;
          });
        });
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

    .zoom-indicator {
      font-size: 12px;
      color: #606266;
      font-weight: 600;
      min-width: 38px;
      text-align: center;
    }

    .zoom-hint {
      font-size: 11px;
      color: #aeb8c5;
      white-space: nowrap;
    }
  }

  .grid-scroll {
    flex: 1;
    overflow: auto;
    min-height: 0;
    background: #eef2f6;
    padding: 16px;
    cursor: grab;

    &.panning { cursor: grabbing; user-select: none; }
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
    background: linear-gradient(160deg, #1e5c60 0%, #2f6f73 100%);
    border: 2px solid #174d51;
    color: #fff;
    padding: 3px 4px;
    box-sizing: border-box;
    cursor: pointer;
    overflow: hidden;
    transition: box-shadow .15s, border-color .15s, transform .1s;
    display: flex;
    flex-direction: column;
    gap: 1px;

    &:hover { box-shadow: 0 0 0 2px rgba(100,210,220,.4); transform: scale(1.01); z-index: 5; }
    &.selected { border-color: #f2b84b; box-shadow: 0 0 0 3px rgba(242,184,75,.35); }
    &.dragging { opacity: .86; z-index: 8; }
    &.invalid { border-color: #d94f4f; background: #9c3f3f; }

    .shelf-head {
      display: flex;
      align-items: center;
      gap: 4px;
      line-height: 1.3;

      .shelf-area-tag {
        font-size: 11px;
        font-weight: 700;
        color: #fff;
        padding: 0 5px;
        border-radius: 3px;
        line-height: 16px;
        flex-shrink: 0;
        box-shadow: 0 0 0 1px rgba(255,255,255,.35);
      }

      .shelf-name {
        font-size: 14px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
      }

      .shelf-meta-inline {
        font-size: 14px;
        color: rgba(255,255,255,.65);
        white-space: nowrap;
        flex-shrink: 0;
      }

      .shelf-count {
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        padding: 0 3px;
        border-radius: 2px;
        background: rgba(0,0,0,.2);
        flex-shrink: 0;
        &.usage-high { color: #ff7875; }
        &.usage-mid { color: #ffd666; }
        &.usage-low { color: #95de64; }
      }
    }

    .shelf-meta {
      display: none;
    }

    .layers-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 4px;
      overflow: visible;
      align-content: flex-start;
    }

    .container-dot {
      width: 25px;
      height: 25px;
      border: 1px solid rgba(255,255,255,.5);
      border-radius: 3px;
      padding: 0;
      cursor: pointer;
      transition: transform .1s, box-shadow .1s;
      flex-shrink: 0;

      &:hover { transform: scale(1.15); box-shadow: 0 0 6px rgba(255,255,255,.5); z-index: 2; }
      &.free { background: #fff; border-color: rgba(255,255,255,.4); cursor: default; }
      &.used { background: #67C23A; border-color: #529b2e; }
      &.locked { background: #E6A23C; border-color: #b88230; cursor: pointer; }
      &.selected { outline: 3px solid #409EFF; outline-offset: -1px; box-shadow: 0 0 8px rgba(64,158,255,.6); }
    }

    .layer-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
      margin-top: 2px;
    }


    .base-label {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.7);
      font-style: italic;
    }
  }

  .aisle-settings {
    border-top: 1px solid #e6ebf2;
    padding: 10px 12px;
    background: #fafbfe;
    font-size: 13px;
    .aisle-settings-title { font-weight: 700; margin-bottom: 8px; color: #1f2d3d; }
    .aisle-section { margin-bottom: 8px; }
    .aisle-section-label { font-weight: 600; color: #5d6673; font-size: 12px; margin-bottom: 4px; }
    .aisle-row { display: flex; align-items: center; gap: 10px; padding: 3px 0; }
    .aisle-add { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
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
      border-radius: 2px;
      vertical-align: -1px;
      &.free { background: #fff; }
      &.used { background: #67C23A; border-color: #529b2e; }
      &.locked { background: #E6A23C; border-color: #b88230; }
      &.aisle { background: #d9dde6; }
    }

    .legend-divider {
      width: 1px;
      height: 14px;
      background: #d8dee9;
      margin: 0 -6px;
    }

    .legend-area {
      display: inline-flex;
      align-items: center;
    }

    .legend-hint {
      margin-left: auto;
      color: #aeb8c5;
      font-size: 11px;
      font-style: italic;
    }
  }
}
</style>
