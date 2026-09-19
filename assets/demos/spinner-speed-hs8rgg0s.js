import{A}from"./index.js";var a=[{duration:"1.5s",feel:"Feels sluggish",label:"1.5s rotation"},{duration:"0.6s",feel:"Feels active",label:"0.6s rotation"}];function l(t){t.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-6 p-4">
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-400">Same wait time, different perceived speed</p>
    <div class="flex items-center gap-12">
      ${a.map((e)=>A`<div class="flex flex-col items-center gap-3">
          <div class="flex size-16 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <svg class="size-8 animate-spin text-blue-600" style="animation-duration: ${e.duration}" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <span class="text-neutral-600 text-xs dark:text-neutral-400">${e.label}</span>
          <span class="text-neutral-400 text-xs">${e.feel}</span>
        </div>`)}
    </div>
    <p class="max-w-sm text-center text-neutral-600 text-xs dark:text-neutral-400">A faster spinner creates the illusion that your app is working harder, even though the actual load time is identical.</p>
  </div>`}export{l as mount};
