'use client';
/* موتور CRUD عمومی پنل — یک پیکربندی برای هر منبع (منبع‌محور)، برای استفاده مجدد در پروژه‌های مختلف */
import { useEffect, useMemo, useState } from 'react';
import { list, upsert, remove, nextId, faNum } from '@/lib/store';
import { Modal, ConfirmDelete, toast, Field, TextField, TextArea, Select, usePaged, Pager, type Field as _F } from '@/lib/ui';

export type FieldType = 'text' | 'number' | 'money' | 'textarea' | 'select' | 'toggle' | 'image' | 'date' | 'list';
export type FieldDef = {
  key: string;
  label: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  full?: boolean;
  hint?: string;
  default?: any;
};
export type ColumnDef = {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
  width?: string;
};
export type ResourceConfig = {
  storageKey: string;
  title: string;
  icon?: string;
  columns: ColumnDef[];
  fields: FieldDef[];
  searchKeys: string[];
  addItemLabel?: string;
};

export function makeOptions(rows: any[], valueKey: string, labelKey: string) {
  return rows.map((r) => ({ value: r[valueKey], label: r[labelKey] }));
}

export default function ResourcePage({ config, extraToolbar }: { config: ResourceConfig; extraToolbar?: React.ReactNode }) {
  const [rows, setRows] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);

  const refresh = () => {
    setRows(list(config.storageKey));
    setReady(true);
  };
  useEffect(refresh, [config.storageKey]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => config.searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(s)));
  }, [rows, q, config.searchKeys]);

  const { slice, page, pages, setPage } = usePaged(filtered, 10);

  function save(form: FormData) {
    const row: any = { id: editing?.id || nextId(config.storageKey, config.storageKey.slice(3, 5).toLowerCase()) };
    config.fields.forEach((f) => {
      const raw = form.get(f.key);
      if (f.type === 'toggle') row[f.key] = raw === '1';
      else if (f.type === 'number' || f.type === 'money') row[f.key] = Number(String(raw).replace(/[^\d]/g, '')) || 0;
      else if (f.type === 'list') row[f.key] = String(raw || '').split(/[،,\n]/).map((x) => x.trim()).filter(Boolean);
      else row[f.key] = String(raw ?? '');
      if (f.required && !row[f.key] && row[f.key] !== false) {
        throw new Error(`مقدار «${f.label}» الزامی است`);
      }
    });
    upsert(config.storageKey, row);
    toast(editing ? 'با موفقیت ویرایش شد' : 'با موفقیت افزوده شد');
    setEditing(null);
    refresh();
  }

  return (
    <>
      <div className="toolbar-row">
        <div className="search-box">
          <input className="input" placeholder={`جست‌وجو در ${config.title}…`} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        </div>
        {extraToolbar}
        <span className="spacer" />
        <button className="btn btn-p" onClick={() => setEditing({ __new: true })}>＋ {config.addItemLabel || 'افزودن'}</button>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              {config.columns.map((c) => (
                <th key={c.key} style={c.width ? { width: c.width } : undefined}>{c.label}</th>
              ))}
              <th style={{ width: 130 }}>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {ready && slice.map((r) => (
              <tr key={r.id}>
                {config.columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(r) : String(r[c.key] ?? '—')}</td>
                ))}
                <td>
                  <button className="btn btn-s btn-sm" onClick={() => setEditing(r)}>ویرایش</button>{' '}
                  <button className="btn btn-d btn-sm" onClick={() => setDeleting(r)}>حذف</button>
                </td>
              </tr>
            ))}
            {!ready && Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}><td colSpan={config.columns.length + 1}><div className="skel" style={{ height: 26 }} /></td></tr>
            ))}
          </tbody>
        </table>
        <Pager page={page} pages={pages} onPage={setPage} total={filtered.length} />
      </div>

      {editing ? (
        <EntityForm
          title={(editing.__new ? 'افزودن ' : 'ویرایش ') + config.title}
          fields={config.fields}
          initial={editing.__new ? config.fields.reduce((acc, f) => ({ ...acc, [f.key]: f.default ?? '' }), {}) : editing}
          onClose={() => setEditing(null)}
          onSubmit={(fd) => save(fd)}
        />
      ) : null}

      {deleting ? (
        <ConfirmDelete
          name={deleting[config.searchKeys[0]] || deleting.id}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            remove(config.storageKey, deleting.id);
            setDeleting(null);
            toast('حذف شد');
            refresh();
          }}
        />
      ) : null}
    </>
  );
}

/* فرم عمومی از روی FieldDefها */
export function EntityForm({ title, fields, initial, onClose, onSubmit }: { title: string; fields: FieldDef[]; initial: any; onClose: () => void; onSubmit: (fd: FormData) => void }) {
  const [err, setErr] = useState('');
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-p" form="entity-form" type="submit">ذخیره</button>
          <button className="btn btn-s" type="button" onClick={onClose}>انصراف</button>
        </>
      }
    >
      <form
        id="entity-form"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            setErr('');
            onSubmit(new FormData(e.target as HTMLFormElement));
          } catch (ex: any) {
            setErr(ex.message);
            toast(ex.message, 'err');
          }
        }}
      >
        <div className="frow">
          {fields.map((f) => (
            <Field key={f.key} label={f.label + (f.required ? ' *' : '')}>
              {f.type === 'textarea' ? (
                <TextArea name={f.key} defaultValue={Array.isArray(initial[f.key]) ? initial[f.key].join('، ') : initial[f.key] ?? ''} required={f.required} />
              ) : f.type === 'select' ? (
                <Select name={f.key} options={f.options || []} defaultValue={initial[f.key] ?? ''} />
              ) : f.type === 'toggle' ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0' }}>
                  <input type="checkbox" name={f.key} value="1" defaultChecked={!!initial[f.key]} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                  <span style={{ fontSize: 12.5, color: 'var(--text-soft)' }}>{f.hint || 'فعال'}</span>
                </label>
              ) : f.type === 'image' ? (
                <ImageField name={f.key} defaultValue={initial[f.key] || ''} />
              ) : (
                <TextField name={f.key} type={f.type === 'money' ? 'text' : f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'} defaultValue={initial[f.key] ?? ''} required={f.required} inputMode={f.type === 'money' ? 'numeric' : undefined} />
              )}
              {f.hint && f.type !== 'toggle' ? <p style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 4 }}>{f.hint}</p> : null}
            </Field>
          ))}
        </div>
        {err ? <p style={{ color: 'var(--danger)', fontSize: 12.5 }}>{err}</p> : null}
      </form>
    </Modal>
  );
}

/* انتخاب تصویر از گالری ریپو + پیش‌نمایش */
export function ImageField({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [val, setVal] = useState(defaultValue);
  const imgs = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'hero1', 'hero2', 'blog1', 'blog2', 'blog3', 'about1'];
  return (
    <div>
      <input type="hidden" name={name} value={val} />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {val ? (
          <img src={`/parsimezon-store/assets/img/${val}.webp`} alt="پیش‌نمایش" style={{ width: 42, height: 54, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
        ) : null}
        <select className="input" style={{ maxWidth: 220 }} value={val} onChange={(e) => setVal(e.target.value)}>
          <option value="">انتخاب تصویر…</option>
          {imgs.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 4 }}>در نسخه دمو، تصاویر از گالری ریپو انتخاب می‌شوند (بدون بک‌اند).</p>
    </div>
  );
}
