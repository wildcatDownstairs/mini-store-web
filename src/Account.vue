<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  state,
  act,
  authenticate,
  logout as signOut,
  refreshAccount,
} from "./store";
import { api, query } from "./api";
import { yen, date, statusText, order as adapt, addressBody } from "./domain";
import ProductArt from "./components/ProductArt.vue";
import Icon from "./components/Icon.vue";
import StoreSelect from "./components/StoreSelect.vue";
import MotionDialog from "./components/MotionDialog.vue";
import OrderTotals from "./components/OrderTotals.vue";
const route = useRoute(),
  router = useRouter(),
  filter = ref("all"),
  page = ref(1),
  total = ref(0),
  addressDialog = ref(null),
  reviewDialog = ref(null),
  cancelDialog = ref(null),
  removeDialog = ref(null),
  removeId = ref(""),
  addressDraft = ref({}),
  reviewDraft = ref({}),
  rating = ref(5),
  content = ref(""),
  orders = ref([]),
  order = ref(null),
  busy = ref(false),
  loading = ref(false),
  loadError = ref(""),
  register = ref(false),
  credentials = ref({ email: "", password: "", firstName: "", lastName: "" }),
  profile = ref({});
const section = computed(() => route.params.section || "orders"),
  isOrder = computed(() => !!route.params.id),
  help = computed(() => section.value === "help");
let revision = 0;
async function load() {
  const rev = ++revision;
  loadError.value = "";
  if (!state.value.signedIn || help.value) return;
  loading.value = true;
  try {
    if (isOrder.value) {
      const result = await api("/api/me/orders/" + route.params.id);
      if (rev === revision) order.value = adapt(result);
    } else if (section.value === "orders") {
      const result = await api(
        "/api/me/orders?" +
          query({
            page: page.value,
            pageSize: 10,
            status: filter.value === "all" ? null : filter.value,
          }),
      );
      if (rev === revision) {
        orders.value = result.items.map(adapt);
        total.value = result.total;
      }
    } else {
      await refreshAccount();
      profile.value = { ...state.value.profile };
    }
  } catch (e) {
    if (rev === revision) loadError.value = e.message;
  } finally {
    if (rev === revision) loading.value = false;
  }
}
watch(
  [() => route.fullPath, () => state.value.signedIn],
  () => {
    page.value = 1;
    order.value = null;
    load();
  },
  { immediate: true },
);
watch(filter, () => {
  if (page.value === 1) load();
  else page.value = 1;
});
watch(page, load);
async function action(fn, text) {
  if (busy.value) return { ok: false };
  busy.value = true;
  const r = await act(fn, text);
  busy.value = false;
  return r;
}
async function login() {
  const r = await action(
    () => authenticate({ ...credentials.value }, register.value),
    "欢迎来到 Mini Store。",
  );
  if (r.ok) {
    credentials.value.password = "";
    const next = String(route.query.next || "/account/orders");
    router.replace(
      next.startsWith("/") && !next.startsWith("//") ? next : "/account/orders",
    );
  }
}
function logout() {
  signOut();
  router.push("/login");
}
function editAddress(a) {
  addressDraft.value = a
    ? { ...a }
    : {
        name: "",
        postalCode: "",
        prefecture: "東京都",
        city: "",
        line1: "",
        line2: "",
        phone: "",
        isDefault: !state.value.addresses.length,
      };
  addressDialog.value.showModal();
}
async function saveAddress() {
  const a = addressDraft.value;
  const r = await action(
    () =>
      api("/api/me/addresses" + (a.id ? "/" + a.id : ""), {
        method: a.id ? "PUT" : "POST",
        body: addressBody(a),
      }),
    "地址已保存。",
  );
  if (r.ok) {
    addressDialog.value.close();
    await act(refreshAccount);
  }
}
async function removeAddress() {
  const r = await action(
    () => api("/api/me/addresses/" + removeId.value, { method: "DELETE" }),
    "地址已删除，订单快照保留。",
  );
  if (r.ok) {
    removeDialog.value.close();
    await act(refreshAccount);
  }
}
async function payment(success) {
  const r = await action(
    () =>
      api("/api/me/orders/" + order.value.id + "/simulate-payment", {
        method: "POST",
        body: { success },
      }),
    success ? "模拟付款成功。" : "模拟付款失败，可重试或取消。",
  );
  if (r.ok) load();
}
async function cancelOrder() {
  const r = await action(
    () =>
      api("/api/me/orders/" + order.value.id + "/cancel", { method: "POST" }),
    "订单已取消。",
  );
  if (r.ok) {
    cancelDialog.value.close();
    load();
  }
}
function review(l) {
  reviewDraft.value = l;
  rating.value = 5;
  content.value = "";
  reviewDialog.value.showModal();
}
async function submitReview() {
  const r = await action(
    () =>
      api(
        `/api/me/orders/${order.value.id}/items/${reviewDraft.value.id}/review`,
        {
          method: "POST",
          body: {
            rating: Number(rating.value),
            title: null,
            content: content.value || null,
          },
        },
      ),
    "评价已提交，等待审核。",
  );
  if (r.ok) {
    reviewDialog.value.close();
    load();
  }
}
const hasReview = (id) =>
  order.value?.lines.find((l) => l.id === id)?.reviewStatus;
async function saveProfile() {
  const r = await action(
    () =>
      api("/api/me", {
        method: "PUT",
        body: {
          firstName: profile.value.firstName,
          lastName: profile.value.lastName,
          phone: profile.value.phone || null,
          birthDate: profile.value.birthDate || null,
        },
      }),
    "个人资料已保存。",
  );
  if (r.ok) await act(refreshAccount);
}
</script>
<template>
  <div class="wrap page">
    <div class="breadcrumb">
      <RouterLink to="/">首页</RouterLink><span>/</span
      ><RouterLink to="/account/orders">我的账户</RouterLink
      ><template v-if="isOrder"><span>/</span>订单详情</template>
    </div>
    <div v-if="help" class="help-page">
      <h1>让购物，简单一点。</h1>
      <p>配送、计价和售后说明</p>
      <details open>
        <summary>配送范围和费用</summary>
        <p>
          演示商城仅支持日本地址。标准配送 ¥500，折后税前商品满 ¥8,000
          免标准运费；快捷配送 ¥900。预计时效仅作为界面示例。
        </p>
      </details>
      <details open>
        <summary>商品价格与优惠</summary>
        <p>
          列表展示含税起价。食品消费税模拟 8%，其他商品
          10%。结算时按行分摊折扣后计税，因此多件商品的最终税额可能与含税单价相乘相差
          ¥1。优惠码在结算时校验，不可叠加。
        </p>
      </details>
      <details open>
        <summary>取消订单与退换货</summary>
        <p>
          未付款订单可在详情页直接取消。已付款订单的退换货应由客服审核、后台退款流程处理，当前前台不提供真实退款服务。演示数据不会产生真实发货或扣款。
        </p>
      </details>
      <details>
        <summary>账户与个人资料</summary>
        <p>
          注册和登录由服务端验证，密码只保存加盐哈希。地址、购物车和订单保存在
          PostgreSQL，后台与商城共享业务数据。收藏保存在当前浏览器；支付模拟不收集银行卡信息。
        </p>
      </details>
      <div class="button-row">
        <RouterLink to="/products" class="button primary"
          >继续发现好物</RouterLink
        >
      </div>
    </div>
    <div v-else-if="!state.signedIn" class="login-panel">
      <div class="login-art">
        <ProductArt kind="mug" />
        <h2>把喜欢的日常，<br />留在这里。</h2>
      </div>
      <div>
        <span class="brand">很高兴，再次见面</span>
        <h1>欢迎来到 Mini Store</h1>
        <p>
          {{
            register
              ? "创建账户，保存你的每一次喜欢。"
              : "登录后查看订单、地址与购买评价。"
          }}
        </p>
        <form @submit.prevent="login" class="form-grid">
          <label v-if="register"
            >姓氏<input
              v-model="credentials.lastName"
              autocomplete="family-name"
              required
              maxlength="80"
          /></label>
          <label v-if="register"
            >名字<input
              v-model="credentials.firstName"
              autocomplete="given-name"
              required
              maxlength="80"
          /></label>
          <label class="span-two"
            >邮箱<input
              v-model="credentials.email"
              type="email"
              autocomplete="email"
              required
              maxlength="254"
          /></label>
          <label class="span-two"
            >密码<input
              v-model="credentials.password"
              type="password"
              :autocomplete="register ? 'new-password' : 'current-password'"
              required
              :minlength="register ? 12 : 1"
              maxlength="128"
          /></label>
          <p v-if="register" class="muted span-two">
            使用至少 12 位密码。种子数据的客户假密码不能登录，请注册学习账户。
          </p>
          <button
            class="button primary full span-two"
            type="submit"
            :disabled="busy"
          >
            {{ busy ? "正在验证…" : register ? "注册并登录" : "登录" }}
          </button>
        </form>
        <button class="text-button" @click="register = !register">
          {{ register ? "已有账户，去登录" : "第一次来？创建账户" }}
        </button>
      </div>
    </div>
    <div v-else class="account-layout">
      <aside class="account-nav">
        <div class="avatar">
          {{ state.profile?.lastName?.slice(0, 1) || "客" }}
        </div>
        <h2>{{ state.profile?.lastName }} {{ state.profile?.firstName }}</h2>
        <p>欢迎回到你的日常</p>
        <RouterLink to="/account/profile">个人资料</RouterLink>
        <RouterLink to="/account/orders">我的订单</RouterLink
        ><RouterLink to="/account/addresses">收货地址</RouterLink
        ><RouterLink to="/favorites">我的收藏</RouterLink
        ><RouterLink to="/account/help">购物服务</RouterLink
        ><button class="text-button" @click="logout">退出登录</button>
      </aside>
      <div v-if="loading" class="empty" role="status">正在加载账户数据…</div>
      <div v-else-if="loadError" role="alert" class="empty">
        <p>{{ loadError }}</p>
        <button class="button secondary" @click="load">重试</button>
      </div>
      <div v-else-if="isOrder && order" class="order-detail">
        <div class="section-heading">
          <div>
            <h1>订单详情</h1>
            <p>{{ order.number }} · {{ date(order.createdAt) }}</p>
          </div>
          <span class="status" :class="order.status">{{
            statusText[order.status]
          }}</span>
        </div>
        <div
          v-if="['pending', 'confirmed'].includes(order.status)"
          class="payment-panel"
        >
          <h2>订单已创建，等待付款</h2>
          <p>
            应付 {{ yen(order.total) }}。商品已预占，失败后可重试或取消订单。
          </p>
          <p
            v-if="order.paymentAttempts.at(-1)?.status === 'failed'"
            role="alert"
            class="error-text"
          >
            上次模拟支付失败，未扣款。可重新选择模拟结果。
          </p>
          <div class="button-row">
            <button
              v-if="state.simulatedPayments"
              :disabled="busy"
              class="button primary"
              @click="payment(true)"
            >
              模拟支付成功</button
            ><button
              v-if="state.simulatedPayments"
              :disabled="busy"
              class="button secondary"
              @click="payment(false)"
            >
              模拟支付失败</button
            ><button class="text-button" @click="cancelDialog.showModal()">
              取消订单
            </button>
          </div>
        </div>
        <div
          v-else-if="order.status === 'paid'"
          class="notice success payment-success"
        >
          <strong>支付成功，好物正在等待配货。</strong>
          <p>这是模拟付款，不产生扣款。真实接入后，由支付回调确认付款状态。</p>
        </div>
        <div class="timeline" :key="order.status">
          <div v-for="(h, i) in order.history" :key="i">
            <span class="timeline-dot"></span
            ><strong>{{ statusText[h.status] }}</strong
            ><small>{{ date(h.at) }}</small>
          </div>
        </div>
        <div v-if="order.shipment" class="shipping-box">
          <Icon name="truck" />
          <div>
            <strong
              >{{ order.shipment.carrier }} ·
              {{ order.status === "delivered" ? "已送达" : "运输中" }}</strong
            >
            <p>物流单号：{{ order.shipment.tracking }}</p>
            <small
              >发货 {{ date(order.shipment.shippedAt)
              }}<template v-if="order.shipment.deliveredAt">
                · 送达 {{ date(order.shipment.deliveredAt) }}</template
              ></small
            >
          </div>
        </div>
        <article v-for="l in order.lines" :key="l.variantId" class="cart-line">
          <div class="cart-image" style="background: #e6ece6">
            <ProductArt kind="package" />
          </div>
          <div class="cart-line-info">
            <h2>{{ l.name }}</h2>
            <p>{{ l.variantName }} × {{ l.quantity }}</p>
            <small>{{ l.sku }}</small
            ><button
              v-if="order.status === 'delivered'"
              :disabled="hasReview(l.variantId)"
              class="text-button"
              @click="review(l)"
            >
              {{ hasReview(l.variantId) ? "评价已提交" : "评价商品" }}
            </button>
          </div>
          <strong>{{ yen(l.total) }}</strong>
        </article>
        <div class="order-bottom">
          <div>
            <h2>收货信息</h2>
            <p>{{ order.address.name }} · {{ order.address.phone }}</p>
            <p>
              〒{{ order.address.postalCode }}<br />{{ order.address.prefecture
              }}{{ order.address.city }}{{ order.address.line1 }}<br />{{
                order.address.line2
              }}
            </p>
            <small>下单时的地址快照</small>
            <h2 class="small-heading">支付记录</h2>
            <p v-for="a in order.paymentAttempts" :key="a.id">
              {{
                {
                  captured: "付款成功",
                  failed: "付款失败",
                  refunded: "已全额退款",
                  partially_refunded: "部分退款",
                  authorized: "已授权",
                  pending: "待处理",
                  cancelled: "已取消",
                }[a.status] || a.status
              }}
              · {{ yen(a.amount) }}<br /><small>{{ date(a.at) }}</small>
            </p>
            <p v-if="!order.paymentAttempts.length">暂无付款记录</p>
          </div>
          <OrderTotals :quote="order" />
        </div>
      </div>
      <div v-else-if="isOrder" class="empty">
        <h1>未找到这笔订单</h1>
        <RouterLink to="/account/orders" class="button primary"
          >返回订单列表</RouterLink
        >
      </div>
      <div v-else-if="section === 'addresses'">
        <div class="section-heading">
          <div>
            <h1>收货地址</h1>
            <p>下一次喜欢，不用再填一遍。</p>
          </div>
          <button class="button primary" @click="editAddress()">
            新增地址
          </button>
        </div>
        <div class="address-grid">
          <article
            v-for="a in state.addresses"
            :key="a.id"
            class="address-card"
          >
            <h2>
              {{ a.name }} <span v-if="a.isDefault" class="status">默认</span>
            </h2>
            <p>{{ a.phone }}</p>
            <p>
              〒{{ a.postalCode }}<br />{{ a.prefecture }}{{ a.city
              }}{{ a.line1 }}<br />{{ a.line2 }}
            </p>
            <div class="button-row">
              <button class="text-button" @click="editAddress(a)">
                编辑地址</button
              ><button
                class="text-button"
                @click="
                  removeId = a.id;
                  removeDialog.showModal();
                "
              >
                删除
              </button>
            </div>
          </article>
        </div>
        <div v-if="!state.addresses.length" class="empty">
          <h2>还没有收货地址</h2>
          <button class="button primary" @click="editAddress()">
            添加收货地址
          </button>
        </div>
        <RouterLink
          v-if="route.query.return === 'checkout'"
          class="button secondary"
          to="/checkout"
          >返回结算</RouterLink
        >
      </div>
      <div v-else-if="section === 'profile'">
        <h1>个人资料</h1>
        <p>{{ state.profile?.email }}</p>
        <form class="form-grid" @submit.prevent="saveProfile">
          <label
            >姓氏<input
              v-model="profile.lastName"
              required
              maxlength="80" /></label
          ><label
            >名字<input
              v-model="profile.firstName"
              required
              maxlength="80" /></label
          ><label
            >联系电话<input v-model="profile.phone" maxlength="24" /></label
          ><label
            >出生日期<input
              v-model="profile.birthDate"
              type="date"
              :max="new Date().toISOString().slice(0, 10)" /></label
          ><button type="submit" class="button primary" :disabled="busy">
            保存资料
          </button>
        </form>
      </div>
      <div v-else>
        <div class="section-heading">
          <div>
            <h1>我的订单</h1>
            <p>每一次喜欢，都在这里。</p>
          </div>
          <StoreSelect
            v-model="filter"
            label="订单状态"
            hide-label
            :options="[
              { value: 'all', label: '全部订单' },
              ...Object.entries(statusText).map(([value, label]) => ({
                value,
                label,
              })),
            ]"
          />
        </div>
        <article v-for="o in orders" :key="o.id" class="order-card">
          <header>
            <span
              >{{ o.number }}<small>{{ date(o.createdAt) }}</small></span
            ><span class="status" :class="o.status">{{
              statusText[o.status]
            }}</span>
          </header>
          <div class="order-card-body">
            <div class="order-thumbnails">
              <div style="background: #e6ece6">
                <ProductArt kind="package" />
              </div>
            </div>
            <div>
              <h2>{{ o.firstProductName }}</h2>
              <p>共 {{ o.itemCount }} 件商品</p>
            </div>
            <div class="order-card-end">
              <strong>{{ yen(o.total) }}</strong
              ><RouterLink :to="'/orders/' + o.id" class="button secondary">{{
                ["pending", "confirmed"].includes(o.status)
                  ? "继续付款"
                  : "查看订单"
              }}</RouterLink>
            </div>
          </div>
        </article>
        <nav v-if="total > 10" class="pagination">
          <button :disabled="page === 1" @click="page--">上一页</button
          ><span>{{ page }} / {{ Math.ceil(total / 10) }}</span
          ><button :disabled="page * 10 >= total" @click="page++">
            下一页
          </button>
        </nav>
        <div v-if="!orders.length" class="empty">
          <Icon name="bag" />
          <h2>暂无{{ filter === "all" ? "" : statusText[filter] }}订单</h2>
          <RouterLink to="/products" class="button primary"
            >去挑选好物</RouterLink
          >
        </div>
      </div>
    </div>
  </div>
  <MotionDialog ref="addressDialog" aria-label="收货地址表单" class="modal">
    <form @submit.prevent="saveAddress">
      <div class="section-heading">
        <h2>{{ addressDraft.id ? "编辑" : "新增" }}收货地址</h2>
        <button
          type="button"
          class="icon-button"
          aria-label="关闭地址表单"
          @click="addressDialog.close()"
        >
          <Icon name="close" />
        </button>
      </div>
      <p class="muted">日本境内收货地址。历史订单始终保留下单时的地址。</p>
      <div class="form-grid">
        <label
          >收件人<input
            v-model="addressDraft.name"
            required
            maxlength="80"
            autocomplete="off" /></label
        ><label
          >联系电话<input
            v-model="addressDraft.phone"
            required
            placeholder="09012345678"
            maxlength="14"
            inputmode="tel" /></label
        ><label
          >邮政编码<input
            v-model="addressDraft.postalCode"
            required
            placeholder="150-0001"
            maxlength="8" /></label
        ><label
          >都道府县<input
            v-model="addressDraft.prefecture"
            required
            maxlength="40" /></label
        ><label
          >城市 / 区<input
            v-model="addressDraft.city"
            required
            maxlength="80" /></label
        ><label
          >町名 / 门牌<input
            v-model="addressDraft.line1"
            required
            maxlength="160" /></label
        ><label class="span-two"
          >公寓 / 房间号（选填）<input
            v-model="addressDraft.line2"
            maxlength="160"
        /></label>
      </div>
      <label class="checkbox"
        ><input
          v-model="addressDraft.isDefault"
          type="checkbox"
        />设为默认地址</label
      ><button class="button primary full" type="submit" :disabled="busy">
        保存地址
      </button>
    </form>
  </MotionDialog>
  <MotionDialog ref="reviewDialog" aria-label="购买评价表单" class="modal">
    <form @submit.prevent="submitReview">
      <div class="section-heading">
        <h2>评价这次喜欢</h2>
        <button
          type="button"
          class="icon-button"
          aria-label="关闭评价表单"
          @click="reviewDialog.close()"
        >
          <Icon name="close" />
        </button>
      </div>
      <p>{{ reviewDraft.name }}</p>
      <StoreSelect
        v-model="rating"
        label="评分"
        :options="[5, 4, 3, 2, 1].map((n) => ({ value: n, label: n + ' 星' }))"
      />
      <label
        >使用感受（选填）<textarea
          v-model="content"
          maxlength="1000"
          rows="5"
          placeholder="分享真实的使用感受"
        ></textarea>
      </label>
      <p class="muted">评价将在审核后公开展示。{{ content.length }} / 1000</p>
      <button class="button primary full" type="submit" :disabled="busy">
        提交评价
      </button>
    </form>
  </MotionDialog>
  <MotionDialog
    ref="cancelDialog"
    aria-label="取消订单确认"
    class="modal compact"
  >
    <h2>确认取消这笔订单？</h2>
    <p>此订单尚未付款。取消后释放预占库存，需要时可重新选购。</p>
    <div class="button-row">
      <button class="button secondary" @click="cancelDialog.close()">
        保留订单</button
      ><button class="button primary" @click="cancelOrder" :disabled="busy">
        确认取消
      </button>
    </div>
  </MotionDialog>
  <MotionDialog
    ref="removeDialog"
    aria-label="删除地址确认"
    class="modal compact"
  >
    <h2>删除这个收货地址？</h2>
    <p>历史订单的地址快照会保留。</p>
    <div class="button-row">
      <button class="button secondary" @click="removeDialog.close()">
        保留地址</button
      ><button class="button primary" @click="removeAddress" :disabled="busy">
        确认删除
      </button>
    </div>
  </MotionDialog>
</template>
