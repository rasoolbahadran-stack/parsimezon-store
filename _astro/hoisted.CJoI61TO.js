import{l,a as u,d as v}from"./hoisted.DjILnzHD.js";const p=t=>new Intl.NumberFormat("fa-IR").format(t),o=["pending","processing","shipped","delivered"],r={pending:"ثبت شد",processing:"در حال پردازش",shipped:"ارسال شد",delivered:"تحویل شد"};function d(t){const e=document.getElementById("track-result");if(!t){e.innerHTML=`
        <div class="pay-result">
          <div class="pay-result__icon pay-result__icon--no">✕</div>
          <p class="pay-result__t">سفارشی با این کد پیدا نشد</p>
          <p class="pay-result__s">کد سفارش در رسید خرید و صفحه «حساب کاربری» موجود است. اگر سفارش را در این مرورگر ثبت نکرده‌اید، داده دموی بالا را امتحان کنید.</p>
        </div>`;return}const a=(t.items||[]).map(s=>{const n=l("ps_products",[]).find(m=>m.id===s.productId);return`<div class="cart-line" style="grid-template-columns:64px 1fr auto">
        ${n?`<img src="${document.documentElement.dataset.base}/assets/img/${n.images[0]}.webp" alt="${n.name}">`:""}
        <div><div class="cart-line__t">${n?.name||s.productId}</div><div class="cart-line__v">تعداد: ${p(s.qty)}</div></div>
        <div class="cart-line__price">${p(s.lineSum??(s.price||0)*s.qty)} تومان</div>
      </div>`}).join(""),i=Math.max(0,o.indexOf(t.status==="cancelled"?"pending":t.status));e.innerHTML=`
      <div class="receipt" style="margin-top:0">
        <div class="receipt__head">
          <p style="font-size:12.5px;color:var(--c-text-soft)">وضعیت سفارش</p>
          <p class="receipt__code">${t.code}</p>
          <span class="status-pill ${t.status==="delivered"?"status-pill--paid":t.status==="cancelled"?"status-pill--cancelled":"status-pill--processing"}">${u[t.status]||r[t.status]||t.status}</span>
          <p style="font-size:12px;color:var(--c-text-soft);margin-top:8px">ثبت شده در ${v(t.createdAt)}</p>
        </div>
        <div class="receipt__body">
          <div class="timeline">
            ${o.map((s,c)=>`<div class="timeline__item ${c<=i?"is-done":""}">${r[s]}${c===i&&t.status!=="cancelled"?" — مرحله فعلی":""}</div>`).join("")}
          </div>
          <h3 style="font-size:15px;font-weight:800;margin:18px 0 8px">اقلام سفارش</h3>
          ${a||'<p style="color:var(--c-text-soft);font-size:13px">—</p>'}
          <div class="sum-row is-total" style="margin-top:14px"><span>مبلغ کل</span><span>${p(t.total)} تومان</span></div>
          <p style="font-size:12px;color:var(--c-text-soft);margin-top:10px">روش ارسال: ${t.shippingMethod||"—"} | پرداخت: ${t.paymentMethod==="cod"?"در محل":"آنلاین (دمو)"}</p>
        </div>
      </div>`}document.getElementById("track-form")?.addEventListener("submit",t=>{t.preventDefault();const e=document.getElementById("track-code").value.trim().toUpperCase(),a=l("ps_orders",[]);d(a.find(i=>String(i.code).toUpperCase()===e)||null)});document.getElementById("track-demo-fill")?.addEventListener("click",()=>{const t=l("ps_orders",[]),e=t.find(a=>String(a.code).startsWith("PS-"))||t[0];e?(document.getElementById("track-code").value=String(e.code),d(e)):d({code:"PS-48213",status:"shipped",createdAt:new Date().toISOString(),total:245e4,shippingMethod:"پست پیشتاز",paymentMethod:"online",items:[]})});
