'use client';
/* مدیریت محصولات — لیست کامل با فیلتر وضعیت + فرم جامع (تصاویر، تنوع، SEO، مشخصات) */
import { useEffect, useMemo, useState } from 'react';
import { list, remove, nextId, faNum, money, type Rec, REPO_IMAGES } from '@/lib/store';
import { Modal, ConfirmDelete, toast, Field, TextField, TextArea, Select } from '@/lib/ui';
import { ImageField } from '@/components/ResourcePage';

export default function ProductsPage() {
  const [rows, setRows] = useState<Rec[]>([]);
  const [q, setQ] = useState('');
  const [st, setSt] = useState('');
  const [editing, setEditing] = useState<Rec | null>(null);
  const [deleting, setDeleting] = useState<Rec | null>(null);
  const [pg, setPg] = useState(1);

  const refresh = () => setRows(list('ps_products'));
  useEffect(refresh, []);

  const cats = list('ps_categories');
  const brands = list('ps_brands');
  const catName: Record<string, string> = {};
  cats.forEach((c) => (catName[c.id] = c.name));
  const brandName: Record<string, string> = {};
  brands.forEach((b) => (brandName[b.id] = b.name));

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((p) => {
      if (st && p.status !== st) return false;
      if (!s) return true;
      return [p.name, p.sku, p.tags?.join(' ')].some((x) => String(x || '').toLowerCase().includes(s));
    });
  }, [rows, q, st]);

  const per = 10;
  const pages = Math.max(1, Math.ceil(filtered.length / per));
  const cur = Math.min(pg, pages);
  const slice = filtered.slice((cur - 1) * per, cur * per);

  return (
    <>
      <div className="toolbar-row">
        <div className="search-box">
          <input className="input" placeholder="جست‌وجو نام، SKU یا برچسب…" value={q} onChange={(e) => { setQ(e.target.value); setPg(1); }} />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        </div>
        <select className="input" style={{ width: 'auto' }} value={st} onChange={(e) => setSt(e.target.value)}>
          <option value="">همه وضعیت‌ها</option>
          <option value="published">منتشرشده</option>
          <option value="draft">پیش‌نویس</option>
        </select>
        <span className="spacer" />
        <button className="btn btn-p" onClick={() => setEditing({ __new: true })}>＋ افزودن محصول</button>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr><th style={{ width: 60 }}>تصویر</th><th>محصول</th><th>دسته</th><th>برند</th><th>قیمت</th><th>موجودی</th><th>وضعیت</th><th>ویژه</th><th style={{ width: 130 }}>عملیات</th></tr>
          </thead>
          <tbody>
            {slice.map((p) => (
              <tr key={p.id}>
                <td><img src={`/parsimezon-store/assets/img/${p.images?.[0] || 'p1'}.webp`} alt={p.name} /></td>
                <td><b>{p.name}</b><br /><span style={{ color: 'var(--text-soft)', fontSize: 11.5 }} dir="ltr">{p.sku}</span></td>
                <td>{catName[p.category] || '—'}</td>
                <td>{brandName[p.brand] || '—'}</td>
                <td>{money(p.price)}{p.oldPrice ? <><br /><del style={{ color: 'var(--text-soft)', fontSize: 11 }}>{money(p.oldPrice)}</del></> : null}</td>
                <td><span className={`pill ${(p.stock || 0) <= 4 ? 'pill--warn' : 'pill--success'}`}>{faNum(p.stock)}</span></td>
                <td><span className={`pill ${p.status === 'published' ? 'pill--success' : 'pill--muted'}`}>{p.status === 'published' ? 'منتشرشده' : 'پیش‌نویس'}</span></td>
                <td>{p.featured ? '⭐' : '—'}</td>
                <td>
                  <button className="btn btn-s btn-sm" onClick={() => setEditing(p)}>ویرایش</button>{' '}
                  <button className="btn btn-d btn-sm" onClick={() => setDeleting(p)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px' }}>
          <span style={{ fontSize: 12, color: 'var(--text-soft)', marginLeft: 'auto' }}>صفحه {faNum(cur)} از {faNum(pages)} — {faNum(filtered.length)} محصول</span>
          <button className="btn btn-s btn-sm" disabled={cur <= 1} onClick={() => setPg(cur - 1)}>قبلی</button>
          <button className="btn btn-s btn-sm" disabled={cur >= pages} onClick={() => setPg(cur + 1)}>بعدی</button>
        </div>
      </div>

      {editing ? <ProductForm initial={editing} cats={cats} brands={brands} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} /> : null}
      {deleting ? (
        <ConfirmDelete name={deleting.name} onCancel={() => setDeleting(null)} onConfirm={() => { remove('ps_products', deleting.id); setDeleting(null); toast('محصول حذف شد'); refresh(); }} />
      ) : null}
    </>
  );
}

function ProductForm({ initial, cats, brands, onClose, onSaved }: { initial: Rec; cats: Rec[]; brands: Rec[]; onClose: () => void; onSaved: () => void }) {
  const isNew = !!initial.__new;
  const [p, setP] = useState<Rec>(
    isNew
      ? { id: nextId('ps_products', 'p'), name: '', slug: '', sku: 'PS-NEW', price: 0, oldPrice: null, stock: 10, status: 'published', featured: false, bestseller: false, isNew: true, images: ['p1'], shortDesc: '', desc: '', specs: {}, colors: [], sizes: [], variants: [], tags: [], rating: 4.5, reviewsCount: 0, weight: 400, dims: '', createdAt: new Date().toISOString().slice(0, 10), seo: { metaTitle: '', metaDescription: '' }, category: cats[0]?.id, brand: brands[0]?.id }
      : JSON.parse(JSON.stringify(initial))
  );
  const set = (k: string, v: any) => setP((prev) => ({ ...prev, [k]: v }));

  return (
    <Modal
      title={isNew ? 'افزودن محصول جدید' : `ویرایش: ${initial.name}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-p" onClick={() => {
            if (!p.name.trim()) { toast('نام محصول الزامی است', 'err'); return; }
            if (!p.slug.trim()) p.slug = p.name.replace(/\s+/g, '-').toLowerCase();
            const rows = list('ps_products');
            const idx = rows.findIndex((r) => r.id === p.id);
            if (idx > -1) rows[idx] = p; else rows.unshift(p);
            localStorage.setItem('ps_products', JSON.stringify(rows));
            toast('محصول ذخیره شد');
            onSaved();
          }}>ذخیره محصول</button>
          <button className="btn btn-s" onClick={onClose}>انصراف</button>
        </>
      }
    >
      <div className="frow">
        <Field label="نام محصول *"><TextField value={p.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="اسلاگ (URL)"><TextField value={p.slug} onChange={(e) => set('slug', e.target.value)} dir="ltr" placeholder="product-slug" /></Field>
        <Field label="دسته‌بندی"><Select options={cats.map((c) => ({ value: c.id, label: c.name }))} value={p.category} onChange={(e) => set('category', e.target.value)} /></Field>
        <Field label="برند"><Select options={brands.map((b) => ({ value: b.id, label: b.name }))} value={p.brand} onChange={(e) => set('brand', e.target.value)} /></Field>
        <Field label="قیمت (تومان) *"><TextField type="number" value={p.price} onChange={(e) => set('price', Number(e.target.value) || 0)} /></Field>
        <Field label="قیمت قبل از تخفیف (اختیاری)"><TextField type="number" value={p.oldPrice ?? ''} onChange={(e) => set('oldPrice', e.target.value ? Number(e.target.value) : null)} /></Field>
        <Field label="SKU"><TextField value={p.sku} onChange={(e) => set('sku', e.target.value)} dir="ltr" /></Field>
        <Field label="موجودی انبار"><TextField type="number" value={p.stock} onChange={(e) => set('stock', Number(e.target.value) || 0)} /></Field>
        <Field label="وضعیت نمایش"><Select options={[{ value: 'published', label: 'منتشرشده' }, { value: 'draft', label: 'پیش‌نویس' }]} value={p.status} onChange={(e) => set('status', e.target.value)} /></Field>
        <Field label="محصول ویژه">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0' }}>
            <input type="checkbox" checked={!!p.featured} onChange={(e) => set('featured', e.target.checked)} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
            <span style={{ fontSize: 12.5, color: 'var(--text-soft)' }}>نمایش در بخش ویژه صفحه اصلی</span>
          </label>
        </Field>
        <Field label="پرفروش">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0' }}>
            <input type="checkbox" checked={!!p.bestseller} onChange={(e) => set('bestseller', e.target.checked)} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
            <span style={{ fontSize: 12.5, color: 'var(--text-soft)' }}>نشان «پرفروش» و ورود به بخش محبوب‌ترین‌ها</span>
          </label>
        </Field>
        <Field label="جدید">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0' }}>
            <input type="checkbox" checked={!!p.isNew} onChange={(e) => set('isNew', e.target.checked)} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
            <span style={{ fontSize: 12.5, color: 'var(--text-soft)' }}>نشان «جدید» روی کارت محصول</span>
          </label>
        </Field>
      </div>

      <Field label="تصویر شاخص"><ImageField name="mainImage" defaultValue={p.images?.[0] || ''} /></Field>
      <Field label="تصویر دوم (نمایش در هاور کارت)">
        <Select options={[{ value: '', label: 'بدون تصویر دوم' }, ...REPO_IMAGES.map((i) => ({ value: i, label: i }))]} value={p.images?.[1] || ''} onChange={(e) => set('images', [p.images?.[0] || 'p1', e.target.value, ...(p.images?.slice(2) || [])].filter(Boolean))} />
        <p style={{ fontSize: 11, color: 'var(--text-soft)' }}>در صورت خالی‌بودن، فقط تصویر شاخص نمایش داده می‌شود.</p>
      </Field>
      <Field label="توضیح کوتاه"><TextArea value={p.shortDesc} rows={2} onChange={(e) => set('shortDesc', e.target.value)} /></Field>
      <Field label="توضیحات کامل"><TextArea value={p.desc} rows={5} onChange={(e) => set('desc', e.target.value)} /></Field>

      <div className="frow">
        <Field label="رنگ‌ها (با ویرگول جدا کنید)"><TextField value={p.colors?.join('، ')} onChange={(e) => set('colors', e.target.value.split(/[،,]/).map((x: string) => x.trim()).filter(Boolean))} /></Field>
        <Field label="سایزها"><TextField value={p.sizes?.join('، ')} onChange={(e) => set('sizes', e.target.value.split(/[،,]/).map((x: string) => x.trim()).filter(Boolean))} /></Field>
        <Field label="برچسب‌ها"><TextField value={p.tags?.join('، ')} onChange={(e) => set('tags', e.target.value.split(/[،,]/).map((x: string) => x.trim()).filter(Boolean))} /></Field>
        <Field label="وزن (گرم)"><TextField type="number" value={p.weight} onChange={(e) => set('weight', Number(e.target.value) || 0)} /></Field>
      </div>

      <Field label="مشخصات (کلید=مقدار در هر خط)">
        <TextArea value={Object.entries(p.specs || {}).map(([k, v]) => `${k}=${v}`).join('\n')} rows={4} onChange={(e) => set('specs', Object.fromEntries(String(e.target.value).split('\n').map((l) => l.split('=')).filter((a) => a[0]?.trim()).map((a) => [a[0].trim(), (a[1] || '').trim()])))} />
      </Field>

      <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 12 }}>
        <label className="fl">تنوع‌ها (رنگ / سایز / موجودی / قیمت)</label>
        {(p.variants || []).length === 0 ? <p style={{ fontSize: 12.5, color: 'var(--text-soft)' }}>تنوعی ثبت نشده — با دکمه زیر بر اساس رنگ و سایز بسازید.</p> : (
          <table className="tbl">
            <thead><tr><th>رنگ</th><th>سایز</th><th>SKU</th><th>موجودی</th><th>قیمت</th><th></th></tr></thead>
            <tbody>
              {p.variants.map((v: Rec, i: number) => (
                <tr key={i}>
                  <td>{v.color}</td><td>{v.size}</td><td dir="ltr">{v.sku}</td>
                  <td><TextField type="number" value={v.stock} onChange={(e) => { const vs = [...p.variants]; vs[i] = { ...v, stock: Number(e.target.value) || 0 }; set('variants', vs); }} /></td>
                  <td><TextField type="number" value={v.price} onChange={(e) => { const vs = [...p.variants]; vs[i] = { ...v, price: Number(e.target.value) || 0 }; set('variants', vs); }} /></td>
                  <td><button className="btn btn-d btn-sm" onClick={() => set('variants', p.variants.filter((_: Rec, n: number) => n !== i))}>حذف</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button className="btn btn-s btn-sm" style={{ marginTop: 8 }} onClick={() => {
          const vs: Rec[] = [];
          (p.colors || []).forEach((c: string) => (p.sizes || []).forEach((s: string) => vs.push({ id: 'v' + Date.now() + vs.length, color: c, size: s, sku: `${p.sku}-${c.length}${s}`, stock: p.stock || 0, price: p.price })));
          set('variants', vs);
          toast(vs.length ? `${faNum(vs.length)} تنوع ساخته شد` : 'اول رنگ و سایز را ثبت کنید', vs.length ? 'ok' : 'err');
        }}>ساخت خودکار تنوع‌ها</button>
      </div>

      <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 12 }} className="frow">
        <Field label="Meta Title (SEO)"><TextField value={p.seo?.metaTitle || ''} onChange={(e) => set('seo', { ...p.seo, metaTitle: e.target.value })} /></Field>
        <Field label="Meta Description (SEO)"><TextField value={p.seo?.metaDescription || ''} onChange={(e) => set('seo', { ...p.seo, metaDescription: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}
