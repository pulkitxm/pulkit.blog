import{i,I,A,g}from"./index.js";import{C}from"./index-0gt3gf92.js";function x(s){let t=!1,e=null;s.innerHTML=A`<div class="space-y-6">
    <div class="flex gap-2">
      ${I({className:"w-24",label:"Animate",attrs:'data-ref="play"'})}
      ${I({variant:"outline",className:"w-24",label:"Loop",attrs:'data-ref="loop"'})}
    </div>
    <div class="flex items-center gap-4">
      <span class="w-20 font-medium text-neutral-900 text-sm dark:text-neutral-100">Linear</span>
      <div data-ref="linear" class="h-12 w-12 rounded bg-neutral-400 dark:bg-neutral-500" style="transform: translateX(0px); transition: transform 500ms linear"></div>
    </div>
    <div class="flex items-center gap-4">
      <span class="w-20 font-medium text-neutral-900 text-sm dark:text-neutral-100">Ease-out</span>
      <div data-ref="easeOut" class="h-12 w-12 rounded bg-neutral-500 dark:bg-neutral-400" style="transform: translateX(0px); transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1)"></div>
    </div>
    <div class="flex items-center gap-4">
      <span class="w-20 font-medium text-neutral-900 text-sm dark:text-neutral-100">Spring</span>
      <div data-ref="spring" class="h-12 w-12 rounded bg-neutral-600 dark:bg-neutral-300"></div>
    </div>
  </div>`;let{play:r,loop:n,linear:u,easeOut:p,spring:c}=g(s),l=null;function o(a){t=a,r.textContent=t?"Reset":"Animate";let m=`translateX(${t?200:0}px)`;u.style.transform=m,p.style.transform=m,l=C(c,{x:t?200:0},{damping:20,stiffness:300,type:"spring"})}function d(){if(e)clearInterval(e),e=null}return r.addEventListener("click",()=>o(!t)),n.addEventListener("click",()=>{if(e)d();else e=setInterval(()=>o(!t),600);let a=e!==null;n.className=i({variant:a?"default":"outline",className:"w-24"}),n.textContent=a?"Stop":"Loop"}),{destroy(){d(),l?.stop()}}}export{x as mount};
