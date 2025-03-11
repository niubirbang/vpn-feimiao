<script setup>
import { computed, ref } from 'vue'
import { useRouter } from "vue-router"
import { Error } from '@/notification'

const router = useRouter()

const outdatedShow = ref(false)
const outdatedInfo = ref({
  force: false,
  logs: [],
})
const downloading = ref(false)
const downloadShow = ref(false)
const downloadingInfo = ref({
  percent: 0
})
const downloaded = ref(false)
const installing = ref(false)
const downloadingPercent = computed(() => {
  if (downloaded.value) {
    return 100
  }
  return Math.floor(downloadingInfo.value.percent * 100 * 100) / 100
})

window.box_window.listenData((data) => {
  if (data.action == 'VERSION_OUTDATED') {
    outdatedInfo.value = data.value
    outdatedShow.value = true
    router.push('/')
  }
})
window.box_updater.listenDownloadProgress((data) => {
  downloadingInfo.value = data
})
window.box_updater.listenDownloaded((data) => {
  downloaded.value = true
})
window.box_window.listenData((data) => {
  if (data.action == 'VERSION_DOWNLOADED') {
    downloaded.value = true
    showDownload()
  }
})
const download = () => {
  if (downloading.value) {
    return
  }

  downloading.value = true
  window.box_updater.download().then(() => {
    outdatedShow.value = false
    showDownload()
  }).catch(err => {
    Error(err)
  }).finally(() => {
    setTimeout(() => { downloading.value = false }, 500)
  })
}
const showDownload = () => {
  downloadShow.value = true
}

const install = () => {
  if (installing.value) {
    return
  }

  installing.value = true
  window.box_updater.install().catch(err => {
    installing.value = false
    Error(err)
  })
}
</script>

<template>
  <el-dialog
    v-model="outdatedShow"
    width="90%"
    title="发现新版本！"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :align-center="true"
  >
    <div class="content">
      <p
        v-for="(log, i) in outdatedInfo.logs"
        :key="i"
      >{{ i+1 }}. {{ log }}</p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button
          v-if="!outdatedInfo.force"
          @click="outdatedShow = false"
        >知道了</el-button>
        <el-button
          type="primary"
          :disabled="downloading"
          @click="download"
        >下载</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog
    v-model="downloadShow"
    width="90%"
    title="下载进度"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :align-center="true"
  >
    <div class="content">
      <el-progress :percentage="downloadingPercent" />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button
          type="primary"
          :disabled="!downloaded"
          @click="install"
        >安装</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>