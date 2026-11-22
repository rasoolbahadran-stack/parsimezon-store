'use client';
/* پوسته پنل: گیت ورود دمو + سایدبار + تاپ‌بار + تم روشن/تیره */
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AUTH_KEY, THEME_KEY, ensureSeed, getSettings } from '@/lib/store';
import { ToastHost } from '@/lib/ui';
import Logo from './Logo';

const NAV: { group: string; items: { href: string; label: string; icon: string }[] }[] = [
  {
    group: 'کلی',
    items: [{ href: '/', label: 'داشبورد', icon: '▦' }],
  },
  {
    group: 'فروش',
    items: [
      { href: '/orders', label: 'سفارش‌ها', icon: '🛒' },
      { href: '/payments', label: 'پرداخت‌ها', icon: '💳' },
      { href: '/shipping', label: 'ارسال', icon: '🚚' },
      { href: '/returns', label: 'بازگشت کالا', icon: '↩️' },
    ],
  },
  {
    group: 'محصولات',
    items: [
      { href: '/products', label: 'همه محصولات', icon: '👗' },
      { href: '/products/categories', label: 'دسته‌بندی‌ها', icon: '🗂️' },
      { href: '/products/brands', label: 'برندها', icon: '🏷️' },
      { href: '/products/attributes', label: 'ویژگی‌ها و تنوع‌ها', icon: '🎨' },
      { href: '/products/inventory', label: 'موجودی انبار', icon: '📦' },
    ],
  },
  {
    group: 'مشتریان',
    items: [{ href: '/customers', label: 'مشتریان', icon: '👥' }],
  },
  {
    group: 'بازاریابی',
    items: [{ href: '/marketing/coupons', label: 'کوپن‌های تخفیف', icon: '🎟️' }],
  },
  {
    group: 'محتوا',
    items: [
      { href: '/content/pages', label: 'صفحات', icon: '📄' },
      { href: '/content/posts', label: 'مقالات مجله', icon: '📝' },
      { href: '/content/collections', label: 'کالکشن‌ها', icon: '🧥' },
      { href: '/content/slides', label: 'بنرهای صفحه اصلی', icon: '🖼️' },
      { href: '/media', label: 'رسانه‌ها', icon: '🗃️' },
    ],
  },
  {
    group: 'تعاملات',
    items: [
      { href: '/interactions/reviews', label: 'نظرات', icon: '⭐' },
      { href: '/interactions/messages', label: 'پیام‌ها', icon: '✉️' },
    ],
  },
  {
    group: 'سیستم',
    items: [
      { href: '/reports', label: 'گزارش‌ها', icon: '📊' },
      { href: '/users', label: 'کاربران و نقش‌ها', icon: '🔐' },
      { href: '/settings', label: 'تنظیمات', icon: '⚙️' },
    ],
  },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    ensureSeed();
    const savedTheme = (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
    setTheme(savedTheme);
    document.documentElement.dataset.theme = savedTheme;
    setAuthed(sessionStorage.getItem(AUTH_KEY) === '1');
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (authed === null) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div className="skel" style={{ width: 220, height: 18 }} />
      </div>
    );
  }

  if (!authed) return <LoginScreen onOk={() => setAuthed(true)} />;

  const siteBase = '/parsimezon-store';
  return (
    <>
      <div className={`backdrop-m ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(false)} />
      <div className="shell">
        <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
          <div className="sidebar__logo">
            <Logo />
            <div>
              <b>پارسی‌مزون</b>
              <small>پنل مدیریت فروشگاه (دمو)</small>
            </div>
          </div>
          {NAV.map((g) => (
            <div className="nav-group" key={g.group}>
              <p className="nav-group__t">{g.group}</p>
              {g.items.map((it) => {
                const active = pathname === it.href || (it.href !== '/' && pathname.startsWith(it.href));
                return (
                  <a key={it.href} href={`${siteBase}/admin${it.href === '/' ? '/' : it.href + '/'}`} className={`nav-item ${active ? 'is-active' : ''}`}>
                    <span aria-hidden>{it.icon}</span>
                    {it.label}
                  </a>
                );
              })}
            </div>
          ))}
          <div className="nav-group">
            <a className="nav-item" href={`${siteBase}/`} target="_blank">
              <span aria-hidden>🌐</span> مشاهده سایت
            </a>
            <button
              className="nav-item"
              style={{ width: '100%', background: 'none', border: 'none', textAlign: 'right' }}
              onClick={() => {
                sessionStorage.removeItem(AUTH_KEY);
                router.refresh();
                location.reload();
              }}
            >
              <span aria-hidden>🚪</span> خروج
            </button>
          </div>
        </aside>

        <div className="main">
          <div className="topbar">
            <button className="btn btn-s btn-icon burger-btn" onClick={() => setMenuOpen(true)} aria-label="منو">☰</button>
            <h1>{currentTitle(pathname)}</h1>
            <div className="topbar__actions">
              <a className="btn btn-s btn-sm" href={`${siteBase}/`} target="_blank">🌐 مشاهده سایت</a>
              <button
                className="btn btn-s btn-icon"
                aria-label="تغییر تم"
                onClick={() => {
                  const next = theme === 'light' ? 'dark' : 'light';
                  setTheme(next);
                  document.documentElement.dataset.theme = next;
                  localStorage.setItem(THEME_KEY, next);
                }}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <span className="pill pill--success">مدیر کل (دمو)</span>
            </div>
          </div>
          <div className="content">{children}</div>
        </div>
      </div>
      <ToastHost />
    </>
  );
}

function currentTitle(pathname: string) {
  const clean = pathname.replace(/\/$/, '') || '/';
  const map: Record<string, string> = {
    '/': 'داشبورد',
    '/orders': 'مدیریت سفارش‌ها',
    '/payments': 'پرداخت‌ها',
    '/shipping': 'روش‌های ارسال',
    '/returns': 'بازگشت کالا',
    '/products': 'همه محصولات',
    '/products/categories': 'دسته‌بندی‌ها',
    '/products/brands': 'برندها',
    '/products/attributes': 'ویژگی‌ها و تنوع‌ها',
    '/products/inventory': 'موجودی انبار',
    '/customers': 'مشتریان',
    '/marketing/coupons': 'کوپن‌های تخفیف',
    '/content/pages': 'مدیریت صفحات',
    '/content/posts': 'مقالات مجله',
    '/content/collections': 'مدیریت کالکشن‌ها',
    '/content/slides': 'بنرهای صفحه اصلی (Hero)',
    '/media': 'کتابخانه رسانه',
    '/interactions/reviews': 'نظرات محصولات',
    '/interactions/messages': 'پیام‌ها',
    '/reports': 'گزارش‌ها',
    '/users': 'کاربران و نقش‌ها',
    '/settings': 'تنظیمات',
  };
  return map[clean] || 'پنل مدیریت';
}

function LoginScreen({ onOk }: { onOk: () => void }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const settings = getSettings();
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: 'var(--bg)', padding: 16 }}>
      <div className="card" style={{ width: 'min(400px, 100%)' }}>
        <div style={{ padding: '26px 26px 10px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <Logo size={44} />
          </div>
          <h2 style={{ fontSize: 17 }}>ورود به پنل مدیریت</h2>
          <p style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 4 }}>
            نسخه دمو — هر نام کاربری و رمزی وارد کنید تا وارد شوید.
          </p>
        </div>
        <form
          style={{ padding: '8px 26px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}
          onSubmit={(e) => {
            e.preventDefault();
            if (!user.trim() || !pass.trim()) return;
            sessionStorage.setItem(AUTH_KEY, '1');
            sessionStorage.setItem('ps_admin_user', user);
            onOk();
          }}
        >
          <div>
            <label className="fl">نام کاربری</label>
            <input className="input" value={user} onChange={(e) => setUser(e.target.value)} placeholder="admin" />
          </div>
          <div>
            <label className="fl">رمز عبور</label>
            <input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••" />
          </div>
          <button className="btn btn-p" type="submit">ورود به پنل</button>
          <p style={{ fontSize: 11, color: 'var(--text-soft)', textAlign: 'center' }}>
            🔐 این نسخه بدون بک‌اند است؛ ورود فقط نمایشی است و امنیت واقعی ندارد.
          </p>
        </form>
      </div>
    </div>
  );
}
