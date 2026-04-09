<template>
  <div class="balance-area-3d">
    <div class="canvas-container" ref="canvasContainer">
      <canvas ref="threeCanvas"></canvas>
    </div>

    <div
      v-if="tooltip.visible"
      class="area-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="tooltip-title">{{ tooltip.name }}</div>
      <div class="tooltip-hint">点击进入</div>
    </div>

    <div class="control-hint">
      <span>🖱️ 左键拖拽旋转 | 滚轮缩放 | 点击平衡区进入</span>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default {
  name: 'BalanceArea3D',
  props: {
    areas: { type: Array, default: () => [] }
  },
  data() {
    return {
      scene: null, camera: null, renderer: null, controls: null,
      animationId: null, areaMeshes: [], raycaster: null, mouse: null,
      tooltip: { visible: false, x: 0, y: 0, name: '' },
      hoveredMesh: null
    };
  },
  watch: {
    areas() {
      this.rebuildScene();
    }
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
      this.scene.background = new THREE.Color(0x0d1b2a);  // 与其他层级一致的深色背景
      this.scene.fog = new THREE.Fog(0x0d1b2a, 35, 80);

      this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
      this.camera.position.set(0, 22, 28);

      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.target.set(0, 0, 0);
      this.controls.minDistance = 10;
      this.controls.maxDistance = 70;
      this.controls.maxPolarAngle = Math.PI / 2.1;

      const ambient = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambient);
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(15, 25, 15);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      this.scene.add(dirLight);
      const pointLight = new THREE.PointLight(0x4488ff, 1.2, 60);
      pointLight.position.set(0, 15, 0);
      this.scene.add(pointLight);

      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
      canvas.addEventListener('mousemove', this.onMouseMove);
      canvas.addEventListener('click', this.onMouseClick);
    },

    buildScene() {
      this.createGround();
      this.areaMeshes = [];
      
      const total = this.areas.length;
      if (total === 0) return;

      // 动态布局算法
      // 1-2个: 左右对称
      // 3-4个: 菱形或正方形
      // 5个以上: 圆环
      const getPosition = (idx, count) => {
        if (count === 1) return { x: 0, z: 0 };
        if (count === 2) return { x: idx === 0 ? -12 : 12, z: 0 };
        
        // 统一使用圆环布局，半径随数量动态微调
        const radius = Math.max(15, count * 3.5);
        const angle = (idx / count) * Math.PI * 2;
        return {
          x: Math.cos(angle) * radius,
          z: Math.sin(angle) * radius
        };
      };

      this.areas.forEach((area, idx) => {
        const pos = getPosition(idx, total);
        this.createAreaCircle(area, idx, pos);
      });
    },

    rebuildScene() {
      if (!this.scene) return;
      const toRemove = [];
      this.scene.traverse(obj => {
        if (obj.isMesh || obj.isSprite || obj.isGroup && obj.userData.type === 'area') {
          toRemove.push(obj);
        }
      });
      toRemove.forEach(obj => {
        this.scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      this.areaMeshes = [];
      this.buildScene();
    },

    createGround() {
      // 深色地面（与其他层级一致）
      const groundGeo = new THREE.PlaneGeometry(100, 100);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a2540, roughness: 0.9 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      this.scene.add(ground);
      // 网格
      const grid = new THREE.GridHelper(80, 40, 0x1a3a5c, 0x1a3a5c);
      grid.position.y = 0.01;
      this.scene.add(grid);
    },

    /**
     * 为每个平衡区创建一个圆圈区域，内部有示例厂房
     */
    createAreaCircle(area, idx, pos) {
      const circleRadius = 7;
      const color = area.color || [0x4a90d9, 0x27ae60, 0xe67e22, 0x9b59b6, 0xe74c3c][idx % 5];

      const group = new THREE.Group();
      group.position.set(pos.x, 0, pos.z);
      group.userData = { type: 'area', area };

      // 圆形地面（区域底面）
      const circleGeo = new THREE.CircleGeometry(circleRadius, 64);
      const circleMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color).multiplyScalar(0.35),
        roughness: 0.8,
        transparent: true,
        opacity: 0.7
      });
      const circlePlane = new THREE.Mesh(circleGeo, circleMat);
      circlePlane.rotation.x = -Math.PI / 2;
      circlePlane.position.y = 0.02;
      circlePlane.userData = { type: 'area', area };
      group.add(circlePlane);
      this.areaMeshes.push(circlePlane);

      // 圆形边界发光环（外环）
      const outerRingGeo = new THREE.RingGeometry(circleRadius - 0.15, circleRadius + 0.15, 64);
      const outerRingMat = new THREE.MeshBasicMaterial({
        color, side: THREE.DoubleSide, transparent: true, opacity: 0.9
      });
      const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
      outerRing.rotation.x = -Math.PI / 2;
      outerRing.position.y = 0.03;
      group.add(outerRing);

      // 第二个内发光环（虚线感）
      const innerRingGeo = new THREE.RingGeometry(circleRadius * 0.55, circleRadius * 0.6, 64);
      const innerRingMat = new THREE.MeshBasicMaterial({
        color, side: THREE.DoubleSide, transparent: true, opacity: 0.4
      });
      const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
      innerRing.rotation.x = -Math.PI / 2;
      innerRing.position.y = 0.025;
      group.add(innerRing);

      // 圆心标记
      const centerGeo = new THREE.CircleGeometry(0.4, 16);
      const centerMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
      const center = new THREE.Mesh(centerGeo, centerMat);
      center.rotation.x = -Math.PI / 2;
      center.position.y = 0.04;
      group.add(center);

      // 圆圈内的示例厂房（3座，三角形分布）
      const buildingPositions = [
        { bx: 0,    bz: -3.5, rot: 0 },
        { bx: -3.0, bz: 1.8,  rot: Math.PI / 6 },
        { bx: 3.0,  bz: 1.8,  rot: -Math.PI / 6 }
      ];
      buildingPositions.forEach(({ bx, bz, rot }) => {
        this.addMiniBuilding(group, bx, bz, rot, color);
      });

      // 名称标签
      const label = this.createTextLabel(area.name);
      label.position.set(0, 6.5, 0);
      group.add(label);

      this.scene.add(group);
    },

    /**
     * 添加小型厂房建筑模型
     */
    addMiniBuilding(parent, bx, bz, rotY, color) {
      const g = new THREE.Group();
      g.position.set(bx, 0, bz);
      g.rotation.y = rotY;

      // 地基
      const baseGeo = new THREE.BoxGeometry(1.8, 0.12, 1.8);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x2d5a8a, roughness: 0.7 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.06;
      base.receiveShadow = true;
      g.add(base);

      // 主体
      const bodyGeo = new THREE.BoxGeometry(1.5, 1.2, 1.5);
      const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.2 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.72;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      // 四棱锥屋顶
      const roofGeo = new THREE.ConeGeometry(1.2, 0.7, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x1a3a6a, roughness: 0.6 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 1.67;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      g.add(roof);

      // 小窗户
      const winGeo = new THREE.BoxGeometry(0.3, 0.28, 0.03);
      const winMat = new THREE.MeshStandardMaterial({ color: 0xaaddff, emissive: 0x2288aa, emissiveIntensity: 0.6 });
      [[-0.38, 0.85, 0.77], [0.38, 0.85, 0.77]].forEach(([wx, wy, wz]) => {
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(wx, wy, wz);
        g.add(win);
      });

      // 小门
      const doorGeo = new THREE.BoxGeometry(0.35, 0.55, 0.03);
      const doorMat = new THREE.MeshStandardMaterial({ color: 0x8b6914 });
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(0, 0.39, 0.77);
      g.add(door);

      parent.add(g);
    },

    createTextLabel(text) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 72;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(10, 37, 64, 0.88)';
      ctx.roundRect(0, 0, 256, 72, 12);
      ctx.fill();
      ctx.strokeStyle = '#4488ff';
      ctx.lineWidth = 2;
      ctx.roundRect(2, 2, 252, 68, 12);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px Microsoft YaHei, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 36);
      const texture = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(3.2, 0.9, 1);
      return sprite;
    },

    onMouseMove(event) {
      const canvas = this.$refs.threeCanvas;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.areaMeshes);
      if (intersects.length > 0) {
        const mesh = intersects[0].object;
        if (mesh.userData.area) {
          this.tooltip = { visible: true, x: event.clientX - rect.left + 15, y: event.clientY - rect.top - 30, name: mesh.userData.area.name };
          canvas.style.cursor = 'pointer';
          if (this.hoveredMesh !== mesh) {
            if (this.hoveredMesh) this.hoveredMesh.material.opacity = 0.7;
            this.hoveredMesh = mesh;
            mesh.material.opacity = 1.0;
          }
        }
      } else {
        this.tooltip.visible = false;
        canvas.style.cursor = 'default';
        if (this.hoveredMesh) { this.hoveredMesh.material.opacity = 0.7; this.hoveredMesh = null; }
      }
    },

    onMouseClick(event) {
      const canvas = this.$refs.threeCanvas;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.areaMeshes);
      if (intersects.length > 0) {
        const mesh = intersects[0].object;
        if (mesh.userData.area) this.$emit('select-area', mesh.userData.area);
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
.balance-area-3d {
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

  .area-tooltip {
    position: absolute;
    background: rgba(10, 37, 64, 0.92);
    border: 1px solid #4488ff;
    border-radius: 8px;
    padding: 8px 16px;
    pointer-events: none;
    z-index: 100;
    .tooltip-title { color: #fff; font-size: 14px; font-weight: 600; }
    .tooltip-hint { color: #4488ff; font-size: 12px; margin-top: 2px; }
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
