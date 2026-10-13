import{QA}from"./index-05g2ebz8.js";import{A,o,g,I,C}from"./index.js";import{i,t}from"./index-6zst2n39.js";var l="Click the button to simulate heavy JavaScript work on the main thread.",m="Main thread is busy. Notice the transform animation stays smooth while the layout animation stutters.",h=(a)=>{let s=C(),e=s.slot();a.innerHTML=i("gap-6 p-6",I`
    ${g({className:"mb-2",label:"Add Main Thread Load",attrs:'data-ref="toggle"'})}
    <div class="flex flex-wrap items-center justify-center gap-8">
      <div class="flex flex-col items-center gap-3">
        <div class="relative h-20 w-48 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
          <div class="absolute top-0 bottom-0 m-auto h-8 w-8 rounded bg-red-500" style="animation: width-animation 2s ease-in-out infinite alternate"></div>
          <style>
            @keyframes width-animation {
              from { left: 8px; width: 32px; }
              to { left: calc(100% - 40px); width: 32px; }
            }
          </style>
        </div>
        <span class="text-neutral-600 dark:text-neutral-400 text-xs">Using left (layout)</span>
      </div>
      <div class="flex flex-col items-center gap-3">
        <div class="relative h-20 w-48 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
          <div class="absolute top-0 bottom-0 left-2 m-auto h-8 w-8 rounded bg-green-500" style="animation: transform-animation 2s ease-in-out infinite alternate"></div>
          <style>
            @keyframes transform-animation {
              from { transform: translateX(0); }
              to { transform: translateX(calc(192px - 48px)); }
            }
          </style>
        </div>
        <span class="text-neutral-600 dark:text-neutral-400 text-xs">Using transform (GPU)</span>
      </div>
    </div>
    ${t(l,{width:"max-w-sm",ref:"text"})}
  `);let r=A(a,"toggle",HTMLButtonElement),d=A(a,"text",HTMLParagraphElement);return r.addEventListener("click",()=>{if(e.active)e.cancel();else e.interval(()=>QA(5000000),16);let n=e.active;r.className=o({variant:n?"destructive":"default",className:"mb-2"}),r.textContent=n?"Stop Main Thread Load":"Add Main Thread Load",d.textContent=n?m:l}),{destroy:s.dispose}};export{h as mount};
