'use client';
/* ویژگی‌ها و تنوع‌ها — نمای تجمیعی ویژگی‌های تعریف‌شده روی محصولات + ساخت تنوع */
import { useEffect, useState } from 'react';
import { list, upsert, faNum, money, type Rec } from '@/lib/store';
import { toast, Modal } from '@/lib/ui';

export default function AttributesPage() {
  const [products, setProducts] = useState<Rec[]>([]);
  const [open, setOpen] = useState<Rec | null>(null);

  useEffect(() => setProducts(list('ps_products')), []);

  /* استخراج همه ویژگی‌ها و مقادیر */
  const attrs: Record<string, Set<string>> = {};
  products.forEach((p) => {
    Object.entries(p.specs || {}).forEach(([k, v]) => {
      if (!attrs[k]) attrs[k] = new Set();
      attrs[k].add(String(v));
    });
    (p.colors || []).forEach((c: string) => {
      if (!attrs['رنگ']) attrs['رنگ'] = new Set();
      attrs['رنگ'].add(c);
    });
    (p.sizes || []).forEach((s: string) => {
      if (!attrs['سایز']) attrs['سایز'] = new Set();
      attrs['سایز'].add(s);
    });
  });

  return (
    <>
      <p className="card card__pad" style={{ fontSize: 12.5, color: 'var(--text-soft)', marginBottom: 14 }}>
        ویژگی‌ها به‌صورت خودکار از مشخصات محصولات استخراج می‌شوند (جنس، قد، آستین و…) + رنگ و سایز برای ساخت تنوع‌ها استفاده می‌شوند.
      </p>

      <div className="grid-2">
        <div className="card">
          <div className="card__head"><b className="card__t">🎨 ویژگی‌های تعریف‌شده</b></div>
          <div className="card__pad">
            {Object.entries(attrs).map(([k, vals]) => (
              <div key={k} style={{ marginBottom: 12 }}>
                <b style={{ fontSize: 13 }}>{k}</b>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {[...vals].map((v) => (
                    <span key={v} className="pill pill--muted">{v}</span>
                  ))}
                </div>
              </div>
            ))}
            {!Object.keys(attrs).length ? <div className="empty"><div className="empty__icon">🎨</div><p>ویژگی‌ای یافت نشد</p></div> : null}
          </div>
        </div>

        <div className="card">
          <div className="card__head"><b className="card__t">🧩 تنوع‌های محصولات</b></div>
          <table className="tbl">
            <thead><tr><th>محصول</th><th>تعداد تنوع</th><th>عملیات</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td><span className="pill pill--info">{faNum(p.variants?.length || 0)}</span></td>
                  <td><button className="btn btn-s btn-sm" onClick={() => setOpen(p)}>مشاهده</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open ? (
        <Modal title={`تنوع‌های ${open.name}`} onClose={() => setOpen(null)}>
          <table className="tbl">
            <thead><tr><th>رنگ</th><th>سایز</th><th>SKU</th><th>موجودی</th><th>قیمت</th><th>ویرایش سریع</th></tr></thead>
            <tbody>
              {(open.variants || []).map((v: Rec, i: number) => (
                <tr key={i}>
                  <td>{v.color}</td><td>{v.size}</td><td dir="ltr">{v.sku}</td>
                  <td>{faNum(v.stock)}</td><td>{money(v.price)}</td>
                  <td><input className="input" style={{ width: 90 }} type="number" defaultValue={v.stock}
                    onChange={(e) => {
                      const products = list('ps_products');
                      const p = products.find((x) => x.id === open.id);
                      if (p?.variants?.[i]) {
                        p.variants[i].stock = Number(e.target.value) || 0;
                        localStorage.setItem('ps_products', JSON.stringify(products));
                        upsert('ps_products', p);
                        toast('موجودی تنوع به‌روزرسانی شد');
                      }
                    }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      ) : null}
    </>
  );
}
