import"./hoisted.BKZgPU2d.js";const p=document.querySelector("link[rel=icon]").getAttribute("href").replace("/favicon.svg",""),e=a=>new Intl.NumberFormat("fa-IR").format(a),l=new URLSearchParams(location.search).get("code"),d=JSON.parse(localStorage.getItem("ps_orders")||"[]"),s=d.find(a=>a.code===l);if(!s)document.getElementById("receipt-box").innerHTML=`
      <div class="cart-empty" style="padding-top:80px">
        <div class="cart-empty__icon">🔎</div>
        <p>سفارشی با این کد پیدا نشد.</p>
        <a class="btn btn-primary" style="margin-top:14px" href="${p}/shop/">رفتن به فروشگاه</a>
      </div>`;else{const a={pending:["در انتظار پرداخت","status-pill--pending"],processing:["در حال پردازش","status-pill--processing"],shipped:["ارسال شده","status-pill--processing"],delivered:["تحویل شده","status-pill--paid"],cancelled:["لغو شده","status-pill--cancelled"]},n=a[s.status]||a.pending,i=s.paymentStatus==="paid"?["پرداخت شده ✓","status-pill--paid"]:["در انتظار پرداخت","status-pill--pending"],c={pending:"ثبت سفارش",processing:"در حال پردازش",shipped:"ارسال سفارش",delivered:"تحویل به مشتری"},o=(s.history||[]).map(t=>t.status),r=new Date(s.createdAt);document.getElementById("receipt-box").innerHTML=`
      <div class="receipt">
        <div class="receipt__head">
          <div class="pay-result__icon pay-result__icon--ok">✓</div>
          <p class="pay-result__t" style="margin-bottom:4px">سفارش شما با موفقیت ثبت شد</p>
          <p class="receipt__code">${s.code}</p>
          <p class="product-card__cat">تاریخ ثبت: ${new Intl.DateTimeFormat("fa-IR",{dateStyle:"full",timeStyle:"short"}).format(r)}</p>
        </div>
        <div class="receipt__body">
          <div style="display:flex; gap:10px; justify-content:center; margin-bottom:20px; flex-wrap:wrap">
            <span class="status-pill ${n[1]}">وضعیت سفارش: ${n[0]}</span>
            <span class="status-pill ${i[1]}">وضعیت پرداخت: ${i[0]}</span>
          </div>
          <div class="timeline">
            ${Object.keys(c).map(t=>`
              <div class="timeline__item ${o.includes(t)?"is-done":""}">${c[t]}</div>`).join("")}
          </div>
          <p class="cart-summary__t" style="margin-top:8px">اقلام سفارش</p>
          ${s.items.map(t=>`
            <div class="sum-row"><span>${t.name} ${t.variant?`(${t.variant})`:""} × ${e(t.qty)}</span><span>${e(t.price*t.qty)} تومان</span></div>`).join("")}
          <div class="sum-row"><span>جمع کالاها</span><span>${e(s.subtotal)} تومان</span></div>
          ${s.discount?`<div class="sum-row" style="color:var(--c-success)"><span>تخفیف ${s.coupon?"("+s.coupon+")":""}</span><span>−${e(s.discount)} تومان</span></div>`:""}
          <div class="sum-row"><span>هزینه ارسال (${s.shippingMethod})</span><span>${s.shipping===0?"رایگان":e(s.shipping)+" تومان"}</span></div>
          <div class="sum-row is-total"><span>مبلغ پرداختی</span><span>${e(s.total)} تومان</span></div>
          <p class="cart-summary__t" style="margin-top:18px">اطلاعات ارسال</p>
          <p style="font-size:13.5px; color:var(--c-text-soft); line-height:2.2">
            ${s.customer.name} — ${s.customer.phone}<br>
            ${s.customer.province}، ${s.customer.city}، ${s.customer.address}<br>
            کد پستی: ${s.customer.postal} ${s.trackingCode?'— کد رهگیری: <b dir="ltr">'+s.trackingCode+"</b>":""}
          </p>
          <p class="notice notice--info" style="margin-top:18px">📬 برای پیگیری وضعیت سفارش، به <a href="${p}/account/" style="color:var(--c-primary); font-weight:700">حساب کاربری</a> مراجعه کنید.</p>
          <div style="display:flex; gap:10px; justify-content:center; margin-top:8px">
            <a class="btn btn-primary" href="${p}/account/">مشاهده سفارش‌های من</a>
            <a class="btn btn-default" href="${p}/shop/">ادامه خرید</a>
          </div>
        </div>
      </div>`}
