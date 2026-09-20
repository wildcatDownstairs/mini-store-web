// 一个 HTTP 入口处理认证和公司响应结构。响应永远来自 API，不回退到模拟数据。
export const API = (
  import.meta.env?.VITE_API_BASE_URL || "http://127.0.0.1:5274"
).replace(/\/$/, "");
const sessionKey = "mini-store-session-v2";
export function session() {
  try {
    const s = JSON.parse(sessionStorage.getItem(sessionKey));
    return s && Date.parse(s.expiresAt) > Date.now() ? s : null;
  } catch {
    return null;
  }
}
export function saveSession(value) {
  if (value) sessionStorage.setItem(sessionKey, JSON.stringify(value));
  else sessionStorage.removeItem(sessionKey);
}
export async function api(
  path,
  { method = "GET", body, headers = {}, signal } = {},
) {
  const token = session()?.accessToken;
  const res = await fetch(API + path, {
    method,
    signal,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await res.json().catch(() => null);
  if (!res.ok || result?.success !== true) {
    if (res.status === 401) {
      saveSession(null);
      window.dispatchEvent(new Event("session-expired"));
    }
    const e = new Error(
      result?.msg ||
        {
          401: "请重新登录。",
          403: "没有执行此操作的权限。",
          429: "操作太频繁，请稍后再试。",
        }[res.status] ||
        "请求失败，请稍后重试。",
    );
    e.status = res.status;
    throw e;
  }
  return result.data;
}
export function query(values) {
  return new URLSearchParams(
    Object.entries(values).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  ).toString();
}
