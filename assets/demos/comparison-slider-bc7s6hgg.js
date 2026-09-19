import{A,g}from"./index.js";function v(i){let n=50,r=!1;i.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-4 p-6">
    <div
      data-ref="container"
      class="relative aspect-video w-full max-w-md cursor-ew-resize touch-none select-none overflow-hidden rounded-xl border border-neutral-200 shadow-md dark:border-neutral-700"
    >
      <div class="absolute inset-0 bg-linear-to-br from-amber-400 via-orange-500 to-rose-600" aria-hidden="true"></div>
      <div data-ref="top" class="absolute inset-0 bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-600" aria-hidden="true"></div>
      <div data-ref="line" class="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-md" style="transform: translateX(-50%)"></div>
      <div
        data-ref="handle"
        class="pointer-events-none absolute top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white/90 text-neutral-800 text-xs shadow"
      >↔</div>
    </div>
    <p class="max-w-md text-center text-neutral-600 text-sm dark:text-neutral-400">Drag across the frame. The top layer uses <code class="rounded bg-neutral-200 px-1 dark:bg-neutral-800">inset(0 <span data-ref="inset"></span>% 0 0)</code> so only the left strip stays visible.</p>
  </div>`;let{container:t,top:l,line:c,handle:u,inset:f}=g(i);function s(){let e=100-n;l.style.clipPath=`inset(0 ${e}% 0 0)`,c.style.left=`${n}%`,u.style.left=`${n}%`,f.textContent=e}function o(e){let a=t.getBoundingClientRect(),p=Math.min(Math.max(e-a.left,0),a.width);n=Math.round(p/a.width*100),s()}function d(e){if(t.hasPointerCapture(e.pointerId))t.releasePointerCapture(e.pointerId);r=!1}t.addEventListener("pointerdown",(e)=>{t.setPointerCapture(e.pointerId),r=!0,o(e.clientX)}),t.addEventListener("pointermove",(e)=>{if(r)o(e.clientX)}),t.addEventListener("pointerup",d),t.addEventListener("pointercancel",d),s()}export{v as mount};
