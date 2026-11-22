import seed from '../../../shared/seed.json';

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export const settings = seed.settings;
export const categories = seed.categories;
export const brands = seed.brands;
export const products = seed.products;
export const articles = seed.articles;
export const journalCats = seed.journalCats;
export const collections = seed.collections;
export const slides = seed.slides;
export const staticPages = seed.pages;
export const shippingMethods = seed.shippingMethods;
export const paymentMethods = seed.paymentMethods;
export const reviews = seed.reviews;

export const fa = (n: number) => new Intl.NumberFormat('fa-IR').format(n);
export const money = (n: number) => `${fa(n)} تومان`;

/* نقشه رنگ‌های اصلی فروشگاه برای نمایش نقطه رنگ در کارت‌ها و فیلترها */
export const COLOR_HEX: Record<string, string> = {
  'مشکی': '#1a1a1a', 'سفید': '#f7f5f0', 'کرم': '#e8dcc8', 'بژ': '#d8c3a5', 'شتری': '#b98a5e',
  'قهوه‌ای': '#6b4a34', 'زغالی': '#3d3d3d', 'طوسی': '#9a9a9a', 'سرمه‌ای': '#1f2a44', 'آبی': '#4a6fa5',
  'سبز یشمی': '#4d7a5f', 'زرشکی': '#7a1f2b', 'قرمز': '#a83232', 'گلبهی': '#e8b4b8', 'خردلی': '#c8a13a',
  'بنفش': '#5e4b7a', 'دودی': '#5a5a5a',
};

export const img = (name: string) => `${BASE}/assets/img/${name}.webp`;

export function catName(id: string) {
  return categories.find((c: any) => c.id === id)?.name || '';
}
export function catSlug(id: string) {
  return categories.find((c: any) => c.id === id)?.slug || '';
}
export function catOf(slug: string) {
  return categories.find((c: any) => c.slug === slug);
}
export function catProducts(cid: string) {
  return products.filter((p: any) => p.category === cid && p.status === 'published');
}
export function brandName(id: string) {
  return brands.find((b: any) => b.id === id)?.name || '';
}
export function collectionProducts(col: any) {
  return (col.products || []).map((s: string) => products.find((p: any) => p.slug === s)).filter(Boolean);
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
  const same = products.filter((x: any) => x.id !== p.id && x.category === p.category);
  const out = [...same];
  // تکمیل با محصولات هم‌برند در صورت کمبود
  for (const x of products) {
    if (out.length >= n + 4) break;
    if (x.id !== p.id && x.category !== p.category && x.brand === p.brand && !out.includes(x)) out.push(x);
  }
  return out.slice(0, n);
}
/* محصولات مکمل: از دسته‌های مکمل از پیش تعریف‌شده */
export const COMPLEMENT_MAP: Record<string, string[]> = {
  'c-dress': ['c-scarf', 'c-shoes', 'c-bag'],
  'c-maxi': ['c-scarf', 'c-shoes', 'c-bag'],
  'c-evening': ['c-shoes', 'c-bag', 'c-scarf'],
  'c-coat': ['c-scarf', 'c-knit', 'c-shoes'],
  'c-mantou': ['c-bag', 'c-shoes', 'c-scarf'],
  'c-blazer': ['c-pants', 'c-blouse', 'c-bag'],
  'c-blouse': ['c-pants', 'c-skirt', 'c-scarf'],
  'c-bluz': ['c-jeans', 'c-pants', 'c-scarf'],
  'c-knit': ['c-jeans', 'c-pants', 'c-scarf'],
  'c-sweat': ['c-jeans', 'c-shoes'],
  'c-hoodie': ['c-jeans', 'c-shoes'],
  'c-set': ['c-bag', 'c-shoes', 'c-scarf'],
  'c-pants': ['c-blouse', 'c-bluz', 'c-belt'],
  'c-jeans': ['c-bluz', 'c-sweat', 'c-belt'],
  'c-skirt': ['c-blouse', 'c-bluz', 'c-scarf'],
  'c-bag': ['c-evening', 'c-dress', 'c-scarf'],
  'c-scarf': ['c-coat', 'c-mantou', 'c-knit'],
  'c-belt': ['c-pants', 'c-jeans'],
  'c-shoes': ['c-dress', 'c-evening', 'c-bag'],
  'c-tunic': ['c-pants', 'c-jeans', 'c-scarf'],
};
export function complementsTo(p: any, n = 4) {
  const cats = COMPLEMENT_MAP[p.category] || [];
  const out: any[] = [];
  for (const c of cats) {
    for (const x of products) {
      if (x.category === c && x.id !== p.id && !out.includes(x)) out.push(x);
      if (out.length >= n) break;
    }
    if (out.length >= n) break;
  }
  return out;
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

/* ---------- رندر Markdown-lite مقالات ----------
   پشتیبانی: ## تیتر ۲، ### تیتر ۳، **بولد**، - لیست، 1. لیست شماره‌دار، > نقل، [پ:اسلاگ] کارت محصول */
function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function inline(s: string): string {
  let out = esc(s);
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\[پ:(.+?)\]/g, (_m, slug) => `<!--pc:${slug}-->`);
  return out;
}
export function renderArticle(body: string): string {
  const lines = body.split('\n');
  let html = '';
  let list: string[] = [];
  let listType = '';
  const flush = () => {
    if (list.length) {
      html += `<${listType === 'ol' ? 'ol' : 'ul'}>${list.map((li) => `<li>${inline(li)}</li>`).join('')}</${listType === 'ol' ? 'ol' : 'ul'}>`;
      list = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    if (line.startsWith('### ')) { flush(); html += `<h3>${inline(line.slice(4))}</h3>`; continue; }
    if (line.startsWith('## ')) { flush(); html += `<h2>${inline(line.slice(3))}</h2>`; continue; }
    if (line.startsWith('> ')) { flush(); html += `<blockquote>${inline(line.slice(2))}</blockquote>`; continue; }
    if (line.startsWith('- ')) { if (listType !== 'ul') flush(); listType = 'ul'; list.push(line.slice(2)); continue; }
    if (/^\d+\.\s/.test(line)) { if (listType !== 'ol') flush(); listType = 'ol'; list.push(line.replace(/^\d+\.\s/, '')); continue; }
    flush();
    html += `<p>${inline(line)}</p>`;
  }
  flush();
  return html;
}
/* فهرست مطالب از تیترهای ## */
export function articleToc(body: string) {
  const hs: { id: string; text: string }[] = [];
  let i = 0;
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('## ')) {
      i += 1;
      hs.push({ id: `h${i}`, text: line.slice(3).replace(/\*\*/g, '') });
    }
  }
  return hs;
}
export function articleBodyWithIds(body: string): string {
  let i = 0;
  return renderArticle(body).replace(/<h2>/g, () => { i += 1; return `<h2 id="h${i}">`; });
}
