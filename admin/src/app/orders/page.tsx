'use client';
/* مدیریت سفارش‌ها — جدول، فیلتر، جزئیات، تغییر وضعیت با تاریخچه، کد رهگیری */
import { useEffect, useMemo, useState } from 'react';
import { list, upsert, saveList, money, faNum, faDate, statusOf, ORDER_STATUSES, type Rec } from '@/lib/store';
import { Modal, toast, Field, Select, TextField, TextArea, Pager } from '@/lib/ui';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Rec[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState<Rec | null>(null);
  const [paging, setPaging] = useState({ page: 1, pages: 1 });

  const refresh = () => setOrders(list('ps_orders'));
  useEffect(refresh, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (status && o.status !== status) return false;
      if (!s) return true;
      return [o.code, o.customer?.name, o.customer?.phone].some((x) => String(x || '').toLowerCase().includes(s));
    });
  }, [orders, q, status]);

  useEffect(() => {
    const per = 10;
    const pgs = Math.max(1, Math.ceil(filtered.length / per));
    const cur = Math.min(paging.page, pgs);
    setPaging({ page: cur, pages: pgs });
  }, [filtered, paging.page]);

  const slice = filtered.slice((paging.page - 1) * 10, paging.page * 10);

  function changeStatus(order: Rec, newStatus: string) {
    const history = [...(order.history || []), { status: newStatus, at: new Date().toISOString() }];
    upsert('ps_orders', { ...order, status: newStatus, history });
    toast(`وضعیت سفارش به «${statusOf(newStatus).name}» تغییر کرد`);
    refresh();
    setOpen((o) => (o ? { ...order, status: newStatus, history } : null));
  }

  function saveTracking(order: Rec, code: string) {
    upsert('ps_orders', { ...order, trackingCode: code });
    toast('کد رهگیری ذخیره شد');
    refresh();
    setOpen((o) => (o ? { ...order, trackingCode: code } : null));
  }

  function cancelOrder(order: Rec) {
    changeStatus(order, 'cancelled');
  }

  return (
    <>
      <div className="toolbar-row">
        <div className="search-box">
          <input className="input" placeholder="جست‌وجوی کد سفارش، نام یا موبایل…" value={q} onChange={(e) => { setQ(e.target.value); setPaging((p) => ({ ...p, page: 1 })); }} />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        </div>
        <select className="input" style={{ width: 'auto' }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">همه وضعیت‌ها</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <span className="spacer" />
        <span className="pill pill--muted">{faNum(filtered.length)} سفارش</span>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr><th>کد سفارش</th><th>مشتری</th><th>اقلام</th><th>مبلغ</th><th>پرداخت</th><th>وضعیت</th><th>تاریخ</th><th style={{ width: 110 }}>عملیات</th></tr>
          </thead>
          <tbody>
            {slice.map((o) => {
              const st = statusOf(o.status);
              return (
                <tr key={o.id}>
                  <td><b dir="ltr">{o.code}</b></td>
                  <td>{o.customer?.name}<br /><span style={{ color: 'var(--text-soft)', fontSize: 11.5 }} dir="ltr">{o.customer?.phone}</span></td>
                  <td>{faNum(o.items?.length || 0)} قلم</td>
                  <td><b>{money(o.total)}</b></td>
                  <td><span className={`pill ${o.paymentStatus === 'paid' ? 'pill--success' : 'pill--warn'}`}>{o.paymentStatus === 'paid' ? 'پرداخت شده' : 'در انتظار'}</span></td>
                  <td><span className={`pill ${st.cls}`}>{st.name}</span></td>
                  <td style={{ color: 'var(--text-soft)', fontSize: 12 }}>{faDate(o.createdAt)}</td>
                  <td><button className="btn btn-s btn-sm" onClick={() => setOpen(o)}>جزئیات</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pager page={paging.page} pages={paging.pages} onPage={(p) => setPaging({ ...paging, page: p })} total={filtered.length} />
      </div>

      {open ? <OrderDetail order={open} onClose={() => setOpen(null)} onStatus={changeStatus} onTrack={saveTracking} onCancel={cancelOrder} /> : null}
    </>
  );
}

function OrderDetail({ order, onClose, onStatus, onTrack, onCancel }: { order: Rec; onClose: () => void; onStatus: (o: Rec, s: string) => void; onTrack: (o: Rec, c: string) => void; onCancel: (o: Rec) => void }) {
  const st = statusOf(order.status);
  const [track, setTrack] = useState(order.trackingCode || '');
  const labels: Record<string, string> = { pending: 'ثبت سفارش', processing: 'در حال پردازش', shipped: 'ارسال شده', delivered: 'تحویل داده شد', completed: 'تکمیل شد', cancelled: 'لغو شد', refunded: 'بازگشت داده شد', failed: 'پرداخت ناموفق' };
  return (
    <Modal title={`سفارش ${order.code}`} onClose={onClose}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span className={`pill ${st.cls}`}>{st.name}</span>
        <span className={`pill ${order.paymentStatus === 'paid' ? 'pill--success' : 'pill--warn'}`}>{order.paymentStatus === 'paid' ? 'پرداخت شده' : 'در انتظار پرداخت'}</span>
        <span className="pill pill--muted">{order.shippingMethod}</span>
        <span className="pill pill--muted">{order.paymentMethod === 'cod' ? 'پرداخت در محل' : 'درگاه آزمایشی'}</span>
      </div>

      <div className="frow">
        <Field label="تغییر وضعیت سفارش">
          <Select
            options={ORDER_STATUSES.map((s) => ({ value: s.id, label: s.name }))}
            value={order.status}
            onChange={(e) => onStatus(order, e.target.value)}
          />
        </Field>
        <Field label="کد رهگیری">
          <div style={{ display: 'flex', gap: 8 }}>
            <TextField value={track} onChange={(e) => setTrack(e.target.value)} placeholder="TRK-…" dir="ltr" />
            <button className="btn btn-p" onClick={() => onTrack(order, track)}>ثبت</button>
          </div>
        </Field>
      </div>

      <div>
        <label className="fl">تاریخچه وضعیت</label>
        <div className="timeline" style={{ margin: 0, padding: '0 26px' }}>
          {(order.history || []).map((h: any, i: number) => (
            <div key={i} className="timeline__item is-done">
              {labels[h.status] || h.status} — <span style={{ color: 'var(--text-soft)', fontSize: 12 }}>{faDate(h.at)}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="fl">اقلام سفارش</label>
        <table className="tbl">
          <thead><tr><th>محصول</th><th>تنوع</th><th>تعداد</th><th>قیمت</th><th>جمع</th></tr></thead>
          <tbody>
            {(order.items || []).map((it: any, i: number) => (
              <tr key={i}>
                <td>{it.name}</td>
                <td>{it.variant || '—'}</td>
                <td>{faNum(it.qty)}</td>
                <td>{money(it.price)}</td>
                <td><b>{money(it.price * it.qty)}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="sum-row" style={{ display: 'flex', justifyContent: 'space-between' }}><span>جمع کالاها</span><b>{money(order.subtotal)}</b></div>
        {order.discount ? <div className="sum-row" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}><span>تخفیف {order.coupon ? `(${order.coupon})` : ''}</span><b>−{money(order.discount)}</b></div> : null}
        <div className="sum-row" style={{ display: 'flex', justifyContent: 'space-between' }}><span>ارسال</span><b>{money(order.shipping)}</b></div>
        <div className="sum-row" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px dashed var(--border)', paddingTop: 10, fontSize: 15 }}><span>قابل پرداخت</span><b style={{ color: 'var(--primary)' }}>{money(order.total)}</b></div>
      </div>

      <div className="frow">
        <Field label="اطلاعات گیرنده">
          <p style={{ fontSize: 13, lineHeight: 2.2 }}>
            {order.customer?.name} — <span dir="ltr">{order.customer?.phone}</span><br />
            {order.customer?.province}، {order.customer?.city}، {order.customer?.address}<br />
            کد پستی: {order.customer?.postal}
          </p>
        </Field>
        <Field label="یادداشت سفارش">
          <TextArea defaultValue={order.customer?.note || ''} placeholder="یادداشت داخلی…" />
        </Field>
      </div>

      {order.status !== 'cancelled' && order.status !== 'delivered' ? (
        <button className="btn btn-d" onClick={() => onCancel(order)}>لغو این سفارش</button>
      ) : null}
    </Modal>
  );
}
