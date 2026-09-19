import{i,I,A,g}from"./index.js";var a={circle:{clipPath:"inset(5% 5% 5% 5% round 9999px)",label:"circle"},ellipse:{clipPath:"inset(12% 5% 12% 5% round 9999px)",label:"ellipse"},inset:{clipPath:"inset(12% 18% 12% 18% round 12px)",label:"inset"},none:{clipPath:"inset(0% 0% 0% 0% round 0px)",label:"none"}},d=["none","circle","ellipse","inset"],t="rounded bg-neutral-200 px-1 text-xs dark:bg-neutral-800";function u(l){let s="circle";l.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
    <div class="flex flex-wrap justify-center gap-2">
      ${d.map((e)=>I({size:"sm",label:a[e].label,attrs:`data-select="${e}"`}))}
    </div>
    <div
      data-ref="box"
      class="flex size-48 max-w-full items-center justify-center rounded-xl border border-neutral-200 bg-linear-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg dark:border-neutral-700"
      style="transition: clip-path 0.5s cubic-bezier(0.22, 1, 0.36, 1)"
    ><span class="font-medium text-sm">content</span></div>
    <code data-ref="code" class="rounded-md bg-neutral-100 px-3 py-1.5 text-neutral-800 text-xs dark:bg-neutral-800 dark:text-neutral-200"></code>
    <p class="max-w-md text-center text-neutral-600 text-sm dark:text-neutral-400">The box keeps the same layout box. Only painting is clipped, like transforms skipping layout. These presets all use <code class="${t}">inset()</code> so <code class="${t}">clip-path</code> can transition; mixing <code class="${t}">circle()</code>, <code class="${t}">ellipse()</code>, and <code class="${t}">none</code> in one element typically does not interpolate.</p>
  </div>`;let{box:o,code:r}=g(l);function n(){for(let e of l.querySelectorAll("[data-select]"))e.className=i({variant:s===e.dataset.select?"default":"outline",size:"sm"});o.style.clipPath=a[s].clipPath,r.textContent=`clip-path: ${a[s].clipPath}`}l.addEventListener("click",(e)=>{let c=e.target.closest("[data-select]")?.dataset.select;if(c)s=c,n()}),n()}export{u as mount};
