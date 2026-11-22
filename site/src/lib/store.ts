/* لایه داده مشترک کلاینت نسخه ۲ — سبد، سفارش، wishlist، مقایسه، جستجو، کشوها (دمو با LocalStorage) */

export const LS = {
  products: 'ps_products', categories: 'ps_categories', brands: 'ps_brands', coupons: 'ps_coupons',
  orders: 'ps_orders', customers: 'ps_customers', reviews: 'ps_reviews', settings: 'ps_settings',
  cart: 'ps_cart', user: 'ps_user', wishlist: 'ps_wishlist', compare: 'ps_compare', articles: 'ps_articles',
};

export function load<T = any>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* نرمال‌سازی فارسی برای جستجو: ي→ی، ك→ک، ة→ه، فرم‌های presentation عربی، حذف ZWNJ و نیم‌فاصله‌ها */
export function normFa(s: string): string {
  return (s || '')
    .normalize('NFKC')
    .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/ة/g, 'ه').replace(/ۀ/g, 'ه')
    .replace(/[\u200c\u200f\u200e]/g, '').replace(/\u0640/g, '')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}

/* ---------- سبد خرید ---------- */
export type CartLine = { id: string; variant?: string; qty: number };

export function getCart(): CartLine[] {
  return load<CartLine[]>(LS.cart, []);
}
export function setCart(lines: CartLine[]) {
  save(LS.cart, lines);
  renderCartBadge();
}
export function addToCart(id: string, variant: string | undefined, qty = 1, name?: string) {
  const lines = getCart();
  const key = id + (variant ? `|${variant}` : '');
  const found = lines.find((l) => l.id + (l.variant ? `|${l.variant}` : '') === key);
  if (found) found.qty += qty;
  else lines.push({ id, variant, qty });
  setCart(lines);
  toast(`<b>${name || 'محصول'}</b> به سبد خرید اضافه شد`);
  openCart();
}

/* ---------- قیمت‌گذاری ---------- */
export function money(n: number): string {
  return new Intl.NumberFormat('fa-IR').format(n);
}
export function cartTotals(lines = getCart()) {
  const products = load<any[]>(LS.products, []);
  const settings = load<any>(LS.settings, {});
  let subtotal = 0;
  const detailed = lines
    .map((l) => {
      const p = products.find((x) => x.id === l.id);
      if (!p) return null;
      let price = p.price;
      let vname = '';
      if (l.variant && Array.isArray(p.variants)) {
        const v = p.variants.find((v: any) => `${v.color} / ${v.size}` === l.variant || v.id === l.variant);
        if (v) {
          price = v.price ?? p.price;
          vname = `${v.color} / ${v.size}`;
        }
      }
      const lineSum = price * l.qty;
      subtotal += lineSum;
      return { ...l, product: p, price, vname, lineSum };
    })
    .filter(Boolean) as any[];
  const freeOver = settings.freeShippingThreshold ?? 3000000;
  return { items: detailed, subtotal, freeOver };
}

/* ---------- کد تخفیف (درصدی/مبلغی با سقف) ---------- */
export function applyCoupon(code: string, subtotal: number) {
  const coupons = load<any[]>(LS.coupons, []);
  const c = coupons.find((x) => x.code.toUpperCase() === code.trim().toUpperCase() && x.active);
  if (!c) return { ok: false, msg: 'کد تخفیف نامعتبر است' };
  if (subtotal < (c.minOrder || 0)) return { ok: false, msg: `حداقل مبلغ سفارش برای این کد: ${money(c.minOrder)} تومان` };
  let discount = c.type === 'percent' ? Math.round((subtotal * c.amount) / 100) : c.amount;
  if (c.maxDiscount && c.maxDiscount > 0) discount = Math.min(discount, c.maxDiscount);
  discount = Math.min(discount, subtotal);
  return { ok: true, coupon: c.code, discount, msg: `کد تخفیف ${c.code} اعمال شد` };
}

/* ---------- ثبت سفارش ---------- */
export function createOrder(payload: any): any {
  const orders = load<any[]>(LS.orders, []);
  const seq = 48213 + orders.filter((o) => String(o.code).startsWith('PS-')).length;
  const order = {
    id: 'o' + Date.now(),
    code: `PS-${seq}`,
    customerId: payload.customerId || null,
    customer: payload.customer,
    items: payload.items,
    subtotal: payload.subtotal,
    discount: payload.discount || 0,
    shipping: payload.shipping,
    total: payload.total,
    coupon: payload.coupon || '',
    shippingMethod: payload.shippingMethod,
    paymentMethod: payload.paymentMethod,
    paymentStatus: payload.paymentMethod === 'cod' ? 'pending' : 'paid',
    status: 'processing',
    trackingCode: '',
    createdAt: new Date().toISOString(),
    history: [{ status: 'pending', at: new Date().toISOString() }, { status: 'processing', at: new Date().toISOString() }],
  };
  orders.unshift(order);
  save(LS.orders, orders);

  /* کاهش موجودی */
  const products = load<any[]>(LS.products, []);
  payload.items.forEach((it: any) => {
    const p = products.find((x) => x.id === it.productId);
    if (p) {
      p.stock = Math.max(0, (p.stock || 0) - it.qty);
      if (it.variantId && Array.isArray(p.variants)) {
        const v = p.variants.find((v: any) => v.id === it.variantId);
        if (v) v.stock = Math.max(0, (v.stock || 0) - it.qty);
      }
    }
  });
  save(LS.products, products);

  /* ثبت/به‌روزرسانی مشتری */
  const customers = load<any[]>(LS.customers, []);
  const phone = payload.customer.phone;
  let cu = customers.find((c) => c.phone === phone);
  if (!cu) {
    cu = {
      id: 'cu' + Date.now(),
      name: `${payload.customer.firstName} ${payload.customer.lastName}`.trim(),
      phone,
      email: payload.customer.email,
      city: payload.customer.city,
      addresses: [{ title: 'آدرس ثبت‌شده', address: `${payload.customer.province}، ${payload.customer.city}، ${payload.customer.address}`, postal: payload.customer.postal }],
      note: '',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    customers.push(cu);
  }
  save(LS.customers, customers);
  return order;
}

export function getOrder(code: string): any | null {
  return load<any[]>(LS.orders, []).find((o) => o.code === code) || null;
}

/* ---------- Wishlist ---------- */
export function getWishlist(): string[] {
  return load<string[]>(LS.wishlist, []);
}
export function toggleWishlist(id: string): boolean {
  const w = getWishlist();
  const i = w.indexOf(id);
  if (i > -1) {
    w.splice(i, 1);
    toast('از علاقه‌مندی‌ها حذف شد');
  } else {
    w.unshift(id);
    toast('به علاقه‌مندی‌ها اضافه شد ♥');
  }
  save(LS.wishlist, w);
  renderWishlistBadge();
  return i === -1;
}
export function renderWishlistBadge() {
  const n = getWishlist().length;
  document.querySelectorAll('[data-wish-count]').forEach((el) => {
    el.textContent = new Intl.NumberFormat('fa-IR').format(n);
    (el as HTMLElement).style.display = n ? 'flex' : 'none';
  });
  document.querySelectorAll('[data-wish-btn]').forEach((el) => {
    const id = (el as HTMLElement).dataset.wishBtn!;
    el.classList.toggle('is-active', getWishlist().includes(id));
  });
}

/* ---------- مقایسه ---------- */
export function getCompare(): string[] {
  return load<string[]>(LS.compare, []);
}
export function toggleCompare(id: string): boolean {
  let c = getCompare();
  const i = c.indexOf(id);
  if (i > -1) {
    c.splice(i, 1);
    toast('از لیست مقایسه حذف شد');
  } else {
    if (c.length >= 4) {
      toast('حداکثر ۴ محصول قابل مقایسه است');
      return false;
    }
    c.push(id);
    toast('به مقایسه اضافه شد');
  }
  save(LS.compare, c);
  renderCompareBadge();
  return true;
}
export function renderCompareBadge() {
  const n = getCompare().length;
  document.querySelectorAll('[data-compare-count]').forEach((el) => {
    el.textContent = new Intl.NumberFormat('fa-IR').format(n);
    (el as HTMLElement).style.display = n ? 'flex' : 'none';
  });
}

/* ---------- حساب مشتری دمو ---------- */
export function currentUser(): any | null {
  return load<any>(LS.user, null);
}
export function demoLogin(emailOrPhone: string, name?: string) {
  const customers = load<any[]>(LS.customers, []);
  let cu = customers.find((c) => c.email === emailOrPhone || c.phone === emailOrPhone);
  if (!cu) {
    cu = { id: 'cu' + Date.now(), name: name || 'کاربر مهمان', phone: emailOrPhone.match(/^\d/) ? emailOrPhone : '09' + Math.floor(Math.random() * 10 ** 9), email: emailOrPhone.includes('@') ? emailOrPhone : '', city: 'تهران', addresses: [], note: 'ثبت‌نام دمو', createdAt: new Date().toISOString().slice(0, 10) };
    customers.push(cu);
    save(LS.customers, customers);
  }
  save(LS.user, cu);
  return cu;
}
export function demoLogout() {
  localStorage.removeItem(LS.user);
}

/* ---------- UI: کشوها، تُست، بج‌ها ---------- */
export function openCart() {
  renderCartDrawer();
  document.getElementById('cart-drawer')?.classList.add('is-open');
  document.getElementById('drawer-backdrop')?.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}
export function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('is-open');
  document.getElementById('drawer-backdrop')?.classList.remove('is-open');
  document.getElementById('mobile-nav')?.classList.remove('is-open');
  document.body.style.overflow = '';
}
export function renderCartBadge() {
  const n = getCart().reduce((s, l) => s + l.qty, 0);
  document.querySelectorAll('[data-cart-count]').forEach((el) => (el.textContent = new Intl.NumberFormat('fa-IR').format(n)));
}
export function renderCartDrawer() {
  const box = document.getElementById('cart-drawer-items');
  const totalEl = document.getElementById('cart-drawer-total');
  if (!box || !totalEl) return;
  const base = document.documentElement.dataset.base || '';
  const { items, subtotal, freeOver } = cartTotals();
  if (!items.length) {
    box.innerHTML = `<div class="cart-empty"><div class="cart-empty__icon">🛍️</div><p>سبد خرید شما خالی است.</p><a class="btn btn-dark btn-sm" href="${base}/shop">شروع خرید</a></div>`;
    totalEl.textContent = money(0) + ' تومان';
    const bar = document.getElementById('cart-ship-bar');
    if (bar) bar.style.width = '0%';
    const note = document.getElementById('cart-ship-note');
    if (note) note.textContent = '';
    return;
  }
  box.innerHTML = items
    .map(
      (l) => `
    <div class="cart-line">
      <a href="${base}/product/${l.product.slug}"><img src="${base}/assets/img/${l.product.images[0]}.webp" alt="${l.product.name}"></a>
      <div>
        <div class="cart-line__t">${l.product.name}</div>
        <div class="cart-line__v">${l.vname || ''}</div>
        <div class="qty">
          <button data-qty="-1" data-id="${l.id}" data-v="${l.variant || ''}">−</button>
          <input value="${l.qty}" readonly>
          <button data-qty="1" data-id="${l.id}" data-v="${l.variant || ''}">+</button>
        </div>
      </div>
      <div>
        <div class="cart-line__price">${money(l.lineSum)} تومان</div>
        <button class="cart-line__rm" data-rm data-id="${l.id}" data-v="${l.variant || ''}">حذف</button>
      </div>
    </div>`
    )
    .join('');
  totalEl.textContent = money(subtotal) + ' تومان';
  const pct = Math.min(100, Math.round((subtotal / freeOver) * 100));
  const bar = document.getElementById('cart-ship-bar');
  if (bar) bar.style.width = pct + '%';
  const note = document.getElementById('cart-ship-note');
  if (note) note.textContent = subtotal >= freeOver ? '🎉 ارسال سفارش شما رایگان است' : `تا ارسال رایگان: ${money(freeOver - subtotal)} تومان باقی مانده`;
}

export function toast(html: string) {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = html;
  wrap.appendChild(t);
  setTimeout(() => {
    t.classList.add('is-hide');
    setTimeout(() => t.remove(), 300);
  }, 2600);
}

/* ---------- Quick View ---------- */
export function quickView(id: string) {
  const base = document.documentElement.dataset.base || '';
  const p = load<any[]>(LS.products, []).find((x) => x.id === id);
  if (!p) return;
  const modal = document.getElementById('quickview');
  if (!modal) return;
  const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  modal.querySelector('.quickview__body')!.innerHTML = `
    <div class="quickview__media">
      <img src="${base}/assets/img/${p.images[0]}.webp" alt="${p.name}" loading="lazy">
    </div>
    <div class="quickview__info">
      ${off ? `<span class="badge badge--sale" style="position:static;display:inline-block">٪${new Intl.NumberFormat('fa-IR').format(off)} تخفیف</span>` : ''}
      <h3>${p.name}</h3>
      <div class="price" style="margin:8px 0">
        <span class="price__current">${p.oldPrice ? `<del>${money(p.oldPrice)}</del>` : ''}${money(p.price)}</span>
        <span class="price__unit">تومان</span>
      </div>
      <p class="quickview__desc">${p.shortDesc}</p>
      <div class="opt-group">
        <p class="opt-group__t">رنگ: <span id="qv-color-lbl">${p.colors[0]}</span></p>
        <div class="swatches" id="qv-colors">${p.colors.map((c: string, i: number) => `<button class="swatch ${i === 0 ? 'is-active' : ''}" data-v="${c}">${c}</button>`).join('')}</div>
      </div>
      <div class="opt-group">
        <p class="opt-group__t">سایز: <span id="qv-size-lbl">${p.sizes[0]}</span></p>
        <div class="swatches" id="qv-sizes">${p.sizes.map((s: string, i: number) => `<button class="swatch ${i === 0 ? 'is-active' : ''}" data-v="${s}">${s}</button>`).join('')}</div>
      </div>
      <div class="quickview__cta">
        ${p.stock > 0 ? `<button class="btn btn-primary" id="qv-add">افزودن به سبد</button>` : `<button class="btn btn-default" disabled>ناموجود</button>`}
        <a class="btn btn-dark" href="${base}/product/${p.slug}">مشاهده کامل</a>
      </div>
    </div>`;
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  let color = p.colors[0], size = p.sizes[0];
  const pick = (sel: string, lbl: string, cb: (v: string) => void) => {
    modal.querySelectorAll(`${sel} .swatch`).forEach((b) =>
      b.addEventListener('click', () => {
        modal.querySelectorAll(`${sel} .swatch`).forEach((x) => x.classList.remove('is-active'));
        b.classList.add('is-active');
        modal.querySelector(lbl)!.textContent = b.getAttribute('data-v');
        cb(b.getAttribute('data-v')!);
      })
    );
  };
  pick('#qv-colors', '#qv-color-lbl', (v) => (color = v));
  pick('#qv-sizes', '#qv-size-lbl', (v) => (size = v));
  const add = modal.querySelector('#qv-add');
  if (add) add.addEventListener('click', () => {
    closeModal('quickview');
    addToCart(p.id, `${color} / ${size}`, 1, p.name);
  });
}
export function closeModal(id: string) {
  document.getElementById(id)?.classList.remove('is-open');
  document.body.style.overflow = '';
}

/* ---------- بوت‌استرپ عمومی صفحه ---------- */
export function bootShared(root: string) {
  (window as any).__psAdd = addToCart;
  (window as any).__psStore = { createOrder, setCart, addToCart, openCart, closeCart, toast, load, save, toggleWishlist, toggleCompare, quickView, normFa, applyCoupon };
  document.documentElement.dataset.base = root;
  renderCartBadge();
  renderWishlistBadge();
  renderCompareBadge();
  renderCartDrawer();

  /* کشوها */
  document.getElementById('drawer-backdrop')?.addEventListener('click', closeCart);
  document.getElementById('cart-drawer-close')?.addEventListener('click', closeCart);
  document.getElementById('mobile-nav-close')?.addEventListener('click', closeCart);
  document.querySelectorAll('[data-open-cart]').forEach((b) => b.addEventListener('click', openCart));
  document.getElementById('burger')?.addEventListener('click', () => {
    document.getElementById('mobile-nav')?.classList.add('is-open');
    document.getElementById('drawer-backdrop')?.classList.add('is-open');
  });
  document.getElementById('mobile-nav')?.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.tagName === 'A' || t.closest('.mobile-nav__acc')) {
      const acc = t.closest('.mobile-nav__acc') as HTMLElement | null;
      if (acc && !t.closest('a')) { acc.classList.toggle('is-open'); return; }
      closeCart();
    }
  });

  /* تغییر تعداد/حذف داخل کشو */
  document.getElementById('cart-drawer-items')?.addEventListener('click', (e) => {
    const el = e.target as HTMLElement;
    const qtyBtn = el.closest('[data-qty]') as HTMLElement;
    const rmBtn = el.closest('[data-rm]') as HTMLElement;
    const lines = getCart();
    if (qtyBtn) {
      const id = qtyBtn.dataset.id!;
      const v = qtyBtn.dataset.v || '';
      const d = Number(qtyBtn.dataset.qty);
      const idx = lines.findIndex((l) => l.id === id && (l.variant || '') === v);
      if (idx > -1) {
        lines[idx].qty += d;
        if (lines[idx].qty <= 0) lines.splice(idx, 1);
        setCart(lines);
        renderCartDrawer();
      }
    } else if (rmBtn) {
      const id = rmBtn.dataset.id!;
      const v = rmBtn.dataset.v || '';
      const idx = lines.findIndex((l) => l.id === id && (l.variant || '') === v);
      if (idx > -1) {
        lines.splice(idx, 1);
        setCart(lines);
        renderCartDrawer();
      }
    }
  });

  /* هدر چسبنده */
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => header?.classList.toggle('is-scrolled', window.scrollY > 10), { passive: true });

  /* نوار اطلاع‌رسانی */
  document.getElementById('promo-close')?.addEventListener('click', () => {
    (document.querySelector('.promo-bar') as HTMLElement)!.style.display = 'none';
    sessionStorage.setItem('ps_promo_closed', '1');
  });
  if (sessionStorage.getItem('ps_promo_closed')) (document.querySelector('.promo-bar') as HTMLElement)!.style.display = 'none';

  /* انیمیشن ورود با اسکرول */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }),
    { threshold: 0.08 }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* دکمه‌های کارت محصول: افزودن سریع، wishlist، مقایسه، quick view */
  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const add = t.closest('[data-add]') as HTMLElement | null;
    if (add) {
      const id = add.dataset.add!;
      const p = load<any[]>(LS.products, []).find((x) => x.id === id);
      if (p && p.sizes && p.sizes.length > 1 && p.variants && p.variants.length) {
        quickView(id);
      } else {
        addToCart(id, undefined, 1, p?.name);
      }
      return;
    }
    const wsh = t.closest('[data-wish-btn]') as HTMLElement | null;
    if (wsh) { e.preventDefault(); toggleWishlist(wsh.dataset.wishBtn!); return; }
    const cmp = t.closest('[data-compare-btn]') as HTMLElement | null;
    if (cmp) { e.preventDefault(); toggleCompare(cmp.dataset.compareBtn!); return; }
    const qv = t.closest('[data-quickview]') as HTMLElement | null;
    if (qv) { e.preventDefault(); quickView(qv.dataset.quickview!); return; }
    const qvc = t.closest('[data-close-modal]') as HTMLElement | null;
    if (qvc) { closeModal(qvc.dataset.closeModal!); return; }
  });

  /* ESC برای بستن مودال‌ها */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('quickview');
      closeModal('search-modal');
      closeCart();
    }
  });

  /* جستجوی زنده هدر */
  initSearch(root);
}

/* ---------- جستجوی زنده با نرمال‌سازی فارسی ---------- */
export function initSearch(root: string) {
  const input = document.getElementById('header-search-input') as HTMLInputElement | null;
  const box = document.getElementById('search-suggest');
  const modal = document.getElementById('search-modal');
  const modalInput = document.getElementById('search-modal-input') as HTMLInputElement | null;
  const modalBox = document.getElementById('search-modal-suggest');
  if (!input && !modalInput) return;

  function suggest(q: string, target: HTMLElement) {
    const nq = normFa(q);
    if (nq.length < 2) { target.innerHTML = ''; target.classList.remove('is-open'); return; }
    const products = load<any[]>(LS.products, []).filter((p) => p.status === 'published');
    const fa = new Intl.NumberFormat('fa-IR');
    const cats: any = {};
    load<any[]>(LS.categories, []).forEach((c) => (cats[c.id] = { name: c.name, slug: c.slug }));
    const hits = products
      .filter((p) => normFa(p.name + ' ' + p.shortDesc + ' ' + (p.tags || []).join(' ') + ' ' + (cats[p.category]?.name || '')).includes(nq))
      .slice(0, 6);
    if (!hits.length) {
      target.innerHTML = `<div class="search-empty">چیزی برای «${q}» پیدا نشد. املای فارسی یا عبارت کوتاه‌تر را امتحان کنید.</div>`;
      target.classList.add('is-open');
      return;
    }
    target.innerHTML =
      hits.map((p) => `
        <a class="search-hit" href="${root}/product/${p.slug}">
          <img src="${root}/assets/img/${p.images[0]}.webp" alt="" loading="lazy">
          <span class="search-hit__t">${p.name}</span>
          <span class="search-hit__c">${cats[p.category]?.name || ''}</span>
          <span class="search-hit__p">${fa.format(p.price)} تومان</span>
        </a>`).join('') +
      `<a class="search-all" href="${root}/shop?q=${encodeURIComponent(q)}">مشاهده همه نتایج «${q}» ←</a>`;
    target.classList.add('is-open');
  }

  [input, modalInput].forEach((el, idx) => {
    const target = idx === 0 ? box : modalBox;
    if (!el || !target) return;
    el.addEventListener('input', () => suggest(el.value, target));
    el.closest('form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = (el as HTMLInputElement).value.trim();
      if (q) window.location.href = root + '/shop?q=' + encodeURIComponent(q);
    });
  });

  document.getElementById('search-open')?.addEventListener('click', () => {
    modal?.classList.add('is-open');
    setTimeout(() => modalInput?.focus(), 100);
  });
  document.getElementById('search-modal-close')?.addEventListener('click', () => closeModal('search-modal'));
  modal?.addEventListener('click', (e) => { if ((e.target as HTMLElement) === modal) closeModal('search-modal'); });
  document.addEventListener('click', (e) => {
    if (box && !(e.target as HTMLElement).closest('.header-search')) box.classList.remove('is-open');
  });
}
