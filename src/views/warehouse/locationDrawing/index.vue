<template>
  <div class="location-drawing-container">
    <div class="main-content-layout">
      <!-- Left Panel: Tree and Controls (35%) -->
      <div class="left-panel">
        <div class="panel-header">
          <div class="search-box">
            <el-input
              v-model="filterText"
              placeholder="输入关键字进行过滤"
              size="small"
              prefix-icon="el-icon-search"
              clearable
              style="width: 100%"
            ></el-input>
          </div>
          <div class="action-row">
            <el-button-group>
              <el-button size="small" icon="el-icon-zoom-in" @click="handleExpandAll">全部展开</el-button>
              <el-button size="small" icon="el-icon-zoom-out" @click="handleCollapseAll">全部折叠</el-button>
            </el-button-group>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">添加库位</el-button>
          </div>
        </div>

        <div class="tree-wrapper">
          <el-tree
            ref="tree"
            :data="treeData"
            :props="defaultProps"
            :filter-node-method="filterNode"
            node-key="id"
            :expand-on-click-node="false"
            class="custom-tree"
            highlight-current
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
      </div>

      <!-- Right Panel: Fixed Details / Add Form (65%) -->
      <div class="right-panel">
        <transition name="fade-transform" mode="out-in">
          <div v-if="!rightPanelVisible" class="empty-placeholder" key="placeholder">
            <div class="placeholder-content">
              <div class="icon-wrapper">
                <i class="el-icon-office-building placeholder-icon"></i>
              </div>
              <h3>库房管理中心</h3>
              <p>请在左侧树结构中，选择库房节点查看或编辑详情信息</p>
              <span class="sub-tip">点击左上方的 “添加库位” 或平衡区右侧的 “+” 即可新建库房</span>
            </div>
          </div>
          <LocationAddDialog
            v-else
            ref="addDialog"
            key="form"
            @submit="handleDialogSubmit"
            @cancel="handleDialogCancel"
          />
        </transition>
      </div>
    </div>

    <NodeDetailDrawer ref="nodeDetail" @query="fetchTreeData" />
    <WarehousePositionMapDialog ref="positionMapDialog" @saved="fetchTreeData" />
  </div>
</template>

<script>
import LocationAddDialog from './components/LocationAddDialog.vue';
import NodeDetailDrawer from './components/NodeDetailDrawer.vue';
import WarehousePositionMapDialog from './components/WarehousePositionMapDialog.vue';
import { getHierarchyTree, getHierarchyDetail, addHierarchyNode, updateHierarchyNode, deleteHierarchyNode } from '@/api/warehouse/locationMap';
import { checkCanDeleteBalanceArea } from '@/api/warehouse/balanceArea';

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
        label: (data) => data.nodeName || `节点(${data.id})`
      },
      rightPanelVisible: false
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
          this.$nextTick(() => this.handleExpandFirstLevel());
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
    // out-in 过渡下 addDialog 需等 placeholder leave(约 0.3s) 完成才挂载，轮询等待 ref 就绪
    waitForRef(refName, timeout = 2000) {
      return new Promise(resolve => {
        const start = Date.now();
        const check = () => {
          if (this.$refs[refName] || Date.now() - start > timeout) return resolve();
          requestAnimationFrame(check);
        };
        check();
      });
    },
    async openWarehouseDialog(data, mode) {
      this.rightPanelVisible = true;
      await this.waitForRef('addDialog');
      if (this.$refs.tree) {
        this.$refs.tree.setCurrentKey(data.id);
      }
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
    // 默认仅展开第一层（根节点），保持下层折叠
    handleExpandFirstLevel() {
      const store = this.$refs.tree.store;
      const allNodes = store._getAllNodes();
      allNodes.forEach(node => { node.expanded = false; });
      store.root.childNodes.forEach(node => { node.expanded = true; });
    },
    handleExpandAll() {
      const nodes = this.$refs.tree.store._getAllNodes();
      nodes.forEach(node => { node.expanded = true; });
    },
    handleCollapseAll() {
      const nodes = this.$refs.tree.store._getAllNodes();
      for (let i = nodes.length - 1; i >= 0; i--) {
        nodes[i].expanded = false;
      }
    },
    async handleAdd() {
      this.rightPanelVisible = true;
      await this.waitForRef('addDialog');
      if (this.$refs.tree) {
        this.$refs.tree.setCurrentKey(null);
      }
      this.$refs.addDialog.open();
    },
    handleDialogCancel() {
      this.rightPanelVisible = false;
      if (this.$refs.tree) {
        this.$refs.tree.setCurrentKey(null);
      }
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
        materialTypes: Array.isArray(formData.materialType) ? formData.materialType.join(',') : formData.materialType,
        remark: formData.remark,
        sortOrder: 1
      };

      if (formData.mode !== 'edit') {
        // 新库/老库统一使用列配置格式
        apiData.shelvesList = formData.columns.map((col, index) => {
          const parts = String(col.type || '').split('-');
          const shelfRowNum = parseInt(parts[0]) || parseInt(col.rows) || 1;
          const shelfColNum = parseInt(parts[1]) || parseInt(col.levels) || 1;
          return {
            shelfCode: col.code || `S${index + 1}`,
            shelfRowNum: shelfRowNum,
            shelfColNum: shelfColNum,
            shelfType: col.type,
            areaCode: col.areaCode || '',
            sortOrder: index + 1
          };
        });
      }

      if (formData.rawNode && formData.rawNode.id) apiData.id = formData.rawNode.id;

      try {
        let res;
        if (formData.mode === 'edit') {
          res = await updateHierarchyNode(apiData);
          this.$message.success('编辑库房成功');
        } else {
          res = await addHierarchyNode(apiData);
          this.$message.success('添加库房成功');
        }
        await this.fetchTreeData();

        // 提交成功后将右侧设为只读形式
        if (formData.mode === 'edit' && formData.rawNode && formData.rawNode.id) {
          const nodeData = { id: formData.rawNode.id, nodeType: 2 };
          await this.openWarehouseDialog(nodeData, 'view');
        } else if (res && res.data && res.data.id) {
          const nodeData = { id: res.data.id, nodeType: 2 };
          await this.openWarehouseDialog(nodeData, 'view');
        } else {
          if (this.$refs.addDialog) {
            this.$refs.addDialog.setViewMode();
          }
        }
      } catch (err) {
        console.error(err);
        this.$message.error(formData.mode === 'edit' ? '编辑失败' : '添加失败');
      }
    },
    mapWarehouseNodeToForm(data) {
      const shelvesList = Array.isArray(data.shelvesList) ? data.shelvesList : []
      const columns = shelvesList.length ? shelvesList.map((shelf, index) => {
        const type = shelf.shelfType
        const rowCount = Number(shelf.shelfRowNum) || 1
        const levelCount = Number(shelf.shelfColNum) || 1
        this.ensureShelfTypeOption(type, rowCount, levelCount)
        return {
          id: shelf.id,
          code: shelf.shelfCode,
          type,
          rows: rowCount,
          levels: levelCount,
          areaCode: shelf.areaCode || ''
        }
      }) : (data.children || []).map((column, index) => {
        const rows = column.children || [];
        const rowCount = rows.length || 1;
        const levelCount = rows.reduce((max, row) => Math.max(max, (row.children || []).length), 1);
        const type = this.getShelfTypeValue(column, rowCount, levelCount);
        this.ensureShelfTypeOption(type, rowCount, levelCount);
        
        let extra = {};
        if (column.extra) {
          try {
            extra = typeof column.extra === 'string' ? JSON.parse(column.extra) : column.extra;
          } catch (e) {
            console.error('Failed to parse column extra', e);
          }
        }

        return {
          id: column.id,
          code: column.nodeCode,
          type,
          areaCode: column.areaCode || extra.areaCode || ''
        };
      });
      return {
        rawNode: data,
        balanceArea: data.parentId,
        warehouseCode: data.nodeCode,
        warehouseName: this.cleanNodeName(data.nodeName),
        warehouseType: this.normalizeWarehouseType(data.warehouseType, columns),
        materialType: data.materialTypes || [],
        remark: data.remark,
        columns: columns.length ? columns : [{ type: '5-3-2-10' }]
      };
    },
    getShelfTypeValue(column, rowCount, levelCount) {
      return column.shelfType;
    },
    normalizeWarehouseType(warehouseType, columns) {
      if (String(warehouseType) === '0' || String(warehouseType) === '2') return String(warehouseType);
      if (warehouseType === 'new') return '0';
      if (warehouseType === 'old' || String(warehouseType) === '1') return '2';
      return columns.length > 1 ? '0' : '2';
    },
    ensureShelfTypeOption(type, rowCount, levelCount) {
      this.$nextTick(() => {
        const dialog = this.$refs.addDialog;
        if (!dialog || !type) return;
        const exists = dialog.shelfTypeOptions.some(item => item.value === type);
        if (!exists) {
          dialog.shelfTypeOptions.push({
            label: `${rowCount}排${levelCount}层`,
            value: type
          });
        }
      });
    },
    cleanNodeName(name) {
      return String(name || '').replace(/^【库房】/, '');
    },
    async append(data) {
      const label = this.defaultProps.label(data);
      // Level 0 为平衡区，添加子节点即添加库房
      if (data.nodeType === 1) {
        this.rightPanelVisible = true;
        await this.waitForRef('addDialog');
        if (this.$refs.tree) {
          this.$refs.tree.setCurrentKey(null);
        }
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
    async remove(node, data) {
      const label = this.defaultProps.label(data);
      let hasData = false;
      let checkFailed = false;
      if (data.nodeType === 1) {
        try {
          const res = await checkCanDeleteBalanceArea(data.id);
          hasData = res && res.data === false;
        } catch (error) {
          console.error(error);
          checkFailed = true;
        }
      }

      let message = `确定要删除 [${label}] 以及它的所有子节点吗？`;
      if (hasData) {
        message = `当前平衡区 [${label}] 下有数据，删除将同步删除其所有子节点，是否确定删除？`;
      } else if (checkFailed) {
        message = `校验接口调用失败，无法判断是否有数据，是否仍要删除 [${label}] 以及它的所有子节点？`;
      }

      this.$confirm(message, '危险操作提示', {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        distinguishCancelAndClose: true
      }).then(async () => {
        try {
          await deleteHierarchyNode(data.id);
          this.$message.success('删除成功');
          this.fetchTreeData();
          if (this.rightPanelVisible) {
            this.handleDialogCancel();
          }
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
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
  background-color: #f4f6f9;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .main-content-layout {
    display: flex;
    gap: 16px;
    flex: 1;
    height: 0; // force flexbox height calculation
    min-height: 0;
    overflow: hidden;

    .left-panel {
      width: 40%;
      height: 100%;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      padding: 16px;
      box-sizing: border-box;
      overflow: hidden;
      border: 1px solid #eef2f5;

      .panel-header {
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;

        .search-box {
          width: 100%;
        }

        .action-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      }

      .tree-wrapper {
        flex: 1;
        overflow-y: auto;
        padding-right: 4px;

        &::-webkit-scrollbar {
          width: 5px;
        }
        &::-webkit-scrollbar-thumb {
          background: #e4e7ed;
          border-radius: 3px;
        }
        &::-webkit-scrollbar-thumb:hover {
          background: #c0c4cc;
        }

        .custom-tree {
          ::v-deep .el-tree-node__content {
            height: 38px;
            border-radius: 4px;
            margin-bottom: 2px;
            &:hover {
              background-color: #f0f7ff;
            }
          }

          ::v-deep .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
            background-color: #e8f3ff;
            color: #1890ff;
            font-weight: 500;
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

    .right-panel {
      width: 60%;
      height: 100%;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      overflow: hidden;
      border: 1px solid #eef2f5;

      .empty-placeholder {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
        box-sizing: border-box;
        background: linear-gradient(135deg, #ffffff 0%, #f9fbfd 100%);

        .placeholder-content {
          text-align: center;
          max-width: 420px;

          .icon-wrapper {
            width: 80px;
            height: 80px;
            background: #eef5fe;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);

            .placeholder-icon {
              font-size: 38px;
              color: #409eff;
            }
          }

          h3 {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
            margin: 0 0 12px;
          }

          p {
            font-size: 14px;
            color: #606266;
            margin: 0 0 8px;
            line-height: 1.5;
          }

          .sub-tip {
            display: inline-block;
            font-size: 12px;
            color: #909399;
            line-height: 1.6;
            margin-top: 10px;
            padding: 8px 16px;
            background: #f4f6fa;
            border-radius: 4px;
            border: 1px dashed #e4e7ed;
          }
        }
      }
    }
  }
}

// Fade transform transition for smooth switching between placeholder and form
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-transform-enter {
  opacity: 0;
  transform: translateX(20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
