'use client';
/* کتابخانه رسانه — گالری تصاویر ریپو با پیش‌نمایش و اطلاعات + افزودن تصویر محلی محدود (DataURL با هشدار حجم) */
import { useEffect, useState } from 'react';
import { REPO_IMAGES, IMG_BASE, faNum} from '@/lib/store';
import { Modal , toast } from '@/lib/ui';

export default function MediaPage() {
  const [imgs, setImgs] = useState<string[]>([]);
  const [open, setOpen] = useState<{ name: string; url: string; size?: string; dim?: string } | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    const local: string[] = JSON.parse(localStorage.getItem('ps_media_local') || '[]');
    setImgs([...REPO_IMAGES, ...local.map((m: any) => m.name)]);
  }, []);

  const filtered = imgs.filter((i) => !q || i.includes(q));

  return (
    <>
      <div className="toolbar-row">
        <div className="search-box">
          <input className="input" placeholder="جست‌وجوی نام فایل…" value={q} onChange={(e) => setQ(e.target.value)} />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        </div>
        <span className="spacer" />
        <label className="btn btn-s" style={{ cursor: 'pointer' }}>
          ⬆️ افزودن تصویر محلی
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 300 * 1024) {
                toast('حجم تصویر باید کمتر از ۳۰۰ کیلوبایت باشد (محدودیت LocalStorage)', 'err');
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                const local = JSON.parse(localStorage.getItem('ps_media_local') || '[]');
                local.push({ name: 'local-' + Date.now(), data: reader.result });
                try {
                  localStorage.setItem('ps_media_local', JSON.stringify(local));
                  toast('تصویر محلی اضافه شد (با محدودیت ۳۰۰KB)');
                  setImgs(['local-' + (local[local.length - 1].name), ...imgs].map((x) => x));
                  setImgs((prev) => [...prev]);
                } catch {
                  toast('فضای LocalStorage پر است — تصویر ذخیره نشد', 'err');
                }
              };
              reader.readAsDataURL(f);
            }}
          />
        </label>
        <span className="pill pill--muted">{faNum(filtered.length)} فایل</span>
      </div>

      <div className="card card__pad">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
          {filtered.map((name) => {
            const local = JSON.parse(localStorage.getItem('ps_media_local') || '[]').find((m: any) => m.name === name);
            return (
              <button
                key={name}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: 8, textAlign: 'center', cursor: 'pointer' }}
                onClick={() => setOpen({ name, url: local?.data || `${IMG_BASE}/${name}.webp`, dim: local ? '—' : undefined })}
              >
                <img src={local?.data || `${IMG_BASE}/${name}.webp`} alt={name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 7 }} loading="lazy" />
                <p style={{ fontSize: 11, marginTop: 6, color: 'var(--text-soft)', direction: 'ltr' }}>{name}</p>
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--text-soft)', marginTop: 14 }}>
          ℹ️ تصاویر اصلی پروژه در Repository نگهداری می‌شوند (مسیر assets/img در سایت). در نسخه بدون بک‌اند، افزودن فایل محلی با سقف ۳۰۰KB و نگهداری در مرورگر انجام می‌شود.
        </p>
      </div>

      {open ? (
        <Modal title={`فایل: ${open.name}`} onClose={() => setOpen(null)}>
          <img src={open.url} alt={open.name} style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }} />
          <table className="tbl">
            <tbody>
              <tr><td>نام فایل</td><td dir="ltr">{open.name}</td></tr>
              <tr><td>فرمت</td><td>{open.url.startsWith('data:') ? 'تصویر محلی' : 'WebP'}</td></tr>
              <tr><td>مسیر اصلی</td><td dir="ltr" style={{ fontSize: 11.5 }}>{open.url.startsWith('data:') ? 'LocalStorage (browser)' : IMG_BASE}</td></tr>
            </tbody>
          </table>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-s" onClick={() => { navigator.clipboard?.writeText(open.url).then(() => toast('لینک کپی شد')); }}>کپی لینک</button>
            {open.url.startsWith('data:') ? (
              <button className="btn btn-d" onClick={() => {
                const local = JSON.parse(localStorage.getItem('ps_media_local') || '[]').filter((m: any) => m.name !== open.name);
                localStorage.setItem('ps_media_local', JSON.stringify(local));
                toast('تصویر محلی حذف شد');
                setImgs((prev) => prev.filter((x) => x !== open.name));
                setOpen(null);
              }}>حذف</button>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </>
  );
}
