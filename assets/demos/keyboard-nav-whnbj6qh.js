import{A,a,n,g,Q,I,C,qA,vA}from"./index.js";import{B}from"./index-8jvjtsmp.js";var k=[{name:"index.tsx",type:"file"},{name:"components",type:"folder"},{name:"utils.ts",type:"file"},{name:"styles.css",type:"file"},{name:"hooks",type:"folder"}],D=Q(vA,"size-4 text-yellow-600"),H=Q(qA,"size-4 text-neutral-500"),w="absolute inset-x-1 h-8 rounded bg-blue-100 dark:bg-blue-900/40";function f(s){return`${4+s*32}px`}var P=(s)=>{let l=0,o=!0,d=!1,i,m=C();s.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-4 p-4">
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
        ${k.map((e,t)=>g({attrs:`data-index="${t}"`,className:"relative z-10 h-8 w-full justify-start gap-2 rounded px-2 text-left font-normal text-sm",label:`${e.type==="folder"?D:H}<span class="text-neutral-800 dark:text-neutral-200">${e.name}</span>`,variant:"ghost"}))}
      </div>
    </div>
    <div class="flex flex-col items-center gap-2">
      <div class="flex items-center gap-2 text-xs">
        <span class="rounded bg-neutral-200 px-2 py-1 font-mono dark:bg-neutral-700">Shift</span>
        <span class="text-neutral-600 dark:text-neutral-400">to toggle animation</span>
      </div>
      <span data-ref="mode" class="text-xs text-blue-600 dark:text-blue-400">Animated</span>
    </div>
  </div>`;let p=A(s,"browser",HTMLDivElement),L=A(s,"hint",HTMLSpanElement),M=A(s,"list",HTMLDivElement),x=A(s,"mode",HTMLSpanElement),r=A(s,"highlight",HTMLDivElement);function b(){i?.stop(),i=void 0,r.style.transform=""}function u(e){if(e===l)return;if(l=e,!o){r.style.top=f(l);return}let t=r.getBoundingClientRect().top;b(),r.style.top=f(l);let c=t-r.getBoundingClientRect().top;if(c===0)return;let y=r;y.style.transform=`translateY(${c}px)`,i=B(0,1000,{damping:35,stiffness:500,type:"spring",onUpdate:(T)=>{let v=c*(1-T/1000);y.style.transform=v===0?"":`translateY(${v}px)`}})}function E(e){o=e,b();let t=document.createElement("div");t.className=w,t.style.top=f(l),r.replaceWith(t),r=t,x.textContent=o?"Animated":"Instant",x.className=o?"text-xs text-blue-600 dark:text-blue-400":"text-xs text-neutral-600 dark:text-neutral-400"}function h(e){d=e,L.textContent=d?"Use ↑↓ to navigate":"Click to focus"}return p.addEventListener("focusin",()=>h(!0)),p.addEventListener("focusout",()=>h(!1)),M.addEventListener("click",(e)=>{let t=a(e,"[data-index]",HTMLElement);if(t)u(Number(t.dataset.index))}),m.add(n("keydown",(e)=>{if(!d)return;if(e.key==="ArrowDown")e.preventDefault(),u(Math.min(l+1,k.length-1));else if(e.key==="ArrowUp")e.preventDefault(),u(Math.max(l-1,0));else if(e.shiftKey&&!e.repeat)E(!o)})),m.add(()=>i?.stop()),{destroy:m.dispose}};export{P as mount};
