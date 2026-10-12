import{A,I}from"./index.js";var l="rounded bg-neutral-200 px-1 dark:bg-neutral-800",m=(e)=>{e.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-4 p-6">
    <div
      data-ref="container"
      class="relative flex h-40 w-full max-w-md cursor-ns-resize touch-none select-none items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950"
    >
      <div class="relative flex h-24 items-center justify-center">
        <span data-ref="dashed" class="absolute font-bold text-5xl text-transparent" style="-webkit-text-stroke: 2px rgb(163 163 163)">reveal</span>
        <span data-ref="solid" class="absolute bg-linear-to-r from-sky-500 to-purple-600 bg-clip-text font-bold text-5xl text-transparent">reveal</span>
      </div>
    </div>
    <p class="max-w-md text-center text-neutral-600 text-sm dark:text-neutral-400">Move the pointer vertically. The dashed outline uses <code data-ref="dashedCode" class="${l}"></code> and the gradient fill uses <code data-ref="solidCode" class="${l}"></code>.</p>
  </div>`;let a=A(e,"container",HTMLDivElement),o=A(e,"dashed",HTMLSpanElement),r=A(e,"solid",HTMLSpanElement),i=A(e,"dashedCode",HTMLElement),c=A(e,"solidCode",HTMLElement);function d(n){let t=`inset(0 0 ${100-n}% 0)`,s=`inset(${n}% 0 0 0)`;o.style.clipPath=t,r.style.clipPath=s,i.textContent=t,c.textContent=s}a.addEventListener("pointermove",(n)=>{let t=a.getBoundingClientRect(),s=n.clientY-t.top;d(Math.round(Math.min(Math.max(s/t.height*100,10),90)))}),d(50)};export{m as mount};
