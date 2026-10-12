import{g,I}from"./index.js";import{Q,o}from"./index-9xe00pb0.js";var a=(t)=>{t.innerHTML=Q("gap-6 p-6",I`
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-400">Hover and click the buttons to feel the CSS transitions</p>
    <div class="flex flex-wrap items-center justify-center gap-6">
      ${g({className:"bg-blue-600 text-white shadow-sm hover:bg-blue-600 hover:shadow-lg active:shadow-md",label:"Shadow Shift",attrs:'style="transition: box-shadow 150ms ease-out"'})}
      ${g({className:"bg-purple-600 text-white hover:bg-purple-500 active:bg-purple-700",label:"Color Shift",attrs:'style="transition: background-color 150ms ease-out"'})}
      ${g({variant:"outline",className:"border-2 border-neutral-800 bg-transparent text-neutral-800 hover:bg-neutral-800 hover:text-white dark:border-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-200 dark:hover:text-neutral-900",label:"Fill Effect"})}
    </div>
    ${o("Pure CSS transitions. No JavaScript, no dependencies. Smooth 60fps hover effects.",{width:"max-w-sm"})}
  `)};export{a as mount};
