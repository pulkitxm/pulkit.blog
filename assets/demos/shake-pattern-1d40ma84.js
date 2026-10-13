import{A,e,g,I,C}from"./index.js";var i="w-48 rounded-lg border-2 border-red-500 px-3 py-2 text-sm",d=(t)=>{let r=C();function a(o){l.className=e(i,o&&"animate-shake")}function n(){a(!0),r.later(()=>a(!1),300)}function s(){return t.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
      ${g({className:"bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300",label:"Trigger shake",attrs:'data-ref="trigger"'})}
      <div class="relative">
        <input data-ref="input" type="text" placeholder="Enter something invalid" class="${i}">
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
    </div>`,A(t,"trigger",HTMLButtonElement).addEventListener("click",n),A(t,"input",HTMLInputElement)}let l=s();return{replay(){l=s(),n()},destroy:r.dispose}};export{d as mount};
