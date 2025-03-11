<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
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
const $t = useI18n().t;

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
  return [
    {
      name: "home",
      icon: IconHome,
      iconActive: IconHomeActive,
      path: "/",
    },
    {
      name: "recharge",
      icon: IconRecharge,
      iconActive: IconRechargeActive,
      path: "/recharge",
    },
    {
      name: "application",
      icon: IconApplication,
      iconActive: IconApplicationActive,
      path: "/application",
    },
    {
      name: "user",
      icon: IconUser,
      iconActive: IconUserActive,
      path: "/user",
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