import{A,g}from"./index.js";var u=["h-28 w-full max-w-full rounded-xl bg-linear-to-br shadow-md transition-[clip-path] duration-700 ease-out from-slate-600 to-slate-800","h-28 w-full max-w-full rounded-xl bg-linear-to-br shadow-md transition-[clip-path] duration-700 ease-out from-rose-500 to-orange-600","h-28 w-full max-w-full rounded-xl bg-linear-to-br shadow-md transition-[clip-path] duration-700 ease-out from-emerald-500 to-teal-700"],a="rounded bg-neutral-200 px-1 dark:bg-neutral-800";function h(r){r.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-3 p-4">
    <div
      data-ref="scroller"
      class="h-64 w-full max-w-sm overflow-y-auto overflow-x-hidden rounded-xl border border-neutral-200 bg-neutral-100/80 dark:border-neutral-700 dark:bg-neutral-900/80"
    >
      <div class="py-3">
        <p class="px-4 pb-2 text-center text-neutral-500 text-xs dark:text-neutral-400">Scroll inside this box</p>
        <div class="h-24 shrink-0" aria-hidden="true"></div>
        <div data-ref="panels" class="contents"></div>
        <div class="h-40 shrink-0" aria-hidden="true"></div>
      </div>
    </div>
    <p class="max-w-sm text-center text-neutral-600 text-sm dark:text-neutral-400">Each strip uses an IntersectionObserver with this scroll container as <code class="${a}">root</code>. When it crosses the threshold, <code class="${a}">clip-path</code> eases from off-screen to full.</p>
  </div>`;let{scroller:i,panels:s}=g(r),t=[];function n(){for(let e of t)e.disconnect();t=[]}function o(){n(),s.innerHTML=u.map((e)=>`<div class="shrink-0 px-2 pb-4"><div class="${e}" style="clip-path: inset(0 100% 0 0)"></div></div>`).join("");for(let e of s.children){let d=e.firstElementChild,l=new IntersectionObserver(([c])=>{if(c?.isIntersecting)d.style.clipPath="inset(0)"},{root:i,rootMargin:"0px",threshold:0.35});l.observe(e),t.push(l)}}return o(),{destroy:n,replay:o}}export{h as mount};
