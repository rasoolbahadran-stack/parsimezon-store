'use client';
/* نظرات محصولات — تأیید/رد/حذف */
import { useEffect, useState } from 'react';
import { list, saveList, remove, faDate, faNum, type Rec } from '@/lib/store';
import { ConfirmDelete, toast } from '@/lib/ui';

export default function ReviewsPage() {
  const [rows, setRows] = useState<Rec[]>([]);
  const [filter, setFilter] = useState('');
  const [deleting, setDeleting] = useState<Rec | null>(null);

  const refresh = () => setRows(list('ps_reviews'));
  useEffect(refresh, []);

  const products = list('ps_products');
  const pname = (id: string) => products.find((p) => p.id === id)?.name || id;
  const filtered = rows.filter((r) => !filter || r.status === filter);

  function setStatus(r: Rec, status: string) {
    const rows = list('ps_reviews');
    const i = rows.findIndex((x) => x.id === r.id);
    if (i > -1) rows[i].status = status;
    saveList('ps_reviews', rows);
    toast(status === 'approved' ? 'نظر تأیید شد' : status === 'rejected' ? 'نظر رد شد' : 'وضعیت تغییر کرد');
    refresh();
  }

  return (
    <>
      <div className="toolbar-row">
        <select className="input" style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">همه نظرات</option>
          <option value="pending">در انتظار تأیید</option>
          <option value="approved">تأییدشده</option>
          <option value="rejected">ردشده</option>
        </select>
        <span className="spacer" />
        <span className="pill pill--muted">{faNum(filtered.length)} نظر</span>
      </div>

      <div className="card">
        <table className="tbl">
          <thead><tr><th>محصول</th><th>کاربر</th><th>امتیاز</th><th>متن</th><th>تاریخ</th><th>وضعیت</th><th style={{ width: 200 }}>عملیات</th></tr></thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{pname(r.productId)}</td>
                <td><b>{r.name}</b></td>
                <td><span className="pill pill--warn">{'★'.repeat(r.rating)}</span></td>
                <td style={{ maxWidth: 260, fontSize: 12.5 }}>{r.text}</td>
                <td style={{ fontSize: 12, color: 'var(--text-soft)' }}>{faDate(r.date)}</td>
                <td><span className={`pill ${r.status === 'approved' ? 'pill--success' : r.status === 'rejected' ? 'pill--danger' : 'pill--warn'}`}>{r.status === 'approved' ? 'تأییدشده' : r.status === 'rejected' ? 'ردشده' : 'در انتظار'}</span></td>
                <td>
                  {r.status !== 'approved' ? <button className="btn btn-s btn-sm" onClick={() => setStatus(r, 'approved')}>تأیید</button> : null}{' '}
                  {r.status !== 'rejected' ? <button className="btn btn-s btn-sm" onClick={() => setStatus(r, 'rejected')}>رد</button> : null}{' '}
                  <button className="btn btn-d btn-sm" onClick={() => setDeleting(r)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length ? <div className="empty"><div className="empty__icon">⭐</div><p>نظری در این وضعیت نیست</p></div> : null}
      </div>

      {deleting ? (
        <ConfirmDelete name={`نظر ${deleting.name}`} onCancel={() => setDeleting(null)} onConfirm={() => { remove('ps_reviews', deleting.id); setDeleting(null); toast('نظر حذف شد'); refresh(); }} />
      ) : null}
    </>
  );
}
