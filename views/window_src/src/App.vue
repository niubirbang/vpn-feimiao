<script setup>
import { watch, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import Navbar from "@/components/common/Navbar.vue";
import Tabbar from "@/components/common/Tabbar.vue";
import Service from "@/components/common/Service.vue";
import AuthorizationListener from "@/components/common/AuthorizationListener.vue";
import Updater from "@/components/common/UpdaterV2.vue";
import ExpiredListener from "@/components/proxy/ExpiredListener.vue";
import RechargeGuideDialog from "@/components/custom/RechargeGuideDialog.vue";
import InternationalDialog from "@/components/custom/InternationalDialog.vue";

const router = useRouter();
const store = useStore();

const authorizationLoaded = computed(() => store.state.authorization_loaded);

const visibility_change = () => {
  if (document.hidden) {
    // console.info(`-----window change to hidden-----`)
  } else {
    // console.info(`-----window change to visibility-----`)
  }
};

const recharge_guide_dialog = ref(false);
const recharge_guide_dialog_type = ref(null);
window.show_recharge_guide = (type) => {
  recharge_guide_dialog.value = true;
  recharge_guide_dialog_type.value = type;
};

const service_show = ref(false);
window.show_service = () => {
  service_show.value = true;
};

window.router = router;
window.store = store;

window.box_window.listenFocus(() => {
  console.info("window focus");
  check_fresh_user();
});

let freshing_user = false;
let last_fresh_user_time = null;
const check_fresh_user = () => {
  if (freshing_user) {
    return;
  }

  if (
    last_fresh_user_time == null ||
    new Date() - last_fresh_user_time > 60000
  ) {
    freshing_user = true;
    window.box_api
      .freshUser()
      .then(() => {
        last_fresh_user_time = new Date();
      })
      .catch((err) => {
        console.error("focus fresh user failed:", err);
      })
      .finally(() => {
        freshing_user = false;
      });
  }
};

onMounted(() => {
  router.push("/");
  document.addEventListener("visibilitychange", visibility_change);

  window._go = (path) => {
    router.push(path);
  };
});
</script>

<template>
  <el-container
    id="container"
    v-loading="!authorizationLoaded"
    element-loading-text="初始化..."
  >
    <el-header id="navbar">
      <Navbar />
    </el-header>
    <el-main class="outer-main">
      <RouterView class="page" v-slot="{ Component }">
        <transition name="fade">
          <component :is="Component" />
        </transition>
      </RouterView>
    </el-main>
    <el-footer id="tabbar">
      <Tabbar />
    </el-footer>
    <Service v-model:show="service_show" />
    <AuthorizationListener />
    <Updater />
    <ExpiredListener />
    <RechargeGuideDialog
      v-model:show="recharge_guide_dialog"
      v-model:type="recharge_guide_dialog_type"
    />
    <InternationalDialog />
  </el-container>
</template>

<style scoped>
.outer-main {
  padding: 0;
}
.fade-enter-active {
  transition: opacity 0.2s ease;
}
.fade-leave-active {
  transition: opacity 0s ease;
}
.fade-enter-from {
  opacity: 0;
}
.fade-leave-to {
  opacity: 0;
}
</style>