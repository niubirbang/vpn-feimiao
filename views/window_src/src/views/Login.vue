<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import {
  EmailTest,
  EmailCodeTest,
  PhoneTest,
  PhoneCodeTest,
  PasswordTest,
} from "@/util/validate";
import { ElLoading } from "element-plus";
import { Error } from "@/notification";

const router = useRouter();
const route = useRoute();
const store = useStore();

const authorization_type = computed(() => store.state.authorization_type);
const authorized_from_page = computed(() => store.state.authorized_from_page);

const method = ref("phone_password");
const form = reactive({
  phone: "",
  phoneCode: "",
  email: "",
  emailCode: "",
  password: "",
});

const go_registe = () => {
  let key = null;
  switch (method.value) {
    case "phone_password":
    case "phone_sms":
      key = "phone";
      break;
    case "email_password":
    case "email_sms":
      key = "email";
      break;
  }
  router.push(`/registe?key=${key}`);
};

const go_forget_password = () => {
  let key = null;
  switch (method.value) {
    case "phone_password":
    case "phone_sms":
      key = "phone";
      break;
    case "email_password":
    case "email_sms":
      key = "email";
      break;
  }
  router.push(`/forget_password?key=${key}`);
};

const phoneCodeSending = ref(false);
const phoneCodeCountdown = ref(0);
const phoneCodeSend = () => {
  if (phoneCodeSending.value) {
    return;
  }
  const err = PhoneTest(form.phone, true);
  if (err) {
    Error(err);
    return;
  }

  phoneCodeSending.value = true;
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });
  window.box_api
    .sms("phone", 2, form.phone)
    .then(() => {
      phoneCodeCountdown.value = 60;
      let ticker = setInterval(() => {
        if (phoneCodeCountdown.value <= 0) {
          clearInterval(ticker);
          return;
        }
        phoneCodeCountdown.value--;
      }, 1000);
    })
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      phoneCodeSending.value = false;
      loading.close();
    });
};

const emailCodeSending = ref(false);
const emailCodeCountdown = ref(0);
const emailCodeSend = () => {
  if (emailCodeSending.value) {
    return;
  }
  const err = EmailTest(form.email, true);
  if (err) {
    Error(err);
    return;
  }

  emailCodeSending.value = true;
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });
  window.box_api
    .sms("email", 2, form.email)
    .then(() => {
      emailCodeCountdown.value = 60;
      let ticker = setInterval(() => {
        if (emailCodeCountdown.value <= 0) {
          clearInterval(ticker);
          return;
        }
        emailCodeCountdown.value--;
      }, 1000);
    })
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      emailCodeSending.value = false;
      loading.close();
    });
};

const submiting = ref(false);
const submit = () => {
  if (submiting.value) {
    return;
  }
  switch (method.value) {
    case "phone_password":
      for (const err of [
        PhoneTest(form.phone, true),
        PasswordTest(form.password, true),
      ]) {
        if (err) {
          Error(err);
          return;
        }
      }
      break;
    case "phone_sms":
      for (const err of [
        PhoneTest(form.phone, true),
        PhoneCodeTest(form.phoneCode, true),
      ]) {
        if (err) {
          Error(err);
          return;
        }
      }
      break;
    case "email_password":
      for (const err of [
        EmailTest(form.email, true),
        PasswordTest(form.password, true),
      ]) {
        if (err) {
          Error(err);
          return;
        }
      }
      break;
    case "email_sms":
      for (const err of [
        EmailTest(form.email, true),
        EmailCodeTest(form.emailCode, true),
      ]) {
        if (err) {
          Error(err);
          return;
        }
      }
      break;
  }

  submiting.value = true;
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });
  window.box_api
    .login(method.value, {
      phone: form.phone,
      phoneCode: form.phoneCode,
      email: form.email,
      emailCode: form.emailCode,
      password: form.password,
    })
    .then(() => {
      setTimeout(() => {
        loading.close();
        router.replace(authorized_from_page.value);
      }, 1000);
    })
    .catch((err) => {
      loading.close();
      Error(err);
    })
    .finally(() => {
      submiting.value = false;
    });
};

const login_by_device = () => {
  submiting.value = true;
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });
  window.box_api
    .loginByDevice()
    .then(() => {
      setTimeout(() => {
        loading.close();
        router.replace(authorized_from_page.value);
      }, 1000);
    })
    .catch((err) => {
      loading.close();
      Error(err);
    })
    .finally(() => {
      submiting.value = false;
    });
};

onMounted(() => {
  let from = route.query.from;
  if (!from) {
    from = "/";
  }
  if (route.query.key) {
    method.value = route.query.key;
  }
  store.commit("setAuthorizedFromPage", from);
});
</script>

<template>
  <div class="full">
    <p class="title">欢迎登录</p>

    <div class="content">
      <div class="switch-method">
        <p
          class="pointer"
          :class="{
            active: method === 'phone_password' || method === 'phone_sms',
          }"
          @click="method = 'phone_password'"
        >
          手机号登录
        </p>
        <p
          class="pointer"
          :class="{
            active: method === 'email_password' || method === 'email_sms',
          }"
          @click="method = 'email_password'"
        >
          邮箱登录
        </p>
      </div>
      <div
        class="item filed"
        v-if="method === 'phone_password' || method === 'phone_sms'"
      >
        <p>手机号</p>
        <el-input
          class="no-shadow large-padding"
          v-model="form.phone"
          placeholder="请输入手机号"
        />
      </div>
      <div
        class="item filed"
        v-if="method === 'email_password' || method === 'email_sms'"
      >
        <p>邮箱</p>
        <el-input
          class="no-shadow large-padding"
          v-model="form.email"
          placeholder="请输入邮箱"
        />
      </div>
      <div
        class="item filed"
        v-if="method === 'phone_password' || method === 'email_password'"
      >
        <p>密码</p>
        <el-input
          type="password"
          show-password
          class="no-shadow large-padding"
          v-model="form.password"
          placeholder="请输入密码"
        />
      </div>
      <div class="item filed" v-if="method === 'phone_sms'">
        <p>验证码</p>
        <el-input
          class="no-shadow large-padding"
          v-model="form.phoneCode"
          placeholder="请输入验证码"
        >
          <template #suffix>
            <el-button
              type="primary"
              :disabled="phoneCodeSending || phoneCodeCountdown > 0"
              @click="phoneCodeSend"
              link
            >
              获取验证码<template v-if="phoneCodeCountdown > 0">{{
                `(${phoneCodeCountdown})`
              }}</template>
            </el-button>
          </template>
        </el-input>
      </div>
      <div class="item filed" v-if="method === 'email_sms'">
        <p>验证码</p>
        <el-input
          class="no-shadow large-padding"
          v-model="form.emailCode"
          placeholder="请输入验证码"
        >
          <template #suffix>
            <el-button
              type="primary"
              :disabled="emailCodeSending || emailCodeCountdown > 0"
              @click="emailCodeSend"
              link
            >
              获取验证码<template v-if="emailCodeCountdown > 0">{{
                `(${emailCodeCountdown})`
              }}</template>
            </el-button>
          </template>
        </el-input>
      </div>
      <div class="item others">
        <p class="pointer primary" @click="go_registe">注册</p>
        <p class="pointer gray" @click="go_forget_password">忘记密码？</p>
      </div>
      <div class="item center">
        <el-button class="btn" @click="submit">登录</el-button>
      </div>
      <div class="item center">
        <el-button
          v-if="method === 'phone_password'"
          type="primary"
          @click="method = 'phone_sms'"
          link
          >短信验证</el-button
        >
        <el-button
          v-if="method === 'phone_sms'"
          type="primary"
          @click="method = 'phone_password'"
          link
          >密码登录</el-button
        >
        <el-button
          v-if="method === 'email_password'"
          type="primary"
          @click="method = 'email_sms'"
          link
          >邮箱验证</el-button
        >
        <el-button
          v-if="method === 'email_sms'"
          type="primary"
          @click="method = 'email_password'"
          link
          >密码登录</el-button
        >
      </div>
      <div class="item center" v-if="!authorization_type">
        <div class="otherway">
          <div class="line"></div>
          <p class="">其他方式</p>
          <div class="line"></div>
        </div>
      </div>
      <div
        class="item center"
        v-if="!authorization_type"
        @click="login_by_device"
      >
        <p class="device-login pointer">游客登录 ></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.primary {
  color: var(--el-color-primary);
}
.gray {
  color: #575765;
}
.page {
  display: flex;
  flex-direction: column;
}
.title {
  margin-top: 2rem;
  padding-left: 2rem;
  padding-right: 2rem;
  font-size: 2rem;
}
.content {
  background: #232331;
  border-top-left-radius: 1.5rem;
  border-top-right-radius: 1.5rem;
  border-bottom-left-radius: var(--window-border-radius);
  border-bottom-right-radius: var(--window-border-radius);

  box-sizing: border-box;
  margin-top: 2rem;
  flex: 1;
  padding: 1rem 2rem 1rem 2rem;
}
.content .switch-method {
  box-sizing: border-box;
  padding: 1rem 2rem 2rem 2rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.content .switch-method p {
  font-size: 1.2rem;
}
.content .switch-method p.active {
  color: var(--el-color-primary);
}
.content .item {
  margin-bottom: 1rem;
}
.content .item:last-child {
  margin-bottom: unset;
}
.content .filed {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.content .others {
  display: flex;
  justify-content: space-between;
}
.content .center {
  display: flex;
  justify-content: center;
}
.content .el-input {
  height: 4.5rem;
  width: 100%;
  --el-input-bg-color: #2d2d3c;
  --el-input-border-radius: 1.5rem;
  --el-input-placeholder-color: #60606c;
}
.btn {
  margin-top: 1rem;
  width: 100%;
  height: 4.5rem;
  background: linear-gradient(90deg, #fe9c01, #fd8b01);
  border-radius: 1.5rem;
  color: #fff;
  font-size: 1.2rem;
}
.otherway {
  height: 6rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #bab6b6;
}
.otherway .line {
  width: 30%;
  border-top: 0.01rem solid #bab6b6;
}
.device-login {
  font-size: 1.2rem;
  color: var(--el-color-primary);
}
</style>