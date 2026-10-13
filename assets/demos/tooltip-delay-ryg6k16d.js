import{s,o,Q,I,C,bA,sA,zA,PA}from"./index.js";import{B}from"./index-8jvjtsmp.js";var p=[{icon:zA,label:"Home"},{icon:bA,label:"Search"},{icon:sA,label:"Settings"},{icon:PA,label:"Profile"}],H=(r)=>{let u=!1,l=!0,n,i=C(),c=i.slot();r.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-6 p-4">
    <div class="flex gap-1 rounded-lg border border-neutral-300 bg-neutral-100 p-1 dark:border-neutral-700 dark:bg-neutral-800">
      ${p.map((e,a)=>I`<div data-slot="${a}" class="relative">
          <button type="button" data-index="${a}" class="${o({size:"icon",variant:"ghost"})}" aria-label="${e.label}">
            ${Q(e.icon,"size-5")}
          </button>
        </div>`)}
    </div>
    <div class="flex flex-col items-center gap-2">
      <p class="text-center text-neutral-600 text-sm dark:text-neutral-400">Hover over each icon</p>
      <p class="max-w-xs text-center text-neutral-600 text-xs dark:text-neutral-400">First tooltip waits 400ms. After that, moving between icons shows tooltips instantly.</p>
    </div>
  </div>`;let b=s(r,"[data-slot]",HTMLDivElement);function d(e){if(n?.index===e)return;m();let a=p[e],f=b[e];if(!(a&&f))return;let t=document.createElement("div");if(t.className="absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-900 px-2 py-1 text-white text-xs dark:bg-neutral-100 dark:text-neutral-900",t.innerHTML=`${a.label}<div class="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-neutral-900 dark:border-b-neutral-100"></div>`,f.append(t),n={element:t,index:e},l)B(t,{opacity:0,y:4},{duration:0}),B(t,{opacity:1,y:0},{duration:0.15})}function m(){if(!n)return;let{element:e}=n;n=void 0,B(e,{opacity:0,y:4},{duration:l?0.15:0}).then(()=>e.remove())}function v(e){if(c.cancel(),u)d(e);else c.later(()=>{d(e),i.frame(()=>{u=!0,l=!1})},400)}function x(){c.cancel(),m()}for(let e of s(r,"[data-index]",HTMLButtonElement))e.addEventListener("mouseenter",()=>v(Number(e.dataset.index))),e.addEventListener("mouseleave",x);return{destroy:i.dispose}};export{H as mount};
