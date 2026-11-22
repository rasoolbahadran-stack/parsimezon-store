'use client';
/* بازگشت کالا — سفارش‌های لغو/بازگشتی + ثبت بازگشت از سفارش‌های تحویل‌شده */
import { useEffect, useState } from 'react';
import {  list, upsert, money, faDate, statusOf, type Rec } from '@/lib/store';
import { toast } from '@/lib/ui';

export default function ReturnsPage() {
  const [orders, setOrders] = useState<Rec[]>([]);

  const refresh = () => setOrders(list('ps_orders'));
  useEffect(refresh, []);

  const returned = orders.filter((o) => ['cancelled', 'refunded'].includes(o.status));
  const delivered = orders.filter((o) => ['delivered', 'completed'].includes(o.status));

  function markRefunded(o: Rec) {
    upsert('ps_orders', { ...o, status: 'refunded', paymentStatus: 'refunded', history: [...(o.history || []), { status: 'refunded', at: new Date().toISOString() }] });
    toast(`سفارش ${o.code} به «بازگشت داده شده» تغییر کرد`);
    refresh();
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card__head"><b className="card__t">↩️ سفارش‌های لغوشده / بازگشتی</b></div>
        <table className="tbl">
          <thead><tr><th>کد</th><th>مشتری</th><th>مبلغ</th><th>وضعیت</th><th>تاریخ</th><th>عملیات</th></tr></thead>
          <tbody>
            {returned.map((o) => (
              <tr key={o.id}>
                <td dir="ltr"><b>{o.code}</b></td>
                <td>{o.customer?.name}</td>
                <td>{money(o.total)}</td>
                <td><span className={`pill ${statusOf(o.status).cls}`}>{statusOf(o.status).name}</span></td>
                <td style={{ fontSize: 12, color: 'var(--text-soft)' }}>{faDate(o.createdAt)}</td>
                <td>
                  {o.status === 'cancelled' && o.paymentStatus === 'paid' ? (
                    <button className="btn btn-s btn-sm" onClick={() => markRefunded(o)}>ثبت عودت مبلغ</button>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!returned.length ? <div className="empty"><div className="empty__icon">✅</div><p>سفارش لغو/بازگشتی وجود ندارد</p></div> : null}
      </div>

      <div className="card">
        <div className="card__head"><b className="card__t">📦 سفارش‌های تحویل‌شده (قابل بازگشت طبق قوانین ۷ روزه)</b></div>
        <table className="tbl">
          <thead><tr><th>کد</th><th>مشتری</th><th>مبلغ</th><th>تاریخ</th><th>عملیات</th></tr></thead>
          <tbody>
            {delivered.map((o) => (
              <tr key={o.id}>
                <td dir="ltr"><b>{o.code}</b></td>
                <td>{o.customer?.name}</td>
                <td>{money(o.total)}</td>
                <td style={{ fontSize: 12, color: 'var(--text-soft)' }}>{faDate(o.createdAt)}</td>
                <td><button className="btn btn-s btn-sm" onClick={() => { const reason = window.prompt('دلیل بازگشت کالا (ثبت در تاریخچه سفارش):'); if (reason) { upsert('ps_orders', { ...o, status: 'refunded', history: [...(o.history || []), { status: 'refunded', at: new Date().toISOString() }] }); toast('بازگشت کالا ثبت شد'); refresh(); } }}>ثبت بازگشت</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!delivered.length ? <div className="empty"><div className="empty__icon">📦</div><p>سفارش تحویل‌شده‌ای نیست</p></div> : null}
      </div>
    </>
  );
}
