import{D}from"./index-10mddjmz.js";import{I,A,g}from"./index.js";var i="rounded-md bg-neutral-200 px-3 py-1.5 text-neutral-800 text-xs transition-colors hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600",u=[0,45,90,180];function x(a){let e=0;a.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-8 p-6">
    <div class="relative flex h-40 w-40 items-center justify-center">
      <div class="absolute inset-0 rounded-lg border-2 border-neutral-300 border-dashed dark:border-neutral-700"></div>
      <div data-ref="box" class="flex size-20 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-purple-600 font-mono text-sm text-white shadow-lg transition-transform duration-200"></div>
    </div>
    <div data-ref="controls" class="flex w-full max-w-xs flex-col gap-3">
      <div class="flex items-center justify-between text-sm">
        <span class="text-neutral-600 dark:text-neutral-400">Rotation</span>
        <span data-ref="value" class="font-mono text-neutral-800 dark:text-neutral-200"></span>
      </div>
    </div>
    <div class="flex gap-2">
      ${u.map((t)=>I({className:i,label:`${t}°`,attrs:`data-preset="${t}"`}))}
    </div>
  </div>`;let{box:s,controls:o,value:d}=g(a);function r(){s.style.transform=`rotate(${e}deg)`,s.textContent=`${e}°`,d.textContent=`${e}deg`,n.value=e}let n=D({min:-180,max:180,step:5,value:e,className:"w-full",onValueChange:(t)=>{e=t??0,r()}});o.append(n.element),a.addEventListener("click",(t)=>{let l=t.target.closest("[data-preset]")?.dataset.preset;if(l!==void 0)e=Number(l),r()}),r()}export{x as mount};
