// 当前实验库没有独立 product_type 字段：优先识别名称（也支持订单快照），再使用分类。
// 这是展示层占位图，不改变数据库商品、品牌、价格或图片记录。
const rules = [
  [/スマートウォッチ|smart.?watch|智能手表/i, "watch", "#e7ece8"],
  [/スマートフォン|smartphone|智能手机/i, "phone", "#e6ebed"],
  [/ワイヤレスイヤホン|earbuds|无线耳机|无线耳塞/i, "earbuds", "#eeeade"],
  [/ポータブルスピーカー|speaker|音箱|扬声器/i, "speaker", "#eee2d8"],
  [/ノートパソコン|ノートPC|laptop|笔记本/i, "laptop", "#e5eaee"],
  [/ミニPC|mini.?pc|迷你电脑/i, "mini-pc", "#e8eae4"],
  [/デスクトップPC|desktop|台式/i, "desktop", "#e4e9eb"],
  [/ワンピース|dress|连衣裙/i, "dress", "#eee5df"],
  [/パンツ|trousers|pants|长裤/i, "pants", "#e9e8df"],
  [/スニーカー|sneakers|运动鞋/i, "sneakers", "#eee6dd"],
  [/シャツ|shirt|衬衫/i, "shirt", "#e6eadf"],
  [/サイドテーブル|side.?table|边桌/i, "table", "#ede7dc"],
  [/デスクライト|reading.?light|desk.?lamp|阅读灯|台灯/i, "lamp", "#e3e9d7"],
  [/ケトル|kettle|水壶/i, "kettle", "#e6eadf"],
  [/寝具|bedding|bed.?linen|床品/i, "bedding", "#eae7df"],
  [/美容液|serum|精华/i, "serum", "#f0e4d9"],
  [/洗顔|cleanser|洁面/i, "cleanser", "#e5eae3"],
  [/日焼け止め|sunscreen|防晒/i, "sunscreen", "#f2e8d9"],
  [/シャンプー|shampoo|洗发/i, "shampoo", "#e4e9df"],
  [/クッキー|cookies|饼干/i, "cookies", "#ece5d9"],
  [/珈琲|コーヒー|coffee|咖啡/i, "coffee", "#eae1d8"],
  [/雑穀米|rice|杂粮|大米/i, "rice", "#eeeadd"],
  [/紅茶|抹茶|tea|红茶|绿茶/i, "tea", "#e6eadc"],
  [/headphones|头戴耳机/i, "headphones", "#e6e9eb"],
  [/keyboard|キーボード|键盘/i, "keyboard", "#e5ebed"],
  [/tote|バッグ|帆布包/i, "bag", "#efe3d5"],
  [/mug|マグ|马克杯/i, "mug", "#e5e9df"],
];
const categories = [
  [/Electronics|数码|^tech-/i, "headphones", "#e6e9eb"],
  [/Computers|电脑/i, "laptop", "#e5ebed"],
  [/Fashion|穿搭|^fashion-/i, "shirt", "#eee5df"],
  [/Home|居家|^home-/i, "kettle", "#e6eadf"],
  [/Beauty|美妆|^beauty-/i, "skincare", "#f0e4d9"],
  [/Food|食饮|^food-/i, "tea", "#e6eadc"],
];
export function productArt(source = {}) {
  const item = typeof source === "string" ? { name: source } : source || {};
  const name = item.name || item.productName || item.firstProductName || "";
  const category =
    (typeof item.category === "string" ? item.category : item.category?.name) ||
    item.categories?.[0]?.name ||
    "";
  const matched =
    rules.find(([pattern]) => pattern.test(name)) ||
    categories.find(([pattern]) => pattern.test(category)) ||
    categories.find(([pattern]) => pattern.test(item.slug || ""));
  return matched
    ? { art: matched[1], color: matched[2] }
    : { art: "package", color: "#e6ece6" };
}
