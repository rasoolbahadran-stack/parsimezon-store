'use client';
/* گزارش‌ها — فروش، سفارش، محصولات، مشتریان، موجودی با فیلتر بازه */
import { useEffect, useState } from 'react';
import { list, salesSeries, money, faNum, statusOf } from '@/lib/store';
import { LineChart, BarChart } from '@/lib/ui';

export default function ReportsPage() {
  const [range, setRange] = useState(30);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const orders = list('ps_orders');
  const products = list('ps_products');
  const customers = list('ps_customers');
  const series = salesSeries(range);
  const revenue = series.reduce((s, x) => s + x.v, 0);
  const paid = orders.filter((o) => o.paymentStatus === 'paid');
  const avg = paid.length ? Math.round(revenue / Math.max(1, paid.length)) : 0;

  /* پرفروش‌ترین‌ها از روی اقلام سفارش‌ها */
  const sold: Record<string, { name: string; qty: number; sum: number }> = {};
  orders.forEach((o) => (o.items || []).forEach((it: any) => {
    if (!sold[it.productId]) sold[it.productId] = { name: it.name, qty: 0, sum: 0 };
    sold[it.productId].qty += it.qty;
    sold[it.productId].sum += it.qty * it.price;
  }));
  const top = Object.values(sold).sort((a, b) => b.qty - a.qty).slice(0, 6).map((x) => ({ label: x.name, v: x.qty }));

  const cityCount: Record<string, number> = {};
  orders.forEach((o) => { const c = o.customer?.city || '—'; cityCount[c] = (cityCount[c] || 0) + 1; });

  const lowStock = products.filter((p) => (p.stock || 0) <= 4);

  return (
    <>
      <div className="toolbar-row">
        <b>گزارش عملکرد فروشگاه</b>
        <select className="input" style={{ width: 'auto' }} value={range} onChange={(e) => setRange(Number(e.target.value))}>
          <option value={7}>۷ روز</option>
          <option value={30}>۳۰ روز</option>
          <option value={90}>۹۰ روز</option>
        </select>
        <span className="spacer" />
        <span className="pill pill--muted">داده‌های LocalStorage نسخه دمو</span>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="stat"><p className="stat__t">فروش بازه</p><p className="stat__v" style={{ fontSize: 16 }}>{money(revenue)}</p></div>
        <div className="stat"><p className="stat__t">سفارش‌ها</p><p className="stat__v">{faNum(orders.length)}</p></div>
        <div className="stat"><p className="stat__t">میانگین سفارش</p><p className="stat__v" style={{ fontSize: 16 }}>{money(avg)}</p></div>
        <div className="stat"><p className="stat__t">مشتریان</p><p className="stat__v">{faNum(customers.length)}</p></div>
        <div className="stat"><p className="stat__t">کم‌موجود</p><p className="stat__v">{faNum(lowStock.length)}</p></div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card__head"><b className="card__t">📈 روند فروش بازه انتخابی</b></div>
        <div className="card__pad">{ready ? <LineChart data={series} height={230} /> : null}</div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card__head"><b className="card__t">🏆 پرفروش‌ترین محصولات</b></div>
          <div className="card__pad">{top.length ? <BarChart items={top} /> : <p style={{ color: 'var(--text-soft)' }}>داده‌ای نیست</p>}</div>
        </div>
        <div className="card">
          <div className="card__head"><b className="card__t">🗺️ سفارش‌ها بر اساس شهر</b></div>
          <div className="card__pad">{Object.keys(cityCount).length ? <BarChart items={Object.entries(cityCount).map(([k, v]) => ({ label: k, v }))} colors={['#1673DE']} /> : <p style={{ color: 'var(--text-soft)' }}>داده‌ای نیست</p>}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card__head"><b className="card__t">📋 وضعیت سفارش‌ها</b></div>
        <table className="tbl">
          <thead><tr><th>وضعیت</th><th>تعداد</th><th>مجموع مبلغ</th></tr></thead>
          <tbody>
            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => {
              const rows = orders.filter((o) => o.status === s);
              return (
                <tr key={s}>
                  <td><span className={`pill ${statusOf(s).cls}`}>{statusOf(s).name}</span></td>
                  <td>{faNum(rows.length)}</td>
                  <td>{money(rows.reduce((x, o) => x + (o.total || 0), 0))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
