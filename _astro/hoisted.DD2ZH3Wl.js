import{c as r,s as u}from"./hoisted.DjILnzHD.js";const a=document.querySelector("link[rel=icon]").getAttribute("href").replace("/favicon.svg",""),p=e=>new Intl.NumberFormat("fa-IR").format(e),n=JSON.parse(sessionStorage.getItem("ps_pending_order")||"null");function d(e,o,s,t,c=!0){if(!c){document.getElementById("gateway").innerHTML=`
        <div class="gateway__head"><b>نتیجه پرداخت</b></div>
        <div class="gateway__body">
          <div class="pay-result">
            <div class="pay-result__icon pay-result__icon--no">✕</div>
            <p class="pay-result__t">پرداخت ناموفق بود</p>
            <p class="pay-result__s">پسورد تست 1234 وارد شده است. سفارشی ثبت نشد.</p>
            <div style="display:flex; gap:10px; justify-content:center; margin-top:18px">
              <a class="btn btn-default" href="${a}/checkout/">بازگشت به تسویه</a>
            </div>
          </div>
        </div>`;return}const i=r({customer:e.customer,items:e.items,subtotal:e.subtotal,discount:e.discount,coupon:e.coupon,shipping:o,total:s,shippingMethod:e.shippingMethod,paymentMethod:t});u([]),sessionStorage.removeItem("ps_pending_order"),sessionStorage.removeItem("ps_checkout_ctx"),window.location.href=a+"/order-confirm/?code="+i.code}if(!n)window.location.href=a+"/cart/";else{const e=new URLSearchParams(location.search).get("cod")==="1",o=n.subtotal>=3e6?0:89e3,s=Math.max(0,n.subtotal-n.discount)+o;if(e)d(n,o,s,"cod");else{document.getElementById("pay-amount").textContent=p(s)+" تومان";const t=document.getElementById("card-num");t.addEventListener("input",()=>{t.value=t.value.replace(/\D/g,"").slice(0,16).replace(/(\d{4})(?=\d)/g,"$1-")}),document.getElementById("pay-btn").addEventListener("click",()=>{if(t.value.replace(/\D/g,"").length<8){t.focus(),t.style.borderColor="var(--c-primary)";return}document.getElementById("gateway-body").style.display="none",document.getElementById("paying").style.display="block",setTimeout(()=>{const l=document.getElementById("card-pin").value!=="1234";d(n,o,s,"gateway",l)},2e3)})}}
