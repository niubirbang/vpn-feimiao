<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from "vue-router"
import { useStore } from 'vuex'
import { ElLoading } from 'element-plus'
import { Success, Error } from '@/notification'
import QRCode from 'qrcode'
import useClipboard from 'vue-clipboard3'
import html2canvas from 'html2canvas'
import { TitleLeft, TitleRight } from '@/util/assets'

const router = useRouter()
const store = useStore()

const { toClipboard } = useClipboard()

const authorization_type = computed(() => store.state.authorization_type)
const show_device_dialog = ref(false)

const inviteCode = ref(null)
const inviteURL = ref()
const inviteRules = ref([])
const inviteQRRef = ref(null)
const inviteQRURL = ref(null)

const copyCode = async () => {
  try {
    await toClipboard(inviteCode.value)
    Success('复制成功')
  } catch (err) {
    console.error('clipboard copy failed:', err)
    Error('复制失败')
  }
}

const copyURL = async () => {
  try {
    await toClipboard(inviteURL.value)
    Success('复制成功')
  } catch (err) {
    console.error('clipboard copy failed:', err)
    Error('复制失败')
  }
}

const saveQR = async () => {
  try {
    const canvas = await html2canvas(inviteQRRef.value)
    const image = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = image
    a.download = `我的邀请码.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch (err) {
    console.error('save image failed:', err)
  }
}

const load = () => {
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  window.box_api.inviteInfo().then((data) => {
    inviteCode.value = data.invite_code
    inviteURL.value = data.invite_link
    for (let rule of data.invite_rule.split('\n')) {
      rule = rule.trim()
      if (rule) {
        inviteRules.value.push(rule)
      }
    }
    loadQR()
  }).catch(err => {
    Error(err)
  }).finally(() => {
    show_device_dialog
    loading.close()
  })
}

const loadQR = () => {
  try {
    QRCode.toDataURL(
      inviteURL.value,
      {
        errorCorrectionLevel: 'H',
        margin: 1,
      },
      (err, url) => {
        if (err) {
          console.error('gen qr code failed:', err)
          url = null
        }
        inviteQRURL.value = url
      }
    )
  } catch (err) {
    console.error('gen qr code failed:', err)
  }
}

const go_bind = () => {
  show_device_dialog.value = false
  router.push(`/bind`)
}

onMounted(() => {
  if (authorization_type.value === 'device') {
    show_device_dialog.value = true
  }
  load()
})
</script>

<template>
  <div class="large-full invite-bg">
    <div class="plate">
      <div class="title">
        <img :src="TitleLeft">
        <p>邀请好友,双方均可获得时长奖励</p>
        <img :src="TitleRight">
      </div>
      <div class="content">
        <p
          class="invite-code pointer"
          @click="copyCode"
        >我的邀请码:{{ inviteCode }}</p>
        <p
          class="invite-code-copy pointer"
          @click="copyCode"
        >点击邀请码复制</p>
        <img
          class="invite-qr-code pointer"
          ref="inviteQRRef"
          v-if="inviteQRURL"
          :src="inviteQRURL"
          @click="saveQR"
        >
        <el-button
          class="invite-url-copy"
          type="primary"
          @click="copyURL"
        >复制邀请链接</el-button>
      </div>
    </div>
    <div class="plate">
      <div class="title">
        <img :src="TitleLeft">
        <p>奖励规则</p>
        <img :src="TitleRight">
      </div>
      <div class="content">
        <div class="invite-rule">
          <p v-for="(rule, i) in inviteRules">{{ rule }}</p>
        </div>
      </div>
    </div>
    <el-dialog
      class="device-dialog white"
      width="70%"
      v-model="show_device_dialog"
      :show-close="false"
      :align-center="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="content">
        <img
          class="close-img pointer"
          src="@/assets/image/icon-close.png"
          @click="show_device_dialog = false"
        >
        <p class="title">温馨提示</p>
        <p class="text">邀请奖励需绑定手机号或邮箱后邀请好友获得</p>
        <el-button
          v-if="authorization_type === 'device'"
          type="primary"
          round
          @click="go_bind"
        >立即绑定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.page {
  color: #000;
  box-sizing: border-box;
  padding: 15rem 1rem 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.plate {
  width: 100%;
  box-sizing: border-box;
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.plate .title {
  color: #9f350e;
  font-weight: bold;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
}
.plate .title img {
  height: 1rem;
  width: auto;
}
.plate .content {
  box-sizing: border-box;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.invite-code {
  box-sizing: border-box;
  padding: 0.8rem 1rem;
  background: #fff0e7;
  border-radius: 1.5rem;
  color: #ff4351;
}
.invite-code-copy {
  color: #ff4351;
}
.invite-qr-code {
  width: 8.6rem;
  height: 8.6rem;
}
.invite-url-copy {
  width: 80%;
  height: 3.5rem;
  border-radius: 3.5rem;
}
.invite-rule {
  font-size: 0.92rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.device-dialog .content {
  box-sizing: border-box;
  padding: 0 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}
.device-dialog .content .icon-success {
  height: 3rem;
  width: 3rem;
}
.device-dialog .content .title {
  font-size: 1.2rem;
  font-weight: bold;
}
.device-dialog .content .text {
  font-size: 1rem;
}
.device-dialog .content .el-button {
  width: 100%;
}
.device-dialog .content .close-img {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -4rem;
  height: 2rem;
}
</style>