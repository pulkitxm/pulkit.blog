import{g,I}from"./index.js";var t="bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300",s=(e)=>{e.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-8 p-6">
    <div class="flex flex-wrap justify-center gap-12">
      <div class="flex flex-col items-center gap-4">
        <p class="font-medium text-neutral-900 text-sm dark:text-neutral-100">With Taste</p>
        ${g({className:t,label:"Subscribe",attrs:'style="transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)"'})}
        <p class="max-w-40 text-center text-neutral-500 text-xs dark:text-neutral-400">Spring easing with subtle overshoot. Feels alive.</p>
      </div>
      <div class="flex flex-col items-center gap-4">
        <p class="font-medium text-neutral-900 text-sm dark:text-neutral-100">Without Taste</p>
        ${g({className:t,label:"Subscribe",attrs:'style="transition: transform 200ms linear"'})}
        <p class="max-w-40 text-center text-neutral-500 text-xs dark:text-neutral-400">Linear timing. Same duration. Feels mechanical.</p>
      </div>
    </div>
    <p class="max-w-xs text-center text-neutral-600 text-sm dark:text-neutral-300">Click and hold each button to feel the difference</p>
  </div>`};export{s as mount};
