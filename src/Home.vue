<script setup>
import { ref, onMounted } from "vue";
import { api } from "./api";
import { product } from "./domain";
import { state } from "./store";
import ProductArt from "./components/ProductArt.vue";
import ProductCard from "./components/ProductCard.vue";
import Icon from "./components/Icon.vue";
const products = ref([]),
  error = ref("");
async function load() {
  try {
    products.value = (await api("/api/store/products?pageSize=4")).items.map(
      product,
    );
    error.value = "";
  } catch (e) {
    error.value = e.message;
  }
}
onMounted(load);
</script>
<template>
  <div class="wrap home">
    <section class="hero">
      <div class="hero-copy">
        <span class="season"><span></span> 秋日生活提案</span>
        <h1>把日常，<br />过成喜欢的样子。</h1>
        <p>
          一盏柔光，一杯热茶，一段自己的时间。<br />从认真挑选的小物开始，让生活舒服一点。
        </p>
        <RouterLink to="/products" class="button primary"
          >发现日常好物 <Icon name="arrow"
        /></RouterLink>
        <div class="hero-foot">简单一点。刚刚好。</div>
      </div>
      <div
        class="hero-scene"
        aria-label="阅读灯、帆布包和陶瓷杯的生活选物插画"
        role="img"
      >
        <div class="scene-disc"></div>
        <div class="scene-shelf"></div>
        <ProductArt class="scene-lamp" kind="lamp" /><ProductArt
          class="scene-bag"
          kind="bag"
        /><ProductArt class="scene-mug" kind="mug" />
        <div class="scene-note">
          给平凡的一天<br /><strong>留一点温柔。</strong>
        </div>
        <span class="scene-caption">Mini Store / 秋日选物</span>
      </div>
    </section>
    <div class="benefits">
      <span><Icon name="truck" />日本境内配送</span
      ><span><Icon name="check" />认真挑选，日常耐用</span
      ><span><Icon name="bag" />清晰含税价格</span
      ><RouterLink to="/account/help"
        >了解购物服务 <Icon name="arrow"
      /></RouterLink>
    </div>
    <section class="section">
      <div class="section-heading">
        <div>
          <h2>从你的日常开始</h2>
          <p>每一种生活，都有值得喜欢的细节。</p>
        </div>
        <RouterLink to="/products">逛逛全部 <Icon name="arrow" /></RouterLink>
      </div>
      <div class="category-grid">
        <RouterLink
          v-for="(c, i) in state.categories"
          :key="c.id"
          :to="{ path: '/products', query: { category: c.slug } }"
          class="category-tile"
          :class="'category-' + i"
          ><div>
            <h3>{{ c.label }}</h3>
            <span>{{
              [
                "听见自己的节奏",
                "让工作更顺手",
                "自在出门去",
                "让家更舒服",
                "照顾每一天",
                "一口小满足",
              ][i]
            }}</span>
          </div>
          <ProductArt
            :kind="
              ['headphones', 'keyboard', 'bag', 'kettle', 'skincare', 'tea'][i]
            " /><Icon name="arrow"
        /></RouterLink>
      </div>
    </section>
    <section class="section">
      <div class="section-heading">
        <div>
          <h2>值得带回家的好物</h2>
          <p>不追赶流行，只挑选你会一直喜欢的。</p>
        </div>
        <RouterLink to="/products">更多好物 <Icon name="arrow" /></RouterLink>
      </div>
      <p v-if="error" role="alert">
        {{ error }} <button class="text-button" @click="load">重试</button>
      </p>
      <div class="product-grid">
        <ProductCard
          v-for="p in products.slice(0, 4)"
          :key="p.id"
          :product="p"
        />
      </div>
    </section>
    <section class="editorial">
      <div class="editorial-art">
        <ProductArt kind="kettle" /><ProductArt kind="tea" />
      </div>
      <div>
        <span class="season">属于自己的半小时</span>
        <h2>先放下忙碌，<br />再泡一杯喜欢的茶。</h2>
        <p>
          不必等到周末，也能给生活留白。<br />让茶香和暖意，陪你度过一个平常的午后。
        </p>
        <RouterLink
          :to="{
            path: '/products',
            query: {
              category: state.categories.find((c) => c.name === 'Food')?.slug,
            },
          }"
          class="button secondary"
          >挑选食饮好物 <Icon name="arrow"
        /></RouterLink>
      </div>
    </section>
    <section class="welcome-strip">
      <div>
        <h2>初次见面，一点心意。</h2>
        <p>发现喜欢的商品，结算时输入有效优惠码查看实际优惠。</p>
      </div>
      <RouterLink to="/products" class="button primary"
        >开始挑选 <Icon name="arrow"
      /></RouterLink>
    </section>
  </div>
</template>
