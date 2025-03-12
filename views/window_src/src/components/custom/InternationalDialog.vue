<script setup>
import { onMounted, ref } from "vue";
import { useStore } from "vuex";

const store = useStore();

const show = ref(false);
const internationalTxt = ref(null);
const internationalUrl = ref(null);

const checkShow = () => {
  if (show.value) {
    return;
  }
  window.box_api
    .getInternationalUrl()
    .then((data) => {
      console.log(data);
      if (data && data?.url && data?.content) {
        internationalUrl.value = data.url;
        internationalTxt.value = data.content;
        show.value = true;
      }
    })
    .catch((err) => {
      console.error("getInternationalUrl failed:", err);
    });
};

const download = () => {
  window.box_system.openURL(internationalUrl.value).catch((err) => {
    console.error("openURL failed:", err);
  });
};

const close = () => {
  show.value = false;
};

onMounted(() => {
  checkShow();

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      checkShow();
    }
  });
});
</script>

<template>
  <el-dialog
    v-model="show"
    width="70%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :align-center="true"
    class="white no-header"
  >
    <div class="content">
      <p class="txt">{{ internationalTxt }}</p>
      <div class="btns">
        <el-button type="primary" @click.stop="download">下载</el-button>
        <el-button type="info" @click.stop="close">知道了</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.content {
  box-sizing: border-box;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
</style>