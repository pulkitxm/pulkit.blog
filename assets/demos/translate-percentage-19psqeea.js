import{F}from"./index-a6mktay0.js";import{A,g}from"./index.js";function i(t){let e=!1;t.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
    <div class="flex flex-col gap-6 sm:flex-row sm:gap-12">
      <div class="flex flex-col items-center gap-3">
        <p class="font-medium text-neutral-700 text-sm dark:text-neutral-300">Small box (40px)</p>
        <div class="relative h-24 w-32 rounded-lg border border-neutral-400 border-dashed dark:border-neutral-600">
          <div data-ref="small" class="absolute top-2 left-2 flex size-10 items-center justify-center rounded-md bg-blue-500 font-medium text-white text-xs transition-transform duration-500 ease-out" style="transform: translateY(0)">40px</div>
        </div>
      </div>
      <div class="flex flex-col items-center gap-3">
        <p class="font-medium text-neutral-700 text-sm dark:text-neutral-300">Large box (64px)</p>
        <div class="relative h-36 w-32 rounded-lg border border-neutral-400 border-dashed dark:border-neutral-600">
          <div data-ref="large" class="absolute top-2 left-2 flex size-16 items-center justify-center rounded-md bg-purple-500 font-medium text-white text-xs transition-transform duration-500 ease-out" style="transform: translateY(0)">64px</div>
        </div>
      </div>
    </div>
    <div data-ref="slot" class="contents"></div>
    <p class="max-w-sm text-center text-neutral-500 text-xs dark:text-neutral-400">Both use <code class="rounded bg-neutral-200 px-1 dark:bg-neutral-800">translateY(100%)</code>, same value, but the small box moves 40px (its height) and the large one 64px. Percentages are relative to the element’s own size.</p>
  </div>`;let{small:s,large:l,slot:n}=g(t),a=F({variant:"outline",size:"sm",label1:"Apply translateY(100%)",label2:"Reset",onClick:()=>{e=!e,a.swapped=e;let r=e?"translateY(100%)":"translateY(0)";s.style.transform=r,l.style.transform=r}});n.replaceWith(a.element)}export{i as mount};
