import{I,A}from"./index.js";function o(t){t.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-8 p-6">
    <div class="flex flex-wrap items-center justify-center gap-6">
      ${I({attrs:'style="transition-duration: 0.2s; transition-property: color, background-color, border-color; transition-timing-function: ease"',className:"border-2 border-blue-500 bg-transparent text-blue-600 hover:bg-blue-500 hover:text-white dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white",label:"Hover me",variant:"outline"})}
      ${I({attrs:'data-ref="multi" style="transition: 0.2s ease; transition-property: color, background-color"',className:"rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300",label:"Multiple properties"})}
    </div>
    <p class="max-w-md text-center text-neutral-500 text-xs dark:text-neutral-400">Same duration and easing for multiple properties: use shorthand plus transition-property for consistency.</p>
  </div>`;let e=t.querySelector('[data-ref="multi"]');e.addEventListener("mouseenter",()=>{e.style.backgroundColor="rgb(34 197 94)",e.style.color="white"}),e.addEventListener("mouseleave",()=>{e.style.backgroundColor="",e.style.color=""})}export{o as mount};
