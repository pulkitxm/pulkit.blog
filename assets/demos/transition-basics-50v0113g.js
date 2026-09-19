import{I,A}from"./index.js";function a(t){t.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-8 p-6">
    ${I({attrs:'data-ref="circle" style="transition: transform 0.2s ease"',className:"h-14 w-14 rounded-full bg-amber-400 hover:bg-amber-400 dark:bg-amber-500 dark:hover:bg-amber-500",size:"icon"})}
    <p class="max-w-xs text-center text-neutral-600 text-sm dark:text-neutral-300">Hover the circle. Transform interpolates from scale(1) to scale(1.5) over 0.2s with ease.</p>
  </div>`;let e=t.querySelector('[data-ref="circle"]');e.addEventListener("mouseenter",()=>{e.style.transform="scale(1.5)"}),e.addEventListener("mouseleave",()=>{e.style.transform="scale(1)"})}export{a as mount};
