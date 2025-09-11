<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const channelHiddenNodes = computed(() => store.state.channel_hidden_nodes);
const currentNode = computed(() => store.state.proxy_current_node);
const delaies = computed(() => store.state.proxy_delaies);

const currentNodeIcon = computed(() => {
  return null;
});
const currentNodeName = computed(() => {
  if (!currentNode.value) {
    return "暂未匹配节点";
  }
  return currentNode.value.name;
});
const currentNodeStatus = computed(() => {
  if (!delaies.value || !(currentNode.value.url in delaies.value)) {
    return "LOADING";
  }
  if (currentNode.value.url in delaies.value) {
    const delay = delaies.value[currentNode.value.url];
    if (delay > 0 && delay < 3000) {
      return "SMOOTH";
    } else {
      return "UNAVAILABLE";
    }
  } else {
    return "LOADING";
  }
});
</script>

<template>
  <div v-if="!channelHiddenNodes" class="box pointer" v-navigate="'/node'">
    <div class="current-proxy">
      <!-- TODO ICON -->
      <div class="left">
        <p class="title">选择线路</p>
        <p class="node country-emoji">{{ currentNodeName }}</p>
      </div>
      <div class="right">
        <!-- <p class="status" v-if="currentNodeStatus === 'LOADING'">测试中</p>
        <p class="status" v-if="currentNodeStatus === 'SMOOTH'">流畅</p>
        <p class="status danger" v-if="currentNodeStatus === 'UNAVAILABLE'">线路不可用</p> -->
        <el-icon color="var(--el-color-info)">
          <ArrowRight />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<style scoped>
.box {
  box-sizing: border-box;
  margin: var(--page-padding);
  padding: 1.5rem;
  background: #26272B;
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  /* border: 1px solid #fa8a25; */
}
.box .title {
  font-size: 1rem;
  color: var(--el-color-info);
}
.current-proxy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 1.2rem;
}
.current-proxy .left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 1rem;
}
.current-proxy .right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}
.current-proxy .status {
  font-size: 1rem;
}
.current-proxy .status.danger {
  color: #e50000;
}
</style>