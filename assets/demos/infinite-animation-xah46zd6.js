import{A}from"./index.js";var s=`
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulse-notification {
    0%, 100% {
      opacity: 0.6;
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5);
    }
    50% {
      opacity: 1;
      box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
    }
  }
  @keyframes bounce-bar {
    0%, 100% { opacity: 0.4; transform: translateY(2px); }
    50% { opacity: 1; transform: translateY(-2px); }
  }
`;function a(e){e.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-8 p-6">
    <div class="flex flex-wrap items-stretch justify-center gap-12">
      <div class="flex min-w-16 flex-col items-center gap-4">
        <div class="flex size-16 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <svg class="size-8 text-blue-600" style="animation: spin 1s linear infinite" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <span class="text-center text-neutral-600 dark:text-neutral-400 text-xs">Loading Spinner</span>
      </div>
      <div class="flex min-w-16 flex-col items-center gap-4">
        <div class="flex size-16 shrink-0 items-center justify-center">
          <div class="size-4 rounded-full bg-red-500" style="animation: pulse-notification 2s ease-in-out infinite"></div>
        </div>
        <span class="text-center text-neutral-600 dark:text-neutral-400 text-xs">Pulsing Dot</span>
      </div>
      <div class="flex min-w-16 flex-col items-center gap-4">
        <div class="flex size-16 shrink-0 items-center justify-center">
          <div class="flex gap-1">
            ${[0,1,2].map((t)=>`<div class="h-8 w-2 rounded-full bg-green-500" style="animation: bounce-bar 1s ease-in-out infinite; animation-delay: ${t*0.15}s"></div>`)}
          </div>
        </div>
        <span class="text-center text-neutral-600 dark:text-neutral-400 text-xs">Audio Bars</span>
      </div>
    </div>
    <style>${s}</style>
    <p class="max-w-sm text-center text-neutral-500 text-xs dark:text-neutral-400">Infinite CSS animations run on the GPU. They never touch the main thread, so they stay smooth forever without draining batteries.</p>
  </div>`}export{a as mount};
