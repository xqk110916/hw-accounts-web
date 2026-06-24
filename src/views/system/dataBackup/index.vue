<template>
  <div class="wrapper">
    <div class="content">
      <div class="right">
        <div class="backup-panel">
          <div class="panel-title">数据备份</div>
          <div class="panel-desc">支持全量数据库备份下载与备份文件恢复</div>

          <div class="action-buttons">
            <div
              :class="['action-btn', 'primary', { disabled: downloadLoading }]"
              @click="handleDownloadDmp"
            >
              <i :class="[downloadLoading ? 'el-icon-loading' : 'el-icon-download']"></i>
              <span>下载备份数据</span>
            </div>
            <div class="action-btn danger" @click="handleOpenRestore">
              <i class="el-icon-upload2"></i>
              <span>恢复备份数据</span>
            </div>
          </div>

          <div class="warning-tip">
            <i class="el-icon-warning"></i>
            恢复备份数据为高危操作，会覆盖当前所有数据库数据，请谨慎操作！
          </div>
        </div>
      </div>
    </div>
    <restore-upload-dialog ref="restoreDialog" />
  </div>
</template>

<script>
import { exportDmpStream } from './components/api.js'
import RestoreUploadDialog from './components/RestoreUploadDialog.vue'
import { blobSaveExcel } from '@/utils'

export default {
  name: 'DataBackup',
  components: { RestoreUploadDialog },
  data() {
    return {
      downloadLoading: false,
    }
  },
  methods: {
    // 下载全量数据库 DMP 备份（流式）
    handleDownloadDmp() {
      if (this.downloadLoading) return
      this.downloadLoading = true
      exportDmpStream().then(res => {
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
        const disposition = res.headers && (res.headers['content-disposition'] || res.headers['Content-Disposition'])
        let fileName = '数据库备份.dmp'
        if (disposition) {
          const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^";\n]+)/i)
          if (match && match[1]) fileName = decodeURIComponent(match[1].replace(/['"]/g, ''))
        }
        blobSaveExcel(blob, fileName)
      }).catch(() => {
        this.$message.error('下载失败')
      }).finally(() => {
        this.downloadLoading = false
      })
    },
    // 打开 DMP 上传恢复弹窗
    handleOpenRestore() {
      this.$refs.restoreDialog.open()
    },
  },
}
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

    .right {
      flex: 1;
      height: 100%;
      box-sizing: border-box;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .backup-panel {
    width: 100%;
    max-width: 520px;
    text-align: center;

    .panel-title {
      font-size: 18px;
      font-weight: 600;
      color: #1b2129;
      margin-bottom: 8px;
    }

    .panel-desc {
      font-size: 14px;
      color: #626c78;
      margin-bottom: 32px;
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-bottom: 24px;

      .action-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 160px;
        height: 110px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 15px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);

        i {
          font-size: 28px;
          margin-bottom: 10px;
        }

        span {
          font-size: 14px;
          line-height: 1;
        }

        &.primary {
          background: #246fe5;
          color: #fff;
        }

        &.danger {
          background: #f56c6c;
          color: #fff;
        }

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        &.disabled {
          cursor: not-allowed;
          opacity: 0.6;
          transform: none;
        }
      }
    }

    .warning-tip {
      font-size: 13px;
      color: #e6a23c;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;

      i {
        font-size: 15px;
      }
    }
  }
}
</style>
