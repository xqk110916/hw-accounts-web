<template>
  <el-drawer
    :visible.sync="visible"
    custom-class="node-detail-drawer"
    size="560px"
    :with-header="false"
    @closed="handleClosed"
  >
    <div class="drawer-shell">
      <div class="drawer-header">
        <div>
          <div class="eyebrow">节点详情</div>
          <div class="title">{{ detail.name || detail.balanceAreaName || '-' }}</div>
        </div>
        <el-button icon="el-icon-close" circle size="mini" @click="visible = false"></el-button>
      </div>

      <section class="section">
        <div class="section-title">
          <span>节点基本信息</span>
          <div>
            <el-button v-if="!editing" type="text" icon="el-icon-edit" @click="startEdit">编辑</el-button>
            <template v-else>
              <el-button size="mini" @click="cancelEdit">取消</el-button>
              <el-button type="primary" size="mini" @click="submitEdit">保存</el-button>
            </template>
          </div>
        </div>

        <el-form
          v-if="editing"
          ref="form"
          :model="form"
          :rules="rules"
          label-width="110px"
          class="detail-form"
        >
          <el-form-item label="节点" prop="code">
            <el-input v-model="form.code" size="small" placeholder="请输入节点"></el-input>
          </el-form-item>
          <el-form-item label="名称" prop="name">
            <el-input v-model="form.name" size="small" placeholder="请输入名称"></el-input>
          </el-form-item>
          <el-form-item label="调入许可证" prop="inLicense">
            <el-input v-model="form.inLicense" size="small" placeholder="请输入调入许可证"></el-input>
          </el-form-item>
          <el-form-item label="调出许可证" prop="outLicense">
            <el-input v-model="form.outLicense" size="small" placeholder="请输入调出许可证"></el-input>
          </el-form-item>
          <el-form-item label="类型" prop="type">
            <el-switch
              v-model="form.type"
              active-value="proxy"
              inactive-value="local"
              active-text="代存"
              inactive-text="本地"
            ></el-switch>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="3" size="small" placeholder="请输入备注"></el-input>
          </el-form-item>
        </el-form>

        <div v-else class="info-grid">
          <div v-for="item in infoItems" :key="item.label" class="info-item">
            <div class="label">{{ item.label }}</div>
            <div class="value">{{ item.value || '-' }}</div>
          </div>
        </div>
      </section>

      <section class="section inventory-section">
        <div class="section-title">
          <span>库存使用量</span>
          <el-tag size="mini" type="info">已使用 {{ usedPositions }} / 总库位 {{ totalPositions }}</el-tag>
        </div>
        <div class="inventory-body" v-loading="loadingInventory">
          <div class="chart-wrap">
            <div ref="chart" class="chart"></div>
            <div class="chart-center">
              <strong>{{ usageRate }}%</strong>
              <span>使用率</span>
            </div>
          </div>
          <div class="material-list">
            <div
              v-for="item in materialList"
              :key="item.name"
              :class="['material-item', { active: selectedMaterial === item.name }]"
              @click="selectMaterial(item.name)"
            >
              <span class="dot" :style="{ backgroundColor: item.color }"></span>
              <span class="name">{{ item.name }}</span>
              <span class="count">{{ item.value }}</span>
            </div>
            <el-empty v-if="!materialList.length" description="暂无库存占用数据" :image-size="80"></el-empty>
          </div>
        </div>
      </section>
    </div>
  </el-drawer>
</template>

<script>
import * as echarts from 'echarts';
import { getBalanceAreaDetail, updateBalanceArea } from '@/api/warehouse/balanceArea';
import { getPositionMap } from '@/api/warehouse/locationMap';

const COLORS = ['#246fe5', '#17a589', '#e6a23c', '#f56c6c', '#6f62d8', '#2f9bb4', '#909399'];

export default {
  name: 'NodeDetailDrawer',
  data() {
    return {
      visible: false,
      loadingInventory: false,
      editing: false,
      row: {},
      detail: {},
      form: {},
      positionList: [],
      selectedMaterial: '',
      chart: null,
      rules: {
        code: [{ required: true, message: '请输入节点', trigger: 'blur' }],
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        inLicense: [{ required: true, message: '请输入调入许可证', trigger: 'blur' }],
        outLicense: [{ required: true, message: '请输入调出许可证', trigger: 'blur' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }]
      }
    };
  },
  computed: {
    balanceAreaId() {
      return this.row.balanceId || this.row.balanceAreaId || this.row.id;
    },
    infoItems() {
      return [
        { label: '节点', value: this.detail.code },
        { label: '名称', value: this.detail.name || this.detail.balanceAreaName },
        { label: '调入许可证', value: this.detail.inLicense },
        { label: '调出许可证', value: this.detail.outLicense },
        { label: '类型', value: this.detail.type === 'proxy' ? '代存' : this.detail.type === 'local' ? '本地' : this.detail.type },
        { label: '备注', value: this.detail.remark }
      ];
    },
    totalPositions() {
      return this.positionList.length;
    },
    usedPositions() {
      return this.positionList.filter(item => String(item.status) === '1').length;
    },
    usageRate() {
      return this.totalPositions ? Math.round((this.usedPositions / this.totalPositions) * 100) : 0;
    },
    materialList() {
      const map = {};
      this.positionList
        .filter(item => String(item.status) === '1')
        .forEach(item => {
          const name = this.getMaterialName(item);
          map[name] = (map[name] || 0) + 1;
        });
      return Object.keys(map).map((name, index) => ({
        name,
        value: map[name],
        color: COLORS[index % COLORS.length]
      }));
    }
  },
  beforeDestroy() {
    this.disposeChart();
  },
  methods: {
    async open(row) {
      this.row = row || {};
      this.visible = true;
      this.editing = false;
      this.selectedMaterial = '';
      await Promise.all([this.fetchDetail(), this.fetchInventory()]);
      this.$nextTick(this.renderChart);
    },
    async fetchDetail() {
      if (!this.balanceAreaId) return;
      try {
        const res = await getBalanceAreaDetail(this.balanceAreaId);
        const data = res.data || {};
        this.detail = this.normalizeDetail(data);
        this.form = { ...this.detail };
      } catch (error) {
        console.error(error);
        this.$message.error('获取节点详情失败');
      }
    },
    async fetchInventory() {
      if (!this.balanceAreaId) return;
      this.loadingInventory = true;
      try {
        const res = await getPositionMap({ nodeId: this.balanceAreaId, nodeType: '1' });
        this.positionList = Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        console.error(error);
        this.positionList = [];
        this.$message.error('获取库存使用量失败');
      } finally {
        this.loadingInventory = false;
      }
    },
    normalizeDetail(data) {
      return {
        ...data,
        inLicense: data.inLicense || data.importLicense,
        outLicense: data.outLicense || data.exportLicense,
        type: data.type === '代存' ? 'proxy' : data.type === '本地' ? 'local' : (data.type || 'local')
      };
    },
    getMaterialName(item) {
      if (item.goodsName) return item.goodsName;
      if (!item.materialTypes) return '未命名材料';
      try {
        const parsed = JSON.parse(item.materialTypes);
        if (Array.isArray(parsed) && parsed.length) {
          const first = parsed[0];
          return typeof first === 'string' ? first : (first.label || first.name || first.value || '未命名材料');
        }
      } catch (error) {
        return item.materialTypes;
      }
      return '未命名材料';
    },
    startEdit() {
      this.form = { ...this.detail };
      this.editing = true;
    },
    cancelEdit() {
      this.editing = false;
      this.form = { ...this.detail };
    },
    submitEdit() {
      this.$refs.form.validate(async valid => {
        if (!valid) return;
        try {
          await updateBalanceArea({
            ...this.form,
            id: this.balanceAreaId,
            importLicense: this.form.inLicense,
            exportLicense: this.form.outLicense,
            type: this.form.type === 'proxy' ? '代存' : '本地'
          });
          this.$message.success('保存成功');
          this.editing = false;
          await this.fetchDetail();
          this.$emit('query');
        } catch (error) {
          console.error(error);
          this.$message.error('保存失败');
        }
      });
    },
    selectMaterial(name) {
      this.selectedMaterial = this.selectedMaterial === name ? '' : name;
      this.renderChart();
    },
    renderChart() {
      if (!this.visible || !this.$refs.chart) return;
      if (!this.chart) {
        this.chart = echarts.init(this.$refs.chart);
        this.chart.on('click', params => {
          if (params && params.name) this.selectMaterial(params.name);
        });
      }
      const data = this.materialList.map(item => ({
        name: item.name,
        value: item.value,
        itemStyle: {
          color: item.color,
          opacity: this.selectedMaterial && this.selectedMaterial !== item.name ? 0.32 : 1
        }
      }));
      const free = Math.max(this.totalPositions - this.usedPositions, 0);
      if (free) data.push({ name: '空闲库位', value: free, itemStyle: { color: '#e9edf3' }, silent: true });
      this.chart.setOption({
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: ['68%', '86%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data
        }]
      });
      this.chart.resize();
    },
    handleClosed() {
      this.editing = false;
      this.row = {};
      this.detail = {};
      this.form = {};
      this.positionList = [];
      this.disposeChart();
    },
    disposeChart() {
      if (this.chart) {
        this.chart.dispose();
        this.chart = null;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .node-detail-drawer {
  .el-drawer__body {
    height: 100%;
    overflow: hidden;
  }
}

.drawer-shell {
  height: 100%;
  padding: 22px 24px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #f6f8fb;
}

.drawer-header,
.section-title,
.inventory-body,
.material-item,
.info-item {
  display: flex;
  align-items: center;
}

.drawer-header,
.section-title {
  justify-content: space-between;
}

.drawer-header {
  margin-bottom: 18px;

  .eyebrow {
    color: #7a8699;
    font-size: 12px;
    line-height: 18px;
  }

  .title {
    color: #1b2129;
    font-size: 22px;
    font-weight: 600;
    line-height: 30px;
  }
}

.section {
  background: #fff;
  border: 1px solid #edf1f5;
  border-radius: 6px;
  padding: 18px;
  margin-bottom: 16px;
}

.section-title {
  color: #1b2129;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.detail-form {
  ::v-deep .el-input,
  ::v-deep .el-textarea {
    width: 100%;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  min-height: 54px;
  align-items: flex-start;
  flex-direction: column;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 4px;

  .label {
    color: #7a8699;
    font-size: 12px;
    margin-bottom: 6px;
  }

  .value {
    color: #1b2129;
    font-size: 14px;
    line-height: 20px;
    word-break: break-all;
  }
}

.inventory-body {
  align-items: stretch;
  min-height: 220px;
}

.chart-wrap {
  position: relative;
  width: 230px;
  height: 230px;
  flex: none;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;

  strong {
    display: block;
    color: #1b2129;
    font-size: 28px;
    line-height: 34px;
  }

  span {
    color: #7a8699;
    font-size: 12px;
  }
}

.material-list {
  flex: 1;
  min-width: 0;
  padding-left: 16px;
}

.material-item {
  height: 38px;
  padding: 0 10px;
  border-radius: 4px;
  cursor: pointer;
  color: #424c59;

  &.active,
  &:hover {
    background: #eef5ff;
    color: #246fe5;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
    flex: none;
  }

  .name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .count {
    font-weight: 600;
    margin-left: 8px;
  }
}
</style>
