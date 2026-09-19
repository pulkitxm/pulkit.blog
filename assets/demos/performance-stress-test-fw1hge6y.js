import{tA}from"./index-hypnjh2z.js";import{A,e,g,t,I,C}from"./index.js";import{B}from"./index-apf7fdxr.js";import{Q,o}from"./index-9xe00pb0.js";var b=[["path",{d:"M5 12h14"}]];var M=[["path",{d:"M5 12h14"}],["path",{d:"M12 5v14"}]];var y="Add items and load to see how CSS GPU acceleration outperforms JS under stress.",H="Under load: CSS animations stay smooth, JS animations may stutter.",W=(s)=>{let n=10,u=C(),c=u.slot(),l=[],p=[];s.innerHTML=Q("gap-4 p-4",I`
    <div class="flex flex-wrap items-center justify-center gap-4">
      <div class="flex items-center gap-2">
        ${g({variant:"outline",size:"icon",label:t(b,"size-4"),attrs:'data-ref="minus"'})}
        <span data-ref="count" class="w-20 text-center text-sm"></span>
        ${g({variant:"outline",size:"icon",label:t(M,"size-4"),attrs:'data-ref="plus"'})}
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
    ${o(y,{ref:"text"})}
  `);let v=A(s,"minus",HTMLButtonElement),x=A(s,"plus",HTMLButtonElement),T=A(s,"count",HTMLSpanElement),f=A(s,"load",HTMLButtonElement),k=A(s,"cssTrack",HTMLDivElement),h=A(s,"motionTrack",HTMLDivElement),L=A(s,"text",HTMLParagraphElement);function E(a){let m=`${8+a%5*20}px`,r=document.createElement("div");r.className="absolute left-0 h-3 w-3 rounded-full bg-green-500",r.style.animation="move-css 2s ease-in-out infinite alternate",r.style.top=m,k.append(r),l.push(r);let i=document.createElement("div");i.className="absolute h-3 w-3 rounded-full bg-orange-500",i.style.top=m,h.append(i),B(i,{x:8},{duration:0});let w=B(i,{x:[8,Math.min(180,Math.max(8,h.clientWidth-20))]},{delay:a/n*2,duration:2,ease:"easeInOut",repeat:Number.POSITIVE_INFINITY,repeatType:"reverse"});p.push({element:i,controls:w})}function S(){while(l.length<n)E(l.length);while(l.length>n){l.pop()?.remove();let a=p.pop();a?.controls.stop(),a?.element.remove()}}function d(){S(),l.forEach((m,r)=>{m.style.animationDelay=`${r/n*2}s`}),T.textContent=`${n} items`,v.disabled=n<=5,x.disabled=n>=50;let a=c.active;f.className=e({variant:a?"destructive":"secondary",size:"sm"}),f.textContent=a?"Stop Load":"Add Load",L.textContent=a?H:y}return v.addEventListener("click",()=>{n=Math.max(5,n-5),d()}),x.addEventListener("click",()=>{n=Math.min(50,n+5),d()}),f.addEventListener("click",()=>{if(c.active)c.cancel();else c.interval(()=>tA(3000000),16);d()}),u.add(()=>{for(let{controls:a}of p)a.stop()}),d(),{destroy:u.dispose}};export{W as mount};
