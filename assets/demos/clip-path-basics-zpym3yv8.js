import{A,s,a,e,g,I}from"./index.js";import{Q}from"./index-9xe00pb0.js";var i={circle:{clipPath:"inset(5% 5% 5% 5% round 9999px)",label:"circle"},ellipse:{clipPath:"inset(12% 5% 12% 5% round 9999px)",label:"ellipse"},inset:{clipPath:"inset(12% 18% 12% 18% round 12px)",label:"inset"},none:{clipPath:"inset(0% 0% 0% 0% round 0px)",label:"none"}},p=["none","circle","ellipse","inset"],o="rounded bg-neutral-200 px-1 text-xs dark:bg-neutral-800";function m(t){return p.some((l)=>l===t)}var b=(t)=>{let l="circle";t.innerHTML=Q("gap-6 p-6",I`
    <div class="flex flex-wrap justify-center gap-2">
      ${p.map((n)=>g({size:"sm",label:i[n].label,attrs:`data-select="${n}"`}))}
    </div>
    <div
      data-ref="box"
      class="flex size-48 max-w-full items-center justify-center rounded-xl border border-neutral-200 bg-linear-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg dark:border-neutral-700"
      style="transition: clip-path 0.5s cubic-bezier(0.22, 1, 0.36, 1)"
    ><span class="font-medium text-sm">content</span></div>
    <code data-ref="code" class="rounded-md bg-neutral-100 px-3 py-1.5 text-neutral-800 text-xs dark:bg-neutral-800 dark:text-neutral-200"></code>
    <p class="max-w-md text-center text-neutral-600 text-sm dark:text-neutral-400">The box keeps the same layout box. Only painting is clipped, like transforms skipping layout. These presets all use <code class="${o}">inset()</code> so <code class="${o}">clip-path</code> can transition; mixing <code class="${o}">circle()</code>, <code class="${o}">ellipse()</code>, and <code class="${o}">none</code> in one element typically does not interpolate.</p>
  `);let d=A(t,"box",HTMLDivElement),u=A(t,"code",HTMLElement);function c(){for(let n of s(t,"[data-select]",HTMLButtonElement))n.className=e({variant:l===n.dataset.select?"default":"outline",size:"sm"});d.style.clipPath=i[l].clipPath,u.textContent=`clip-path: ${i[l].clipPath}`}t.addEventListener("click",(n)=>{let r=a(n,"[data-select]",HTMLElement)?.dataset.select;if(m(r))l=r,c()}),c()};export{b as mount};
