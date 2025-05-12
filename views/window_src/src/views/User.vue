<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from "vue-router"
import { useStore } from 'vuex'
import { ElLoading } from 'element-plus'
import { Error } from '@/notification'
import { USER_LEVEL_FREE, USER_LEVEL_VIP, USER_LEVEL_SVIP } from '@/store'
import { $DateFormat, $DateTimeFormat } from '@/util'
import { ShowService, ShowServicePolicy, ShowPrivacyPolicy, ShowTelegram, Confirm } from '@/util/directives'
import { IconBind, IconService, IconInvite, IconBindInvite, IconServicePolicy, IconPrivacyPolicy,IconTelegram,  IconAboutUs, IconClose, IconFresh, IconOption, Avatar, UserFree } from '@/util/assets'

const router = useRouter()
const store = useStore()

const authorization_type = computed(() => store.state.authorization_type)
const user_id = computed(() => store.state.user_id)
const nickname = computed(() => store.state.user_nickname)
const level = computed(() => store.state.user_level)
const timestamp = computed(() => store.state.timestamp)
const freeExpiredAt = computed(() => store.state.user_free_expired_at)
const vipExpiredAt = computed(() => store.state.user_vip_expired_at)
const svipExpiredAt = computed(() => store.state.user_svip_expired_at)
const freeExpired = computed(() => freeExpiredAt.value < timestamp.value)
const vipExpired = computed(() => vipExpiredAt.value < timestamp.value)
const svipExpired = computed(() => svipExpiredAt.value < timestamp.value)

const expireTxt = computed(() => {
  return (_level) => {
    switch (_level) {
      case USER_LEVEL_VIP:
        if (vipExpired.value) {
          return '开通享专属特权'
        } else {
          return `有效期至${$DateFormat(vipExpiredAt.value)}`
        }
      case USER_LEVEL_SVIP:
        if (svipExpired.value) {
          return '开通享专属特权'
        } else {
          return `有效期至${$DateFormat(svipExpiredAt.value)}`
        }
    }
    return ''
  }
})
const freeExpireTxt = computed(() => {
  return $DateTimeFormat(freeExpiredAt.value, 'YYYY/MM/DD HH:mm')
})

const options = computed(() => {
  return [
    {
      name: '绑定手机号/邮箱',
      icon: IconBind,
      hide: authorization_type.value !== 'device',
      do: () => {
        router.push('/bind')
      },
    },
    {
      name: '联系客服',
      icon: IconService,
      do: () => {
        ShowService()
      },
    },
    {
      name: '邀请好友',
      icon: IconInvite,
      do: () => {
        router.push('/invite')
      },
    },
    {
      name: '邀请绑定',
      icon: IconBindInvite,
      do: () => {
        router.push('/bind_invite')
      },
    },
    {
      name: '防丢入口',
      icon: IconTelegram,
      do: () => {
        ShowTelegram()
      },
    },
    {
      name: '服务协议',
      icon: IconServicePolicy,
      do: () => {
        ShowServicePolicy()
      },
    },
    {
      name: '隐私政策',
      icon: IconPrivacyPolicy,
      do: () => {
        ShowPrivacyPolicy()
      },
    },
    {
      name: '关于我们',
      icon: IconAboutUs,
      do: () => {
        router.push('/about_us')
      },
    },
    {
      name: '注销账号',
      icon: IconClose,
      hide: authorization_type.value === 'device',
      do: () => {
        router.push('/delete_account')
      },
    },
  ]
})

const logout = () => {
  Confirm({
    message: '确认退出登录？', confirmDo: () => {
      const loading = ElLoading.service({
        lock: true,
        background: 'rgba(0, 0, 0, 0.7)',
      })
      window.box_api.logout().then(() => {
        router.replace('/login')
      }).catch(err => {
        Error(err)
      }).finally(() => {
        loading.close()
      })
    }
  })
}

const freshingUser = ref(false)
const freshUser = () => {
  if (freshingUser.value) {
    return
  }

  freshingUser.value = true
  window.box_api.freshUser().catch(err => {
    Error(err)
  }).finally(() => {
    setTimeout(() => {
      freshingUser.value = false
    }, 1000)
  })
}
onMounted(() => {
  freshUser()
})
</script>

<template>
  <div>
    <div class="base">
      <img
        class="avatar"
        :src="Avatar"
      >
      <div class="left">
        <p class="user-name">ID: {{ user_id }}</p>
        <p
          class="user-name pointer"
          v-if="authorization_type === 'device'"
          v-navigate="'/bind'"
        >未绑定手机号/邮箱</p>
        <p
          class="user-name"
          v-if="authorization_type === 'user'"
        >{{ nickname }}</p>
        <div
          class="free"
          v-if="level == USER_LEVEL_FREE"
        >
          <img
            class="user-level-icon"
            :src="UserFree"
          >
          <p>{{ freeExpireTxt }}</p>
        </div>
      </div>
      <img
        class="fresh pointer"
        :src="IconFresh"
        :class="{ animation: freshingUser }"
        @click="freshUser"
      >
    </div>
    <div class="user-level">
      <div
        class="item pointer vip"
        :class="{ active : !vipExpired }"
        v-navigate="'/recharge_full?key=vip'"
      >
        <div class="name">
          <p>VIP会员</p>
          <el-icon size="1.2rem">
            <ArrowRight />
          </el-icon>
        </div>
        <div class="expired-at">{{ expireTxt(USER_LEVEL_VIP) }}</div>
      </div>
      <div
        class="item pointer svip"
        :class="{ active : !svipExpired }"
        v-navigate="'/recharge_full?key=svip'"
      >
        <div class="name">
          <p>SVIP会员</p>
          <el-icon size="1.2rem">
            <ArrowRight />
          </el-icon>
        </div>
        <div class="expired-at">{{ expireTxt(USER_LEVEL_SVIP) }}</div>
      </div>
    </div>
    <div class="options">
      <template
        v-for="(option, i) of options"
        :key="i"
      >
        <div
          class="option pointer"
          v-if="!option?.hide"
          @click="option.do"
        >
          <img
            class="icon"
            :src="option.icon"
          >
          <p>{{ option.name }}</p>
          <img
            class="option-icon"
            :src="IconOption"
          >
        </div>
      </template>
    </div>
    <el-button
      class="logout"
      @click="logout"
      v-if="authorization_type === 'user'"
    >退出登录</el-button>
    <el-button
      class="logout"
      v-navigate='"/login"'
      v-if="authorization_type !== 'user'"
    >登录其他账号</el-button>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.base {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.base .avatar {
  width: 4rem;
  height: auto;
  border-radius: 50%;
}
.base .user-name {
  font-weight: bold;
  font-size: 1.2rem;
}
.base .user-level-icon {
  width: 3.6rem;
  height: auto;
}
.base .fresh {
  margin-left: auto;
  width: 1.6rem;
  height: auto;
}
.base .fresh.animation {
  animation: rotate 2s linear infinite;
}
.base .left {
  height: 3.6rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1rem;
}
.base .free {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.user-level {
  width: 100%;
  box-sizing: border-box;
  padding: 1rem 1.5rem;
  background: #4f3f2b;
  border-radius: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}
.user-level .active {
  color: #ffb037;
}
.user-level .item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.user-level .item .name {
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}
.options {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.option {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.option .icon {
  width: 1.5rem;
  height: auto;
}
.option p {
  font-size: 1.1rem;
}
.option .option-icon {
  margin-left: auto;
  width: auto;
  height: 0.8rem;
}
.logout {
  margin-top: auto;
  width: 100%;
  height: 4rem;
  --el-button-bg-color: #232331;
  --el-border-radius-base: 1rem;
  --el-button-border-color: #232331;
}
</style>