'use client';
/* پرداخت‌ها — نمای تراکنش‌های دمو با فیلتر وضعیت پرداخت */
import { useEffect, useMemo, useState } from 'react';
import {  list, money, faNum, faDate, type Rec } from '@/lib/store';

export default function PaymentsPage() {
  const [orders, setOrders] = useState<Rec[]>([]);
  const [filter, setFilter] = useState('');
  useEffect(() => setOrders(list('ps_orders')), []);

  const filtered = useMemo(() => orders.filter((o) => !filter || o.paymentStatus === filter), [orders, filter]);
  const paidSum = orders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + (o.total || 0), 0);
  const pendingSum = orders.filter((o) => o.paymentStatus === 'pending').reduce((s, o) => s + (o.total || 0), 0);

  return (
    <>
      <div className="stat-grid">
        <div className="stat"><p className="stat__t">دریافتی موفق (دمو)</p><p className="stat__v" style={{ color: 'var(--success)' }}>{money(paidSum)}</p></div>
        <div className="stat"><p className="stat__t">در انتظار پرداخت</p><p className="stat__v" style={{ color: 'var(--warn)' }}>{money(pendingSum)}</p></div>
        <div className="stat"><p className="stat__t">تراکنش‌های موفق</p><p className="stat__v">{faNum(orders.filter((o) => o.paymentStatus === 'paid').length)}</p></div>
        <div className="stat"><p className="stat__t">درگاه فعال</p><p className="stat__v" style={{ fontSize: 15 }}>پرداخت آزمایشی</p></div>
      </div>

      <div className="toolbar-row">
        <select className="input" style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">همه تراکنش‌ها</option>
          <option value="paid">پرداخت موفق</option>
          <option value="pending">در انتظار</option>
          <option value="failed">ناموفق</option>
        </select>
        <span className="spacer" />
        <span className="pill pill--muted">💳 پرداخت واقعی غیرفعال است (دمو)</span>
      </div>

      <div className="card">
        <table className="tbl">
          <thead><tr><th>کد سفارش</th><th>مشتری</th><th>روش</th><th>مبلغ</th><th>وضعیت</th><th>تاریخ</th></tr></thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td dir="ltr"><b>{o.code}</b></td>
                <td>{o.customer?.name}</td>
                <td>{o.paymentMethod === 'cod' ? 'در محل (دمو)' : 'درگاه آزمایشی'}</td>
                <td><b>{money(o.total)}</b></td>
                <td><span className={`pill ${o.paymentStatus === 'paid' ? 'pill--success' : 'pill--warn'}`}>{o.paymentStatus === 'paid' ? 'موفق' : 'در انتظار'}</span></td>
                <td style={{ fontSize: 12, color: 'var(--text-soft)' }}>{faDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length ? <div className="empty"><div className="empty__icon">💳</div><p>تراکنشی در این وضعیت نیست</p></div> : null}
      </div>
    </>
  );
}
