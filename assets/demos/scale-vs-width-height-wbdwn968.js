import{L}from"./index-8vjpqc91.js";import{k,A,g,Q,I,xA}from"./index.js";var r=140,o=44,c=182,m=57,u=(e)=>{let n=`${Q(xA,"size-4 shrink-0")}<span>Button</span>`;e.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-8 p-6">
    <div class="flex flex-col gap-8 sm:flex-row sm:gap-16">
      <div class="flex w-50 flex-col items-center gap-4">
        <p class="font-medium text-neutral-700 text-sm dark:text-neutral-300">Using width + height</p>
        <div data-ref="sized" class="flex h-16 w-50 items-center justify-center">
          ${g({className:"flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-medium text-white transition-colors duration-300 hover:bg-amber-500",label:n})}
        </div>
        <p class="text-neutral-500 text-xs dark:text-neutral-400">Both dimensions, still layout</p>
      </div>
      <div class="flex w-50 flex-col items-center gap-4">
        <p class="font-medium text-neutral-700 text-sm dark:text-neutral-300">Using scale</p>
        <div data-ref="scaledBox" class="flex h-16 w-50 items-center justify-center">
          ${g({className:"flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 font-medium text-white transition-transform duration-300 hover:bg-teal-500",label:n})}
        </div>
        <p class="text-neutral-500 text-xs dark:text-neutral-400">Everything scales together</p>
      </div>
    </div>
    <div data-ref="slot" class="contents"></div>
  </div>`;let l=k(A(e,"sized",HTMLDivElement).firstElementChild,HTMLButtonElement),i=k(A(e,"scaledBox",HTMLDivElement).firstElementChild,HTMLButtonElement);function a(s){l.style.height=s?`${m}px`:`${o}px`,l.style.width=s?`${c}px`:`${r}px`,i.style.transform=s?"scale(1.3)":"scale(1)"}let t=L({variant:"outline",size:"sm",label1:"Grow",label2:"Reset",onClick:()=>{t.swapped=!t.swapped,a(t.swapped)}});A(e,"slot",HTMLDivElement).replaceWith(t.element),a(!1)};export{u as mount};
