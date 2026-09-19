import{D}from"./index-ed9fey8d.js";import{I,A,g}from"./index.js";function p(l){let e=0,t=0;l.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
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
    ${I({variant:"secondary",size:"sm",label:"Reset",attrs:'data-ref="reset"'})}
  </div>`;let{box:d,xGroup:i,yGroup:o,xValue:u,yValue:f,reset:x}=g(l);function a(){d.style.transform=`skew(${e}deg, ${t}deg)`,u.textContent=`${e}deg`,f.textContent=`${t}deg`,n.value=e,r.value=t}let n=D({min:-45,max:45,step:5,value:e,className:"w-full",onValueChange:(s)=>{e=s??0,a()}}),r=D({min:-45,max:45,step:5,value:t,className:"w-full",onValueChange:(s)=>{t=s??0,a()}});i.append(n.element),o.append(r.element),x.addEventListener("click",()=>{e=0,t=0,a()}),a()}export{p as mount};
