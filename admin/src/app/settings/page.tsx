'use client';
/* تنظیمات عمومی، ظاهری، پرداخت دمو و SEO — با پیش‌نمایش رنگ */
import { useEffect, useState } from 'react';
import { getSettings, setSettings, list, saveList, type Rec } from '@/lib/store';
import { toast } from '@/lib/ui';
import { Field, TextField, TextArea } from '@/lib/ui';

export default function SettingsPage() {
  const [s, setS] = useState<Rec>({});
  const [methods, setMethods] = useState<Rec[]>([]);

  useEffect(() => {
    const st = getSettings();
    setS(st);
    setMethods((st.paymentMethods || []).map((m: Rec) => ({ ...m })));
  }, []);

  const set = (k: string, v: any) => setS((prev) => ({ ...prev, [k]: v }));

  function saveAll() {
    setSettings(s);
    const st = getSettings();
    st.paymentMethods = methods;
    saveList('ps_settings', st);
    toast('تنظیمات ذخیره شد');
  }

  return (
    <>
      <div className="toolbar-row">
        <span className="pill pill--info">تغییرات پس از ذخیره، در فروشگاه هم اعمال می‌شود</span>
        <span className="spacer" />
        <button className="btn btn-p" onClick={saveAll}>💾 ذخیره همه تنظیمات</button>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card__head"><b className="card__t">🏪 اطلاعات عمومی سایت</b></div>
          <div className="card__pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="frow">
              <Field label="نام سایت"><TextField value={s.siteName || ''} onChange={(e) => set('siteName', e.target.value)} /></Field>
              <Field label="شعار سایت"><TextField value={s.tagline || ''} onChange={(e) => set('tagline', e.target.value)} /></Field>
            </div>
            <div className="frow">
              <Field label="تلفن"><TextField value={s.phone || ''} onChange={(e) => set('phone', e.target.value)} /></Field>
              <Field label="ایمیل"><TextField value={s.email || ''} onChange={(e) => set('email', e.target.value)} /></Field>
            </div>
            <Field label="آدرس"><TextArea value={s.address || ''} rows={2} onChange={(e) => set('address', e.target.value)} /></Field>
            <Field label="ساعات کاری"><TextField value={s.workingHours || ''} onChange={(e) => set('workingHours', e.target.value)} /></Field>
            <Field label="متن نوار اطلاع‌رسانی بالای سایت (HTML ساده مجاز)"><TextArea value={s.promoBar || ''} rows={2} onChange={(e) => set('promoBar', e.target.value)} /></Field>
            <Field label="یادداشت درگاه پرداخت دمو"><TextArea value={s.paymentDemoNote || ''} rows={2} onChange={(e) => set('paymentDemoNote', e.target.value)} /></Field>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="card__head"><b className="card__t">🎨 تنظیمات ظاهری</b></div>
            <div className="card__pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="frow">
                <Field label="رنگ اصلی (دکمه‌ها و تاکیدها)">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={s.primaryColor || '#ED1844'} onChange={(e) => set('primaryColor', e.target.value)} style={{ width: 42, height: 34, border: '1px solid var(--border)', borderRadius: 8, background: 'none' }} />
                    <TextField value={s.primaryColor || ''} onChange={(e) => set('primaryColor', e.target.value)} dir="ltr" />
                  </div>
                </Field>
                <Field label="رنگ اکسنت">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={s.accentColor || '#FBBC34'} onChange={(e) => set('accentColor', e.target.value)} style={{ width: 42, height: 34, border: '1px solid var(--border)', borderRadius: 8, background: 'none' }} />
                    <TextField value={s.accentColor || ''} onChange={(e) => set('accentColor', e.target.value)} dir="ltr" />
                  </div>
                </Field>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--text-soft)' }}>در نسخه دمو، رنگ اصلی سایت با این مقادیر یکسان است؛ تغییر اینجا برای نسخه‌های آینده آماده است.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ width: 44, height: 28, borderRadius: 7, background: s.primaryColor || '#ED1844', display: 'inline-block' }} />
                <span style={{ width: 44, height: 28, borderRadius: 7, background: s.accentColor || '#FBBC34', display: 'inline-block' }} />
                <button className="btn btn-p" style={{ background: s.primaryColor || '#ED1844' }}>پیش‌نمایش دکمه</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__head"><b className="card__t">🌐 شبکه‌های اجتماعی</b></div>
            <div className="card__pad" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Field label="اینستاگرام"><TextField value={s.socials?.instagram || ''} dir="ltr" onChange={(e) => set('socials', { ...s.socials, instagram: e.target.value })} /></Field>
              <Field label="تلگرام"><TextField value={s.socials?.telegram || ''} dir="ltr" onChange={(e) => set('socials', { ...s.socials, telegram: e.target.value })} /></Field>
              <Field label="واتساپ"><TextField value={s.socials?.whatsapp || ''} dir="ltr" onChange={(e) => set('socials', { ...s.socials, whatsapp: e.target.value })} /></Field>
            </div>
          </div>

          <div className="card">
            <div className="card__head"><b className="card__t">💳 روش‌های پرداخت (دمو)</b></div>
            <div className="card__pad">
              {methods.map((m, i) => (
                <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px dashed var(--border)' }}>
                  <input type="checkbox" checked={!!m.active} onChange={(e) => { const ms = [...methods]; ms[i] = { ...m, active: e.target.checked }; setMethods(ms); }} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                  <span style={{ flex: 1 }}><b style={{ fontSize: 13 }}>{m.name}</b><br /><span style={{ fontSize: 11.5, color: 'var(--text-soft)' }}>{m.desc}</span></span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
