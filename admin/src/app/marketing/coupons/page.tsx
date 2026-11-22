'use client';
import ResourcePage, { type ResourceConfig } from '@/components/ResourcePage';
import { money, faDate, faNum } from '@/lib/store';

const config: ResourceConfig = {
  storageKey: 'ps_coupons',
  title: 'کوپن تخفیف',
  columns: [
    { key: 'code', label: 'کد', render: (r) => <b dir="ltr" style={{ letterSpacing: 1 }}>{r.code}</b> },
    { key: 'amount', label: 'مقدار', render: (r) => (r.type === 'percent' ? `٪${faNum(r.amount)}` : money(r.amount)) },
    { key: 'minOrder', label: 'حداقل سفارش', render: (r) => (r.minOrder ? money(r.minOrder) : '—') },
    { key: 'used', label: 'مصرف‌شده', render: (r) => `${faNum(r.used || 0)} / ${faNum(r.usageLimit || '∞')}` },
    { key: 'end', label: 'انقضا', render: (r) => faDate(r.end) },
    { key: 'active', label: 'وضعیت', render: (r) => <span className={`pill ${r.active ? 'pill--success' : 'pill--muted'}`}>{r.active ? 'فعال' : 'غیرفعال'}</span> },
  ],
  searchKeys: ['code', 'desc'],
  addItemLabel: 'کوپن',
  fields: [
    { key: 'code', label: 'کد تخفیف', required: true, hint: 'مثلاً WELCOME10' },
    {
      key: 'type', label: 'نوع تخفیف', type: 'select',
      options: [{ value: 'percent', label: 'درصدی' }, { value: 'fixed', label: 'مبلغ ثابت' }], default: 'percent',
    },
    { key: 'amount', label: 'مقدار (درصد یا تومان)', type: 'number', required: true },
    { key: 'minOrder', label: 'حداقل مبلغ سفارش (تومان)', type: 'money' },
    { key: 'usageLimit', label: 'سقف استفاده', type: 'number', default: 100 },
    { key: 'start', label: 'تاریخ شروع', type: 'date' },
    { key: 'end', label: 'تاریخ پایان', type: 'date' },
    { key: 'active', label: 'وضعیت', type: 'toggle', default: true, hint: 'کوپن فعال است' },
    { key: 'desc', label: 'توضیحات', type: 'textarea', full: true },
  ],
};

export default function CouponsPage() {
  return <ResourcePage config={config} />;
}
