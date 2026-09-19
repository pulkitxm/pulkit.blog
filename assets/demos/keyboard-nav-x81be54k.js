import{A,a,n,g,I,C}from"./index.js";import{B}from"./index-apf7fdxr.js";var k=[{name:"index.tsx",type:"file"},{name:"components",type:"folder"},{name:"utils.ts",type:"file"},{name:"styles.css",type:"file"},{name:"hooks",type:"folder"}],H='<svg class="size-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>',D='<svg class="size-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>',w="absolute inset-x-1 h-8 rounded bg-blue-100 dark:bg-blue-900/40";function m(s){return`${4+s*32}px`}var F=(s)=>{let l=0,o=!0,d=!1,i,u=C();s.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-4 p-4">
    <div
      data-ref="browser"
      class="relative w-64 overflow-hidden rounded-lg border border-neutral-300 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
      role="application"
      aria-label="File browser demo"
    >
      <div class="border-neutral-200 border-b bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
        <span data-ref="hint" class="font-medium text-neutral-700 text-xs dark:text-neutral-300">Click to focus</span>
      </div>
      <div data-ref="list" class="relative p-1">
        <div data-ref="highlight" class="${w}" style="top: 4px"></div>
        ${k.map((e,t)=>g({attrs:`data-index="${t}"`,className:"relative z-10 h-8 w-full justify-start gap-2 rounded px-2 text-left font-normal text-sm",label:`${e.type==="folder"?H:D}<span class="text-neutral-800 dark:text-neutral-200">${e.name}</span>`,variant:"ghost"}))}
      </div>
    </div>
    <div class="flex flex-col items-center gap-2">
      <div class="flex items-center gap-2 text-xs">
        <span class="rounded bg-neutral-200 px-2 py-1 font-mono dark:bg-neutral-700">Shift</span>
        <span class="text-neutral-600 dark:text-neutral-400">to toggle animation</span>
      </div>
      <span data-ref="mode" class="text-xs text-blue-600 dark:text-blue-400">Animated</span>
    </div>
  </div>`;let f=A(s,"browser",HTMLDivElement),M=A(s,"hint",HTMLSpanElement),L=A(s,"list",HTMLDivElement),x=A(s,"mode",HTMLSpanElement),r=A(s,"highlight",HTMLDivElement);function h(){i?.stop(),i=void 0,r.style.transform=""}function c(e){if(e===l)return;if(l=e,!o){r.style.top=m(l);return}let t=r.getBoundingClientRect().top;h(),r.style.top=m(l);let p=t-r.getBoundingClientRect().top;if(p===0)return;let y=r;y.style.transform=`translateY(${p}px)`,i=B(0,1000,{damping:35,stiffness:500,type:"spring",onUpdate:(T)=>{let v=p*(1-T/1000);y.style.transform=v===0?"":`translateY(${v}px)`}})}function E(e){o=e,h();let t=document.createElement("div");t.className=w,t.style.top=m(l),r.replaceWith(t),r=t,x.textContent=o?"Animated":"Instant",x.className=o?"text-xs text-blue-600 dark:text-blue-400":"text-xs text-neutral-600 dark:text-neutral-400"}function b(e){d=e,M.textContent=d?"Use ↑↓ to navigate":"Click to focus"}return f.addEventListener("focusin",()=>b(!0)),f.addEventListener("focusout",()=>b(!1)),L.addEventListener("click",(e)=>{let t=a(e,"[data-index]",HTMLElement);if(t)c(Number(t.dataset.index))}),u.add(n("keydown",(e)=>{if(!d)return;if(e.key==="ArrowDown")e.preventDefault(),c(Math.min(l+1,k.length-1));else if(e.key==="ArrowUp")e.preventDefault(),c(Math.max(l-1,0));else if(e.shiftKey&&!e.repeat)E(!o)})),u.add(()=>i?.stop()),{destroy:u.dispose}};export{F as mount};
