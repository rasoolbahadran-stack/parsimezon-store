'use client';
/* پیام‌ها — مشاهده، وضعیت، پاسخ دمو، آرشیو */
import { useEffect, useState } from 'react';
import { list, saveList, remove, faDate, faNum, type Rec } from '@/lib/store';
import { Modal, ConfirmDelete, toast, TextArea } from '@/lib/ui';

export default function MessagesPage() {
  const [rows, setRows] = useState<Rec[]>([]);
  const [open, setOpen] = useState<Rec | null>(null);
  const [reply, setReply] = useState('');
  const [deleting, setDeleting] = useState<Rec | null>(null);

  const refresh = () => setRows(list('ps_messages'));
  useEffect(refresh, []);

  function setStatus(r: Rec, status: string) {
    const rows = list('ps_messages');
    const i = rows.findIndex((x) => x.id === r.id);
    if (i > -1) rows[i].status = status;
    saveList('ps_messages', rows);
    toast(status === 'archived' ? 'پیام آرشیو شد' : 'وضعیت پیام تغییر کرد');
    refresh();
    setOpen(null);
  }

  return (
    <>
      <div className="toolbar-row">
        <span className="spacer" />
        <span className="pill pill--warn">{faNum(rows.filter((r) => r.status === 'new').length)} پیام جدید</span>
        <span className="pill pill--muted">{faNum(rows.length)} کل پیام‌ها</span>
      </div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>فرستنده</th><th>موضوع</th><th>متن</th><th>موبایل</th><th>تاریخ</th><th>وضعیت</th><th style={{ width: 160 }}>عملیات</th></tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td><b>{m.name}</b></td>
                <td>{m.subject}</td>
                <td style={{ maxWidth: 240, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.text}</td>
                <td dir="ltr">{m.phone}</td>
                <td style={{ fontSize: 12, color: 'var(--text-soft)' }}>{faDate(m.date)}</td>
                <td><span className={`pill ${m.status === 'new' ? 'pill--warn' : m.status === 'read' ? 'pill--info' : 'pill--muted'}`}>{m.status === 'new' ? 'جدید' : m.status === 'read' ? 'خوانده‌شده' : 'آرشیو'}</span></td>
                <td>
                  <button className="btn btn-s btn-sm" onClick={() => { setOpen(m); setReply(''); const rows = list('ps_messages'); const i = rows.findIndex((x) => x.id === m.id); if (i > -1 && rows[i].status === 'new') { rows[i].status = 'read'; saveList('ps_messages', rows); refresh(); } }}>مشاهده</button>{' '}
                  <button className="btn btn-d btn-sm" onClick={() => setDeleting(m)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length ? <div className="empty"><div className="empty__icon">✉️</div><p>پیامی نیست — پیام‌های فرم تماس سایت همین‌جا نمایش داده می‌شوند.</p></div> : null}
      </div>

      {open ? (
        <Modal
          title={`پیام: ${open.subject}`}
          onClose={() => setOpen(null)}
          footer={
            <>
              <button className="btn btn-p" onClick={() => { if (!reply.trim()) { toast('متن پاسخ را بنویسید', 'err'); return; } toast('پاسخ ثبت شد (دمو — ارسال واقعی ندارد)'); setOpen(null); }}>ارسال پاسخ دمو</button>
              <button className="btn btn-s" onClick={() => setStatus(open, 'archived')}>آرشیو</button>
            </>
          }
        >
          <p style={{ fontSize: 13 }}><b>{open.name}</b> — <span dir="ltr">{open.phone}</span> — {faDate(open.date)}</p>
          <p style={{ fontSize: 13.5, lineHeight: 2.2, background: 'var(--surface-2)', borderRadius: 8, padding: 12 }}>{open.text}</p>
          <TextArea placeholder="متن پاسخ…" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} />
        </Modal>
      ) : null}
      {deleting ? (
        <ConfirmDelete name={`پیام ${deleting.name}`} onCancel={() => setDeleting(null)} onConfirm={() => { remove('ps_messages', deleting.id); setDeleting(null); toast('پیام حذف شد'); refresh(); }} />
      ) : null}
    </>
  );
}
