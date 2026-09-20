import { test } from "node:test";
import assert from "node:assert/strict";
import { product, order, addressBody, totals } from "../src/domain.js";

test("含税价格直接展示，停售规格不可加购", () => {
  const p = product({
    id: "product-uuid",
    name: "阅读灯",
    brand: { id: "brand", name: "Sora" },
    price: { amount: 1100, includesTax: true },
    variants: [{ id: "variant", isActive: false, availableQuantity: 12 }],
  });
  assert.equal(p.price, 1100);
  assert.equal(p.variants[0].stock, 0);
  assert.equal(p.brandId, "brand");
});
test("订单展示使用服务端成交快照与订单项 UUID", () => {
  const o = order({
    orderNumber: "JP-EXAMPLE",
    totals: {
      subtotal: 1000,
      discountTotal: 100,
      taxTotal: 90,
      shippingTotal: 500,
      grandTotal: 1490,
    },
    items: [{ id: "item-uuid", productName: "下单时的名称", lineTotal: 990 }],
    addresses: [
      {
        addressType: "shipping",
        recipientName: "佐藤 美咲",
        addressLine1: "千代田1-1",
      },
    ],
    history: [{ toStatus: "paid", createdAt: "2026-09-20T00:00:00Z" }],
  });
  assert.equal(o.total, 1490);
  assert.equal(o.lines[0].name, "下单时的名称");
  assert.equal(o.lines[0].variantId, "item-uuid");
  assert.equal(o.address.name, "佐藤 美咲");
  assert.equal(o.history[0].status, "paid");
});
test("地址请求只发送允许编辑的字段，金额不由前端重算", () => {
  const body = addressBody({
    name: "佐藤",
    line1: "千代田1-1",
    countryCode: "US",
    customerId: "someone-else",
    isDefault: true,
  });
  assert.equal(body.countryCode, "JP");
  assert.equal(body.addressLine2, null);
  assert.ok(!("customerId" in body));
  assert.equal(totals({ grandTotal: 123 }).total, 123);
});
