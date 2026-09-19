import{A,n,I,C}from"./index.js";import{B}from"./index-apf7fdxr.js";var x=["Open File","Run Command","Search Symbol"];function y(){let r=document.createElement("div");return r.className="absolute inset-x-0 top-10 mx-2 mt-2 rounded-md border border-neutral-300 bg-white p-2 shadow-lg dark:border-neutral-600 dark:bg-neutral-800",r.innerHTML=I`<input
      type="text"
      placeholder="Search..."
      class="mb-2 w-full rounded border border-neutral-300 bg-neutral-50 px-2 py-1 text-sm outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
    />
    <div class="space-y-1">
      ${x.map((l)=>`<div class="rounded px-2 py-1 text-neutral-700 text-sm hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700">${l}</div>`)}
    </div>`,r}var w=(r)=>{let l=!0,s=!1,i=0,e=null,o=!1,a,d=C();r.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-4 p-4">
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
  </div>`;let c=A(r,"placeholder",HTMLDivElement),p=A(r,"question",HTMLParagraphElement);function u(){return l?{duration:0.15,ease:[0.16,1,0.3,1]}:{duration:0}}function m(){if(e&&o){o=!1,a?.stop(),a=B(e,{opacity:1,y:0},u());return}if(e=y(),c.before(e),l)B(e,{opacity:0,y:-8},{duration:0}),a=B(e,{opacity:1,y:0},u())}function b(){if(!e)return;let t=e;o=!0,a?.stop(),a=B(t,l?{opacity:0,y:-8}:{opacity:0},u()),a.then(()=>{if(e===t&&o)t.remove(),e=null,o=!1})}function f(t){if(l=t,s=!s,i+=1,c.hidden=s,s)m();else b();p.hidden=i<=5,p.textContent=`After ${i} toggles, which feels faster for repeated use?`}return d.add(n("keydown",(t)=>{if(t.key==="j"||t.key==="J")f(!0);else if(t.key==="k"||t.key==="K")f(!1)})),d.add(()=>a?.stop()),{destroy:d.dispose}};export{w as mount};
