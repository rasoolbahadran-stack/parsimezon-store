/* موتور فروشگاه سمت کلاینت — فیلتر حرفه‌ای، چیپ‌های فعال، مرتب‌سازی، لود مور (مشترک بین /shop، /category و صفحات هاب) */

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

let state = { page: 1, per: 24, list: [] };
let config = { fixedCat: '', lockedCat: false, presetSale: false, presetSort: '' };

export function initShop(opts = {}) {
  config = {
    fixedCat: opts.fixedCat || '',
    lockedCat: !!opts.lockedCat,
    presetSale: !!opts.presetSale,
    presetSort: opts.presetSort || '',
    container: opts.container || 'shop-grid',
    cats: JSON.parse(localStorage.getItem('ps_categories') || '[]'),
  };
  const base = document.documentElement.dataset.base || '';
  const grid = document.getElementById(config.container);
  if (!grid) return;

  const products = JSON.parse(localStorage.getItem('ps_products') || '[]').filter((p) => p.status === 'published');

  /* فیلتر دسته‌بندی — سایدبار (فقط صفحه فروشگاه آزاد) */
  const catBox = document.getElementById('filter-cats');
  if (catBox) {
    catBox.innerHTML = config.cats.map((c) => {
      const n = products.filter((p) => p.category === c.id).length;
      return `<label class="f-cat"><input type="radio" name="f-cat" class="f-cat-r" value="${c.slug}" />${c.name}<small>${fa(n)}</small></label>`;
    }).join('');
    catBox.addEventListener('change', () => { state.page = 1; syncStrip(); render(); });
  }

  /* نوار چیپ دسته‌ها (اسکرول افقی) */
  const chips = document.getElementById('cat-chips');
  if (chips) {
    chips.addEventListener('click', (e) => {
      const b = e.target.closest('.cat-chip');
      if (!b) return;
      chips.querySelectorAll('.cat-chip').forEach((x) => x.classList.remove('is-active'));
      b.classList.add('is-active');
      const r = catBox?.querySelector(`.f-cat-r[value="${b.dataset.slug}"]`);
      if (catBox) catBox.querySelectorAll('input').forEach((x) => (x.checked = false));
      if (r) r.checked = true;
      state.page = 1;
      render();
    });
    /* حالت اولیه از URL */
    const qcat = new URLSearchParams(location.search).get('cat');
    if (qcat) {
      const target = chips.querySelector(`[data-slug="${qcat}"]`);
      if (target) target.click();
    }
  }
  function syncStrip() {
    const active = catBox?.querySelector('.f-cat-r:checked');
    if (!chips || !catBox) return;
    chips.querySelectorAll('.cat-chip').forEach((x) => x.classList.toggle('is-active', !!active && x.dataset.slug === active.value));
  }

  /* فیلتر رنگ — دایره‌ها */
  const allColors = [...new Set(products.flatMap((p) => p.colors || []))];
  const colorBox = document.getElementById('filter-colors');
  if (colorBox) {
    colorBox.innerHTML = allColors.map((c) => `
      <button type="button" class="f-color" data-color="${c}" aria-pressed="false">
        <i style="background:${COLOR_HEX[c] || '#ccc'}"></i><span>${c}</span>
      </button>`).join('');
    colorBox.addEventListener('click', (e) => {
      const b = e.target.closest('.f-color');
      if (b) { b.classList.toggle('is-active'); b.setAttribute('aria-pressed', b.classList.contains('is-active')); state.page = 1; render(); }
    });
  }

  /* فیلتر سایز — جعبه‌های لمسی */
  const allSizes = [...new Set(products.flatMap((p) => p.sizes || []))].filter((s) => s !== 'تک‌سایز');
  const sizeBox = document.getElementById('filter-sizes');
  if (sizeBox) {
    sizeBox.className = 'size-boxes';
    sizeBox.innerHTML = allSizes.map((s) => `<label><input type="checkbox" class="f-size" value="${s}" />${s}</label>`).join('');
    sizeBox.addEventListener('change', (e) => {
      const lbl = e.target.closest('label');
      if (lbl) lbl.classList.toggle('is-checked', e.target.checked);
      state.page = 1; render();
    });
  }

  /* میان‌برهای قیمت */
  const presetBox = document.getElementById('price-presets');
  if (presetBox) {
    presetBox.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-min]');
      if (!b) return;
      presetBox.querySelectorAll('button').forEach((x) => x.classList.remove('is-active'));
      b.classList.add('is-active');
      const min = document.getElementById('f-min');
      const max = document.getElementById('f-max');
      if (min) min.value = b.dataset.min === '0' ? '' : fa(b.dataset.min).replace(/[٬,]/g, '');
      if (max) max.value = b.dataset.max ? fa(b.dataset.max).replace(/[٬,]/g, '') : '';
      state.page = 1; render();
    });
  }

  document.querySelectorAll('.f-sale, .f-stock').forEach((el) => el.addEventListener('change', () => { state.page = 1; render(); }));
  document.getElementById('f-apply')?.addEventListener('click', () => { state.page = 1; render(); });
  ['f-min', 'f-max'].forEach((id) => document.getElementById(id)?.addEventListener('change', () => { state.page = 1; render(); }));
  document.getElementById('f-sort')?.addEventListener('change', () => { state.page = 1; render(); });

  const clearAll = () => {
    document.querySelectorAll('.f-size, .f-sale, .f-stock').forEach((x) => (x.checked = false));
    sizeBox?.querySelectorAll('label').forEach((x) => x.classList.remove('is-checked'));
    colorBox?.querySelectorAll('.is-active').forEach((x) => x.classList.remove('is-active'));
    catBox?.querySelectorAll('input').forEach((x) => (x.checked = false));
    document.querySelectorAll('#f-min, #f-max').forEach((x) => (x.value = ''));
    document.getElementById('price-presets')?.querySelectorAll('.is-active').forEach((x) => x.classList.remove('is-active'));
    if (chips) { chips.querySelectorAll('.cat-chip').forEach((x) => x.classList.remove('is-active')); chips.querySelector('[data-slug="all"]')?.classList.add('is-active'); }
    if (!config.presetSale) { const s = new URLSearchParams(location.search); s.delete('sale'); history.replaceState(null, '', location.pathname + (s.toString() ? '?' + s : '')); }
    state.page = 1;
    render();
  };
  document.getElementById('filter-clear')?.addEventListener('click', clearAll);
  document.getElementById('filter-clear-2')?.addEventListener('click', clearAll);

  /* کشوی فیلتر موبایل */
  document.getElementById('filter-toggle')?.addEventListener('click', () => {
    document.querySelector('.shop-side')?.classList.add('is-open');
    document.getElementById('drawer-backdrop')?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });
  const closeFilterDrawer = () => {
    document.querySelector('.shop-side')?.classList.remove('is-open');
    document.getElementById('drawer-backdrop')?.classList.remove('is-open');
    document.body.style.overflow = '';
  };
  document.getElementById('filter-close')?.addEventListener('click', closeFilterDrawer);
  document.getElementById('filter-apply-m')?.addEventListener('click', () => { closeFilterDrawer(); });
  document.getElementById('drawer-backdrop')?.addEventListener('click', () => {
    closeFilterDrawer();
    document.getElementById('mobile-nav')?.classList.remove('is-open');
    document.getElementById('cart-drawer')?.classList.remove('is-open');
  });
  document.getElementById('load-more')?.addEventListener('click', () => { state.page += 1; render(); });

  /* اگر sale=1 در URL است، چک‌باکس تخفیف را روشن کن */
  if (new URLSearchParams(location.search).get('sale') === '1' || config.presetSale) {
    const s = document.getElementById('f-sale');
    if (s) s.checked = true;
    if (config.presetSort) { const sort = document.getElementById('f-sort'); if (sort) sort.value = config.presetSort; }
  }

  render();
}

function readFilters() {
  const q = new URLSearchParams(location.search);
  const activeChip = document.querySelector('.cat-chip.is-active');
  const chipCat = activeChip && activeChip.getAttribute('data-slug') !== 'all' ? activeChip.getAttribute('data-slug') : '';
  const radioCat = document.querySelector('.f-cat-r:checked')?.value || '';
  const minRaw = (document.getElementById('f-min')?.value || '').replace(/[^\d]/g, '');
  const maxRaw = (document.getElementById('f-max')?.value || '').replace(/[^\d]/g, '');
  return {
    q: q.get('q') || '',
    cat: config.lockedCat ? config.fixedCat : (chipCat || radioCat || q.get('cat') || ''),
    min: parseInt(minRaw) || 0,
    max: parseInt(maxRaw) || Infinity,
    sizes: [...document.querySelectorAll('.f-size:checked')].map((x) => x.value),
    colors: [...document.querySelectorAll('.f-color.is-active')].map((x) => x.dataset.color),
    sale: document.getElementById('f-sale')?.checked || false,
    stock: document.getElementById('f-stock')?.checked || false,
    sort: document.getElementById('f-sort')?.value || config.presetSort || 'new',
    cats: config.cats || [],
  };
}

function cardHTML(p, base) {
  const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const second = p.images[1] || p.images[0];
  const fb = (p.images[0] || 'coat01').replace(/\d+$/, '') + '01';
  const badge = off ? `<span class="badge badge--sale">٪${fa(off)} تخفیف</span>` : p.bestseller ? '<span class="badge badge--best">پرفروش</span>' : p.isNew ? '<span class="badge badge--new">جدید</span>' : '';
  return `
  <article class="product-card">
    <div class="product-card__media">
      ${badge}${p.stock <= 0 ? '<span class="badge badge--out" style="top:44px">ناموجود</span>' : ''}
      <a href="${base}/product/${p.slug}" aria-label="${p.name}">
        <img class="img-main" src="${base}/assets/img/${p.images[0]}.webp" alt="${p.name}" data-fb="${fb}" loading="lazy" width="600" height="800">
        ${second !== p.images[0] ? `<img class="img-hover" src="${base}/assets/img/${second}.webp" alt="${p.name} — نمای دوم" loading="lazy" width="600" height="800">` : ''}
      </a>
      <button class="wish-fab" data-wish-btn="${p.id}" aria-label="افزودن به علاقه‌مندی‌ها" aria-pressed="false"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-9.5-9A5.5 5.5 0 0 1 12 6.3 5.5 5.5 0 0 1 21.5 12c-2 4.4-9.5 9-9.5 9z"/></svg></button>
      <div class="product-card__tools">
        <button class="tool-btn" data-quickview="${p.id}" aria-label="مشاهده سریع"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/></svg></button>
        <button class="tool-btn" data-compare-btn="${p.id}" aria-label="مقایسه"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 3v18M16 3v18M3 8l5-5 5 5M21 16l-5 5-5-5"/></svg></button>
      </div>
      <div class="product-card__actions">
        ${p.stock > 0 ? `<button class="add-btn" data-add="${p.id}">افزودن به سبد</button>` : '<button class="add-btn" disabled>ناموجود</button>'}
        <button class="qv-btn" data-quickview="${p.id}">مشاهده سریع</button>
      </div>
      ${p.stock > 0 ? `<button class="quick-add" data-add="${p.id}" aria-label="افزودن ${p.name} به سبد"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 7h12l1.2 12.2a1 1 0 0 1-1 1.1H5.8a1 1 0 0 1-1-1.1L6 7z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg><span>افزودن</span></button>` : ''}
    </div>
    <div class="product-card__body">
      <span class="product-card__cat">${(config.cats.find((c) => c.id === p.category) || {}).name || ''}</span>
      <a href="${base}/product/${p.slug}"><h3 class="product-card__title">${p.name}</h3></a>
      <div class="price"><span class="price__current">${p.oldPrice ? `<del>${fa(p.oldPrice)}</del>` : ''}${fa(p.price)}</span><span class="price__unit">تومان</span></div>
      <div class="color-dots">${(p.colors || []).slice(0, 4).map((c) => `<i style="background:${COLOR_HEX[c] || '#ccc'}"></i>`).join('')}</div>
    </div>
  </article>`;
}

function renderActiveChips(f, base) {
  const box = document.getElementById('active-chips');
  if (!box) return;
  const chips = [];
  f.colors.forEach((c) => chips.push(`<span class="active-chip">رنگ: ${c}<button data-rm-color="${c}" aria-label="حذف فیلتر رنگ">×</button></span>`));
  f.sizes.forEach((s) => chips.push(`<span class="active-chip">سایز: ${s}<button data-rm-size="${s}" aria-label="حذف فیلتر سایز">×</button></span>`));
  if (f.min) chips.push(`<span class="active-chip">از ${fa(f.min)}<button data-rm-price="min" aria-label="حذف">×</button></span>`);
  if (f.max !== Infinity) chips.push(`<span class="active-chip">تا ${fa(f.max)}<button data-rm-price="max" aria-label="حذف">×</button></span>`);
  if (f.sale) chips.push(`<span class="active-chip">تخفیف‌دار<button data-rm-flag="sale" aria-label="حذف">×</button></span>`);
  if (f.stock) chips.push(`<span class="active-chip">موجود<button data-rm-flag="stock" aria-label="حذف">×</button></span>`);
  if (f.cat) {
    const c = f.cats.find((x) => x.slug === f.cat);
    if (c) chips.push(`<span class="active-chip">${c.name}<button data-rm-cat="1" aria-label="حذف فیلتر دسته">×</button></span>`);
  }
  box.innerHTML = chips.length ? chips.join('') + '<button class="active-chip active-chip--clear" id="active-clear">حذف همه فیلترها</button>' : '';
  if (!chips.length) return;
  box.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.id === 'active-clear') return (document.getElementById('filter-clear') || document.getElementById('filter-clear-2'))?.click();
    if (t.dataset.rmColor) { document.querySelector(`.f-color[data-color="${t.dataset.rmColor}"]`)?.click(); return; }
    if (t.dataset.rmSize) { const cb = [...document.querySelectorAll('.f-size')].find((x) => x.value === t.dataset.rmSize); if (cb) { cb.checked = false; cb.closest('label')?.classList.remove('is-checked'); cb.dispatchEvent(new Event('change', { bubbles: false })); state.page = 1; render(); } return; }
    if (t.dataset.rmPrice) { document.getElementById(t.dataset.rmPrice === 'min' ? 'f-min' : 'f-max').value = ''; state.page = 1; render(); return; }
    if (t.dataset.rmFlag) { const cb = document.getElementById('f-' + t.dataset.rmFlag); if (cb) { cb.checked = false; state.page = 1; render(); } return; }
    if (t.dataset.rmCat) {
      document.querySelectorAll('.f-cat-r').forEach((x) => (x.checked = false));
      document.querySelectorAll('.cat-chip').forEach((x) => x.classList.remove('is-active'));
      document.querySelector('.cat-chip[data-slug="all"]')?.classList.add('is-active');
      state.page = 1; render();
    }
  });
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
  if (found) found.innerHTML = `<b>${fa(list.length)}</b> محصول`;
  if (empty) empty.style.display = list.length ? 'none' : 'block';
  if (moreBtn) moreBtn.style.display = shown.length < list.length ? 'inline-flex' : 'none';
  /* بج شمار فیلتر فعال روی دکمه فیلتر موبایل */
  const nActive = f.colors.length + f.sizes.length + (f.sale ? 1 : 0) + (f.stock ? 1 : 0) + (f.min ? 1 : 0) + (f.max !== Infinity ? 1 : 0);
  const badge = document.getElementById('ft-badge');
  if (badge) { badge.textContent = fa(nActive); badge.style.display = nActive ? 'inline-flex' : 'none'; }
  renderActiveChips(f, base);
  /* علاقه‌مندی‌های فعال را روی کارت‌های تازه رندرشده اعمال کن */
  try {
    const w = JSON.parse(localStorage.getItem('ps_wishlist') || '[]');
    grid.querySelectorAll('[data-wish-btn]').forEach((b) => {
      if (w.includes(b.dataset.wishBtn)) { b.classList.add('is-active'); b.setAttribute('aria-pressed', 'true'); }
    });
    const c = JSON.parse(localStorage.getItem('ps_compare') || '[]');
    grid.querySelectorAll('[data-compare-btn]').forEach((b) => { if (c.includes(b.dataset.compareBtn)) b.classList.add('is-active'); });
  } catch {}
}
