<template>
  <div>
    <theme-edit :show="show" showFooterSlot :title="titleMap[type]" :column="1" @cancle="close">
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
          <el-select v-model="form.warehouseIds" size="small" multiple placeholder="请选择库房" style="width: 100%">
            <el-option
              v-for="item in warehouseOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="库房名称" v-if="type !== 'add' && form.warehouseNames">
          <span>{{ form.warehouseNames }}</span>
        </el-form-item>
        <el-form-item label="备注" prop="remark" v-if="type === 'add' || type === 'edit'">
          <el-input v-model="form.remark" type="textarea" :rows="3" size="small" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="备注" v-else-if="form.remark">
          <span>{{ form.remark }}</span>
        </el-form-item>
        <el-form-item label="创建人" v-if="type === 'view' && form.createUname">
          <span>{{ form.createUname }}</span>
        </el-form-item>
        <el-form-item label="创建时间" v-if="type === 'view' && form.createTime">
          <span>{{ form.createTime }}</span>
        </el-form-item>
      </el-form>

      <!-- 统计信息 (查看模式) -->
      <div class="statistics" v-if="type === 'view'">
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

      <!-- 生成任务清单 (仅新增模式显示) -->
      <div v-if="type === 'add'" style="padding: 0 20px 20px; text-align: center;">
        <el-button type="primary" @click="fetchGoodsList" :loading="goodsLoading">生成任务清单</el-button>
      </div>

      <!-- 实物盘存清单容器 (按库房 Tab 渲染) -->
      <div class="inventory-container" v-if="type !== 'audit' && tabList.length > 0">
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane v-for="tab in tabList" :key="tab.id" :label="tab.name" :name="tab.id">
            <div class="inventory-header">
              <span class="inventory-title">({{ tab.name }}) 实物盘存清单</span>
            </div>

            <!-- 优化后的表单布局 -->
            <div class="inventory-form" v-if="inventoryFormMap[tab.id]">
              <!-- 第1行：盘存时间 -->
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="form-item">
                    <span class="label">盘存时间</span>
                    <el-date-picker v-if="type === 'inputResult'" v-model="inventoryFormMap[tab.id].inventoryTime" type="datetime" size="small" placeholder="选择时间" value-format="yyyy-MM-dd HH:mm:ss" />
                    <span class="text-value" v-else>{{ inventoryFormMap[tab.id].inventoryTime || '-' }}</span>
                  </div>
                </el-col>
              </el-row>
              <!-- 第2行：盘存人、封记检查人 -->
              <el-row :gutter="20" class="mt-15">
                <el-col :span="12">
                  <div class="form-item">
                    <span class="label">盘存人</span>
                    <el-input v-if="type === 'inputResult'" v-model="inventoryFormMap[tab.id].inventoryUser" size="small" placeholder="请输入" />
                    <span class="text-value" v-else>{{ inventoryFormMap[tab.id].inventoryUser || '-' }}</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="form-item">
                    <span class="label">封记检查人</span>
                    <el-input v-if="type === 'inputResult'" v-model="inventoryFormMap[tab.id].sealChecker" size="small" placeholder="请输入" />
                    <span class="text-value" v-else>{{ inventoryFormMap[tab.id].sealChecker || '-' }}</span>
                  </div>
                </el-col>
              </el-row>
              <!-- 第3行：负责人、监盘人 -->
              <el-row :gutter="20" class="mt-15">
                <el-col :span="12">
                  <div class="form-item">
                    <span class="label">负责人</span>
                    <el-input v-if="type === 'inputResult'" v-model="inventoryFormMap[tab.id].responsibleUser" size="small" placeholder="请输入" />
                    <span class="text-value" v-else>{{ inventoryFormMap[tab.id].responsibleUser || '-' }}</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="form-item">
                    <span class="label">监盘人</span>
                    <el-input v-if="type === 'inputResult'" v-model="inventoryFormMap[tab.id].supervisor" size="small" placeholder="请输入" />
                    <span class="text-value" v-else>{{ inventoryFormMap[tab.id].supervisor || '-' }}</span>
                  </div>
                </el-col>
              </el-row>

              <!-- 盘存结果 -->
              <div class="result-section mt-15">
                <div class="result-title">盘存结果</div>
                <div class="result-content-col">
                  <!-- checkbox行 -->
                  <div class="status-checks">
                    <el-checkbox v-if="type === 'inputResult'" v-model="inventoryFormMap[tab.id].inventoryResult" true-label="all_normal" false-label="partial_abnormal">全部正常</el-checkbox>
                    <el-checkbox v-if="type === 'inputResult'" v-model="inventoryFormMap[tab.id].inventoryResult" true-label="partial_abnormal" false-label="all_normal">部分异常</el-checkbox>
                    <span class="text-value" v-if="type === 'view'">{{ inventoryFormMap[tab.id].inventoryResult === 'all_normal' ? '全部正常' : '部分异常' }}</span>
                  </div>
                  <!-- 输入框行 -->
                  <div class="stats-inputs mt-15">
                    <el-row :gutter="20">
                      <!-- 正常数 -->
                      <el-col :span="24" class="stat-col">
                        <div class="stat-item-row">
                          <span class="stat-label">正常数</span>
                          <el-input-number v-if="type === 'inputResult'" v-model="inventoryFormMap[tab.id].normalCount" size="small" :min="0" class="num-input" />
                          <span class="text-value" v-else>{{ inventoryFormMap[tab.id].normalCount }}</span>
                        </div>
                      </el-col>
                      <!-- 盘盈数 + 备注 -->
                      <el-col :span="24" class="stat-col mt-15">
                        <div class="stat-item-row">
                          <span class="stat-label">盘盈数</span>
                          <el-input-number v-if="type === 'inputResult'" v-model="inventoryFormMap[tab.id].excessCount" size="small" :min="0" class="num-input" />
                          <span class="text-value" v-else>{{ inventoryFormMap[tab.id].excessCount }}</span>
                          <span class="stat-label ml-15">备注</span>
                          <el-input v-if="type === 'inputResult'" v-model="inventoryFormMap[tab.id].excessRemark" size="small" placeholder="盘盈备注" class="remark-input flex-1" />
                          <span class="text-value flex-1" v-else>{{ inventoryFormMap[tab.id].excessRemark || '-' }}</span>
                        </div>
                      </el-col>
                      <!-- 盘亏数 + 备注 -->
                      <el-col :span="24" class="stat-col mt-15">
                        <div class="stat-item-row">
                          <span class="stat-label">盘亏数</span>
                          <el-input-number v-if="type === 'inputResult'" v-model="inventoryFormMap[tab.id].deficitCount" size="small" :min="0" class="num-input" />
                          <span class="text-value" v-else>{{ inventoryFormMap[tab.id].deficitCount }}</span>
                          <span class="stat-label ml-15">备注</span>
                          <el-input v-if="type === 'inputResult'" v-model="inventoryFormMap[tab.id].deficitRemark" size="small" placeholder="盘亏备注" class="remark-input flex-1" />
                          <span class="text-value flex-1" v-else>{{ inventoryFormMap[tab.id].deficitRemark || '-' }}</span>
                        </div>
                      </el-col>
                    </el-row>
                  </div>
                </div>
              </div>
            </div>

            <!-- 明细列表 -->
            <div class="detail-section-wrap mt-15">
              <div class="detail-section-title">明细</div>
              <el-table :data="goodsListMap[tab.id] || []" border size="small" max-height="400">
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column prop="warehouseName" label="位置" width="120" show-overflow-tooltip />
                <el-table-column prop="containerCode" label="容器号" width="120" show-overflow-tooltip />
                <el-table-column prop="inventoryTime" label="盘存时间" width="160" show-overflow-tooltip />
                <el-table-column prop="productionUnit" label="生产单位" width="100" show-overflow-tooltip />
                <el-table-column prop="sealCode1" label="封记编号1" width="100" show-overflow-tooltip />
                <el-table-column prop="sealCode2" label="封记编号2" width="100" show-overflow-tooltip />
                <el-table-column label="结果" width="220" v-if="type === 'inputResult'">
                  <template slot-scope="scope">
                    <div class="result-cell">
                      <el-radio-group v-model="scope.row.result" size="mini">
                        <el-radio label="0">正常</el-radio>
                        <el-radio label="1">不正常</el-radio>
                      </el-radio-group>
                      <el-input v-model="scope.row.resultRemark" size="mini" placeholder="备注" class="cell-remark mt-5" />
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="结果" width="220" v-if="type === 'view'">
                  <template slot-scope="scope">
                    <span :class="getResultClass(scope.row.result)">{{ getResultText(scope.row.result) }}</span>
                    <span v-if="scope.row.resultRemark" class="ml-10">({{ scope.row.resultRemark }})</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

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
import { deepClone } from '@/utils'
import { config, requestFun, beforeSubmit, beforeRecurrence, selectTypeOptions } from './index.js'
import { getGoodsList, submitInventory, editInventory, auditInventory, submitInventoryResult } from './api.js'
import { generateBatchNo } from '@/api/common/batchNo.js'
import { getLocationHierarchy } from '@/views/task/outbound/components/api.js'

export default {
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
        inventoryResult: 'all_normal', // all_normal, partial_abnormal
        normalCount: 0,
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
      submitting: false,
      rejectDialogVisible: false,
      rejectRemark: '',
    }
  },
  computed: {
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
            value: item.id,
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
        if (this.warehouseList.length > 0) {
          this.activeWarehouses = [this.warehouseList[0].warehouseId]
        }
        // 统计数据
        this.statistics = {
          totalNormalCount: data.totalNormalCount || 0,
          totalDeficitCount: data.totalDeficitCount || 0,
          totalExcessCount: data.totalExcessCount || 0,
        }
        if (beforeRecurrence) beforeRecurrence(this.form, this)
        return data
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
            const wName = resData[wId][0]?.warehouseName || `库房 ${wId}` // 尝试从明细中获取库名，或者回退
            this.tabList.push({ id: wId, name: wName })
            
            // 初始化每个库房的表单数据
            this.$set(this.inventoryFormMap, wId, {
              inventoryTime: '',
              inventoryUser: '',
              sealChecker: '',
              responsibleUser: '',
              supervisor: '',
              inventoryResult: 'all_normal',
              normalCount: 0,
              deficitCount: 0,
              deficitRemark: '',
              excessCount: 0,
              excessRemark: '',
            })
            
            // 初始化明细数据
            this.$set(this.goodsListMap, wId, (resData[wId] || []).map(g => ({
              ...g,
              result: g.result || '0',
              resultRemark: g.resultRemark || ''
            })))
            
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
            warehouseName: this.tabList.find(t => t.id === wId)?.name || '',
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
              sealCode2: g.sealCode2,
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
    submitResult() {
      // 校验异常项是否填写备注
      for (const warehouse of this.warehouseList) {
        const abnormalItems = (warehouse.goodsList || []).filter(
          g => g.result && g.result !== '0' && !g.resultRemark
        )
        if (abnormalItems.length > 0) {
          this.$message.warning(`库房"${warehouse.warehouseName}"中存在异常项未填写备注`)
          return
        }
      }
      const wareList = this.warehouseList.map(w => ({
        warehouseId: w.warehouseId,
        warehouseName: w.warehouseName,
        goodsList: (w.goodsList || []).map(g => ({
          id: g.id,
          result: g.result || '0',
          resultRemark: g.resultRemark || '',
        })),
      }))
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
.inventory-container {
  padding: 0 20px 20px;

  // 可滚动的 tab 样式
  ::v-deep .el-tabs {
    .el-tabs__header {
      margin-bottom: 0;
    }
    .el-tabs__nav-wrap {
      overflow-x: auto;
      overflow-y: hidden;
      &::-webkit-scrollbar {
        height: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #c0c4cc;
        border-radius: 3px;
      }
      &::-webkit-scrollbar-track {
        background-color: #f5f7fa;
      }
    }
    .el-tabs__nav-scroll {
      display: inline-block;
      white-space: nowrap;
    }
    .el-tabs__item {
      display: inline-block;
      float: none;
    }
  }
  .inventory-header {
    text-align: center;
    margin-bottom: 15px;
    padding: 10px 0;
    background-color: #f5f7fa;
    border-radius: 4px;
    .inventory-title {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
    }
  }
  
  .inventory-form {
    padding: 15px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    margin-bottom: 15px;
    
    .form-item {
      display: flex;
      align-items: center;
      .label {
        width: 80px;
        color: #606266;
        font-size: 14px;
        flex-shrink: 0;
      }
      .text-value {
        color: #303133;
        font-size: 14px;
      }
      ::v-deep .el-date-editor {
        width: 100%;
      }
    }
    
    .result-section {
      border-top: 1px dashed #ebeef5;
      padding-top: 15px;
      
      .result-title {
        font-weight: bold;
        color: #606266;
        margin-bottom: 10px;
      }
      
      .result-content-col {
        display: flex;
        flex-direction: column;
      }
    }
  }

  .stat-col {
    display: flex;
    align-items: center;
  }
  .stat-item-row {
    display: flex;
    align-items: center;
    width: 100%;
    .stat-label {
      width: 60px;
      color: #606266;
      font-size: 14px;
      flex-shrink: 0;
    }
    .flex-1 {
      flex: 1;
    }
  }

  .detail-section-wrap {
    .detail-section-title {
      font-weight: bold;
      color: #303133;
      margin-bottom: 10px;
      padding-left: 10px;
      border-left: 3px solid #409eff;
    }
  }
}

.mt-15 {
  margin-top: 15px;
}
.mt-5 {
  margin-top: 5px;
}
.ml-15 {
  margin-left: 15px;
}


.result-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  .cell-remark {
    margin-top: 4px;
  }
}

.ml-10 {
  margin-left: 10px;
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
  border-top: 1px solid #c4c9cf;
}
.result-normal { color: #2e7d32; }
.result-deficit { color: #c62828; }
.result-excess { color: #e68600; }
</style>
