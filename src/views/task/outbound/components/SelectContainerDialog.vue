<template>
  <el-dialog
    title="选择容器"
    :visible.sync="visible"
    width="92vw"
    top="4vh"
    custom-class="select-container-dialog"
    :close-on-click-modal="false"
    append-to-body
    @closed="handleClosed"
  >
    <div class="select-container" v-loading="loading">
      <div class="left-panel">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="位置图" name="map">
            <div class="map-filter">
              <el-select
                v-model="mapSearch.balanceAreaId"
                size="small"
                clearable
                filterable
                placeholder="请选择平衡区"
                @change="handleBalanceAreaChange"
              >
                <el-option
                  v-for="item in balanceAreaOptions"
                  :key="item.id"
                  :label="item.nodeName || item.balanceAreaName || item.areaName"
                  :value="item.id"
                />
              </el-select>
              <el-select
                v-model="mapSearch.warehouseId"
                size="small"
                clearable
                filterable
                placeholder="请选择库房"
                :disabled="!mapSearch.balanceAreaId"
                @change="handleWarehouseChange"
              >
                <el-option
                  v-for="item in warehouseOptions"
                  :key="item.id"
                  :label="item.warehouseName || item.nodeName"
                  :value="item.id"
                />
              </el-select>
              <el-tag v-if="selectedMapLabel" type="info">{{ selectedMapLabel }}</el-tag>
            </div>
            <div class="map-body">
              <WarehouseGridMap2D
                v-if="mapLayout && mapShelves.length"
                :warehouse-name="selectedWarehouseName"
                :shelves="mapShelves"
                :layout="mapLayout"
                :editable="false"
                @container-click="openContainerDetail"
              />
              <el-empty v-else description="请选择平衡区和库房后查看位置图" :image-size="88" style="margin-top: 150px" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="容器列表" name="container">
            <search-filter class="dialog-search" :options="containerSearchOptions" :form="containerSearch">
              <div slot="footer" class="search-footer">
                <el-button type="text" size="small" @click="queryContainerList">查询</el-button>
                <span class="partition"></span>
                <el-button type="text" size="small" @click="resetContainerSearch">重置</el-button>
              </div>
            </search-filter>
            <div class="table-actions">
              <el-button type="primary" size="small" @click="addCheckedRows(containerCheckedRows)">加入选择</el-button>
            </div>
            <el-table
              :data="containerList"
              border
              size="small"
              height="430"
              @selection-change="containerCheckedRows = $event"
            >
              <el-table-column type="selection" width="48" />
              <el-table-column v-for="item in goodsColumns" :key="item.prop" :prop="item.prop" :label="item.label" :width="item.width" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span v-if="item.prop === 'positionText'">{{ getPositionText(scope.row) }}</span>
                  <span v-else-if="item.prop === 'weightText'">{{ getWeightText(scope.row) }}</span>
                  <span v-else>{{ scope.row[item.prop] }}</span>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination">
              <el-pagination
                :current-page="containerSearch.currentPage"
                :page-size="containerSearch.pageSize"
                :total="containerTotal"
                background
                layout="total, prev, pager, next"
                @current-change="handleContainerPageChange"
              />
            </div>
          </el-tab-pane>

          <el-tab-pane label="入库单" name="inbound">
            <search-filter class="dialog-search" :options="inboundSearchOptions" :form="inboundSearch">
              <div slot="footer" class="search-footer">
                <el-button type="text" size="small" @click="queryInboundList">查询</el-button>
                <span class="partition"></span>
                <el-button type="text" size="small" @click="resetInboundSearch">重置</el-button>
              </div>
            </search-filter>
            <div class="table-actions">
              <el-button type="primary" size="small" @click="addCheckedRows(inboundCheckedRows)">加入选择</el-button>
            </div>
            <el-table
              :data="inboundList"
              border
              size="small"
              height="430"
              @selection-change="inboundCheckedRows = $event"
            >
              <el-table-column type="selection" width="48" />
              <el-table-column prop="taskNum" label="任务编号" width="140" show-overflow-tooltip />
              <el-table-column v-for="item in goodsColumns" :key="item.prop" :prop="item.prop" :label="item.label" :width="item.width" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span v-if="item.prop === 'positionText'">{{ getPositionText(scope.row) }}</span>
                  <span v-else-if="item.prop === 'weightText'">{{ getWeightText(scope.row) }}</span>
                  <span v-else>{{ scope.row[item.prop] }}</span>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination">
              <el-pagination
                :current-page="inboundSearch.currentPage"
                :page-size="inboundSearch.pageSize"
                :total="inboundTotal"
                background
                layout="total, prev, pager, next"
                @current-change="handleInboundPageChange"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="right-panel">
        <div class="right-title">已选容器</div>
        <el-table :data="selectedContainers" border size="small" height="calc(100% - 30px)">
          <el-table-column prop="containerCode" label="容器号" show-overflow-tooltip />
          <el-table-column prop="taskNum" label="任务编号" show-overflow-tooltip />
          <el-table-column prop="netWeight" label="净重" width="90" show-overflow-tooltip />
          <el-table-column label="操作" width="70">
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click="removeSelected(scope.$index)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <span slot="footer">
      <el-button size="small" @click="visible = false">取消</el-button>
      <el-button type="primary" size="small" @click="confirmSelected">确定</el-button>
    </span>

    <el-dialog
      title="容器详情"
      :visible.sync="detailVisible"
      width="620px"
      append-to-body
      :close-on-click-modal="false"
    >
      <table v-if="detailContainer" class="detail-table">
        <tr>
          <td class="label">容器号</td>
          <td>{{ detailContainer.containerCode || '-' }}</td>
          <td class="label">任务编号</td>
          <td>{{ detailContainer.taskNum || '-' }}</td>
        </tr>
        <tr>
          <td class="label">材料编码</td>
          <td>{{ detailContainer.goodCode || '-' }}</td>
          <td class="label">生产单位</td>
          <td>{{ detailContainer.productionUnit || '-' }}</td>
        </tr>
        <tr>
          <td class="label">库房</td>
          <td>{{ detailContainer.warehouseName || '-' }}</td>
          <td class="label">位置</td>
          <td>{{ getPositionText(detailContainer) }}</td>
        </tr>
        <tr>
          <td class="label">毛重</td>
          <td>{{ detailContainer.grossWeight || '-' }}</td>
          <td class="label">皮重</td>
          <td>{{ detailContainer.tareWeight || '-' }}</td>
        </tr>
        <tr>
          <td class="label">净重</td>
          <td>{{ detailContainer.netWeight || '-' }}</td>
          <td class="label">货箱号</td>
          <td>{{ detailContainer.boxNum || '-' }}</td>
        </tr>
      </table>
      <span slot="footer">
        <el-button size="small" @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" size="small" @click="addDetailContainer">加入选择</el-button>
      </span>
    </el-dialog>
  </el-dialog>
</template>

<script>
import WarehouseGridMap2D from '@/views/warehouse/warehouse/components/WarehouseGridMap2D.vue'
import { generateInitialLayout } from '@/views/warehouse/warehouse/utils/locationLayoutAdapter.js'
import { getInboundGoodsPageList, getLocationHierarchy, getLocationChildren, getPositionMap } from './api.js'

function clone(value) {
  return JSON.parse(JSON.stringify(value || []))
}

export default {
  name: 'SelectContainerDialog',
  components: { WarehouseGridMap2D },
  data() {
    return {
      visible: false,
      loading: false,
      activeTab: 'map',
      selectedContainers: [],
      balanceAreaOptions: [],
      warehouseOptions: [],
      mapSearch: {
        balanceAreaId: '',
        warehouseId: '',
      },
      mapPositions: [],
      mapShelves: [],
      mapLayout: null,
      detailVisible: false,
      detailContainer: null,
      containerSearch: {
        currentPage: 1,
        pageSize: 20,
        containerCode: '',
        goodCode: '',
        timeRange: [],
      },
      inboundSearch: {
        currentPage: 1,
        pageSize: 20,
        taskNum: '',
      },
      containerList: [],
      inboundList: [],
      containerTotal: 0,
      inboundTotal: 0,
      containerCheckedRows: [],
      inboundCheckedRows: [],
      containerSearchOptions: [
        { label: '容器号', prop: 'containerCode', type: 'text', col: 5 },
        { label: '货物编码', prop: 'goodCode', type: 'text', col: 5 },
        { label: '入库时间', prop: 'timeRange', type: 'daterange', col: 8 },
        { type: 'slot', slotName: 'footer', col: 4 },
      ],
      inboundSearchOptions: [
        { label: '任务编号', prop: 'taskNum', type: 'text', col: 6 },
        { type: 'slot', slotName: 'footer', col: 4 },
      ],
      goodsColumns: [
        { label: '材料编码', prop: 'goodCode', width: 120 },
        { label: '容器号', prop: 'containerCode', width: 130 },
        { label: '生产单位', prop: 'productionUnit', width: 130 },
        { label: '库房', prop: 'warehouseName', width: 120 },
        { label: '位置(排-行-列)', prop: 'positionText', width: 130 },
        { label: '货箱号', prop: 'boxNum', width: 100 },
        { label: '封记编码1', prop: 'sealCode1', width: 120 },
        { label: '封记编码2', prop: 'sealCode2', width: 120 },
        { label: '重量(毛,皮,净)', prop: 'weightText', width: 160 },
      ],
    }
  },
  computed: {
    selectedWarehouseName() {
      const warehouse = this.warehouseOptions.find(item => String(item.id) === String(this.mapSearch.warehouseId))
      return (warehouse && (warehouse.warehouseName || warehouse.nodeName)) || '库房'
    },
    selectedMapLabel() {
      const area = this.balanceAreaOptions.find(item => String(item.id) === String(this.mapSearch.balanceAreaId))
      const areaName = area && (area.nodeName || area.balanceAreaName || area.areaName)
      if (!areaName && !this.mapSearch.warehouseId) return ''
      return `${areaName || '-'} / ${this.selectedWarehouseName || '-'}`
    },
  },
  methods: {
    open(list = []) {
      this.visible = true
      this.selectedContainers = clone(list).map(this.normalizeGoods)
      if (!this.balanceAreaOptions.length) this.loadBalanceAreas()
    },
    handleClosed() {
      this.activeTab = 'map'
      this.detailVisible = false
      this.detailContainer = null
    },
    async loadBalanceAreas() {
      const res = await getLocationHierarchy(1)
      this.balanceAreaOptions = res.data || []
    },
    async handleBalanceAreaChange(value) {
      this.mapSearch.warehouseId = ''
      this.mapPositions = []
      this.mapShelves = []
      this.mapLayout = null
      this.warehouseOptions = []
      if (!value) return
      const res = await getLocationChildren(value)
      const list = res.data || []
      this.warehouseOptions = list.filter(item => String(item.nodeType) === '2' || item.warehouseName)
    },
    async handleWarehouseChange(value) {
      this.mapPositions = []
      this.mapShelves = []
      this.mapLayout = null
      if (!value) return
      this.loading = true
      try {
        const res = await getPositionMap({ nodeId: value, nodeType: '2' })
        this.mapPositions = (res.data || []).map(this.normalizeGoods)
        this.mapShelves = this.buildShelvesFromPositions(this.mapPositions)
        this.mapLayout = generateInitialLayout(this.mapShelves)
      } finally {
        this.loading = false
      }
    },
    handleTabClick() {
      if (this.activeTab === 'container') this.queryContainerList()
      if (this.activeTab === 'inbound') this.queryInboundList()
    },
    buildShelvesFromPositions(list) {
      const shelfMap = {}
      list.forEach(item => {
        const shelfKey = `${item.shelfCode || '排'}-${item.rowCode || '行'}`
        if (!shelfMap[shelfKey]) {
          shelfMap[shelfKey] = {
            id: shelfKey,
            name: shelfKey,
            columnId: item.shelfId || item.shelfCode || shelfKey,
            rowId: item.rowId || item.rowCode || shelfKey,
            columnCode: item.shelfCode || '-',
            rowCode: item.rowCode || '-',
            width: 10,
            height: 2,
            position: { x: 0, y: 0 },
            layers: [],
          }
        }
        shelfMap[shelfKey].layers.push({
          id: item.id || `${shelfKey}-${item.columnCode || shelfMap[shelfKey].layers.length}`,
          containers: [{
            ...item,
            code: item.containerCode,
            materialCode: item.goodCode,
            materialName: item.goodsName || item.goodName || item.materialName,
            status: String(item.status == null ? 0 : item.status),
          }],
        })
      })
      return Object.values(shelfMap)
    },
    openContainerDetail(container) {
      const normalized = this.normalizeGoods(container)
      if (!this.canSelectContainer(normalized)) {
        this.$message.warning('仅可选择已占用且有容器信息的位置')
        return
      }
      this.detailContainer = normalized
      this.detailVisible = true
    },
    addDetailContainer() {
      if (this.detailContainer) this.addCheckedRows([this.detailContainer])
      this.detailVisible = false
    },
    canSelectContainer(row) {
      return !!(row && row.containerCode && String(row.status) !== '0')
    },
    normalizeGoods(row = {}) {
      const inboundGoods = row.inboundGoodsEntity || {}
      return {
        ...row,
        id: row.id || row.goodsId || inboundGoods.id,
        taskNum: row.taskNum || inboundGoods.taskNum || '',
        containerCode: row.containerCode || row.containerNo || row.code || inboundGoods.containerCode || '',
        goodCode: row.goodCode || row.goodsCode || row.materialCode || inboundGoods.goodCode || '',
        goodsName: row.goodsName || row.goodName || row.materialName || inboundGoods.goodsName || '',
        warehouseId: row.warehouseId || inboundGoods.warehouseId || '',
        warehouseName: row.warehouseName || row.warehouse || inboundGoods.warehouseName || '',
        boxNum: row.boxNum || row.cargoBoxNo || inboundGoods.boxNum || '',
        grossWeight: row.grossWeight || row.weightGross || inboundGoods.grossWeight || '',
        tareWeight: row.tareWeight || row.weightTare || inboundGoods.tareWeight || '',
        netWeight: row.netWeight || row.weightNet || inboundGoods.netWeight || '',
        productionUnit: row.productionUnit || inboundGoods.productionUnit || '',
        shelfCode: row.shelfCode || inboundGoods.shelfCode || '',
        rowCode: row.rowCode || inboundGoods.rowCode || '',
        columnCode: row.columnCode || inboundGoods.columnCode || '',
        shelfId: row.shelfId || inboundGoods.shelfId || '',
        rowId: row.rowId || inboundGoods.rowId || '',
        columnId: row.columnId || row.hierarchyId || inboundGoods.columnId || '',
        sealCode1: row.sealCode1 || inboundGoods.sealCode1 || '',
        sealCode2: row.sealCode2 || inboundGoods.sealCode2 || '',
        sealType1: row.sealType1 || inboundGoods.sealType1 || '',
        sealType2: row.sealType2 || inboundGoods.sealType2 || '',
        status: row.status == null ? 1 : row.status,
      }
    },
    addCheckedRows(rows) {
      const selectedMap = new Map(this.selectedContainers.map(item => [item.containerCode, item]))
      ;(rows || []).map(this.normalizeGoods).forEach(item => {
        if (!item.containerCode) return
        selectedMap.set(item.containerCode, item)
      })
      this.selectedContainers = Array.from(selectedMap.values())
    },
    removeSelected(index) {
      this.selectedContainers.splice(index, 1)
    },
    buildGoodsParams(form) {
      const params = { ...form }
      if (params.timeRange && params.timeRange.length === 2) {
        params.startTime = params.timeRange[0]
        params.endTime = params.timeRange[1]
      }
      delete params.timeRange
      return params
    },
    async queryContainerList() {
      const res = await getInboundGoodsPageList(this.buildGoodsParams(this.containerSearch))
      const data = res.data || {}
      this.containerList = (data.list || []).map(this.normalizeGoods)
      this.containerTotal = (data.pagination && data.pagination.total) || 0
    },
    async queryInboundList() {
      const res = await getInboundGoodsPageList(this.buildGoodsParams(this.inboundSearch))
      const data = res.data || {}
      this.inboundList = (data.list || []).map(this.normalizeGoods)
      this.inboundTotal = (data.pagination && data.pagination.total) || 0
    },
    resetContainerSearch() {
      this.containerSearch = { currentPage: 1, pageSize: 20, containerCode: '', goodCode: '', timeRange: [] }
      this.queryContainerList()
    },
    resetInboundSearch() {
      this.inboundSearch = { currentPage: 1, pageSize: 20, taskNum: '' }
      this.queryInboundList()
    },
    handleContainerPageChange(page) {
      this.containerSearch.currentPage = page
      this.queryContainerList()
    },
    handleInboundPageChange(page) {
      this.inboundSearch.currentPage = page
      this.queryInboundList()
    },
    getPositionText(row) {
      const values = [row.shelfCode, row.rowCode, row.columnCode].filter(Boolean)
      return values.length ? values.join('-') : '-'
    },
    getWeightText(row) {
      return `${row.grossWeight || 0}、${row.tareWeight || 0}、${row.netWeight || 0}`
    },
    confirmSelected() {
      this.$emit('confirm', clone(this.selectedContainers))
      this.visible = false
    },
  },
}
</script>

<style lang="scss" scoped>
.select-container {
  height: calc(86vh - 140px);
  min-height: 500px;
  max-height: 680px;
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: 12px;
  min-width: 0;

  .left-panel,
  .right-panel {
    min-width: 0;
    min-height: 0;
    border: 1px solid #e3e8f0;
    border-radius: 6px;
    padding: 12px;
    background: #fff;
  }

  .right-panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .left-panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .map-filter {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;

    .el-select {
      width: 220px;
    }
  }

  .map-body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    position: relative;
    // display: flex;
    // flex-direction: column;

    ::v-deep .warehouse-grid-map {
      height: auto;
      min-height: 100%;
      width: fit-content;
      min-width: 100%;
    }

    ::v-deep .el-empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }

  .dialog-search {
    margin-bottom: 8px;
  }

  .search-footer {
    display: flex;
    align-items: center;
    height: 32px;

    .partition {
      width: 1px;
      height: 14px;
      background: #e1e5eb;
      margin: 0 10px;
    }
  }

  .table-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
  }

  .right-title {
    font-weight: 700;
    color: #1b2129;
    margin-bottom: 10px;
    flex-shrink: 0;
  }
}

.detail-table {
  width: 100%;
  border-collapse: collapse;

  td {
    border: 1px solid #ebeef5;
    padding: 10px 12px;
    color: #303133;
  }

  .label {
    width: 90px;
    background: #f5f7fa;
    color: #606266;
    font-weight: 600;
  }
}

::v-deep .select-container-dialog .el-dialog__body {
  padding: 20px;
  box-sizing: border-box;
}

::v-deep .select-container-dialog .el-dialog__footer {
  padding: 10px 20px 20px;
}

::v-deep .left-panel .el-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

::v-deep .left-panel .el-tabs__header {
  flex-shrink: 0;
}

::v-deep .left-panel .el-tabs__content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

::v-deep .left-panel .el-tab-pane {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
