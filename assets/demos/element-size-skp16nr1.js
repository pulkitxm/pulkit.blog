import{i,A,g}from"./index.js";import{C}from"./index-0gt3gf92.js";var d=[{className:"size-8 rounded bg-blue-500",distance:60,duration:0.2,label:"Small: 200ms"},{className:"size-16 rounded bg-blue-500",distance:80,duration:0.35,label:"Medium: 350ms"},{className:"size-24 rounded bg-blue-500",distance:100,duration:0.5,label:"Large: 500ms"}];function m(t){let e=!1,s;function n(){t.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-6 p-4">
      <button type="button" data-ref="toggle" class="${i()}">Animate</button>
      <div class="flex items-end gap-8">
        ${d.map((a,l)=>A`<div class="flex flex-col items-center gap-2">
            <div data-box="${l}" class="${a.className}"></div>
            <span class="text-neutral-600 text-xs dark:text-neutral-400">${a.label}</span>
          </div>`)}
      </div>
      <p class="max-w-sm text-center text-neutral-600 text-xs dark:text-neutral-400">Bigger elements carry more visual weight. They feel more natural with longer durations, like heavier objects in the physical world.</p>
    </div>`,g(t).toggle.addEventListener("click",()=>r(!e))}function r(a){e=a,g(t).toggle.textContent=e?"Reset":"Animate";for(let l of t.querySelectorAll("[data-box]")){let o=d[Number(l.dataset.box)];C(l,{x:e?o.distance:0},{duration:o.duration,ease:[0.16,1,0.3,1]})}}return n(),{destroy(){clearTimeout(s)},replay(){clearTimeout(s),e=!1,n(),s=setTimeout(()=>r(!0),100)}}}export{m as mount};
