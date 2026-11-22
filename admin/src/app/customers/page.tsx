'use client';
/* مدیریت مشتریان — لیست + جزئیات (آمار سفارش، آدرس‌ها، یادداشت) */
import { useEffect, useMemo, useState } from 'react';
import { list, remove, money, faNum, faDate, type Rec } from '@/lib/store';
import { Modal, ConfirmDelete, toast, Field, TextField, TextArea } from '@/lib/ui';

export default function CustomersPage() {
  const [rows, setRows] = useState<Rec[]>([]);
  const [orders, setOrders] = useState<Rec[]>([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Rec | null>(null);
  const [deleting, setDeleting] = useState<Rec | null>(null);

  const refresh = () => {
    setRows(list('ps_customers'));
    setOrders(list('ps_orders'));
  };
  useEffect(refresh, []);

  const filtered = useMemo(() => rows.filter((c) => !q.trim() || [c.name, c.phone, c.email, c.city].some((x) => String(x || '').toLowerCase().includes(q.trim().toLowerCase()))), [rows, q]);

  function stats(cu: Rec) {
    const my = orders.filter((o) => o.customer?.phone === cu.phone);
    const sum = my.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + (o.total || 0), 0);
    return { count: my.length, sum };
  }

  return (
    <>
      <div className="toolbar-row">
        <div className="search-box">
          <input className="input" placeholder="جست‌وجو نام، موبایل، شهر…" value={q} onChange={(e) => setQ(e.target.value)} />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        </div>
        <span className="spacer" />
        <span className="pill pill--muted">{faNum(filtered.length)} مشتری</span>
      </div>

      <div className="card">
        <table className="tbl">
          <thead><tr><th>مشتری</th><th>موبایل</th><th>شهر</th><th>سفارش‌ها</th><th>مجموع خرید</th><th>عضویت</th><th style={{ width: 130 }}>عملیات</th></tr></thead>
          <tbody>
            {filtered.map((c) => {
              const s = stats(c);
              return (
                <tr key={c.id}>
                  <td><b>{c.name}</b><br /><span style={{ color: 'var(--text-soft)', fontSize: 11.5 }}>{c.note}</span></td>
                  <td dir="ltr">{c.phone}</td>
                  <td>{c.city}</td>
                  <td><span className="pill pill--info">{faNum(s.count)}</span></td>
                  <td>{money(s.sum)}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-soft)' }}>{c.createdAt}</td>
                  <td>
                    <button className="btn btn-s btn-sm" onClick={() => setOpen(c)}>مشاهده</button>{' '}
                    <button className="btn btn-d btn-sm" onClick={() => setDeleting(c)}>حذف</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {open ? <CustomerDetail cu={open} onClose={() => setOpen(null)} onNote={(note) => { const rows = list('ps_customers'); const i = rows.findIndex((x) => x.id === open.id); if (i > -1) { rows[i].note = note; localStorage.setItem('ps_customers', JSON.stringify(rows)); toast('یادداشت ذخیره شد'); refresh(); setOpen((o) => (o ? { ...o, note } : o)); } }} orders={orders.filter((o) => o.customer?.phone === open.phone)} /> : null}
      {deleting ? <ConfirmDelete name={deleting.name} onCancel={() => setDeleting(null)} onConfirm={() => { remove('ps_customers', deleting.id); setDeleting(null); toast('مشتری حذف شد'); refresh(); }} /> : null}
    </>
  );
}

function CustomerDetail({ cu, onClose, onNote, orders }: { cu: Rec; onClose: () => void; onNote: (n: string) => void; orders: Rec[] }) {
  return (
    <Modal title={`مشتری: ${cu.name}`} onClose={onClose}>
      <div className="frow">
        <Field label="موبایل"><TextField defaultValue={cu.phone} dir="ltr" readOnly /></Field>
        <Field label="ایمیل"><TextField defaultValue={cu.email} dir="ltr" readOnly /></Field>
      </div>
      <div>
        <label className="fl">آدرس‌ها</label>
        {(cu.addresses || []).length ? cu.addresses.map((a: Rec, i: number) => (
          <div key={i} style={{ border: '1px dashed var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12.5, marginBottom: 6 }}>
            <b>{a.title}</b> — {a.address} (کد پستی {a.postal})
          </div>
        )) : <p style={{ color: 'var(--text-soft)', fontSize: 12.5 }}>آدرسی ثبت نشده است.</p>}
      </div>
      <div>
        <label className="fl">سفارش‌های مشتری</label>
        {orders.length ? (
          <table className="tbl">
            <thead><tr><th>کد</th><th>مبلغ</th><th>وضعیت</th><th>تاریخ</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td dir="ltr"><b>{o.code}</b></td>
                  <td>{money(o.total)}</td>
                  <td>{o.status}</td>
                  <td style={{ fontSize: 12 }}>{faDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: 'var(--text-soft)', fontSize: 12.5 }}>سفارشی ثبت نشده است.</p>}
      </div>
      <Field label="یادداشت داخلی">
        <TextArea defaultValue={cu.note || ''} rows={2} onBlur={(e) => onNote(e.target.value)} />
      </Field>
    </Modal>
  );
}
