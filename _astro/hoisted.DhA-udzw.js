import{l as o,L as r}from"./hoisted.DjILnzHD.js";const m=document.documentElement.dataset.base||"";function d(){const i=o(r.compare,[]),s=o(r.products,[]).filter(t=>i.includes(t.id)),l=o(r.categories,[]),$=o(r.brands,[]),c=document.getElementById("compare-wrap");if(document.getElementById("cmp-empty").style.display=s.length?"none":"block",!s.length){c.innerHTML="";return}const n=new Intl.NumberFormat("fa-IR"),e=(t,a)=>`<tr><th>${t}</th>${s.map(p=>`<td>${a(p)}</td>`).join("")}</tr>`;c.innerHTML=`
    <table class="compare-table">
      ${e("محصول",t=>`<a href="${m}/product/${t.slug}"><img src="${m}/assets/img/${t.images[0]}.webp" alt="${t.name}" loading="lazy"></a><p style="font-weight:700;margin-top:8px">${t.name}</p><button class="btn btn-sm btn-default" data-cmp-rm="${t.id}" style="margin-top:8px">حذف</button>`)}
      ${e("قیمت",t=>`<b>${n.format(t.price)}</b> تومان ${t.oldPrice?`<del style="color:var(--c-text-soft);font-size:11px">${n.format(t.oldPrice)}</del>`:""}`)}
      ${e("دسته‌بندی",t=>(l.find(a=>a.id===t.category)||{}).name||"")}
      ${e("برند",t=>($.find(a=>a.id===t.brand)||{}).name||"")}
      ${e("رنگ‌ها",t=>(t.colors||[]).join("، "))}
      ${e("سایزها",t=>(t.sizes||[]).join("، "))}
      ${e("جنس",t=>(t.specs||{}).جنس||"—")}
      ${e("نگهداری",t=>(t.specs||{}).شست‌وشو||"—")}
      ${e("امتیاز",t=>`${"★".repeat(Math.round(t.rating))} ${n.format(t.rating)}`)}
      ${e("موجودی",t=>t.stock>0?`${n.format(t.stock)} عدد`:"ناموجود")}
      ${e("خرید",t=>t.stock>0?`<button class="btn btn-primary btn-sm" data-add="${t.id}">افزودن به سبد</button>`:'<span style="color:var(--c-text-soft)">ناموجود</span>')}
    </table>`,c.querySelectorAll("[data-cmp-rm]").forEach(t=>t.addEventListener("click",()=>{window.__psStore.toggleCompare(t.getAttribute("data-cmp-rm")),d()}))}d();window.__psRefreshCompare=d;
