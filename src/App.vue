<script setup>
import { computed, ref, nextTick, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import Icon from "./components/Icon.vue";
import { state, message, messageType, init } from "./store";
const search = ref(""),
  router = useRouter(),
  route = useRoute(),
  count = computed(() => state.value.cart.reduce((s, x) => s + x.quantity, 0));
function pageReady() {
  const h = document.querySelector("main h1");
  if (h) {
    document.title = h.textContent + " · Mini Store";
    h.setAttribute("tabindex", "-1");
    if (!h.closest("main").contains(document.activeElement))
      h.focus({ preventScroll: true });
  }
}
onMounted(() => {
  init();
  nextTick(pageReady);
});
watch(
  () => route.query.q,
  (q) => (search.value = String(q || "")),
);
function find() {
  router.push({
    path: "/products",
    query: search.value ? { q: search.value } : {},
  });
}
</script>
<template>
  <a class="skip-link" href="#main">跳至主要内容</a>
  <div class="announcement">
    日常的小美好，认真为你挑选 <span>折后税前满 ¥8,000 标准配送免运费</span>
  </div>
  <header class="header">
    <div class="header-main wrap">
      <RouterLink to="/" class="logo" aria-label="Mini Store 首页"
        ><span class="logo-mark">m<span>•</span></span>
        <div>mini store<small>日 常 选 物</small></div></RouterLink
      >
      <form class="search" @submit.prevent="find">
        <Icon name="search" /><input
          v-model="search"
          aria-label="搜索商品"
          placeholder="寻找你的日常好物"
        /><button type="submit">搜索</button>
      </form>
      <div class="header-actions">
        <RouterLink to="/favorites" class="icon-button" aria-label="我的收藏"
          ><Icon name="heart" /></RouterLink
        ><RouterLink
          to="/account/orders"
          class="icon-button"
          aria-label="我的账户"
          ><Icon name="user" /></RouterLink
        ><RouterLink
          to="/cart"
          class="icon-button bag-button"
          aria-label="购物袋"
          ><Icon name="bag" /><span v-if="count" :key="count" class="count">{{
            count
          }}</span></RouterLink
        >
      </div>
    </div>
    <nav class="navigation wrap" aria-label="主导航">
      <RouterLink to="/" :class="{ 'nav-current': route.path === '/' }"
        >首页</RouterLink
      ><RouterLink
        to="/products"
        :class="{
          'nav-current': route.path === '/products' && !route.query.category,
        }"
        >全部好物</RouterLink
      ><RouterLink
        v-for="c in state.categories"
        :key="c.id"
        :class="{
          'nav-current':
            route.path === '/products' && route.query.category === c.slug,
        }"
        :to="{ path: '/products', query: { category: c.slug } }"
        >{{ c.label }}</RouterLink
      ><span class="nav-note">为每一天，多一点喜欢。</span>
    </nav>
  </header>
  <main id="main">
    <RouterView v-slot="{ Component }"
      ><Transition name="page" mode="out-in" @after-enter="pageReady"
        ><div :key="route.path" class="route-content">
          <component :is="Component" /></div></Transition
    ></RouterView>
  </main>
  <footer>
    <div class="wrap footer-top">
      <div>
        <RouterLink to="/" class="footer-logo"
          >mini store<span>日常选物</span></RouterLink
        >
        <p>少一点将就，多一点喜欢。<br />把舒服、实用和好看，放进每一天。</p>
      </div>
      <div>
        <h3>慢慢挑选</h3>
        <RouterLink to="/products">全部好物</RouterLink
        ><RouterLink to="/favorites">我的收藏</RouterLink>
      </div>
      <div>
        <h3>购物服务</h3>
        <RouterLink to="/account/orders">订单与配送</RouterLink
        ><RouterLink to="/account/addresses">收货地址</RouterLink
        ><RouterLink to="/account/help">配送与退换说明</RouterLink>
      </div>
      <div class="footer-message">
        日常，是最值得用心的事。<span>Made for the everyday.</span>
      </div>
    </div>
    <div class="wrap footer-bottom">
      <span>© {{ new Date().getFullYear() }} Mini Store · 日本 / JPY</span
      ><span>本地学习商城 · 支付模拟不扣款</span>
    </div>
  </footer>
  <Transition name="toast"
    ><div
      v-if="message"
      :role="messageType === 'error' ? 'alert' : 'status'"
      class="toast"
      :class="{ 'toast-error': messageType === 'error' }"
    >
      <Icon :name="messageType === 'error' ? 'close' : 'check'" /><span>{{
        message
      }}</span
      ><button class="icon-button" aria-label="关闭提示" @click="message = ''">
        <Icon name="close" />
      </button></div
  ></Transition>
</template>
