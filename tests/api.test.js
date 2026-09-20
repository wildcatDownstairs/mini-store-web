import assert from "node:assert/strict";
import { test } from "node:test";
import { api, saveSession, session } from "../src/api.js";

test("公司响应：解包数据、保留空结果、读取 msg、401 清理登录", async () => {
  const storage = new Map();
  const events = [];
  const originalFetch = globalThis.fetch;
  globalThis.sessionStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  globalThis.window = { dispatchEvent: (event) => events.push(event.type) };
  const reply = (status, data, msg = "Success", success = status < 400) => {
    globalThis.fetch = async () => new Response(JSON.stringify({ success, code: status, msg, data }), { status });
  };
  try {
    reply(200, { records: [{ id: "one" }], total: 1 });
    assert.deepEqual(await api("/list"), { records: [{ id: "one" }], total: 1 });
    reply(201, { id: "new" });
    assert.equal((await api("/create", { method: "POST", body: {} })).id, "new");
    reply(200, null);
    assert.equal(await api("/delete", { method: "DELETE" }), null);
    reply(409, null, "库存已变化");
    await assert.rejects(api("/order"), /库存已变化/);
    reply(200, null, "业务失败", false);
    await assert.rejects(api("/order"), /业务失败/);
    saveSession({ accessToken: "test", expiresAt: new Date(Date.now() + 60000).toISOString() });
    reply(401, null, "请重新登录");
    await assert.rejects(api("/me"), /请重新登录/);
    assert.equal(session(), null);
    assert.deepEqual(events, ["session-expired"]);
    globalThis.fetch = async () => new Response("bad gateway", { status: 502 });
    await assert.rejects(api("/list"), /请求失败/);
  } finally {
    globalThis.fetch = originalFetch;
    delete globalThis.sessionStorage;
    delete globalThis.window;
  }
});
