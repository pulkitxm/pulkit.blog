import{Q,I,A,g}from"./index.js";var l="w-48 rounded-lg border-2 border-red-500 px-3 py-2 text-sm";function u(r){let t=new Set,a=null;function n(e){a.className=Q(l,e&&"animate-shake")}function s(){n(!0);let e=setTimeout(()=>{t.delete(e),n(!1)},300);t.add(e)}function i(){r.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
      ${I({className:"bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300",label:"Trigger shake",attrs:'data-ref="trigger"'})}
      <div class="relative">
        <input data-ref="input" type="text" placeholder="Enter something invalid" class="${l}">
      </div>
      <style>
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 300ms ease-in-out;
        }
      </style>
    </div>`;let e=g(r);a=e.input,e.trigger.addEventListener("click",s)}return i(),{replay(){i(),s()},destroy(){for(let e of t)clearTimeout(e);t.clear()}}}export{u as mount};
