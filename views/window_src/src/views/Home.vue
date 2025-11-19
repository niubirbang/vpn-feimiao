<script setup>
import Tip from "@/components/custom/Tip.vue";
import Banner from "@/components/custom/Banner.vue";
import FreeExpiredAt from "@/components/custom/FreeExpiredAt.vue";
import ProxySwitchV3 from "@/components/proxy/SwitchV3.vue";
import ProxyCurrent from "@/components/proxy/Current.vue";
import { IconMessage, IconTip } from "@/util/assets";
import { useStore } from "vuex";
import { computed } from "vue";

const store = useStore();

const channelHiddenNodes = computed(() => store.state.channel_hidden_nodes);
</script>

<template>
  <div class="large-full">
    <div class="invite">
      <img src="@/assets/image/invite-btn-bg.png" />
      <p class="pointer" style="z-index: 3;" v-navigate="'/invite'">邀请获取时长</p>
    </div>
    <div class="plate home">
      <!-- 头部 -->
      <div class="header">
        <div class="left">
          <img class="icon pointer" :src="IconMessage" v-showService />
          <img class="icon pointer" :src="IconTip" v-showQuestionAnswer />
        </div>
        <div class="right">
          <el-button class="application2" type="info" round v-navigate="'/application'">
            <div class="application2-inner">
              <img src="@/assets/image/application-btn2.png">
              应用推荐
            </div>
          </el-button>
          <!-- <img class="application pointer" src="@/assets/image/application-btn.png" v-navigate="'/application'" /> -->
        </div>
      </div>
      <Tip />
      <Banner />
      <div class="proxy">
        <ProxySwitchV3 />
        <FreeExpiredAt />
      </div>
    </div>
    <ProxyCurrent />
    <div class="bottom">
      <p class="remark">
        <span v-if="!channelHiddenNodes">网络使用不稳定请尝试手动切换其他线路节点，</span>
        <span>在使用过程中有任何问题请联系</span>
        <span class="pointer" style="color: var(--el-color-primary)" v-showService>在线客服</span>
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
  /* background: rgba(44, 45, 56, 0.52); */
  padding: var(--page-padding);
  padding-top: 0;
  padding-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
}

.invite {
  width: 6rem;
  /* height: auto; */
  position: absolute;
  right: var(--page-padding);
  top: 23rem;
  /* bottom: var(--page-padding); */
}

.invite img {
  z-index: 3;
  width: 100%;
  height: auto;
}

.invite p {
  width: 100%;
  text-align: center;
  position: absolute;
  bottom: 0.6rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
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

.header .application2 {
  --el-border: none;
  --el-button-bg-color: #26272B;
  --el-button-text-color: unset;
  height: 2.5rem;
  width: auto;
}

.header .application2 .application2-inner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.proxy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
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
  line-height: 1.6rem;
}
</style>