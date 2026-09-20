<script setup>
import { computed, ref, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api, query as params } from "./api";
import { product as adapt } from "./domain";
import { state } from "./store";
import ProductCard from "./components/ProductCard.vue";
import Icon from "./components/Icon.vue";
import StoreSelect from "./components/StoreSelect.vue";
const route = useRoute(),
  router = useRouter(),
  brand = ref(""),
  inStock = ref(false),
  page = ref(1),
  shown = ref([]),
  total = ref(0),
  busy = ref(false),
  error = ref(""),
  resultsHeading = ref(null);
const favorites = computed(() => route.path === "/favorites"),
  category = computed(
    () =>
      state.value.categories.find((c) => c.slug === route.query.category)
        ?.label || "全部好物",
  ),
  sort = computed(() => route.query.sort || "recommended"),
  keyword = computed(() => String(route.query.q || "")),
  pages = computed(() => Math.max(1, Math.ceil(total.value / 8))),
  numbers = computed(() =>
    Array.from(
      { length: Math.min(5, pages.value) },
      (_, i) => Math.max(1, Math.min(page.value - 2, pages.value - 4)) + i,
    ),
  );
let revision = 0;
async function load(scrollToResults = false) {
  const rev = ++revision;
  busy.value = true;
  error.value = "";
  try {
    let r;
    if (favorites.value) {
      const results = await Promise.all(
        state.value.favorites.map((id) =>
          api("/api/store/products/by-id/" + id).catch((e) => {
            if (e.status === 404) return null;
            throw e;
          }),
        ),
      );
      let items = results
        .filter(Boolean)
        .map(adapt)
        .filter(
          (p) =>
            (!brand.value || p.brandId === brand.value) &&
            (!inStock.value || p.stockStatus === "in_stock") &&
            (!route.query.category ||
              p.categories?.some(
                (c) =>
                  c.slug === route.query.category ||
                  state.value.categories
                    .find((x) => x.slug === route.query.category)
                    ?.children.some((x) => x.id === c.id),
              )) &&
            (!keyword.value ||
              p.name.toLowerCase().includes(keyword.value.toLowerCase())),
        );
      if (sort.value.startsWith("price_"))
        items.sort((a, b) =>
          sort.value === "price_asc" ? a.price - b.price : b.price - a.price,
        );
      if (sort.value === "rating")
        items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      r = {
        total: items.length,
        items: items.slice((page.value - 1) * 8, page.value * 8),
      };
    } else {
      const data = await api(
        "/api/store/products?" +
          params({
            page: page.value,
            pageSize: 8,
            q: keyword.value,
            sort: sort.value,
            category: route.query.category,
            brand: brand.value,
            inStock: inStock.value,
          }),
      );
      r = { ...data, items: data.records.map(adapt) };
    }
    if (rev === revision) {
      shown.value = r.items;
      total.value = r.total;
      if (page.value > pages.value) page.value = pages.value;
    }
  } catch (e) {
    if (rev === revision) {
      error.value = e.message;
      shown.value = [];
    }
  } finally {
    if (rev === revision) {
      busy.value = false;
      if (scrollToResults === true && !error.value) {
        await nextTick();
        // 翻页成功后回到结果区；焦点同步，键盘和读屏用户也能从新结果继续。
        resultsHeading.value?.focus({ preventScroll: true });
        resultsHeading.value?.scrollIntoView({
          block: "start",
          behavior: "instant",
        });
      }
    }
  }
}
watch(
  [() => route.fullPath, brand, inStock, () => state.value.favorites.join(",")],
  () => {
    if (page.value !== 1) page.value = 1;
    else load();
  },
);
watch(page, () => load(true));
load();
function query(key, value) {
  router.replace({ query: { ...route.query, [key]: value || undefined } });
}
function reset() {
  brand.value = "";
  inStock.value = false;
  router.replace({ path: route.path, query: {} });
}
</script>
<template>
  <div class="wrap page">
    <div class="breadcrumb">
      <RouterLink to="/">首页</RouterLink><span>/</span
      >{{ favorites ? "我的收藏" : "全部好物" }}
    </div>
    <div class="page-intro">
      <div>
        <h1>
          {{
            favorites
              ? "把喜欢，留在这里。"
              : keyword
                ? "寻找「" + keyword + "」"
                : category === "全部好物"
                  ? "认真挑选，慢慢喜欢。"
                  : category
          }}
        </h1>
        <p>
          {{
            favorites
              ? "心动的小物，随时回来看看。"
              : "从早晨到夜晚，为每个日常挑一点好物。"
          }}
        </p>
      </div>
      <span role="status" aria-live="polite">
        <span
          v-if="busy"
          class="skeleton-block skeleton-count"
          aria-hidden="true"
        >&nbsp;</span>
        <span v-if="busy" class="visually-hidden">正在加载商品</span>
        <template v-else>{{ total }} 件好物</template>
      </span>
    </div>
    <div
      class="catalog-layout"
      :class="{ 'catalog-empty-favorites': favorites && !state.favorites.length }"
    >
      <aside v-if="!favorites || state.favorites.length" class="filters">
        <h2>商品分类</h2>
        <button
          v-for="c in [
            { id: 'all', slug: '', label: '全部好物' },
            ...state.categories,
          ]"
          :key="c.id"
          :class="{ active: category === c.label }"
          @click="query('category', c.slug)"
        >
          {{ c.label }}
        </button>
        <StoreSelect
          v-model="brand"
          searchable
          label="品牌"
          :options="[
            { value: '', label: '所有品牌' },
            ...state.brands.map((b) => ({ value: b.id, label: b.name })),
          ]"
        />
        <label class="checkbox"
          ><input v-model="inStock" type="checkbox" />仅看有货</label
        ><button class="text-button" @click="reset">清除筛选</button>
        <div class="filter-note">选一件喜欢的，<br />就能让今天不同。</div>
      </aside>
      <div>
        <div
          ref="resultsHeading"
          class="list-toolbar"
          tabindex="-1"
          role="region"
          aria-label="商品查询结果"
        >
          <span
            >{{ category }}
            <button v-if="keyword" class="text-button" @click="query('q', '')">
              清除搜索 ×
            </button></span
          >
          <StoreSelect
            :model-value="sort"
            @update:model-value="query('sort', $event)"
            v-if="!favorites || state.favorites.length"
            label="排序"
            inline
            :options="[
              { value: 'recommended', label: '最新上架' },
              { value: 'price_asc', label: '价格从低到高' },
              { value: 'price_desc', label: '价格从高到低' },
              { value: 'rating', label: '评分最高' },
            ]"
          />
        </div>
        <div
          v-if="busy"
          class="product-grid catalog-grid"
          aria-busy="true"
          aria-label="商品加载中"
        >
          <ProductCard v-for="n in 8" :key="n" loading />
        </div>
        <div v-else-if="error" role="alert" class="notice">
          {{ error }} <button class="text-button" @click="load">重试</button>
        </div>
        <TransitionGroup
          v-else-if="shown.length"
          tag="div"
          name="products"
          class="product-grid catalog-grid"
        >
          <ProductCard v-for="p in shown" :key="p.id" :product="p" />
        </TransitionGroup>
        <div v-else class="empty">
          <Icon :name="favorites ? 'heart' : 'search'" />
          <h2>
            {{ favorites ? "还没有收藏的好物" : "没有找到符合条件的商品" }}
          </h2>
          <p>试试其他分类，或放宽筛选条件。</p>
          <RouterLink v-if="favorites" class="button primary" to="/products"
            >去发现好物</RouterLink
          ><button v-else class="button secondary" @click="reset">
            清除筛选
          </button>
        </div>
        <nav v-if="pages > 1" class="pagination" aria-label="商品分页">
          <button :disabled="busy || page === 1" @click="page--">上一页</button
          ><button
            v-for="n in numbers"
            :key="n"
            class="page-number"
            :disabled="busy"
            :aria-current="page === n ? 'page' : undefined"
            :class="{ active: page === n }"
            @click="page = n"
          >
            {{ n }}</button
          >
          <span class="pagination-status" role="status">
            {{ page }} / {{ pages }}
          </span>
          <button :disabled="busy || page === pages" @click="page++">
            下一页
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
