<script setup>
import { computed, ref, nextTick, onMounted } from "vue";
import { state, act, refreshCart, quantity } from "./store";
import { yen, totals } from "./domain";
import ProductArt from "./components/ProductArt.vue";
import Icon from "./components/Icon.vue";
import OrderTotals from "./components/OrderTotals.vue";
const lines = computed(() =>
    state.value.cart.map((x) => ({
      ...x,
      p: {
        name: x.productName,
        slug: x.slug,
        color: "#e6ece6",
        art: "package",
      },
      v: { name: x.variantName, price: x.unitPrice },
    })),
  ),
  q = computed(() => totals(state.value.cartTotals || {})),
  removed = ref(null),
  undoButton = ref(null),
  busy = ref(false),
  loading = ref(true);
onMounted(async () => {
  await act(refreshCart);
  loading.value = false;
});
async function change(id, n) {
  if (busy.value) return;
  busy.value = true;
  const old = state.value.cart.find((x) => x.variantId === id);
  const r = await act(() => quantity(id, n));
  busy.value = false;
  if (r.ok && n === 0) {
    removed.value = old;
    nextTick(() => undoButton.value?.focus({ preventScroll: true }));
  }
}
async function undo() {
  if (!removed.value || busy.value) return;
  busy.value = true;
  const item = removed.value;
  const r = await act(
    () =>
      quantity(
        item.variantId,
        item.quantity +
          (state.value.cart.find((x) => x.variantId === item.variantId)
            ?.quantity || 0),
      ),
    "已恢复商品。",
  );
  busy.value = false;
  if (r.ok) removed.value = null;
}
</script>
<template>
  <div class="wrap page">
    <div class="breadcrumb">
      <RouterLink to="/">首页</RouterLink><span>/</span>购物袋
    </div>
    <div class="page-intro">
      <div>
        <h1>把喜欢带回家。</h1>
        <p>购物袋里的好物，等着融入你的日常。</p>
      </div>
      <span>{{ state.cart.reduce((s, x) => s + x.quantity, 0) }} 件商品</span>
    </div>
    <Transition name="feedback"
      ><div v-if="removed" class="undo-bar" role="status">
        <span>已移除 {{ removed.productName }}</span
        ><button ref="undoButton" class="text-button" @click="undo">
          撤销移除
        </button>
      </div></Transition
    >
    <p v-if="loading" role="status">正在读取购物袋…</p>
    <div v-else-if="!state.signedIn" class="empty">
      <h2>登录后查看你的购物袋</h2>
      <RouterLink class="button primary" to="/login?next=/cart"
        >登录 / 注册</RouterLink
      >
    </div>
    <div v-else-if="lines.length" class="checkout-layout">
      <div>
        <TransitionGroup tag="div" name="cart-list" class="cart-lines">
          <article v-for="l in lines" :key="l.variantId" class="cart-line">
            <RouterLink
              :to="'/products/' + l.p.slug"
              :aria-label="l.p.name"
              class="cart-image"
              :style="{ background: l.p.color }"
              ><ProductArt :kind="l.p.art" :dark="l.v.name === '深色'"
            /></RouterLink>
            <div class="cart-line-info">
              <small>{{ l.p.brand }}</small
              ><RouterLink :to="'/products/' + l.p.slug"
                ><h2>{{ l.p.name }}</h2></RouterLink
              >
              <p
                v-if="!l.isAvailable || l.quantity > l.availableQuantity"
                class="form-error"
              >
                该规格已下架或库存不足，请移除或减少数量。
              </p>
              <p>
                {{ l.v.name }} · 含税单价
                {{ yen(l.displayPrice) }}
              </p>
              <div class="quantity">
                <button
                  :aria-label="'减少 ' + l.p.name"
                  :disabled="busy || l.quantity === 1"
                  @click="change(l.variantId, l.quantity - 1)"
                >
                  −</button
                ><output>{{ l.quantity }}</output
                ><button
                  :aria-label="'增加 ' + l.p.name"
                  :disabled="
                    busy || l.quantity >= Math.min(l.availableQuantity, 99)
                  "
                  @click="change(l.variantId, l.quantity + 1)"
                >
                  +
                </button>
              </div>
            </div>
            <div class="line-end">
              <strong>{{ yen(l.lineTotal) }}</strong
              ><button
                class="text-button"
                :aria-label="'移除 ' + l.p.name"
                @click="change(l.variantId, 0)"
              >
                移除
              </button>
            </div>
          </article> </TransitionGroup
        ><RouterLink class="text-button continue-shopping" to="/products"
          >继续挑选好物</RouterLink
        >
      </div>
      <aside class="order-summary">
        <h2>订单预览</h2>
        <OrderTotals :quote="q" />
        <p class="muted">配送与优惠券将在结算时确认。购物袋不预占库存。</p>
        <RouterLink to="/checkout" class="button primary full"
          >前往结算 <Icon name="arrow"
        /></RouterLink>
        <div class="coupon-hint">
          金额以结算报价为准。<br /><small
            >优惠在服务端校验；购物袋不会预占库存。</small
          >
        </div>
      </aside>
    </div>
    <div v-else class="empty">
      <Icon name="bag" />
      <h2>购物袋还是空的</h2>
      <p>去发现一件让今天更开心的小物吧。</p>
      <RouterLink to="/products" class="button primary">开始挑选</RouterLink>
    </div>
  </div>
</template>
