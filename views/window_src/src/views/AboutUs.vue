<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { Logo } from "@/util/assets";
import { Success, Error } from "@/notification";
import { ElLoading } from "element-plus";

const router = useRouter();
const store = useStore();
const { locale } = useI18n();

const _name = computed(() => store.state.name);
const name_cn = computed(() => store.state.name_cn);
const name_en = computed(() => store.state.name_en);
const version = computed(() => store.state.version);

const businessEmail = computed(() => store.state.contact_email);
const antiLossEmail = computed(() => store.state.contact_email);
const officialWebsite = computed(() => store.state.website);

const name = computed(() => {
  switch (locale.value) {
    case "en-US":
      return name_en.value;
    case "zh-CN":
      return name_cn.value;
    default:
      return _name.value;
  }
});

const showLog = ref(false);

const goOfficialWebsite = () => {
  window.box_system.openURL(officialWebsite.value);
};
const debug = () => {
  window.box_window.debug();
};

const openLogger = () => {
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });
  window.box_logger
    .open()
    .then(() => {
      showLog.value = false;
    })
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      loading.close();
    });
};
const uploadLogger = () => {
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });
  window.box_logger
    .upload()
    .then(() => {
      showLog.value = false;
    })
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      loading.close();
    });
};
</script>

<template>
  <div>
    <img class="logo" :src="Logo" />
    <p class="primary">{{ name }}</p>
    <p class="primary" v-fiveClick="debug">{{ version }}</p>
    <div class="infos">
      <!-- <div class="info">
        <p>商务合作邮箱：</p>
        <a
          class="primary pointer"
          :href="`mailto:${businessEmail}`"
        >{{ businessEmail }}</a>
        <p>(广告投放及代理合作意向邮箱)</p>
      </div> -->
    </div>
    <div class="infos bottom">
      <div class="info">
        <p>意见反馈：</p>
        <a class="primary pointer" :href="`mailto:${antiLossEmail}`">{{
          antiLossEmail
        }}</a>
        <p>(发送邮件会自动回复最新官网地址)</p>
      </div>
      <div class="info">
        <p>官网地址：</p>
        <p class="primary pointer" @click="goOfficialWebsite">
          {{ officialWebsite }}
        </p>
        <p class="primary">
          <span class="pointer" v-showServicePolicy>《服务协议》</span>
          <span class="pointer" v-showPrivacyPolicy>《隐私政策》</span>
        </p>
        <p>MH SPEED Inc @2023-2025</p>
        <el-button link type="primary" @click="showLog = true"
          >系统日志</el-button
        >
      </div>
    </div>
    <el-dialog v-model="showLog" width="90%" align-center title="系统日志">
      <div class="log">
        <el-button link type="warning" @click="openLogger"
          >打开系统日志目录</el-button
        >
        <el-button link type="primary" @click="uploadLogger"
          >上传日志</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.page {
  padding-top: 4rem;
  padding-bottom: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.primary {
  color: var(--el-color-primary);
}
.bold {
  font-weight: bold;
}
.logo {
  width: 8rem;
  height: auto;
}
.infos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3rem;
}
.infos.bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.log {
  box-sizing: border-box;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
</style>