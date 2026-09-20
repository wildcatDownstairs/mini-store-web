import { ref } from "vue";
import { api, session, saveSession } from "./api";
import { address, categoryNames } from "./domain";
export const message = ref(""),
  messageType = ref("success");
let favorites = [];
try {
  favorites = JSON.parse(localStorage.getItem("mini-store-favorites-v2")) || [];
  if (!Array.isArray(favorites)) favorites = [];
} catch {}
export const state = ref({
  signedIn: !!session(),
  profile: null,
  cart: [],
  cartTotals: null,
  addresses: [],
  favorites,
  categories: [],
  brands: [],
  simulatedPayments: false,
});
let timer;
export function notify(text, type = "success") {
  message.value = text;
  messageType.value = type;
  clearTimeout(timer);
  timer = setTimeout(() => (message.value = ""), 6000);
}
export async function act(operation, success) {
  try {
    const result = await operation();
    if (success) notify(success);
    return { ok: true, result };
  } catch (e) {
    notify(e.message, "error");
    return { ok: false, error: e };
  }
}
export function logout() {
  saveSession(null);
  state.value.signedIn = false;
  state.value.profile = null;
  state.value.cart = [];
  state.value.cartTotals = null;
  state.value.addresses = [];
}
window.addEventListener("session-expired", () => {
  logout();
  notify("登录已过期，请重新登录。", "error");
});
export async function refreshCart() {
  if (!session()) return;
  const r = await api("/api/me/cart");
  state.value.cart = r.items;
  state.value.cartTotals = r.totals;
}
export async function refreshAccount() {
  if (!session()) return;
  const [profile, addresses] = await Promise.all([
    api("/api/me"),
    api("/api/me/addresses"),
  ]);
  state.value.profile = profile;
  state.value.addresses = addresses
    .filter((a) => a.addressType === "shipping")
    .map(address);
  state.value.signedIn = true;
  await refreshCart();
}
export async function authenticate(body, register = false) {
  saveSession(
    await api("/api/auth/" + (register ? "register" : "login"), {
      method: "POST",
      body,
    }),
  );
  await refreshAccount();
}
export async function quantity(id, n) {
  await api("/api/me/cart/items/" + id, {
    method: n ? "PUT" : "DELETE",
    ...(n ? { body: { quantity: n } } : {}),
  });
  await refreshCart();
}
export async function init() {
  await act(async () => {
    const [categories, brands, config] = await Promise.all([
      api("/api/store/categories"),
      api("/api/store/brands"),
      api("/api/config"),
    ]);
    state.value.categories = categories.map((c) => ({
      ...c,
      label: categoryNames[c.name] || c.name,
    }));
    state.value.brands = brands;
    state.value.simulatedPayments = config.simulatedPayments;
    await refreshAccount();
  });
}
export function favorite(id) {
  try {
    const next = state.value.favorites.includes(id)
      ? state.value.favorites.filter((x) => x !== id)
      : [...state.value.favorites, id];
    if (next.length > 100) throw Error("收藏最多保存 100 件商品。");
    localStorage.setItem("mini-store-favorites-v2", JSON.stringify(next));
    state.value.favorites = next;
  } catch (e) {
    notify(e.message, "error");
  }
}
