<template>
  <div class="shelf-view-3d">
    <div class="view-header">
      <h3 class="shelf-title">
        <i class="el-icon-s-grid"></i>
        {{ shelfName || '货架视图' }}
      </h3>
      <div class="view-controls">
        <!-- <el-button-group size="mini">
          <el-button 
            :type="viewMode === 'front' ? 'primary' : 'default'"
            @click="setViewMode('front')"
          >正视图</el-button>
          <el-button 
            :type="viewMode === '3d' ? 'primary' : 'default'"
            @click="setViewMode('3d')"
          >立体图</el-button>
        </el-button-group> -->
        <el-button 
          size="mini" 
          icon="el-icon-refresh"
          @click="resetCamera"
          title="重置视角"
        ></el-button>
      </div>
    </div>

    <!-- Three.js 渲染容器 -->
    <div class="canvas-container" ref="canvasContainer">
      <canvas ref="threeCanvas"></canvas>
    </div>

    <!-- 容器详情提示 -->
    <div 
      v-if="tooltip.visible" 
      class="container-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="tooltip-header">
        <span class="container-icon">🛢️</span>
        <span>{{ tooltip.container.code || '容器' }}</span>
      </div>
      <div class="tooltip-body">
        <div class="info-row">
          <span class="label">材料代码:</span>
          <span class="value">{{ tooltip.container.materialCode || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">容器编号:</span>
          <span class="value">{{ tooltip.container.code || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">入库时间:</span>
          <span class="value">{{ tooltip.container.storageDate || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!layers || layers.length === 0" class="empty-state">
      <i class="el-icon-box"></i>
      <p>请选择货架查看详情</p>
    </div>

    <!-- 操作提示 -->
    <div class="control-hint" v-if="layers && layers.length > 0">
      <span>🖱️ 左键拖拽旋转 | 右键拖拽视图 | 滚轮缩放</span>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { getContainerColor } from '../utils/colorHelper';

export default {
  name: 'ShelfView3D',
  props: {
    shelfName: {
      type: String,
      default: ''
    },
    shelfType: {
      type: String,
      default: ''
    },
    warehouseType: {
      type: [String, Number],
      default: ''
    },
    layers: {
      type: Array,
      default: () => []
    },
    dateColorMap: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      viewMode: 'front',
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      containerMeshes: [],
      raycaster: null,
      mouse: null,
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        container: {}
      },
      animationId: null
    };
  },
  watch: {
    layers: {
      handler() {
        this.rebuildShelf();
      },
      deep: true
    }
  },
  mounted() {
    this.initThree();
    this.buildShelf();
    this.setViewMode(this.viewMode); // 初始化视角
    this.animate();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  },
  methods: {
    initThree() {
      const container = this.$refs.canvasContainer;
      const canvas = this.$refs.threeCanvas;
      const width = container.clientWidth;
      const height = container.clientHeight || 350;

      // 场景
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x1a1a2e);

      // 相机
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      this.camera.position.set(0, 3, 8);

      // 渲染器
      this.renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true 
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.shadowMap.enabled = true;

      // 轨道控制器
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.minDistance = 5;
      this.controls.maxDistance = 30;

      // 光照
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 15, 10);
      directionalLight.castShadow = true;
      this.scene.add(directionalLight);

      // 射线检测
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();

      // 鼠标事件
      canvas.addEventListener('mousemove', this.onMouseMove);
      canvas.addEventListener('click', this.onMouseClick);
    },

    isOldWarehouse() {
      return String(this.warehouseType) === '2';
    },
    buildShelf() {
      // 清除旧的货架
      this.clearShelf();

      const shelfWidth = 6;
      const shelfDepth = 2;

      // 老库：只有底座 + 物料容器
      if (this.isOldWarehouse()) {
        this.createBase(shelfWidth, shelfDepth);
        this.layers.forEach((layer) => {
          this.createLayerContainers(layer, 0.1, shelfWidth, shelfDepth);
        });
        return;
      }

      // 新库：完整货架框架
      const layerHeight = 1.5;
      const layerCount = this.layers.length;
      const totalHeight = layerCount * layerHeight + 0.5;

      // 创建货架框架
      this.createShelfFrame(shelfWidth, shelfDepth, totalHeight, layerCount, layerHeight);

      // 创建每层的容器
      this.layers.forEach((layer, layerIndex) => {
        const y = layerIndex * layerHeight + 0.5;
        this.createLayerContainers(layer, y, shelfWidth, shelfDepth);
      });

      // 创建底座
      this.createBase(shelfWidth, shelfDepth);
    },

    createShelfFrame(width, depth, height, layerCount, layerHeight) {
      const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a5568,
        metalness: 0.5,
        roughness: 0.5
      });

      // 四根立柱
      const pillarGeometry = new THREE.BoxGeometry(0.15, height, 0.15);
      const positions = [
        [-width/2, height/2, -depth/2],
        [width/2, height/2, -depth/2],
        [-width/2, height/2, depth/2],
        [width/2, height/2, depth/2]
      ];

      positions.forEach(pos => {
        const pillar = new THREE.Mesh(pillarGeometry, frameMaterial);
        pillar.position.set(...pos);
        pillar.castShadow = true;
        this.scene.add(pillar);
      });

      // 每层的横梁
      for (let i = 0; i <= layerCount; i++) {
        const y = i * layerHeight + 0.4;
        
        // 前后横梁
        const beamGeometryFB = new THREE.BoxGeometry(width, 0.08, 0.08);
        [-depth/2, depth/2].forEach(z => {
          const beam = new THREE.Mesh(beamGeometryFB, frameMaterial);
          beam.position.set(0, y, z);
          this.scene.add(beam);
        });

        // 左右横梁
        const beamGeometryLR = new THREE.BoxGeometry(0.08, 0.08, depth);
        [-width/2, width/2].forEach(x => {
          const beam = new THREE.Mesh(beamGeometryLR, frameMaterial);
          beam.position.set(x, y, 0);
          this.scene.add(beam);
        });

        // 层板
        if (i < layerCount) {
          const shelfBoardGeometry = new THREE.BoxGeometry(width - 0.1, 0.05, depth - 0.1);
          const shelfBoardMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2d3748,
            metalness: 0.3,
            roughness: 0.7
          });
          const shelfBoard = new THREE.Mesh(shelfBoardGeometry, shelfBoardMaterial);
          shelfBoard.position.set(0, y + 0.05, 0);
          shelfBoard.receiveShadow = true;
          this.scene.add(shelfBoard);
        }
      }
    },

    createLayerContainers(layer, y, shelfWidth, shelfDepth) {
      const containers = layer.containers || [];
      // 只显示有物料的容器
      const filledContainers = containers.filter(c => c.materialCode);
      const containerCount = filledContainers.length;
      
      if (containerCount === 0) return;
      
      const spacing = shelfWidth / (containers.length + 1);

      filledContainers.forEach((container) => {
        // 计算容器在原数组中的索引位置
        const originalIndex = containers.findIndex(c => c.id === container.id);
        const x = -shelfWidth/2 + spacing * (originalIndex + 1);
        
        // 容器正方体 (与整体3D库房位置图保持一致)
        const size = Math.min(spacing * 0.8, shelfDepth * 0.85, 1.25);
        const boxGeometry = new THREE.BoxGeometry(size, size, size);

        // 根据容器状态确定颜色
        const hexColor = getContainerColor(container.status, container.materialCode || container.goodCode);
        const color = parseInt(hexColor.replace('#', ''), 16);

        const material = new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.4,
          roughness: 0.6
        });

        const box = new THREE.Mesh(boxGeometry, material);
        box.position.set(x, y + size / 2, 0);
        box.castShadow = true;
        box.receiveShadow = true;

        // 存储容器数据用于点击交互
        box.userData = {
          type: 'container',
          container: container
        };

        this.scene.add(box);
        this.containerMeshes.push(box);
      });
    },

    createBase(width, depth) {
      const baseGeometry = new THREE.BoxGeometry(width + 0.5, 0.2, depth + 0.5);
      const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2d3748,
        metalness: 0.3,
        roughness: 0.8
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, 0.1, 0);
      base.receiveShadow = true;
      this.scene.add(base);

      // 地面
      const groundGeometry = new THREE.PlaneGeometry(20, 20);
      const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x16213e,
        side: THREE.DoubleSide
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0;
      ground.receiveShadow = true;
      this.scene.add(ground);
    },

    clearShelf() {
      // 移除所有对象(保留光照)
      const objectsToRemove = [];
      this.scene.traverse((object) => {
        if (object.isMesh) {
          objectsToRemove.push(object);
        }
      });
      objectsToRemove.forEach(obj => {
        this.scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      this.containerMeshes = [];
    },

    rebuildShelf() {
      this.buildShelf();
    },

    setViewMode(mode) {
      this.viewMode = mode;
      if (mode === 'front') {
        this.camera.position.set(0, 3, 8);
        this.controls.target.set(0, 2, 0);
      } else {
        // 3D视图 - 斜视角
        this.camera.position.set(8, 6, 10);
        this.controls.target.set(0, 2, 0);
      }
      this.controls.update();
    },

    resetCamera() {
      this.setViewMode(this.viewMode);
    },

    animate() {
      this.animationId = requestAnimationFrame(this.animate);
      if (this.controls) {
        this.controls.update();
      }
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    },

    handleResize() {
      const container = this.$refs.canvasContainer;
      if (!container) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight || 350;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    },

    onMouseMove(event) {
      const canvas = this.$refs.threeCanvas;
      const rect = canvas.getBoundingClientRect();
      
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.containerMeshes);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.container) {
          this.tooltip = {
            visible: true,
            x: event.clientX - rect.left + 15,
            y: event.clientY - rect.top - 10,
            container: object.userData.container
          };
          canvas.style.cursor = 'pointer';
        }
      } else {
        this.tooltip.visible = false;
        canvas.style.cursor = 'default';
      }
    },

    onMouseClick(event) {
      const canvas = this.$refs.threeCanvas;
      const rect = canvas.getBoundingClientRect();
      
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.containerMeshes);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.container && (object.userData.container.code || object.userData.container.materialCode || String(object.userData.container.status) === '1')) {
          this.$emit('container-click', object.userData.container);
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.shelf-view-3d {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .shelf-title {
      margin: 0;
      color: #fff;
      font-size: 16px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      
      i {
        color: #67C23A;
      }
    }

    .view-controls {
      display: flex;
      gap: 8px;
    }
  }

  .canvas-container {
    width: 100%;
    flex: 1;
    min-height: 200px;
    border-radius: 8px;
    overflow: hidden;
    
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  }

  .container-tooltip {
    position: absolute;
    background: rgba(255, 255, 255, 0.98);
    border-radius: 8px;
    padding: 12px 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    z-index: 100;
    pointer-events: none;
    min-width: 180px;
    
    .tooltip-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ebeef5;
      
      .container-icon {
        font-size: 18px;
      }
    }
    
    .tooltip-body {
      .info-row {
        display: flex;
        justify-content: space-between;
        margin: 6px 0;
        font-size: 12px;
        
        .label {
          color: #909399;
        }
        
        .value {
          color: #303133;
          font-weight: 500;
        }
      }
    }
  }

  .empty-state {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
    
    i {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    p {
      font-size: 14px;
    }
  }

  .control-hint {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    padding: 4px 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }
}
</style>
