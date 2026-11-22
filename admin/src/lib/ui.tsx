'use client';
/* کیت UI مشترک پنل مدیریت — مودال، تُست، میدان فرم، جدول، نمودار SVG، تأیید حذف */
import { useEffect, useState, type ReactNode } from 'react';
import { faNum, money } from './store';

/* ---------- تُست ---------- */
type Toast = { id: number; text: string; kind?: 'ok' | 'err' | 'info' };
let pushToast: ((t: Omit<Toast, 'id'>) => void) | null = null;

export function toast(text: string, kind: Toast['kind'] = 'ok') {
  pushToast?.({ text, kind });
}

export function ToastHost() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    let n = 1;
    pushToast = (t) => {
      const id = n++;
      setItems((prev) => [...prev, { ...t, id }]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 3200);
    };
    return () => {
      pushToast = null;
    };
  }, []);
  return (
    <div className="toasts">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.kind === 'err' ? 'toast--err' : t.kind === 'info' ? 'toast--info' : ''}`}>
          <span>{t.kind === 'err' ? '⚠️' : t.kind === 'info' ? 'ℹ️' : '✅'}</span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- مودال ---------- */
export function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-label={title}>
        <div className="modal__head">
          <b>{title}</b>
          <button className="btn btn-s btn-icon" onClick={onClose} aria-label="بستن">✕</button>
        </div>
        <div className="modal__body">{children}</div>
        {footer ? <div className="modal__foot">{footer}</div> : null}
      </div>
    </div>
  );
}

/* ---------- تأیید حذف ---------- */
export function ConfirmDelete({ name, onCancel, onConfirm }: { name: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal
      title="تأیید حذف"
      onClose={onCancel}
      footer={
        <>
          <button className="btn btn-d" onClick={onConfirm}>بله، حذف کن</button>
          <button className="btn btn-s" onClick={onCancel}>انصراف</button>
        </>
      }
    >
      <p>آیا از حذف «<b>{name}</b>» مطمئن هستید؟ این عملیات در نسخه دمو قابل بازگشت نیست.</p>
    </Modal>
  );
}

/* ---------- میدان‌های فرم ---------- */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="fl">{label}</label>
      {children}
    </div>
  );
}
export function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="input" rows={4} {...props} />;
}
export function Select({ options, ...props }: { options: { value: string; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className="input" {...props}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

/* ---------- صفحه‌بندی ---------- */
export function usePaged<T>(rows: T[], per = 10) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / per));
  const cur = Math.min(page, pages);
  const slice = rows.slice((cur - 1) * per, cur * per);
  return { slice, page: cur, pages, setPage };
}
export function Pager({ page, pages, onPage, total }: { page: number; pages: number; onPage: (p: number) => void; total: number }) {
  if (pages <= 1) return <p style={{ fontSize: 12, color: 'var(--text-soft)', padding: '10px 14px' }}>{faNum(total)} مورد</p>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px' }}>
      <span style={{ fontSize: 12, color: 'var(--text-soft)', marginLeft: 'auto' }}>
        صفحه {faNum(page)} از {faNum(pages)} — {faNum(total)} مورد
      </span>
      <button className="btn btn-s btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>قبلی</button>
      <button className="btn btn-s btn-sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>بعدی</button>
    </div>
  );
}

/* ---------- نمودار خطی SVG ---------- */
export function LineChart({ data, color = '#ED1844', height = 210 }: { data: { day: string; v: number }[]; color?: string; height?: number }) {
  const w = 640, h = height, pad = 8;
  const max = Math.max(...data.map((d) => d.v), 1);
  const pts = data.map((d, i) => [(i / (data.length - 1)) * (w - pad * 2) + pad, h - pad - (d.v / max) * (h - pad * 2.2)]);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${path} L${pts[pts.length - 1][0]},${h - pad} L${pts[0][0]},${h - pad} Z`;
  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity=".25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={pad} x2={w - pad} y1={pad + f * (h - pad * 2)} y2={pad + f * (h - pad * 2)} stroke="var(--border)" strokeDasharray="4 6" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#lg)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="chart-legend">
        <span><i style={{ background: color }}></i>مبلغ فروش روزانه (تومان)</span>
        <span>حداکثر: {money(max)}</span>
      </div>
    </div>
  );
}

/* ---------- نمودار میله‌ای SVG ---------- */
export function BarChart({ items, colors }: { items: { label: string; v: number }[]; colors?: string[] }) {
  const max = Math.max(...items.map((i) => i.v), 1);
  const palette = colors || ['#ED1844', '#1673DE', '#1F9254', '#B45309', '#7C3AED', '#0891B2'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((it, i) => (
        <div key={it.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
            <span>{it.label}</span>
            <b style={{ color: 'var(--text-soft)' }}>{faNum(it.v)}</b>
          </div>
          <div style={{ background: 'var(--surface-2)', borderRadius: 99, height: 9, overflow: 'hidden' }}>
            <div style={{ width: `${(it.v / max) * 100}%`, height: '100%', borderRadius: 99, background: palette[i % palette.length], transition: 'width .5s ease' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- دونات SVG ---------- */
export function Donut({ items }: { items: { label: string; v: number; color: string }[] }) {
  const total = items.reduce((s, i) => s + i.v, 0) || 1;
  let acc = 0;
  const R = 42, C = 2 * Math.PI * R;
  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg viewBox="0 0 110 110" width="128" height="128" style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
        <circle cx="55" cy="55" r={R} fill="none" stroke="var(--border)" strokeWidth="13" />
        {items.map((it) => {
          const frac = it.v / total;
          const el = (
            <circle key={it.label} cx="55" cy="55" r={R} fill="none" stroke={it.color} strokeWidth="13"
              strokeDasharray={`${frac * C} ${C}`} strokeDashoffset={-acc * C} strokeLinecap="butt" />
          );
          acc += frac;
          return el;
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5 }}>
        {items.map((it) => (
          <span key={it.label}><i className="chart-legend" style={{ padding: 0 }}><i style={{ background: it.color }}></i>{it.label} — {faNum(it.v)}</i></span>
        ))}
      </div>
    </div>
  );
}
