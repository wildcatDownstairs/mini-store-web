<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { api } from "./api";
import { state, act, refreshAccount, refreshCart } from "./store";
import { totals, yen } from "./domain";
import OrderTotals from "./components/OrderTotals.vue";
import Icon from "./components/Icon.vue";
const router = useRouter(),
  addressId = ref(null),
  shipping = ref("standard"),
  code = ref(""),
  applied = ref(""),
  busy = ref(false),
  quoting = ref(false),
  couponError = ref(""),
  quote = ref(null);
let key = crypto.randomUUID(),
  revision = 0;
const q = computed(() => ({
  ...totals(quote.value?.totals),
  lines: (quote.value?.lines || []).map((l) => ({
    ...l,
    name: l.productName,
    total: l.lineTotal,
  })),
}));
async function refreshQuote() {
  const rev = ++revision;
  quote.value = null;
  couponError.value = "";
  key = crypto.randomUUID();
  if (!addressId.value || !state.value.cart.length) return;
  quoting.value = true;
  try {
    const result = await api("/api/me/checkout/quote", {
      method: "POST",
      body: {
        addressId: addressId.value,
        shippingMethod: shipping.value,
        couponCode: applied.value || null,
      },
    });
    if (rev === revision) quote.value = result;
  } catch (e) {
    if (rev === revision) couponError.value = e.message;
  } finally {
    if (rev === revision) quoting.value = false;
  }
}
function coupon() {
  applied.value = code.value.trim().toUpperCase();
  refreshQuote();
}
watch([addressId, shipping], refreshQuote);
onMounted(async () => {
  await act(refreshAccount);
  addressId.value =
    state.value.addresses.find((a) => a.isDefault)?.id ||
    state.value.addresses[0]?.id;
});
async function submit() {
  if (busy.value || !quote.value) return;
  busy.value = true;
  const r = await act(
    () =>
      api("/api/me/orders", {
        method: "POST",
        headers: { "Idempotency-Key": key },
        body: {
          addressId: addressId.value,
          shippingMethod: shipping.value,
          couponCode: applied.value || null,
          quoteToken: quote.value.quoteToken,
        },
      }),
    "订单已创建。",
  );
  busy.value = false;
  if (r.ok) {
    await act(refreshCart);
    router.replace("/orders/" + r.result.id + "?payment=1");
  } else if (r.error?.status === 409) {
    quote.value = null;
    couponError.value = "订单条件已变化，请重新获取报价后确认。";
  }
}
</script>
<template>
  <div class="wrap page narrow-page">
    <div class="breadcrumb">
      <RouterLink to="/cart">购物袋</RouterLink><span>/</span>确认订单
    </div>
    <div class="page-intro">
      <div>
        <h1>好物，即将启程。</h1>
        <p>确认收货信息和服务端报价。</p>
      </div>
    </div>
    <div v-if="!state.signedIn" class="empty">
      <Icon name="user" />
      <h2>请先登录你的账户</h2>
      <p>登录后管理收货地址，保存购物袋和订单。</p>
      <RouterLink class="button primary" to="/login?next=/checkout"
        >登录 / 注册</RouterLink
      >
    </div>
    <div v-else-if="!state.cart.length" class="empty">
      <h2>购物袋里还没有商品</h2>
      <RouterLink class="button primary" to="/products">去挑选商品</RouterLink>
    </div>
    <form v-else class="checkout-layout" @submit.prevent="submit">
      <div>
        <section class="checkout-section">
          <div class="section-heading">
            <h2><span class="step">1</span> 收货地址</h2>
            <RouterLink to="/account/addresses?return=checkout"
              >管理地址</RouterLink
            >
          </div>
          <label
            v-for="a in state.addresses"
            :key="a.id"
            class="choice address-choice"
            :class="{ chosen: addressId === a.id }"
            ><input
              v-model="addressId"
              type="radio"
              :value="a.id"
              name="address"
              required
            /><span
              ><strong
                >{{ a.name }} <small v-if="a.isDefault">默认地址</small></strong
              ><span
                >〒{{ a.postalCode }} {{ a.prefecture }}{{ a.city
                }}{{ a.line1 }} {{ a.line2 }}</span
              ><span>{{ a.phone }}</span></span
            ></label
          >
          <p v-if="!state.addresses.length">
            请先<RouterLink to="/account/addresses?return=checkout"
              >添加收货地址</RouterLink
            >。
          </p>
        </section>
        <section class="checkout-section">
          <h2><span class="step">2</span> 配送方式</h2>
          <label class="choice" :class="{ chosen: shipping === 'standard' }"
            ><input
              v-model="shipping"
              type="radio"
              value="standard"
              name="shipping"
            /><span
              ><strong>标准配送</strong
              ><span>预计 2–4 个工作日 · 满额免运费</span></span
            ><b>{{
              q.subtotal - q.discount >= 8000 ? "免费" : "¥500"
            }}</b></label
          ><label class="choice" :class="{ chosen: shipping === 'express' }"
            ><input
              v-model="shipping"
              type="radio"
              value="express"
              name="shipping"
            /><span
              ><strong>快捷配送</strong><span>预计 1–2 个工作日</span></span
            ><b>¥900</b></label
          >
        </section>
        <section class="checkout-section">
          <h2><span class="step">3</span> 优惠与支付</h2>
          <label for="coupon">优惠码</label>
          <div class="inline-form">
            <input
              id="coupon"
              @keydown.enter.prevent="coupon"
              :aria-invalid="!!couponError"
              aria-describedby="coupon-feedback"
              v-model="code"
              placeholder="输入有效优惠码"
              maxlength="40"
            /><button type="button" class="button secondary" @click="coupon">
              应用
            </button>
          </div>
          <Transition name="feedback" mode="out-in"
            ><p
              v-if="couponError"
              id="coupon-feedback"
              role="alert"
              class="form-error"
            >
              {{ couponError }}
            </p>
            <p
              v-else
              id="coupon-feedback"
              :key="applied"
              class="muted"
              :class="{ 'coupon-applied': applied }"
            >
              {{
                applied
                  ? "已应用 " + applied
                  : "优惠以服务端校验结果为准，不可叠加。"
              }}
            </p></Transition
          >
          <div class="notice">
            这是本地学习订单。仅开发环境启用模拟付款，不收集银行卡信息。
          </div>
        </section>
      </div>
      <aside class="order-summary">
        <h2>确认商品</h2>
        <div v-for="l in q.lines" :key="l.variantId" class="mini-line">
          <span
            >{{ l.name
            }}<small>{{ l.variantName }} × {{ l.quantity }}</small></span
          ><b>{{ yen(l.total) }}</b>
        </div>
        <p v-if="quoting" role="status">正在确认价格…</p>
        <OrderTotals v-if="quote" :quote="q" /><button
          v-else
          type="button"
          class="button secondary full"
          :disabled="quoting || !addressId"
          @click="refreshQuote"
        >
          重新获取报价</button
        ><button
          class="button primary full"
          :disabled="busy || quoting || !quote || !addressId"
          type="submit"
        >
          {{ busy ? "正在创建…" : "确认并创建订单" }}
          <Icon name="arrow" />
        </button>
        <p class="muted">
          金额包含消费税和配送费。订单创建后保存成交价格与地址快照。
        </p>
      </aside>
    </form>
  </div>
</template>
