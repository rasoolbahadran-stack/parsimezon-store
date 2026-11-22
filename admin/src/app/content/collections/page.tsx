'use client';
import ResourcePage, { type ResourceConfig } from '@/components/ResourcePage';
import { list } from '@/lib/store';

const products = list('ps_products');

const config: ResourceConfig = {
  storageKey: 'ps_collections',
  title: 'کالکشن',
  columns: [
    { key: 'image', label: 'تصویر', render: (r) => <img src={`/parsimezon-store/assets/img/${r.image}.webp`} alt={r.name} style={{ width: 52, height: 66, objectFit: 'cover', borderRadius: 6 }} /> },
    { key: 'name', label: 'نام کالکشن', render: (r) => <b>{r.name}</b> },
    { key: 'slug', label: 'اسلاگ', render: (r) => <span dir="ltr">{r.slug}</span> },
    { key: 'products', label: 'محصولات', render: (r) => `${(r.products || []).length} محصول` },
    { key: 'order', label: 'ترتیب' },
    { key: 'active', label: 'وضعیت', render: (r) => <span className={`pill ${r.active ? 'pill--success' : 'pill--muted'}`}>{r.active ? 'فعال' : 'غیرفعال'}</span> },
  ],
  searchKeys: ['name', 'slug', 'desc'],
  addItemLabel: 'کالکشن',
  fields: [
    { key: 'name', label: 'نام کالکشن', required: true },
    { key: 'slug', label: 'اسلاگ (URL)', required: true, hint: 'مثلا winter — صفحه کالکشن در /collection/{slug} ساخته می‌شود' },
    { key: 'image', label: 'تصویر کالکشن', type: 'image' },
    { key: 'desc', label: 'توضیح کوتاه', type: 'textarea', full: true },
    { key: 'products', label: 'اسلاگ محصولات (با ویرگول)', type: 'list', full: true, hint: 'اسلاگ‌های دقیق محصول از صفحه «همه محصولات» — نمایش به ترتیب صفحه اصلی' },
    { key: 'order', label: 'ترتیب نمایش', type: 'number', default: 1 },
    { key: 'active', label: 'فعال', type: 'toggle', default: true },
  ],
};

export default function CollectionsCMS() {
  return (
    <>
      <p style={{ fontSize: 12.5, color: 'var(--text-soft)', margin: '4px 0 14px' }}>
        کالکشن‌های ویژه صفحه اصلی و صفحات اختصاصی فروشگاه. محصول نمونه: {products[0]?.slug || '—'}
      </p>
      <ResourcePage config={config} />
    </>
  );
}
