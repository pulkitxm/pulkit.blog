import{D}from"./index-10mddjmz.js";import{A,g}from"./index.js";var n=["top","right","bottom","left"];function c(r){let t={bottom:0,left:0,right:0,top:0};r.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-5 p-6">
    <div
      class="relative h-44 w-full max-w-xs rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950"
      aria-hidden="true"
    >
      <div data-ref="shape" class="absolute inset-3 rounded-lg bg-linear-to-br from-sky-500 to-indigo-600 shadow-inner"></div>
    </div>
    <div class="grid w-full max-w-xs gap-3">
      ${n.map((e)=>`<div data-side="${e}" class="flex flex-col gap-1.5">
        <span data-ref="${e}Label" class="font-medium text-neutral-700 text-xs dark:text-neutral-300"></span>
      </div>`)}
    </div>
    <code data-ref="code" class="max-w-full truncate rounded-md bg-neutral-100 px-2 py-1 text-neutral-800 text-xs dark:bg-neutral-800 dark:text-neutral-200"></code>
  </div>`;let l=g(r);function d(){let e=`inset(${t.top}% ${t.right}% ${t.bottom}% ${t.left}%)`;l.shape.style.clipPath=e,l.code.textContent=`clip-path: ${e}`;for(let a of n)l[`${a}Label`].textContent=`${a} ${t[a]}%`}for(let e of n){let a=D({max:45,onValueChange:(s)=>{t[e]=s,d()},step:1,value:0});r.querySelector(`[data-side="${e}"]`).append(a.element)}d()}export{c as mount};
