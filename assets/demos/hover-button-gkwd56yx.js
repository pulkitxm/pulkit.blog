import{I,A}from"./index.js";function r(e){e.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-400">Hover and click the buttons to feel the CSS transitions</p>
    <div class="flex flex-wrap items-center justify-center gap-6">
      ${I({className:"bg-blue-600 text-white shadow-sm hover:bg-blue-600 hover:shadow-lg active:shadow-md",label:"Shadow Shift",attrs:'style="transition: box-shadow 150ms ease-out"'})}
      ${I({className:"bg-purple-600 text-white hover:bg-purple-500 active:bg-purple-700",label:"Color Shift",attrs:'style="transition: background-color 150ms ease-out"'})}
      ${I({variant:"outline",className:"border-2 border-neutral-800 bg-transparent text-neutral-800 hover:bg-neutral-800 hover:text-white dark:border-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-200 dark:hover:text-neutral-900",label:"Fill Effect"})}
    </div>
    <p class="max-w-sm text-center text-neutral-500 text-xs dark:text-neutral-400">Pure CSS transitions. No JavaScript, no dependencies. Smooth 60fps hover effects.</p>
  </div>`}export{r as mount};
