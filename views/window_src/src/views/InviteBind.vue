<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { InviteCodeTest } from '@/util/validate'
import { ElLoading } from 'element-plus'
import { Success, Error } from '@/notification'
import { TitleLeft, TitleRight, InviteInvite, InvitePromotion, InviteGift } from '@/util/assets'

const store = useStore()

const binded = computed(() => store.state.user_binded_invite_code ? true : false)

const form = reactive({
  inviteCode: store.state.user_binded_invite_code,
})

const submiting = ref(false)
const submit = () => {
  if (submiting.value) {
    return
  }
  for (const err of [InviteCodeTest(form.inviteCode, true)]) {
    if (err) {
      Error(err)
      return
    }
  }

  submiting.value = true
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  window.box_api.bindInviteCode(form.inviteCode).then(() => {
    form.inviteCode = ''
    loading.close()
    Success('绑定成功')
  }).catch(err => {
    loading.close()
    Error(err)
  }).finally(() => {
    submiting.value = false
  })
}
</script>

<template>
  <div class="large-full invite-bg">
    <div class="plate1">
      <div class="my-invite">
        <div class="item pointer" v-navigate='"/invite"'>
          <div class="icon">
            <img :src="InviteInvite">
          </div>
          <p>我要邀请</p>
        </div>
        <img class="split" src="@/assets/image/icon/invite-split.png">
        <div class="item pointer" v-navigate='"/invite_history"'>
          <div class="icon">
            <img :src="InvitePromotion">
          </div>
          <p>我的推广</p>
        </div>
        <img class="split" src="@/assets/image/icon/invite-split.png">
        <div class="item pointer" v-navigate='"/invite_award"'>
          <div class="icon">
            <img :src="InviteGift">
          </div>
          <p>我的奖励</p>
        </div>
      </div>
      <p class="bind-invite-tip">备注：即日起邀请好友使用有丰富奖励赠送，好友首单支付更有好礼相送，具体活动详情请点开"我要邀请"!</p>
    </div>
    <div class="plate">
      <div class="title">
        <!-- <img :src="TitleLeft"> -->
        <p>邀请码绑定</p>
        <!-- <img :src="TitleRight"> -->
      </div>
      <div class="content">
        <el-input class="invite-code-input no-shadow large-padding" input-style="text-align: center;"
          v-model="form.inviteCode" placeholder="请输入您的邀请码" :disabled="binded" />
        <el-button class="bind-invite-btn" type="primary" :disabled="binded" @click="submit">
          {{ binded ? '已绑定邀请码' : '绑定邀请码' }}
        </el-button>
        <p class="bind-invite-tip active">温馨提示: 绑定邀请码，首单付费有优惠哦!</p>

      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  box-sizing: border-box;
  padding: 15rem 1rem 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.plate1 {
  width: 100%;
  box-sizing: border-box;
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: #26272B;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.plate {
  width: 100%;
  box-sizing: border-box;
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: #26272B;
  display: flex;
  flex-direction: column;
}

.plate .title {
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
  gap: 1.5rem;
}

.invite-code-input {
  height: 3.5rem;
  width: 100%;
  --el-input-bg-color: #18181B;
  --el-input-border-radius: 1.5rem;
  --el-input-placeholder-color: #60606c;
}

.bind-invite-btn {
  height: 3.5rem;
  width: 100%;
  border-radius: 3.5rem;
  background: linear-gradient(90deg, #FFB20E 0%, #FF7B0B 100%);
}

.bind-invite-tip {
  font-size: 0.92rem;
  color: #959494;
  line-height: 1.6rem;
}

.bind-invite-tip.active {
  color: #E44132;
}

.my-invite {
  /* width: 96%; */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.my-invite .split {
  width: 1rem;
  margin-top: -1.8rem;
}

.my-invite .item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.my-invite .item .icon {
  /* padding: 1rem; */
  /* background: #fff0e7; */
  border-radius: 50%;
  display: flex;
  align-items: center;
}

.my-invite .item .icon img {
  height: 3.5rem;
  width: auto;
}
</style>