<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { USER_LEVEL_FREE, USER_LEVEL_VIP, USER_LEVEL_SVIP } from "@/store";
import { ElLoading } from "element-plus";
import { Error } from "@/notification";
import { IconVIP, IconSVIP, IconFresh } from "@/util/assets";
import { ErrorFoo } from "@/util";

const router = useRouter();
const store = useStore();

const userLevel = computed(() => store.state.user_level);
const channelHiddenNodes = computed(() => store.state.channel_hidden_nodes);
const currentNames = computed(() => store.state.proxy_current_names);
const subscribe = computed(() => store.state.proxy_subscribe);
const delaies = computed(() => store.state.proxy_delaies);

const selectedGroup = ref("全部");

const groupName = computed(() => {
  return (group) => {
    switch (group.extra.type) {
      case "free":
        return "免费";
      case "vip":
        return "VIP";
      case "svip":
        return "SVIP";
      default:
        return null;
    }
  };
});

const nodeIcon = computed(() => {
  return (node) => {
    return null;
  };
});

const nodeName = computed(() => {
  return (node) => {
    return node.name;
  };
});

const nodeDelay = computed(() => {
  return (node) => {
    if (!delaies.value) {
      return null;
    }
    console.log(delaies.value);
    return delaies.value[node.url];
  };
});

const nodeStatus = computed(() => {
  return (node) => {
    if (!delaies.value || !(node.url in delaies.value)) {
      return "LOADING";
    }
    if (node.url in delaies.value) {
      const delay = delaies.value[node.url];
      if (delay > 0 && delay < 3000) {
        return "SMOOTH";
      } else {
        return "UNAVAILABLE";
      }
    } else {
      return "LOADING";
    }
  };
});
const nodeStatusName = computed(() => {
  return (node) => {
    const names = {
      LOADING: "测试中",
      SMOOTH: "流畅",
      UNAVAILABLE: "线路不可用",
    };
    return names[nodeStatus.value(node)];
  };
});

const nodeSelected = computed(() => {
  return (group, node) => {
    if (!currentNames.value || currentNames.value.length != 2) {
      return false;
    }
    return (
      group.name == currentNames.value[0] && node.name == currentNames.value[1]
    );
  };
});

const changing = ref(false);
const change = (group, node) => {
  if (changing.value) {
    return;
  }

  changing.value = true;
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });
  window.box_core
    .changeNode([group.name, node.name], true)
    .then(() => {
      setTimeout(() => {
        router.replace("/");
        loading.close();
      }, 300);
    })
    .catch((err) => {
      console.error("change node failed:", err);

      loading.close();

      if (ErrorFoo(err, "core_node_disabled")) {
        switch (group.extra.type) {
          case "free":
            Error("邀请好友获得免费时⻓");
            router.push("/invite");
            break;
          case "vip":
            window.show_recharge_guide("vip");
            break;
          case "svip":
            window.show_recharge_guide("svip");
            break;
          default:
            Error("该线路需充值后使⽤");
            router.push(`/recharge?key=${group.extra.type}`);
            break;
        }
      } else {
        Error(err);
      }

      // if (ErrorFoo(err, 'core_get_node_failed')) {
      //   switch (group.extra.type) {
      //     case 'free':
      //       Error('邀请好友获得免费时⻓')
      //       router.push('/invite')
      //       break
      //     default:
      //       Error('该线路需充值后使⽤')
      //       router.push({
      //         path: '/recharge_full',
      //         query: {
      //           key: group.extra.type,
      //         },
      //       })
      //       break
      //   }
      // } else {
      //   Error(err)
      // }
    })
    .finally(() => {
      changing.value = false;
    });
};

const retestingNodeDelaies = ref({});
const retestingNodeDelay = computed(() => {
  return (node) => {
    return retestingNodeDelaies.value[node.url];
  };
});
const retestNodeDelay = (node) => {
  if (retestingNodeDelaies.value[node.url]) {
    return;
  }
  retestingNodeDelaies.value[node.url] = true;
  window.box_core
    .retestNodeDelay(node.url)
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      setTimeout(() => {
        retestingNodeDelaies.value[node.url] = false;
      }, 1000);
    });
};

onMounted(() => {
  if (channelHiddenNodes.value) {
    router.replace("/");
  }
  switch (userLevel.value) {
    case USER_LEVEL_FREE:
      selectedGroup.value = "free";
      break;
    case USER_LEVEL_VIP:
      selectedGroup.value = "vip";
      break;
    case USER_LEVEL_SVIP:
      selectedGroup.value = "svip";
      break;
    default:
      selectedGroup.value = "vip";
      break;
  }
});
</script>

<template>
  <div class="box">
    <div class="groups">
      <div
        class="group pointer"
        :class="{ active: '全部' == selectedGroup }"
        @click="selectedGroup = '全部'"
      >
        全部
      </div>
      <div
        class="group pointer"
        v-for="(group, i) in subscribe"
        :key="i"
        :class="{ active: group.extra.type == selectedGroup }"
        @click="selectedGroup = group.extra.type"
      >
        {{ groupName(group) }}
      </div>
    </div>
    <div class="group-nodes">
      <template v-for="(group, i) of subscribe" :key="i">
        <div class="group-simple" v-if="selectedGroup == '全部'">
          <p :class="group.extra.type">{{ group.name }}</p>
          <img v-if="group.extra.type == 'vip'" :src="IconVIP" />
          <img v-if="group.extra.type == 'svip'" :src="IconSVIP" />
        </div>

        <template
          v-for="(node, j) of group.children"
          v-if="selectedGroup == '全部' || selectedGroup == group.extra.type"
          :key="j"
        >
          <div
            class="node pointer"
            :class="[
              group.extra.type,
              nodeSelected(group, node) ? 'selected' : 'unselete',
            ]"
            @click="change(group, node)"
          >
            <div class="left">
              <!-- TODO ICON -->
              <p class="country-emoji">{{ nodeName(node) }}</p>
            </div>
            <div class="right">
              <p v-if="nodeDelay(node)">{{ nodeDelay(node) }} ms</p>
              <img
                class="pointer fresh"
                :src="IconFresh"
                :class="{ animation: retestingNodeDelay(node) }"
                @click.stop="retestNodeDelay(node)"
              />
              <!-- <p
                class="status"
                :class="{ danger: nodeStatus(node) === 'UNAVAILABLE' }"
              >
                {{ nodeStatusName(node) }}
              </p> -->
              <!-- <Iconfont
                v-if="nodeSelected(group, node)"
                class="node-selector selected"
                name="radio-selected"
              />
              <Iconfont
                v-else
                class="node-selector unselect"
                name="radio-unselect"
              /> -->
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.box {
  display: flex;
  flex-direction: column;
}
.groups {
  height: 3.6rem;
  border-radius: 3.6rem;
  box-sizing: border-box;
  padding: 1rem;
  background: #2d2d3c;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.group {
  height: 2.6rem;
  flex: 1;
  border-radius: 2.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.group.active {
  background: linear-gradient(0deg, #feb701, #fd7301);
}

.group-nodes {
  box-sizing: border-box;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.group-simple {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
}
.group-simple .vip {
  color: #fe891e;
}
.group-simple .svip {
  color: #feb137;
}
.group-simple img {
  height: 1rem;
  width: auto;
}
.node {
  width: 100%;
  height: 4.6rem;
  box-sizing: border-box;
  padding: 1rem;
  border-radius: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.node {
  color: var(--el-text-color-primary);
  background: #232331;
}
.node.selected {
  border: 1px solid #fd9300;
}
.node .fresh {
  width: 1.6rem;
  height: auto;
}
.node .fresh.animation {
  animation: rotate 2s linear infinite;
}
/* .node.free {
  color: var(--el-text-color-primary);
  background: #232331;
  border: 1px solid #fd9300;
}
.node.vip {
  color: var(--el-text-color-primary);
  background: #4f3f2b;
  border: 1px solid #4f3f2b;
}
.node.svip {
  color: #563300;
  background: #fcd48e;
  border: 1px solid #fcd48e;
} */
.node .left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.node .right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.node .status {
  color: #fff;
}
.node.vip .status {
  color: #fff;
}
.node.svip .status {
  color: #563300;
}
.node .status.danger {
  color: #e50000;
}

.node-selector {
  font-size: 1.8rem;
}
.node-selector.selected {
  background: linear-gradient(0deg, #feb701, #fd7301);
  -webkit-background-clip: text;
  color: transparent;
}
.node-selector.unselect {
  color: #645036;
}
</style>