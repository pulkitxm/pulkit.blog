import{M}from"./index-158gxkvt.js";import{D,A,I}from"./index.js";import{i}from"./index-6zst2n39.js";var o=["top","right","bottom","left"],x=(a)=>{let t={bottom:0,left:0,right:0,top:0};a.innerHTML=i("gap-5 p-6",I`
    <div
      class="relative h-44 w-full max-w-xs rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950"
      aria-hidden="true"
    >
      <div data-ref="shape" class="absolute inset-3 rounded-lg bg-linear-to-br from-sky-500 to-indigo-600 shadow-inner"></div>
    </div>
    <div class="grid w-full max-w-xs gap-3">
      ${o.map((e)=>`<div data-side="${e}" class="flex flex-col gap-1.5">
        <span data-ref="${e}Label" class="font-medium text-neutral-700 text-xs dark:text-neutral-300"></span>
      </div>`)}
    </div>
    <code data-ref="code" class="max-w-full truncate rounded-md bg-neutral-100 px-2 py-1 text-neutral-800 text-xs dark:bg-neutral-800 dark:text-neutral-200"></code>
  `);let s=A(a,"shape",HTMLDivElement),d=A(a,"code",HTMLElement),m=o.map((e)=>({side:e,label:A(a,`${e}Label`,HTMLSpanElement)}));function l(){let e=`inset(${t.top}% ${t.right}% ${t.bottom}% ${t.left}%)`;s.style.clipPath=e,d.textContent=`clip-path: ${e}`;for(let{side:r,label:n}of m)n.textContent=`${r} ${t[r]}%`}for(let e of o){let r=M({max:45,onValueChange:(n)=>{t[e]=n,l()},step:1,value:0});D(a,`[data-side="${e}"]`,HTMLDivElement).append(r.element)}l()};export{x as mount};
