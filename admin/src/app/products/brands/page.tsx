'use client';
import ResourcePage, { type ResourceConfig } from '@/components/ResourcePage';

const config: ResourceConfig = {
  storageKey: 'ps_brands',
  title: 'برند',
  columns: [
    { key: 'name', label: 'نام برند', render: (r) => <b>{r.name}</b> },
    { key: 'slug', label: 'اسلاگ', render: (r) => <span dir="ltr">{r.slug}</span> },
    { key: 'desc', label: 'توضیحات', render: (r) => <span style={{ color: 'var(--text-soft)' }}>{r.desc}</span> },
    { key: 'active', label: 'وضعیت', render: (r) => <span className={`pill ${r.active ? 'pill--success' : 'pill--muted'}`}>{r.active ? 'فعال' : 'غیرفعال'}</span> },
  ],
  searchKeys: ['name', 'slug'],
  addItemLabel: 'برند',
  fields: [
    { key: 'name', label: 'نام برند', required: true },
    { key: 'slug', label: 'اسلاگ', required: true },
    { key: 'desc', label: 'توضیحات', type: 'textarea', full: true },
    { key: 'active', label: 'وضعیت', type: 'toggle', default: true, hint: 'برند فعال است' },
  ],
};

export default function BrandsPage() {
  return <ResourcePage config={config} />;
}
