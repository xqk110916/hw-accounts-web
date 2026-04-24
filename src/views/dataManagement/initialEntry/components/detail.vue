<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="90%"
    top="5vh"
    :before-close="handleClose">
    <div class="dialog-content">
      <!-- 导入区域 -->
      <div v-if="mode === 'add' || mode === 're-import'" class="import-section">
        <el-upload
          class="upload-demo"
          drag
          action=""
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          limit="1">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传 excel 文件</div>
        </el-upload>
        <div class="import-actions">
          <el-button type="primary" size="small" :loading="uploading" @click="doImport">开始导入</el-button>
        </div>
      </div>

      <!-- 明细表格区域 -->
      <div v-if="mode === 'view' || importId" class="detail-section">
        <div class="section-title">导入明细列表</div>
        <el-table :data="detailData" border stripe size="small" height="450px" v-loading="loading">
          <el-table-column type="index" label="序号" width="50"></el-table-column>
          <el-table-column prop="taskNum" label="任务号" width="120"></el-table-column>
          <el-table-column prop="goodCode" label="材料编码" width="120"></el-table-column>
          <el-table-column prop="containerCode" label="容器号" width="120"></el-table-column>
          <el-table-column prop="boxNum" label="货箱号" width="100"></el-table-column>
          <el-table-column prop="warehouseName" label="库房" width="120"></el-table-column>
          <el-table-column label="位置" width="120">
            <template slot-scope="scope">
              {{ scope.row.shelfCode }}-{{ scope.row.rowCode }}-{{ scope.row.columnCode }}
            </template>
          </el-table-column>
          <el-table-column prop="grossWeight" label="毛重" width="80"></el-table-column>
          <el-table-column prop="netWeight" label="净重" width="80"></el-table-column>
          <el-table-column prop="tareWeight" label="皮重" width="80"></el-table-column>
          <el-table-column prop="productionUnit" label="生产单位" width="150" show-overflow-tooltip></el-table-column>
          <el-table-column prop="sealCode1" label="封记1" width="120" show-overflow-tooltip></el-table-column>
          <el-table-column prop="metalPercentage" label="金属量" width="80"></el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination
            @current-change="handlePageChange"
            :current-page="page.currentPage"
            :page-size="page.pageSize"
            layout="total, prev, pager, next"
            :total="page.total">
          </el-pagination>
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClose">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { importInitialEntry, getImportDetail } from './api'

export default {
  data() {
    return {
      visible: false,
      title: '操作',
      mode: 'add',
      importId: '',
      fileList: [],
      uploading: false,
      loading: false,
      detailData: [],
      page: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      }
    }
  },
  methods: {
    open(row, type = 'add') {
      this.mode = type
      this.importId = row ? row.id : ''
      this.title = type === 'add' ? '新增导入' : type === 'view' ? '查看明细' : '编辑'
      this.fileList = []
      this.detailData = []
      this.page.currentPage = 1
      
      this.visible = true
      if (this.importId && type === 'view') {
        this.fetchDetails()
      }
    },
    handleFileChange(file) {
      this.fileList = [file]
    },
    async doImport() {
      if (this.fileList.length === 0) {
        return this.$message.warning('请先选择文件')
      }
      this.uploading = true
      try {
        const res = await importInitialEntry(this.fileList[0].raw, this.mode === 're-import' ? this.importId : null)
        if (res.code === 1) {
          this.$message.success('导入成功')
          this.importId = res.data.dataId
          this.fetchDetails()
          this.$emit('query')
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.uploading = false
      }
    },
    fetchDetails() {
      this.loading = true
      const params = {
        id: this.importId,
        currentPage: this.page.currentPage,
        pageSize: this.page.pageSize
      }
      getImportDetail(params).then(res => {
        if (res.code === 1) {
          this.detailData = res.data.list || []
          this.page.total = Number(res.data.pagination.total) || 0
        }
      }).finally(() => {
        this.loading = false
      })
    },
    handlePageChange(val) {
      this.page.currentPage = val
      this.fetchDetails()
    },
    handleClose() {
      this.visible = false
      this.importId = ''
      this.fileList = []
      this.detailData = []
    }
  }
}
</script>

<style scoped>
.dialog-content {
  padding: 10px 20px;
}
.import-section {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.import-actions {
  margin-top: 10px;
}
.section-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}
.pagination {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
.dialog-footer {
  text-align: right;
  padding: 10px 20px;
}
</style>
