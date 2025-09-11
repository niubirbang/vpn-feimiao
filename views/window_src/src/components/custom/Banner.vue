<script setup>
import { onMounted, ref } from "vue";

const banners = ref([]);
const load = () => {
  window.box_api
    .listBanner()
    .then((data) => {
      console.log('****banner', data)
      banners.value = data;
    })
    .catch((err) => {
      console.error("list banner failed:", err);
    });
};

const openURL = (url) => {
  window.box_system.openURL(url).catch((err) => {
    console.error("banner openURL failed:", err);
  });
};

onMounted(() => {
  load();
});
</script>

<template>
  <el-carousel
    v-if="banners.length > 0"
    class="banner"
    indicator-position="none"
    :interval="5000"
  >
    <el-carousel-item v-for="(banner, i) in banners" :key="i">
      <el-image
        class="img pointer"
        :src="banner.banner_url"
        fit="cover"
        @click.stop="openURL(banner.link)"
      />
    </el-carousel-item>
  </el-carousel>
</template>

<style scoped>
.banner {
  height: 6rem;
  border-radius: 0.5rem;
}
.img {
  width: 100%;
}
</style>