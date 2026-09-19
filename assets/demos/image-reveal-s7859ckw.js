import{A,g}from"./index.js";var l=850,s="rounded bg-neutral-200 px-1 dark:bg-neutral-800";function u(t){t.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-4 p-6">
    <div
      data-ref="panel"
      class="aspect-video w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 shadow-md dark:border-neutral-700"
      style="clip-path: inset(100%); transition: clip-path ${l/1000}s cubic-bezier(0.22, 1, 0.36, 1)"
    >
      <div class="size-full min-h-48 bg-linear-to-br from-violet-600 via-fuchsia-600 to-orange-500" aria-hidden="true"></div>
    </div>
    <p class="max-w-md text-center text-neutral-600 text-sm dark:text-neutral-400">The panel keeps its size in the layout. Only the clip animates from <code class="${s}">inset(100%)</code> to <code class="${s}">inset(0)</code>, so nothing reflows around it.</p>
  </div>`;let{panel:o}=g(t),n=0,i=0,a=0;function e(c){o.style.clipPath=c?"inset(0)":"inset(100%)"}function r(){cancelAnimationFrame(n),cancelAnimationFrame(i),clearTimeout(a)}return n=requestAnimationFrame(()=>{i=requestAnimationFrame(()=>e(!0))}),{destroy:r,replay(){r(),e(!1),a=setTimeout(()=>e(!0),l+50)}}}export{u as mount};
