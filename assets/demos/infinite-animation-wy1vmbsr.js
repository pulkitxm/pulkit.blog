import{Q,I,oA}from"./index.js";import{i,t}from"./index-6zst2n39.js";var n=`
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
`,l=(e)=>{e.innerHTML=i("gap-8 p-6",I`
    <div class="flex flex-wrap items-stretch justify-center gap-12">
      <div class="flex min-w-16 flex-col items-center gap-4">
        <div class="flex size-16 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
          ${Q(oA,"size-8 text-blue-600",'style="animation: spin 1s linear infinite"')}
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
            ${[0,1,2].map((s)=>`<div class="h-8 w-2 rounded-full bg-green-500" style="animation: bounce-bar 1s ease-in-out infinite; animation-delay: ${s*0.15}s"></div>`)}
          </div>
        </div>
        <span class="text-center text-neutral-600 dark:text-neutral-400 text-xs">Audio Bars</span>
      </div>
    </div>
    <style>${n}</style>
    ${t("Infinite CSS animations run on the GPU. They never touch the main thread, so they stay smooth forever without draining batteries.",{width:"max-w-sm"})}
  `)};export{l as mount};
