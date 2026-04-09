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
        <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">添加库位图纸</el-button>
        <el-button type="success" size="small" icon="el-icon-download" @click="handleExport">导出</el-button>
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
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span class="node-label">
            <i :class="getNodeIcon(data)" class="node-icon"></i>
            {{ node.label }}
          </span>
          <span class="node-ops">
            <el-button
              type="text"
              size="mini"
              icon="el-icon-plus"
              @click.stop="() => append(data)"
              v-if="data.level < 4"
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
  </div>
</template>

<script>
import LocationAddDialog from './components/LocationAddDialog.vue';

export default {
  name: 'LocationDrawing',
  components: {
    LocationAddDialog
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
  data() {
    return {
      filterText: '',
      treeData: [
        {
          id: 1,
          label: '平衡区-西南区',
          level: 0,
          children: [
            {
              id: 4,
              label: '原材料库房 (001)',
              level: 1,
              children: [
                {
                  id: 9,
                  label: '第1列',
                  level: 2,
                  children: [
                    {
                      id: 11,
                      label: '第1排',
                      level: 3,
                      children: [
                        { id: 12, label: '第1层', level: 4 }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 2,
          label: '平衡区-东北区',
          level: 0,
          children: [
            {
              id: 5,
              label: '成品库房 (002)',
              level: 1,
              children: [
                { id: 6, label: 'A区', level: 2 }
              ]
            }
          ]
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    };
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    getNodeIcon(data) {
      const icons = [
        'el-icon-office-building', // 平衡区
        'el-icon-house',           // 库房
        'el-icon-s-grid',          // 列/区
        'el-icon-menu',            // 排
        'el-icon-collection-tag'   // 层
      ];
      return icons[data.level] || 'el-icon-document';
    },
    handleExpandAll() {
      const nodes = this.$refs.tree.store._getAllNodes();
      nodes.forEach(node => node.expanded = true);
    },
    handleCollapseAll() {
      const nodes = this.$refs.tree.store._getAllNodes();
      nodes.forEach(node => node.expanded = false);
    },
    handleAdd() {
      this.$refs.addDialog.open();
    },
    handleExport() {
      this.$message.success('正在导出库位图纸...');
    },
    handleDialogSubmit(formData) {
      console.log('提交的数据：', formData);
      this.$message.success('保存成功');
      // 这里应该是调用接口并刷新数据
    },
    append(data) {
      this.$message.info(`添加子节点到: ${data.label}`);
      // 实际开发中可能需要弹出不同层级的添加弹窗
    },
    remove(node, data) {
      this.$confirm(`确定要删除 ${data.label} 吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === data.id);
        children.splice(index, 1);
        this.$message.success('删除成功');
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
