<script setup>
import { ref, onMounted } from 'vue'
import { ElLoading } from 'element-plus'
import { Error } from '@/notification'
import { $DateTimeFormat } from '@/util'

const histories = ref([])
const loading = ref(false)

const load = () => {
  loading.value = true
  const _loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  window.box_api.inviteHistory().then((data) => {
    histories.value = data
  }).catch(err => {
    Error(err)
  }).finally(() => {
    _loading.close()
    loading.value = false
  })
}

onMounted(() => {
  load()
})
</script>

<template>
  <div>
    <p
      class="no-data"
      v-if="!loading && histories.length == 0"
    >暂无数据</p>
    <div
      class="history"
      v-for="(history, i) in histories"
    >
      <div class="item">
        <p class="key">被邀请人</p>
        <p class="value">{{ history.tel }}</p>
      </div>
      <div class="item">
        <p class="key">绑定时间</p>
        <p class="value">{{ $DateTimeFormat(history.created_at) }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.history {
  box-sizing: border-box;
  padding: 1rem;
  background: #232331;
  border: 2px solid #232331;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>