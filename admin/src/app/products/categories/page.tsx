'use client';
import ResourcePage, { type ResourceConfig } from '@/components/ResourcePage';
import { faNum } from '@/lib/store';
import { ImageField } from '@/components/ResourcePage';

const config: ResourceConfig = {
  storageKey: 'ps_categories',
  title: 'دسته‌بندی',
  columns: [
    { key: 'image', label: 'تصویر', render: (r) => <img src={`/parsimezon-store/assets/img/${r.image || 'p1'}.webp`} alt={r.name} style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 8 }} /> },
    { key: 'name', label: 'نام', render: (r) => <b>{r.name}</b> },
    { key: 'slug', label: 'اسلاگ', render: (r) => <span dir="ltr">{r.slug}</span> },
    { key: 'desc', label: 'توضیحات', render: (r) => <span style={{ color: 'var(--text-soft)' }}>{r.desc}</span> },
    { key: 'order', label: 'ترتیب', render: (r) => faNum(r.order || 0) },
    { key: 'active', label: 'وضعیت', render: (r) => <span className={`pill ${r.active ? 'pill--success' : 'pill--muted'}`}>{r.active ? 'فعال' : 'غیرفعال'}</span> },
  ],
  searchKeys: ['name', 'slug'],
  addItemLabel: 'دسته‌بندی',
  fields: [
    { key: 'name', label: 'نام دسته', required: true },
    { key: 'slug', label: 'اسلاگ', required: true, hint: 'مثلاً evening-dress' },
    { key: 'image', label: 'تصویر دسته', type: 'image' },
    { key: 'desc', label: 'توضیحات', type: 'textarea', full: true },
    { key: 'order', label: 'ترتیب نمایش', type: 'number', default: 1 },
    { key: 'active', label: 'وضعیت', type: 'toggle', default: true, hint: 'دسته فعال است' },
  ],
};

export default function CategoriesPage() {
  return <ResourcePage config={config} />;
}
