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
import { getColorByDate } from '../utils/colorHelper';
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

    getRoomSize() {
      const grid = (this.layout && this.layout.grid) || { cols: 20, rows: 12 };
      const scale = 0.7;
      const scaleZ = 1.75; // 0.7 * 2.5，将行方向（Z轴）的间距拓宽 2.5 倍，确保多行排布时，后排货架容器不被前排遮挡
      return {
        scale,
        scaleZ,
        width: Math.max(28, (grid.cols || 20) * scale + 4),
        depth: Math.max(22, (grid.rows || 12) * scaleZ + 4),
        cols: grid.cols || 20,
        rows: grid.rows || 12
      };
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
      const layout = this.layout || {};
      const aisles = layout.aisles || [];
      const grid = layout.grid || { cols: 20, rows: 12 };
      if (!aisles.length) return;
      const { scale, scaleZ } = this.getRoomSize();
      const originX = -(grid.cols * scale) / 2;
      const originZ = -(grid.rows * scaleZ) / 2;
      aisles.forEach(item => {
        const geo = new THREE.BoxGeometry(item.w * scale, 0.04, item.h * scaleZ);
        const mat = new THREE.MeshStandardMaterial({ color: 0xb9c0ca, roughness: 0.85, transparent: true, opacity: 0.9 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
          originX + item.x * scale + (item.w * scale) / 2,
          0.05,
          originZ + item.y * scaleZ + (item.h * scaleZ) / 2
        );
        mesh.receiveShadow = true;
        this.scene.add(mesh);
      });
    },

    // =====================================================
    // InstancedMesh 合批渲染（大规模场景 > INSTANCED_THRESHOLD）
    // =====================================================
    createShelvesInstanced() {
      if (!this.shelves || this.shelves.length === 0) return;

      const shelfW = 3.0, shelfD = 1.4, shelfH = 3.0;
      const layout = this.layout || {};
      const grid = layout.grid || { cols: 20, rows: 12 };
      const { scale, scaleZ } = this.getRoomSize();
      const originX = -(grid.cols * scale) / 2;
      const originZ = -(grid.rows * scaleZ) / 2;
      const segments = this.shelves.length > 500 ? LOW_SEGMENTS : HIGH_SEGMENTS;

      // ---- 第一遍：预计算每个货架的位置和尺寸，统计各类实例数量 ----
      let totalPillars = 0;
      let totalBoards = 0;
      let totalContainers = 0;
      let totalLids = 0;
      let totalRings = 0;
      let totalOldBases = 0;

      const shelfInfos = this.shelves.map((shelf, idx) => {
        let x, z, w = shelfW, d = shelfD;
        if (shelf.position && layout.grid) {
          w = Math.max((shelf.width || 2) * scale, 1.2);
          d = Math.max((shelf.height || 1) * scale, 0.8);
          x = originX + shelf.position.x * scale + w / 2;
          z = originZ + shelf.position.y * scaleZ + d / 2;
        } else {
          const cols = this.shelfLayout.cols || 3;
          const row = Math.floor(idx / cols);
          const col = idx % cols;
          x = (col - 1) * 4;
          z = row * 7;
        }

        const isOld = String(shelf.warehouseType) === '2';
        const layerCount = shelf.layers ? shelf.layers.length : 3;
        const displayH = isOld ? 1.0 : shelfH;

        // 统计该货架的容器数
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
        totalLids += containerCount;
        totalRings++;

        return { shelf, x, z, w, d, isOld, layerCount, displayH, containerCount };
      });

      this.shelfPositions = shelfInfos.map(info => ({
        x: info.x, z: info.z, shelf: info.shelf, displayH: info.displayH
      }));

      const dummy = new THREE.Object3D();
      const tempColor = new THREE.Color();

      // ---- 创建新库立柱 InstancedMesh ----
      if (totalPillars > 0) {
        const pillarGeo = new THREE.BoxGeometry(0.1, shelfH, 0.1);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.5, roughness: 0.5 });
        const pillarMesh = new THREE.InstancedMesh(pillarGeo, pillarMat, totalPillars);
        pillarMesh.castShadow = false;
        let pillarIdx = 0;
        shelfInfos.forEach(info => {
          if (info.isOld) return;
          const offsets = [
            [-info.w / 2, shelfH / 2, -info.d / 2],
            [info.w / 2, shelfH / 2, -info.d / 2],
            [-info.w / 2, shelfH / 2, info.d / 2],
            [info.w / 2, shelfH / 2, info.d / 2]
          ];
          offsets.forEach(([ox, oy, oz]) => {
            dummy.position.set(info.x + ox, oy, info.z + oz);
            dummy.scale.set(1, 1, 1);
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
        // 层板尺寸可能不同（因为 w, d 可能不同），但差异不大，使用统一几何体 + 缩放
        const boardGeo = new THREE.BoxGeometry(1, 0.06, 1); // 单位尺寸，通过 scale 控制
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.7 });
        const boardMesh = new THREE.InstancedMesh(boardGeo, boardMat, totalBoards);
        boardMesh.receiveShadow = false;
        let boardIdx = 0;
        shelfInfos.forEach(info => {
          if (info.isOld) return;
          const layerH = shelfH / info.layerCount;
          for (let li = 0; li <= info.layerCount; li++) {
            dummy.position.set(info.x, li * layerH, info.z);
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

      // ---- 创建老库底座 InstancedMesh ----
      if (totalOldBases > 0) {
        const baseGeo = new THREE.BoxGeometry(1, 0.2, 1);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.8 });
        const baseMesh = new THREE.InstancedMesh(baseGeo, baseMat, totalOldBases);
        let baseIdx = 0;
        shelfInfos.forEach(info => {
          if (!info.isOld) return;
          dummy.position.set(info.x, 0.1, info.z);
          dummy.scale.set(info.w, 1, info.d);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          baseMesh.setMatrixAt(baseIdx++, dummy.matrix);
        });
        baseMesh.instanceMatrix.needsUpdate = true;
        this.scene.add(baseMesh);
        this.instancedMeshes.push(baseMesh);
      }

      // ---- 创建容器圆柱 InstancedMesh（含每实例颜色）----
      if (totalContainers > 0) {
        // 使用统一半径的几何体，通过 scale 适配不同货架
        const cylGeo = new THREE.CylinderGeometry(1, 1, 1, segments);
        const cylMat = new THREE.MeshStandardMaterial({ metalness: 0.4, roughness: 0.5 });
        const cylMesh = new THREE.InstancedMesh(cylGeo, cylMat, totalContainers);
        const cylColors = new Float32Array(totalContainers * 3);

        const lidGeo = new THREE.CylinderGeometry(1, 0.92, 0.04, segments);
        const lidMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.3 });
        const lidMesh = new THREE.InstancedMesh(lidGeo, lidMat, totalLids);

        let cylIdx = 0;
        let lidIdx = 0;

        shelfInfos.forEach(info => {
          if (!info.shelf.layers) return;
          info.shelf.layers.forEach((layer, layerIdx) => {
            const containers = layer.containers || [];
            const containerCount = containers.length;
            if (containerCount === 0) return;

            const spacing = (info.w - 0.2) / containerCount;
            const startCX = -(info.w - 0.2) / 2 + spacing / 2;

            let baseY;
            if (info.isOld) {
              baseY = 0.2;
            } else {
              const layerH = shelfH / info.layerCount;
              baseY = layerIdx * layerH + 0.06;
            }

            containers.forEach((container, cIdx) => {
              if (!container.materialCode) return;

              const cx = startCX + cIdx * spacing;
              const radius = Math.min(spacing * 0.42, info.d * 0.42, 0.55);
              let cylH;
              if (info.isOld) {
                cylH = 0.65;
              } else {
                const layerH = shelfH / info.layerCount;
                cylH = layerH * 0.65;
              }

              // 设置容器位置和缩放
              dummy.position.set(info.x + cx, baseY + cylH / 2, info.z);
              dummy.scale.set(radius, cylH, radius);
              dummy.rotation.set(0, 0, 0);
              dummy.updateMatrix();
              cylMesh.setMatrixAt(cylIdx, dummy.matrix);

              // 设置容器颜色
              let color = 0xe0e0e0;
              if (container.storageDate) {
                const hexColor = this.dateColorMap[container.storageDate] || getColorByDate(container.storageDate);
                color = parseInt(hexColor.replace('#', ''), 16);
              }
              tempColor.setHex(color);
              cylColors[cylIdx * 3] = tempColor.r;
              cylColors[cylIdx * 3 + 1] = tempColor.g;
              cylColors[cylIdx * 3 + 2] = tempColor.b;
              cylIdx++;

              // 设置盖子位置和缩放
              dummy.position.set(info.x + cx, baseY + cylH + 0.02, info.z);
              dummy.scale.set(radius, 1, radius);
              dummy.rotation.set(0, 0, 0);
              dummy.updateMatrix();
              lidMesh.setMatrixAt(lidIdx++, dummy.matrix);
            });
          });
        });

        // 应用颜色
        cylMesh.instanceColor = new THREE.InstancedBufferAttribute(cylColors, 3);
        cylMesh.instanceMatrix.needsUpdate = true;
        lidMesh.instanceMatrix.needsUpdate = true;
        this.scene.add(cylMesh);
        this.scene.add(lidMesh);
        this.instancedMeshes.push(cylMesh, lidMesh);
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
          const hue = (1 - rate) * 0.33 * 0.8 + 0.15;
          tempColor.setHSL(hue, 0.7, 0.35);

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
        const hue = (1 - rate) * 0.33 * 0.8 + 0.15;
        const bodyColor = new THREE.Color().setHSL(hue, 0.7, 0.35);

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
          const label = this.createShelfLabel(info.shelf.name, `${filled}/${total}`);
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
      const shelfW = 3.0, shelfD = 1.4, shelfH = 3.0;
      const layout = this.layout || {};
      const grid = layout.grid || { cols: 20, rows: 12 };
      const { scale, scaleZ } = this.getRoomSize();
      const originX = -(grid.cols * scale) / 2;
      const originZ = -(grid.rows * scaleZ) / 2;

      this.shelves.forEach((shelf, idx) => {
        let x;
        let z;
        let w = shelfW;
        let d = shelfD;
        if (shelf.position && layout.grid) {
          w = Math.max((shelf.width || 2) * scale, 1.2);
          d = Math.max((shelf.height || 1) * scale, 0.8);
          x = originX + shelf.position.x * scale + w / 2;
          z = originZ + shelf.position.y * scaleZ + d / 2;
        } else {
          const cols = this.shelfLayout.cols || 3;
          const row = Math.floor(idx / cols);
          const col = idx % cols;
          x = (col - 1) * 4;
          z = row * 7; // 兜底无网格位置信息时，也将行间距从 5.0 拓宽到 7.0
        }
        this.createShelf3D(shelf, x, z, w, d, shelfH);
      });
    },

    createShelf3D(shelf, x, z, w, d, h) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.userData = { type: 'shelf', shelf };

      const layerCount = shelf.layers ? shelf.layers.length : 3;
      const isOldWarehouse = String(shelf.warehouseType) === '2';
      const displayH = isOldWarehouse ? 1.0 : h;

      if (isOldWarehouse) {
        // 老库：只渲染底座
        const baseGeo = new THREE.BoxGeometry(w, 0.2, d);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.8 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.set(0, 0.1, 0);
        base.receiveShadow = true;
        group.add(base);

        // 渲染底座上的物料容器（老库房为平台模式且只有一层）
        if (shelf.layers) {
          shelf.layers.forEach((layer) => {
            const baseY = 0.2; // 放在底座顶面
            const containers = layer.containers || [];
            const containerCount = containers.length;
            if (containerCount === 0) return;

            const spacing = (w - 0.2) / containerCount;
            const startCX = -(w - 0.2) / 2 + spacing / 2;

            containers.forEach((container, cIdx) => {
              if (!container.materialCode) return;

              const cx = startCX + cIdx * spacing;
              const radius = Math.min(spacing * 0.42, d * 0.42, 0.55);
              const cylH = 0.65; // 与新库房（layerH = 1.0 时 cylH = 0.65）一致

              let color = 0xe0e0e0;
              if (container.storageDate) {
                const hexColor = this.dateColorMap[container.storageDate] || getColorByDate(container.storageDate);
                color = parseInt(hexColor.replace('#', ''), 16);
              }

              const cylGeo = new THREE.CylinderGeometry(radius, radius, cylH, 18);
              const cylMat = new THREE.MeshStandardMaterial({ color, metalness: 0.4, roughness: 0.5 });
              const cyl = new THREE.Mesh(cylGeo, cylMat);
              cyl.position.set(cx, baseY + cylH / 2, 0);
              cyl.castShadow = true;
              cyl.receiveShadow = true;
              group.add(cyl);

              const lidGeo = new THREE.CylinderGeometry(radius, radius * 0.92, 0.04, 18);
              const lidMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.3 });
              const lid = new THREE.Mesh(lidGeo, lidMat);
              lid.position.set(cx, baseY + cylH + 0.02, 0);
              group.add(lid);
            });
          });
        }
      } else {
        // 新库：渲染完整货架（立柱+层板）
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.5, roughness: 0.5 });
        const layerH = h / layerCount;

        // 四根立柱
        const pillarGeo = new THREE.BoxGeometry(0.1, h, 0.1);
        [[-w / 2, h / 2, -d / 2], [w / 2, h / 2, -d / 2], [-w / 2, h / 2, d / 2], [w / 2, h / 2, d / 2]].forEach(([px, py, pz]) => {
          const p = new THREE.Mesh(pillarGeo, frameMat);
          p.position.set(px, py, pz);
          p.castShadow = true;
          group.add(p);
        });

        // 层板（含底板）
        const boardGeo = new THREE.BoxGeometry(w - 0.05, 0.06, d - 0.05);
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.7 });
        for (let li = 0; li <= layerCount; li++) {
          const board = new THREE.Mesh(boardGeo, boardMat);
          board.position.set(0, li * layerH, 0);
          board.receiveShadow = true;
          group.add(board);
        }

        // 在每层货架上渲染物料容器
        if (shelf.layers) {
          shelf.layers.forEach((layer, layerIdx) => {
            const baseY = layerIdx * layerH + 0.06;
            const containers = layer.containers || [];
            const containerCount = containers.length;
            if (containerCount === 0) return;

            const spacing = (w - 0.2) / containerCount;
            const startCX = -(w - 0.2) / 2 + spacing / 2;

            containers.forEach((container, cIdx) => {
              if (!container.materialCode) return;

              const cx = startCX + cIdx * spacing;
              const radius = Math.min(spacing * 0.42, d * 0.42, 0.55);
              const cylH = layerH * 0.65;

              let color = 0xe0e0e0;
              if (container.storageDate) {
                const hexColor = this.dateColorMap[container.storageDate] || getColorByDate(container.storageDate);
                color = parseInt(hexColor.replace('#', ''), 16);
              }

              const cylGeo = new THREE.CylinderGeometry(radius, radius, cylH, 18);
              const cylMat = new THREE.MeshStandardMaterial({ color, metalness: 0.4, roughness: 0.5 });
              const cyl = new THREE.Mesh(cylGeo, cylMat);
              cyl.position.set(cx, baseY + cylH / 2, 0);
              cyl.castShadow = true;
              cyl.receiveShadow = true;
              group.add(cyl);

              const lidGeo = new THREE.CylinderGeometry(radius, radius * 0.92, 0.04, 18);
              const lidMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.3 });
              const lid = new THREE.Mesh(lidGeo, lidMat);
              lid.position.set(cx, baseY + cylH + 0.02, 0);
              group.add(lid);
            });
          });
        }
      }

      // 透明框体（可点击区域）
      const filled = this.getFilledCount(shelf);
      const total = this.getTotalCount(shelf);
      const rate = total > 0 ? filled / total : 0;
      const hue = (1 - rate) * 0.33 * 0.8 + 0.15;
      const bodyColor = new THREE.Color().setHSL(hue, 0.7, 0.35);
      const bodyGeo = new THREE.BoxGeometry(w, displayH, d);
      const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, transparent: true, opacity: 0.15, depthWrite: false });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.position.set(0, displayH / 2, 0);
      bodyMesh.userData = { type: 'shelf', shelf };
      group.add(bodyMesh);
      this.shelfClickMeshes.push(bodyMesh);

      // 名称标签
      const label = this.createShelfLabel(shelf.name, `${filled}/${total}`);
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
      ctx.fillText(shelfInfo.shelf.name, 100, 30);
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
