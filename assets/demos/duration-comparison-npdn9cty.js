import{I,A}from"./index.js";import{C}from"./index-0gt3gf92.js";var d=["Dashboard","Analytics","Settings","Help"],i=[{duration:0.18,label:"180ms"},{duration:0.4,label:"400ms"}];function p(n){let a=[!1,!1];n.innerHTML=A`<div class="flex size-full items-center justify-center gap-8 p-4">
    ${i.map((t,e)=>A`<div class="flex flex-col items-center gap-3">
        <div class="relative">
          ${I({attrs:`data-toggle="${e}"`,label:"Menu",variant:"outline"})}
          <div
            data-menu="${e}"
            class="absolute top-full left-0 mt-2 w-40 origin-top rounded-lg border border-neutral-300 bg-white py-1 shadow-lg dark:border-neutral-600 dark:bg-neutral-800"
            style="opacity: 0; pointer-events: none; transform: translateY(-8px) scale(0.95)"
          >
            ${d.map((o)=>I({attrs:`data-toggle="${e}"`,className:"w-full justify-start px-4 py-2 font-normal text-sm",label:o,variant:"ghost"}))}
          </div>
        </div>
        <span class="text-neutral-600 text-xs dark:text-neutral-400">${t.label}</span>
      </div>`)}
  </div>`;let r=[...n.querySelectorAll("[data-menu]")];function u(t){return{opacity:a[t]?1:0,scale:a[t]?1:0.95,y:a[t]?0:-8}}function s(t,e){r[t].style.pointerEvents=a[t]?"auto":"none",C(r[t],u(t),e)}function c(t){let e=t===0?1:0,o=[...a];a[t]=!a[t],a[e]=!1;for(let l of[0,1])if(o[l]!==a[l])s(l,{duration:i[l].duration,ease:[0.16,1,0.3,1]})}n.addEventListener("click",(t)=>{let e=t.target.closest("[data-toggle]");if(e)c(Number(e.dataset.toggle))}),s(0,{duration:0}),s(1,{duration:0})}export{p as mount};
