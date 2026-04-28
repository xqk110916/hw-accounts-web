<template>
  <el-dialog
    title="容器详情"
    :visible.sync="dialogVisible"
    width="600px"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="container-detail" v-if="container">
      <!-- 基本信息描述列表 -->
      <div class="detail-section">
        <div class="section-header">
          <span>
            <i class="icon el-icon-document"></i>
            <span>基本信息</span>
          </span>
          <el-button type="text" size="mini" @click="handleViewHistory">查看入库信息</el-button>
        </div>
        <table class="custom-descriptions">
          <tr>
            <td class="label">容器编号</td>
            <td class="value">{{ detailValue('containerCode', 'code') }}</td>
            <td class="label">任务编号</td>
            <td class="value">{{ detailValue('taskNum') }}</td>
          </tr>
          <tr>
            <td class="label">材料类型</td>
            <td class="value">{{ materialTypesText }}</td>
            <td class="label">入库时间</td>
            <td class="value">{{ inboundTime }}</td>
          </tr>
          <tr>
            <td class="label">物料编码</td>
            <td class="value">{{ detailValue('goodCode', 'goodsCode', 'materialCode') }}</td>
            <td class="label">物料名称</td>
            <td class="value">{{ detailValue('goodsName', 'goodName', 'materialName') }}</td>
          </tr>
          <tr>
            <td class="label">生产单位</td>
            <td class="value">{{ detailValue('productionUnit') }}</td>
            <td class="label">货箱号</td>
            <td class="value">{{ detailValue('boxNum') }}</td>
          </tr>
          <tr>
            <td class="label">封记编码1</td>
            <td class="value">{{ detailValue('sealCode1') }}</td>
            <td class="label">封记编码2</td>
            <td class="value">{{ detailValue('sealCode2') }}</td>
          </tr>
          <tr>
            <td class="label">毛重</td>
            <td class="value">{{ formatWeight(detailValueRaw('grossWeight')) }}</td>
            <td class="label">皮重</td>
            <td class="value">{{ formatWeight(detailValueRaw('tareWeight')) }}</td>
          </tr>
          <tr>
            <td class="label">净重</td>
            <td class="value">{{ formatWeight(detailValueRaw('netWeight')) }}</td>
            <!-- <td class="label">重量单位</td>
            <td class="value">{{ detailValue('weightUnit') }}</td> -->
          </tr>
          <tr>
            <td class="label location-highlight"> <i class="el-icon-location"></i> 当前位置</td>
            <td class="value" colspan="3">
              <span class="location-highlight">{{ containerLocation }}</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- 移动容器操作区 -->
      <div class="detail-section mt20">
        <div class="section-header">
          <span>
            <i class="icon el-icon-location"></i>
            <span>位置信息</span>
          </span>
        </div>
        <div class="move-action-area">
          <div class="action-label">移动至:</div>
          <el-cascader
            v-model="targetLocation"
            :options="locationOptions"
            placeholder="请选择目标库房/货架"
            size="small"
            class="location-cascader"
            clearable
          ></el-cascader>
          <el-button 
            type="primary" 
            size="small" 
            @click="handleMove" 
            :disabled="!targetLocation.length"
          >
            确认移动
          </el-button>
        </div>
      </div>
    </div>
    <span slot="footer">
      <el-button @click="handleClose">关闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'ContainerDetailDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    container: {
      type: Object,
      default: null
    },
    containerLocation: {
      type: String,
      default: '-'
    },
    locationOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      targetLocation: []
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    },
    goodsDetail() {
      return (this.container && this.container.inboundGoodsEntity) || {};
    },
    inboundTime() {
      return this.detailValue('lastInboundTime', 'inboundTime', 'createTime', 'storageDate');
    },
    materialTypesText() {
      const value = this.detailValueRaw('materialTypes');
      if (!value) return '-';
      if (Array.isArray(value)) return value.length ? value.join('、') : '-';
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.length ? parsed.map(item => {
            if (item && typeof item === 'object') {
              return item.name || item.label || item.value || item.materialType || JSON.stringify(item);
            }
            return item;
          }).join('、') : '-';
        }
      } catch (error) {
        return value || '-';
      }
      return value || '-';
    }
  },
  methods: {
    detailValueRaw(...keys) {
      const detail = this.goodsDetail || {};
      const container = this.container || {};
      for (const key of keys) {
        const value = detail[key];
        if (value !== null && typeof value !== 'undefined' && value !== '') return value;
      }
      for (const key of keys) {
        const value = container[key];
        if (value !== null && typeof value !== 'undefined' && value !== '') return value;
      }
      return '';
    },
    detailValue(...keys) {
      const value = this.detailValueRaw(...keys);
      return value === '' ? '-' : value;
    },
    formatWeight(value) {
      if (value === null || typeof value === 'undefined' || value === '') return '-';
      const unit = this.detailValueRaw('weightUnit');
      return `${value}${unit ? ` ${unit}` : ''}`;
    },
    handleClose() {
      this.targetLocation = [];
      this.$emit('update:visible', false);
      this.$emit('close');
    },
    handleMove() {
      if (!this.targetLocation || this.targetLocation.length < 2) {
        this.$message.warning('请选择目标位置');
        return;
      }
      this.$emit('move-container', this.targetLocation);
      this.targetLocation = [];
    },
    handleViewHistory() {
      this.$emit('view-history');
    }
  }
};
</script>

<style lang="scss" scoped>
.container-detail {
  .detail-section {
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #ebeef5;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .section-header {
      background: #f5f7fa;
      color: #303133;
      padding: 12px 20px;
      font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #ebeef5;
      display: flex;
      justify-content: space-between;
      
      i {
        font-size: 18px;
        color: #409EFF;
        margin-right: 3px;
      }
    }
    
    .custom-descriptions {
      width: 100%;
      border-collapse: collapse;
      
      td {
        border: 1px solid #ebeef5;
        padding: 12px 15px;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .label {
        background-color: #fafafa;
        color: #606266;
        font-weight: 600;
        width: 120px;
        white-space: nowrap;
      }
      
      .value {
        color: #303133;
      }

      .location-highlight {
        color: #409EFF;
      }
    }
  }
  
  .move-action-area {
    margin: 0 20px 20px 20px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
    display: flex;
    align-items: center;
    gap: 15px;
    
    .action-label {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
      white-space: nowrap;
    }
    
    .location-cascader {
      flex: 1;
    }
  }

  .mt20 {
    margin-top: 20px;
  }
}
</style>
