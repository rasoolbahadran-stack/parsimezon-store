'use client';
import { useEffect, useState } from 'react';
import { dashboardStats, salesSeries, list, money, faNum, faDate, statusOf } from '@/lib/store';
import { LineChart, BarChart, Donut } from '@/lib/ui';
import Logo from '@/components/Logo';

export default function Dashboard() {
  const [data, setData] = useState<ReturnType<typeof dashboardStats> | null>(null);
  const [range, setRange] = useState(30);

  useEffect(() => {
    setData(dashboardStats());
  }, []);

  if (!data) {
    return (
      <div>
        <div className="stat-grid">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skel" style={{ height: 92 }} />)}</div>
        <div className="grid-2">
          <div className="skel" style={{ height: 260 }} />
          <div className="skel" style={{ height: 260 }} />
        </div>
      </div>
    );
  }

  const series = salesSeries(range);
  const orders = list('ps_orders');
  const statusColors: Record<string, string> = { pending: '#B45309', processing: '#1673DE', shipped: '#7C3AED', delivered: '#1F9254', cancelled: '#DC2626' };
  const statusItems = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => ({
    label: statusOf(s).name,
    v: orders.filter((o) => o.status === s).length,
    color: statusColors[s],
  })).filter((x) => x.v > 0);

  const catCount: Record<string, number> = {};
  list('ps_products').forEach((p) => (catCount[p.category] = (catCount[p.category] || 0) + 1));
  const catNames: Record<string, string> = {};
  list('ps_categories').forEach((c) => (catNames[c.id] = c.name));
  const catItems = Object.entries(catCount).map(([k, v]) => ({ label: catNames[k] || k, v }));

  return (
    <>
      <div className="stat-grid">
        <div className="stat">
          <span className="stat__icon stat__icon--red">💰</span>
          <p className="stat__t">درآمد پرداخت‌شده</p>
          <p className="stat__v">{money(data.revenue)}</p>
          <p className="stat__d" style={{ color: 'var(--success)' }}>▲ جمع سفارش‌های پرداخت‌شده</p>
        </div>
        <div className="stat">
          <span className="stat__icon stat__icon--blue">🛒</span>
          <p className="stat__t">کل سفارش‌ها</p>
          <p className="stat__v">{faNum(data.orders)}</p>
          <p className="stat__d">{faNum(data.newOrders)} سفارش جدید در انتظار</p>
        </div>
        <div className="stat">
          <span className="stat__icon stat__icon--amber">👗</span>
          <p className="stat__t">محصولات</p>
          <p className="stat__v">{faNum(data.products)}</p>
          <p className="stat__d">{faNum(data.lowStock.length)} محصول کم‌موجود</p>
        </div>
        <div className="stat">
          <span className="stat__icon stat__icon--green">👥</span>
          <p className="stat__t">مشتریان</p>
          <p className="stat__v">{faNum(data.customers)}</p>
          <p className="stat__d">ثبت‌نام‌شده در فروشگاه دمو</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card__head">
            <b className="card__t">📈 روند فروش</b>
            <select className="input" style={{ width: 'auto' }} value={range} onChange={(e) => setRange(Number(e.target.value))}>
              <option value={7}>۷ روز اخیر</option>
              <option value={30}>۳۰ روز اخیر</option>
              <option value={90}>۹۰ روز اخیر</option>
            </select>
          </div>
          <div className="card__pad">
            <LineChart data={series} />
          </div>
        </div>
        <div className="card">
          <div className="card__head"><b className="card__t">🧭 وضعیت سفارش‌ها</b></div>
          <div className="card__pad">
            {statusItems.length ? <Donut items={statusItems} /> : <div className="empty"><div className="empty__icon">🗂️</div><p>سفارشی ثبت نشده است</p></div>}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card__head">
            <b className="card__t">🧾 آخرین سفارش‌ها</b>
            <a className="btn btn-s btn-sm" href="/parsimezon-store/admin/orders/">همه سفارش‌ها ←</a>
          </div>
          <table className="tbl">
            <thead><tr><th>کد</th><th>مشتری</th><th>مبلغ</th><th>وضعیت</th><th>تاریخ</th></tr></thead>
            <tbody>
              {data.recent.map((o) => {
                const st = statusOf(o.status);
                return (
                  <tr key={o.id}>
                    <td><b dir="ltr">{o.code}</b></td>
                    <td>{o.customer?.name}</td>
                    <td>{money(o.total)}</td>
                    <td><span className={`pill ${st.cls}`}>{st.name}</span></td>
                    <td style={{ color: 'var(--text-soft)', fontSize: 12 }}>{faDate(o.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="card__head"><b className="card__t">📦 محصولات کم‌موجود</b></div>
            <div className="card__pad">
              {data.lowStock.length ? (
                data.lowStock.map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px dashed var(--border)' }}>
                    <span>{p.name}</span>
                    <span className="pill pill--warn">{faNum(p.stock)} عدد</span>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-soft)' }}>همه محصولات موجودی کافی دارند ✓</p>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card__head"><b className="card__t">🗂️ محصولات هر دسته</b></div>
            <div className="card__pad"><BarChart items={catItems} /></div>
          </div>
        </div>
      </div>

      <p className="card__pad card" style={{ marginTop: 14, fontSize: 12, color: 'var(--text-soft)' }}>
        ℹ️ نسخه دمو: داده‌ها در حافظه مرورگر (LocalStorage) نگهداری می‌شوند؛ سفارش‌هایی که در سایت خرید می‌شوند، همین‌جا در «سفارش‌ها» دیده می‌شوند. هیچ داده‌ای به سرور ارسال نمی‌شود و این پنل امنیت واقعی ندارد.
      </p>
    </>
  );
}
