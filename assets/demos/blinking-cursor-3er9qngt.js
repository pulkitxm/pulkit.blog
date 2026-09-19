import{A}from"./index.js";function s(e){e.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-8 p-6">
    <div class="flex items-center gap-0.5 rounded-lg bg-neutral-900 px-5 py-3 font-mono text-lg dark:bg-neutral-800">
      <span class="text-green-400">$</span>
      <span class="ml-2 text-neutral-200">npm start</span>
      <div class="ml-0.5 h-5 w-0.5 bg-neutral-200" style="animation: demo-blink 1s step-end infinite"></div>
    </div>
    <style>
      @keyframes demo-blink {
        50% { visibility: hidden; }
      }
    </style>
    <p class="max-w-sm text-center text-neutral-600 text-sm dark:text-neutral-300">A single keyframe at 50% toggles visibility. CSS fills in 0% and 100% automatically using the element's existing styles.</p>
  </div>`}export{s as mount};
