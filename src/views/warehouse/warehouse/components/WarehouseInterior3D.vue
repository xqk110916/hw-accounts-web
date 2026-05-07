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
          <el-button :type="viewMode === '2d' ? 'primary' : 'default'" @click="switchMode('2d')">2D视图</el-button>
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
        <span>🖱️ 左键拖拽旋转 | 滚轮缩放 | 点击货架查看详情</span>
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
    showShelfEnterHint: { type: Boolean, default: true }
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
      threeInited: false
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
      this.scene.fog = new THREE.Fog(0x0d1b2a, 22, 95);

      this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 300);
      const roomSize = this.getRoomSize();
      this.camera.position.set(0, Math.max(16, roomSize.depth * 1.05), Math.max(18, roomSize.depth * 1.25));

      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.shadowMap.enabled = true;

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
      dirLight.castShadow = true;
      this.scene.add(dirLight);
      const warmLight = new THREE.PointLight(0xffd88a, 0.8, 35);
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
      return {
        scale,
        width: Math.max(28, (grid.cols || 20) * scale + 4),
        depth: Math.max(22, (grid.rows || 12) * scale + 4),
        cols: grid.cols || 20,
        rows: grid.rows || 12
      };
    },

    buildScene() {
      if (!this.scene) return;
      this.createInteriorRoom();
      this.createAisles3D();
      this.createShelves3D();
    },

    rebuildAll() {
      const toRemove = [];
      this.scene.traverse(obj => { if (obj.isMesh || obj.isSprite) toRemove.push(obj); });
      toRemove.forEach(obj => {
        this.scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) { if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose()); else obj.material.dispose(); }
      });
      this.shelfClickMeshes = [];
      this.createInteriorRoom();
      this.createAisles3D();
      this.createShelves3D();
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
      const grid = new THREE.GridHelper(Math.max(roomSize.width, roomSize.depth), Math.max(roomSize.cols, roomSize.rows), 0x1a3a5c, 0x1a3a5c);
      grid.position.y = 0.01;
      this.scene.add(grid);
      // 墙壁（半透明）
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5a, roughness: 0.8, transparent: true, opacity: 0.35, side: THREE.BackSide });
      const roomGeo = new THREE.BoxGeometry(roomSize.width, 12, roomSize.depth);
      const room = new THREE.Mesh(roomGeo, wallMat);
      room.position.y = 6;
      this.scene.add(room);
      // 天花板灯条
      const lampXs = [-roomSize.width / 3, 0, roomSize.width / 3];
      lampXs.forEach(x => {
        const lampGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.12, 12);
        const lampMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffcc, emissiveIntensity: 1 });
        const lamp = new THREE.Mesh(lampGeo, lampMat);
        lamp.position.set(x, 11.9, 0);
        this.scene.add(lamp);
      });
    },

    createAisles3D() {
      const layout = this.layout || {};
      const aisles = layout.aisles || [];
      const grid = layout.grid || { cols: 20, rows: 12 };
      if (!aisles.length) return;
      const { scale } = this.getRoomSize();
      const originX = -(grid.cols * scale) / 2;
      const originZ = -(grid.rows * scale) / 2;
      aisles.forEach(item => {
        const geo = new THREE.BoxGeometry(item.w * scale, 0.04, item.h * scale);
        const mat = new THREE.MeshStandardMaterial({ color: 0xb9c0ca, roughness: 0.85, transparent: true, opacity: 0.9 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(originX + item.x * scale + item.w * scale / 2, 0.05, originZ + item.y * scale + item.h * scale / 2);
        mesh.receiveShadow = true;
        this.scene.add(mesh);
      });
    },

    createShelves3D() {
      if (!this.shelves || this.shelves.length === 0) return;
      const shelfW = 3.0, shelfD = 1.4, shelfH = 3.0;
      const layout = this.layout || {};
      const grid = layout.grid || { cols: 20, rows: 12 };
      const { scale } = this.getRoomSize();
      const originX = -(grid.cols * scale) / 2;
      const originZ = -(grid.rows * scale) / 2;

      this.shelves.forEach((shelf, idx) => {
        let x;
        let z;
        let w = shelfW;
        let d = shelfD;
        if (shelf.position && layout.grid) {
          w = Math.max((shelf.width || 2) * scale, 1.2);
          d = Math.max((shelf.height || 1) * scale, 0.8);
          x = originX + shelf.position.x * scale + w / 2;
          z = originZ + shelf.position.y * scale + d / 2;
        } else {
          const cols = this.shelfLayout.cols || 3;
          const row = Math.floor(idx / cols);
          const col = idx % cols;
          x = (col - 1) * 4;
          z = row * 3;
        }
        this.createShelf3D(shelf, x, z, w, d, shelfH);
      });
    },

    createShelf3D(shelf, x, z, w, d, h) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.userData = { type: 'shelf', shelf };

      const layerCount = shelf.layers ? shelf.layers.length : 3;
      const isOldWarehouse = shelf.shelfType && shelf.shelfType.includes('-1-') && shelf.shelfType.endsWith('-2-10');
      const displayH = isOldWarehouse ? 0.5 : h;

      if (isOldWarehouse) {
        // 老库：只渲染底座
        const baseGeo = new THREE.BoxGeometry(w, 0.2, d);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.8 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.set(0, 0.1, 0);
        base.receiveShadow = true;
        group.add(base);
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
              const radius = Math.min(spacing * 0.35, d * 0.3, 0.28);
              const cylH = layerH * 0.65;

              let color = 0xe0e0e0;
              if (container.storageDate) {
                const hexColor = getColorByDate(container.storageDate);
                color = parseInt(hexColor.replace('#', ''), 16);
              }

              const cylGeo = new THREE.CylinderGeometry(radius, radius, cylH, 12);
              const cylMat = new THREE.MeshStandardMaterial({ color, metalness: 0.4, roughness: 0.5 });
              const cyl = new THREE.Mesh(cylGeo, cylMat);
              cyl.position.set(cx, baseY + cylH / 2, 0);
              cyl.castShadow = true;
              cyl.receiveShadow = true;
              group.add(cyl);

              const lidGeo = new THREE.CylinderGeometry(radius, radius * 0.92, 0.04, 12);
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
            if (this.hoveredMesh) this.hoveredMesh.material.opacity = 0.15;
            this.hoveredMesh = mesh;
            mesh.material.opacity = 0.45;
          }
        }
      } else {
        this.tooltip.visible = false;
        canvas.style.cursor = 'default';
        if (this.hoveredMesh) { this.hoveredMesh.material.opacity = 0.15; this.hoveredMesh = null; }
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
