<template>
  <div>
    <theme-edit :show="show" width="1080px" showFooterSlot :title="titleMap[type]" :column="1" @cancle="close">
      <el-form ref="form" class="form" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="任务编号" prop="taskNum">
          <el-input v-model="form.taskNum" size="small" disabled placeholder="自动生成" />
        </el-form-item>
        <el-form-item label="盘存方式" prop="selectType" v-if="type === 'add' || type === 'edit'">
          <el-select v-model="form.selectType" size="small" placeholder="请选择盘存方式" @change="handleSelectTypeChange">
            <el-option label="全部库房" value="all" />
            <el-option label="指定库房" value="selected" />
          </el-select>
        </el-form-item>
        <el-form-item label="盘存方式" v-else>
          <span>{{ form.selectType === 'all' ? '全部库房' : '指定库房' }}</span>
        </el-form-item>
        <el-form-item label="指定库房" prop="warehouseIds" v-if="(type === 'add' || type === 'edit') && form.selectType === 'selected'">
          <el-select v-model="form.warehouseIds" size="small" multiple placeholder="请选择库房" style="width: 100%" @change="handleChange">
            <el-option
              v-for="item in warehouseOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="库房名称" v-if="(type === 'view' || type === 'audit') && form.warehouseNames">
          <span>{{ form.warehouseNames }}</span>
        </el-form-item>
        <el-form-item label="备注" prop="remark" v-if="type === 'add' || type === 'edit'">
          <el-input v-model="form.remark" type="textarea" :rows="3" size="small" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="备注" v-else-if="form.remark">
          <span>{{ form.remark }}</span>
        </el-form-item>
        <el-form-item label="创建人" v-if="(type === 'view' || type === 'audit') && form.createUname">
          <span>{{ form.createUname }}</span>
        </el-form-item>
        <el-form-item label="创建时间" v-if="(type === 'view' || type === 'audit') && form.createTime">
          <span>{{ form.createTime }}</span>
        </el-form-item>
      </el-form>

      <!-- 统计信息 (查看模式) -->
      <div class="statistics" v-if="type === 'view' || type === 'audit'">
        <div class="stat-item">
          <span class="stat-label">总正常数：</span>
          <span class="stat-value stat-normal">{{ statistics.totalNormalCount || 0 }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总盘亏数：</span>
          <span class="stat-value stat-deficit">{{ statistics.totalDeficitCount || 0 }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总盘盈数：</span>
          <span class="stat-value stat-excess">{{ statistics.totalExcessCount || 0 }}</span>
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div v-if="type !== 'audit' && type !== 'inputResult'" style="padding: 0 20px 20px; text-align: center;">
        <el-button v-if="type === 'add' || type === 'edit'" type="primary" @click="fetchGoodsList" :loading="goodsLoading">生成任务清单</el-button>
        <template v-if="hasGoodsList">
          <el-button type="success" @click="handleExport" :loading="exportLoading">导出盘存清单</el-button>
          <el-button type="warning" @click="handleExportToPad" :loading="exportPadLoading">导出到PAD</el-button>
          <el-button type="info" @click="handleDownloadPadStream" :loading="downloadPadLoading">下载PAD盘存数据</el-button>
        </template>
      </div>

      <!-- 实物盘存清单容器 (按库房 Tab 渲染) -->
      <InventoryContainer
        :type="type"
        :tab-list="tabList"
        :active-tab.sync="activeTab"
        :inventory-form-map="inventoryFormMap"
        :goods-list-map="goodsListMap"
        @update:inventoryFormMap="handleInventoryFormUpdate"
        @inventory-result-change="handleInventoryResultChange"
        @abnormal-container-change="handleAbnormalContainerChange"
        @goods-result-change="handleGoodsResultChange"
      />

      <template slot="footer">
        <div class="footer">
          <el-button size="small" @click="close">取消</el-button>
          <!-- 新增模式 -->
          <template v-if="type === 'add'">
            <el-button type="primary" size="small" @click="saveDraft" :loading="submitting">提交</el-button>
          </template>
          <!-- 编辑模式 -->
          <template v-if="type === 'edit'">
            <el-button type="primary" size="small" @click="editTask" :loading="submitting">保存</el-button>
          </template>
          <!-- 录入结果模式 -->
          <template v-if="type === 'inputResult'">
            <el-button type="primary" size="small" @click="submitResult" :loading="submitting">提交结果</el-button>
          </template>
          <!-- 审核模式 -->
          <template v-if="type === 'audit'">
            <el-button size="small" @click="handleAudit(false)">驳回</el-button>
            <el-button type="primary" size="small" @click="handleAudit(true)">同意</el-button>
          </template>
        </div>
      </template>
    </theme-edit>

    <!-- 驳回原因弹窗 -->
    <el-dialog :close-on-click-modal="false" title="驳回原因" :visible.sync="rejectDialogVisible" width="400px" append-to-body>
      <el-input v-model="rejectRemark" type="textarea" :rows="3" placeholder="请输入驳回原因" />
      <div slot="footer">
        <el-button size="small" @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="confirmReject">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { config, requestFun, beforeSubmit, beforeRecurrence } from './index.js'
import { getGoodsList, submitInventory, editInventory, auditInventory, submitInventoryResult, exportInventory, exportToPad, exportToPadStream } from './api.js'
import { generateBatchNo } from '@/api/common/batchNo.js'
import { blobSaveExcel } from '@/utils'
import { getLocationHierarchy } from '@/views/task/outbound/components/api.js'
import InventoryContainer from './InventoryContainer.vue'

export default {
  components: {
    InventoryContainer,
  },
  data() {
    return {
      row: {},
      show: false,
      type: 'add',
      form: {
        inventoryTime: '',
        inventoryUser: '',
        sealChecker: '',
        responsibleUser: '',
        supervisor: '',
        inventoryResult: '', // all_normal, partial_abnormal
        normalCount: 0,
        excessContainerCodes: [],
        deficitContainerCodes: [],
        deficitCount: 0,
        deficitRemark: '',
        excessCount: 0,
        excessRemark: '',
      },
      rules: {},
      options: {},
      goodsListMap: {}, // 存储每个库房的明细列表, 键为 warehouseId
      inventoryFormMap: {}, // 存储每个库房的盘存表单信息, 键为 warehouseId
      activeTab: '', // 当前选中的库房 Tab
      tabList: [], // 库房 Tab 列表
      warehouseList: [],
      activeWarehouses: [],
      statistics: { totalNormalCount: 0, totalDeficitCount: 0, totalExcessCount: 0 },
      warehouseOptions: [],
      goodsLoading: false,
      exportLoading: false,
      exportPadLoading: false,
      downloadPadLoading: false,
      submitting: false,
      rejectDialogVisible: false,
      rejectRemark: '',
    }
  },
  computed: {
    hasGoodsList() {
      return Object.keys(this.goodsListMap).length > 0
    },
    titleMap() {
      return {
        add: '添加实物盘存',
        edit: '编辑实物盘存',
        view: '实物盘存详情',
        inputResult: '录入盘存结果',
        audit: '审核实物盘存',
      }
    },
  },
  created() {
    this.initForm()
    this.loadWarehouseOptions()
  },
  methods: {
    open(row, mode) {
      this.row = row || {}
      if (this.row.id) {
        this.type = mode || 'edit'
        this.getDetails(this.row.id).then(() => {
          this.show = true
        })
      } else {
        this.type = 'add'
        this.goodsList = []
        this.warehouseList = []
        this.show = true
        generateBatchNo({ batchType: 3 }).then(res => {
          if (res.code === 1) {
            this.$set(this.form, 'taskNum', res.data)
          }
        })
      }
    },
    close() {
      this.resetForm()
      this.$nextTick(() => {
        this.show = false
      })
    },
    initForm() {
      config.detail.forEach(item => {
        let defaultValue = item.defaultValue !== undefined ? item.defaultValue : ''
        this.$set(this.form, item.prop, defaultValue)
        if (item.required) {
          let isInput = !item.type || item.type === 'text' || item.type === 'textarea'
          let rule = {
            required: true,
            message: `请${isInput ? '输入' : '选择'}${item.label}`,
            trigger: isInput ? 'blur' : 'change',
          }
          this.$set(this.rules, item.prop, [rule])
        }
      })
    },
    loadWarehouseOptions() {
      getLocationHierarchy(2).then(res => {
        if (res.code === 1) {
          this.warehouseOptions = (res.data || []).map(item => ({
            label: item.warehouseName,
            value: item.id ? String(item.id) : item.id,
          }))
        }
      })
    },
    getDetails(id) {
      return requestFun.detail(id).then(res => {
        let data = res.data
        // 填充主表单
        const inventory = data.inventory || data
        config.detail.forEach(item => {
          if (inventory[item.prop] !== undefined && inventory[item.prop] !== null) {
            this.$set(this.form, item.prop, inventory[item.prop])
          }
        })
        this.form.id = inventory.id
        // 单独回填库房名称（config.detail 中未定义此字段）
        if (inventory.warehouseNames) {
          this.$set(this.form, 'warehouseNames', inventory.warehouseNames)
        }
        // 库房分组数据
        this.warehouseList = data.warehouseList || []
        
        // 回显库房 IDs
        let wIds = []
        if (inventory.warehouseIds) {
          let ids = inventory.warehouseIds;
          if (typeof ids === 'string') {
            wIds = ids.split(',').filter(Boolean).map(id => String(id));
          } else if (Array.isArray(ids)) {
            wIds = ids.map(id => String(id));
          } else {
            wIds = [String(ids)]
          }
        } else if (this.warehouseList && this.warehouseList.length > 0) {
          wIds = this.warehouseList.map(w => String(w.warehouseId))
        }
        this.$set(this.form, 'warehouseIds', wIds);

        if (this.warehouseList && this.warehouseList.length > 0) {
          this.activeWarehouses = [String(this.warehouseList[0].warehouseId)]
        }
        // 统计数据
        this.statistics = {
          totalNormalCount: data.totalNormalCount || 0,
          totalDeficitCount: data.totalDeficitCount || 0,
          totalExcessCount: data.totalExcessCount || 0,
        }
        if (this.warehouseList && this.warehouseList.length > 0) {
          this.initInventoryFormData(this.warehouseList)
          this.fillGoodsListFromWarehouseList(this.warehouseList)
        } else {
          this.fetchGoodsListForDetail()
        }
        if (beforeRecurrence) beforeRecurrence(this.form, this)
        return data
      })
    },
    normalizeResultStatus(value) {
      const str = value === undefined || value === null || value === '' ? '' : String(value)
      const map = { '1': 'all_normal', '2': 'partial_abnormal', all_normal: 'all_normal', partial_abnormal: 'partial_abnormal' }
      return map[str] || ''
    },
    toResultStatus(value) {
      const status = this.normalizeResultStatus(value)
      if (!status) return ''
      return status === 'partial_abnormal' ? '2' : '1'
    },
    buildInventoryFormFromWarehouse(warehouse = {}) {
      return {
        inventoryTime: warehouse.inventoryTime || '',
        inventoryUser: warehouse.inventoryUser || warehouse.inventoryMan || '',
        sealChecker: warehouse.sealChecker || warehouse.statusInspector || '',
        responsibleUser: warehouse.responsibleUser || warehouse.responsiblePerson || '',
        supervisor: warehouse.supervisor || warehouse.superviseMan || '',
        inventoryResult: this.normalizeResultStatus(warehouse.inventoryResult || warehouse.resultStatus),
        normalCount: warehouse.normalCount || 0,
        excessContainerCodes: [],
        deficitContainerCodes: [],
        deficitCount: warehouse.deficitCount || 0,
        deficitRemark: warehouse.deficitRemark || '',
        excessCount: warehouse.excessCount || 0,
        excessRemark: warehouse.excessRemark || '',
      }
    },
    normalizeGoodsList(goodsList) {
      return (goodsList || []).map(g => ({
        ...g,
        result: g.result === undefined || g.result === null || g.result === '' ? '-1' : String(g.result),
        resultRemark: g.resultRemark || g.remark || '',
      }))
    },
    fillGoodsListFromWarehouseList(warehouseList) {
      this.goodsListMap = {}
      warehouseList.forEach(warehouse => {
        const wId = String(warehouse.warehouseId)
        this.$set(this.goodsListMap, wId, this.normalizeGoodsList(warehouse.goodsList))
        this.syncAbnormalContainerCodes(wId)
      })
    },
    initInventoryFormData(warehouseList) {
      this.tabList = []
      this.inventoryFormMap = {}
      if (!warehouseList || warehouseList.length === 0) return
      warehouseList.forEach((warehouse, index) => {
        const wId = String(warehouse.warehouseId)
        const wName = warehouse.warehouseName || `库房 ${wId}`
        this.tabList.push({ id: wId, name: wName })
        // 初始化盘存表单数据
        this.$set(this.inventoryFormMap, wId, this.buildInventoryFormFromWarehouse(warehouse))
        if (index === 0) this.activeTab = wId
      })
    },
    fetchGoodsListForDetail() {
      const type = this.form.selectType || 'all'
      // 按照详情接口返回的库房ID去获取清单数据
      let warehouseIds = this.form.warehouseIds || []
      
      // 如果没有解析出指定的 warehouseIds 但 warehouseList 有数据，则提取
      if (!warehouseIds.length && this.warehouseList && this.warehouseList.length > 0) {
        warehouseIds = this.warehouseList.map(w => w.warehouseId)
      }

      // 对于全部库房，接口传 undefined
      if (type === 'all') {
        warehouseIds = undefined
      }

      getGoodsList({ type, warehouseId: warehouseIds }).then(res => {
        if (res.code === 1) {
          const resData = res.data || {}
          this.goodsListMap = {}
          
          // 如果后端详情没有返回 warehouseList，我们需要从 goods 数据中构建 tabList 和 inventoryFormMap
          if (!this.warehouseList || this.warehouseList.length === 0) {
            this.tabList = []
            this.inventoryFormMap = {}
            let firstTab = ''
            Object.keys(resData).forEach((wId, index) => {
              const wName = (resData[wId][0] && resData[wId][0].warehouseName) || `库房 ${wId}`
              this.tabList.push({ id: wId, name: wName })
              this.$set(this.inventoryFormMap, wId, {
                inventoryTime: '',
                inventoryUser: '',
                sealChecker: '',
                responsibleUser: '',
                supervisor: '',
                inventoryResult: '',
                normalCount: 0,
                excessContainerCodes: [],
                deficitContainerCodes: [],
                deficitCount: 0,
                deficitRemark: '',
                excessCount: 0,
                excessRemark: '',
              })
              if (index === 0) firstTab = wId
            })
            this.activeTab = firstTab
          }

          Object.keys(resData).forEach(wId => {
            this.$set(this.goodsListMap, wId, this.normalizeGoodsList(resData[wId]))
            this.syncAbnormalContainerCodes(wId)
          })
        }
      })
    },
    fetchGoodsList() {
      const type = this.form.selectType || 'all'
      const warehouseIds = type === 'selected' ? this.form.warehouseIds : undefined
      if (type === 'selected' && (!warehouseIds || warehouseIds.length === 0)) {
        this.$message.warning('请先选择库房')
        return
      }
      
      this.goodsLoading = true
      // 模拟或者根据后端新接口获取数据
      // 假设后端返回的数据结构为 { code: 1, data: { [warehouseId]: [ goods1, goods2 ] } }
      getGoodsList({ type, warehouseId: warehouseIds }).then(res => {
        if (res.code === 1) {
          const resData = res.data || {}
          this.goodsListMap = {}
          this.inventoryFormMap = {}
          this.tabList = []
          
          let firstTab = ''
          
          // 如果是全部库房，或者特定库房，根据返回的键值构建 tabs
          Object.keys(resData).forEach((wId, index) => {
            const wName = (resData[wId][0] && resData[wId][0].warehouseName) || `库房 ${wId}` // 尝试从明细中获取库名，或者回退
            this.tabList.push({ id: wId, name: wName })
            
            // 初始化每个库房的表单数据
            this.$set(this.inventoryFormMap, wId, {
              inventoryTime: '',
              inventoryUser: '',
              sealChecker: '',
              responsibleUser: '',
              supervisor: '',
              inventoryResult: '',
              normalCount: 0,
              excessContainerCodes: [],
              deficitContainerCodes: [],
              deficitCount: 0,
              deficitRemark: '',
              excessCount: 0,
              excessRemark: '',
            })
            
            // 初始化明细数据
            this.$set(this.goodsListMap, wId, this.normalizeGoodsList(resData[wId]))
            this.syncAbnormalContainerCodes(wId)
            
            if (index === 0) firstTab = wId
          })
          
          this.activeTab = firstTab
          
          let totalCount = Object.values(this.goodsListMap).reduce((sum, list) => sum + list.length, 0)
          this.$message.success(`获取到 ${totalCount} 条货物`)
        }
      }).finally(() => {
        this.goodsLoading = false
      })
    },
    handleExport() {
      if (!this.form.taskNum) return
      this.exportLoading = true
      exportInventory({ taskNum: this.form.taskNum }).then(res => {
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
        // 从 content-disposition 获取文件名
        const disposition = res.headers && res.headers['content-disposition']
        let fileName = `实物盘存清单_${this.form.taskNum}`
        if (disposition) {
          const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^";\n]+)/i)
          if (match && match[1]) {
            fileName = decodeURIComponent(match[1].replace(/['"]/g, ''))
          }
        }
        blobSaveExcel(blob, fileName)
      }).finally(() => {
        this.exportLoading = false
      })
    },
    handleExportToPad() {
      if (!this.form.taskNum) return
      this.exportPadLoading = true
      exportToPad({ taskNum: this.form.taskNum }).then(res => {
        if (res.code === 1) {
          this.$message.success('导出到PAD成功')
        }
      }).finally(() => {
        this.exportPadLoading = false
      })
    },
    handleDownloadPadStream() {
      if (!this.form.taskNum) return
      this.downloadPadLoading = true
      exportToPadStream({ taskNum: this.form.taskNum }).then(res => {
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
        const disposition = res.headers && res.headers['content-disposition']
        let fileName = `PAD盘存数据_${this.form.taskNum}.json`
        if (disposition) {
          const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^";\n]+)/i)
          if (match && match[1]) {
            fileName = decodeURIComponent(match[1].replace(/['"]/g, ''))
          }
        }
        blobSaveExcel(blob, fileName)
      }).finally(() => {
        this.downloadPadLoading = false
      })
    },
    handleGoodsSelectionChange(selection) {
      this.selectedGoods = selection
    },
    handleSelectTypeChange(val) {
      if (val === 'all') {
        this.$set(this.form, 'warehouseIds', [])
      }
    },
    async saveDraft() {
      await this.doSubmit(4)
    },
    async submitTask() {
      await this.doSubmit(0)
    },
    async doSubmit(submitType) {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        
        if (Object.keys(this.goodsListMap).length === 0) {
          this.$message.warning('请先获取货物清单')
          return
        }

        const wareList = []
        
        Object.keys(this.goodsListMap).forEach(wId => {
          const wForm = this.inventoryFormMap[wId] || {}
          const wGoods = this.goodsListMap[wId] || []
          
          wareList.push({
            warehouseId: wId,
            warehouseName: (this.tabList.find(t => t.id === wId) && this.tabList.find(t => t.id === wId).name) || '',
            ...wForm,
            goodsList: wGoods.map(g => ({
              warehouseId: g.warehouseId,
              warehouseName: g.warehouseName,
              containerCode: g.containerCode,
              goodCode: g.goodCode,
              goodName: g.goodName,
              productionUnit: g.productionUnit,
              location: g.location,
              sealCode1: g.sealCode1,
              sealType1: g.sealType1,
              sealCode2: g.sealCode2,
              sealType2: g.sealType2,
              storageTime: g.storageTime,
              result: g.result || '0',
              resultRemark: g.resultRemark || '',
            }))
          })
        })

        let payload = {
          taskNum: this.form.taskNum,
          selectType: this.form.selectType,
          submitType,
          remark: this.form.remark,
          wareList // 将按库房组织的表单和明细一起提交
        }

        if (this.form.selectType === 'selected') {
          const selectedNames = this.warehouseOptions
            .filter(w => (this.form.warehouseIds || []).includes(w.value))
            .map(w => w.label)
          payload.warehouseIds = (this.form.warehouseIds || []).join(',')
          payload.warehouseNames = selectedNames.join(',')
        }

        if (beforeSubmit) payload = await beforeSubmit(payload)
        
        this.submitting = true
        submitInventory(payload).then(res => {
          if (res.code === 1) {
            this.$message.success(submitType === 4 ? '暂存成功' : '提交成功')
            this.$emit('query')
            this.close()
          }
        }).finally(() => {
          this.submitting = false
        })
      })
    },
    editTask() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        let payload = {
          id: this.form.id,
          taskNum: this.form.taskNum,
          selectType: this.form.selectType,
          remark: this.form.remark,
        }
        if (this.form.selectType === 'selected') {
          const selectedNames = this.warehouseOptions
            .filter(w => (this.form.warehouseIds || []).includes(w.value))
            .map(w => w.label)
          payload.warehouseIds = (this.form.warehouseIds || []).join(',')
          payload.warehouseNames = selectedNames.join(',')
        }
        if (beforeSubmit) payload = await beforeSubmit(payload)
        this.submitting = true
        editInventory(payload).then(res => {
          if (res.code === 1) {
            this.$message.success('编辑成功')
            this.$emit('query')
            this.close()
          }
        }).finally(() => {
          this.submitting = false
        })
      })
    },
    buildWarehouseSubmitData(warehouse, wId) {
      const wForm = this.inventoryFormMap[wId] || {}
      return {
        warehouseId: warehouse.warehouseId || wId,
        warehouseName: warehouse.warehouseName || (this.tabList.find(t => t.id === wId) && this.tabList.find(t => t.id === wId).name) || '',
        inventoryMan: wForm.inventoryUser || '',
        inventoryUser: wForm.inventoryUser || '',
        inventoryTime: wForm.inventoryTime || '',
        statusInspector: wForm.sealChecker || '',
        sealChecker: wForm.sealChecker || '',
        responsiblePerson: wForm.responsibleUser || '',
        responsibleUser: wForm.responsibleUser || '',
        superviseMan: wForm.supervisor || '',
        supervisor: wForm.supervisor || '',
        resultStatus: this.toResultStatus(wForm.inventoryResult),
        inventoryResult: this.normalizeResultStatus(wForm.inventoryResult),
        normalCount: wForm.normalCount || 0,
        deficitCount: wForm.deficitCount || 0,
        deficitRemark: wForm.deficitRemark || '',
        excessCount: wForm.excessCount || 0,
        excessRemark: wForm.excessRemark || '',
      }
    },
    validateInventoryResultForm(warehouseList) {
      const requiredFields = [
        { prop: 'inventoryTime', label: '盘存时间' },
        { prop: 'inventoryUser', label: '盘存人' },
        { prop: 'sealChecker', label: '封记检查人' },
        { prop: 'responsibleUser', label: '负责人' },
      ]
      for (const warehouse of warehouseList) {
        const wId = String(warehouse.warehouseId)
        const wForm = this.inventoryFormMap[wId] || {}
        const missing = requiredFields.filter(item => {
          const value = wForm[item.prop]
          return value === undefined || value === null || String(value).trim() === ''
        })
        if (missing.length > 0) {
          this.activeTab = wId
          this.$message.warning(`库房"${warehouse.warehouseName}"请填写${missing.map(item => item.label).join('、')}`)
          return false
        }
      }
      return true
    },
    submitResult() {
      const warehouseList = this.warehouseList && this.warehouseList.length
        ? this.warehouseList
        : this.tabList.map(tab => ({ warehouseId: tab.id, warehouseName: tab.name }))
      if (!this.validateInventoryResultForm(warehouseList)) return
      const wareList = warehouseList.map(w => {
        const wId = String(w.warehouseId)
        const goods = this.goodsListMap[wId] || []
        return {
          ...this.buildWarehouseSubmitData(w, wId),
          goodsList: goods.map(g => ({
            warehouseId: g.warehouseId || w.warehouseId || wId,
            warehouseName: g.warehouseName || w.warehouseName || (this.tabList.find(t => t.id === wId) && this.tabList.find(t => t.id === wId).name) || '',
            containerCode: g.containerCode || '',
            goodCode: g.goodCode || '',
            goodName: g.goodName || '',
            productionUnit: g.productionUnit || '',
            location: g.location || '',
            sealCode1: g.sealCode1 || '',
            sealType1: g.sealType1 || '',
            sealCode2: g.sealCode2 || '',
            sealType2: g.sealType2 || '',
            storageTime: g.storageTime || '',
            result: g.result === '-1' ? '' : (g.result || '0'),
            resultRemark: g.resultRemark || '',
          })),
        }
      })
      this.submitting = true
      submitInventoryResult({
        id: this.form.id,
        taskNum: this.form.taskNum,
        wareList,
      }).then(res => {
        if (res.code === 1) {
          this.$message.success('录入结果成功')
          this.$emit('query')
          this.close()
        }
      }).finally(() => {
        this.submitting = false
      })
    },
    handleAudit(approved) {
      if (approved) {
        auditInventory({
          id: this.form.id,
          auditStatus: 1,
          auditRemark: '',
        }).then(res => {
          if (res.code === 1) {
            this.$message.success('审核通过')
            this.$emit('query')
            this.close()
          }
        })
      } else {
        this.rejectRemark = ''
        this.rejectDialogVisible = true
      }
    },
    confirmReject() {
      if (!this.rejectRemark) {
        this.$message.warning('请输入驳回原因')
        return
      }
      auditInventory({
        id: this.form.id,
        auditStatus: 2,
        auditRemark: this.rejectRemark,
      }).then(res => {
        if (res.code === 1) {
          this.$message.success('已驳回')
          this.rejectDialogVisible = false
          this.$emit('query')
          this.close()
        }
      })
    },
    resetForm() {
      this.row = {}
      this.form = {
        taskNum: '',
        selectType: 'all',
        warehouseIds: [],
        warehouseNames: '',
        remark: '',
        createUname: '',
        createTime: '',
      }
      this.goodsList = []
      this.selectedGoods = []
      this.warehouseList = []
      this.activeWarehouses = []
      this.statistics = { totalNormalCount: 0, totalDeficitCount: 0, totalExcessCount: 0 }
      // 清空实物盘存清单数据
      this.goodsListMap = {}
      this.inventoryFormMap = {}
      this.tabList = []
      this.activeTab = ''
      this.initForm()
      this.$refs.form && this.$refs.form.resetFields()
    },
    getResultText(result) {
      const map = { '0': '正常', '1': '盘亏', '2': '盘盈' }
      return map[result] || result || '-'
    },
    getResultClass(result) {
      const map = { '0': 'result-normal', '1': 'result-deficit', '2': 'result-excess' }
      return map[result] || ''
    },
    handleInventoryFormUpdate({ warehouseId, field, value }) {
      if (this.inventoryFormMap[warehouseId]) {
        this.$set(this.inventoryFormMap[warehouseId], field, value)
      }
    },
    getGoodsKey(item) {
      return String(item.id || '')
    },
    setGoodsResult(goods, result, clearRemark = false) {
      this.$set(goods, 'result', result)
      if (clearRemark) {
        this.$set(goods, 'resultRemark', '')
      }
    },
    updateInventoryCounts(warehouseId) {
      const goods = this.goodsListMap[warehouseId] || []
      this.$set(this.inventoryFormMap[warehouseId], 'normalCount', goods.filter(item => String(item.result) === '0').length)
      this.$set(this.inventoryFormMap[warehouseId], 'deficitCount', goods.filter(item => String(item.result) === '1').length)
      this.$set(this.inventoryFormMap[warehouseId], 'excessCount', goods.filter(item => String(item.result) === '2').length)
    },
    syncAbnormalContainerCodes(warehouseId, forceUpdateCounts = false) {
      if (!this.inventoryFormMap[warehouseId]) return
      const goods = this.goodsListMap[warehouseId] || []
      const hasResultValue = goods.some(item => ['0', '1', '2'].includes(String(item.result)))
      const deficitContainerCodes = goods
        .filter(item => String(item.result) === '1')
        .map(item => this.getGoodsKey(item))
      const excessContainerCodes = goods
        .filter(item => String(item.result) === '2')
        .map(item => this.getGoodsKey(item))
      this.$set(this.inventoryFormMap[warehouseId], 'deficitContainerCodes', deficitContainerCodes)
      this.$set(this.inventoryFormMap[warehouseId], 'excessContainerCodes', excessContainerCodes)
      if (deficitContainerCodes.length > 0 || excessContainerCodes.length > 0) {
        this.$set(this.inventoryFormMap[warehouseId], 'inventoryResult', 'partial_abnormal')
      }
      if (forceUpdateCounts || hasResultValue) {
        this.updateInventoryCounts(warehouseId)
      }
    },
    applyAllNormal(warehouseId) {
      const goods = this.goodsListMap[warehouseId] || []
      goods.forEach(item => {
        this.setGoodsResult(item, '0', true)
      })
      this.$set(this.inventoryFormMap[warehouseId], 'deficitContainerCodes', [])
      this.$set(this.inventoryFormMap[warehouseId], 'excessContainerCodes', [])
      this.$set(this.inventoryFormMap[warehouseId], 'normalCount', goods.length)
      this.$set(this.inventoryFormMap[warehouseId], 'deficitCount', 0)
      this.$set(this.inventoryFormMap[warehouseId], 'excessCount', 0)
    },
    applyPartialAbnormal(warehouseId, resultType, containerCodes = []) {
      const field = resultType === 'excess' ? 'excessContainerCodes' : 'deficitContainerCodes'
      const oppositeField = resultType === 'excess' ? 'deficitContainerCodes' : 'excessContainerCodes'
      const selectedKeys = containerCodes.map(item => String(item))
      const selectedSet = new Set(selectedKeys)
      const oppositeKeys = (this.inventoryFormMap[warehouseId][oppositeField] || [])
        .map(item => String(item))
        .filter(item => !selectedSet.has(item))
      const deficitSet = new Set(resultType === 'deficit' ? selectedKeys : oppositeKeys)
      const excessSet = new Set(resultType === 'excess' ? selectedKeys : oppositeKeys)
      const goods = this.goodsListMap[warehouseId] || []
      goods.forEach(item => {
        const key = this.getGoodsKey(item)
        if (deficitSet.has(key)) {
          this.setGoodsResult(item, '1')
        } else if (excessSet.has(key)) {
          this.setGoodsResult(item, '2')
        } else {
          this.setGoodsResult(item, '0', true)
        }
      })
      this.$set(this.inventoryFormMap[warehouseId], field, selectedKeys)
      this.$set(this.inventoryFormMap[warehouseId], oppositeField, oppositeKeys)
      this.updateInventoryCounts(warehouseId)
    },
    handleInventoryResultChange({ warehouseId, value }) {
      if (!this.inventoryFormMap[warehouseId]) return
      this.$set(this.inventoryFormMap[warehouseId], 'inventoryResult', value)
      if (value === 'all_normal') {
        this.applyAllNormal(warehouseId)
        return
      }
      this.applyPartialAbnormal(warehouseId, 'deficit', this.inventoryFormMap[warehouseId].deficitContainerCodes || [])
    },
    handleAbnormalContainerChange({ warehouseId, resultType, value }) {
      if (!this.inventoryFormMap[warehouseId]) return
      this.applyPartialAbnormal(warehouseId, resultType, value)
    },
    handleGoodsResultChange({ warehouseId }) {
      if (!this.inventoryFormMap[warehouseId]) return
      this.syncAbnormalContainerCodes(warehouseId, true)
    },
    handleChange() {},
  },
}
</script>

<style lang="scss" scoped>
.form {
  padding: 20px;
  ::v-deep .el-select,
  ::v-deep .el-input__inner {
    width: 100%;
  }
}
.statistics {
  display: flex;
  gap: 24px;
  padding: 0 20px 16px;
  .stat-item {
    .stat-label {
      font-size: 14px;
      color: #606266;
    }
    .stat-value {
      font-size: 16px;
      font-weight: bold;
      &.stat-normal { color: #2e7d32; }
      &.stat-deficit { color: #c62828; }
      &.stat-excess { color: #e68600; }
    }
  }
}
.detail-section {
  padding: 0 20px 20px;
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    .detail-title {
      font-size: 14px;
      font-weight: bold;
      color: #1b2129;
    }
  }
}
.footer {
  padding: 12px 32px 20px;
  display: flex;
  justify-content: flex-end;
}
.result-normal { color: #2e7d32; }
.result-deficit { color: #c62828; }
.result-excess { color: #e68600; }
</style>
