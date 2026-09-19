import{A,e,g,I,C}from"./index.js";import{B}from"./index-apf7fdxr.js";var y=(t)=>{let a=!1,l=C(),n=l.slot();t.innerHTML=I`<div class="space-y-6">
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
  </div>`;let i=A(t,"play",HTMLButtonElement),r=A(t,"loop",HTMLButtonElement),c=A(t,"linear",HTMLDivElement),p=A(t,"easeOut",HTMLDivElement),u=A(t,"spring",HTMLDivElement),o=null;function m(s){a=s,i.textContent=a?"Reset":"Animate";let d=`translateX(${a?200:0}px)`;c.style.transform=d,p.style.transform=d,o=B(u,{x:a?200:0},{damping:20,stiffness:300,type:"spring"})}return i.addEventListener("click",()=>m(!a)),r.addEventListener("click",()=>{if(n.active)n.cancel();else n.interval(()=>m(!a),600);let s=n.active;r.className=e({variant:s?"default":"outline",className:"w-24"}),r.textContent=s?"Stop":"Loop"}),l.add(()=>o?.stop()),{destroy:l.dispose}};export{y as mount};
