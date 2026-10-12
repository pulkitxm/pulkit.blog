import{A,s,e,I,C}from"./index.js";import{B}from"./index-apf7fdxr.js";var c=[{className:"size-8 rounded bg-blue-500",distance:60,duration:0.2,label:"Small: 200ms"},{className:"size-16 rounded bg-blue-500",distance:80,duration:0.35,label:"Medium: 350ms"},{className:"size-24 rounded bg-blue-500",distance:100,duration:0.5,label:"Large: 500ms"}],x=(a)=>{let t=!1,o=C(),r=o.slot();function d(){a.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-6 p-4">
      <button type="button" data-ref="toggle" class="${e()}">Animate</button>
      <div class="flex items-end gap-8">
        ${c.map((l,n)=>I`<div class="flex flex-col items-center gap-2">
            <div data-box="${n}" class="${l.className}"></div>
            <span class="text-neutral-600 text-xs dark:text-neutral-400">${l.label}</span>
          </div>`)}
      </div>
      <p class="max-w-sm text-center text-neutral-600 text-xs dark:text-neutral-400">Bigger elements carry more visual weight. They feel more natural with longer durations, like heavier objects in the physical world.</p>
    </div>`,A(a,"toggle",HTMLButtonElement).addEventListener("click",()=>m(!t))}function m(l){t=l,A(a,"toggle",HTMLButtonElement).textContent=t?"Reset":"Animate";for(let n of s(a,"[data-box]",HTMLDivElement)){let i=c[Number(n.dataset.box)];if(i)B(n,{x:t?i.distance:0},{duration:i.duration,ease:[0.16,1,0.3,1]})}}return d(),{destroy:o.dispose,replay(){r.cancel(),t=!1,d(),r.later(()=>m(!0),100)}}};export{x as mount};
