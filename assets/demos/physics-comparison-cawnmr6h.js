import{A,o,g,I,C}from"./index.js";import{B}from"./index-8jvjtsmp.js";var y=(t)=>{let e=!1,s=C(),a=s.slot();t.innerHTML=I`<div class="space-y-6">
    <div class="flex gap-2">
      ${g({className:"w-24",label:"Animate",attrs:'data-ref="play"'})}
      ${g({variant:"outline",className:"w-24",label:"Loop",attrs:'data-ref="loop"'})}
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
  </div>`;let r=A(t,"play",HTMLButtonElement),l=A(t,"loop",HTMLButtonElement),c=A(t,"linear",HTMLDivElement),p=A(t,"easeOut",HTMLDivElement),u=A(t,"spring",HTMLDivElement),i=null;function m(n){e=n,r.textContent=e?"Reset":"Animate";let d=`translateX(${e?200:0}px)`;c.style.transform=d,p.style.transform=d,i=B(u,{x:e?200:0},{damping:20,stiffness:300,type:"spring"})}return r.addEventListener("click",()=>m(!e)),l.addEventListener("click",()=>{if(a.active)a.cancel();else a.interval(()=>m(!e),600);let n=a.active;l.className=o({variant:n?"default":"outline",className:"w-24"}),l.textContent=n?"Stop":"Loop"}),s.add(()=>i?.stop()),{destroy:s.dispose}};export{y as mount};
