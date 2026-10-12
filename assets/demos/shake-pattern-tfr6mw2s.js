import{A,E,g,I,C}from"./index.js";var l="w-48 rounded-lg border-2 border-red-500 px-3 py-2 text-sm",p=(e)=>{let t=C();function r(i){s.className=E(l,i&&"animate-shake")}function a(){r(!0),t.later(()=>r(!1),300)}function n(){return e.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
      ${g({className:"bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300",label:"Trigger shake",attrs:'data-ref="trigger"'})}
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
    </div>`,A(e,"trigger",HTMLButtonElement).addEventListener("click",a),A(e,"input",HTMLInputElement)}let s=n();return{replay(){s=n(),a()},destroy:t.dispose}};export{p as mount};
