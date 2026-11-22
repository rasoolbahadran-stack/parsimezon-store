'use client';
import ResourcePage, { type ResourceConfig } from '@/components/ResourcePage';

const config: ResourceConfig = {
  storageKey: 'ps_users',
  title: 'کاربر پنل',
  columns: [
    { key: 'name', label: 'نام', render: (r) => <b>{r.name}</b> },
    { key: 'username', label: 'نام کاربری', render: (r) => <span dir="ltr">{r.username}</span> },
    { key: 'role', label: 'نقش', render: (r) => ({ admin: 'مدیر کل', shop_manager: 'مدیر فروشگاه', content: 'مدیر محتوا', demo: 'کاربر آزمایشی' } as any)[r.role] || r.role },
    { key: 'active', label: 'وضعیت', render: (r) => <span className={`pill ${r.active ? 'pill--success' : 'pill--muted'}`}>{r.active ? 'فعال' : 'غیرفعال'}</span> },
  ],
  searchKeys: ['name', 'username'],
  addItemLabel: 'کاربر',
  fields: [
    { key: 'name', label: 'نام کاربر', required: true },
    { key: 'username', label: 'نام کاربری', required: true },
    {
      key: 'role', label: 'نقش', type: 'select',
      options: [
        { value: 'admin', label: 'مدیر کل' },
        { value: 'shop_manager', label: 'مدیر فروشگاه' },
        { value: 'content', label: 'مدیر محتوا' },
        { value: 'demo', label: 'کاربر آزمایشی' },
      ], default: 'demo',
    },
    { key: 'active', label: 'وضعیت', type: 'toggle', default: true, hint: 'کاربر فعال است' },
  ],
};

export default function UsersPage() {
  return (
    <>
      <div className="card card__pad" style={{ marginBottom: 14, fontSize: 12.5, color: 'var(--text-soft)' }}>
        ⚠️ در نسخه دمو، نقش‌ها صرفاً برای نمایش ساختار هستند و امنیت واقعی ندارند (بدون بک‌اند).
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            ['مدیر کل', 'دسترسی کامل به همه بخش‌ها'],
            ['مدیر فروشگاه', 'سفارش‌ها، محصولات و مشتریان'],
            ['مدیر محتوا', 'صفحات، مقالات و رسانه‌ها'],
            ['کاربر آزمایشی', 'فقط مشاهده'],
          ].map(([t, d]) => (
            <div key={t} style={{ border: '1px dashed var(--border)', borderRadius: 8, padding: '8px 12px' }}>
              <b style={{ fontSize: 12.5 }}>{t}</b>
              <p style={{ fontSize: 11.5 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>
      <ResourcePage config={config} />
    </>
  );
}
