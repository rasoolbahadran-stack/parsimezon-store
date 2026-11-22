'use client';
/* موجودی انبار — تنظیم سریع موجودی، افزایش/کاهش با ثبت تاریخچه */
import { useEffect, useState } from 'react';
import { list, saveList, faNum, money } from '@/lib/store';
import { toast } from '@/lib/ui';

type Hist = { at: string; sku: string; delta: number; note: string };

export default function InventoryPage() {
  const [rows, setRows] = useState<Rec2[]>([]);
  const [hist, setHist] = useState<Hist[]>([]);
  const [q, setQ] = useState('');

  type Rec2 = { id: string; name: string; sku: string; stock: number; price: number };

  const refresh = () => {
    setRows(list('ps_products').map((p) => ({ id: p.id, name: p.name, sku: p.sku, stock: p.stock || 0, price: p.price })));
    setHist(JSON.parse(localStorage.getItem('ps_stock_log') || '[]'));
  };
  useEffect(refresh, []);

  const filtered = rows.filter((r) => !q.trim() || (r.name + r.sku).toLowerCase().includes(q.trim().toLowerCase()));
  const low = rows.filter((r) => r.stock <= 4);

  function adjust(id: string, delta: number) {
    const products = list('ps_products');
    const p = products.find((x) => x.id === id);
    if (!p) return;
    p.stock = Math.max(0, (p.stock || 0) + delta);
    saveList('ps_products', products);
    const log: Hist[] = [{ at: new Date().toISOString(), sku: p.sku, delta, note: delta > 0 ? 'ورود کالا' : 'اصلاح موجودی' }, ...JSON.parse(localStorage.getItem('ps_stock_log') || '[]')].slice(0, 30);
    localStorage.setItem('ps_stock_log', JSON.stringify(log));
    toast(`موجودی «${p.name}» به ${faNum(p.stock)} رسید`);
    refresh();
  }

  return (
    <>
      <div className="toolbar-row">
        <div className="search-box">
          <input className="input" placeholder="جست‌وجوی محصول…" value={q} onChange={(e) => setQ(e.target.value)} />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        </div>
        <span className="spacer" />
        <span className="pill pill--warn">{faNum(low.length)} محصول کم‌موجود</span>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card__head"><b className="card__t">📦 موجودی محصولات</b></div>
          <table className="tbl">
            <thead><tr><th>محصول</th><th>SKU</th><th>موجودی</th><th>قیمت</th><th style={{ width: 150 }}>تنظیم</th></tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td dir="ltr">{r.sku}</td>
                  <td><span className={`pill ${r.stock === 0 ? 'pill--danger' : r.stock <= 4 ? 'pill--warn' : 'pill--success'}`}>{faNum(r.stock)}</span></td>
                  <td>{money(r.price)}</td>
                  <td>
                    <button className="btn btn-s btn-sm" onClick={() => adjust(r.id, 1)}>＋۱</button>{' '}
                    <button className="btn btn-s btn-sm" onClick={() => adjust(r.id, 10)}>＋۱۰</button>{' '}
                    <button className="btn btn-d btn-sm" onClick={() => adjust(r.id, -1)}>−۱</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card__head"><b className="card__t">🕘 تاریخچه تغییرات موجودی</b></div>
          <div className="card__pad">
            {hist.length ? hist.slice(0, 12).map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--border)', fontSize: 12.5 }}>
                <span dir="ltr">{h.sku}</span>
                <span>{h.note}</span>
                <span style={{ color: h.delta > 0 ? 'var(--success)' : 'var(--danger)' }}>{h.delta > 0 ? '+' : ''}{faNum(h.delta)}</span>
              </div>
            )) : <p style={{ color: 'var(--text-soft)' }}>هنوز تغییری ثبت نشده است.</p>}
            <p style={{ fontSize: 11.5, color: 'var(--text-soft)', marginTop: 10 }}>
              هر سفارش ثبت‌شده در فروشگاه، موجودی تنوع‌ها و کل محصول را فقط «یک‌بار» کاهش می‌دهد تا از کاهش چندباره جلوگیری شود.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
