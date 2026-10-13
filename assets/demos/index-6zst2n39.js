import{I}from"./index.js";var c="font-medium text-neutral-700 text-xs dark:text-neutral-300",l="font-mono text-neutral-600 text-xs dark:text-neutral-300",p="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-neutral-900 dark:bg-neutral-700 dark:accent-neutral-100";function i(e,a){return`<div class="flex size-full flex-col items-center justify-center ${e}">${a}</div>`}function t(e,{width:a="max-w-md",ref:n}={}){return`<p${n===void 0?"":` data-ref="${n}"`} class="${a} text-center text-neutral-500 text-xs dark:text-neutral-400">${e}</p>`}function j(e){return`<span class="font-medium text-neutral-700 text-xs dark:text-neutral-300">${e}</span>`}function O({id:e,label:a,key:n,value:r,min:u,max:o,step:x,unit:s}){let d=s===void 0?`<span data-ref="${n}Value" class="${l}">${r}</span>`:`<span class="${l}"><span data-ref="${n}Value">${r}</span>${s}</span>`;return I`<div class="flex flex-col gap-1.5">
    <div class="flex items-center justify-between">
      <label for="${e}" class="${c}">${a}</label>
      ${d}
    </div>
    <input id="${e}" data-key="${n}" type="range" min="${u}" max="${o}" step="${x}" value="${r}" class="${p}" />
  </div>`}
export{i,t,j,O};
