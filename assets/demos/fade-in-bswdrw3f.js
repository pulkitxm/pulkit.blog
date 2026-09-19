import{A}from"./index.js";function i(e){e.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-8 p-6">
    <div
      class="flex size-24 items-center justify-center rounded-xl bg-blue-500 font-semibold text-white"
      style="animation: demo-fade-in 1s ease"
    >Hello</div>
    <style>
      @keyframes demo-fade-in {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
    </style>
    <p class="max-w-xs text-center text-neutral-600 text-sm dark:text-neutral-300">The element fades from invisible to visible over 1 second using the ease timing function.</p>
  </div>`}export{i as mount};
