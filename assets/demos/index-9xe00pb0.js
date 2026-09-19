import{I}from"./index.js";var d="font-medium text-neutral-700 text-xs dark:text-neutral-300",s="font-mono text-neutral-600 text-xs dark:text-neutral-300",c="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-neutral-900 dark:bg-neutral-700 dark:accent-neutral-100";function Q(t,n){return`<div class="flex size-full flex-col items-center justify-center ${t}">${n}</div>`}function o(t,{width:n="max-w-md",ref:e}={}){return`<p${e===void 0?"":` data-ref="${e}"`} class="${n} text-center text-neutral-500 text-xs dark:text-neutral-400">${t}</p>`}function X(t){return`<span class="font-medium text-neutral-700 text-xs dark:text-neutral-300">${t}</span>`}function v({id:t,label:n,key:e,value:a,min:i,max:l,step:u,unit:r}){let x=r===void 0?`<span data-ref="${e}Value" class="${s}">${a}</span>`:`<span class="${s}"><span data-ref="${e}Value">${a}</span>${r}</span>`;return I`<div class="flex flex-col gap-1.5">
    <div class="flex items-center justify-between">
      <label for="${t}" class="${d}">${n}</label>
      ${x}
    </div>
    <input id="${t}" data-key="${e}" type="range" min="${i}" max="${l}" step="${u}" value="${a}" class="${c}" />
  </div>`}
export{Q,o,X,v};
