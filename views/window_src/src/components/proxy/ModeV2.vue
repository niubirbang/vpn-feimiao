<script setup>
import { ref, computed } from "vue"
import { useStore } from 'vuex'
import { PROXY_MODE_SYSTEM, PROXY_MODE_TUN } from '@/store'
import { Error } from '@/notification'
import { ElLoading } from 'element-plus'

const store = useStore()

const show = ref(false)

const modes = ref([PROXY_MODE_SYSTEM, PROXY_MODE_TUN])
const mode = computed(() => store.state.proxy_mode)

const changing = ref(false)

const change = (r) => {
  if (changing.value) {
    return
  }

  changing.value = true
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  show.value = false
  window.box_core.changeMode(r).catch(err => {
    Error(err)
  }).finally(() => {
    changing.value = false
    setTimeout(() => {
      loading.close()
    }, 300)
  })
}
</script>

<template>
  <div class="box pointer">
    <div class="line">
      <p>代理模式</p>
    </div>
    <div class="line">
      <div class="switcher">
        <div class="pointer" :class="{ active: mode === r }" v-for="(r, i) in modes" :key="i" @click.stop="change(r)">
          <p class="name">{{ $t(`proxy_mode_${r}`) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.box {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.box .line {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fresher.animation {
  animation: rotate 2s linear infinite;
}

.switcher {
  width: 100%;
  background: #26272B;
  border-radius: 999rem;
  box-sizing: border-box;
  padding: 0.3rem;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.switcher div {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0.8rem 0;
  border-radius: 999rem;
}

.switcher div.active {
  background: linear-gradient(90deg, #FFB20E 0%, #FF7B0B 100%);
}
</style>