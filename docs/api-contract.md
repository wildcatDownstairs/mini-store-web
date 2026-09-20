> 历史设计记录：此文件描述早期 Mock 阶段；当前实际实现和接入方式以根 README 与 [API 接入提示词](api-integration-prompt.md) 为准。

# 未来 ASP.NET Core API 契约草案

这是设计草案，当前没有真实接口。基于已检查的 mini-store/db/03_tables.sql 与 docs/database_design.md。数据库共 23 表、8 领域；前台只消费业务 DTO，绝不直连 PostgreSQL、不暴露 password_hash 或内部 bigint。

## 路由与关系

| 接口                                                                          | DTO / 业务                                                              | 数据来源                                                                                |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| GET /api/store/categories                                                     | CategoryTreeDto（id/name/slug/children）                                | catalog.categories                                                                      |
| GET /api/store/brands                                                         | BrandSummaryDto                                                         | catalog.brands                                                                          |
| GET /api/store/products?q=&category=&brand=&sort=&page=1&pageSize=24&inStock= | ProductSummaryDto 分页                                                  | products + brands + product_categories + images + variants + stocks + published reviews |
| GET /api/store/products/{slug}                                                | ProductDetailDto，变体、规格、可售库存、含税展示价格、图集              | catalog + inventory 汇总                                                                |
| GET /api/store/products/{publicId}/reviews?page=                              | 公开评价分页，仅 published                                              | review.product_reviews                                                                  |
| GET /api/me                                                                   | CustomerProfileDto                                                      | account.customers                                                                       |
| GET /api/me/addresses                                                         | AddressDto[]                                                            | account.customer_addresses                                                              |
| POST /api/me/addresses                                                        | CreateAddressRequest                                                    | 地址创建，默认标记事务                                                                  |
| PUT /api/me/addresses/{addressId}                                             | UpdateAddressRequest                                                    | 当前用户地址归属校验                                                                    |
| DELETE /api/me/addresses/{addressId}                                          | 无内容                                                                  | 历史订单快照不变                                                                        |
| GET /api/me/cart                                                              | CartDto + 商品可售状态                                                  | sales.carts + cart_items + catalog                                                      |
| PUT /api/me/cart/items/{variantPublicId}                                      | { quantity }                                                            | 合并 SKU，不信任客户端价格                                                              |
| DELETE /api/me/cart/items/{variantPublicId}                                   | 无内容                                                                  | 仅当前用户 active cart                                                                  |
| POST /api/me/checkout/quote                                                   | { addressId, shippingMethod, couponCode } → CheckoutQuoteDto            | catalog/inventory/marketing；服务端重算                                                 |
| POST /api/me/orders                                                           | { quoteToken, addressId, shippingMethod, couponCode } + Idempotency-Key | 重新验证报价，原子创建订单、快照、优惠核销、库存预占和购物车 converted                  |
| GET /api/me/orders?status=&page=&pageSize=                                    | OrderSummaryDto 分页                                                    | sales.orders + items + payments + shipments                                             |
| GET /api/me/orders/{publicId}                                                 | OrderDetailDto：快照、金额、支付尝试、物流、时间线                      | sales/payment/shipping                                                                  |
| POST /api/me/orders/{publicId}/cancel                                         | CancelOrderRequest                                                      | 合法状态校验、取消、释放预占、核销恢复策略                                              |
| POST /api/me/orders/{publicId}/payment-attempts                               | { provider, method } → 支付会话                                         | payment.payments，支付网关后续接入                                                      |
| POST /api/payments/webhooks/{provider}                                        | 签名校验、幂等事件处理                                                  | payment → sales，浏览器不可决定 captured                                                |
| POST /api/me/orders/{publicId}/items/{orderItemId}/review                     | { rating,title,content }                                                | 购买关系及 delivered 校验，pending review                                               |

## DTO 示例

```json
{
  "items": [
    {
      "id": "01996000-0000-7000-8000-000000000001",
      "slug": "quiet-lamp",
      "name": "余光 · 无线阅读灯",
      "brand": { "id": "public-uuid", "name": "Sora Living" },
      "price": { "amount": 6820, "currency": "JPY", "includesTax": true },
      "thumbnail": { "url": "/assets/lamp.webp", "alt": "原色无线阅读灯" },
      "stockStatus": "in_stock",
      "rating": 4.7,
      "reviewCount": 26
    }
  ],
  "page": 1,
  "pageSize": 24,
  "total": 5000
}
```

ProductDetailDto 增加 variants[]（publicId,sku,name,attributes,price,currency,availableQuantity）、images[]、description、categories[]。生产不把仓库 ID 和每仓余额暴露给普通消费者。

CheckoutQuoteDto 包含 quoteToken/expiresAt、lines[]（variantId/quantity/unitPrice/discountAmount/taxAmount/lineTotal）、subtotal/discountTotal/taxTotal/shippingTotal/grandTotal/currency，以及当前商品变动的说明。此 Token 需要服务端持久化或签名，不能使用客户端金额作为事实。

OrderDetailDto 以 publicId 定位，并返回 orderNumber/status/placedAt、商品快照、shippingAddress/billingAddress、totals、paymentSummary、shipments[]、history[]。订单详情即使商品改价/下架仍能展示。

## 重要数据库差距（实施 API 时处理）

- 主要业务实体已有 public_id。customer_addresses 和 order_items 当前只有 bigint；如希望全 API 统一 UUID，应添加 public_id migration。不能假定现有表具备 UUID，也不能把 Mock ID 当现有 DB 主键。所有行仍须校验客户归属。
- 税率和配送费是当前实验计价策略，数据库没有单独的税率/运费规则表。API 用显式策略实现即可；暂不增加通用规则引擎。
- 数据库存在合法状态流转约束。Mock 在付款成功时补充 confirmed → paid 历史；真实 API 应在后端事务中遵循 pending → confirmed → paid 的约束，并写完整 history，不允许浏览器任意改状态。
- 幂等键/quoteToken 当前未建持久化表。真实服务需持久化幂等请求（客户+键唯一）和结果，不能仅依赖当前浏览器内存。
- payment 由签名 webhook/服务端查询确认；Mock 的 pay(success) 仅用于交互。外部付款与 PostgreSQL 不是同一事务，未来再按需要引入 outbox。
- 收藏是本地体验扩展，当前数据库没有 wishlist；要跨设备同步时再添加关系表与接口。
- Mock HELLO10 为固定演示规则，无期限/总额度消费；真实 coupon 必须核对 starts_at/ends_at/is_active/usage_limit，锁定核销并明确取消时额度恢复规则。
- 地址和 order items API 定位策略、退货入口、身份认证是下一阶段，不伪装成已接通功能。

## 查询、并发与安全

列表稳定排序使用 (created_at,id)，价格排序需选定有效 SKU 的最低含税价；先按产品分页再聚合，避免 JOIN 展开导致重复分页。搜索首版用 ILIKE，性能由真实 EXPLAIN 决定是否添加 trigram。pageSize 最大 100，sort 使用白名单。

订单查询使用 orders(customer_id,created_at DESC,id DESC)；商品 slug、SKU 唯一索引；库存按 SKU 汇总可售量。后端预占应按确定的仓库/variant 顺序加锁，事务内检查价格、库存与优惠，写入快照和流水。不能把跨仓总可售量当作某一仓可直接发货数量。

认证使用服务端会话或规范 token，Cookie 方案需 CSRF 防护。所有 /me 路由从登录主体提取 customer_id，禁止接受客户端 customerId 作为授权依据。管理端独立授权。错误统一 `{success:false,code,msg,data:null}`（无 `message`）：400 校验、401 未登录、404 不存在/不归属、409 库存/报价/状态冲突、422 优惠不适用；前台保留用户输入并给出可恢复路径。

当前实际接口由后端 OpenAPI 定义。成功响应统一为 `{success:true,code,msg,data}`，HTTP 入口只返回 `data` 给页面；分页读取 `records/current/size/total/pages` 等公司 TableModel 字段。请求保留 `page/pageSize`，上限 100；无业务数据的写入返回 200、`data:null`。订单与购物袋的 `items` 仍为业务明细字段。
