<script setup>
import Tip from "@/components/custom/Tip.vue";
import Banner from "@/components/custom/Banner.vue";
import FreeExpiredAt from "@/components/custom/FreeExpiredAt.vue";
import ProxySwitchV2 from "@/components/proxy/SwitchV2.vue";
import ProxyCurrent from "@/components/proxy/Current.vue";
import { IconMessage, IconTip } from "@/util/assets";
import { useStore } from "vuex";
import { computed } from "vue";

const store = useStore();

const channelHiddenNodes = computed(() => store.state.channel_hidden_nodes);
</script>

<template>
  <div class="large-full home-bg">
    <div class="plate home">
      <img
        class="invite pointer"
        src="@/assets/image/invite-btn.png"
        v-navigate="'/invite'"
      />
      <!-- 头部 -->
      <div class="header">
        <div class="left">
          <img class="icon pointer" :src="IconMessage" v-showService />
          <img class="icon pointer" :src="IconTip" v-showQuestionAnswer />
        </div>
        <div class="right">
          <img
            class="application pointer"
            src="@/assets/image/application-btn.png"
            v-navigate="'/application'"
          />
        </div>
      </div>
      <Tip />
      <Banner />
      <div class="proxy">
        <ProxySwitchV2 />
      </div>
    </div>
    <ProxyCurrent />
    <div class="bottom">
      <FreeExpiredAt />
      <p class="remark">
        <span v-if="!channelHiddenNodes"
          >网络使用不稳定请尝试手动切换其他线路节点，</span
        >
        <span>在使用过程中有任何问题请联系</span>
        <span
          class="pointer"
          style="color: var(--el-color-primary)"
          v-showService
          >在线客服</span
        >
        <span>。</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.plate {
  border-radius: 0 0 1.5rem 1.5rem;
  background: rgba(44, 45, 56, 0.52);
  padding: var(--page-padding);
  padding-top: 0;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
}
.invite {
  width: 4rem;
  height: auto;
  position: absolute;
  right: var(--page-padding);
  bottom: var(--page-padding);
}
.header {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header .left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.header .right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.header .icon {
  height: 1.5rem;
  width: auto;
}
.header .application {
  height: 2.5rem;
  width: auto;
}
.proxy {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bottom {
  box-sizing: border-box;
  margin-top: auto;
  padding: var(--page-padding);
  padding-bottom: 2rem;

  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.remark {
  text-align: center;
  font-size: 1.1rem;
  line-height: 1.1rem;
}
</style>