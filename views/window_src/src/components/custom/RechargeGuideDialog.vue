<script setup>
import { computed, ref } from 'vue'
import { useRouter } from "vue-router"
import { useStore } from 'vuex'
import { USER_LEVEL_VIP, USER_LEVEL_SVIP } from '@/store'

const router = useRouter()
const store = useStore()

const show = defineModel('show', {
  default: false,
})

const type = defineModel('type', {
  default: null,
})

const text = computed(() => {
  switch (type.value) {
    case 'vip':
      return '您当前还不是vip请先开通vip'
    case 'svip':
      return '您当前还不是svip请先开通svip'
    default:
      return '您当前还不是vip请先开通vip'
  }
})

const go_recharge = () => {
  show.value = false
  router.push(`/recharge?key=${type.value}`)
}

</script>

<template>
  <el-dialog
    v-model="show"
    width="70%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :align-center="true"
    class="white no-header"
  >
    <div class="content">
      <img
        class="guide-img"
        src="@/assets/image/recharge-guide.png"
      >
      <img
        class="close-img pointer"
        src="@/assets/image/icon-close.png"
        @click="show = false"
      >
      <p class="title">温馨提示</p>
      <p class="text">
        {{ text }}
      </p>
      <el-button
        type="primary"
        round
        @click="go_recharge"
      >立即开通</el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
.content {
  box-sizing: border-box;
  padding: 0 1rem;
  height: 12rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}
.content .title {
  font-size: 1.4rem;
  color: var(--el-color-primary);
}
.content .text {
  font-size: 1.1rem;
}
.content .el-button {
  height: 3rem;
}

.content .guide-img {
  position: absolute;
  right: 0;
  top: -5rem;
  height: 8rem;
}

.content .close-img {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -4rem;
  height: 2rem;
}
</style>