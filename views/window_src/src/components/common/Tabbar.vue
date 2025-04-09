<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";

import {
  IconHome,
  IconHomeActive,
  IconRecharge,
  IconRechargeActive,
  IconApplication,
  IconApplicationActive,
  IconUser,
  IconUserActive,
} from "@/util/assets";

const router = useRouter();
const store = useStore();
const $t = useI18n().t;

const timestamp = computed(() => store.state.timestamp);

const show = computed(() => {
  if (router.currentRoute.value.meta && router.currentRoute.value.meta.tabbar) {
    return true;
  }
  return false;
});
const current = computed(() => {
  return router?.currentRoute?.value?.name;
});
const bars = computed(() => {
  let homeReaded = true;
  let rechargeReaded = true;
  let applicationReaded = true;
  let userReaded = true;

  let applicationReadAt = new Date(
    localStorage.getItem("APPLICATION_READ_AT") * 1000
  );
  const systemDate = new Date(timestamp.value * 1000);
  applicationReaded =
    applicationReadAt.getFullYear() === systemDate.getFullYear() &&
    applicationReadAt.getMonth() === systemDate.getMonth() &&
    applicationReadAt.getDate() === systemDate.getDate();

  return [
    {
      name: "home",
      icon: IconHome,
      iconActive: IconHomeActive,
      path: "/",
      readed: homeReaded,
    },
    {
      name: "recharge",
      icon: IconRecharge,
      iconActive: IconRechargeActive,
      path: "/recharge",
      readed: rechargeReaded,
    },
    {
      name: "application",
      icon: IconApplication,
      iconActive: IconApplicationActive,
      path: "/application",
      readed: applicationReaded,
    },
    {
      name: "user",
      icon: IconUser,
      iconActive: IconUserActive,
      path: "/user",
      readed: userReaded,
    },
  ];
});
</script>

<template>
  <div class="box" v-if="show">
    <div
      class="tabbar pointer"
      v-for="(bar, i) in bars"
      :key="i"
      v-navigate="bar.path"
    >
      <div v-if="!bar.readed" class="point" />
      <img :src="current == bar.name ? bar.iconActive : bar.icon" />
      <p :class="{ active: current == bar.name }">
        {{ $t(`tabbar_${bar.name}`) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.box {
  border-radius: 1.2rem 1.2rem 0 0;
  height: 4.5rem;
  width: 100%;
  box-sizing: border-box;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tabbar {
  height: 100%;
  width: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  position: relative;
}
.tabbar .point {
  background: #df5136;
  border-radius: 100%;
  width: 0.5rem;
  height: 0.5rem;
  position: absolute;
  left: 80%;
  top: 10%;
  transform: translate(-80%, -10%);
}
.tabbar img {
  height: 1.6rem;
  width: auto;
  color: #3d3d4b;
}
.tabbar p {
  font-size: 0.85rem;
  color: #3d3d4b;
}
.tabbar img.active {
  color: var(--el-color-primary);
}
.tabbar p.active {
  color: var(--el-color-primary);
}
</style>