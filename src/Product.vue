<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "./api";
import { yen, product as adapt } from "./domain";
import { state, act, favorite, quantity as setQuantity } from "./store";
import ProductArt from "./components/ProductArt.vue";
import ProductCard from "./components/ProductCard.vue";
import Icon from "./components/Icon.vue";
const route = useRoute(),
  router = useRouter(),
  selected = ref(0),
  quantity = ref(1),
  view = ref(0),
  added = ref(false),
  product = ref(null),
  products = ref([]),
  reviews = ref([]),
  reviewPage = ref(1),
  reviewTotal = ref(0),
  busy = ref(false),
  error = ref("");
let addedTimer,
  rev = 0;
onBeforeUnmount(() => {
  clearTimeout(addedTimer);
  rev++;
});
const v = computed(() => product.value?.variants[selected.value]),
  stock = computed(() => v.value?.stock || 0);
async function load() {
  const current = ++rev;
  product.value = null;
  error.value = "";
  busy.value = true;
  selected.value = 0;
  quantity.value = 1;
  view.value = 0;
  reviewPage.value = 1;
  try {
    const p = adapt(
      await api("/api/store/products/" + encodeURIComponent(route.params.slug)),
    );
    p.variants = p.variants.filter((v) => v.isActive);
    if (current !== rev) return;
    product.value = p;
    await loadReviews();
    products.value = (await api("/api/store/products?pageSize=4")).items.map(
      adapt,
    );
  } catch (e) {
    if (current === rev) error.value = e.message;
  } finally {
    if (current === rev) busy.value = false;
  }
}
async function loadReviews() {
  const id = product.value?.id;
  if (!id) return;
  try {
    const r = await api(
      `/api/store/products/${id}/reviews?pageSize=6&page=${reviewPage.value}`,
    );
    if (product.value?.id === id) {
      reviews.value = r.items;
      reviewTotal.value = r.total;
    }
  } catch (e) {
    error.value = e.message;
  }
}
watch(() => route.params.slug, load, { immediate: true });
watch(reviewPage, loadReviews);
watch(selected, () => (quantity.value = 1));
watch([selected, quantity], () => (added.value = false));
async function add() {
  if (!state.value.signedIn) {
    router.push({ path: "/login", query: { next: route.fullPath } });
    return;
  }
  busy.value = true;
  const result = await act(
    () =>
      setQuantity(
        v.value.id,
        quantity.value +
          (state.value.cart.find((x) => x.variantId === v.value.id)?.quantity ||
            0),
      ),
    "已加入购物袋。",
  );
  busy.value = false;
  if (result.ok) {
    added.value = true;
    clearTimeout(addedTimer);
    addedTimer = setTimeout(() => (added.value = false), 1800);
  }
}
</script>
<template>
  <div v-if="product && v" class="wrap page">
    <div class="breadcrumb">
      <RouterLink to="/">首页</RouterLink><span>/</span
      ><RouterLink
        :to="{ path: '/products', query: { category: product.categorySlug } }"
        >{{ product.category }}</RouterLink
      ><span>/</span>{{ product.name }}
    </div>
    <div class="product-detail">
      <div>
        <div class="detail-art" :style="{ background: product.color }">
          <span class="product-tag">{{ product.tag || "日常之选" }}</span
          ><ProductArt
            :kind="product.art"
            :dark="selected === 1"
            :class="{ closer: view === 1 }"
          /><span class="art-label">原创示意插画 · 以规格选择为准</span>
        </div>
        <div class="thumbnails">
          <button
            :class="{ active: view === 0 }"
            aria-label="查看商品全貌"
            @click="view = 0"
          >
            <ProductArt :kind="product.art" :dark="selected === 1" /></button
          ><button
            :class="{ active: view === 1 }"
            aria-label="查看商品细节"
            @click="view = 1"
          >
            <ProductArt
              :kind="product.art"
              :dark="selected === 1"
              class="closer"
            />
          </button>
        </div>
      </div>
      <div class="product-info">
        <span class="brand">{{ product.brand }}</span>
        <h1>{{ product.name }}</h1>
        <p>{{ product.description }}</p>
        <a href="#reviews" class="detail-rating"
          >★
          {{ product.rating == null ? "暂无评分" : product.rating.toFixed(1) }}
          <span>{{ product.reviewCount }} 条评分</span></a
        >
        <div class="detail-price" :key="v.id" aria-live="polite">
          {{ yen(v.displayPrice) }}<small>含税 / 税前 {{ yen(v.price) }}</small>
        </div>
        <fieldset>
          <legend>
            规格 <strong>{{ v.name }}</strong>
          </legend>
          <div class="variant-options">
            <button
              v-for="(variant, i) in product.variants"
              :key="variant.id"
              :class="{ active: selected === i }"
              :aria-pressed="selected === i"
              @click="selected = i"
            >
              <span :style="{ background: i ? '#3a5353' : '#c3c2a0' }"></span
              >{{ variant.name }}
            </button>
          </div>
        </fieldset>
        <div class="stock" :class="{ unavailable: !stock }">
          {{ stock ? "● 现货，可售 " + stock + " 件" : "○ 该规格暂时售罄" }}
        </div>
        <div class="buy-row">
          <div class="quantity">
            <button
              :disabled="quantity <= 1"
              aria-label="减少数量"
              @click="quantity--"
            >
              −</button
            ><output :key="quantity" aria-label="购买数量">{{
              quantity
            }}</output
            ><button
              :disabled="quantity >= Math.min(stock, 99)"
              aria-label="增加数量"
              @click="quantity++"
            >
              +
            </button>
          </div>
          <button
            class="button primary"
            :class="{ 'is-added': added }"
            :disabled="!stock || busy"
            @click="add"
          >
            <Icon :name="added ? 'check' : 'bag'" />{{
              !stock ? "暂时售罄" : added ? "已加入购物袋" : "加入购物袋"
            }}</button
          ><button
            class="icon-button outline"
            :class="{ selected: state.favorites.includes(product.id) }"
            :aria-pressed="state.favorites.includes(product.id)"
            :aria-label="
              state.favorites.includes(product.id) ? '取消收藏' : '收藏商品'
            "
            @click="favorite(product.id)"
          >
            <Icon name="heart" />
          </button>
        </div>
        <RouterLink to="/cart" class="text-button">查看购物袋</RouterLink>
        <div class="detail-service">
          <p><Icon name="truck" /> 标准配送预计 2–4 个工作日</p>
          <p><Icon name="check" /> 折后税前满 ¥8,000 标准配送免运费</p>
        </div>
        <details open>
          <summary>商品介绍</summary>
          <p>
            {{
              product.category === "食饮时光"
                ? "为日常饮用挑选，独立包装，享受每次打开的香气。"
                : "为日常使用而设计，注重轻便、触感和耐用性。"
            }}{{ product.description }} 由 {{ product.brand }} 用心设计。
          </p>
          <dl class="spec-list">
            <dt>品牌</dt>
            <dd>{{ product.brand }}</dd>
            <dt>商品编码</dt>
            <dd>{{ v.sku }}</dd>
            <dt>规格</dt>
            <dd>{{ v.name }}</dd>
            <dt>{{ product.category === "食饮时光" ? "保存" : "保养" }}</dt>
            <dd>
              {{
                product.category === "食饮时光"
                  ? "密封存放于阴凉干燥处，开封后尽早享用。"
                  : "请置于干燥环境，按商品随附说明使用。"
              }}
            </dd>
          </dl>
        </details>
        <details>
          <summary>配送与退换</summary>
          <p>
            仅配送至日本境内。标准配送 ¥500，快捷配送
            ¥900。退换规则和演示范围请查看<RouterLink to="/account/help"
              >购物服务说明</RouterLink
            >。
          </p>
        </details>
      </div>
    </div>
    <section id="reviews" class="section">
      <div class="section-heading">
        <div>
          <h2>来自日常的喜欢</h2>
          <p>已审核的购买评价。</p>
        </div>
        <strong class="rating">{{
          product.rating == null
            ? "暂无评分"
            : "★ " + product.rating.toFixed(1) + " / 5"
        }}</strong>
      </div>
      <div class="review-grid">
        <article v-for="r in reviews" :key="r.id" class="review">
          <div class="rating">
            {{ "★".repeat(r.rating) + "☆".repeat(5 - r.rating) }}
          </div>
          <h3 v-if="r.title">{{ r.title }}</h3>
          <p>{{ r.content || "此用户仅提交了评分。" }}</p>
          <small
            >{{ r.author }} ·
            {{ r.isVerifiedPurchase ? "已购买" : "用户评价" }}</small
          >
        </article>
      </div>
    </section>
    <nav v-if="reviewTotal > 6" class="pagination">
      <button :disabled="reviewPage === 1" @click="reviewPage--">
        上一页评价</button
      ><span>{{ reviewPage }}</span
      ><button :disabled="reviewPage * 6 >= reviewTotal" @click="reviewPage++">
        下一页评价
      </button>
    </nav>
    <section class="section">
      <div class="section-heading"><h2>也许你还会喜欢</h2></div>
      <div class="product-grid">
        <ProductCard
          v-for="p in products.filter((p) => p.id !== product.id).slice(0, 4)"
          :key="p.id"
          :product="p"
        />
      </div>
    </section>
  </div>
  <div v-else class="wrap empty">
    <h1>{{ busy ? "正在加载好物…" : error || "该商品暂无可售规格" }}</h1>
    <button v-if="!busy" class="text-button" @click="load">重新加载</button>
    <RouterLink to="/products" class="button primary">返回全部好物</RouterLink>
  </div>
</template>
