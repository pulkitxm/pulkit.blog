import{m}from"./index-td2556c3.js";import{k,A,g,t,I}from"./index.js";var r=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"}]];var c=140,d=44,p=182,x=57,b=(e)=>{let l=`${t(r,"size-4 shrink-0")}<span>Button</span>`;e.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-8 p-6">
    <div class="flex flex-col gap-8 sm:flex-row sm:gap-16">
      <div class="flex w-50 flex-col items-center gap-4">
        <p class="font-medium text-neutral-700 text-sm dark:text-neutral-300">Using width + height</p>
        <div data-ref="sized" class="flex h-16 w-50 items-center justify-center">
          ${g({className:"flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-medium text-white transition-colors duration-300 hover:bg-amber-500",label:l})}
        </div>
        <p class="text-neutral-500 text-xs dark:text-neutral-400">Both dimensions, still layout</p>
      </div>
      <div class="flex w-50 flex-col items-center gap-4">
        <p class="font-medium text-neutral-700 text-sm dark:text-neutral-300">Using scale</p>
        <div data-ref="scaledBox" class="flex h-16 w-50 items-center justify-center">
          ${g({className:"flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 font-medium text-white transition-transform duration-300 hover:bg-teal-500",label:l})}
        </div>
        <p class="text-neutral-500 text-xs dark:text-neutral-400">Everything scales together</p>
      </div>
    </div>
    <div data-ref="slot" class="contents"></div>
  </div>`;let n=k(A(e,"sized",HTMLDivElement).firstElementChild,HTMLButtonElement),o=k(A(e,"scaledBox",HTMLDivElement).firstElementChild,HTMLButtonElement);function i(a){n.style.height=a?`${x}px`:`${d}px`,n.style.width=a?`${p}px`:`${c}px`,o.style.transform=a?"scale(1.3)":"scale(1)"}let s=m({variant:"outline",size:"sm",label1:"Grow",label2:"Reset",onClick:()=>{s.swapped=!s.swapped,i(s.swapped)}});A(e,"slot",HTMLDivElement).replaceWith(s.element),i(!1)};export{b as mount};
