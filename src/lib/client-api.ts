"use client";

/** Browser client for customer-facing API calls (same-origin /api, cookie auth + CSRF). */
const BASE = "/api/v1";
const CSRF_COOKIE = "crs_csrf";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public errors: { field?: string; code?: string; message: string; [k: string]: unknown }[] = [],
  ) {
    super(message);
  }
}

function csrf() {
  const m = document.cookie.split("; ").find((c) => c.startsWith(`${CSRF_COOKIE}=`));
  return m ? decodeURIComponent(m.slice(CSRF_COOKIE.length + 1)) : "";
}

export const hasSession = () => typeof document !== "undefined" && document.cookie.includes(`${CSRF_COOKIE}=`);

let refreshing: Promise<boolean> | null = null;
function refresh() {
  refreshing ??= fetch(`${BASE}/customer/auth/refresh`, { method: "POST", credentials: "include", headers: { "X-CSRF-Token": csrf() } })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => setTimeout(() => (refreshing = null), 0));
  return refreshing;
}

export async function request<T>(path: string, opts: { method?: string; body?: unknown; retried?: boolean } = {}): Promise<T> {
  const method = opts.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") headers["X-CSRF-Token"] = csrf();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: "include",
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  if (res.status === 401 && !opts.retried && hasSession() && !path.startsWith("/customer/auth/")) {
    if (await refresh()) return request<T>(path, { ...opts, retried: true });
  }
  const text = await res.text();
  const json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  if (!res.ok) {
    throw new ApiError(res.status, String(json.code ?? "HTTP_ERROR"), String(json.message ?? "Error"), (json.errors as ApiError["errors"]) ?? []);
  }
  return (json as { data: T }).data;
}

export const api = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, body?: unknown) => request<T>(p, { method: "POST", body: body ?? {} }),
  put: <T>(p: string, body?: unknown) => request<T>(p, { method: "PUT", body }),
  patch: <T>(p: string, body?: unknown) => request<T>(p, { method: "PATCH", body }),
  delete: <T>(p: string) => request<T>(p, { method: "DELETE" }),
};

const MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Incorrect email or password",
  ACCOUNT_LOCKED: "Too many sign-in attempts. Please try again in 15 minutes.",
  EMAIL_TAKEN: "An account with this email already exists",
  TOO_MANY_REQUESTS: "Too many requests. Please wait a minute.",
  CART_INVALID: "Some items are no longer available — please review your bag",
  INSUFFICIENT_STOCK: "Not enough items in stock",
  PAYMENT_METHOD_UNAVAILABLE: "This payment method is temporarily unavailable",
  SHIPPING_METHOD_INVALID: "This shipping method is not available",
  CSRF_INVALID: "Your session has expired — please refresh the page",
};

export function errorText(e: unknown, fallback = "Something went wrong. Please try again.") {
  if (e instanceof ApiError) {
    if (MESSAGES[e.code]) return MESSAGES[e.code];
    const d = e.errors.map((x) => x.message).filter(Boolean);
    if (d.length) return d.slice(0, 3).join(". ");
    return e.message || fallback;
  }
  return fallback;
}
