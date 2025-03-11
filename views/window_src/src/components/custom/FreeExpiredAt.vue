<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { USER_LEVEL_FREE } from '@/store'
import { $DurationTypeB } from '@/util'

const store = useStore()

const timestamp = computed(() => store.state.timestamp)
const level = computed(() => store.state.user_level)
const freeExpiredAt = computed(() => store.state.user_free_expired_at)
// const level = computed(() => USER_LEVEL_FREE)
// const freeExpiredAt = computed(() => 1735660800)
const expired = computed(() => {
  return freeExpiredAt.value <= timestamp.value
})

const show = computed(() => {
  return level.value == USER_LEVEL_FREE && !expired.value
})
const duration = computed(() => {
  const second = freeExpiredAt.value - timestamp.value
  if (second <= 0) {
    return ''
  }
  if (second > 72 * 60 * 60) {
    const day = second / (24 * 60 * 60)
    return `${Math.ceil(day)}天`
  }
  return $DurationTypeB(second)
})
</script>

<template>
  <p
    v-if="show"
    class="free-expired-at"
  >剩余免费时长: {{ duration }}</p>
</template>

<style scoped>
.free-expired-at {
  font-size: 1.1rem;

  display: flex;
  align-items: center;
  justify-content: center;
}
</style>