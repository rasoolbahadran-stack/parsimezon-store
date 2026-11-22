'use client';
import ResourcePage, { type ResourceConfig } from '@/components/ResourcePage';

const config: ResourceConfig = {
  storageKey: 'ps_pages',
  title: 'صفحه',
  columns: [
    { key: 'title', label: 'عنوان', render: (r) => <b>{r.title}</b> },
    { key: 'slug', label: 'اسلاگ', render: (r) => <span dir="ltr">{r.slug}</span> },
    { key: 'status', label: 'وضعیت', render: (r) => <span className={`pill ${r.status === 'published' ? 'pill--success' : 'pill--muted'}`}>{r.status === 'published' ? 'منتشرشده' : 'پیش‌نویس'}</span> },
  ],
  searchKeys: ['title', 'slug'],
  addItemLabel: 'صفحه',
  fields: [
    { key: 'title', label: 'عنوان صفحه', required: true },
    { key: 'slug', label: 'اسلاگ (آدرس)', required: true },
    { key: 'image', label: 'تصویر شاخص', type: 'image' },
    {
      key: 'status', label: 'وضعیت', type: 'select',
      options: [{ value: 'published', label: 'منتشرشده' }, { value: 'draft', label: 'پیش‌نویس' }], default: 'published',
    },
    { key: 'body', label: 'محتوای صفحه', type: 'textarea', full: true, required: true },
  ],
};

export default function PagesCMS() {
  return <ResourcePage config={config} />;
}
