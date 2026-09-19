import{I,A,g}from"./index.js";import{C}from"./index-0gt3gf92.js";var v=[{name:"index.tsx",type:"file"},{name:"components",type:"folder"},{name:"utils.ts",type:"file"},{name:"styles.css",type:"file"},{name:"hooks",type:"folder"}],z='<svg class="size-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>',E='<svg class="size-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>',b="absolute inset-x-1 h-8 rounded bg-blue-100 dark:bg-blue-900/40",M={damping:35,stiffness:500,type:"spring"};function D(l){let n=0,s=!0,o=!1,r;l.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-4 p-4">
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
        <div data-ref="highlight" class="${b}" style="top: 4px"></div>
        ${v.map((e,t)=>I({attrs:`data-index="${t}"`,className:"relative z-10 h-8 w-full justify-start gap-2 rounded px-2 text-left font-normal text-sm",label:`${e.type==="folder"?z:E}<span class="text-neutral-800 dark:text-neutral-200">${e.name}</span>`,variant:"ghost"}))}
      </div>
    </div>
    <div class="flex flex-col items-center gap-2">
      <div class="flex items-center gap-2 text-xs">
        <span class="rounded bg-neutral-200 px-2 py-1 font-mono dark:bg-neutral-700">Shift</span>
        <span class="text-neutral-600 dark:text-neutral-400">to toggle animation</span>
      </div>
      <span data-ref="mode" class="text-xs text-blue-600 dark:text-blue-400">Animated</span>
    </div>
  </div>`;let{browser:u,hint:y,list:k,mode:c}=g(l),{highlight:a}=g(l);function f(){r?.stop(),r=void 0,a.style.transform=""}function i(e){if(e===n)return;if(n=e,!s){a.style.top=`${4+n*32}px`;return}let t=a.getBoundingClientRect().top;f(),a.style.top=`${4+n*32}px`;let d=t-a.getBoundingClientRect().top;if(d===0)return;let m=a;m.style.transform=`translateY(${d}px)`,r=C(0,1000,{...M,onUpdate:(L)=>{let h=d*(1-L/1000);m.style.transform=h===0?"":`translateY(${h}px)`}})}function w(e){s=e,f();let t=document.createElement("div");t.className=b,t.style.top=`${4+n*32}px`,a.replaceWith(t),a=t,c.textContent=s?"Animated":"Instant",c.className=s?"text-xs text-blue-600 dark:text-blue-400":"text-xs text-neutral-600 dark:text-neutral-400"}function p(e){o=e,y.textContent=o?"Use ↑↓ to navigate":"Click to focus"}function x(e){if(!o)return;if(e.key==="ArrowDown")e.preventDefault(),i(Math.min(n+1,v.length-1));else if(e.key==="ArrowUp")e.preventDefault(),i(Math.max(n-1,0));else if(e.shiftKey&&!e.repeat)w(!s)}return u.addEventListener("focusin",()=>p(!0)),u.addEventListener("focusout",()=>p(!1)),k.addEventListener("click",(e)=>{let t=e.target.closest("[data-index]");if(t)i(Number(t.dataset.index))}),globalThis.addEventListener("keydown",x),{destroy(){globalThis.removeEventListener("keydown",x),r?.stop()}}}export{D as mount};
