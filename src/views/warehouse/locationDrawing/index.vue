<template>
  <div class="location-drawing-container">
    <div class="header-card">
      <div class="header-left">
        <el-input
          v-model="filterText"
          placeholder="输入关键字进行过滤"
          size="small"
          prefix-icon="el-icon-search"
          clearable
          style="width: 250px; margin-right: 15px"
        ></el-input>
        <el-button size="small" @click="handleExpandAll">全部展开</el-button>
        <el-button size="small" @click="handleCollapseAll">全部折叠</el-button>
      </div>
      <div class="header-right">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">添加库位</el-button>
        <!-- <el-button type="success" size="small" icon="el-icon-download" @click="handleExport">导出</el-button> -->
      </div>
    </div>

    <div class="tree-content">
      <el-tree
        ref="tree"
        :data="treeData"
        :props="defaultProps"
        :filter-node-method="filterNode"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        class="custom-tree"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }" @dblclick.stop="handleNodeDblClick(data)">
          <span class="node-label">
            <i :class="getNodeIcon(data)" class="node-icon"></i>
            {{ node.label }}
          </span>
          <span class="node-ops">
            <el-button
              v-if="isBalanceAreaNode(data)"
              type="text"
              size="mini"
              icon="el-icon-view"
              @click.stop="openNodeDetail(data)"
            >详情</el-button>
            <el-button
              v-if="isWarehouseNode(data)"
              type="text"
              size="mini"
              icon="el-icon-s-grid"
              @click.stop="openPositionMap(data)"
            >位置图</el-button>
            <el-button
              v-if="isWarehouseNode(data)"
              type="text"
              size="mini"
              icon="el-icon-view"
              @click.stop="openWarehouseDialog(data, 'view')"
            >详情</el-button>
            <el-button
              v-if="isWarehouseNode(data)"
              type="text"
              size="mini"
              icon="el-icon-edit"
              @click.stop="openWarehouseDialog(data, 'edit')"
            >编辑</el-button>
            <el-button
              type="text"
              size="mini"
              icon="el-icon-plus"
              @click.stop="() => append(data)"
              v-if="data.nodeType === 1"
            >
            </el-button>
            <el-button
              type="text"
              size="mini"
              icon="el-icon-delete"
              style="color: #f56c6c"
              @click.stop="() => remove(node, data)"
            >
            </el-button>
          </span>
        </span>
      </el-tree>
    </div>

    <LocationAddDialog ref="addDialog" @submit="handleDialogSubmit" />
    <NodeDetailDrawer ref="nodeDetail" @query="fetchTreeData" />
    <WarehousePositionMapDialog ref="positionMapDialog" @saved="fetchTreeData" />
  </div>
</template>

<script>
import LocationAddDialog from './components/LocationAddDialog.vue';
import NodeDetailDrawer from './components/NodeDetailDrawer.vue';
import WarehousePositionMapDialog from './components/WarehousePositionMapDialog.vue';
import { getHierarchyTree, getHierarchyDetail, addHierarchyNode, updateHierarchyNode, deleteHierarchyNode } from '@/api/warehouse/locationMap';

export default {
  name: 'LocationDrawing',
  components: {
    LocationAddDialog,
    NodeDetailDrawer,
    WarehousePositionMapDialog
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
  data() {
    return {
      filterText: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: (data) => data.name || data.label || data.warehouseName || data.balanceAreaName || `节点(${data.id})`
      }
    };
  },
  created() {
    this.fetchTreeData();
  },
  methods: {
    async fetchTreeData() {
      try {
        const res = await getHierarchyTree();
        if (res && res.data) {
          this.treeData = Array.isArray(res.data) ? res.data : [res.data];
        }
      } catch (e) {
        console.error('Failed to fetch tree data', e);
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      const label = this.defaultProps.label(data);
      return label.indexOf(value) !== -1;
    },
    getNodeIcon(data) {
      const icons = {
        1: 'el-icon-office-building', // 平衡区
        2: 'el-icon-house',           // 库房
        3: 'el-icon-s-grid',          // 列
        4: 'el-icon-menu',            // 排
        5: 'el-icon-collection-tag'   // 层
      };
      return icons[data.nodeType] || 'el-icon-document';
    },
    isBalanceAreaNode(data) {
      return String(data.nodeType) === '1';
    },
    isWarehouseNode(data) {
      return String(data.nodeType) === '2';
    },
    handleNodeDblClick(data) {
      if (this.isBalanceAreaNode(data)) this.openNodeDetail(data);
      if (this.isWarehouseNode(data)) this.openWarehouseDialog(data, 'view');
    },
    openNodeDetail(data) {
      this.$refs.nodeDetail.open(data);
    },
    openPositionMap(data) {
      this.$refs.positionMapDialog.open(data);
    },
    async openWarehouseDialog(data, mode) {
      const detail = await this.fetchWarehouseDetail(data);
      this.$refs.addDialog.open(this.mapWarehouseNodeToForm(detail), {
        mode,
        isParentFixed: true
      });
    },
    async fetchWarehouseDetail(data) {
      if (!data || !data.id) return data;
      try {
        const res = await getHierarchyDetail(data.id);
        if (res && res.data) {
          return {
            ...data,
            ...res.data,
            children: (res.data.children && res.data.children.length) ? res.data.children : data.children
          };
        }
      } catch (error) {
        console.error(error);
        this.$message.warning('获取库房详情失败，已使用当前节点数据');
      }
      return data;
    },
    handleExpandAll() {
      const nodes = this.$refs.tree.store._getAllNodes();
      nodes.forEach(node => { node.expanded = true; });
    },
    handleCollapseAll() {
      const nodes = this.$refs.tree.store._getAllNodes();
      nodes.forEach(node => { node.expanded = false; });
    },
    handleAdd() {
      this.$refs.addDialog.open();
    },
    handleExport() {
      this.$message.success('正在导出库位图纸...');
    },
    async handleDialogSubmit(formData) {
      // 组装对接接口的参数
      let balanceAreaName = '';
      if (this.$refs.addDialog && this.$refs.addDialog.balanceAreaOptions) {
        const found = this.$refs.addDialog.balanceAreaOptions.find(o => o.value === formData.balanceArea);
        if (found) balanceAreaName = found.label;
      }
      
      const apiData = {
        balanceId: formData.balanceArea,
        balanceAreaName: balanceAreaName,
        warehouseCode: formData.warehouseCode,
        warehouseName: formData.warehouseName,
        warehouseType: formData.warehouseType,
        materialTypes: formData.materialType,
        remark: formData.remark,
        sortOrder: 1,
        shelvesList: []
      };

      if (formData.warehouseType === '0') {
        apiData.shelvesList = formData.columns.map((col, index) => ({
          shelfCode: `S${index + 1}`,
          shelfRowNum: parseInt(col.rows) || 1,
          shelfColNum: parseInt(col.levels) || 1,
          shelfType: col.type,
          sortOrder: index + 1
        }));
      } else {
        // 老库
        apiData.shelvesList = [
          {
            shelfCode: 'S1',
            shelfRowNum: parseInt(formData.rowCount) || 1,
            shelfColNum: parseInt(formData.columnCount) || 1,
            shelfType: 'old',
            sortOrder: 1
          }
        ];
      }

      if (formData.rawNode && formData.rawNode.id) apiData.id = formData.rawNode.id;

      try {
        if (formData.mode === 'edit') {
          await updateHierarchyNode(apiData);
          this.$message.success('编辑库位图纸成功');
        } else {
          await addHierarchyNode(apiData);
          this.$message.success('添加库位图纸成功');
        }
        this.fetchTreeData();
      } catch (err) {
        console.error(err);
        this.$message.error(formData.mode === 'edit' ? '编辑失败' : '添加失败');
      }
    },
    mapWarehouseNodeToForm(data) {
      const columns = (data.children || []).map((column, index) => {
        const rows = column.children || [];
        const rowCount = rows.length || 1;
        const levelCount = rows.reduce((max, row) => Math.max(max, (row.children || []).length), 1);
        const type = this.getShelfTypeValue(column, rowCount, levelCount);
        this.ensureShelfTypeOption(type, rowCount, levelCount);
        return {
          id: column.id,
          code: column.nodeCode || column.label || `S${index + 1}`,
          type
        };
      });
      return {
        rawNode: data,
        balanceArea: data.parentId,
        warehouseCode: data.nodeCode || data.warehouseCode || '',
        warehouseName: this.cleanNodeName(data.nodeName || data.label || data.warehouseName || ''),
        warehouseType: this.normalizeWarehouseType(data.warehouseType, columns),
        materialType: data.materialTypes || (data.extra && data.extra.materialTypes) || '',
        remark: data.remark || (data.extra && data.extra.remark) || '',
        columns: columns.length ? columns : [{ type: '5-3-2-10' }],
        columnCount: columns.length || 1,
        rowCount: columns[0] ? parseInt(columns[0].type, 10) || 1 : 1
      };
    },
    getShelfTypeValue(column, rowCount, levelCount) {
      const extra = column.extra || {};
      return column.shelfType || extra.shelfType || `${rowCount}-${levelCount}-2-10`;
    },
    normalizeWarehouseType(warehouseType, columns) {
      if (String(warehouseType) === '0' || String(warehouseType) === '2') return String(warehouseType);
      if (warehouseType === 'new') return '0';
      if (warehouseType === 'old' || String(warehouseType) === '1') return '2';
      return columns.length > 1 ? '0' : '2';
    },
    ensureShelfTypeOption(type, rowCount, levelCount) {
      const dialog = this.$refs.addDialog;
      if (!dialog || !type) return;
      const exists = dialog.shelfTypeOptions.some(item => item.value === type);
      if (!exists) {
        dialog.shelfTypeOptions.push({
          label: `${rowCount}排${levelCount}层`,
          value: type
        });
      }
    },
    cleanNodeName(name) {
      return String(name || '').replace(/^【库房】/, '');
    },
    append(data) {
      const label = this.defaultProps.label(data);
      // Level 0 为平衡区，添加子节点即添加库房
      if (data.nodeType === 1) {
        this.$refs.addDialog.open(null, {
          isParentFixed: true,
          prefill: {
            balanceArea: data.id || data.balanceId
          }
        });
      } else {
        this.$message.info(`当前仅支持在[平衡区]级别快捷添加子节点(库房): ${label}`);
      }
    },
    remove(node, data) {
      const label = this.defaultProps.label(data);
      this.$confirm(`确定要删除 [${label}] 以及它的所有子节点吗？`, '危险操作提示', {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }).then(async () => {
        try {
          await deleteHierarchyNode(data.id);
          this.$message.success('删除成功');
          this.fetchTreeData();
        } catch (e) {
          console.error(e);
          this.$message.error('删除失败');
        }
      }).catch(() => {});
    }
  }
};
</script>

<style lang="scss" scoped>
.location-drawing-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;

  .header-card {
    background: #fff;
    padding: 15px 20px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
    margin-bottom: 20px;
  }

  .tree-content {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    overflow-y: auto;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);

    .custom-tree {
      ::v-deep .el-tree-node__content {
        height: 40px;
        &:hover {
          background-color: #f0f7ff;
        }
      }

      .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;

        .node-label {
          display: flex;
          align-items: center;
          .node-icon {
            margin-right: 8px;
            color: #409eff;
            font-size: 16px;
          }
        }

        .node-ops {
          opacity: 0;
          transition: opacity 0.2s;
        }

        &:hover {
          .node-ops {
            opacity: 1;
          }
        }
      }
    }
  }
}
</style>
