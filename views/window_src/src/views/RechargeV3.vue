<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElLoading } from "element-plus";
import { Error } from "@/notification";
import { $Money, $DateFormat } from "@/util";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import {
  VIPBG,
  SVIPBG,
  VIPPermission1,
  VIPPermission2,
  VIPPermission3,
  VIPPermission4,
  SVIPPermission1,
  SVIPPermission2,
  SVIPPermission3,
  SVIPPermission4,
} from "@/util/assets";

import vp1 from "@/assets/image/vip-p-1.png";
import vp2 from "@/assets/image/vip-p-2.png";
import vp3 from "@/assets/image/vip-p-3.png";
import vp4 from "@/assets/image/vip-p-4.png";
import vp5 from "@/assets/image/vip-p-5.png";
import vp6 from "@/assets/image/vip-p-6.png";
import svp1 from "@/assets/image/svip-p-1.png";
import svp2 from "@/assets/image/svip-p-2.png";
import svp3 from "@/assets/image/svip-p-3.png";
import svp4 from "@/assets/image/svip-p-4.png";
import svp5 from "@/assets/image/svip-p-5.png";
import svp6 from "@/assets/image/svip-p-6.png";
import { USER_LEVEL_FREE, USER_LEVEL_VIP, USER_LEVEL_SVIP } from "@/store";

const router = useRouter();
const route = useRoute();
const store = useStore();

const authorized = computed(() => store.state.authorized);
const authorization_type = computed(() => store.state.authorization_type);
const user_id = computed(() => store.state.user_id);
const level = computed(() => store.state.user_level);
const timestamp = computed(() => store.state.timestamp);
const vipExpiredAt = computed(() => store.state.user_vip_expired_at);
const svipExpiredAt = computed(() => store.state.user_svip_expired_at);
const vipExpired = computed(() => vipExpiredAt.value < timestamp.value);
const svipExpired = computed(() => svipExpiredAt.value < timestamp.value);

const currentPlan = ref({});
const currentPrice = ref({});
const currentPayment = ref({});
const currentPlanExpiredAt = computed(() => {
  if (authorized.value) {
    switch (currentPlan.value?.key) {
      case "vip":
        return expireTxt.value(USER_LEVEL_VIP);
      case "svip":
        return expireTxt.value(USER_LEVEL_SVIP);
    }
  }
  return "  "
});

const userIDTxt = computed(() => {
  if (authorized.value) {
    return `ID: ${user_id.value}`
  }
  return "  "
})

const plans = ref([]);
const payments = ref([]);

const currentPlanBackground = computed(() => {
  switch (currentPlan.value.key) {
    case "vip":
      return VIPBG;
    case "svip":
      return SVIPBG;
    default:
      return null;
  }
});

const permissions = computed(() => {
  switch (currentPlan.value.key) {
    case "vip":
      return [
        { img: vp4, title: "共享线路" },
        { img: vp1, title: "共享超高宽带" },
        { img: vp2, title: "共享千兆带宽" },
        { img: vp3, title: "低延迟" },
        { img: vp5, title: "1080P高清" },
        { img: vp6, title: "隐私加密传输" },
      ];
    case "svip":
      return [
        { img: svp4, title: "尊享线路" },
        { img: svp1, title: "独享超高宽带" },
        { img: svp2, title: "独享千兆带宽" },
        { img: svp3, title: "防抖丢包" },
        { img: svp5, title: "1080P高清" },
        { img: svp6, title: "隐私加密传输" },
      ];
    default:
      return [];
  }
});

const expireTxt = computed(() => {
  return (_level) => {
    switch (_level) {
      case USER_LEVEL_VIP:
        if (vipExpired.value) {
          return "开通享专属特权";
        } else {
          return `到期时间: ${$DateFormat(vipExpiredAt.value)}`;
        }
      case USER_LEVEL_SVIP:
        if (svipExpired.value) {
          return "开通享专属特权";
        } else {
          return `到期时间: ${$DateFormat(svipExpiredAt.value)}`;
        }
    }
    return "";
  };
});

const changePlan = (plan) => {
  if (currentPlan.value.id == plan.id) {
    return;
  }

  currentPlan.value = plan;

  let price = {};
  if (plan.prices.length > 0) {
    price = currentPlan.value.prices[0];

    for (let _price of currentPlan.value.prices) {
      if (_price.period == currentPrice.value.period) {
        price = _price;
        break;
      }
    }
  }
  changePrice(price);
};

const changePrice = (price) => {
  currentPrice.value = price;
};

const loaded = ref(false);
const load = (planKey) => {
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });
  Promise.all([window.box_api.listPlan(), window.box_api.listOrderPayment()])
    .then(([_plans, _payments]) => {
      plans.value = _plans;
      if (plans.value.length > 0) {
        currentPlan.value = plans.value[0];
      }
      if (planKey) {
        for (let plan of plans.value) {
          if (plan.key == planKey) {
            currentPlan.value = plan;
          }
        }
      }
      if (currentPlan.value.prices.length > 0) {
        currentPrice.value = currentPlan.value.prices[0];
      }

      payments.value = _payments;
      if (payments.value.length > 0) {
        currentPayment.value = payments.value[0];
      }

      loaded.value = true;
    })
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      loading.close();
    });
};

const pay_info = ref(null);
const pay_qr_code = ref(null);
const show_pay_qr_dialog = ref(false);
const show_payment_dialog = ref(false);
const pay = () => {
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });
  window.box_api
    .payOrderByPlan(
      currentPrice.value.plan_id,
      currentPrice.value.period,
      currentPayment.value.id
    )
    .then((data) => {
      pay_info.value = data;
      loadPayQRDialog();
    })
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      loading.close();
    });
};

const loadPayQRDialog = () => {
  try {
    QRCode.toDataURL(
      pay_info.value.pay_url,
      {
        errorCorrectionLevel: "H",
        margin: 1,
      },
      (err, url) => {
        if (err) {
          console.error("gen qr code failed:", err);
          url = null;
        }
        pay_qr_code.value = url;
      }
    );
    show_pay_qr_dialog.value = true;
  } catch (err) {
    console.error("gen qr code failed:", err);
  }
};

const show_pay_success_dialog = ref(false);
const listenPaySuccess = () => {
  try {
    window.box_api.listenOrderPaied((data) => {
      if (pay_info.value && data.trade_no == pay_info.value.order_id) {
        show_pay_qr_dialog.value = false;
        show_pay_success_dialog.value = true;
      }
    });
  } catch (err) {
    console.error("listen order paided failed");
  }
};
const close_pay_success = () => {
  show_pay_success_dialog.value = false;
  router.push("/");
};
const go_bind = () => {
  show_pay_success_dialog.value = false;
  router.push(`/bind`);
};

onMounted(() => {
  load(route.query.key);
  listenPaySuccess();
});
</script>

<template>
  <div v-if="loaded" class="recharge" :class="[currentPlan?.key, `${currentPlan?.key}-bg`]">
    <div class="header">
      <!-- <img class="img1" src="@/assets/image/vip-1.png" /> -->
      <div class="plan-selector">
        <div class="item pointer" v-for="(plan, i) of plans" :key="i"
          :class="[plan.id == currentPlan.id ? 'active' : '']" @click="changePlan(plan)">
          {{ plan.name }}
        </div>
      </div>
      <div class="d1">
        <p>{{ userIDTxt }}</p>
        <p>{{ currentPlanExpiredAt }}</p>
      </div>
    </div>

    <div class="inner">
      <p class="price-selector-txt">套餐选择</p>

      <!-- <div class="plan-current">
        <img :src="currentPlanBackground" />
        <p class="title">{{ currentPlan.title }}</p>
        <p class="remark">{{ currentPlan.remark }}</p>
      </div> -->

      <div class="prices">
        <div class="price pointer" v-for="(price, i) of currentPlan.prices" :key="i"
          :class="{ active: price.period == currentPrice.period }" @click="changePrice(price)">
          <p class="name">{{ price.name }}</p>
          <p class="amount">
            <span class="unit">¥ </span>
            <span>{{ $Money(price.amount) }}</span>
          </p>
          <p class="original-amount">¥ {{ $Money(price.originalAmount) }}</p>
          <p class="unit-price">平均{{ $Money(price.unitPrice) }}元/天</p>
        </div>
      </div>
      <div class="permissions">
        <div v-for="(permission, i) of permissions" :key="i">
          <img :src="permission.img" />
          <p>{{ permission.title }}</p>
        </div>
      </div>

      <div class="recharge-tip" v-if="authorization_type === 'device'">
        <el-icon>
          <Warning />
        </el-icon>
        <p>
          游客状态只能一台设备登录并且充值出现丢失情况无法找回，
          如需其他设备登录或订单找回，请绑定账号。
        </p>
      </div>
      <div>
        <el-button class="bind-pay" v-if="authorized && authorization_type === 'device'" @click="go_bind">
          绑定并开通
        </el-button>
      </div>
      <div>
        <el-button class="pay" v-if="authorized" @click="show_payment_dialog = true">立即开通</el-button>
      </div>
    </div>

    <el-drawer class="header-no-margin" v-model="show_payment_dialog" direction="btt" title="确认订单" size="33%">
      <div class="payment-drawer">
        <!-- <div class="title">确认订单</div> -->
        <div class="payments">
          <div class="payment pointer" v-for="(payment, i) of payments" :key="i" @click="currentPayment = payment">
            <img :src="payment.icon" />
            <p>{{ payment.name }}</p>
            <Iconfont class="selector" :class="payment.id == currentPayment.id ? 'selected' : 'unselect'" :name="payment.id == currentPayment.id
              ? 'radio-selected'
              : 'radio-unselect'
              " />
          </div>
        </div>
        <div class="current">
          <p class="left">{{ currentPlan?.title }}{{ currentPrice?.name }}</p>
          <p class="right" style="color: #ff003c">
            ¥{{ $Money(currentPrice?.amount) }}
          </p>
        </div>
        <el-divider class="emtpy" />
        <el-button class="pay" @click="pay">立即开通</el-button>
      </div>
    </el-drawer>

    <el-dialog class="pay-dialog" width="60%" v-model="show_pay_qr_dialog" :show-close="false" :align-center="true"
      :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="content">
        <p>{{ `请使用手机${currentPayment.name}扫码支付` }}</p>
        <img :src="pay_qr_code" />
        <el-icon class="pointer" size="2rem" @click="show_pay_qr_dialog = false">
          <CircleClose />
        </el-icon>
      </div>
    </el-dialog>
    <el-dialog class="pay-success-dialog white" width="60%" v-model="show_pay_success_dialog" :show-close="false"
      :align-center="true" :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="content">
        <img class="close-img pointer" src="@/assets/image/icon-close.png" @click="close_pay_success" />
        <img class="icon-success" src="@/assets/image/icon-success.png" />
        <p class="title">支付成功</p>
        <p class="text" v-if="authorization_type === 'device'">
          游客状态只能一台设备登录并，且充值出现丢失情况无法找回，如需其他设备登录或订单找回，请绑定账号。
        </p>
        <p class="text" v-else></p>
        <el-button v-if="authorization_type === 'device'" type="primary" round @click="go_bind">立即绑定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  height: 100%;
}

.header {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 12.5rem;
}

.inner {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: scroll;
  flex: 1 1 auto;
}

.img1 {
  position: absolute;
  right: 1rem;
  top: 3rem;
  height: 6rem;
}

.plan-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.plan-selector .item {
  box-sizing: border-box;
  padding: 1rem;
  /* background: #26272B; */
  /* color: #fff; */
  border-radius: 1rem;
  font-size: 1.4rem;
  /* font-weight: bold; */
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.plan-selector .item.active::after {
  position: absolute;
  content: "";
  width: 1.3rem;
  height: 4px;
  border-radius: 999rem;
  top: 3rem;
}

.plan-current {
  position: relative;
  width: 100%;
  height: 5rem;
  box-sizing: border-box;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.plan-current img {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.plan-current p {
  z-index: 1;
}

.plan-current .title {
  font-size: 1.4rem;
  font-weight: bold;
}

.price-selector-txt {
  font-size: 1.2rem;
}

.prices {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.price {
  width: calc(33.33% - 12px);
  box-sizing: border-box;
  padding: 1rem 0;
  background: #26272B;
  border: 2px solid #26272B;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.price .name {
  font-size: 1rem;
  font-weight: bold;
  color: #c6c6c5;
}

.price .amount {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
  font-size: 1.6rem;
  font-weight: bold;
}

.price .amount .unit {
  font-size: 0.92rem;
  font-weight: normal;
}

.price .original-amount {
  font-size: 0.92rem;
  color: #78777c;
  text-decoration-line: line-through;
}

.price .unit-price {
  font-size: 0.7rem;
  box-sizing: border-box;
  padding: 0.2rem 0.8rem;
  background: #18181B;
  border-radius: 10rem;
}

.payments {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.payment img {
  height: 1.6rem;
  width: auto;
}

.payment .selector {
  margin-left: auto;
  font-size: 1.8rem;
}

.payment .selector.selected {
  color: #ffb111;
}

.payment .selector.unselect {
  color: #353447;
}

.pay {
  width: 100%;
  height: 3rem;
  --el-border-radius-base: 999rem;
}

.bind-pay {
  width: 100%;
  height: 3rem;
  --el-border-radius-base: 999rem;
}

.permissions {
  border-radius: 1rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  z-index: 11;
}

.permissions div {
  box-sizing: border-box;
  padding: 0.4rem 0.7rem;
  border-radius: 1rem;
  width: calc(50% - 0.5rem);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
}

.permissions img {
  width: auto;
  height: 2.5rem;
}

.permissions p {
  font-size: 0.85rem;
}

.recharge-tip {
  color: #ee5a20;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.recharge-tip .el-icon {
  font-size: 1.6rem;
}

.recharge-tip p {
  font-size: 0.8rem;
}

/* vip */
.vip .plan-selector .item {
  color: #ae8c5a;
}

.vip .plan-selector .item.active {
  color: #77582e;
  font-weight: bold;
}

.vip .plan-selector .item.active::after {
  background-color: #77582e;
}

.vip .plan-current {
  color: #854f0a;
}

.vip .price {
  border: 2px solid #423729;
  background: #2F261B;
}

.vip .price.active {
  border: 2px solid #FFF2C9;
  background: #565043;
}

.vip .price.active .name {
  color: #FEE69D;
}

.vip .price.active .amount {
  color: #FEE69D;
}

.vip .price.active .original-amount {
  color: #FEE69D;
}

.vip .price.active .unit-price {
  background: linear-gradient(180deg, #FEF3CD 0%, #FFE596 100%);
  color: #70490D;
}

.vip .bind-pay {
  --el-button-hover-text-color: #fff;
  background: #1E1A16;
  border: 1px solid #534A32;
}

.vip .pay {
  --el-button-hover-border-color: #FBCD87;
  background: linear-gradient(90deg, #FBCD87 0%, #E2AC58 100%);
  color: #fff;
}

.vip .permissions div {
  color: #fff;
  background: #2F261B;
  border: 1px solid #463C2A;
}

/* svip */
.svip .plan-selector .item.active {
  color: #fff;
}

.svip .plan-selector .item.active::after {
  background-color: #FEA81C;
}

.svip .plan-current {
  color: #b46609;
}

.svip .price {
  border: 2px solid #414661;
  background: #32364F;
}

.svip .price.active {
  border: 2px solid #9BAAE8;
  background: #3C3D68;
}

.svip .price.active .name {
  color: #A6B7F7;
}

.svip .price.active .amount {
  color: #A6B7F7;
}

.svip .price.active .original-amount {
  color: #636B9D;
}

.svip .price .unit-price {
  background: #474C6A;
  color: #fff;
}

.svip .price.active .unit-price {
  background: linear-gradient(180deg, #EBE8F0 0%, #C4CCFB 100%);
  color: #2E324B;
}


.svip .bind-pay {
  --el-button-hover-text-color: #fff;
  background: #221F2E;
  border: 1px solid #4E5371;
}

.svip .pay {
  --el-button-hover-border-color: #4E5371;
  background: linear-gradient(90deg, #4E5371 0%, #313474 100%);
  color: #fff;
}

.svip .permissions div {
  color: #fff;
  background: #32364F;
  border: 1px solid #444865;
}

.pay-dialog .content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.pay-success-dialog .content {
  box-sizing: border-box;
  padding: 0 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.pay-success-dialog .content .icon-success {
  height: 3rem;
  width: 3rem;
}

.pay-success-dialog .content .title {
  font-size: 1.1rem;
  color: var(--el-color-primary);
}

.pay-success-dialog .content .text {
  font-size: 1.1rem;
}

.pay-success-dialog .content .el-button {
  width: 100%;
}

.pay-success-dialog .content .close-img {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -4rem;
  height: 2rem;
}

.payment-drawer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-drawer .title {
  align-self: center;
  position: relative;
}

.payment-drawer .current {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.payment-drawer .emtpy {
  margin: 0;
}

.d1 {
  margin-top: 1rem;
  margin-bottom: 2rem;
  box-sizing: border-box;
  padding: 0.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.d1 p:first-child {
  font-weight: bold;
}

.vip .d1 {
  color: #9f7948;
}

.vip .d1 p:first-child {
  color: #6B4303;
}

.svip .d1 {
  color: #fff;
}

.svip .d1 p:first-child {
  color: #fff;
}
</style>