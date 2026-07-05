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
                  :label="item.nodeName"
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
                  :label="item.warehouseName"
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
                :selected-container-codes="selectedContainerCodesList"
                @container-click="handleContainerClick"
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
                  <span v-else-if="item.prop === 'sealType1' || item.prop === 'sealType2'">{{ getSealTypeLabel(scope.row[item.prop]) }}</span>
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


        </el-tabs>
      </div>

      <div class="right-panel">
        <div class="right-title">
          <span>已选容器</span>
          <span class="net-total">净重合计：{{ selectedNetWeightTotal }}</span>
        </div>
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

  </el-dialog>
</template>

<script>
import WarehouseGridMap2D from '@/views/warehouse/warehouse/components/WarehouseGridMap2D.vue'
import { generateInitialLayout } from '@/views/warehouse/warehouse/utils/locationLayoutAdapter.js'
import { getInboundGoodsPageList, getLocationHierarchy, getLocationChildren, getPositionMap, getMaterialCodeListAll } from './api.js'
import { formatSealType, getSealTypeOptions } from '@/utils/sealType.js'

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

      containerSearch: {
        currentPage: 1,
        pageSize: 20,
        containerCode: '',
        goodCode: '',
        warehouseId: '',
        timeRange: [],
        netWeightMin: '',
        netWeightMax: '',
      },
      containerList: [],
      containerTotal: 0,
      containerCheckedRows: [],
      materialCodeOptions: [],
      sealTypeOptions: [],
      containerSearchOptions: [
        { label: '容器号', prop: 'containerCode', type: 'text', col: 5 },
        { label: '材料代码', prop: 'goodCode', type: 'select', col: 5, option: [] },
        { label: '库房', prop: 'warehouseId', type: 'select', col: 5, option: [] },
        { label: '入库时间', prop: 'timeRange', type: 'daterange', col: 8 },
        { label: '净重(最小值)', prop: 'netWeightMin', type: 'text', col: 4, labelWidth: 200 },
        { label: '净重(最大值)', prop: 'netWeightMax', type: 'text', col: 4, labelWidth: 200 },
        { type: 'slot', slotName: 'footer', col: 4 },
      ],
      goodsColumns: [
        { label: '材料代码', prop: 'goodCode', width: 120 },
        { label: '容器号', prop: 'containerCode', width: 130 },
        { label: '生产单位', prop: 'productionUnit', width: 130 },
        { label: '库房', prop: 'warehouseName', width: 120 },
        { label: '位置(列-排-层)', prop: 'positionText', width: 130 },
        { label: '货箱号', prop: 'boxNum', width: 100 },
        { label: '毛重', prop: 'grossWeight', width: 90 },
        { label: '皮重', prop: 'tareWeight', width: 90 },
        { label: '净重', prop: 'netWeight', width: 90 },
        { label: '封记编码1', prop: 'sealCode1', width: 120 },
        { label: '封记类型1', prop: 'sealType1', width: 120 },
        { label: '封记编码2', prop: 'sealCode2', width: 120 },
        { label: '封记类型2', prop: 'sealType2', width: 120 },
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
    selectedContainerCodesList() {
      return this.selectedContainers.map(c => c.containerCode).filter(Boolean)
    },
    selectedNetWeightTotal() {
      return this.selectedContainers
        .reduce((sum, item) => sum + (Number(item.netWeight) || 0), 0)
        .toFixed(5)
    },
  },
  methods: {
    open(list = []) {
      this.visible = true
      this.selectedContainers = clone(list).map(this.normalizeGoods)
      if (!this.balanceAreaOptions.length) this.loadBalanceAreas()
      if (!this.materialCodeOptions.length) this.loadMaterialCodeOptions()
      if (!this.sealTypeOptions.length) this.loadSealTypeOptions()
      this.loadWarehouseSearchOptions()
    },
    async loadWarehouseSearchOptions() {
      const res = await getLocationHierarchy(2)
      const opts = (res.data || []).map(item => ({ label: item.warehouseName, value: item.id }))
      const whOption = this.containerSearchOptions.find(item => item.prop === 'warehouseId')
      if (whOption) this.$set(whOption, 'option', opts)
    },
    handleClosed() {
      this.activeTab = 'map'
    },
    async loadBalanceAreas() {
      const res = await getLocationHierarchy(1)
      this.balanceAreaOptions = res.data || []
    },
    async loadMaterialCodeOptions() {
      try {
        const res = await getMaterialCodeListAll()
        this.materialCodeOptions = (res.data || [])
          .map(item => {
            const goodCode = item.goodCode
            const name = item.goodName
            return {
              label: name && name !== goodCode ? `${goodCode} - ${name}` : goodCode,
              value: goodCode,
            }
          })
          .filter(item => item.value)
        const goodCodeOption = this.containerSearchOptions.find(item => item.prop === 'goodCode')
        if (goodCodeOption) this.$set(goodCodeOption, 'option', this.materialCodeOptions)
      } catch (error) {
        this.materialCodeOptions = []
      }
    },
    loadSealTypeOptions() {
      getSealTypeOptions().then(options => {
        this.sealTypeOptions = options
      }).catch(() => {
        this.sealTypeOptions = []
      })
    },
    getSealTypeLabel(value) {
      return formatSealType(this.sealTypeOptions, value)
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
    },
    buildShelvesFromPositions(list) {
      const shelfMap = {}
      list.forEach(item => {
        const shelfKey = `${item.shelfCode || '排'}-${item.rowCode || '行'}`
        if (!shelfMap[shelfKey]) {
          shelfMap[shelfKey] = {
            id: shelfKey,
            name: shelfKey,
            columnId: item.shelfId,
            rowId: item.rowId,
            columnCode: item.shelfCode,
            rowCode: item.rowCode,
            width: 10,
            height: 2,
            position: { x: 0, y: 0 },
            layers: [],
          }
        }
        shelfMap[shelfKey].layers.push({
          id: item.id,
          containers: [{
            ...item,
            code: item.containerCode,
            materialCode: item.goodCode,
            materialName: item.goodsName,
            status: String(item.status == null ? 0 : item.status),
          }],
        })
      })
      return Object.values(shelfMap)
    },
    handleContainerClick(container) {
      const normalized = this.normalizeGoods(container)
      if (!normalized.containerCode) return
      const idx = this.selectedContainers.findIndex(c => c.containerCode === normalized.containerCode)
      if (idx >= 0) {
        this.selectedContainers.splice(idx, 1)
      } else {
        this.selectedContainers.push(normalized)
      }
    },
    normalizeGoods(row = {}) {
      // positionMap 接口的容器维度信息封装在 inboundGoodsEntity 中，需解包提升到外层；
      // getInboundGoodsPageList 返回的是扁平容器数据，entity 为空时自动回退到外层字段
      const entity = row.inboundGoodsEntity || {}
      const pick = (primary, ...fallback) => {
        for (const v of [primary, ...fallback]) {
          if (v !== undefined && v !== null && v !== '') return v
        }
        return ''
      }
      return {
        ...row,
        id: row.id,
        taskNum: pick(entity.taskNum, row.taskNum),
        containerCode: pick(entity.containerCode, row.containerCode, row.code),
        goodCode: pick(entity.goodCode, row.goodCode, row.goodsCode),
        goodsName: pick(row.goodsName, entity.goodsName, entity.goodCode, row.goodCode, row.goodsCode),
        warehouseId: pick(row.warehouseId, entity.warehouseId),
        warehouseName: pick(row.warehouseName, entity.warehouseName, row.warehouse),
        boxNum: pick(entity.boxNum, row.boxNum, row.boxNo),
        grossWeight: pick(entity.grossWeight, row.grossWeight),
        tareWeight: pick(entity.tareWeight, row.tareWeight),
        netWeight: pick(entity.netWeight, row.netWeight),
        productionUnit: pick(entity.productionUnit, row.productionUnit),
        shelfCode: pick(row.shelfCode, entity.shelfCode),
        rowCode: pick(row.rowCode, entity.rowCode),
        columnCode: pick(row.columnCode, entity.columnCode),
        shelfId: row.shelfId,
        rowId: row.rowId,
        columnId: row.columnId,
        sealCode1: pick(entity.sealCode1, row.sealCode1),
        sealCode2: pick(entity.sealCode2, row.sealCode2),
        sealType1: pick(entity.sealType1, row.sealType1),
        sealType2: pick(entity.sealType2, row.sealType2),
        metalPercentage: pick(entity.metalPercentage, row.metalPercentage),
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
        params.beginTime = params.timeRange[0]
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
    resetContainerSearch() {
      this.containerSearch = { currentPage: 1, pageSize: 20, containerCode: '', goodCode: '', warehouseId: '', timeRange: [], netWeightMin: '', netWeightMax: '' }
      this.queryContainerList()
    },
    handleContainerPageChange(page) {
      this.containerSearch.currentPage = page
      this.queryContainerList()
    },
    getPositionText(row) {
      const values = [row.shelfCode, row.rowCode, row.columnCode].filter(Boolean)
      return values.length ? values.join('-') : '-'
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-weight: 700;
    color: #1b2129;
    margin-bottom: 10px;
    flex-shrink: 0;

    .net-total {
      font-size: 12px;
      font-weight: 500;
      color: #409eff;
      white-space: nowrap;
    }
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
