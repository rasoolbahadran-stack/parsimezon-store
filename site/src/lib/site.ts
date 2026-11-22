import seed from '../../../shared/seed.json';

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export const settings = seed.settings;
export const categories = seed.categories;
export const brands = seed.brands;
export const products = seed.products;
export const posts = seed.posts;
export const staticPages = seed.pages;
export const shippingMethods = seed.shippingMethods;
export const paymentMethods = seed.paymentMethods;
export const reviews = seed.reviews;

export const fa = (n: number) => new Intl.NumberFormat('fa-IR').format(n);
export const money = (n: number) => `${fa(n)} تومان`;

export const img = (name: string) => `${BASE}/assets/img/${name}.webp`;

export function catName(id: string) {
  return categories.find((c: any) => c.id === id)?.name || '';
}
export function catSlug(id: string) {
  return categories.find((c: any) => c.id === id)?.slug || '';
}
export function brandName(id: string) {
  return brands.find((b: any) => b.id === id)?.name || '';
}
export function salePercent(p: any) {
  return p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
}
export function stars(r: number) {
  const full = Math.round(r);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}
export function productBySlug(slug: string) {
  return products.find((p: any) => p.slug === slug);
}
export function relatedTo(p: any, n = 4) {
  return products.filter((x: any) => x.id !== p.id && x.category === p.category).slice(0, n);
}
export const statusFa: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  processing: 'در حال پردازش',
  shipped: 'ارسال شده',
  delivered: 'تحویل شده',
  cancelled: 'لغو شده',
  refunded: 'بازگشت داده شده',
};
export const dateFa = (iso: string) => {
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(iso));
  } catch {
    return iso;
  }
};
