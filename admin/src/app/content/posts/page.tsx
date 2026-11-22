'use client';
import ResourcePage, { type ResourceConfig } from '@/components/ResourcePage';
import { faDate, faNum } from '@/lib/store';

const config: ResourceConfig = {
  storageKey: 'ps_posts',
  title: 'مقاله مجله',
  columns: [
    { key: 'cover', label: 'تصویر', render: (r) => <img src={`/parsimezon-store/assets/img/${r.cover || r.image || 'blog1'}.webp`} alt={r.title} style={{ width: 52, height: 36, objectFit: 'cover', borderRadius: 6 }} /> },
    { key: 'title', label: 'عنوان', render: (r) => <b>{r.title}</b> },
    { key: 'category', label: 'دسته' },
    { key: 'readTime', label: 'زمان مطالعه', render: (r) => `${faNum(r.readTime || 5)} دقیقه` },
    { key: 'date', label: 'تاریخ', render: (r) => faDate(r.date) },
    { key: 'status', label: 'وضعیت', render: (r) => <span className={`pill ${r.status !== 'draft' ? 'pill--success' : 'pill--muted'}`}>{r.status !== 'draft' ? 'منتشرشده' : 'پیش‌نویس'}</span> },
  ],
  searchKeys: ['title', 'category', 'author'],
  addItemLabel: 'مقاله',
  fields: [
    { key: 'title', label: 'عنوان مقاله', required: true, full: true },
    { key: 'slug', label: 'اسلاگ', required: true },
    { key: 'category', label: 'دسته مقاله', default: 'راهنمای خرید' },
    { key: 'cover', label: 'تصویر شاخص', type: 'image' },
    { key: 'date', label: 'تاریخ', type: 'date' },
    { key: 'readTime', label: 'زمان مطالعه (دقیقه)', type: 'number', default: 6 },
    { key: 'author', label: 'نویسنده', default: 'تحریریه پارسی‌مزون' },
    { key: 'status', label: 'وضعیت', type: 'toggle', default: true, hint: 'منتشرشده (خاموش = پیش‌نویس)' },
    { key: 'excerpt', label: 'خلاصه / لید مقاله', type: 'textarea', full: true },
    { key: 'body', label: 'متن کامل مقاله (Markdown ساده: ## تیتر، ** بولد **، - لیست، > نقل، [پ:اسلاگ-محصول] کارت محصول)', type: 'textarea', full: true, required: true },
    { key: 'metaTitle', label: 'Meta Title (SEO)' },
    { key: 'metaDescription', label: 'Meta Description (SEO)' },
  ],
};

export default function PostsCMS() {
  return <ResourcePage config={config} />;
}
