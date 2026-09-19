import{I,A}from"./index.js";function a(e){e.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-8 p-4">
    <div class="flex gap-8">
      <div class="flex flex-col items-center gap-3">
        ${I({className:"bg-neutral-800 text-white hover:bg-neutral-700 active:scale-100 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300",label:"No feedback"})}
        <span class="text-neutral-600 text-xs dark:text-neutral-300">No scale effect</span>
      </div>
      <div class="flex flex-col items-center gap-3">
        ${I({className:"bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300",label:"With feedback",attrs:'style="transition: transform 150ms ease-out"'})}
        <span class="text-neutral-600 text-xs dark:text-neutral-300">scale(0.97) + ease-out</span>
      </div>
    </div>
    <p class="max-w-xs text-center text-neutral-600 text-sm dark:text-neutral-300">Click and hold each button to feel the difference</p>
  </div>`}export{a as mount};
