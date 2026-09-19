import{A,g}from"./index.js";var d="rounded bg-neutral-200 px-1 dark:bg-neutral-800";function x(a){a.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-4 p-6">
    <div
      data-ref="container"
      class="relative flex h-40 w-full max-w-md cursor-ns-resize touch-none select-none items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950"
    >
      <div class="relative flex h-24 items-center justify-center">
        <span data-ref="dashed" class="absolute font-bold text-5xl text-transparent" style="-webkit-text-stroke: 2px rgb(163 163 163)">reveal</span>
        <span data-ref="solid" class="absolute bg-linear-to-r from-sky-500 to-purple-600 bg-clip-text font-bold text-5xl text-transparent">reveal</span>
      </div>
    </div>
    <p class="max-w-md text-center text-neutral-600 text-sm dark:text-neutral-400">Move the pointer vertically. The dashed outline uses <code data-ref="dashedCode" class="${d}"></code> and the gradient fill uses <code data-ref="solidCode" class="${d}"></code>.</p>
  </div>`;let{container:r,dashed:l,solid:o,dashedCode:i,solidCode:c}=g(a);function s(t){let e=`inset(0 0 ${100-t}% 0)`,n=`inset(${t}% 0 0 0)`;l.style.clipPath=e,o.style.clipPath=n,i.textContent=e,c.textContent=n}r.addEventListener("pointermove",(t)=>{let e=r.getBoundingClientRect(),n=t.clientY-e.top;s(Math.round(Math.min(Math.max(n/e.height*100,10),90)))}),s(50)}export{x as mount};
