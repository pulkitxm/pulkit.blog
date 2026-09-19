import{i,A,g}from"./index.js";var n=[{description:"Safe, predictable, professional",duration:"300ms",easing:"ease-out",id:"standard",title:"Standard"},{description:"Quick, responsive, modern",duration:"200ms",easing:"cubic-bezier(0.16, 1, 0.3, 1)",id:"snappy",title:"Snappy"},{description:"Playful, energetic, attention-grabbing",duration:"400ms",easing:"cubic-bezier(0.34, 1.56, 0.64, 1)",id:"bouncy",title:"Bouncy"}],r=i({variant:"outline",size:"card",className:"rounded-lg border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"});function o(s){s.innerHTML=A`<div class="flex size-full flex-col items-center justify-center p-4 sm:p-6">
    <div class="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
      ${n.map((t)=>`<button type="button" class="${r}" data-ref="${t.id}" style="transform: translateY(0); transition: transform ${t.duration} ${t.easing}">
        <h4 class="font-medium text-neutral-900 dark:text-neutral-100">${t.title}</h4>
        <code class="mt-1 block break-words text-neutral-600 text-xs dark:text-neutral-300">${t.easing}</code>
        <p class="mt-2 text-neutral-600 text-sm dark:text-neutral-300">${t.description}</p>
      </button>`)}
    </div>
    <p class="mt-4 text-center text-neutral-600 text-xs sm:mt-6 sm:text-sm dark:text-neutral-300">Hover over each card to feel the different easing personalities</p>
  </div>`;let a=g(s);for(let t of n){let e=a[t.id];e.addEventListener("mouseenter",()=>{e.style.transform="translateY(-8px)"}),e.addEventListener("mouseleave",()=>{e.style.transform="translateY(0)"})}}export{o as mount};
