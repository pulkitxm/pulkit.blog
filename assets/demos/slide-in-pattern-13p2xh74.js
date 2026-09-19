import{I,A,g}from"./index.js";function c(l){let t=new Set,n=null;function a(e,o){let s=setTimeout(()=>{t.delete(s),e()},o);t.add(s)}function r(e){n.style.opacity=e?"1":"0",n.style.transform=e?"translateY(0)":"translateY(10px)"}function i(){l.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
      ${I({className:"bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300",label:"Trigger slide-in",attrs:'data-ref="trigger"'})}
      <div class="relative h-24 w-48 overflow-hidden">
        <div data-ref="panel" class="absolute inset-0 flex items-center justify-center rounded-lg bg-cyan-500 font-medium text-white" style="opacity: 0; transform: translateY(10px); transition: opacity 300ms ease-out, transform 300ms ease-out">Slid in</div>
      </div>
    </div>`;let e=g(l);n=e.panel,e.trigger.addEventListener("click",()=>{r(!1),a(()=>r(!0),100)})}return i(),a(()=>r(!0),300),{replay(){i(),a(()=>r(!0),100)},destroy(){for(let e of t)clearTimeout(e);t.clear()}}}export{c as mount};
