<script setup>
import Rule from "@/components/proxy/RuleV2.vue";
import Mode from "@/components/proxy/ModeV2.vue";
import Node from "@/components/proxy/Node.vue";
import { $OS } from "@/util";
import { Error } from "@/notification";
import { IconFresh } from "@/util/assets";

import { ref } from "vue";
const os = ref($OS());

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
  <div>
    <!-- <div class="fresher">
      <img
        class="pointer"
        :src="IconFresh"
        :class="{ animation: refreshingSubscribe }"
        @click="refreshSubscribe"
      />
    </div> -->
    <div class="proxy">
      <Rule />
      <Mode v-if="os == 'windows'" />
    </div>
    <div class="nodes">
      <p class="title">节点</p>
      <Node />
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
}

.page .fresher {
  width: 100%;
  box-sizing: border-box;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.page .fresher img {
  width: 1.6rem;
  height: auto;
}

.page .fresher img.animation {
  animation: rotate 2s linear infinite;
}

.proxy {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.nodes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>