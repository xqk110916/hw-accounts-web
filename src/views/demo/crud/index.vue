<template>
  <div class="wrapper">
    <div class="content">
      <div class="left" v-if="showLeft">
        <div class="tree-search">
          <el-input v-model="tree.value" type="text" size="small" placeholder="请输入" prefix-icon="el-icon-search" clearable> </el-input>
        </div>
        <div class="tree">
          <el-tree
            ref="tree"
            :data="tree.data"
            :props="tree.props"
            @node-click="handleNodeClick"
            :filter-node-method="filterNode"
            :node-key="tree.nodeKey || 'id'"
            :expand-on-click-node="false"
            default-expand-all
            highlight-current
          >
          </el-tree>
        </div>
      </div>
      <div class="right">
        <search-bar class="search" :options="search.options" :form="search.params">
          <div slot="footer" class="footer">
            <div :class="['btn', 'text']" @click="getTableList">查询</div>
            <div class="partition"></div>
            <div :class="['btn', 'text']" @click="resetSearchParams">重置</div>
          </div>
        </search-bar>
        <div class="operation" v-if="btns.operation && btns.operation.length">
          <div v-for="item in btns.operation" :key="item.label" :class="['btn', 'primary']" @click="handleBtnClick(item)">{{ item.label }}</div>
        </div>
        <div class="table">
          <el-table
            ref="table"
            :data="tableData"
            highlight-current-row
            :height="height"
            style="width: 100%"
          >
            <el-table-column type="index" label="序号" width="80" show-overflow-tooltip> </el-table-column>
            <el-table-column v-for="item in tableKeys" :prop="item.prop" :label="item.label" :key="item.prop" show-overflow-tooltip :width="item.width">
              <template slot-scope="scope">
                <div v-if="item.type === 'slot'"></div>
                <div> {{ scope.row[item.prop] }} </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template slot-scope="scope">
                <div class="table_operation">
                  <div v-for="item in btns.table" :key="item.label" :class="['btn', 'text']" @click="e => handleBtnClick(item, scope.row)">{{ item.label }}</div>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="search.params.currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="search.params.pageSize"
              background
              layout="total, sizes, prev, pager, next"
              :total="search.params.totoal"
            >
            </el-pagination>
          </div>
        </div>
      </div>
    </div>
    <detail ref="detail" @query="resetSearchParams"></detail>
  </div>
</template>

<script>
import searchBar from './components/search';
import detail from './components/detail.vue';
import { config, requestFun, btns, handleTbaleMap, getDefaultOptions } from './components/index.js'
export default {
  components: { searchBar, detail },
  data() {
    return {
      showLeft: false,
      tree: {
        value: '',
        data: [],
        nodeKey: 'id',
        props: { label: 'areaName', value: 'areaCode' },
      },
      search: {
        params: {
          currentPage: 1,
          pageSize: 20,
          totoal: 0,
        },
        options: [],
      },
      tableData: [],

      height: 0,
      tableKeys: [],
      searchKeys: [],
      detailKey: [],
      btns,
    };
  },
  async created() {
    await getDefaultOptions()
    this.handleData()
    this.getTableList();
  },
  mounted() {
    setTimeout(() => {
      this.computedTableHeight();
    }, 0);
  },
  watch: {
    'tree.value': {
      handler(val) {
        this.$refs.tree.filter(val);
      },
      deep: true,
    },
  },
  methods: {
    computedTableHeight() {
      let rightDom = document.querySelector('.right');
      let rightDomHeight = rightDom ? rightDom.clientHeight : 0;
      let searchDom = document.querySelector('.search');
      let searchDomHeight = searchDom ? searchDom.clientHeight : 0;
      let operationDom = document.querySelector('.operation');
      let operationDomHeight = operationDom ? operationDom.clientHeight : 0;

      this.height = rightDomHeight - searchDomHeight - operationDomHeight - 90;
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    async handleData() {
      let colNumber = 0
      this.tableKeys = config.table
      config.search.forEach(item => {
        colNumber = colNumber + (item.col || 5)
        if(colNumber > 20) this.addSearchBtn()
        this.search.options.push(item)
        this.$set(this.search.params, item.prop, '')
        if(item.option) this.getOptions(item)
      });
      if(colNumber <= 20) this.addSearchBtn()

      if(config.tree && config.tree.data) {
        this.showLeft = true;
        let { data } = await config.tree.data;
        this.tree.data = data;
        if(config.tree.searchKey) this.$set(this.search.params, config.tree.searchKey, '')
        if(config.tree.props) this.tree.props = config.tree.props
        if(config.tree.nodeKey) this.tree.nodeKey = config.tree.nodeKey
        console.log(this.tree);
      }
    },
    addSearchBtn() {
      this.search.options.push({ type: 'slot', slotName: 'footer', col: 4 })
    },
    handleBtnClick(item, playload) {
      console.log(item, playload);
      if(item.fn) {
        item.fn(playload);
      } else if(item.execute) {
        switch (item.execute) {
          case 'add':
            this.open();
            break;
          case 'view':
            this.view(playload);
            break;
          case 'update':
            this.edit(playload);
            break;
          case 'delete':
            this.remove(playload);
            break;
        }
      }
    },
    getOptions(item) {
      if(!Array.isArray(item.option)) {
        item.option.then(res => {
          item.option = Array.isArray(res.data) ? res.data : res.data.list;
        })
      }
    },

    getTableList() {
      this.tableData = []
      return requestFun.list(this.search.params).then(res => {
        if (res.code === 1) {
          let data = res.data.list || [];
          let page = res.data.pagination || {};
          if(handleTbaleMap) data = handleTbaleMap(data)
          this.tableData = data
          this.search.params.totoal = page.total;
          return data
        }
      });
    },

    open() {
      this.$refs.detail.open();
    },
    view() {},
    edit(row) {
      this.$refs.detail.open(row);
    },
    remove(row) {
      this.$confirm('确定要删除该设备?')
        .then(() => {
          requestFun.delete({ ids: row.id }).then(res => {
            if (res.code === 1) {
              this.$message({ message: '删除成功', type: 'success' });
              this.getTableList();
            }
          });
        })
        .catch(() => {});
    },
    handleNodeClick(data, node) {
      config.tree.nodeClick && config.tree.nodeClick(data, node);
      this.getTableList();
    },
    handleSizeChange(value) {
      this.search.params.pageSize = value;
      this.getTableList();
    },
    handleCurrentChange(value) {
      this.search.params.currentPage = value;
      this.getTableList();
    },
    resetSearchParams() {
      this.search.params = this.$options.data().search.params;
      this.getTableList();
    },
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 16px;
  .content {
    width: 100%;
    height: 100%;
    display: flex;
    background: #fff;
    .left {
      width: 272px;
      box-sizing: border-box;
      padding: 16px;
      border-right: 1px solid #edf1f5;
      display: flex;
      flex-direction: column;
      .tree-search {
        height: 40px;
      }
      .tree {
        flex: 1;
        overflow-y: scroll;

        ::v-deep .el-tree-node__content {
          height: 40px;
        }
        ::v-deep .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
          background-color: #cce6ff; /* 你可以替换成你想要的颜色 */
        }
        ::v-deep .el-tree-node__content:hover {
          background-color: #cce6ff; /* 你可以替换成你想要的颜色 */
        }
      }
    }
    .right {
      // width: 100%;
      flex: 1;
      height: 100%;
      box-sizing: border-box;
      padding: 16px;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .search {
        .footer {
          height: 34px;
          display: flex;
          align-items: center;
          margin-left: 5px;
          .partition {
            width: 1px;
            height: 14px;
            background: #e1e5eb;
            margin: 0 12px;
          }
        }
      }

      .operation {
        height: 32px;
        margin-top: 4px;
        margin-bottom: 6px;
      }
      .table {
        margin-top: 10px;
        flex: 1;
        .table_operation {

        }
        .round_text {
          margin-left: 3px;
          &.normal {
            &::before {
              content: '';
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #34c724;
              position: absolute;
              left: 0;
              top: calc(50% - 3px);
            }
          }
          &.off {
            &::before {
              content: '';
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #ccc;
              position: absolute;
              left: 0;
              top: calc(50% - 3px);
            }
          }
        }
        .tag {
          display: inline-block;
          width: 58px;
          height: 24px;
          border-radius: 4px;
          font-size: 14px;
          text-align: center;
          line-height: 24px;

          &.unfinished {
            background: #fff0cc;
            color: #e68600;
          }
          &.normal {
            background: #edf1f5;
            color: #424c59;
          }
        }
        .pagination {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
          color: #626c78;
          ::v-deep .el-pager .number {
            background: #fff;
            border: 1px solid #c4c9cf;
            border-radius: 4px;
            font-size: 14px;
          }
          ::v-deep .el-pager .active {
            background: #cce6ff;
            color: #246fe5;
            border: 1px solid #246fe5;
          }
        }
        ::v-deep .el-table th.el-table__cell {
          background: #f1f4f6;
          color: #626c78;
        }
        ::v-deep .el-table td.el-table__cell {
          color: #1b2129;
        }
      }
    }
  }

  .btn {
    display: inline-block;
    font-size: 14px;
    line-height: 22px;
    cursor: pointer;

    &.text {
      color: #246fe5;
    }
    &.primary {
      padding: 5px 16px;
      border-radius: 3px;
      background: #246fe5;
      color: #fff;
    }
  }
  .btn + .btn {
    margin-left: 10px;
  }
}
</style>
