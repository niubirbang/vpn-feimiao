<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { PROXY_STATUS_OFF, PROXY_STATUS_ON } from "@/store";
import { Error } from "@/notification";
import { ElLoading } from "element-plus";
import { ErrorFoo } from "@/util";

import OffIcon from "@/assets/image/proxy-switch-off.png";
import OnIcon from "@/assets/image/proxy-switch-on.png";

const router = useRouter();
const store = useStore();

const authorized = computed(() => store.state.authorized);
const status = computed(() => store.state.proxy_status);
const current_node = computed(() => store.state.proxy_current_node);
const current_node_status = computed(
  () => store.state.proxy_current_node_status
);

const changing_type = ref(null);

const switch_txt = computed(() => {
  switch (changing_type.value) {
    case "change_to_on":
      return "正在连接中";
    case "change_to_off":
      return "断开连接中";
    case "on":
      return "已连接";
    case "off":
      return "未连接";
    default:
      switch (status.value) {
        case "on":
          return "已连接";
        case "off":
          return "未连接";
        default:
          return "";
      }
  }
});

const status_class = computed(() => {
  if (changing_type.value) {
    return changing_type.value;
  } else {
    return status.value;
  }
});

const status_icon = computed(() => {
  switch (changing_type.value) {
    case "change_to_on":
      return OffIcon;
    case "change_to_off":
      return OnIcon;
    case "on":
      return OnIcon;
    case "off":
      return OffIcon;
    default:
      switch (status.value) {
        case "on":
          return OnIcon;
        case "off":
          return OffIcon;
        default:
          return null;
      }
  }
});

const changeStatus = () => {
  if (changing_type.value) {
    return;
  }
  if (!authorized.value) {
    router.push("/login");
    return;
  }

  let do_func = null;
  switch (status.value) {
    case PROXY_STATUS_OFF:
      do_func = window.box_core.start;
      changing_type.value = "change_to_on";
      break;
    case PROXY_STATUS_ON:
      do_func = window.box_core.close;
      changing_type.value = "change_to_off";
      break;
    default:
      return;
  }

  do_func()
    .catch((err) => {
      console.error("switch failed:", err);
      if (
        ErrorFoo(err, "core_no_usable") ||
        ErrorFoo(err, "core_current_node_empty") ||
        ErrorFoo(err, "core_current_node_disabled")
      ) {
        window.show_recharge_guide();
      } else {
        Error(err);
      }
    })
    .finally(() => {
      setTimeout(() => {
        changing_type.value = null;
      }, 800);
    });
};

const err_is_core_expired_at_is_empty = (err) => {
  if (err.startsWith("Error:")) {
    err = err.replace("Error:", "");
  }
  err = err.trim();
  return err.startsWith("core_expired_at_is_empty");
};
</script>

<template>
  <div class="switch">
    <div class="switcher pointer" @click="changeStatus"></div>
    <img :src="status_icon" class="switch" />
    <p class="proxy-status" :class="status_class">{{ switch_txt }}</p>
  </div>
</template>

<style scoped>
.switch {
  position: relative;
  width: 20rem;
  height: 20rem;
}

.switch .switcher {
  position: absolute;
  width: 13rem;
  height: 13rem;
  border-radius: 100%;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  /* background: red; */
  z-index: 2;
}

.switch img {
  height: 100%;
  width: 100%;
}

.proxy-status {
  position: absolute;
  top: 12rem;
  left: 50%;
  transform: translateX(-50%);
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
  margin-right: 0.3rem;
}

.proxy-status.on::before,
.proxy-status.change_to_off::before {
  content: "";
  width: 0.5rem;
  height: 0.5rem;
  background: #0fd405;
  border-radius: 50%;
  margin-right: 0.3rem;
}
</style>