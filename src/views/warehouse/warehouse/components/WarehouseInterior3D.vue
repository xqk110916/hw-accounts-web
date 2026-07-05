<template>
  <div class="warehouse-interior-3d">
    <!-- 顶部工具栏 -->
    <div class="interior-toolbar">
      <div class="toolbar-title">
        <i class="el-icon-office-building"></i>
        <span>{{ warehouseName }} - 内部视图</span>
      </div>
      <div class="toolbar-actions">
        <el-button-group v-if="showModeSwitch" size="mini">
          <el-button :type="viewMode === '3d' ? 'primary' : 'default'" @click="switchMode('3d')">3D视图</el-button>
          <!-- <el-button :type="viewMode === '2d' ? 'primary' : 'default'" @click="switchMode('2d')">2D视图</el-button> -->
        </el-button-group>
      </div>
    </div>

    <!-- 3D模式 -->
    <div v-show="viewMode === '3d'" class="view-wrapper">
      <div class="canvas-container" ref="canvasContainer">
        <canvas ref="threeCanvas"></canvas>
      </div>
      <div v-if="tooltip.visible" class="shelf-tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
        <div class="tooltip-title">{{ tooltip.name }}</div>
        <div class="tooltip-stats">已用 {{ tooltip.filled }} / 共 {{ tooltip.total }} 个位置</div>
        <div v-if="showShelfEnterHint" class="tooltip-hint">点击进入货架视图</div>
      </div>
      <div class="control-hint">
        <span>🖱️ 左键拖拽旋转 | 右键拖拽视图 | 滚轮缩放 | 点击货架查看详情</span>
      </div>
      <div v-if="areaLegend.length" class="area-legend-3d">
        <div class="legend-title">区域</div>
        <div v-for="area in areaLegend" :key="'area3d-'+area.code" class="legend-item">
          <i :style="{ background: area.color }"></i>区域{{ area.code }}
        </div>
      </div>
    </div>

    <!-- 2D模式 -->
    <div v-show="viewMode === '2d'" class="view-wrapper view-2d">
      <WarehouseGridMap2D
        :warehouse-name="warehouseName"
        :shelves="shelves"
        :layout="layout"
        :editable="false"
        :selected-shelf="selectedShelf"
        @shelf-select="handleShelfClick"
      />
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { getContainerColor, buildAreaColorMap, normalizeAreaCode } from '../utils/colorHelper';
import WarehouseGridMap2D from './WarehouseGridMap2D.vue';

// InstancedMesh 性能优化阈值：货架数量超过此值时启用 InstancedMesh 渲染
const INSTANCED_THRESHOLD = 50;
// 标签显示阈值：货架数量超过此值时启用智能显隐
const LABEL_HIDE_THRESHOLD = 100;
// 标签池大小：同时可见的标签数量上限
const LABEL_POOL_SIZE = 30;
// 大规模场景下圆柱体分段数（降低面数）
const LOW_SEGMENTS = 10;
const HIGH_SEGMENTS = 18;

export default {
  name: 'WarehouseInterior3D',
  components: { WarehouseGridMap2D },
  props: {
    warehouseName: { type: String, default: '库房' },
    shelfLayout: { type: Object, default: () => ({ rows: 2, cols: 3 }) },
    shelves: { type: Array, default: () => [] },
    layout: { type: Object, default: null },
    initialMode: { type: String, default: '3d' },
    showModeSwitch: { type: Boolean, default: true },
    showShelfEnterHint: { type: Boolean, default: true },
    dateColorMap: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      viewMode: this.initialMode || '3d',
      scene: null, camera: null, renderer: null, controls: null,
      animationId: null,
      shelfClickMeshes: [],   // 可点击的货架框体
      raycaster: null, mouse: null,
      tooltip: { visible: false, x: 0, y: 0, name: '', filled: 0, total: 0 },
      hoveredMesh: null,
      selectedShelfId: null,
      selectedShelf: null,
      threeInited: false,
      // InstancedMesh 引用
      instancedMeshes: [],
      // 标签相关
      labelPool: [],
      shelfPositions: [],  // 缓存每个货架的世界坐标 { x, z, shelf, displayH }
      useLabelPool: false
    };
  },
  computed: {
    gridStyle() {
      return { gridTemplateColumns: `repeat(${this.shelfLayout.cols || 3}, 1fr)` };
    },
    padCount() {
      const total = this.shelves.length;
      const cols = this.shelfLayout.cols || 3;
      const rem = total % cols;
      return rem === 0 ? 0 : cols - rem;
    },
    useInstanced() {
      return this.shelves.length > INSTANCED_THRESHOLD;
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
    shelves() {
      if (this.threeInited) this.rebuildAll();
    },
    layout() {
      if (this.threeInited) this.rebuildAll();
    },
    viewMode(val) {
      if (val === '3d' && !this.threeInited) {
        this.$nextTick(() => { this.initThree(); this.buildScene(); this.animate(); this.threeInited = true; });
      } else if (val === '3d') {
        this.$nextTick(() => this.handleResize());
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initThree();
      this.buildScene();
      this.animate();
      this.threeInited = true;
    });
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.controls) this.controls.dispose();
    if (this.renderer) this.renderer.dispose();
  },
  methods: {
    switchMode(mode) { this.viewMode = mode; },

    initThree() {
      const container = this.$refs.canvasContainer;
      if (!container) return;
      const canvas = this.$refs.threeCanvas;
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 500;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x0d1b2a);

      const roomSize = this.getRoomSize();
      // 自适应雾气远裁面：大规模场景需要更远的雾气
      const fogNear = Math.max(22, roomSize.depth * 0.5);
      const fogFar = Math.max(95, roomSize.depth * 2.5);
      this.scene.fog = new THREE.Fog(0x0d1b2a, fogNear, fogFar);

      this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, Math.max(300, roomSize.depth * 4));
      this.camera.position.set(0, Math.max(16, roomSize.depth * 1.05), Math.max(18, roomSize.depth * 1.25));

      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: this.shelves.length <= INSTANCED_THRESHOLD });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.useInstanced ? 1 : 2));
      this.renderer.shadowMap.enabled = !this.useInstanced; // 大规模场景关闭阴影

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.target.set(0, 0, 0);
      this.controls.minDistance = 5;
      this.controls.maxDistance = Math.max(40, roomSize.depth * 2.2);
      this.controls.maxPolarAngle = Math.PI / 2.1;

      const ambient = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(ambient);
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(8, 16, 10);
      dirLight.castShadow = !this.useInstanced;
      this.scene.add(dirLight);
      const warmLight = new THREE.PointLight(0xffd88a, 0.8, Math.max(35, roomSize.depth * 0.8));
      warmLight.position.set(0, 9, 0);
      this.scene.add(warmLight);

      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
      canvas.addEventListener('mousemove', this.onMouseMove);
      canvas.addEventListener('click', this.onMouseClick);
    },

    // 3D 摆放模型：脱离布局网格，按列/排索引紧凑摆放，过道按索引换算成固定间隙插入。
    // 容器为固定边长 CUBE 的正方体；货架宽/深占位 = 1.2C；新库层高 = 1.4C。
    getPlacement() {
      const CUBE = 2.0;             // 容器正方体边长 C
      const CELL = CUBE * 1.2;      // 货架宽/深占位 = 1.2C
      const LAYER_H_NEW = CUBE * 1.4; // 新库房层高 = 1.4C（容器高度的 1.4 倍）
      const STEP_X = CELL + 0.8;    // 列方向单元步长（含间隙）
      const STEP_Z = CELL + 2.6;    // 排方向步长（拉宽避免后排被遮挡）
      const AISLE_W = 0.7;          // 每 1 单位过道宽度对应的世界宽度
      const MARGIN = 4;

      const shelves = this.shelves || [];
      const sortCode = (a, b) => {
        const an = Number(a), bn = Number(b);
        if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
        return String(a).localeCompare(String(b), 'zh-CN', { numeric: true });
      };
      const colCodes = [...new Set(shelves.map(s => String(s.columnCode || s.columnId || '1')))].sort(sortCode);
      const rowCodes = [...new Set(shelves.map(s => String(s.rowCode || s.rowId || '1')))].sort(sortCode);
      const colOrder = {}; colCodes.forEach((c, i) => { colOrder[c] = i; });
      const rowOrder = {}; rowCodes.forEach((c, i) => { rowOrder[c] = i; });

      const aisle = (this.layout && this.layout.aisleSettings) || { rows: [], cols: [] };
      const colAisles = (aisle.cols || []).slice().sort((a, b) => a.afterIndex - b.afterIndex);
      const rowAisles = (aisle.rows || []).slice().sort((a, b) => a.afterIndex - b.afterIndex);
      // 0-based 索引 i（序号 i+1）之前累计的过道世界偏移：含所有 afterIndex <= i 的过道
      const colShiftBefore = i => colAisles.reduce((s, a) => s + (a.afterIndex <= i ? a.width : 0), 0) * AISLE_W;
      const rowShiftBefore = i => rowAisles.reduce((s, a) => s + (a.afterIndex <= i ? a.width : 0), 0) * AISLE_W;

      const totalColAisle = colAisles.reduce((s, a) => s + a.width, 0) * AISLE_W;
      const totalRowAisle = rowAisles.reduce((s, a) => s + a.width, 0) * AISLE_W;
      const contentW = Math.max(colCodes.length, 1) * STEP_X + totalColAisle;
      const contentD = Math.max(rowCodes.length, 1) * STEP_Z + totalRowAisle;

      return {
        CUBE, CELL, LAYER_H_NEW, STEP_X, STEP_Z, AISLE_W,
        colCodes, rowCodes, colOrder, rowOrder,
        colAisles, rowAisles, colShiftBefore, rowShiftBefore,
        contentW, contentD,
        originX: -contentW / 2,
        originZ: -contentD / 2,
        cols: colCodes.length,
        rows: rowCodes.length,
        width: Math.max(28, contentW + MARGIN),
        depth: Math.max(22, contentD + MARGIN)
      };
    },

    // 兼容旧调用：房间尺寸从摆放模型推导
    getRoomSize() {
      const p = this.getPlacement();
      return { width: p.width, depth: p.depth, cols: p.cols, rows: p.rows };
    },

    // 计算单个货架中心的世界坐标 (x, z)
    shelfCenter(shelf, p) {
      const ci = p.colOrder[String(shelf.columnCode || shelf.columnId || '1')] || 0;
      const ri = p.rowOrder[String(shelf.rowCode || shelf.rowId || '1')] || 0;
      const x = p.originX + ci * p.STEP_X + p.STEP_X / 2 + p.colShiftBefore(ci);
      const z = p.originZ + ri * p.STEP_Z + p.STEP_Z / 2 + p.rowShiftBefore(ri);
      return { x, z };
    },

    buildScene() {
      if (!this.scene) return;
      this.createInteriorRoom();
      this.createAisles3D();
      if (this.useInstanced) {
        this.createShelvesInstanced();
      } else {
        this.createShelves3D();
      }
    },

    rebuildAll() {
      // 销毁所有 Mesh 和 InstancedMesh
      const toRemove = [];
      this.scene.traverse(obj => { if (obj.isMesh || obj.isSprite) toRemove.push(obj); });
      toRemove.forEach(obj => {
        this.scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      // 清除 Group 对象
      const groups = [];
      this.scene.traverse(obj => { if (obj.isGroup && obj !== this.scene) groups.push(obj); });
      groups.forEach(g => this.scene.remove(g));
      this.shelfClickMeshes = [];
      this.instancedMeshes = [];
      this.labelPool = [];
      this.shelfPositions = [];
      this.createInteriorRoom();
      this.createAisles3D();
      if (this.useInstanced) {
        this.createShelvesInstanced();
      } else {
        this.createShelves3D();
      }
    },

    createInteriorRoom() {
      const roomSize = this.getRoomSize();
      // 地板
      const floorGeo = new THREE.PlaneGeometry(roomSize.width, roomSize.depth);
      const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a2a3a, roughness: 0.9 });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      this.scene.add(floor);
      // 网格
      const gridDivisions = this.useInstanced
        ? Math.min(Math.max(roomSize.cols, roomSize.rows), 60)
        : Math.max(roomSize.cols, roomSize.rows);
      const grid = new THREE.GridHelper(Math.max(roomSize.width, roomSize.depth), gridDivisions, 0x1a3a5c, 0x1a3a5c);
      grid.position.y = 0.01;
      this.scene.add(grid);
      // 墙壁（半透明）
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5a, roughness: 0.8, transparent: true, opacity: 0.35, side: THREE.BackSide });
      const roomGeo = new THREE.BoxGeometry(roomSize.width, 12, roomSize.depth);
      const room = new THREE.Mesh(roomGeo, wallMat);
      room.position.y = 6;
      this.scene.add(room);
      // 天花板灯条（大规模时增加灯光数量以保持照明均匀）
      const lampCount = Math.max(3, Math.ceil(roomSize.width / 10));
      for (let i = 0; i < lampCount; i++) {
        const lx = -roomSize.width / 2 + (roomSize.width / (lampCount + 1)) * (i + 1);
        const lampGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.12, 8);
        const lampMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffcc, emissiveIntensity: 1 });
        const lamp = new THREE.Mesh(lampGeo, lampMat);
        lamp.position.set(lx, 11.9, 0);
        this.scene.add(lamp);
      }
    },

    createAisles3D() {
      const aisleSettings = (this.layout && this.layout.aisleSettings) || { rows: [], cols: [] };
      if (!aisleSettings.rows.length && !aisleSettings.cols.length) return;

      const p = this.getPlacement();
      const mat = new THREE.MeshStandardMaterial({ color: 0xb9c0ca, roughness: 0.85, transparent: true, opacity: 0.9 });

      // 列间过道：位于第 afterIndex 列（1-based）之后的间隙，沿 Z 方向铺满
      p.colAisles.forEach(c => {
        const idx = c.afterIndex - 1; // 0-based：该列右侧
        if (idx < 0 || idx >= p.cols) return;
        // 该间隙左边界 = 前 (idx+1) 列的宽度 + 该列之前累计过道
        const leftX = p.originX + (idx + 1) * p.STEP_X + p.colShiftBefore(idx);
        const width = c.width * p.AISLE_W;
        const geo = new THREE.BoxGeometry(width, 0.04, p.contentD);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(leftX + width / 2, 0.05, 0);
        mesh.receiveShadow = true;
        this.scene.add(mesh);
      });

      // 排间过道：位于第 afterIndex 排（1-based）之后的间隙，沿 X 方向铺满
      p.rowAisles.forEach(r => {
        const idx = r.afterIndex - 1;
        if (idx < 0 || idx >= p.rows) return;
        const topZ = p.originZ + (idx + 1) * p.STEP_Z + p.rowShiftBefore(idx);
        const depth = r.width * p.AISLE_W;
        const geo = new THREE.BoxGeometry(p.contentW, 0.04, depth);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 0.05, topZ + depth / 2);
        mesh.receiveShadow = true;
        this.scene.add(mesh);
      });
    },

    // =====================================================
    // InstancedMesh 合批渲染（大规模场景 > INSTANCED_THRESHOLD）
    // =====================================================
    createShelvesInstanced() {
      if (!this.shelves || this.shelves.length === 0) return;

      const p = this.getPlacement();
      const CUBE = p.CUBE;     // 容器正方体边长
      const CELL = p.CELL;     // 货架宽/深占位 = 1.2C

      // ---- 第一遍：预计算每个货架的位置和尺寸，统计各类实例数量 ----
      let totalPillars = 0;
      let totalBoards = 0;
      let totalContainers = 0;
      let totalRings = 0;
      let totalOldBases = 0;

      const shelfInfos = this.shelves.map((shelf, idx) => {
        const { x, z } = this.shelfCenter(shelf, p);
        const w = CELL, d = CELL;   // 货架占位 = 1.2C 正方
        const isOld = String(shelf.warehouseType) === '2';
        const layerCount = shelf.layers ? shelf.layers.length : 3;
        const layerH = isOld ? CELL : p.LAYER_H_NEW;   // 新库层高 1.4C，老库平台沿用 1.2C
        const shelfH = layerCount * layerH;    // 货架高 = 层数 × 层高
        const displayH = shelfH;

        // 统计该货架的容器数（1 层最多 1 个容器）
        let containerCount = 0;
        if (shelf.layers) {
          shelf.layers.forEach(layer => {
            (layer.containers || []).forEach(c => {
              if (c.materialCode) containerCount++;
            });
          });
        }

        if (isOld) {
          totalOldBases++;
        } else {
          totalPillars += 4;
          totalBoards += layerCount + 1;
        }
        totalContainers += containerCount;
        totalRings++;

        return { shelf, x, z, w, d, isOld, layerCount, layerH, shelfH, displayH, containerCount };
      });

      this.shelfPositions = shelfInfos.map(info => ({
        x: info.x, z: info.z, shelf: info.shelf, displayH: info.displayH
      }));

      const dummy = new THREE.Object3D();
      const tempColor = new THREE.Color();

      // ---- 创建新库立柱 InstancedMesh（高度按各自货架，用 scale 适配）----
      if (totalPillars > 0) {
        const pillarGeo = new THREE.BoxGeometry(0.1, 1, 0.1);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.5, roughness: 0.5 });
        const pillarMesh = new THREE.InstancedMesh(pillarGeo, pillarMat, totalPillars);
        pillarMesh.castShadow = false;
        let pillarIdx = 0;
        shelfInfos.forEach(info => {
          if (info.isOld) return;
          const offsets = [
            [-info.w / 2, -info.d / 2],
            [info.w / 2, -info.d / 2],
            [-info.w / 2, info.d / 2],
            [info.w / 2, info.d / 2]
          ];
          offsets.forEach(([ox, oz]) => {
            dummy.position.set(info.x + ox, info.shelfH / 2, info.z + oz);
            dummy.scale.set(1, info.shelfH, 1);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();
            pillarMesh.setMatrixAt(pillarIdx++, dummy.matrix);
          });
        });
        pillarMesh.instanceMatrix.needsUpdate = true;
        this.scene.add(pillarMesh);
        this.instancedMeshes.push(pillarMesh);
      }

      // ---- 创建新库层板 InstancedMesh ----
      if (totalBoards > 0) {
        const boardGeo = new THREE.BoxGeometry(1, 0.06, 1); // 单位尺寸，通过 scale 控制
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.7 });
        const boardMesh = new THREE.InstancedMesh(boardGeo, boardMat, totalBoards);
        boardMesh.receiveShadow = false;
        let boardIdx = 0;
        shelfInfos.forEach(info => {
          if (info.isOld) return;
          for (let li = 0; li <= info.layerCount; li++) {
            dummy.position.set(info.x, li * CELL, info.z);
            dummy.scale.set(info.w - 0.05, 1, info.d - 0.05);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();
            boardMesh.setMatrixAt(boardIdx++, dummy.matrix);
          }
        });
        boardMesh.instanceMatrix.needsUpdate = true;
        this.scene.add(boardMesh);
        this.instancedMeshes.push(boardMesh);
      }

      // ---- 创建老库底座 InstancedMesh（按 areaCode 染每实例色）----
      if (totalOldBases > 0) {
        const baseGeo = new THREE.BoxGeometry(1, 0.2, 1);
        const baseMat = new THREE.MeshStandardMaterial({ roughness: 0.8 });
        const baseMesh = new THREE.InstancedMesh(baseGeo, baseMat, totalOldBases);
        const baseColors = new Float32Array(totalOldBases * 3);
        let baseIdx = 0;
        shelfInfos.forEach(info => {
          if (!info.isOld) return;
          dummy.position.set(info.x, 0.1, info.z);
          dummy.scale.set(info.w, 1, info.d);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          baseMesh.setMatrixAt(baseIdx, dummy.matrix);
          const areaHex = this.getShelfAreaColorHex(info.shelf);
          tempColor.setHex(areaHex != null ? areaHex : 0x2d3748);
          baseColors[baseIdx * 3] = tempColor.r;
          baseColors[baseIdx * 3 + 1] = tempColor.g;
          baseColors[baseIdx * 3 + 2] = tempColor.b;
          baseIdx++;
        });
        baseMesh.instanceColor = new THREE.InstancedBufferAttribute(baseColors, 3);
        baseMesh.instanceMatrix.needsUpdate = true;
        this.scene.add(baseMesh);
        this.instancedMeshes.push(baseMesh);
      }

      // ---- 创建容器正方体 InstancedMesh（含每实例颜色，无盖子）----
      if (totalContainers > 0) {
        const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        const boxMat = new THREE.MeshStandardMaterial({ metalness: 0.4, roughness: 0.5 });
        const boxMesh = new THREE.InstancedMesh(boxGeo, boxMat, totalContainers);
        const boxColors = new Float32Array(totalContainers * 3);

        let boxIdx = 0;

        shelfInfos.forEach(info => {
          if (!info.shelf.layers) return;
          info.shelf.layers.forEach((layer, layerIdx) => {
            const containers = layer.containers || [];
            if (containers.length === 0) return;
            const container = containers[0];   // 1 层 1 容器
            if (!container.materialCode) return;

            // 每层的容器居中放在该层空间内；老库底座在 0.2，其余从 0 起
            const layerBase = info.isOld ? 0.2 : layerIdx * CELL;
            const cy = layerBase + CELL / 2;

            dummy.position.set(info.x, cy, info.z);
            dummy.scale.set(CUBE, CUBE, CUBE);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();
            boxMesh.setMatrixAt(boxIdx, dummy.matrix);

            const hexColor = getContainerColor(container.status, container.materialCode || container.goodCode);
            tempColor.setHex(parseInt(hexColor.replace('#', ''), 16));
            boxColors[boxIdx * 3] = tempColor.r;
            boxColors[boxIdx * 3 + 1] = tempColor.g;
            boxColors[boxIdx * 3 + 2] = tempColor.b;
            boxIdx++;
          });
        });

        boxMesh.instanceColor = new THREE.InstancedBufferAttribute(boxColors, 3);
        boxMesh.instanceMatrix.needsUpdate = true;
        this.scene.add(boxMesh);
        this.instancedMeshes.push(boxMesh);
      }

      // ---- 创建底部光圈 InstancedMesh ----
      if (totalRings > 0) {
        const ringGeo = new THREE.RingGeometry(0.6, 0.75, 24);
        const ringMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true, opacity: 0.55 });
        const ringMesh = new THREE.InstancedMesh(ringGeo, ringMat, totalRings);
        const ringColors = new Float32Array(totalRings * 3);
        let ringIdx = 0;

        shelfInfos.forEach(info => {
          const filled = this.getFilledCount(info.shelf);
          const total = this.getTotalCount(info.shelf);
          const rate = total > 0 ? filled / total : 0;
          const areaColor = this.getShelfAreaColor3D(info.shelf);
          if (areaColor) {
            tempColor.copy(areaColor);
          } else {
            const hue = (1 - rate) * 0.33 * 0.8 + 0.15;
            tempColor.setHSL(hue, 0.7, 0.35);
          }

          dummy.position.set(info.x, 0.02, info.z);
          dummy.scale.set(info.d, info.d, 1);
          dummy.rotation.set(-Math.PI / 2, 0, 0);
          dummy.updateMatrix();
          ringMesh.setMatrixAt(ringIdx, dummy.matrix);

          ringColors[ringIdx * 3] = tempColor.r;
          ringColors[ringIdx * 3 + 1] = tempColor.g;
          ringColors[ringIdx * 3 + 2] = tempColor.b;
          ringIdx++;
        });

        ringMesh.instanceColor = new THREE.InstancedBufferAttribute(ringColors, 3);
        ringMesh.instanceMatrix.needsUpdate = true;
        this.scene.add(ringMesh);
        this.instancedMeshes.push(ringMesh);
      }

      // ---- 创建透明框体（独立 Mesh，用于 Raycast 交互）----
      // 这些是必须保留的独立 Mesh，因为每个需要单独的 userData 引用
      const bodyGeo = new THREE.BoxGeometry(1, 1, 1); // 单位尺寸，通过 scale 控制
      const shelfBodyMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.12, depthWrite: false });

      shelfInfos.forEach(info => {
        const filled = this.getFilledCount(info.shelf);
        const total = this.getTotalCount(info.shelf);
        const rate = total > 0 ? filled / total : 0;
        const areaColor = this.getShelfAreaColor3D(info.shelf);
        const bodyColor = areaColor || new THREE.Color().setHSL((1 - rate) * 0.33 * 0.8 + 0.15, 0.7, 0.35);

        const mat = shelfBodyMat.clone();
        mat.color = bodyColor;
        const bodyMesh = new THREE.Mesh(bodyGeo, mat);
        bodyMesh.position.set(info.x, info.displayH / 2, info.z);
        bodyMesh.scale.set(info.w, info.displayH, info.d);
        bodyMesh.userData = { type: 'shelf', shelf: info.shelf };
        this.scene.add(bodyMesh);
        this.shelfClickMeshes.push(bodyMesh);
      });

      // ---- 标签处理 ----
      this.useLabelPool = this.shelves.length > LABEL_HIDE_THRESHOLD;
      if (this.useLabelPool) {
        // 使用标签对象池：预创建固定数量的 Sprite，在 animate 中动态分配
        this.labelPool = [];
        for (let i = 0; i < LABEL_POOL_SIZE; i++) {
          const sprite = this.createShelfLabel('', '');
          sprite.visible = false;
          this.scene.add(sprite);
          this.labelPool.push(sprite);
        }
      } else {
        // 小规模直接创建所有标签
        shelfInfos.forEach(info => {
          const filled = this.getFilledCount(info.shelf);
          const total = this.getTotalCount(info.shelf);
          const areaPrefix = this.isOldWarehouse && this.getShelfAreaColor3D(info.shelf) ? `[${this.getShelfAreaLabel3D(info.shelf)}] ` : '';
          const label = this.createShelfLabel(`${areaPrefix}${info.shelf.name}`, `${filled}/${total}`);
          label.position.set(info.x, info.displayH + 0.7, info.z);
          this.scene.add(label);
        });
      }
    },

    // =====================================================
    // 原始逐个创建方式（小规模场景 <= INSTANCED_THRESHOLD）
    // =====================================================
    createShelves3D() {
      if (!this.shelves || this.shelves.length === 0) return;
      const p = this.getPlacement();
      this.shelves.forEach(shelf => {
        const { x, z } = this.shelfCenter(shelf, p);
        const layerCount = shelf.layers ? shelf.layers.length : 3;
        const shelfH = layerCount * p.CELL;   // 货架高 = 层数 × 1.2C
        this.createShelf3D(shelf, x, z, p.CELL, p.CELL, shelfH);
      });
    },

    createShelf3D(shelf, x, z, w, d, h) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.userData = { type: 'shelf', shelf };

      const layerCount = shelf.layers ? shelf.layers.length : 3;
      const isOldWarehouse = String(shelf.warehouseType) === '2';
      const displayH = h;                 // 货架高 = 层数 × 1.2C（新老库一致）
      const CELL = h / Math.max(layerCount, 1);   // 每层高度 = 1.2C
      const CUBE = CELL / 1.2;             // 容器正方体边长

      // 老库房区域色（areaCode）：染底座 + 光圈
      const areaColor = this.getShelfAreaColorHex(shelf);

      // 渲染每层容器为正方体（1 层 1 容器，居中；无盖子）
      const addContainerCubes = (baseOffset) => {
        if (!shelf.layers) return;
        shelf.layers.forEach((layer, layerIdx) => {
          const containers = layer.containers || [];
          if (containers.length === 0) return;
          const container = containers[0];
          if (!container.materialCode) return;

          const layerBase = baseOffset + layerIdx * CELL;
          const hexColor = getContainerColor(container.status, container.materialCode || container.goodCode);
          const color = parseInt(hexColor.replace('#', ''), 16);
          const boxGeo = new THREE.BoxGeometry(CUBE, CUBE, CUBE);
          const boxMat = new THREE.MeshStandardMaterial({ color, metalness: 0.4, roughness: 0.5 });
          const box = new THREE.Mesh(boxGeo, boxMat);
          box.position.set(0, layerBase + CELL / 2, 0);
          box.castShadow = true;
          box.receiveShadow = true;
          group.add(box);
        });
      };

      if (isOldWarehouse) {
        // 老库：底座（区域色）+ 底座上的正方体容器
        const baseGeo = new THREE.BoxGeometry(w, 0.2, d);
        const baseMat = new THREE.MeshStandardMaterial({ color: areaColor != null ? areaColor : 0x2d3748, roughness: 0.8 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.set(0, 0.1, 0);
        base.receiveShadow = true;
        group.add(base);
        addContainerCubes(0.2);
      } else {
        // 新库：渲染完整货架（立柱+层板）+ 每层正方体容器
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.5, roughness: 0.5 });

        // 四根立柱
        const pillarGeo = new THREE.BoxGeometry(0.1, h, 0.1);
        [[-w / 2, h / 2, -d / 2], [w / 2, h / 2, -d / 2], [-w / 2, h / 2, d / 2], [w / 2, h / 2, d / 2]].forEach(([px, py, pz]) => {
          const pillar = new THREE.Mesh(pillarGeo, frameMat);
          pillar.position.set(px, py, pz);
          pillar.castShadow = true;
          group.add(pillar);
        });

        // 层板（含底板）
        const boardGeo = new THREE.BoxGeometry(w - 0.05, 0.06, d - 0.05);
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.7 });
        for (let li = 0; li <= layerCount; li++) {
          const board = new THREE.Mesh(boardGeo, boardMat);
          board.position.set(0, li * CELL, 0);
          board.receiveShadow = true;
          group.add(board);
        }

        addContainerCubes(0);
      }

      // 透明框体（可点击区域）
      const filled = this.getFilledCount(shelf);
      const total = this.getTotalCount(shelf);
      const rate = total > 0 ? filled / total : 0;
      const hue = (1 - rate) * 0.33 * 0.8 + 0.15;
      // 老库房：透明框体/光圈用区域色，便于区域区分；新库房沿用占用率色
      const areaColor3D = this.getShelfAreaColor3D(shelf);
      const bodyColor = areaColor3D || new THREE.Color().setHSL(hue, 0.7, 0.35);
      const bodyGeo = new THREE.BoxGeometry(w, displayH, d);
      const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, transparent: true, opacity: 0.15, depthWrite: false });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.position.set(0, displayH / 2, 0);
      bodyMesh.userData = { type: 'shelf', shelf };
      group.add(bodyMesh);
      this.shelfClickMeshes.push(bodyMesh);

      // 名称标签（老库房前缀区域编号）
      const areaPrefix = areaColor3D ? `[${this.getShelfAreaLabel3D(shelf)}] ` : '';
      const label = this.createShelfLabel(`${areaPrefix}${shelf.name}`, `${filled}/${total}`);
      label.position.set(0, displayH + 0.7, 0);
      group.add(label);

      // 底部光圈
      const ringGeo = new THREE.RingGeometry(d * 0.6, d * 0.75, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: bodyColor, side: THREE.DoubleSide, transparent: true, opacity: 0.55 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      group.add(ring);

      this.scene.add(group);
    },

    createShelfLabel(name, stats) {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 72;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(10, 37, 64, 0.9)';
      ctx.roundRect(0, 0, 200, 72, 8);
      ctx.fill();
      ctx.strokeStyle = '#4488ff';
      ctx.lineWidth = 1.5;
      ctx.roundRect(1, 1, 198, 70, 8);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(name, 100, 30);
      ctx.fillStyle = '#88ccff';
      ctx.font = '18px Arial';
      ctx.fillText(stats, 100, 56);
      const texture = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(2.0, 0.72, 1);
      return sprite;
    },

    /**
     * 更新标签池中的 Sprite 内容和位置
     */
    updateLabelSprite(sprite, shelfInfo) {
      const filled = this.getFilledCount(shelfInfo.shelf);
      const total = this.getTotalCount(shelfInfo.shelf);
      // 重绘 Canvas
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 72;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(10, 37, 64, 0.9)';
      ctx.roundRect(0, 0, 200, 72, 8);
      ctx.fill();
      ctx.strokeStyle = '#4488ff';
      ctx.lineWidth = 1.5;
      ctx.roundRect(1, 1, 198, 70, 8);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px Arial';
      ctx.textAlign = 'center';
      // 老库房标签前缀区域编号
      const areaPrefix = this.getShelfAreaColor3D(shelfInfo.shelf) ? `[${this.getShelfAreaLabel3D(shelfInfo.shelf)}] ` : '';
      ctx.fillText(`${areaPrefix}${shelfInfo.shelf.name}`, 100, 30);
      ctx.fillStyle = '#88ccff';
      ctx.font = '18px Arial';
      ctx.fillText(`${filled}/${total}`, 100, 56);
      // 更新纹理
      if (sprite.material.map) sprite.material.map.dispose();
      sprite.material.map = new THREE.CanvasTexture(canvas);
      sprite.material.needsUpdate = true;
      sprite.position.set(shelfInfo.x, shelfInfo.displayH + 0.7, shelfInfo.z);
      sprite.visible = true;
    },

    getFilledCount(shelf) {
      let count = 0;
      if (shelf.layers) shelf.layers.forEach(l => (l.containers || []).forEach(c => { if (c.materialCode) count++; }));
      return count;
    },
    getTotalCount(shelf) {
      let count = 0;
      if (shelf.layers) shelf.layers.forEach(l => { count += (l.containers || []).length; });
      return count;
    },
    getUsagePercent(shelf) {
      const t = this.getTotalCount(shelf);
      return t === 0 ? 0 : Math.round(this.getFilledCount(shelf) / t * 100);
    },
    // 货架区域色 hex 字符串（仅老库房）：返回 '#xxxxxx' 或 null
    getShelfAreaColorString(shelf) {
      if (!this.isOldWarehouse) return null;
      return this.areaColorMap[normalizeAreaCode(shelf.areaCode)] || null;
    },
    // 货架区域色数值（用于 MeshStandardMaterial 的 color:）：返回 0xRRGGBB 或 null
    getShelfAreaColorHex(shelf) {
      const str = this.getShelfAreaColorString(shelf);
      return str ? parseInt(str.replace('#', ''), 16) : null;
    },
    // 货架区域色 THREE.Color（用于框体/光圈）：返回 THREE.Color 或 null
    getShelfAreaColor3D(shelf) {
      const str = this.getShelfAreaColorString(shelf);
      return str ? new THREE.Color(str) : null;
    },
    // 货架区域标签（仅老库房）
    getShelfAreaLabel3D(shelf) {
      if (!this.isOldWarehouse) return '';
      return normalizeAreaCode(shelf.areaCode);
    },

    handleShelfClick(shelf) {
      this.selectedShelfId = shelf.id;
      this.selectedShelf = shelf;
      this.$emit('select-shelf', shelf);
    },

    onMouseMove(event) {
      const canvas = this.$refs.threeCanvas;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.shelfClickMeshes);
      if (intersects.length > 0) {
        const mesh = intersects[0].object;
        if (mesh.userData.shelf) {
          const shelf = mesh.userData.shelf;
          this.tooltip = { visible: true, x: event.clientX - rect.left + 15, y: event.clientY - rect.top - 50, name: shelf.name, filled: this.getFilledCount(shelf), total: this.getTotalCount(shelf) };
          canvas.style.cursor = 'pointer';
          if (this.hoveredMesh !== mesh) {
            if (this.hoveredMesh) this.hoveredMesh.material.opacity = 0.12;
            this.hoveredMesh = mesh;
            mesh.material.opacity = 0.4;
          }
        }
      } else {
        this.tooltip.visible = false;
        canvas.style.cursor = 'default';
        if (this.hoveredMesh) { this.hoveredMesh.material.opacity = this.useInstanced ? 0.12 : 0.15; this.hoveredMesh = null; }
      }
    },

    onMouseClick(event) {
      const canvas = this.$refs.threeCanvas;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.shelfClickMeshes);
      if (intersects.length > 0) {
        const mesh = intersects[0].object;
        if (mesh.userData.shelf) {
          this.selectedShelfId = mesh.userData.shelf.id;
          this.selectedShelf = mesh.userData.shelf;
          this.$emit('select-shelf', mesh.userData.shelf);
        }
      }
    },

    animate() {
      this.animationId = requestAnimationFrame(this.animate);
      if (this.controls) this.controls.update();

      // 标签对象池：根据相机距离动态显示最近的标签
      if (this.useLabelPool && this.shelfPositions.length > 0 && this.camera) {
        // 每 10 帧更新一次标签分配，避免每帧排序
        this._labelFrameCount = (this._labelFrameCount || 0) + 1;
        if (this._labelFrameCount % 10 === 0) {
          const camPos = this.camera.position;
          // 计算每个货架到相机的距离
          const distances = this.shelfPositions.map((sp, idx) => ({
            idx,
            dist: Math.sqrt(
              (sp.x - camPos.x) ** 2 +
              (sp.z - camPos.z) ** 2
            ),
            ...sp
          }));
          // 按距离排序，取最近的 LABEL_POOL_SIZE 个
          distances.sort((a, b) => a.dist - b.dist);
          const nearest = distances.slice(0, LABEL_POOL_SIZE);

          // 动态显示距离阈值（相机越近显示越多）
          const camHeight = camPos.y;
          const showRadius = Math.max(8, camHeight * 0.8);

          this.labelPool.forEach((sprite, i) => {
            if (i < nearest.length && nearest[i].dist < showRadius) {
              // 仅在货架分配变化时重绘 Canvas
              if (sprite._lastAssignedIdx !== nearest[i].idx) {
                this.updateLabelSprite(sprite, nearest[i]);
                sprite._lastAssignedIdx = nearest[i].idx;
              } else {
                // 位置可能因视角变化而需更新（但货架不动，所以不需要）
                sprite.visible = true;
              }
            } else {
              sprite.visible = false;
              sprite._lastAssignedIdx = -1;
            }
          });
        }
      }

      if (this.renderer && this.scene && this.camera && this.viewMode === '3d') this.renderer.render(this.scene, this.camera);
    },

    handleResize() {
      const container = this.$refs.canvasContainer;
      if (!container || !this.camera || !this.renderer) return;
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 500;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }
};
</script>

<style lang="scss" scoped>
.warehouse-interior-3d {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0d1b2a;
  border-radius: 12px;
  overflow: hidden;

  .interior-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: rgba(10, 37, 64, 0.95);
    border-bottom: 1px solid rgba(58, 123, 213, 0.3);
    flex-shrink: 0;

    .toolbar-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      i { color: #3a7bd5; }
    }
  }

  .view-wrapper {
    flex: 1;
    position: relative;
    min-height: 0;
    overflow: hidden;

    .canvas-container {
      width: 100%;
      height: 100%;
      canvas { display: block; width: 100%; height: 100%; }
    }

    .shelf-tooltip {
      position: absolute;
      background: rgba(10, 37, 64, 0.95);
      border: 1px solid #4488ff;
      border-radius: 8px;
      padding: 8px 14px;
      pointer-events: none;
      z-index: 100;
      .tooltip-title { color: #fff; font-size: 14px; font-weight: 600; }
      .tooltip-stats { color: rgba(180,210,255,.8); font-size: 12px; margin-top: 2px; }
      .tooltip-hint { color: #4488ff; font-size: 11px; margin-top: 4px; }
    }

    .control-hint {
      position: absolute;
      bottom: 14px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255,255,255,.5);
      font-size: 12px;
      padding: 4px 14px;
      background: rgba(0,0,0,.4);
      border-radius: 20px;
      white-space: nowrap;
    }

    .area-legend-3d {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(10, 37, 64, 0.85);
      border: 1px solid rgba(68, 136, 255, 0.4);
      border-radius: 8px;
      padding: 8px 12px;
      pointer-events: none;

      .legend-title {
        color: rgba(180, 210, 255, 0.9);
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 6px;
      }

      .legend-item {
        display: flex;
        align-items: center;
        color: #fff;
        font-size: 12px;
        line-height: 1.8;

        i {
          display: inline-block;
          width: 12px;
          height: 12px;
          margin-right: 6px;
          border-radius: 3px;
        }
      }
    }

    &.view-2d {
      background: #f0f2f5;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;

      .map-2d-area {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        .floor-plan {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,.1);
          min-width: 400px;
          max-width: 800px;
          width: 100%;

          .floor-title {
            text-align: center;
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 2px solid #ebeef5;
          }

          .shelf-grid {
            display: grid;
            gap: 12px;

            .shelf-cell {
              background: linear-gradient(145deg, #667eea 0%, #764ba2 100%);
              border-radius: 8px;
              padding: 12px;
              cursor: pointer;
              transition: all .2s;
              border: 2px solid transparent;

              &:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(102,126,234,.4); }
              &.selected { border-color: #E6A23C; box-shadow: 0 4px 16px rgba(230,162,60,.4); }
              &.shelf-cell-empty { background: rgba(0,0,0,.05); cursor: default; }

              .shelf-cell-name { color: #fff; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
              .shelf-cell-count { color: rgba(255,255,255,.8); font-size: 11px; margin-bottom: 6px; }
              .shelf-cell-bar {
                height: 4px;
                background: rgba(255,255,255,.2);
                border-radius: 2px;
                overflow: hidden;
                .shelf-cell-bar-fill { height: 100%; background: rgba(255,255,255,.8); border-radius: 2px; transition: width .3s; }
              }
            }
          }
        }
      }
    }
  }
}
</style>
