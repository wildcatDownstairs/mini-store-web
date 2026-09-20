<script setup>
import ProductArt from "./ProductArt.vue";
import Icon from "./Icon.vue";
import { yen } from "../domain";
import { state, favorite } from "../store";
defineProps({ product: Object, loading: Boolean });
</script>
<template>
  <!-- 使用真实卡片的容器和排版类，骨架随相同断点缩放。 -->
  <article v-if="loading" class="product-card skeleton-card" aria-hidden="true">
    <div class="product-visual skeleton-block"></div>
    <div class="card-meta">
      <span class="skeleton-block skeleton-brand">&nbsp;</span>
      <span class="skeleton-block skeleton-rating">&nbsp;</span>
    </div>
    <div class="product-name skeleton-block skeleton-name">&nbsp;</div>
    <div class="card-price skeleton-block skeleton-price">&nbsp;</div>
  </article>
  <article v-else class="product-card">
    <div class="product-visual" :style="{ background: product.color }">
      <RouterLink :to="'/products/' + product.slug" :aria-label="product.name"
        ><ProductArt :kind="product.art" /></RouterLink
      ><span v-if="product.tag" class="product-tag">{{ product.tag }}</span
      ><button
        class="favorite icon-button"
        :class="{ selected: state.favorites.includes(product.id) }"
        :aria-label="
          (state.favorites.includes(product.id) ? '取消收藏 ' : '收藏 ') +
          product.name
        "
        :aria-pressed="state.favorites.includes(product.id)"
        @click="favorite(product.id)"
      >
        <Icon name="heart" />
      </button>
    </div>
    <div class="card-meta">
      <span>{{ product.brand }}</span
      ><span class="rating"
        >★
        {{
          product.rating == null ? "暂无评分" : product.rating.toFixed(1)
        }}</span
      >
    </div>
    <RouterLink class="product-name" :to="'/products/' + product.slug">{{
      product.name
    }}</RouterLink>
    <div class="card-price">
      {{ yen(Math.round(product.price * (1 + product.taxRate))) }}
      <small>含税起</small
      ><span v-if="!product.variants.some((v) => v.stock)" class="sold-out"
        >暂时售罄</span
      >
    </div>
  </article>
</template>
