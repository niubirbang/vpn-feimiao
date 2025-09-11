<script setup>
import { ref, onMounted } from 'vue'
import { ElLoading } from 'element-plus'
import { Error } from '@/notification'
// import { $DateTimeFormat } from '@/util'

const awards = ref([])
const loading = ref(false)

const load = () => {
  loading.value = true
  const _loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  window.box_api.inviteAward().then((data) => {
    awards.value = data
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
      v-if="!loading && awards.length == 0"
    >暂无数据</p>
    <div
      class="award"
      v-for="(award, i) in awards"
    >
      <div class="item">
        <p class="key">奖励类型</p>
        <p class="value">{{ award.type }}</p>
      </div>
      <div class="item">
        <p class="key">奖励内容</p>
        <p class="value">{{ award.content }}</p>
      </div>
      <div class="item">
        <p class="key">被邀请人</p>
        <p class="value">{{ award.tel }}</p>
      </div>
      <div class="item">
        <p class="key">奖励发放时间</p>
        <p class="value">{{ award.create_time }}</p>
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
.award {
  box-sizing: border-box;
  padding: 1rem;
  background: #26272B;
  border: 2px solid #26272B;
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