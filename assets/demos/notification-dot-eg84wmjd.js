import{E,A}from"./index.js";var e=[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"}]];var a=`
  @keyframes pulse-bad {
    0%, 100% {
      width: 10px;
      height: 10px;
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }
    50% {
      width: 14px;
      height: 14px;
      box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
    }
  }
  @keyframes pulse-good {
    0%, 100% {
      opacity: 0.7;
      transform: translateY(0);
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }
    50% {
      opacity: 1;
      transform: translateY(-2px);
      box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
    }
  }
`,t=()=>E(e,"size-6 text-neutral-600 dark:text-neutral-300");function n(s){s.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-8 p-6">
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-400">Same visual effect, different performance impact</p>
    <div class="flex flex-wrap items-center justify-center gap-16">
      <div class="flex flex-col items-center gap-4">
        <div class="relative">
          <div class="flex size-12 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">${t()}</div>
          <div class="absolute -top-1 -right-1 rounded-full bg-red-500" style="animation: pulse-bad 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; height: 10px; width: 10px"></div>
        </div>
        <div class="text-center">
          <span class="block font-medium text-red-600 text-xs">Bad</span>
          <span class="text-neutral-500 text-xs">Animates width/height</span>
        </div>
      </div>
      <div class="flex flex-col items-center gap-4">
        <div class="relative">
          <div class="flex size-12 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">${t()}</div>
          <div class="absolute -top-1 -right-1 size-2.5 rounded-full bg-red-500" style="animation: pulse-good 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"></div>
        </div>
        <div class="text-center">
          <span class="block font-medium text-green-600 text-xs">Good</span>
          <span class="text-neutral-500 text-xs">Animates transform</span>
        </div>
      </div>
    </div>
    <style>${a}</style>
    <div class="max-w-md rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <p class="text-center text-neutral-600 text-xs dark:text-neutral-400"><strong>The difference:</strong> The bad version triggers layout recalculation on every frame because width/height changes affect surrounding elements. The good version uses transform, which the GPU handles without touching layout.</p>
    </div>
  </div>`}export{n as mount};
