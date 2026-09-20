// 页面只保留展示转换；价格、库存、状态流转均由后端决定。
export const yen = (n) =>
  new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(n || 0);
export const date = (s) =>
  s ? new Date(s).toLocaleString("zh-CN", { timeZone: "Asia/Tokyo" }) : "—";
export const statusText = {
  pending: "待确认",
  confirmed: "待付款",
  paid: "已付款",
  processing: "配货中",
  shipped: "已发货",
  delivered: "已送达",
  cancelled: "已取消",
  returned: "已退货",
};
export const categoryNames = {
  Home: "居家生活",
  Electronics: "数码随行",
  Computers: "电脑配件",
  Fashion: "日常穿搭",
  Food: "食饮时光",
  Beauty: "美妆护理",
};
export const totals = (t = {}) => ({
  subtotal: t.subtotal || 0,
  discount: t.discountTotal || 0,
  tax: t.taxTotal || 0,
  shipping: t.shippingTotal || 0,
  total: t.grandTotal || 0,
});
export const address = (a) => ({
  ...a,
  name: a.recipientName,
  line1: a.addressLine1,
  line2: a.addressLine2,
});
export const addressBody = (a) => ({
  addressType: "shipping",
  recipientName: a.name,
  postalCode: a.postalCode,
  countryCode: "JP",
  prefecture: a.prefecture,
  city: a.city,
  addressLine1: a.line1,
  addressLine2: a.line2 || null,
  phone: a.phone,
  isDefault: a.isDefault,
});
export function product(p) {
  return {
    ...p,
    brand: p.brand.name,
    brandId: p.brand.id,
    category: p.categories?.[0]?.name || "全部好物",
    categorySlug: p.categories?.[0]?.slug,
    price: p.price.amount,
    taxRate: 0,
    rating: p.rating,
    color: "#e6ece6",
    art: "package",
    variants: (
      p.variants || [{ stock: p.stockStatus === "in_stock" ? 1 : 0 }]
    ).map((v) => ({
      ...v,
      stock: v.isActive === false ? 0 : (v.availableQuantity ?? v.stock),
    })),
  };
}
export function order(o) {
  return {
    ...o,
    ...totals(o.totals || { grandTotal: o.grandTotal }),
    number: o.orderNumber,
    createdAt: o.placedAt,
    paymentAttempts: (o.payments || []).map((p) => ({ ...p, at: p.createdAt })),
    lines: (o.items || []).map((l) => ({
      ...l,
      variantId: l.id,
      name: l.productName,
      total: l.lineTotal,
      art: "package",
      color: "#e6ece6",
    })),
    address: address(
      o.addresses?.find((a) => a.addressType === "shipping") || {},
    ),
    history: (o.history || []).map((h) => ({
      ...h,
      status: h.toStatus,
      at: h.createdAt,
    })),
    shipment: o.shipments?.[0]
      ? { ...o.shipments[0], tracking: o.shipments[0].trackingNumber }
      : null,
  };
}
