import{U}from"./index-tg3a6emz.js";import{l,A,I}from"./index.js";import{Q}from"./index-9xe00pb0.js";var o=["top","right","bottom","left"],x=(a)=>{let t={bottom:0,left:0,right:0,top:0};a.innerHTML=Q("gap-5 p-6",I`
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
  `);let d=A(a,"shape",HTMLDivElement),i=A(a,"code",HTMLElement),m=o.map((e)=>({side:e,label:A(a,`${e}Label`,HTMLSpanElement)}));function s(){let e=`inset(${t.top}% ${t.right}% ${t.bottom}% ${t.left}%)`;d.style.clipPath=e,i.textContent=`clip-path: ${e}`;for(let{side:r,label:n}of m)n.textContent=`${r} ${t[r]}%`}for(let e of o){let r=U({max:45,onValueChange:(n)=>{t[e]=n,s()},step:1,value:0});l(a,`[data-side="${e}"]`,HTMLDivElement).append(r.element)}s()};export{x as mount};
