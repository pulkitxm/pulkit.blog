import{A,I,C}from"./index.js";import{Q}from"./index-9xe00pb0.js";var n=850,a="rounded bg-neutral-200 px-1 dark:bg-neutral-800",m=(r)=>{let o=C(),e=o.slot();r.innerHTML=Q("gap-4 p-6",I`
    <div
      data-ref="panel"
      class="aspect-video w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 shadow-md dark:border-neutral-700"
      style="clip-path: inset(100%); transition: clip-path ${n/1000}s cubic-bezier(0.22, 1, 0.36, 1)"
    >
      <div class="size-full min-h-48 bg-linear-to-br from-violet-600 via-fuchsia-600 to-orange-500" aria-hidden="true"></div>
    </div>
    <p class="max-w-md text-center text-neutral-600 text-sm dark:text-neutral-400">The panel keeps its size in the layout. Only the clip animates from <code class="${a}">inset(100%)</code> to <code class="${a}">inset(0)</code>, so nothing reflows around it.</p>
  `);let s=A(r,"panel",HTMLDivElement);function t(l){s.style.clipPath=l?"inset(0)":"inset(100%)"}return e.frame(()=>{e.frame(()=>t(!0))}),{destroy:o.dispose,replay(){e.cancel(),t(!1),e.later(()=>t(!0),n+50)}}};export{m as mount};
