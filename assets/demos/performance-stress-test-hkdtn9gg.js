import{i,I,E,A,g}from"./index.js";import{C}from"./index-0gt3gf92.js";var x=[["path",{d:"M5 12h14"}]];var v=[["path",{d:"M5 12h14"}],["path",{d:"M12 5v14"}]];var h="Add items and load to see how CSS GPU acceleration outperforms JS under stress.",T="Under load: CSS animations stay smooth, JS animations may stutter.";function U(u){let t=10,n=null,l=[],d=[];u.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-4 p-4">
    <div class="flex flex-wrap items-center justify-center gap-4">
      <div class="flex items-center gap-2">
        ${I({variant:"outline",size:"icon",label:E(x,"size-4"),attrs:'data-ref="minus"'})}
        <span data-ref="count" class="w-20 text-center text-sm"></span>
        ${I({variant:"outline",size:"icon",label:E(v,"size-4"),attrs:'data-ref="plus"'})}
      </div>
      ${I({variant:"secondary",size:"sm",label:"Add Load",attrs:'data-ref="load"'})}
    </div>
    <div class="flex w-full max-w-2xl gap-4">
      <div class="flex flex-1 flex-col gap-2">
        <span class="text-center text-neutral-500 text-xs">CSS (GPU)</span>
        <div class="relative h-28 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
          <div data-ref="cssTrack" class="flex h-full items-center"></div>
          <style>
            @keyframes move-css {
              from { transform: translateX(8px); }
              to { transform: translateX(180px); }
            }
          </style>
        </div>
      </div>
      <div class="flex flex-1 flex-col gap-2">
        <span class="text-center text-neutral-500 text-xs">Framer Motion (JS)</span>
        <div class="relative h-28 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
          <div data-ref="motionTrack" class="flex h-full items-center"></div>
        </div>
      </div>
    </div>
    <p data-ref="text" class="max-w-md text-center text-neutral-500 text-xs dark:text-neutral-400">${h}</p>
  </div>`;let{minus:m,plus:f,count:b,load:c,cssTrack:y,motionTrack:k,text:w}=g(u);function M(){while(l.length<t){let e=l.length,a=`${8+e%5*20}px`,s=document.createElement("div");s.className="absolute left-0 h-3 w-3 rounded-full bg-green-500",s.style.animation="move-css 2s ease-in-out infinite alternate",s.style.top=a,y.append(s),l.push(s);let r=document.createElement("div");r.className="absolute h-3 w-3 rounded-full bg-orange-500",r.style.top=a,k.append(r),C(r,{x:8},{duration:0});let S=C(r,{x:[8,180]},{delay:e/t*2,duration:2,ease:"easeInOut",repeat:Number.POSITIVE_INFINITY,repeatType:"reverse"});d.push({element:r,controls:S})}while(l.length>t){l.pop().remove();let{element:e,controls:a}=d.pop();a.stop(),e.remove()}}function o(){M(),l.forEach((a,s)=>{a.style.animationDelay=`${s/t*2}s`}),b.textContent=`${t} items`,m.disabled=t<=5,f.disabled=t>=50;let e=n!==null;c.className=i({variant:e?"destructive":"secondary",size:"sm"}),c.textContent=e?"Stop Load":"Add Load",w.textContent=e?T:h}function p(){if(n)clearInterval(n),n=null}return m.addEventListener("click",()=>{t=Math.max(5,t-5),o()}),f.addEventListener("click",()=>{t=Math.min(50,t+5),o()}),c.addEventListener("click",()=>{if(n)p();else n=setInterval(()=>{let e=0;for(let a=0;a<3000000;a++)e+=Math.sqrt(a)*Math.sin(a);return e},16);o()}),o(),{destroy(){p();for(let{controls:e}of d)e.stop()}}}export{U as mount};
