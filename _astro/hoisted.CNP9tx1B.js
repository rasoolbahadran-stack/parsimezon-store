import{l as n,L as r}from"./hoisted.DZmY5xhh.js";const a=document.documentElement.dataset.base||"";function d(){const o=n(r.wishlist,[]),s=n(r.products,[]).filter(t=>o.includes(t.id)),c=document.getElementById("wish-grid"),e=new Intl.NumberFormat("fa-IR");document.getElementById("wish-count").textContent=`${e.format(s.length)} محصول`,document.getElementById("wish-empty").style.display=s.length?"none":"block",c.innerHTML=s.map(t=>{const i=t.oldPrice?Math.round((1-t.price/t.oldPrice)*100):0;return`
      <article class="product-card">
        <div class="product-card__media">
          ${i?`<span class="badge badge--sale">٪${e.format(i)} تخفیف</span>`:t.isNew?'<span class="badge badge--new">جدید</span>':""}
          <a href="${a}/product/${t.slug}"><img src="${a}/assets/img/${t.images[0]}.webp" alt="${t.name}" loading="lazy"></a>
          <div class="product-card__actions">
            <button class="add-btn" data-add="${t.id}">افزودن به سبد</button>
            <button class="qv-btn" data-wish-remove="${t.id}">حذف ✕</button>
          </div>
        </div>
        <div class="product-card__body">
          <a href="${a}/product/${t.slug}"><h3 class="product-card__title">${t.name}</h3></a>
          <div class="price"><span class="price__current">${t.oldPrice?`<del>${e.format(t.oldPrice)}</del>`:""}${e.format(t.price)}</span><span class="price__unit">تومان</span></div>
        </div>
      </article>`}).join(""),c.querySelectorAll("[data-wish-remove]").forEach(t=>t.addEventListener("click",()=>{window.__psStore.toggleWishlist(t.getAttribute("data-wish-remove")),d()}))}d();window.__psRefreshWishlist=d;
