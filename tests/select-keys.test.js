import { test } from "node:test";
import assert from "node:assert/strict";
import { optionIndex, filterOptions } from "../src/select-keys.js";
const options = [
  { label: "所有品牌" },
  { label: "Sora Living" },
  { label: "Hikari Works" },
  { label: "Nami Studio" },
  { label: "Mori Pantry" },
  { label: "Kinu Care" },
];
test("select keyboard navigation clamps ends and supports Home/End", () => {
  assert.equal(optionIndex(options, 0, "ArrowUp"), 0);
  assert.equal(optionIndex(options, 5, "ArrowDown"), 5);
  assert.equal(optionIndex(options, 2, "ArrowDown"), 3);
  assert.equal(optionIndex(options, 2, "Home"), 0);
  assert.equal(optionIndex(options, 2, "End"), 5);
  assert.equal(optionIndex([], 0, "End"), -1);
});
test("typeahead wraps, is case-insensitive, and retains highlight on no match", () => {
  assert.equal(optionIndex(options, 5, "", "S"), 1);
  assert.equal(optionIndex(options, 1, "", "hi"), 2);
  assert.equal(optionIndex(options, 4, "", "所有"), 0);
  assert.equal(optionIndex(options, 2, "", "unknown"), 2);
});

test("品牌搜索忽略大小写和首尾空白，选中值不受过滤后下标变化影响", () => {
  const brands = [
    { value: "a", label: "Sora Living" },
    { value: "b", label: "Hikari Works" },
  ];
  const filtered = filterOptions(brands, " WORKS ");
  assert.equal(filtered.length, 1);
  assert.equal(filtered[optionIndex(filtered, 0, "Enter")].value, "b");
  assert.deepEqual(filterOptions(brands, "不存在"), []);
  assert.equal(filterOptions(brands, "  "), brands);
});
