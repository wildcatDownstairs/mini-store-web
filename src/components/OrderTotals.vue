<script setup>
import { yen } from "../domain";
defineProps({ quote: Object });
</script>
<template>
  <dl class="totals">
    <dt>商品金额（税前）</dt>
    <dd>{{ yen(quote.subtotal) }}</dd>
    <dt>优惠折扣</dt>
    <dd>−{{ yen(quote.discount) }}</dd>
    <dt>消费税</dt>
    <dd>{{ yen(quote.tax) }}</dd>
    <dt>配送费</dt>
    <dd>{{ quote.shipping ? yen(quote.shipping) : "免费" }}</dd>
    <dt class="grand">合计（含税）</dt>
    <dd :key="quote.total" class="grand" aria-live="polite">
      {{ yen(quote.total) }}
    </dd>
  </dl>
</template>
