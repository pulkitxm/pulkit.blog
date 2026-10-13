import{A,s,a,o,g,I}from"./index.js";import{i}from"./index-6zst2n39.js";var c={circle:{clipPath:"inset(5% 5% 5% 5% round 9999px)",label:"circle"},ellipse:{clipPath:"inset(12% 5% 12% 5% round 9999px)",label:"ellipse"},inset:{clipPath:"inset(12% 18% 12% 18% round 12px)",label:"inset"},none:{clipPath:"inset(0% 0% 0% 0% round 0px)",label:"none"}},d=["none","circle","ellipse","inset"],l="rounded bg-neutral-200 px-1 text-xs dark:bg-neutral-800";function x(e){return d.some((n)=>n===e)}var y=(e)=>{let n="circle";e.innerHTML=i("gap-6 p-6",I`
    <div class="flex flex-wrap justify-center gap-2">
      ${d.map((t)=>g({size:"sm",label:c[t].label,attrs:`data-select="${t}"`}))}
    </div>
    <div
      data-ref="box"
      class="flex size-48 max-w-full items-center justify-center rounded-xl border border-neutral-200 bg-linear-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg dark:border-neutral-700"
      style="transition: clip-path 0.5s cubic-bezier(0.22, 1, 0.36, 1)"
    ><span class="font-medium text-sm">content</span></div>
    <code data-ref="code" class="rounded-md bg-neutral-100 px-3 py-1.5 text-neutral-800 text-xs dark:bg-neutral-800 dark:text-neutral-200"></code>
    <p class="max-w-md text-center text-neutral-600 text-sm dark:text-neutral-400">The box keeps the same layout box. Only painting is clipped, like transforms skipping layout. These presets all use <code class="${l}">inset()</code> so <code class="${l}">clip-path</code> can transition; mixing <code class="${l}">circle()</code>, <code class="${l}">ellipse()</code>, and <code class="${l}">none</code> in one element typically does not interpolate.</p>
  `);let u=A(e,"box",HTMLDivElement),m=A(e,"code",HTMLElement);function r(){for(let t of s(e,"[data-select]",HTMLButtonElement))t.className=o({variant:n===t.dataset.select?"default":"outline",size:"sm"});u.style.clipPath=c[n].clipPath,m.textContent=`clip-path: ${c[n].clipPath}`}e.addEventListener("click",(t)=>{let p=a(t,"[data-select]",HTMLElement)?.dataset.select;if(x(p))n=p,r()}),r()};export{y as mount};
