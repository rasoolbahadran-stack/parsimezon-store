import"./hoisted.DjILnzHD.js";(function(){const c=document.querySelector("link[rel=icon]").getAttribute("href").replace("/favicon.svg",""),o=a=>new Intl.NumberFormat("fa-IR").format(a),s=JSON.parse(localStorage.getItem("ps_user")||"null");function l(){if(!s){document.getElementById("auth-box").style.display="block";return}document.getElementById("auth-box").style.display="none";const a=document.getElementById("account-box");a.style.display="grid",document.getElementById("acc-name").textContent=s.name,document.getElementById("acc-uid").textContent=s.email||s.phone;const i=JSON.parse(localStorage.getItem("ps_orders")||"[]").filter(e=>e.customer.phone===s.phone||e.customer.email===s.email),t={pending:["در انتظار پرداخت","status-pill--pending"],processing:["در حال پردازش","status-pill--processing"],shipped:["ارسال شده","status-pill--processing"],delivered:["تحویل شده","status-pill--paid"],cancelled:["لغو شده","status-pill--cancelled"]};document.getElementById("orders-list").innerHTML=i.length?i.map(e=>`
        <div class="order-card">
          <div class="order-card__head">
            <span class="order-card__code">${e.code}</span>
            <span class="status-pill ${(t[e.status]||t.pending)[1]}">${(t[e.status]||t.pending)[0]}</span>
          </div>
          <p class="product-card__cat">${new Intl.DateTimeFormat("fa-IR",{dateStyle:"long"}).format(new Date(e.createdAt))} — ${e.items.map(n=>n.name+" × "+o(n.qty)).join(" ، ")}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px">
            <b>${o(e.total)} تومان</b>
            ${e.trackingCode?`<span class="product-card__cat">کد رهگیری: <b dir="ltr">${e.trackingCode}</b></span>`:""}
          </div>
          <div class="timeline">
            ${["pending","processing","shipped","delivered"].map(n=>`
              <div class="timeline__item ${(e.history||[]).some(d=>d.status===n)?"is-done":""}">
                ${{pending:"ثبت سفارش",processing:"در حال پردازش",shipped:"ارسال سفارش",delivered:"تحویل"}[n]}
              </div>`).join("")}
          </div>
        </div>`).join(""):`
        <div class="cart-empty">
          <div class="cart-empty__icon">📦</div>
          <p>هنوز سفارشی ثبت نکرده‌اید.</p>
          <a class="btn btn-primary" style="margin-top:12px" href="${c}/shop">شروع خرید</a>
        </div>`,document.getElementById("profile-card").innerHTML=`
        <div class="sum-row"><span>نام</span><span>${s.name}</span></div>
        <div class="sum-row"><span>موبایل</span><span dir="ltr">${s.phone}</span></div>
        <div class="sum-row"><span>ایمیل</span><span dir="ltr">${s.email||"—"}</span></div>
        <div class="sum-row"><span>شهر</span><span>${s.city||"—"}</span></div>
        <div class="sum-row"><span>تاریخ عضویت</span><span>${s.createdAt||"—"}</span></div>`,document.getElementById("addresses-list").innerHTML=(s.addresses||[]).length?s.addresses.map(e=>`<div class="checkout-card"><b>${e.title}</b><p style="font-size:13.5px; color:var(--c-text-soft); margin-top:4px">${e.address} — کد پستی ${e.postal}</p></div>`).join(""):'<p class="product-card__cat">آدرسی ثبت نشده است. آدرس شما هنگام اولین خرید ثبت می‌شود.</p>'}document.getElementById("auth-form").addEventListener("submit",function(a){a.preventDefault();const i=new FormData(this),t=String(i.get("uid")).trim(),e=String(i.get("uname")||"").trim()||"کاربر پارسی‌مزون",n=JSON.parse(localStorage.getItem("ps_customers")||"[]");let d=n.find(r=>r.email===t||r.phone===t);d||(d={id:"cu"+Date.now(),name:e,phone:/^\d/.test(t)?t:"09"+Math.floor(1e8+Math.random()*9e8),email:t.includes("@")?t:"",city:"تهران",addresses:[],note:"ثبت‌نام دمو",createdAt:new Date().toISOString().slice(0,10)},n.push(d),localStorage.setItem("ps_customers",JSON.stringify(n))),localStorage.setItem("ps_user",JSON.stringify(d)),window.location.reload()}),document.getElementById("logout").addEventListener("click",()=>{localStorage.removeItem("ps_user"),window.location.reload()}),document.querySelectorAll(".account-nav a[data-view]").forEach(a=>a.addEventListener("click",i=>{i.preventDefault(),document.querySelectorAll(".account-nav a").forEach(t=>t.classList.remove("is-active")),a.classList.add("is-active"),["orders","profile","addresses"].forEach(t=>{document.getElementById("view-"+t).style.display=t===a.dataset.view?"block":"none"})})),l()})();
