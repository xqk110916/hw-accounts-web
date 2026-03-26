<template>
  <div class="warehouse-scene-3d">
    <div class="canvas-container" ref="canvasContainer">
      <canvas ref="threeCanvas"></canvas>
    </div>

    <div
      v-if="tooltip.visible"
      class="wh-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="tooltip-title">{{ tooltip.name }}</div>
      <div class="tooltip-desc">{{ tooltip.desc }}</div>
      <div class="tooltip-hint">点击进入库房</div>
    </div>

    <div class="control-hint">
      <span>🖱️ 左键拖拽旋转 | 滚轮缩放 | 点击库房进入内部</span>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default {
  name: 'WarehouseScene3D',
  props: {
    warehouses: { type: Array, default: () => [] },
    areaName: { type: String, default: '' }
  },
  data() {
    return {
      scene: null, camera: null, renderer: null, controls: null,
      animationId: null, warehouseMeshes: [], raycaster: null, mouse: null,
      tooltip: { visible: false, x: 0, y: 0, name: '', desc: '' },
      hoveredMesh: null
    };
  },
  watch: {
    warehouses() { this.rebuildScene(); }
  },
  mounted() {
    this.initThree();
    this.buildScene();
    this.animate();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.controls) this.controls.dispose();
    if (this.renderer) this.renderer.dispose();
  },
  methods: {
    initThree() {
      const container = this.$refs.canvasContainer;
      const canvas = this.$refs.threeCanvas;
      const width = container.clientWidth;
      const height = container.clientHeight || 500;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x0d1b2a);
      this.scene.fog = new THREE.Fog(0x0d1b2a, 30, 70);

      this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
      this.camera.position.set(0, 22, 28);

      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.shadowMap.enabled = true;

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.target.set(0, 0, 0);
      this.controls.minDistance = 6;
      this.controls.maxDistance = 50;
      this.controls.maxPolarAngle = Math.PI / 2.1;

      const ambient = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambient);
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(10, 18, 12);
      dirLight.castShadow = true;
      this.scene.add(dirLight);
      const pointLight = new THREE.PointLight(0x4488ff, 1.2, 40);
      pointLight.position.set(0, 12, 0);
      this.scene.add(pointLight);

      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
      canvas.addEventListener('mousemove', this.onMouseMove);
      canvas.addEventListener('click', this.onMouseClick);
    },

    buildScene() {
      this.createGround();
      this.warehouseMeshes = [];
      this.warehouses.forEach((wh, idx) => this.createWarehouseBuilding(wh, idx));
    },

    rebuildScene() {
      const toRemove = [];
      this.scene.traverse(obj => { if (obj.isMesh || obj.isSprite) toRemove.push(obj); });
      toRemove.forEach(obj => {
        this.scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      this.warehouseMeshes = [];
      this.buildScene();
    },

    createGround() {
      const groundGeo = new THREE.PlaneGeometry(100, 80);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a2540, roughness: 0.9 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.01;
      ground.receiveShadow = true;
      this.scene.add(ground);

      const grid = new THREE.GridHelper(80, 40, 0x1a3a5c, 0x1a3a5c);
      grid.position.y = 0.01;
      this.scene.add(grid);

      // 内部地面（稍亮）
      const innerGeo = new THREE.PlaneGeometry(44, 34);
      const innerMat = new THREE.MeshStandardMaterial({ color: 0x1a3a5c, roughness: 0.85 });
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.rotation.x = -Math.PI / 2;
      inner.position.y = 0.005;
      inner.receiveShadow = true;
      this.scene.add(inner);

      // 道路（连接库房，横向中央）
      const roadGeo = new THREE.PlaneGeometry(44, 3);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x253550, roughness: 1 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, 0.01, 8);
      this.scene.add(road);
    },

    /**
     * 创建库房建筑（使用原平衡区的房屋模型：长方体+四棱锥屋顶+窗户+门）
     */
    createWarehouseBuilding(wh, idx) {
      // 自动排列布局（每行3个，建筑宽4.5，间距9确保相邻有4.5空隙）
      const cols = Math.min(this.warehouses.length, 3);
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const colSpacing = 9;   // 列间距（建筑宽4.5，留4.5空隙）
      const rowSpacing = 10;  // 行间距
      const startX = -(cols - 1) * colSpacing / 2;
      const x = startX + col * colSpacing;
      const z = -row * rowSpacing;

      const color = [0x4a90d9, 0x27ae60, 0xe67e22, 0x9b59b6, 0xe74c3c][idx % 5];
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.userData = { type: 'warehouse', warehouse: wh };

      // 地基平台
      const platformGeo = new THREE.BoxGeometry(6, 0.3, 6);
      const platformMat = new THREE.MeshStandardMaterial({ color: 0x2d5a8a, roughness: 0.7 });
      const platform = new THREE.Mesh(platformGeo, platformMat);
      platform.position.y = 0.15;
      platform.castShadow = true;
      platform.receiveShadow = true;
      group.add(platform);

      // 主楼体
      const bodyGeo = new THREE.BoxGeometry(4.5, 3, 4.5);
      const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.2 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.8;
      body.castShadow = true;
      body.receiveShadow = true;
      body.userData = { type: 'warehouse', warehouse: wh };
      group.add(body);
      this.warehouseMeshes.push(body);

      // 四棱锥屋顶
      const roofGeo = new THREE.ConeGeometry(3.5, 1.8, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x1a3a6a, roughness: 0.6 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 4.2;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      group.add(roof);

      // 窗户（前面2个）
      const winGeo = new THREE.BoxGeometry(0.7, 0.7, 0.05);
      const winMat = new THREE.MeshStandardMaterial({ color: 0xaaddff, emissive: 0x2288aa, emissiveIntensity: 0.6 });
      [[-1.2, 2.2, 2.26], [1.2, 2.2, 2.26], [-1.2, 1.2, 2.26], [1.2, 1.2, 2.26]].forEach(([wx, wy, wz]) => {
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(wx, wy, wz);
        group.add(win);
      });

      // 门
      const doorGeo = new THREE.BoxGeometry(0.9, 1.4, 0.05);
      const doorMat = new THREE.MeshStandardMaterial({ color: 0x8b6914 });
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(0, 1.0, 2.26);
      group.add(door);

      // 底部发光环
      const ringGeo = new THREE.RingGeometry(3.2, 3.5, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.31;
      group.add(ring);

      // 名称标签
      const label = this.createTextLabel(wh.name, wh.description || '');
      label.position.set(0, 5.5, 0);
      group.add(label);

      this.scene.add(group);
    },

    createTextLabel(name, desc) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(10, 37, 64, 0.85)';
      ctx.roundRect(0, 0, 256, 80, 10);
      ctx.fill();
      ctx.strokeStyle = '#4488ff';
      ctx.lineWidth = 2;
      ctx.roundRect(1, 1, 254, 78, 10);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px Microsoft YaHei, Arial';
      ctx.textAlign = 'center';
      ctx.fillText(name, 128, 30);
      ctx.fillStyle = 'rgba(180,210,255,0.8)';
      ctx.font = '16px Microsoft YaHei, Arial';
      ctx.fillText(desc, 128, 58);
      const texture = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(3.2, 1.0, 1);
      return sprite;
    },

    onMouseMove(event) {
      const canvas = this.$refs.threeCanvas;
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.warehouseMeshes);
      if (intersects.length > 0) {
        const mesh = intersects[0].object;
        if (mesh.userData.warehouse) {
          const wh = mesh.userData.warehouse;
          this.tooltip = { visible: true, x: event.clientX - rect.left + 15, y: event.clientY - rect.top - 40, name: wh.name, desc: wh.description || '' };
          canvas.style.cursor = 'pointer';
          if (this.hoveredMesh !== mesh) {
            if (this.hoveredMesh) { this.hoveredMesh.material.emissive.setHex(0x000000); }
            this.hoveredMesh = mesh;
            mesh.material.emissive.setHex(0x4488ff);
            mesh.material.emissiveIntensity = 0.4;
          }
        }
      } else {
        this.tooltip.visible = false;
        canvas.style.cursor = 'default';
        if (this.hoveredMesh) { this.hoveredMesh.material.emissive.setHex(0x000000); this.hoveredMesh = null; }
      }
    },

    onMouseClick(event) {
      const canvas = this.$refs.threeCanvas;
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.warehouseMeshes);
      if (intersects.length > 0) {
        const mesh = intersects[0].object;
        if (mesh.userData.warehouse) this.$emit('select-warehouse', mesh.userData.warehouse);
      }
    },

    animate() {
      this.animationId = requestAnimationFrame(this.animate);
      if (this.controls) this.controls.update();
      if (this.renderer && this.scene && this.camera) this.renderer.render(this.scene, this.camera);
    },

    handleResize() {
      const container = this.$refs.canvasContainer;
      if (!container || !this.camera || !this.renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight || 500;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }
};
</script>

<style lang="scss" scoped>
.warehouse-scene-3d {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 12px;
  overflow: hidden;

  .canvas-container {
    width: 100%;
    height: 100%;
    canvas { display: block; width: 100%; height: 100%; }
  }

  .wh-tooltip {
    position: absolute;
    background: rgba(10, 37, 64, 0.92);
    border: 1px solid #4488ff;
    border-radius: 8px;
    padding: 8px 16px;
    pointer-events: none;
    z-index: 100;
    .tooltip-title { color: #fff; font-size: 14px; font-weight: 600; }
    .tooltip-desc { color: rgba(180,210,255,.8); font-size: 12px; margin-top: 2px; }
    .tooltip-hint { color: #4488ff; font-size: 12px; margin-top: 4px; }
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
}
</style>
