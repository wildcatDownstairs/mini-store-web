import { test } from "node:test";
import assert from "node:assert/strict";
import { productArt } from "../src/product-art.js";
import { product, order } from "../src/domain.js";

// 来自实验库的 24 种商品名称：两个笔记本类型共用同一张插画。
const examples = {
  ワイヤレスイヤホン: "earbuds",
  スマートフォン: "phone",
  ポータブルスピーカー: "speaker",
  スマートウォッチ: "watch",
  薄型ノートパソコン: "laptop",
  クリエイター向けミニPC: "mini-pc",
  モバイルノートPC: "laptop",
  高性能デスクトップPC: "desktop",
  コットンシャツ: "shirt",
  リネンワンピース: "dress",
  ストレッチパンツ: "pants",
  軽量スニーカー: "sneakers",
  木製サイドテーブル: "table",
  調光デスクライト: "lamp",
  ステンレスケトル: "kettle",
  リネン寝具セット: "bedding",
  保湿美容液: "serum",
  低刺激洗顔フォーム: "cleanser",
  日焼け止めクリーム: "sunscreen",
  ボタニカルシャンプー: "shampoo",
  宇治抹茶クッキー: "cookies",
  北海道ブレンド珈琲: "coffee",
  国産雑穀米: "rice",
  瀬戸内レモン紅茶: "tea",
};
test("24 种实际商品均匹配具体插画，抹茶饼干不能误匹配成茶包", () => {
  for (const [name, art] of Object.entries(examples)) {
    assert.equal(productArt(`Sora Living ${name} 結-065`).art, art, name);
  }
});
test("商品类型优先于分类，未知商品按分类回退，缺失数据安全回退", () => {
  assert.equal(
    productArt({ name: "宇治抹茶クッキー", category: { name: "Food" } }).art,
    "cookies",
  );
  assert.equal(
    productArt({
      name: "新しいモデル",
      category: { name: "Computers / Accessories" },
      slug: "tech-99",
    }).art,
    "laptop",
  );
  assert.equal(
    productArt({ name: "新品", category: { name: "Beauty" } }).art,
    "skincare",
  );
  assert.equal(productArt(null).art, "package");
  assert.equal(productArt("无法识别的新品").art, "package");
});
test("列表、购物袋与订单快照使用一致映射", () => {
  const name = "Nami Works 調光デスクライト 結-065";
  const p = product({
    name,
    brand: { id: "brand", name: "Nami" },
    price: { amount: 4950 },
  });
  const cart = productArt({ productName: name });
  const o = order({
    firstProductName: name,
    items: [{ id: "item", productName: name, lineTotal: 4950 }],
  });
  for (const item of [p, cart, o, o.lines[0]]) {
    assert.equal(item.art, "lamp");
    assert.equal(item.color, cart.color);
  }
});
