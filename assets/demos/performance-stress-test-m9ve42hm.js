import{QA}from"./index-05g2ebz8.js";import{A,o,g,Q,I,C,TA,$A}from"./index.js";import{B}from"./index-8jvjtsmp.js";import{i,t}from"./index-6zst2n39.js";var b="Add items and load to see how CSS GPU acceleration outperforms JS under stress.",S="Under load: CSS animations stay smooth, JS animations may stutter.",U=(a)=>{let e=10,u=C(),c=u.slot(),r=[],p=[];a.innerHTML=i("gap-4 p-4",I`
    <div class="flex flex-wrap items-center justify-center gap-4">
      <div class="flex items-center gap-2">
        ${g({variant:"outline",size:"icon",label:Q(TA,"size-4"),attrs:'data-ref="minus"'})}
        <span data-ref="count" class="w-20 text-center text-sm"></span>
        ${g({variant:"outline",size:"icon",label:Q($A,"size-4"),attrs:'data-ref="plus"'})}
      </div>
      ${g({variant:"secondary",size:"sm",label:"Add Load",attrs:'data-ref="load"'})}
    </div>
    <div class="flex w-full max-w-2xl gap-4">
      <div class="flex flex-1 flex-col gap-2">
        <span class="text-center text-neutral-600 dark:text-neutral-400 text-xs">CSS (GPU)</span>
        <div class="@container relative h-28 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
          <div data-ref="cssTrack" class="flex h-full items-center"></div>
          <style>
            @keyframes move-css {
              from { transform: translateX(8px); }
              to { transform: translateX(min(180px, calc(100cqw - 20px))); }
            }
          </style>
        </div>
      </div>
      <div class="flex flex-1 flex-col gap-2">
        <span class="text-center text-neutral-600 dark:text-neutral-400 text-xs">Framer Motion (JS)</span>
        <div class="relative h-28 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
          <div data-ref="motionTrack" class="flex h-full items-center"></div>
        </div>
      </div>
    </div>
    ${t(b,{ref:"text"})}
  `);let v=A(a,"minus",HTMLButtonElement),x=A(a,"plus",HTMLButtonElement),y=A(a,"count",HTMLSpanElement),f=A(a,"load",HTMLButtonElement),T=A(a,"cssTrack",HTMLDivElement),h=A(a,"motionTrack",HTMLDivElement),M=A(a,"text",HTMLParagraphElement);function k(n){let m=`${8+n%5*20}px`,s=document.createElement("div");s.className="absolute left-0 h-3 w-3 rounded-full bg-green-500",s.style.animation="move-css 2s ease-in-out infinite alternate",s.style.top=m,T.append(s),r.push(s);let l=document.createElement("div");l.className="absolute h-3 w-3 rounded-full bg-orange-500",l.style.top=m,h.append(l),B(l,{x:8},{duration:0});let E=B(l,{x:[8,Math.min(180,Math.max(8,h.clientWidth-20))]},{delay:n/e*2,duration:2,ease:"easeInOut",repeat:Number.POSITIVE_INFINITY,repeatType:"reverse"});p.push({element:l,controls:E})}function L(){while(r.length<e)k(r.length);while(r.length>e){r.pop()?.remove();let n=p.pop();n?.controls.stop(),n?.element.remove()}}function d(){L(),r.forEach((m,s)=>{m.style.animationDelay=`${s/e*2}s`}),y.textContent=`${e} items`,v.disabled=e<=5,x.disabled=e>=50;let n=c.active;f.className=o({variant:n?"destructive":"secondary",size:"sm"}),f.textContent=n?"Stop Load":"Add Load",M.textContent=n?S:b}return v.addEventListener("click",()=>{e=Math.max(5,e-5),d()}),x.addEventListener("click",()=>{e=Math.min(50,e+5),d()}),f.addEventListener("click",()=>{if(c.active)c.cancel();else c.interval(()=>QA(3000000),16);d()}),u.add(()=>{for(let{controls:n}of p)n.stop()}),d(),{destroy:u.dispose}};export{U as mount};
