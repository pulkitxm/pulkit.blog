import{A,g}from"./index.js";import{C}from"./index-0gt3gf92.js";var v=["Open File","Run Command","Search Symbol"];function k(i){let a=!0,l=!1,s=0,t=null,r=!1,n;i.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-4 p-4">
    <div class="relative h-64 w-72 overflow-hidden rounded-lg border border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900">
      <div class="flex items-center justify-between border-neutral-300 border-b bg-neutral-200 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
        <span class="font-medium text-neutral-900 text-sm dark:text-neutral-100">Quick Launcher</span>
        <div class="flex gap-1">
          <div class="size-2 rounded-full bg-neutral-400"></div>
          <div class="size-2 rounded-full bg-neutral-400"></div>
          <div class="size-2 rounded-full bg-neutral-400"></div>
        </div>
      </div>
      <div data-ref="placeholder" class="flex h-full items-center justify-center pb-10">
        <span class="text-neutral-600 text-sm dark:text-neutral-400">Press J or K to toggle</span>
      </div>
    </div>
    <div class="flex flex-col items-center gap-2">
      <div class="flex gap-4 text-xs">
        <span class="rounded bg-neutral-200 px-2 py-1 font-mono dark:bg-neutral-700">J = animated</span>
        <span class="rounded bg-neutral-200 px-2 py-1 font-mono dark:bg-neutral-700">K = instant</span>
      </div>
      <p data-ref="question" class="max-w-xs text-center text-neutral-600 text-xs dark:text-neutral-400" hidden></p>
    </div>
  </div>`;let{placeholder:o,question:u}=g(i);function d(){return a?{duration:0.15,ease:[0.16,1,0.3,1]}:{duration:0}}function f(){let e=document.createElement("div");return e.className="absolute inset-x-0 top-10 mx-2 mt-2 rounded-md border border-neutral-300 bg-white p-2 shadow-lg dark:border-neutral-600 dark:bg-neutral-800",e.innerHTML=A`<input
        type="text"
        placeholder="Search..."
        class="mb-2 w-full rounded border border-neutral-300 bg-neutral-50 px-2 py-1 text-sm outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
      />
      <div class="space-y-1">
        ${v.map((b)=>`<div class="rounded px-2 py-1 text-neutral-700 text-sm hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700">${b}</div>`)}
      </div>`,e}function m(){if(t&&r){r=!1,n?.stop(),n=C(t,{opacity:1,y:0},d());return}if(t=f(),o.before(t),a)C(t,{opacity:0,y:-8},{duration:0}),n=C(t,{opacity:1,y:0},d())}function x(){if(!t)return;let e=t;r=!0,n?.stop(),n=C(e,a?{opacity:0,y:-8}:{opacity:0},d()),n.then(()=>{if(t===e&&r)e.remove(),t=null,r=!1})}function c(e){if(a=e,l=!l,s+=1,o.hidden=l,l)m();else x();u.hidden=s<=5,u.textContent=`After ${s} toggles, which feels faster for repeated use?`}function p(e){if(e.key==="j"||e.key==="J")c(!0);else if(e.key==="k"||e.key==="K")c(!1)}return globalThis.addEventListener("keydown",p),{destroy(){globalThis.removeEventListener("keydown",p),n?.stop()}}}export{k as mount};
