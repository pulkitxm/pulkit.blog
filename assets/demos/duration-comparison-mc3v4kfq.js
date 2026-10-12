import{s,a,g,I}from"./index.js";import{B}from"./index-apf7fdxr.js";var p=["Dashboard","Analytics","Settings","Help"],u=[{duration:0.18,label:"180ms"},{duration:0.4,label:"400ms"}],m=[0,1];function f(r){return m.some((l)=>l===r)}var x=(r)=>{let l=[!1,!1];r.innerHTML=I`<div class="flex size-full items-center justify-center gap-8 p-4">
    ${u.map((e,t)=>I`<div class="flex flex-col items-center gap-3">
        <div class="relative">
          ${g({attrs:`data-toggle="${t}"`,label:"Menu",variant:"outline"})}
          <div
            data-menu="${t}"
            class="absolute top-full left-0 mt-2 w-40 origin-top rounded-lg border border-neutral-300 bg-white py-1 shadow-lg dark:border-neutral-600 dark:bg-neutral-800"
            style="opacity: 0; pointer-events: none; transform: translateY(-8px) scale(0.95)"
          >
            ${p.map((n)=>g({attrs:`data-toggle="${t}"`,className:"w-full justify-start px-4 py-2 font-normal text-sm",label:n,variant:"ghost"}))}
          </div>
        </div>
        <span class="text-neutral-600 text-xs dark:text-neutral-400">${e.label}</span>
      </div>`)}
  </div>`;let d=s(r,"[data-menu]",HTMLDivElement);function i(e,t){let n=d[e];if(!n)return;let o=l[e];n.style.pointerEvents=o?"auto":"none",B(n,{opacity:o?1:0,scale:o?1:0.95,y:o?0:-8},t)}function c(e){let t=e===0?1:0,n=[...l];l[e]=!l[e],l[t]=!1;for(let o of m)if(n[o]!==l[o])i(o,{duration:u[o].duration,ease:[0.16,1,0.3,1]})}r.addEventListener("click",(e)=>{let t=a(e,"[data-toggle]",HTMLElement),n=Number(t?.dataset.toggle);if(t&&f(n))c(n)}),i(0,{duration:0}),i(1,{duration:0})};export{x as mount};
