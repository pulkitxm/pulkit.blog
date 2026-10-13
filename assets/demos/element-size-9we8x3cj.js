import{A,s,o,I,C}from"./index.js";import{B}from"./index-8jvjtsmp.js";var c=[{className:"size-8 rounded bg-blue-500",distance:60,duration:0.2,label:"Small: 200ms"},{className:"size-16 rounded bg-blue-500",distance:80,duration:0.35,label:"Medium: 350ms"},{className:"size-24 rounded bg-blue-500",distance:100,duration:0.5,label:"Large: 500ms"}],x=(t)=>{let e=!1,i=C(),r=i.slot();function d(){t.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-6 p-4">
      <button type="button" data-ref="toggle" class="${o()}">Animate</button>
      <div class="flex items-end gap-8">
        ${c.map((a,l)=>I`<div class="flex flex-col items-center gap-2">
            <div data-box="${l}" class="${a.className}"></div>
            <span class="text-neutral-600 text-xs dark:text-neutral-400">${a.label}</span>
          </div>`)}
      </div>
      <p class="max-w-sm text-center text-neutral-600 text-xs dark:text-neutral-400">Bigger elements carry more visual weight. They feel more natural with longer durations, like heavier objects in the physical world.</p>
    </div>`,A(t,"toggle",HTMLButtonElement).addEventListener("click",()=>m(!e))}function m(a){e=a,A(t,"toggle",HTMLButtonElement).textContent=e?"Reset":"Animate";for(let l of s(t,"[data-box]",HTMLDivElement)){let n=c[Number(l.dataset.box)];if(n)B(l,{x:e?n.distance:0},{duration:n.duration,ease:[0.16,1,0.3,1]})}}return d(),{destroy:i.dispose,replay(){r.cancel(),e=!1,d(),r.later(()=>m(!0),100)}}};export{x as mount};
