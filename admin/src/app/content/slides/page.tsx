'use client';
import ResourcePage, { type ResourceConfig } from '@/components/ResourcePage';

const config: ResourceConfig = {
  storageKey: 'ps_slides',
  title: 'اسلاید هیرو',
  columns: [
    { key: 'image', label: 'تصویر', render: (r) => <img src={`/parsimezon-store/assets/img/${r.image}.webp`} alt={r.title} style={{ width: 84, height: 46, objectFit: 'cover', borderRadius: 6 }} /> },
    { key: 'title', label: 'تیتر', render: (r) => <b>{r.title}</b> },
    { key: 'tag', label: 'برچسب' },
    { key: 'link', label: 'لینک', render: (r) => <span dir="ltr" style={{ fontSize: 12 }}>{r.link}</span> },
    { key: 'order', label: 'ترتیب' },
    { key: 'active', label: 'وضعیت', render: (r) => <span className={`pill ${r.active ? 'pill--success' : 'pill--muted'}`}>{r.active ? 'فعال' : 'غیرفعال'}</span> },
  ],
  searchKeys: ['title', 'tag', 'sub'],
  addItemLabel: 'اسلاید',
  fields: [
    { key: 'tag', label: 'برچسب بالای تیتر', required: true, hint: 'مثلا «کالکشن جدید» یا «جشنواره فصلی»' },
    { key: 'title', label: 'تیتر اصلی', required: true },
    { key: 'sub', label: 'زیرتیتر', type: 'textarea' },
    { key: 'image', label: 'تصویر بنر (عریض)', type: 'image' },
    { key: 'cta', label: 'متن دکمه', default: 'مشاهده' },
    { key: 'link', label: 'لینک دکمه', default: '/shop', hint: 'مثلا /shop?sale=1 یا /collection/winter' },
    { key: 'order', label: 'ترتیب نمایش', type: 'number', default: 1 },
    { key: 'active', label: 'فعال', type: 'toggle', default: true },
  ],
};

export default function SlidesCMS() {
  return (
    <>
      <p style={{ fontSize: 12.5, color: 'var(--text-soft)', margin: '4px 0 14px' }}>
        اسلایدر افتتاحیه صفحه اصلی — تصاویر بنری با نسبت ۱۶:۹ بهترین جلوه را دارند. تغییرات بلافاصله در سایت (همان مرورگر) اعمال می‌شود.
      </p>
      <ResourcePage config={config} />
    </>
  );
}
