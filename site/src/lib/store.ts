/* لایه داده مشترک کلاینت — سبد، سفارش، مشتری، کشو و تُست (دمو با LocalStorage) */

export const LS = {
  products: 'ps_products',
  categories: 'ps_categories',
  brands: 'ps_brands',
  coupons: 'ps_coupons',
  orders: 'ps_orders',
  customers: 'ps_customers',
  reviews: 'ps_reviews',
  settings: 'ps_settings',
  cart: 'ps_cart',
  user: 'ps_user',
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

/* ---------- کد تخفیف ---------- */
export function applyCoupon(code: string, subtotal: number) {
  const coupons = load<any[]>(LS.coupons, []);
  const c = coupons.find((x) => x.code.toUpperCase() === code.trim().toUpperCase() && x.active);
  if (!c) return { ok: false, msg: 'کد تخفیف نامعتبر است' };
  if (subtotal < (c.minOrder || 0)) return { ok: false, msg: `حداقل مبلغ سفارش برای این کد: ${money(c.minOrder)} تومان` };
  const discount = c.type === 'percent' ? Math.round((subtotal * c.amount) / 100) : c.amount;
  return { ok: true, coupon: c.code, discount: Math.min(discount, subtotal), msg: `کد تخفیف اعمال شد` };
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
    status: payload.paymentMethod === 'cod' ? 'processing' : 'processing',
    trackingCode: '',
    createdAt: new Date().toISOString(),
    history: [{ status: 'pending', at: new Date().toISOString() }, { status: 'processing', at: new Date().toISOString() }],
  };
  orders.unshift(order);
  save(LS.orders, orders);

  /* کاهش موجودی (یک‌بار برای هر سفارش) */
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

/* ---------- UI: کشو، تُست، بج ---------- */
export function openCart() {
  renderCartDrawer();
  document.getElementById('cart-drawer')?.classList.add('is-open');
  document.getElementById('drawer-backdrop')?.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}
export function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('is-open');
  document.getElementById('drawer-backdrop')?.classList.remove('is-open');
  document.body.style.overflow = '';
}
export function renderCartBadge() {
  const n = getCart().reduce((s, l) => s + l.qty, 0);
  document.querySelectorAll('[data-cart-count]').forEach((el) => (el.textContent = String(n)));
}
export function renderCartDrawer() {
  const box = document.getElementById('cart-drawer-items');
  const totalEl = document.getElementById('cart-drawer-total');
  if (!box || !totalEl) return;
  const { items, subtotal, freeOver } = cartTotals();
  if (!items.length) {
    box.innerHTML = `<div class="cart-empty"><div class="cart-empty__icon">🛍️</div><p>سبد خرید شما خالی است.</p></div>`;
    totalEl.textContent = money(0) + ' تومان';
    return;
  }
  box.innerHTML = items
    .map(
      (l) => `
    <div class="cart-line">
      <img src="${document.baseURI.replace(/\/[^/]*$/, '/') || ''}assets/img/${l.product.images[0]}.webp" alt="${l.product.name}"
           onerror="this.src='${document.documentElement.dataset.base || ''}/assets/img/${l.product.images[0]}.webp'">
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
  const remain = freeOver - subtotal;
  const shipNote = document.getElementById('cart-ship-note');
  if (shipNote) shipNote.textContent = remain > 0 ? `تا ارسال رایگان: ${money(remain)} تومان باقی مانده` : 'ارسال سفارش شما رایگان است 🎉';
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

/* ---------- بوت‌استرپ عمومی صفحه ---------- */
export function bootShared(root: string) {
  (window as any).__psAdd = addToCart;
  (window as any).__psRefreshBadge = renderCartBadge;
  (window as any).__psStore = { createOrder, setCart, addToCart, openCart, toast, load, save };
  document.documentElement.dataset.base = root;
  renderCartBadge();
  renderCartDrawer();

  /* کشو */
  document.getElementById('drawer-backdrop')?.addEventListener('click', closeCart);
  document.getElementById('cart-drawer-close')?.addEventListener('click', closeCart);
  document.querySelectorAll('[data-open-cart]').forEach((b) => b.addEventListener('click', openCart));

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
    (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add('is-in')),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* افزودن سریع به سبد از کارت محصول */
  document.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.add!;
      const p = load<any[]>(LS.products, []).find((x) => x.id === id);
      addToCart(id, undefined, 1, p?.name);
    });
  });
}
