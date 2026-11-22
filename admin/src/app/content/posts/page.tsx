'use client';
import ResourcePage, { type ResourceConfig } from '@/components/ResourcePage';
import { faDate } from '@/lib/store';

const config: ResourceConfig = {
  storageKey: 'ps_posts',
  title: 'مقاله',
  columns: [
    { key: 'image', label: 'تصویر', render: (r) => <img src={`/parsimezon-store/assets/img/${r.image || 'blog1'}.webp`} alt={r.title} style={{ width: 52, height: 36, objectFit: 'cover', borderRadius: 6 }} /> },
    { key: 'title', label: 'عنوان', render: (r) => <b>{r.title}</b> },
    { key: 'category', label: 'دسته' },
    { key: 'date', label: 'تاریخ', render: (r) => faDate(r.date) },
    { key: 'status', label: 'وضعیت', render: (r) => <span className={`pill ${r.status !== 'draft' ? 'pill--success' : 'pill--muted'}`}>{r.status !== 'draft' ? 'منتشرشده' : 'پیش‌نویس'}</span> },
  ],
  searchKeys: ['title', 'category', 'tags'],
  addItemLabel: 'مقاله',
  fields: [
    { key: 'title', label: 'عنوان مقاله', required: true, full: true },
    { key: 'slug', label: 'اسلاگ', required: true },
    { key: 'category', label: 'دسته مقاله', default: 'راهنمای خرید' },
    { key: 'image', label: 'تصویر شاخص', type: 'image' },
    { key: 'date', label: 'تاریخ', type: 'date' },
    { key: 'status', label: 'وضعیت', type: 'toggle', default: true, hint: 'منتشرشده (خاموش = پیش‌نویس)' },
    { key: 'excerpt', label: 'خلاصه / لید مقاله', type: 'textarea', full: true },
    { key: 'body', label: 'متن کامل مقاله', type: 'textarea', full: true, required: true },
    { key: 'metaTitle', label: 'Meta Title (SEO)' },
    { key: 'metaDescription', label: 'Meta Description (SEO)' },
  ],
};

export default function PostsCMS() {
  return <ResourcePage config={config} />;
}
