import{I,A}from"./index.js";function s(t){t.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
    ${I({attrs:'data-ref="card"',className:"relative h-40 w-64 cursor-pointer overflow-hidden rounded-xl border-neutral-200 bg-neutral-50 p-0 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-900",label:`<div class="flex h-full flex-col p-4">
        <span class="font-semibold text-neutral-800 dark:text-neutral-200">Project title</span>
        <div data-ref="reveal" class="mt-2 flex flex-1 flex-col justify-end" style="opacity: 0; transform: translateY(100%); transition: transform 0.25s ease, opacity 0.2s ease">
          <p class="text-wrap text-neutral-600 text-sm dark:text-neutral-300">Description revealed on hover using transform and opacity transitions.</p>
        </div>
      </div>`,variant:"outline"})}
    <p class="max-w-xs text-center text-neutral-500 text-xs dark:text-neutral-400">Hover the card. The description slides up and fades in with transform and opacity only.</p>
  </div>`;let a=t.querySelector('[data-ref="card"]'),e=t.querySelector('[data-ref="reveal"]');a.addEventListener("mouseenter",()=>{e.style.opacity="1",e.style.transform="translateY(0)"}),a.addEventListener("mouseleave",()=>{e.style.opacity="0",e.style.transform="translateY(100%)"})}export{s as mount};
