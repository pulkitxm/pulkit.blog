import{g,I}from"./index.js";import{Q}from"./index-9xe00pb0.js";function t(e){return g({variant:"destructive",className:"group relative overflow-hidden bg-red-600 hover:bg-red-600",label:`<span class="${e}"></span><span class="relative">Hold to Delete</span>`})}var r=(e)=>{e.innerHTML=Q("gap-6 p-4",I`
    <div class="flex gap-8">
      <div class="flex flex-col items-center gap-3">
        ${t("absolute inset-0 origin-left scale-x-0 bg-red-800 transition-transform duration-1000 ease-linear group-active:scale-x-100")}
        <span class="text-neutral-600 text-xs dark:text-neutral-300">Linear (correct)</span>
      </div>
      <div class="flex flex-col items-center gap-3">
        ${t("absolute inset-0 origin-left scale-x-0 bg-red-800 transition-transform duration-1000 ease-in-out group-active:scale-x-100")}
        <span class="text-neutral-600 text-xs dark:text-neutral-300">Ease-in-out (wrong)</span>
      </div>
    </div>
    <p class="max-w-sm text-center text-neutral-600 text-sm dark:text-neutral-300">Hold each button. Linear feels predictable because time passes linearly.</p>
  `)};export{r as mount};
