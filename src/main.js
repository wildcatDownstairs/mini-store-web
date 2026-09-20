import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import Home from "./Home.vue";
import Catalog from "./Catalog.vue";
import Product from "./Product.vue";
import Cart from "./Cart.vue";
import Checkout from "./Checkout.vue";
import Account from "./Account.vue";
import "./style.css";
import "./ux.css";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/products", component: Catalog },
    { path: "/products/:slug", component: Product },
    { path: "/favorites", component: Catalog },
    { path: "/cart", component: Cart },
    { path: "/checkout", component: Checkout },
    { path: "/account/:section?", component: Account },
    { path: "/orders/:id", component: Account },
    { path: "/login", component: Account },
    { path: "/:pathMatch(.*)*", component: Home },
  ],
  scrollBehavior: (to, from, saved) =>
    saved ||
    (to.hash ? { el: to.hash } : to.path === from.path ? false : { top: 0 }),
});
createApp(App).use(router).mount("#app");
