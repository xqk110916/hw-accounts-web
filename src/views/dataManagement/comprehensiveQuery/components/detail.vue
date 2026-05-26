<template>
  <el-dialog
    title="综合查询详情"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="780px"
    custom-class="modern-detail-dialog"
    :before-close="handleClose">
    <div class="dialog-content">
      <!-- 基础信息 -->
      <div class="info-section">
        <div class="section-title">
          <span class="title-bar"></span>
          <span class="title-text">基础资产信息</span>
        </div>
        <div class="grid-layout cols-3">
          <div class="grid-item">
            <span class="item-label">容器号</span>
            <span class="item-value highlight">{{ form.containerCode || '-' }}</span>
          </div>
          <div class="grid-item">
            <span class="item-label">材料名称</span>
            <span class="item-value text-dark">{{ form.goodName || '-' }}</span>
          </div>
          <div class="grid-item">
            <span class="item-label">当前状态</span>
            <span class="item-value">
              <span :class="['status-badge', getStatusClass(form.statusName)]">
                {{ form.statusName || '未知' }}
              </span>
            </span>
          </div>
          <div class="grid-item">
            <span class="item-label">所处库房</span>
            <span class="item-value">{{ form.warehouseName || '-' }}</span>
          </div>
          <div class="grid-item">
            <span class="item-label">具体位置</span>
            <span class="item-value">{{ form.location || '-' }}</span>
          </div>
          <div class="grid-item">
            <span class="item-label">调拨依据</span>
            <span class="item-value text-muted">{{ form.transferBasis || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 封记状态 -->
      <div class="info-section">
        <div class="section-title">
          <span class="title-bar"></span>
          <span class="title-text">封记安全状态</span>
        </div>
        <div class="grid-layout cols-2 bg-cards">
          <div class="grid-card">
            <div class="card-inner">
              <span class="item-label">封记 1 类型</span>
              <span class="item-value">{{ form.sealType1 || '-' }}</span>
            </div>
            <div class="card-inner border-top">
              <span class="item-label">封记 1 编码</span>
              <span class="item-value code-text">{{ form.sealCode1 || '-' }}</span>
            </div>
          </div>
          <div class="grid-card">
            <div class="card-inner">
              <span class="item-label">封记 2 类型</span>
              <span class="item-value">{{ form.sealType2 || '-' }}</span>
            </div>
            <div class="card-inner border-top">
              <span class="item-label">封记 2 编码</span>
              <span class="item-value code-text">{{ form.sealCode2 || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 出入库生命周期 -->
      <div class="info-section last-section">
        <div class="section-title">
          <span class="title-bar"></span>
          <span class="title-text">业务生命周期</span>
        </div>
        <div class="flow-layout">
          <div class="flow-box inbound">
            <div class="flow-header">
              <i class="el-icon-download header-icon"></i>
              <span>入库记录与快照</span>
            </div>
            <div class="flow-body">
              <div v-if="form.inboundInfo" class="pre-text">{{ form.inboundInfo }}</div>
              <div v-else class="empty-text">暂无相关入库流转记录</div>
            </div>
          </div>
          <div class="flow-box outbound">
            <div class="flow-header">
              <i class="el-icon-upload2 header-icon"></i>
              <span>出库记录与快照</span>
            </div>
            <div class="flow-body">
              <div v-if="form.outboundInfo" class="pre-text">{{ form.outboundInfo }}</div>
              <div v-else class="empty-text">暂无相关出库流转记录</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" class="close-btn" @click="handleClose">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      form: {},
    }
  },
  methods: {
    open(row) {
      this.form = { ...row }
      this.visible = true
    },
    handleClose() {
      this.visible = false
      this.form = {}
    },
    getStatusClass(status) {
      if (!status) return 'status-unknown'
      if (status.includes('库存') || status.includes('在库')) {
        return 'status-success'
      }
      if (status.includes('出库')) {
        return 'status-info'
      }
      return 'status-default'
    }
  },
}
</script>

<style lang="scss" scoped>
/* 弹窗核心区域 */
.dialog-content {
  padding: 0 8px 10px 8px;
  max-height: 70vh;
  overflow-y: auto;
}

/* 块划分 */
.info-section {
  margin-bottom: 24px;
  
  &.last-section {
    margin-bottom: 8px;
  }
}

/* 标题样式 */
.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  
  .title-bar {
    width: 3px;
    height: 14px;
    background-color: #246fe5;
    border-radius: 1.5px;
    margin-right: 8px;
  }
  
  .title-text {
    font-size: 14px;
    font-weight: 600;
    color: #1b2129;
    letter-spacing: 0.2px;
  }
}

/* 网格排版 */
.grid-layout {
  display: grid;
  gap: 16px;
  padding: 12px 14px;
  background-color: #f8f9fc;
  border-radius: 6px;
  border: 1px solid #edf1f7;
  
  &.cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
  
  &.cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  &.bg-cards {
    background-color: transparent;
    border: none;
    padding: 0;
    gap: 12px;
  }
}

/* Grid项 - Stripe样式标签在上数值在下 */
.grid-item {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  
  .item-label {
    font-size: 12px;
    color: #8a929f;
    margin-bottom: 6px;
    font-weight: 500;
  }
  
  .item-value {
    font-size: 13.5px;
    color: #2e353f;
    line-height: 1.4;
    word-break: break-all;
    
    &.highlight {
      color: #246fe5;
      font-weight: 600;
    }
    
    &.text-dark {
      color: #1b2129;
      font-weight: 500;
    }
    
    &.text-muted {
      color: #626c78;
    }
  }
}

/* 封记专用卡片式 */
.grid-card {
  background-color: #f8f9fc;
  border: 1px solid #edf1f7;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #d1dcff;
    box-shadow: 0 2px 8px rgba(36, 111, 229, 0.04);
  }
  
  .card-inner {
    padding: 10px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &.border-top {
      border-top: 1px dashed #e1e7f0;
    }
    
    .item-label {
      font-size: 12px;
      color: #8a929f;
      font-weight: 500;
    }
    
    .item-value {
      font-size: 13px;
      color: #1b2129;
      font-weight: 500;
      
      &.code-text {
        font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
        color: #2e353f;
        background: #f1f4f9;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
      }
    }
  }
}

/* 状态徽章 */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 12px;
  line-height: 1.4;
  
  &.status-success {
    background-color: #e6f8ea;
    color: #1aa338;
  }
  
  &.status-info {
    background-color: #f1f4f9;
    color: #626c78;
    border: 1px solid #e1e7f0;
  }
  
  &.status-default, &.status-unknown {
    background-color: #fff1e6;
    color: #f2711c;
  }
}

/* 流转卡片生命周期左右布局 */
.flow-layout {
  display: flex;
  gap: 16px;
  
  .flow-box {
    flex: 1;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 160px;
    
    &.inbound {
      background-color: #f7fafc;
      border: 1px solid #e3e8f0;
      border-left: 3px solid #319795;
      
      .header-icon {
        color: #319795;
      }
    }
    
    &.outbound {
      background-color: #fafafc;
      border: 1px solid #e8e8f0;
      border-left: 3px solid #718096;
      
      .header-icon {
        color: #718096;
      }
    }
    
    .flow-header {
      padding: 10px 14px;
      font-size: 12.5px;
      font-weight: 600;
      color: #2d3748;
      border-bottom: 1px solid rgba(0,0,0,0.03);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .flow-body {
      padding: 12px 14px;
      flex: 1;
      overflow-y: auto;
      font-size: 12.5px;
      color: #4a5568;
      line-height: 1.6;
      
      .pre-text {
        white-space: pre-wrap;
      }
      
      .empty-text {
        color: #a0aec0;
        font-style: italic;
        display: flex;
        height: 100%;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

/* 覆盖Element Dialog的一些硬核样式，实现极致简洁 */
::v-deep .modern-detail-dialog {
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
  
  .el-dialog__header {
    padding: 18px 24px 14px;
    border-bottom: 1px solid #f1f4f9;
    
    .el-dialog__title {
      font-size: 15px;
      font-weight: 600;
      color: #1b2129;
    }
    
    .el-dialog__headerbtn {
      top: 18px;
    }
  }
  
  .el-dialog__body {
    padding: 20px 24px 10px;
  }
  
  .el-dialog__footer {
    padding: 12px 24px 18px;
    border-top: 1px solid #f1f4f9;
  }
}

.close-btn {
  padding: 7px 18px;
  border-color: #dcdfe6;
  color: #606266;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    color: #246fe5;
    border-color: #cce6ff;
    background-color: #f5f9ff;
  }
}
</style>

