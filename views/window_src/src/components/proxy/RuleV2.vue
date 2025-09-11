<script setup>
import { ref, computed } from "vue"
import { useStore } from 'vuex'
import { PROXY_RULE_CN, PROXY_RULE_GLOBAL } from '@/store'
import { Error } from '@/notification'
import { ElLoading } from 'element-plus'

const store = useStore()

const show = ref(false)

const rules = ref([PROXY_RULE_CN, PROXY_RULE_GLOBAL])
const rule = computed(() => store.state.proxy_rule)

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
  window.box_core.changeRule(r).catch(err => {
    Error(err)
  }).finally(() => {
    changing.value = false
    setTimeout(() => {
      loading.close()
    }, 300)
  })
}

const refreshingSubscribe = ref(false);
const refreshSubscribe = () => {
  if (refreshingSubscribe.value) {
    return;
  }

  refreshingSubscribe.value = true;
  window.box_api
    .refreshSubscribe()
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      setTimeout(() => {
        refreshingSubscribe.value = false;
      }, 1000);
    });
};
</script>

<template>
  <div class="box pointer">
    <div class="line">
      <p>网络模式</p>
      <el-icon size="1.5rem" class="fresher pointer" :class="{ animation: refreshingSubscribe }"
        @click.stop="refreshSubscribe">
        <Refresh />
      </el-icon>
    </div>
    <div class="line">
      <div class="switcher">
        <div class="selector pointer" :class="{ active: rule === r }" v-for="(r, i) in rules" :key="i"
          @click.stop="change(r)">
          <p class="name">{{ $t(`proxy_rule_${r}`) }}</p>
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