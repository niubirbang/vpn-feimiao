<script setup>
import { ref, computed } from "vue"
import { useStore } from 'vuex'
import { PROXY_RULE_CN, PROXY_RULE_GLOBAL } from '@/store'
import { Error } from '@/notification'
import { ElLoading } from 'element-plus'

const store = useStore()

const show = defineModel('show', {
  default: false,
})
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
  window.box_core.changeRule(r).then(() => {
    show.value = false
  }).catch(err => {
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
  <el-dialog
    v-model="show"
    title="请选择网络模式"
    :align-center="true"
    width="90%"
  >
    <div class="dialog">
      <div
        class="selector pointer"
        v-for="(r, i) in rules"
        :key="i"
        @click="change(r)"
      >
        <div class="left">
          <Iconfont :name="`rule-${r}`" />
          <div class="content">
            <p class="name">{{ $t(`proxy_rule_${r}`) }}</p>
            <p class="info">{{ $t(`proxy_rule_${r}_remark`) }}</p>
          </div>
        </div>
        <div class="right">
          <Iconfont
            class="radio"
            :class="rule == r ? 'selected' : 'unselect'"
            :name="rule == r ? 'radio-selected' : 'radio-unselect'"
          />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.dialog {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.selector {
  color: #fff;
  background: #2d2d3c;
  border-radius: 1rem;
  width: 100%;
  height: 5rem;
  box-sizing: border-box;
  padding: 0 1rem;
  display: flex;
  align-items: center;
}
.selector .left {
  width: 90%;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.selector .left .icon {
  font-size: 2rem;
}
.selector .left .content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.selector .left .content .name {
  color: #efd29e;
  font-size: 1.2rem;
}
.selector .left .content .info {
  font-size: 0.9rem;
}
.selector .right {
  margin-left: auto;
  display: flex;
  align-items: center;
}
.selector .right .van-icon {
  font-size: 1.5rem;
}
.selector .right .icon {
  font-size: 1.5rem;
}
.selected {
  color: #ffb111;
}
.unselect {
  color: #d1ab68;
}
</style>