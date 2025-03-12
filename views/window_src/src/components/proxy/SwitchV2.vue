<script setup>
import { ref, computed } from 'vue'
import { useRouter } from "vue-router"
import { useStore } from 'vuex'
import { PROXY_STATUS_OFF, PROXY_STATUS_ON } from '@/store'
import { Error } from '@/notification'
import { ElLoading } from 'element-plus'
import { ErrorFoo } from '@/util'

import OffIcon from '@/assets/image/proxy-switch-off.png'
import OnIcon from '@/assets/image/proxy-switch-on.png'

const router = useRouter()
const store = useStore()

const authorized = computed(() => store.state.authorized)
const status = computed(() => store.state.proxy_status)
const current_node = computed(() => store.state.proxy_current_node)
const current_node_status = computed(() => store.state.proxy_current_node_status)

const changing_type = ref(null)

const switch_txt = computed(() => {
  switch (changing_type.value) {
    case 'change_to_on':
      return '正在连接中'
    case 'change_to_off':
      return '断开连接中'
    case 'on':
      return '已连接'
    case 'off':
      return '未连接'
    default:
      switch (status.value) {
        case 'on':
          return '已连接'
        case 'off':
          return '未连接'
        default:
          return ''
      }
  }
})

const status_class = computed(() => {
  if (changing_type.value) {
    return changing_type.value
  } else {
    return status.value
  }
})

const status_icon = computed(() => {
  switch (changing_type.value) {
    case 'change_to_on':
      return OffIcon
    case 'change_to_off':
      return OnIcon
    case 'on':
      return OnIcon
    case 'off':
      return OffIcon
    default:
      switch (status.value) {
        case 'on':
          return OnIcon
        case 'off':
          return OffIcon
        default:
          return null
      }
  }
})


const changeStatus = () => {
  if (changing_type.value) {
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
      changing_type.value = 'change_to_on'
      break
    case PROXY_STATUS_ON:
      do_func = window.box_core.close
      changing_type.value = 'change_to_off'
      break
    default:
      return
  }

  do_func().catch(err => {
    console.error('switch failed:', err)
    if (ErrorFoo(err, 'core_no_usable') || ErrorFoo(err, 'core_current_node_empty') || ErrorFoo(err, 'core_current_node_disabled')) {
      window.show_recharge_guide()
    } else {
      Error(err)
    }
  }).finally(() => {
    setTimeout(() => {
      changing_type.value = null
    }, 800)
  })
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

  <div class="switch">
    <p
      class="proxy-status"
      :class="status_class"
    >{{ switch_txt }}</p>
    <div
      class="proxy-switch pointer"
      :class="status_class"
      @click="changeStatus"
    >
      <div class="doing-1"></div>
      <div class="doing-2"></div>
      <div class="inner-1">
        <div class="inner-2">
          <div class="inner-3">
            <img :src="status_icon">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.switch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}
.proxy-status {
  box-sizing: border-box;
  padding: 0.7rem 1rem;
  background: #1b1b27;
  border-radius: 999rem;
  display: flex;
  align-items: center;
}
.proxy-status.off::before,
.proxy-status.change_to_on::before {
  content: "";
  width: 0.5rem;
  height: 0.5rem;
  background: #ff2724;
  border-radius: 50%;
  margin-right: 0.5rem;
}
.proxy-status.on::before,
.proxy-status.change_to_off::before {
  content: "";
  width: 0.5rem;
  height: 0.5rem;
  background: #0fd405;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.proxy-switch {
  width: 12rem;
  height: 12rem;
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
}
.proxy-switch .doing-1 {
  z-index: 1;

  display: none;

  height: 12rem;
  width: 12rem;
  position: absolute;

  border: 0.2rem solid var(--el-color-primary);
  border-top: 0.2rem solid rgba(0, 0, 0, 0);
  border-radius: 50%;

  animation: Rotation 1s linear infinite;
}
@keyframes Rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.proxy-switch .doing-2 {
  z-index: 3;

  display: none;

  width: 20%;
  height: 20%;
  position: absolute;

  background-color: rgba(237, 144, 57, 0.5);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: Diffusion 2s ease-out infinite;
}
@keyframes Diffusion {
  0% {
    width: 20%;
    height: 20%;
    opacity: 1;
  }
  100% {
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}

.proxy-switch .inner-1 {
  z-index: 2;

  width: 100%;
  height: 100%;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
}
.proxy-switch .inner-2 {
  width: 80%;
  height: 80%;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
}
.proxy-switch .inner-3 {
  width: 75%;
  height: 75%;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
}

.proxy-switch.off .inner-1 {
  background: #2c2c39;
}
.proxy-switch.off .inner-2 {
  background: #1a1a26;
}
.proxy-switch.off .inner-3 {
  background: #292937;
}

.proxy-switch.on .inner-1 {
  background: #4d3f2c;
}
.proxy-switch.on .inner-2 {
  background: #f58d2e;
}
.proxy-switch.on .inner-3 {
  background: #fef9f2;
}

.proxy-switch.change_to_on .doing-1 {
  display: unset;
}
.proxy-switch.change_to_on .inner-1 {
  background: #2c2c39;
}
.proxy-switch.change_to_on .inner-2 {
  background: #1a1a26;
}
.proxy-switch.change_to_on .inner-3 {
  background: #292937;
}

.proxy-switch.change_to_off .doing-1 {
  display: unset;
}
.proxy-switch.change_to_off .inner-1 {
  background: #4d3f2c;
}
.proxy-switch.change_to_off .inner-2 {
  background: #f58d2e;
}
.proxy-switch.change_to_off .inner-3 {
  background: #fef9f2;
}

.proxy-switch.on .doing-2 {
  display: unset;
}
</style>