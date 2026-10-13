import{A,I}from"./index.js";import{i}from"./index-6zst2n39.js";var g=(n)=>{let r=50,a=!1;n.innerHTML=i("gap-4 p-6",I`
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
  `);let t=A(n,"container",HTMLDivElement),c=A(n,"top",HTMLDivElement),p=A(n,"line",HTMLDivElement),u=A(n,"handle",HTMLDivElement),m=A(n,"inset",HTMLSpanElement);function o(){let e=100-r;c.style.clipPath=`inset(0 ${e}% 0 0)`,p.style.left=`${r}%`,u.style.left=`${r}%`,m.textContent=String(e)}function d(e){let s=t.getBoundingClientRect(),f=Math.min(Math.max(e-s.left,0),s.width);r=Math.round(f/s.width*100),o()}function l(e){if(t.hasPointerCapture(e.pointerId))t.releasePointerCapture(e.pointerId);a=!1}t.addEventListener("pointerdown",(e)=>{t.setPointerCapture(e.pointerId),a=!0,d(e.clientX)}),t.addEventListener("pointermove",(e)=>{if(a)d(e.clientX)}),t.addEventListener("pointerup",l),t.addEventListener("pointercancel",l),o()};export{g as mount};
