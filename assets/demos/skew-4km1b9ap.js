import{U}from"./index-tg3a6emz.js";import{A,g,I}from"./index.js";var f=(e)=>{let t=0,a=0;e.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
    <div class="relative flex h-32 w-48 items-center justify-center">
      <div class="absolute inset-0 rounded-lg border-2 border-neutral-300 border-dashed dark:border-neutral-700"></div>
      <div data-ref="box" class="flex h-16 w-32 items-center justify-center rounded-lg bg-linear-to-r from-amber-500 to-orange-500 font-medium text-sm text-white shadow-lg transition-transform duration-200">Skewed</div>
    </div>
    <div class="flex w-full max-w-xs flex-col gap-4">
      <div data-ref="xGroup" class="flex flex-col gap-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-neutral-600 dark:text-neutral-400">skewX</span>
          <span data-ref="xValue" class="font-mono text-neutral-800 dark:text-neutral-200"></span>
        </div>
      </div>
      <div data-ref="yGroup" class="flex flex-col gap-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-neutral-600 dark:text-neutral-400">skewY</span>
          <span data-ref="yValue" class="font-mono text-neutral-800 dark:text-neutral-200"></span>
        </div>
      </div>
    </div>
    ${g({variant:"secondary",size:"sm",label:"Reset",attrs:'data-ref="reset"'})}
  </div>`;let d=A(e,"box",HTMLDivElement),i=A(e,"xValue",HTMLSpanElement),o=A(e,"yValue",HTMLSpanElement),s=U({min:-45,max:45,step:5,value:t,className:"w-full",onValueChange:(n)=>{t=n,l()}}),r=U({min:-45,max:45,step:5,value:a,className:"w-full",onValueChange:(n)=>{a=n,l()}});function l(){d.style.transform=`skew(${t}deg, ${a}deg)`,i.textContent=`${t}deg`,o.textContent=`${a}deg`,s.value=t,r.value=a}A(e,"xGroup",HTMLDivElement).append(s.element),A(e,"yGroup",HTMLDivElement).append(r.element),A(e,"reset",HTMLButtonElement).addEventListener("click",()=>{t=0,a=0,l()}),l()};export{f as mount};
