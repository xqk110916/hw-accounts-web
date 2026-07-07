<template>
  <div>
    <theme-edit :show="show" width="1200px" showFooterSlot :title="titleMap[type]" :column="1" @cancle="close">
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
        <el-form-item label="库房名称" v-if="(type === 'view' || type === 'audit' || type === 'inputResult') && form.warehouseNames">
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
          <span class="stat-label">总不正常数：</span>
          <span class="stat-value stat-deficit">{{ statistics.totalAbnormalCount || 0 }}</span>
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div v-if="type !== 'audit' && type !== 'inputResult'" style="padding: 0 20px 20px; text-align: center;">
        <el-button v-if="type === 'add' || type === 'edit'" type="primary" @click="fetchGoodsList" :loading="goodsLoading">生成任务清单</el-button>
        <template v-if="hasGoodsList">
          <el-button type="success" @click="handleExport" :loading="exportLoading">导出盘存清单</el-button>
          <!-- <el-button type="warning" @click="handleExportToPad" :loading="exportPadLoading">导出到PAD</el-button> -->
          <el-button v-if="type === 'edit' || type === 'view'" type="info" @click="handleDownloadPadStream" :loading="downloadPadLoading">下载PAD盘存数据</el-button>
        </template>
      </div>
      <!-- 录入结果模式：导入盘存数据 -->
      <div v-if="type === 'inputResult'" style="padding: 0 20px 20px;">
        <input type="file" ref="importFileInput" accept=".json" style="display: none;" @change="handleImportFile" />
        <el-button type="warning" size="small" icon="el-icon-upload2" @click="$refs.importFileInput.click()" :loading="importLoading">导入盘存数据</el-button>
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
            <el-button size="small" @click="submitResult(4)" :loading="submitting">暂存</el-button>
            <el-button type="primary" size="small" @click="submitResult(0)" :loading="submitting">提交结果</el-button>
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

    <!-- 下载PAD盘存数据：选择库房 -->
    <DownloadPadDialog ref="downloadPadDialog" @confirm="doDownloadPadStream" />
  </div>
</template>

<script>
import { config, requestFun, beforeSubmit, beforeRecurrence } from './index.js'
import { getGoodsList, submitInventory, editInventory, auditInventory, submitInventoryResult, exportInventory, exportToPad, exportToPadStream } from './api.js'
import { generateBatchNo } from '@/api/common/batchNo.js'
import { blobSaveExcel } from '@/utils'
import { getLocationHierarchy } from '@/views/task/outbound/components/api.js'
import { getWarehouseById } from '@/views/warehouse/warehouse/config/warehouseConfig.js'
import { renderInventoryPlan, buildInventoryResultMap } from '../utils/renderInventoryPlan.js'
import InventoryContainer from './InventoryContainer.vue'
import DownloadPadDialog from './DownloadPadDialog.vue'

let JSZip = null
function loadJSZip() {
  if (JSZip) return Promise.resolve(JSZip)
  return import('jszip').then(mod => {
    JSZip = mod.default || mod
    return JSZip
  })
}

export default {
  components: {
    InventoryContainer,
    DownloadPadDialog,
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
        abnormalCount: 0,
        abnormalContainerCodes: [],
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
      importLoading: false,
      submitting: false,
      goodsListDirty: false, // 盘存方式/指定库房变更后需重新生成任务清单的标记
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
          totalAbnormalCount: data.totalAbnormalCount || ((Number(data.totalDeficitCount) || 0) + (Number(data.totalExcessCount) || 0)),
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
        abnormalCount: warehouse.abnormalCount || ((Number(warehouse.deficitCount) || 0) + (Number(warehouse.excessCount) || 0)),
        abnormalContainerCodes: [],
        deficitCount: warehouse.deficitCount || 0,
        deficitRemark: warehouse.deficitRemark || '',
        excessCount: warehouse.excessCount || 0,
        excessRemark: warehouse.excessRemark || '',
        // 导入标记：后端回传 dataStatus(1=已导入PAD数据)，默认 0
        dataStatus: warehouse.dataStatus === 1 ? 1 : 0,
      }
    },
    normalizeGoodsList(goodsList) {
      const noResult = (v) => v === undefined || v === null || v === '' || v === '-1'
      return (goodsList || []).map(g => ({
        ...g,
        // 无结果值时，录入模式默认空字符串，其他模式保留"-1"
        result: noResult(g.result)
          ? (this.type === 'inputResult' ? '' : '-1')
          : String(g.result),
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
                abnormalCount: 0,
                abnormalContainerCodes: [],
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
              abnormalCount: 0,
              abnormalContainerCodes: [],
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
          // 清单已与最新盘存范围同步，清除重新生成标记
          this.goodsListDirty = false
        }
      }).finally(() => {
        this.goodsLoading = false
      })
    },
    async handleExport() {
      if (!this.form.taskNum) return
      this.exportLoading = true
      try {
        // 1. 并行：获取后端文件 + 加载 JSZip + 加载各库房布局数据
        const excelPromise = exportInventory({ taskNum: this.form.taskNum })
        const jszipPromise = loadJSZip()

        // 构建库房布局加载任务（只加载有货物数据的库房）
        const warehouseIds = this.tabList.map(t => t.id)
        const warehousePromises = warehouseIds.map(wId => {
          return getWarehouseById(wId)
            .then(warehouse => ({ wId, warehouse }))
            .catch(() => ({ wId, warehouse: null }))
        })

        const [excelRes, ZipClass, ...warehouseResults] = await Promise.all([
          excelPromise,
          jszipPromise,
          ...warehousePromises,
        ])

        // 2. 处理后端返回的文件 blob
        const backendBlob = excelRes.data instanceof Blob ? excelRes.data : new Blob([excelRes.data])
        const backendFileName = this.resolveBackendFileName(excelRes.headers, this.form.taskNum)

        // 3. 渲染各库房平面图
        const planPromises = warehouseResults.map(({ wId, warehouse }) => {
          if (!warehouse || !warehouse.layout2d) return null
          const tab = this.tabList.find(t => t.id === wId)
          const goodsList = this.goodsListMap[wId] || []
          const inventoryResultMap = buildInventoryResultMap(goodsList)
          return renderInventoryPlan({
            warehouseName: tab ? tab.name : warehouse.name,
            layout: warehouse.layout2d,
            shelves: warehouse.shelves || [],
            inventoryResultMap,
          }).then(blob => ({ wId, tabName: tab ? tab.name : warehouse.name, blob }))
        })

        const planResults = (await Promise.all(planPromises)).filter(Boolean)

        // 4. 如果没有平面图数据，直接下载后端文件
        if (planResults.length === 0) {
          blobSaveExcel(backendBlob, backendFileName)
          return
        }

        // 5. 打包 ZIP
        const zip = new ZipClass()
        zip.file(backendFileName, backendBlob)
        planResults.forEach(({ tabName, blob }) => {
          const safeName = (tabName || '库房').replace(/[\\/:*?"<>|]/g, '_')
          zip.file(`${safeName}-盘存平面图.png`, blob)
        })

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const zipFileName = `盘存清单_${this.form.taskNum}.zip`
        blobSaveExcel(zipBlob, zipFileName)
      } catch (err) {
        console.error('导出盘存清单失败:', err)
        this.$message.error('导出失败，请重试')
      } finally {
        this.exportLoading = false
      }
    },
    /**
     * 解析后端返回的文件名
     * 优先从 Content-Disposition 解析 filename/filename*，解析不到则从 Content-Type 推断扩展名
     */
    resolveBackendFileName(headers, taskNum) {
      const disposition = headers && headers['content-disposition']
      if (disposition) {
        // 优先 RFC 5987 格式：filename*=UTF-8''xxx
        const starMatch = disposition.match(/filename\*=UTF-8''([^;\n]+)/i)
        if (starMatch && starMatch[1]) {
          try {
            return decodeURIComponent(starMatch[1])
          } catch (e) {
            console.warn('解析 filename* 失败:', starMatch[1])
          }
        }
        // 兼容 filename="xxx" / filename=xxx
        const match = disposition.match(/filename=["']?([^";\n]+)["']?/i)
        if (match && match[1]) {
          try {
            return decodeURIComponent(match[1].replace(/['"]/g, ''))
          } catch (e) {
            console.warn('解析 filename 失败:', match[1])
          }
        }
      }

      // 兜底：根据 Content-Type 推断扩展名
      const contentType = headers && headers['content-type']
      const extMap = {
        'application/zip': '.zip',
        'application/x-zip-compressed': '.zip',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'application/vnd.ms-excel': '.xls',
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      }
      const mime = contentType ? contentType.split(';')[0].trim().toLowerCase() : ''
      const ext = extMap[mime] || ''
      return `实物盘存清单_${taskNum}${ext}`
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
      // 先选择需要下载的库房（数据源为本任务详情返回的 warehouseList）
      if (!this.form.taskNum) return
      if (!this.warehouseList || this.warehouseList.length === 0) {
        this.$message.warning('当前任务没有可下载的库房')
        return
      }
      this.$refs.downloadPadDialog.open(this.warehouseList)
    },
    doDownloadPadStream(warehouseIds) {
      if (!this.form.taskNum || !warehouseIds || warehouseIds.length === 0) return
      this.downloadPadLoading = true
      exportToPadStream({
        taskNum: this.form.taskNum,
        wareHouseIds: warehouseIds,
      }).then(res => {
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
    handleImportFile(event) {
      const file = event.target.files && event.target.files[0]
      if (!file) return
      // 重置 input 以支持重复选择同一文件
      event.target.value = ''
      this.importLoading = true
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          this.applyImportData(data)
        } catch (err) {
          console.error('导入JSON解析失败:', err)
          this.$message.error('文件解析失败，请确保是有效的JSON文件')
        } finally {
          this.importLoading = false
        }
      }
      reader.onerror = () => {
        this.$message.error('文件读取失败')
        this.importLoading = false
      }
      reader.readAsText(file)
    },
    // 检测某库房是否已存在数据：明细 / 统计 / 人员信息 三类任一有值即视为有数据
    hasExistingWarehouseData(wId) {
      const form = this.inventoryFormMap[wId] || {}
      // 人员信息
      const hasPersonnel = ['inventoryTime', 'inventoryUser', 'sealChecker', 'responsibleUser', 'supervisor']
        .some(k => form[k] !== undefined && form[k] !== null && String(form[k]).trim() !== '')
      // 统计(正常/不正常数量或盘存结果)
      const hasStats = ['normalCount', 'abnormalCount', 'excessCount', 'deficitCount'].some(k => Number(form[k]) > 0)
        || (form.inventoryResult && form.inventoryResult !== '')
      // 明细
      const hasGoods = (this.goodsListMap[wId] || []).some(item => {
        const hasResult = item.result !== undefined && item.result !== null && item.result !== '' && item.result !== '-1'
        const hasRemark = item.resultRemark && item.resultRemark.trim() !== ''
        return hasResult || hasRemark
      })
      return { hasPersonnel, hasStats, hasGoods, any: hasPersonnel || hasStats || hasGoods }
    },
    getWarehouseName(wId) {
      const tab = this.tabList.find(t => t.id === wId)
      return (tab && tab.name) || `库房 ${wId}`
    },
    async applyImportData(data) {
      const importedList = data.warehouseList || []
      if (importedList.length === 0) {
        this.$message.warning('导入数据中没有库房明细')
        return
      }

      // 1. 仅保留命中本任务的库房(以 inventoryFormMap 已有的库房为准)；未命中忽略并提示
      const matched = []
      const ignoredNames = []
      importedList.forEach(warehouse => {
        const wId = String(warehouse.warehouseId)
        if (this.inventoryFormMap[wId]) {
          matched.push(warehouse)
        } else {
          ignoredNames.push(warehouse.warehouseName || `库房 ${wId}`)
        }
      })
      if (ignoredNames.length > 0) {
        // 异常提示用 MessageBox($alert)，模态置顶不会被其他提示遮挡；
        // 纯告知性质，无论确定还是关闭(X/ESC)都继续后续导入
        await this.$alert(`以下库房不属于本任务，已忽略：${ignoredNames.join('、')}`, '提示', {
          confirmButtonText: '确定',
          type: 'warning',
        }).catch(() => {})
      }
      if (matched.length === 0) {
        // 全部被忽略，已在上方 MessageBox 提示，无需重复
        return
      }

      // 2. 检测冲突库房(已有明细/统计/人员信息)
      const conflictIds = new Set(
        matched
          .filter(w => this.hasExistingWarehouseData(String(w.warehouseId)).any)
          .map(w => String(w.warehouseId))
      )

      // 3. 确定本次填充范围：冲突库房需用户确认是否覆盖；取消则仅填充无冲突库房
      let toFill = matched
      if (conflictIds.size > 0) {
        const names = matched
          .filter(w => conflictIds.has(String(w.warehouseId)))
          .map(w => this.getWarehouseName(String(w.warehouseId)))
          .join('、')
        try {
          await this.$confirm(`以下库房已有数据：${names}。\n是否覆盖这些库房？`, '确认覆盖', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          })
          // 确认：覆盖冲突库房 + 填充无冲突库房
          toFill = matched
        } catch {
          // 取消：跳过冲突库房，仅填充无冲突库房
          toFill = matched.filter(w => !conflictIds.has(String(w.warehouseId)))
        }
      }

      if (toFill.length === 0) {
        this.$message.info('已取消导入')
        return
      }

      // 4. 执行填充：保持 tabList/warehouseList 全量不动，仅按 warehouseId merge 命中库房
      toFill.forEach(warehouse => {
        const wId = String(warehouse.warehouseId)
        // 表单(强制标记 dataStatus=1 已导入)
        this.$set(this.inventoryFormMap, wId, {
          ...this.buildInventoryFormFromWarehouse(warehouse),
          dataStatus: 1,
        })
        // 明细
        this.$set(this.goodsListMap, wId, this.normalizeGoodsList(warehouse.goodsList))
        this.syncAbnormalContainerCodes(wId)
      })

      // 存在异常(被忽略的库房)时只提示异常，不再弹出成功提示，避免遮挡
      if (ignoredNames.length === 0) {
        this.$message.success(`成功导入 ${toFill.length} 个库房的盘存数据`)
      }
    },
    handleGoodsSelectionChange(selection) {
      this.selectedGoods = selection
    },
    handleSelectTypeChange(val) {
      if (val === 'all') {
        this.$set(this.form, 'warehouseIds', [])
      }
      // 盘存方式变更后，当前清单已失效，需重新生成
      this.goodsListDirty = true
    },
    async saveDraft() {
      await this.doSubmit(4)
    },
    async submitTask() {
      await this.doSubmit(0)
    },
    // 构建按库房组织的任务清单数据(库房表单 + 明细)，新增提交与编辑保存复用
    buildWareList() {
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
      return wareList
    },
    async doSubmit(submitType) {
      this.$refs.form.validate(async valid => {
        if (!valid) return

        if (this.goodsListDirty) {
          this.$message.warning('盘存方式或指定库房已修改，请先点击"生成任务清单"')
          return
        }

        if (Object.keys(this.goodsListMap).length === 0) {
          this.$message.warning('请先获取货物清单')
          return
        }

        const wareList = this.buildWareList()

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
        if (this.goodsListDirty) {
          this.$message.warning('盘存方式或指定库房已修改，请先点击"生成任务清单"')
          return
        }
        let payload = {
          id: this.form.id,
          taskNum: this.form.taskNum,
          selectType: this.form.selectType,
          remark: this.form.remark,
          wareList: this.buildWareList(),
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
        abnormalCount: wForm.abnormalCount || 0,
        deficitCount: wForm.abnormalCount || 0,
        deficitRemark: wForm.deficitRemark || '',
        excessCount: 0,
        excessRemark: wForm.excessRemark || '',
        // 导入标记一并提交(暂存/提交结果都带)
        dataStatus: wForm.dataStatus === 1 ? 1 : 0,
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
    submitResult(status) {
      const isDraft = status === 4
      const warehouseList = this.warehouseList && this.warehouseList.length
        ? this.warehouseList
        : this.tabList.map(tab => ({ warehouseId: tab.id, warehouseName: tab.name }))
      // 暂存(草稿)跳过必填校验，提交结果保持完整校验
      if (!isDraft && !this.validateInventoryResultForm(warehouseList)) return
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
      const payload = {
        id: this.form.id,
        taskNum: this.form.taskNum,
        wareList,
        status, // 暂存传4(待提交)，提交传0(待审核)
      }
      this.submitting = true
      submitInventoryResult(payload).then(res => {
        if (res.code === 1) {
          this.$message.success(isDraft ? '暂存成功' : '录入结果成功')
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
      this.statistics = { totalNormalCount: 0, totalAbnormalCount: 0, totalDeficitCount: 0, totalExcessCount: 0 }
      // 清空实物盘存清单数据
      this.goodsListMap = {}
      this.inventoryFormMap = {}
      this.tabList = []
      this.activeTab = ''
      this.goodsListDirty = false
      this.initForm()
      this.$refs.form && this.$refs.form.resetFields()
    },
    getResultText(result) {
      const map = { '0': '正常', '1': '不正常', '2': '不正常' }
      return map[result] || result || '-'
    },
    getResultClass(result) {
      const map = { '0': 'result-normal', '1': 'result-deficit', '2': 'result-deficit' }
      return map[result] || ''
    },
    handleInventoryFormUpdate({ warehouseId, field, value }) {
      if (this.inventoryFormMap[warehouseId]) {
        this.$set(this.inventoryFormMap[warehouseId], field, value)
      }
    },
    getGoodsKey(item, idx) {
      return item.id ? String(item.id) : String(idx)
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
      this.$set(this.inventoryFormMap[warehouseId], 'abnormalCount', goods.filter(item => String(item.result) === '1' || String(item.result) === '2').length)
    },
    syncAbnormalContainerCodes(warehouseId, forceUpdateCounts = false) {
      if (!this.inventoryFormMap[warehouseId]) return
      const goods = this.goodsListMap[warehouseId] || []
      const hasResultValue = goods.some(item => ['0', '1', '2'].includes(String(item.result)))
      const abnormalContainerCodes = []
      goods.forEach((item, idx) => {
        const key = this.getGoodsKey(item, idx)
        if (String(item.result) === '1' || String(item.result) === '2') {
          abnormalContainerCodes.push(key)
        }
      })
      this.$set(this.inventoryFormMap[warehouseId], 'abnormalContainerCodes', abnormalContainerCodes)
      if (abnormalContainerCodes.length > 0) {
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
      this.$set(this.inventoryFormMap[warehouseId], 'abnormalContainerCodes', [])
      this.$set(this.inventoryFormMap[warehouseId], 'normalCount', goods.length)
      this.$set(this.inventoryFormMap[warehouseId], 'abnormalCount', 0)
      this.$set(this.inventoryFormMap[warehouseId], 'deficitCount', 0)
      this.$set(this.inventoryFormMap[warehouseId], 'excessCount', 0)
    },
    applyPartialAbnormal(warehouseId, containerCodes = []) {
      const selectedKeys = containerCodes.map(item => String(item))
      const selectedSet = new Set(selectedKeys)
      const goods = this.goodsListMap[warehouseId] || []
      goods.forEach((item, idx) => {
        const key = this.getGoodsKey(item, idx)
        if (selectedSet.has(key)) {
          this.setGoodsResult(item, '1')
        } else {
          this.setGoodsResult(item, '0', true)
        }
      })
      this.$set(this.inventoryFormMap[warehouseId], 'abnormalContainerCodes', selectedKeys)
      this.updateInventoryCounts(warehouseId)
    },
    handleInventoryResultChange({ warehouseId, value }) {
      if (!this.inventoryFormMap[warehouseId]) return
      this.$set(this.inventoryFormMap[warehouseId], 'inventoryResult', value)
      if (value === 'all_normal') {
        this.applyAllNormal(warehouseId)
        return
      }
      this.applyPartialAbnormal(warehouseId, this.inventoryFormMap[warehouseId].abnormalContainerCodes || [])
    },
    handleAbnormalContainerChange({ warehouseId, value }) {
      if (!this.inventoryFormMap[warehouseId]) return
      this.applyPartialAbnormal(warehouseId, value)
    },
    handleGoodsResultChange({ warehouseId }) {
      if (!this.inventoryFormMap[warehouseId]) return
      this.syncAbnormalContainerCodes(warehouseId, true)
    },
    handleChange() {
      // 指定库房变更后，当前清单已失效，需重新生成
      this.goodsListDirty = true
    },
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
