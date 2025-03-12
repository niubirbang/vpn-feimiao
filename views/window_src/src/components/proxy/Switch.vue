<script setup>
import { ref, computed } from 'vue'
import { useRouter } from "vue-router"
import { useStore } from 'vuex'
import { PROXY_STATUS_OFF, PROXY_STATUS_ON } from '@/store'
import { OnIcon, OffIcon } from '@/util/assets'
import { Error } from '@/notification'
import { ElLoading } from 'element-plus'
import { ErrorFoo } from '@/util'

const router = useRouter()
const store = useStore()

const authorized = computed(() => store.state.authorized)
const status = computed(() => store.state.proxy_status)
const current_node = computed(() => store.state.proxy_current_node)
const current_node_status = computed(() => store.state.proxy_current_node_status)
const statusIcon = computed(() => {
  switch (status.value) {
    case PROXY_STATUS_OFF:
      return OffIcon
    case PROXY_STATUS_ON:
      return OnIcon
  }
})

const changing = ref(false)
const beforeStatus = ref(null)

const changeStatus = () => {
  if (changing.value) {
    return
  }
  if (!authorized.value) {
    router.push('/login')
    return
  }

  let do_func = null
  switch (status.value) {
    case PROXY_STATUS_OFF:
      do_func = window.box_core.start
      break
    case PROXY_STATUS_ON:
      do_func = window.box_core.close
      break
  }
  if (!do_func) {
    return
  }

  beforeStatus.value = status.value
  changing.value = true
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })

  do_func().then(() => {
    setTimeout(() => {
      loading.close()
    }, 300)
  }).catch(err => {
    console.error('switch failed:', err)

    loading.close()

    if (ErrorFoo(err, 'core_no_usable') || ErrorFoo(err, 'core_current_node_empty') || ErrorFoo(err, 'core_current_node_disabled')) {
      window.show_recharge_guide()
    } else {
      Error(err)
    }
  }).finally(() => {
    beforeStatus.value = null
    changing.value = false
  })

  // do_func().catch(err => {
  //   console.error('switch failed:', err)
  //   Error(err)
  // }).finally(() => {
  //   beforeStatus.value = null
  //   changing.value = false
  //   setTimeout(() => {
  //     loading.close()
  //   }, 300)
  // })
}

const err_is_core_expired_at_is_empty = (err) => {
  if (err.startsWith('Error:')) {
    err = err.replace('Error:', '')
  }
  err = err.trim()
  return err.startsWith('core_expired_at_is_empty')
}
</script>

<template>
  <img
    class="switch pointer"
    :src="statusIcon"
    @click="changeStatus"
  >
</template>

<style scoped>
.switch {
  width: 12rem;
  height: auto;
}
</style>