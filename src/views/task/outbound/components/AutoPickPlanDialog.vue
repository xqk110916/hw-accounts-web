<template>
  <el-dialog
    title="自动配置"
    :visible.sync="visible"
    width="94vw"
    top="4vh"
    custom-class="auto-pick-plan-dialog"
    :close-on-click-modal="false"
    append-to-body
    @closed="handleClosed"
  >
    <div class="auto-pick-plan" v-loading="loading">
      <div class="section">
        <div class="section-header">
          <span>待出库物料</span>
          <el-button size="mini" icon="el-icon-edit" @click="editingConditions = !editingConditions">
            {{ editingConditions ? '完成' : '编辑' }}
          </el-button>
        </div>
        <el-table :data="materials" border size="small" max-height="190">
          <el-table-column type="index" label="序号" width="55" />
          <el-table-column prop="materialName" label="物料名称" min-width="120" show-overflow-tooltip />
          <el-table-column prop="goodCode" label="材料编码" min-width="110" show-overflow-tooltip />
          <el-table-column label="毛重" width="120">
            <template slot-scope="scope">
              <el-input v-if="editingConditions" v-model="scope.row.grossWeight" size="mini" />
              <span v-else>{{ formatWeight(scope.row.grossWeight) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="皮重" width="120">
            <template slot-scope="scope">
              <el-input v-if="editingConditions" v-model="scope.row.tareWeight" size="mini" />
              <span v-else>{{ formatWeight(scope.row.tareWeight) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="净重" width="120">
            <template slot-scope="scope">
              <el-input v-if="editingConditions" v-model="scope.row.netWeight" size="mini" />
              <span v-else>{{ formatWeight(scope.row.netWeight) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="单位" width="90">
            <template slot-scope="scope">
              <el-input v-if="editingConditions" v-model="scope.row.unit" size="mini" />
              <span v-else>{{ scope.row.unit || 'kg' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="库房" min-width="160" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-input v-if="editingConditions" v-model="scope.row.warehousesText" size="mini" placeholder="多个用;分隔" />
              <span v-else>{{ joinText(scope.row.warehouses) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="生产单位" min-width="160" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-input v-if="editingConditions" v-model="scope.row.suppliersText" size="mini" placeholder="多个用;分隔" />
              <span v-else>{{ joinText(scope.row.suppliers) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="入库任务编号" min-width="160" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-input v-if="editingConditions" v-model="scope.row.batchNosText" size="mini" placeholder="多个用;分隔" />
              <span v-else>{{ joinText(scope.row.batchNos) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="入库时间" width="250">
            <template slot-scope="scope">
              <el-date-picker
                v-if="editingConditions"
                v-model="scope.row.storageTimeRange"
                type="datetimerange"
                size="mini"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
              <span v-else>{{ getStorageTimeText(scope.row) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="priority-bar">
        <span class="priority-title">优先级</span>
        <el-checkbox v-model="priority.priorityWarehouse">尽量一个库房</el-checkbox>
        <el-checkbox v-model="priority.priorityBatch">尽量一个批次</el-checkbox>
        <el-checkbox v-model="priority.priorityManufacturer">尽量一个生产单位</el-checkbox>
        <el-checkbox v-model="priority.priorityFifo">入库时间先进先出</el-checkbox>
        <span class="max-solutions">最大方案数</span>
        <el-input-number v-model="priority.maxSolutions" size="mini" :min="1" :max="20" />
        <el-button size="mini" type="primary" icon="el-icon-refresh" :disabled="loading" @click="queryPlans">重新计算</el-button>
      </div>

      <div class="plan-tabs">
        <el-radio-group v-model="activePlanKey" size="small" @change="resetCurrentContainers">
          <el-radio-button
            v-for="(plan, index) in visiblePlans"
            :key="plan._key"
            :label="plan._key"
          >
            方案{{ index + 1 }}
          </el-radio-button>
        </el-radio-group>
        <el-dropdown v-if="hiddenPlans.length" trigger="click" @command="selectHiddenPlan">
          <el-button size="small">另外{{ hiddenPlans.length }}个<i class="el-icon-arrow-down el-icon--right"></i></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="plan in hiddenPlans" :key="plan._key" :command="plan._key">
              方案{{ plan._index + 1 }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-empty v-if="!plans.length && !loading" description="暂无可用方案" :image-size="80" />
      </div>

      <div v-if="currentPlan" class="plan-summary">
        <el-tag size="mini">容器 {{ currentPlan.containerCount || currentContainers.length }}</el-tag>
        <el-tag size="mini" type="info">库房 {{ currentPlan.warehouseCount || 0 }}</el-tag>
        <el-tag size="mini" type="info">批次 {{ currentPlan.batchCount || 0 }}</el-tag>
        <el-tag size="mini" type="info">生产单位 {{ currentPlan.manufacturerCount || 0 }}</el-tag>
        <el-tag size="mini" type="success">净重 {{ formatWeight(currentPlan.totalNetWeight) }}</el-tag>
        <el-tag v-if="currentPlan.oldestStorageTime" size="mini" type="warning">最早入库 {{ currentPlan.oldestStorageTime }}</el-tag>
      </div>

      <div v-if="currentPlan" class="section">
        <div class="section-header">
          <span>物料满足情况</span>
        </div>
        <div class="satisfaction-list">
          <div v-for="item in satisfactionList" :key="item.goodCode || item.materialName" class="satisfaction-item">
            <span class="material-name">{{ item.materialName || item.goodCode }}</span>
            <span>目标(毛/皮/净)：{{ item.targetText }}</span>
            <span>匹配(毛/皮/净)：{{ item.actualText }}</span>
            <el-tag size="mini" :type="item.satisfied ? 'success' : 'danger'">
              {{ item.satisfied ? '已满足' : '未满足' }}
            </el-tag>
          </div>
        </div>
      </div>

      <div v-if="currentPlan" class="section">
        <div class="section-header">
          <span>容器明细</span>
        </div>
        <el-table :data="currentContainers" border size="small" height="300">
          <el-table-column type="index" label="序号" width="55" />
          <el-table-column prop="goodCode" label="材料编码" width="115" show-overflow-tooltip />
          <el-table-column prop="containerCode" label="容器号" width="125" show-overflow-tooltip />
          <el-table-column prop="productionUnit" label="生产单位" width="125" show-overflow-tooltip />
          <el-table-column prop="warehouseName" label="库房" width="110" show-overflow-tooltip />
          <el-table-column label="位置(排-行-列)" width="130" show-overflow-tooltip>
            <template slot-scope="scope">{{ getPositionText(scope.row) }}</template>
          </el-table-column>
          <el-table-column prop="boxNum" label="货箱号" width="100" show-overflow-tooltip />
          <el-table-column prop="sealCode1" label="封记编码1" width="120" show-overflow-tooltip />
          <el-table-column prop="sealCode2" label="封记编码2" width="120" show-overflow-tooltip />
          <el-table-column prop="netWeight" label="净重" width="100" show-overflow-tooltip />
          <el-table-column label="重量(毛,皮,净)" width="170" show-overflow-tooltip>
            <template slot-scope="scope">{{ getWeightText(scope.row) }}</template>
          </el-table-column>
          <el-table-column prop="metalPercentage" label="金属量%" width="100" show-overflow-tooltip />
          <el-table-column label="操作" width="80" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click="removeContainer(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <span slot="footer">
      <el-button size="small" @click="visible = false">取消</el-button>
      <el-button type="primary" size="small" :disabled="loading || !currentPlan" @click="useCurrentPlan">使用本方案</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { autoWeightPickPlan } from './api.js'

function clone(value) {
  return JSON.parse(JSON.stringify(value || []))
}

function toNumber(value) {
  if (value === '' || value === null || value === undefined) return 0
  const number = Number(value)
  return Number.isNaN(number) ? NaN : number
}

function splitText(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  return String(value || '')
    .split(/[;；,，\n]/)
    .map(item => item.trim())
    .filter(Boolean)
}

export default {
  name: 'AutoPickPlanDialog',
  data() {
    return {
      visible: false,
      loading: false,
      editingConditions: false,
      materials: [],
      priority: {
        priorityWarehouse: true,
        priorityManufacturer: false,
        priorityBatch: false,
        priorityFifo: false,
        maxSolutions: 3,
      },
      overwriteRequired: false,
      plans: [],
      activePlanKey: '',
      currentContainers: [],
    }
  },
  computed: {
    visiblePlans() {
      return this.plans.slice(0, 3)
    },
    hiddenPlans() {
      return this.plans.slice(3)
    },
    currentPlan() {
      return this.plans.find(item => item._key === this.activePlanKey)
    },
    satisfactionList() {
      return this.materials.map(material => {
        const actual = this.currentContainers
          .filter(item => !material.goodCode || String(item.goodCode) === String(material.goodCode))
          .reduce((sum, item) => ({
            grossWeight: sum.grossWeight + (Number(item.grossWeight) || 0),
            tareWeight: sum.tareWeight + (Number(item.tareWeight) || 0),
            netWeight: sum.netWeight + (Number(item.netWeight) || 0),
          }), { grossWeight: 0, tareWeight: 0, netWeight: 0 })
        const targetNet = toNumber(material.netWeight)
        const targetGross = toNumber(material.grossWeight)
        const hasNet = !Number.isNaN(targetNet) && targetNet > 0
        const hasGross = !Number.isNaN(targetGross) && targetGross > 0
        const satisfied = hasNet
          ? actual.netWeight >= targetNet
          : hasGross
            ? actual.grossWeight >= targetGross
            : false
        return {
          goodCode: material.goodCode,
          materialName: material.materialName,
          targetText: this.getWeightText(material),
          actualText: this.getWeightText(actual),
          satisfied,
        }
      })
    },
    hasUnsatisfiedMaterial() {
      return this.satisfactionList.some(item => !item.satisfied)
    },
  },
  methods: {
    open(materials = [], overwriteRequired = false) {
      this.materials = clone(materials).map(this.normalizeMaterial)
      this.overwriteRequired = overwriteRequired
      this.visible = true
      this.editingConditions = false
      this.plans = []
      this.activePlanKey = ''
      this.currentContainers = []
      this.$nextTick(() => this.queryPlans())
    },
    handleClosed() {
      this.loading = false
      this.editingConditions = false
    },
    normalizeMaterial(row = {}) {
      return {
        ...row,
        goodCode: row.goodCode || '',
        materialName: row.materialName || row.goodsName || row.goodName || row.goodCode || '',
        grossWeight: row.grossWeight || '',
        tareWeight: row.tareWeight || '',
        netWeight: row.netWeight || row.goodWeight || '',
        unit: row.unit || 'kg',
        suppliers: splitText(row.suppliers),
        warehouses: splitText(row.warehouses),
        batchNos: splitText(row.batchNos),
        suppliersText: splitText(row.suppliers).join(';'),
        warehousesText: splitText(row.warehouses).join(';'),
        batchNosText: splitText(row.batchNos).join(';'),
        startStorageTime: row.startStorageTime || '',
        endStorageTime: row.endStorageTime || '',
        storageTimeRange: row.startStorageTime || row.endStorageTime ? [row.startStorageTime, row.endStorageTime] : [],
      }
    },
    syncEditableFields() {
      this.materials = this.materials.map(item => {
        const range = item.storageTimeRange || []
        return {
          ...item,
          suppliers: splitText(item.suppliersText),
          warehouses: splitText(item.warehousesText),
          batchNos: splitText(item.batchNosText),
          startStorageTime: range[0] || '',
          endStorageTime: range[1] || '',
        }
      })
    },
    validateMaterials() {
      if (!this.materials.length) {
        this.$message.warning('请先选择调拨依据/材料')
        return false
      }
      for (const item of this.materials) {
        const weights = [item.grossWeight, item.tareWeight, item.netWeight].filter(value => value !== '' && value !== null && value !== undefined)
        if (!weights.length) {
          this.$message.warning(`${item.materialName || item.goodCode || '物料'}缺少目标重量`)
          return false
        }
        if (weights.some(value => Number.isNaN(toNumber(value)))) {
          this.$message.warning(`${item.materialName || item.goodCode || '物料'}重量必须为数字`)
          return false
        }
      }
      return true
    },
    buildRequest() {
      this.syncEditableFields()
      return {
        materials: this.materials.map(item => ({
          goodCode: item.goodCode,
          materialName: item.materialName,
          grossWeight: item.grossWeight === '' ? undefined : Number(item.grossWeight),
          tareWeight: item.tareWeight === '' ? undefined : Number(item.tareWeight),
          netWeight: item.netWeight === '' ? undefined : Number(item.netWeight),
          unit: item.unit || 'kg',
          suppliers: item.suppliers || [],
          warehouses: item.warehouses || [],
          batchNos: item.batchNos || [],
          startStorageTime: item.startStorageTime || undefined,
          endStorageTime: item.endStorageTime || undefined,
        })),
        ...this.priority,
      }
    },
    async queryPlans() {
      if (!this.validateMaterials()) return
      this.loading = true
      try {
        const res = await autoWeightPickPlan(this.buildRequest())
        const data = Array.isArray(res.data) ? res.data : ((res.data && res.data.list) || [])
        this.plans = data
          .map((item, index) => ({
            ...item,
            _key: String(item.solutionId || `plan-${index}`),
            _index: index,
            containers: (item.containers || []).map(this.normalizeContainer),
          }))
          .sort((a, b) => (Number(a.priority) || 0) - (Number(b.priority) || 0))
          .map((item, index) => ({ ...item, _index: index }))
        this.activePlanKey = this.plans[0] ? this.plans[0]._key : ''
        this.resetCurrentContainers()
      } catch (error) {
        this.$message.error((error && error.message) || '自动配置失败')
      } finally {
        this.loading = false
      }
    },
    normalizeContainer(row = {}) {
      return {
        ...row,
        id: '',
        taskNum: row.taskNum || '',
        batchNo: row.batchNo || '',
        containerCode: row.containerCode || '',
        goodCode: row.goodCode || '',
        goodsName: row.material || row.goodsName || row.materialName || '',
        warehouseName: row.warehouseName || row.warehouse || '',
        boxNum: row.boxNum || row.boxNo || '',
        grossWeight: row.grossWeight || '',
        tareWeight: row.tareWeight || '',
        netWeight: row.netWeight || '',
        metalPercentage: row.metalPercentage || '',
        productionUnit: row.productionUnit || row.manufacturer || '',
        shelfCode: row.shelfCode || '',
        rowCode: row.rowCode || '',
        columnCode: row.columnCode || '',
        sealCode1: row.sealCode1 || '',
        sealCode2: row.sealCode2 || '',
      }
    },
    resetCurrentContainers() {
      this.currentContainers = this.currentPlan ? clone(this.currentPlan.containers).map(this.normalizeContainer) : []
    },
    selectHiddenPlan(key) {
      this.activePlanKey = key
      this.resetCurrentContainers()
    },
    removeContainer(index) {
      this.currentContainers.splice(index, 1)
    },
    useCurrentPlan() {
      if (!this.currentContainers.length) {
        this.$message.warning('当前方案没有可用容器')
        return
      }
      const emptyContainer = this.currentContainers.find(item => !item.containerCode)
      if (emptyContainer) {
        this.$message.warning('容器号不可为空')
        return
      }
      const codes = this.currentContainers.map(item => item.containerCode)
      const duplicated = codes.find((code, index) => codes.indexOf(code) !== index)
      if (duplicated) {
        this.$message.warning(`容器号重复：${duplicated}`)
        return
      }
      const confirmUse = () => {
        this.$emit('confirm', clone(this.currentContainers).map(this.normalizeContainer))
        this.visible = false
      }
      const confirmOverwrite = () => {
        if (this.overwriteRequired) {
          this.$confirm('使用本方案将覆盖当前明细，是否继续?', '提示', { type: 'warning' })
            .then(confirmUse)
            .catch(() => {})
        } else {
          confirmUse()
        }
      }
      if (this.hasUnsatisfiedMaterial) {
        this.$confirm('存在未满足物料，是否继续使用当前方案?', '提示', { type: 'warning' })
          .then(confirmOverwrite)
          .catch(() => {})
      } else {
        confirmOverwrite()
      }
    },
    formatWeight(value) {
      const number = Number(value)
      return Number.isNaN(number) ? '0.00000' : number.toFixed(5)
    },
    joinText(value) {
      return splitText(value).join(';') || '-'
    },
    getStorageTimeText(row) {
      if (!row.startStorageTime && !row.endStorageTime) return '-'
      return `${row.startStorageTime || ''}-${row.endStorageTime || ''}`
    },
    getPositionText(row) {
      const values = [row.shelfCode, row.rowCode, row.columnCode].filter(Boolean)
      return values.length ? values.join('-') : '-'
    },
    getWeightText(row) {
      return `${this.formatWeight(row.grossWeight)} / ${this.formatWeight(row.tareWeight)} / ${this.formatWeight(row.netWeight)}`
    },
  },
}
</script>

<style lang="scss" scoped>
.auto-pick-plan {
  min-height: 560px;
  max-height: calc(92vh - 150px);
  overflow: auto;

  .section {
    margin-bottom: 14px;
  }

  .section-header {
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 700;
    color: #1b2129;
  }

  .priority-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px 12px;
    margin-bottom: 12px;
    background: #f7f9fc;
    border: 1px solid #e3e8f0;
    border-radius: 4px;

    .priority-title,
    .max-solutions {
      color: #1b2129;
      font-weight: 700;
    }
  }

  .plan-tabs {
    min-height: 40px;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .plan-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
  }

  .satisfaction-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .satisfaction-item {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 30px;
    padding: 6px 10px;
    border: 1px solid #e3e8f0;
    border-radius: 4px;
    background: #fff;
    color: #303133;

    .material-name {
      font-weight: 700;
      color: #1b2129;
    }
  }
}

::v-deep .auto-pick-plan-dialog .el-dialog__body {
  padding: 16px 20px;
}
</style>
