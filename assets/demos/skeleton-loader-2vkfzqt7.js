import{A}from"./index.js";var i="animation: demo-shimmer 1.5s ease-in-out infinite; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)";function e(t){return A`<div class="relative overflow-hidden rounded" style="height: 12px; width: ${t}">
    <div class="absolute inset-0 bg-neutral-200 dark:bg-neutral-700"></div>
    <div class="absolute inset-0" style="${i}"></div>
  </div>`}function a(t){t.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
    <div class="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
      <div class="flex items-center gap-3">
        <div class="relative size-10 shrink-0 overflow-hidden rounded-full">
          <div class="absolute inset-0 bg-neutral-200 dark:bg-neutral-700"></div>
          <div class="absolute inset-0" style="${i}"></div>
        </div>
        <div class="flex flex-col gap-2">
          ${e("120px")}
          ${e("80px")}
        </div>
      </div>
      <div class="mt-4 flex flex-col gap-2">
        ${e("100%")}
        ${e("100%")}
        ${e("70%")}
      </div>
    </div>
    <style>
      @keyframes demo-shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    </style>
    <p class="max-w-sm text-center text-neutral-600 text-sm dark:text-neutral-300">A shimmer effect using a single infinite keyframe animation. The gradient translates across each placeholder, giving the impression of loading content.</p>
  </div>`}export{a as mount};
