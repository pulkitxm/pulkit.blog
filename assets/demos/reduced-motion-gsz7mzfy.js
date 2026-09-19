import{I,A,g}from"./index.js";var d=["Settings","Profile","Notifications","Sign out"];function c(s){let e=!1,a=!1;s.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-6 p-4 sm:p-6">
    <div class="flex items-center gap-3">
      <label class="relative inline-flex cursor-pointer items-center">
        <input data-ref="toggle" type="checkbox" class="peer sr-only" aria-label="Simulate prefers-reduced-motion" />
        <div class="peer h-6 w-11 rounded-full bg-neutral-300 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-5 dark:bg-neutral-600"></div>
      </label>
      <span class="text-neutral-700 text-sm dark:text-neutral-300">Simulate <code class="rounded bg-neutral-200 px-1 dark:bg-neutral-700">prefers-reduced-motion</code></span>
    </div>
    <div class="relative h-48 w-full max-w-md">
      ${I({variant:"outline",className:"w-full justify-start",attrs:'data-ref="trigger"'})}
      <div data-ref="menu" class="absolute top-14 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
        ${d.map((o)=>`<div class="cursor-pointer px-4 py-3 text-neutral-700 text-sm transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">${o}</div>`)}
      </div>
    </div>
    <div class="max-w-md text-center">
      <p data-ref="note" class="text-neutral-600 text-sm dark:text-neutral-400"></p>
    </div>
  </div>`;let{toggle:n,trigger:l,menu:t,note:i}=g(s);function r(){if(l.textContent=e?"Close Menu":"Open Menu",t.removeAttribute("style"),t.style.opacity=e?"1":"0",a)t.style.transition="opacity 150ms ease-out, visibility 0ms";else t.style.transform=e?"translateY(0) scale(1)":"translateY(-8px) scale(0.95)",t.style.transition="opacity 200ms ease-out, transform 200ms cubic-bezier(0.16, 1, 0.3, 1), visibility 0ms";t.style.visibility=e?"visible":"hidden",i.innerHTML=a?'<span class="font-medium text-green-600 dark:text-green-400">Reduced motion:</span> Menu uses simple opacity fade. No transform animations.':'<span class="font-medium text-blue-600 dark:text-blue-400">Full motion:</span> Menu slides and scales with easing curves.'}n.addEventListener("change",()=>{a=n.checked,r()}),l.addEventListener("click",()=>{e=!e,r()}),r()}export{c as mount};
