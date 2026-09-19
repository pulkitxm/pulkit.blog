import{I,A}from"./index.js";var a="flex h-20 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-neutral-300 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800",r='<span class="text-neutral-600 text-xs dark:text-neutral-300">Hover</span>',s=[{caption:"Background and transform both transition",style:"transform: scale(1); transition: all 0.3s ease",title:"transition: all"},{caption:"Only transform transitions; background snaps",style:"transform: scale(1); transition: transform 0.3s ease; transition-property: transform",title:"Explicit properties"}];function l(e){e.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-8 p-6">
    <div class="flex flex-col gap-8 sm:flex-row sm:gap-16">
      ${s.map((t)=>`<div class="flex flex-col items-center gap-4">
        <p class="font-medium text-neutral-700 text-sm dark:text-neutral-300">${t.title}</p>
        ${I({attrs:`data-box style="${t.style}"`,className:a,label:r,variant:"outline"})}
        <span class="max-w-30 text-center text-neutral-500 text-xs dark:text-neutral-400">${t.caption}</span>
      </div>`)}
    </div>
    <p class="max-w-md text-center text-neutral-500 text-xs dark:text-neutral-400">With explicit properties you avoid transitioning values you did not intend to animate.</p>
  </div>`;for(let t of e.querySelectorAll("[data-box]"))t.addEventListener("mouseenter",()=>{t.style.backgroundColor="rgb(34 197 94)",t.style.transform="scale(1.1)"}),t.addEventListener("mouseleave",()=>{t.style.backgroundColor="",t.style.transform="scale(1)"})}export{l as mount};
