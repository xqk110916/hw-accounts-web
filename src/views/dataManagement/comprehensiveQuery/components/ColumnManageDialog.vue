<template>
  <el-dialog
    title="列头管理"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="480px"
    :before-close="handleClose">
    <div class="column-manage">
      <p class="tip">拖拽调整列顺序，勾选控制列显隐：</p>
      <draggable
        v-model="localColumns"
        handle=".drag-handle"
        animation="200"
        ghost-class="ghost"
      >
        <div
          v-for="col in localColumns"
          :key="col.prop"
          class="column-item"
        >
          <el-checkbox v-model="col.visible" @change="onCheckChange">{{ col.label }}</el-checkbox>
          <i class="el-icon-rank drag-handle"></i>
        </div>
      </draggable>
    </div>
    <span slot="footer">
      <el-button size="small" @click="handleReset">恢复默认</el-button>
      <el-button size="small" @click="handleClose">取 消</el-button>
      <el-button type="primary" size="small" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  components: { draggable },
  props: {
    columns: { type: Array, default: () => [] },
  },
  data() {
    return {
      visible: false,
      localColumns: [],
    }
  },
  methods: {
    open(visibleProps) {
      const colMap = {}
      this.columns.forEach(col => { colMap[col.prop] = col })
      // 保持当前可见列的顺序在前，不可见列在后
      this.localColumns = [
        ...visibleProps.map(prop => ({
          prop,
          label: (colMap[prop] || {}).label || prop,
          visible: true,
        })),
        ...this.columns
          .filter(col => !visibleProps.includes(col.prop))
          .map(col => ({ prop: col.prop, label: col.label, visible: false })),
      ]
      this.visible = true
    },
    onCheckChange() {
      // at least one column must be visible
      const checkedCount = this.localColumns.filter(c => c.visible).length
      if (checkedCount === 0) {
        this.$message.warning('至少保留一列')
        this.localColumns.forEach(c => { c.visible = true })
      }
    },
    handleConfirm() {
      const result = this.localColumns
        .filter(c => c.visible)
        .map(c => c.prop)
      this.$emit('confirm', result)
      this.visible = false
    },
    handleReset() {
      this.localColumns = this.columns.map(col => ({
        prop: col.prop,
        label: col.label,
        visible: true,
      }))
    },
    handleClose() {
      this.visible = false
    },
  },
}
</script>

<style scoped>
.column-manage {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 10px;
}
.tip {
  font-size: 13px;
  color: #909399;
  margin-bottom: 10px;
}
.column-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 4px;
  background: #fff;
  transition: background 0.2s;
}
.column-item:hover {
  background: #f5f7fa;
}
.drag-handle {
  cursor: grab;
  font-size: 16px;
  color: #909399;
}
.drag-handle:active {
  cursor: grabbing;
}
.ghost {
  opacity: 0.5;
  background: #e6f0ff;
}
</style>
