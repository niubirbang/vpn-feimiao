<script setup>
import { ref, onBeforeMount, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

const route = useRoute();
const store = useStore();
const mywebview = ref(null);

const loadURL = (url) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  console.info("application use url:", store.state.third_application_url);
  if (mywebview) {
    mywebview.value.partition = `${year}-${month}-${day}-${hour}`;
    mywebview.value.src = url;
  }
};

onMounted(() => {
  const currentTimestampMs = Date.now();
  const currentTimestampSeconds = Math.floor(currentTimestampMs / 1000);
  localStorage.setItem("APPLICATION_READ_AT", currentTimestampSeconds);
  loadURL(store.state.third_application_url);
});
</script>

<template>
  <div class="full">
    <div class="webview">
      <webview ref="mywebview" class="webview-page" allowpopups />
    </div>
  </div>
</template>


<style scoped>
.webview ::-webkit-scrollbar {
  width: 0;
}

.webview ::-webkit-scrollbar-thumb {
  background-color: var(--el-color-info-light-8);
  border-radius: 10px;
  transition: all 0.2s ease-in-out;
}

.webview ::-webkit-scrollbar-track {
  border-radius: 10px;
}

.webview *:has(.page.el-fade-in-leave-active)::-webkit-scrollbar {
  display: none !important;
}

.webview *:has(.page.el-fade-in-enter-active)::-webkit-scrollbar {
  display: none !important;
}
</style>