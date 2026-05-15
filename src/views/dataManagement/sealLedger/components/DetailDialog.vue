<template>
  <el-dialog
    title="详情"
    :visible.sync="visible"
    width="680px"
    append-to-body
    :close-on-click-modal="false"
  >
    <div v-loading="loading">
      <table class="detail-table">
        <tr>
          <td class="label">容器</td>
          <td colspan="3">{{ detailData.containerDisplay || '-' }}</td>
        </tr>
        <tr>
          <td class="label">封记1</td>
          <td>{{ seal1Display }}</td>
          <td class="label">封记2</td>
          <td>{{ seal2Display }}</td>
        </tr>
        <tr>
          <td class="label">登记时间</td>
          <td>{{ detailData.registerTime || '-' }}</td>
          <td class="label">状态</td>
          <td>{{ detailData.sealStatusName || '-' }}</td>
        </tr>
        <tr>
          <td class="label">创建人</td>
          <td>{{ detailData.createUname || '-' }}</td>
          <td class="label">创建时间</td>
          <td>{{ detailData.createTime || '-' }}</td>
        </tr>
      </table>
    </div>
    <span slot="footer">
      <el-button size="small" @click="visible = false">关闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getSealRecordDetail } from './api.js'
import { buildSealDisplay } from './index.js'
import { formatSealType } from '@/utils/sealType.js'

export default {
  name: 'DetailDialog',
  props: {
    sealTypeOptions: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      visible: false,
      loading: false,
      detailData: {},
    }
  },
  computed: {
    seal1Display() {
      return buildSealDisplay(this.detailData.sealCode1, this.getSealTypeLabel(this.detailData.sealType1))
    },
    seal2Display() {
      return buildSealDisplay(this.detailData.sealCode2, this.getSealTypeLabel(this.detailData.sealType2))
    },
  },
  methods: {
    async open(row) {
      if (!row || !row.id) return
      this.visible = true
      this.loading = true
      this.detailData = {}
      try {
        const res = await getSealRecordDetail(row.id)
        this.detailData = res.data || {}
      } finally {
        this.loading = false
      }
    },
    getSealTypeLabel(value) {
      return formatSealType(this.sealTypeOptions, value)
    },
  },
}
</script>

<style lang="scss" scoped>
.detail-table {
  width: 100%;
  border-collapse: collapse;

  td {
    border: 1px solid #ebeef5;
    padding: 10px 12px;
    color: #1b2129;
    line-height: 22px;
  }

  .label {
    width: 110px;
    background: #f1f4f6;
    color: #626c78;
    font-weight: 600;
  }
}
</style>
