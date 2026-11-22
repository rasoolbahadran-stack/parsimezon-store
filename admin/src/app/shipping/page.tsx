'use client';
/* ارسال — مدیریت روش‌های ارسال + کدهای رهگیری سفارش‌های ارسالی */
import { useEffect, useState } from 'react';
import { list, saveList, getSettings, money, faNum, type Rec } from '@/lib/store';
import { toast } from '@/lib/ui';
import { Field, TextField } from '@/lib/ui';

export default function ShippingPage() {
  const [methods, setMethods] = useState<Rec[]>([]);
  const [freeOver, setFreeOver] = useState(3000000);
  const [shipped, setShipped] = useState<Rec[]>([]);

  useEffect(() => {
    const s = getSettings();
    setMethods((s.shippingMethods || []).map((m: Rec) => ({ ...m })));
    setFreeOver(s.freeShippingThreshold || 3000000);
    setShipped(list('ps_orders').filter((o) => ['shipped', 'delivered'].includes(o.status)));
  }, []);

  function save() {
    const s = getSettings();
    s.shippingMethods = methods;
    s.freeShippingThreshold = freeOver;
    saveList('ps_settings', s);
    toast('تنظیمات ارسال ذخیره شد — در سایت هم اعمال می‌شود');
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card__head">
          <b className="card__t">🚚 روش‌های ارسال</b>
          <button className="btn btn-p btn-sm" onClick={save}>ذخیره تنظیمات</button>
        </div>
        <table className="tbl">
          <thead><tr><th>نام روش</th><th>هزینه (تومان)</th><th>زمان تحویل</th><th>فعال</th></tr></thead>
          <tbody>
            {methods.map((m, i) => (
              <tr key={m.id}>
                <td>
                  <TextField value={m.name} onChange={(e) => { const ms = [...methods]; ms[i] = { ...m, name: e.target.value }; setMethods(ms); }} />
                </td>
                <td>
                  <TextField type="number" value={m.cost} onChange={(e) => { const ms = [...methods]; ms[i] = { ...m, cost: Number(e.target.value) || 0 }; setMethods(ms); }} />
                </td>
                <td>
                  <TextField value={m.eta} onChange={(e) => { const ms = [...methods]; ms[i] = { ...m, eta: e.target.value }; setMethods(ms); }} />
                </td>
                <td>
                  <input type="checkbox" checked={!!m.active} onChange={(e) => { const ms = [...methods]; ms[i] = { ...m, active: e.target.checked }; setMethods(ms); }} style={{ accentColor: 'var(--primary)', width: 17, height: 17 }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="card__pad frow" style={{ alignItems: 'end' }}>
          <Field label="سقف ارسال رایگان (تومان)">
            <TextField type="number" value={freeOver} onChange={(e) => setFreeOver(Number(e.target.value) || 0)} />
          </Field>
          <p style={{ fontSize: 12, color: 'var(--text-soft)' }}>سفارش‌های بالای این مبلغ، ارسال رایگان می‌گیرند.</p>
        </div>
      </div>

      <div className="card">
        <div className="card__head"><b className="card__t">📦 سفارش‌های ارسال‌شده و کد رهگیری</b></div>
        <table className="tbl">
          <thead><tr><th>کد سفارش</th><th>مشتری</th><th>روش ارسال</th><th>کد رهگیری</th><th>شهر</th></tr></thead>
          <tbody>
            {shipped.map((o) => (
              <tr key={o.id}>
                <td dir="ltr"><b>{o.code}</b></td>
                <td>{o.customer?.name}</td>
                <td>{o.shippingMethod}</td>
                <td dir="ltr">{o.trackingCode || '—'}</td>
                <td>{o.customer?.city}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shipped.length ? <div className="empty"><div className="empty__icon">📦</div><p>سفارش ارسالی ثبت نشده است</p></div> : null}
      </div>
    </>
  );
}
