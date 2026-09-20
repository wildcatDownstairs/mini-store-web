# Mini Store Storefront

Vue 3 + Vite 的日常选物商城。保留自定义下拉框、键盘操作、弹窗动效与从文字中央展开的下划线。

首页、商品搜索/筛选/排序/分页、详情与规格、购物袋、报价下单、注册/登录、个人资料、地址、订单/物流/模拟付款和购买评价均已接入 API。

收藏保存在当前浏览器；商品用原创示意插画，种子图片地址不是商品实拍。其余业务数据不再保存在 localStorage。种子客户不能用任意密码登录，请在注册页创建自己的账号。

## 启动

先按 [后端 README](https://github.com/wildcatDownstairs/mini-store-api) 准备 `ecommerce_lab` 并启动 API。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

打开 http://127.0.0.1:5174 。默认 API 为 http://127.0.0.1:5274；如需修改，将 `.env.example` 复制为 `.env` 并调整 `VITE_API_BASE_URL`，同时在后端允许该页面来源。`VITE_` 变量会进入浏览器代码，只能放公开地址，不能放数据库密码。

## 验证

```bash
pnpm test
# 接口计算与权限的完整测试在后端 scripts/test_api.py
pnpm build
```

本地测试覆盖服务端金额/快照映射、地址字段边界及下拉框键盘行为。 浏览器已实际完成商城下单、付款、后台配货发货签收、客户评价及后台发布；后端隔离库另有 60 个 HTTP 检查和 SQL 一致性审计。结果见 [后端验证报告](https://github.com/wildcatDownstairs/mini-store-api/blob/main/docs/backend/verification.md)。

## 代码入口

- `src/api.js`：统一请求、访问令牌、失败处理。
- `src/store.js`：当前会话与页面操作状态。
- `src/domain.js`：API DTO 到视图的展示映射，不重新计算成交金额。
- `src/Checkout.vue`：报价 token、幂等下单、失败重试。
- [实施提示词](docs/api-integration-prompt.md)；[真实接口契约](https://github.com/wildcatDownstairs/mini-store-api/blob/main/docs/backend/api-contract.md)。

## 学习范围

支付与退款结算是开发环境模拟，不产生扣款；物流单号是教学数据。令牌有效 30 分钟，页面加载或操作后读取最新数据，没有实时推送。浏览器只展示可执行按钮，权限、价格、库存、状态与退款上限由 API 和数据库保证。

真实商品图片/支付渠道/物流服务可在后续接入，本项目目前不包含这些外部服务。

配套仓库：[后端](https://github.com/wildcatDownstairs/mini-store-api) · [后台](https://github.com/wildcatDownstairs/mini-store-admin) · [商城](https://github.com/wildcatDownstairs/mini-store-web)。
