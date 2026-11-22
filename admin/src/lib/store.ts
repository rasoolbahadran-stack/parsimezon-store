'use client';
/* لایه داده پنل — CRUD روی LocalStorage با کلیدهای مشترک با فروشگاه (ps_*) */
import seed from '../../../shared/seed.json';

export type Rec = Record<string, any>;

const SEED_MAP: Record<string, any[]> = {
  ps_products: seed.products,
  ps_categories: seed.categories,
  ps_brands: seed.brands,
  ps_coupons: seed.coupons,
  ps_orders: seed.orders,
  ps_customers: seed.customers,
  ps_reviews: seed.reviews,
  ps_messages: seed.messages,
  ps_posts: seed.posts,
  ps_pages: seed.pages,
  ps_users: seed.users,
  ps_roles: seed.roles,
};

export function lsGet(key: string, fallback: any = null): any {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) return JSON.parse(raw);
  } catch {}
  return fallback;
}

export function lsSet(key: string, value: any) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

/** بوت‌استرپ: اگر کلید خالی بود، از seed مقدار اولیه بگیرد */
export function ensureSeed() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('ps_settings', lsGet('ps_settings') ? JSON.stringify(lsGet('ps_settings')) : JSON.stringify({ ...seed.settings, shippingMethods: seed.shippingMethods, paymentMethods: seed.paymentMethods }));
  Object.entries(SEED_MAP).forEach(([k, v]) => {
    if (window.localStorage.getItem(k) === null) lsSet(k, v);
  });
}

export function list(key: string): Rec[] {
  ensureSeed();
  return lsGet(key, []) as Rec[];
}

export function saveList(key: string, rows: unknown) {
  lsSet(key, rows);
}

export function upsert(key: string, row: Rec) {
  const rows = list(key);
  const idx = rows.findIndex((r) => String(r.id) === String(row.id));
  if (idx > -1) rows[idx] = { ...rows[idx], ...row };
  else rows.unshift(row);
  saveList(key, rows);
  return row;
}

export function remove(key: string, id: string) {
  saveList(key, list(key).filter((r) => String(r.id) !== String(id)));
}

export function find(key: string, id: string): Rec | undefined {
  return list(key).find((r) => String(r.id) === String(id));
}

export function nextId(key: string, prefix = 'id') {
  const rows = list(key);
  return `${prefix}${Date.now()}${rows.length + 1}`;
}

export function getSettings(): Rec {
  ensureSeed();
  return lsGet('ps_settings', {});
}

export function setSettings(patch: Rec) {
  lsSet('ps_settings', { ...getSettings(), ...patch });
}

/* ---------- قالب‌بندی ---------- */
export const faNum = (n: number | string) => new Intl.NumberFormat('fa-IR').format(Number(n) || 0);
export const money = (n: number | string) => `${faNum(n)} تومان`;
export const faDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
};

/* وضعیت سفارش */
export const ORDER_STATUSES = [
  { id: 'pending', name: 'در انتظار پرداخت', cls: 'pill--warn' },
  { id: 'processing', name: 'در حال پردازش', cls: 'pill--info' },
  { 'id': 'shipped', name: 'ارسال شده', cls: 'pill--info' },
  { id: 'delivered', name: 'تحویل شده', cls: 'pill--success' },
  { id: 'completed', name: 'تکمیل شده', cls: 'pill--success' },
  { id: 'cancelled', name: 'لغو شده', cls: 'pill--danger' },
  { id: 'refunded', name: 'بازگشت داده شده', cls: 'pill--danger' },
  { id: 'failed', name: 'پرداخت ناموفق', cls: 'pill--danger' },
] as const;
export const statusOf = (id: string) => ORDER_STATUSES.find((s) => s.id === id) || { id, name: id, cls: 'pill--muted' };

/* گالری تصاویر ریپو (نسخه دمو بدون بک‌اند) */
export const REPO_IMAGES = seed.products.map((p) => p.images[0]).concat(['hero1', 'hero2', 'blog1', 'blog2', 'blog3', 'about1']);
export const IMG_BASE = '/parsimezon-store/assets/img';

/* ابزار وضعیت ورود دمو */
export const AUTH_KEY = 'ps_admin_auth';
export const THEME_KEY = 'ps_admin_theme';

/* آمار داشبورد */
export function dashboardStats() {
  const orders = list('ps_orders');
  const products = list('ps_products');
  const customers = list('ps_customers');
  const revenue = orders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + (o.total || 0), 0);
  const count = (s: string) => orders.filter((o) => o.status === s).length;
  const lowStock = products.filter((p) => (p.stock || 0) <= 4 && (p.stock || 0) > 0);
  return {
    revenue,
    orders: orders.length,
    products: products.length,
    customers: customers.length,
    newOrders: count('pending'),
    processing: count('processing'),
    shipped: count('shipped'),
    delivered: count('delivered') + count('completed'),
    cancelled: count('cancelled') + count('refunded'),
    lowStock,
    recent: [...orders].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 6),
  };
}

/* سری ۳۰ روزه برای نمودار (ترکیب سفارش‌های واقعی + روند دمو) */
export function salesSeries(days = 30) {
  const orders = list('ps_orders');
  const out: { day: string; v: number }[] = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const real = orders.filter((o) => String(o.createdAt).slice(0, 10) === key).reduce((s, o) => s + (o.total || 0), 0);
    const wave = 900000 + Math.round(650000 * Math.sin((days - i) / 3.2)) + (i % 5) * 40000;
    out.push({ day: key, v: real > 0 ? real : Math.max(0, wave) });
  }
  return out;
}
