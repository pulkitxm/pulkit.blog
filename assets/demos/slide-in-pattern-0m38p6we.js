import{A,g,I,C}from"./index.js";var u=(r)=>{let e=C();function t(l){a.style.opacity=l?"1":"0",a.style.transform=l?"translateY(0)":"translateY(10px)"}function n(){return r.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
      ${g({className:"bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300",label:"Trigger slide-in",attrs:'data-ref="trigger"'})}
      <div class="relative h-24 w-48 overflow-hidden">
        <div data-ref="panel" class="absolute inset-0 flex items-center justify-center rounded-lg bg-cyan-500 font-medium text-white" style="opacity: 0; transform: translateY(10px); transition: opacity 300ms ease-out, transform 300ms ease-out">Slid in</div>
      </div>
    </div>`,A(r,"trigger",HTMLButtonElement).addEventListener("click",()=>{t(!1),e.later(()=>t(!0),100)}),A(r,"panel",HTMLDivElement)}let a=n();return e.later(()=>t(!0),300),{replay(){a=n(),e.later(()=>t(!0),100)},destroy:e.dispose}};export{u as mount};
