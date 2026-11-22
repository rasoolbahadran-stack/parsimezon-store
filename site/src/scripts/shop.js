/* موتور فروشگاه سمت کلاینت — فیلتر، مرتب‌سازی، لود مور، کارت‌سازی (مشترک بین /shop و /category) */

const COLOR_HEX = {
  'مشکی': '#1a1a1a', 'سفید': '#f7f5f0', 'کرم': '#e8dcc8', 'بژ': '#d8c3a5', 'شتری': '#b98a5e',
  'قهوه‌ای': '#6b4a34', 'زغالی': '#3d3d3d', 'طوسی': '#9a9a9a', 'سرمه‌ای': '#1f2a44', 'آبی': '#4a6fa5',
  'سبز یشمی': '#4d7a5f', 'زرشکی': '#7a1f2b', 'قرمز': '#a83232', 'گلبهی': '#e8b4b8', 'خردلی': '#c8a13a',
  'بنفش': '#5e4b7a', 'دودی': '#5a5a5a',
};

function normFa(s) {
  return (s || '').normalize('NFKC').replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/ة/g, 'ه').replace(/ۀ/g, 'ه')
    .replace(/[\u200c\u200f\u200e]/g, '').replace(/\u0640/g, '')
    .replace(/[\u064B-\u065F\u0670]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}
const fa = (n) => new Intl.NumberFormat('fa-IR').format(n);

let state = { page: 1, per: 12, list: [] };
let config = { fixedCat: '', lockedCat: false };

export function initShop(opts = {}) {
  config = { fixedCat: opts.fixedCat || '', lockedCat: !!opts.lockedCat, container: opts.container || 'shop-grid', cats: JSON.parse(localStorage.getItem('ps_categories') || '[]') };
  const base = document.documentElement.dataset.base || '';
  const grid = document.getElementById(config.container);
  if (!grid) return;

  /* ساخت فیلترهای رنگ از داده واقعی محصولات */
  const products = JSON.parse(localStorage.getItem('ps_products') || '[]').filter((p) => p.status === 'published');
  const allColors = [...new Set(products.flatMap((p) => p.colors || []))];
  const colorBox = document.getElementById('filter-colors');
  if (colorBox) {
    colorBox.innerHTML = allColors.map((c) => `
      <button type="button" class="f-color" data-color="${c}">
        <i style="background:${COLOR_HEX[c] || '#ccc'}"></i><span>${c}</span>
      </button>`).join('');
    colorBox.addEventListener('click', (e) => {
      const b = e.target.closest('.f-color');
      if (b) { b.classList.toggle('is-active'); state.page = 1; render(); }
    });
  }
  /* ساخت فیلتر سایز از داده */
  const allSizes = [...new Set(products.flatMap((p) => p.sizes || []))].filter((s) => s !== 'تک‌سایز');
  const sizeBox = document.getElementById('filter-sizes');
  if (sizeBox) {
    sizeBox.innerHTML = allSizes.map((s) => `<label><input type="checkbox" class="f-size" value="${s}" />${s}</label>`).join('');
    sizeBox.addEventListener('change', () => { state.page = 1; render(); });
  }
  /* چیلپ‌های دسته (در صفحه shop) */
  const chips = document.getElementById('cat-chips');
  if (chips) {
    chips.addEventListener('click', (e) => {
      const b = e.target.closest('.cat-chip');
      if (!b) return;
      chips.querySelectorAll('.cat-chip').forEach((x) => x.classList.remove('is-active'));
      b.classList.add('is-active');
      state.page = 1;
      render();
    });
  }

  document.querySelectorAll('.f-sale, .f-stock').forEach((el) => el.addEventListener('change', () => { state.page = 1; render(); }));
  document.getElementById('f-apply')?.addEventListener('click', () => { state.page = 1; render(); });
  document.getElementById('f-min')?.addEventListener('input', () => { state.page = 1; render(); });
  document.getElementById('f-max')?.addEventListener('input', () => { state.page = 1; render(); });
  document.getElementById('f-sort')?.addEventListener('change', () => { state.page = 1; render(); });
  document.getElementById('filter-clear')?.addEventListener('click', () => {
    document.querySelectorAll('.f-size, .f-sale, .f-stock').forEach((x) => (x.checked = false));
    colorBox?.querySelectorAll('.is-active').forEach((x) => x.classList.remove('is-active'));
    document.querySelectorAll('#f-min, #f-max').forEach((x) => (x.value = ''));
    state.page = 1;
    render();
  });
  document.getElementById('filter-toggle')?.addEventListener('click', () => {
    document.querySelector('.shop-side')?.classList.add('is-open');
    document.getElementById('drawer-backdrop')?.classList.add('is-open');
  });
  document.getElementById('filter-close')?.addEventListener('click', () => {
    document.querySelector('.shop-side')?.classList.remove('is-open');
    document.getElementById('drawer-backdrop')?.classList.remove('is-open');
  });
  document.getElementById('drawer-backdrop')?.addEventListener('click', () => {
    document.querySelector('.shop-side')?.classList.remove('is-open');
  });
  document.getElementById('load-more')?.addEventListener('click', () => { state.page += 1; render(); });

  render();
}

function readFilters() {
  const q = new URLSearchParams(location.search);
  const activeChip = document.querySelector('.cat-chip.is-active');
  const chipCat = activeChip && activeChip.getAttribute('data-slug') !== 'all' ? activeChip.getAttribute('data-slug') : '';
  return {
    q: q.get('q') || '',
    cat: config.lockedCat ? config.fixedCat : (chipCat || q.get('cat') || ''),
    min: parseInt((document.getElementById('f-min')?.value || '').replace(/[^\d]/g, '')) || 0,
    max: parseInt((document.getElementById('f-max')?.value || '').replace(/[^\d]/g, '')) || Infinity,
    sizes: [...document.querySelectorAll('.f-size:checked')].map((x) => x.value),
    colors: [...document.querySelectorAll('.f-color.is-active')].map((x) => x.dataset.color),
    sale: document.getElementById('f-sale')?.checked || q.get('sale') === '1',
    stock: document.getElementById('f-stock')?.checked || false,
    sort: document.getElementById('f-sort')?.value || 'new',
    cats: config.cats || [],
  };
}

function cardHTML(p, base) {
  const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const second = p.images[1] || p.images[0];
  const badge = off ? `<span class="badge badge--sale">٪${fa(off)} تخفیف</span>` : p.bestseller ? '<span class="badge badge--best">پرفروش</span>' : p.isNew ? '<span class="badge badge--new">جدید</span>' : '';
  return `
  <article class="product-card">
    <div class="product-card__media">
      ${badge}${p.stock <= 0 ? '<span class="badge badge--out" style="top:44px">ناموجود</span>' : ''}
      <a href="${base}/product/${p.slug}" aria-label="${p.name}">
        <img class="img-main" src="${base}/assets/img/${p.images[0]}.webp" alt="${p.name}" loading="lazy">
        ${second !== p.images[0] ? `<img class="img-hover" src="${base}/assets/img/${second}.webp" alt="${p.name} — نمای دوم" loading="lazy">` : ''}
      </a>
      <div class="product-card__tools">
        <button class="tool-btn" data-wish-btn="${p.id}" aria-label="علاقه‌مندی"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-9.5-9A5.5 5.5 0 0 1 12 6.3 5.5 5.5 0 0 1 21.5 12c-2 4.4-9.5 9-9.5 9z"/></svg></button>
        <button class="tool-btn" data-quickview="${p.id}" aria-label="مشاهده سریع"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/></svg></button>
        <button class="tool-btn" data-compare-btn="${p.id}" aria-label="مقایسه"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 3v18M16 3v18M3 8l5-5 5 5M21 16l-5 5-5-5"/></svg></button>
      </div>
      <div class="product-card__actions">
        ${p.stock > 0 ? `<button class="add-btn" data-add="${p.id}">افزودن به سبد</button>` : '<button class="add-btn" disabled>ناموجود</button>'}
        <button class="qv-btn" data-quickview="${p.id}">مشاهده سریع</button>
      </div>
    </div>
    <div class="product-card__body">
      <span class="product-card__cat">${(config.cats.find((c) => c.id === p.category) || {}).name || ''}</span>
      <a href="${base}/product/${p.slug}"><h3 class="product-card__title">${p.name}</h3></a>
      <div class="price"><span class="price__current">${p.oldPrice ? `<del>${fa(p.oldPrice)}</del>` : ''}${fa(p.price)}</span><span class="price__unit">تومان</span></div>
      <div class="color-dots">${(p.colors || []).slice(0, 4).map((c) => `<i style="background:${COLOR_HEX[c] || '#ccc'}"></i>`).join('')}</div>
    </div>
  </article>`;
}

function render() {
  const base = document.documentElement.dataset.base || '';
  const grid = document.getElementById(config.container);
  const empty = document.getElementById('shop-empty');
  const found = document.getElementById('found-count');
  const moreBtn = document.getElementById('load-more');
  if (!grid) return;
  const f = readFilters();
  let list = JSON.parse(localStorage.getItem('ps_products') || '[]').filter((p) => p.status === 'published');
  const nq = normFa(f.q);
  if (nq) list = list.filter((p) => normFa(p.name + ' ' + p.shortDesc + ' ' + (p.tags || []).join(' ') + ' ' + ((f.cats.find((c) => c.id === p.category) || {}).name || '')).includes(nq));
  if (f.cat) {
    const c = f.cats.find((x) => x.slug === f.cat);
    list = list.filter((p) => p.category === (c ? c.id : f.cat));
  }
  if (f.sale) list = list.filter((p) => p.oldPrice);
  if (f.stock) list = list.filter((p) => p.stock > 0);
  if (f.min) list = list.filter((p) => p.price >= f.min);
  if (f.max !== Infinity) list = list.filter((p) => p.price <= f.max);
  if (f.sizes.length) list = list.filter((p) => (p.sizes || []).some((s) => f.sizes.includes(s)));
  if (f.colors.length) list = list.filter((p) => (p.colors || []).some((c) => f.colors.includes(c)));
  if (f.sort === 'cheap') list.sort((a, b) => a.price - b.price);
  else if (f.sort === 'exp') list.sort((a, b) => b.price - a.price);
  else if (f.sort === 'pop') list.sort((a, b) => b.reviewsCount - a.reviewsCount);
  else if (f.sort === 'sale') list.sort((a, b) => (b.oldPrice ? 1 - b.price / b.oldPrice : 0) - (a.oldPrice ? 1 - a.price / a.oldPrice : 0));
  else list.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  state.list = list;
  const shown = list.slice(0, state.page * state.per);
  grid.innerHTML = shown.map((p) => cardHTML(p, base)).join('');
  if (found) found.textContent = `${fa(list.length)} محصول`;
  if (empty) empty.style.display = list.length ? 'none' : 'block';
  if (moreBtn) moreBtn.style.display = shown.length < list.length ? 'inline-flex' : 'none';
}
