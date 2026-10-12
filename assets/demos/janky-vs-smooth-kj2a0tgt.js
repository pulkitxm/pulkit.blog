import{NA}from"./index-hypnjh2z.js";import{A,s,g,I}from"./index.js";import{Q,o}from"./index-9xe00pb0.js";var d=16,m="rounded-md bg-amber-500 px-4 py-2 font-medium text-white text-xs transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50",c=`
  @keyframes janky-pulse {
    0%, 100% {
      width: 100%;
      height: 100%;
    }
    50% {
      width: 40%;
      height: 40%;
    }
  }

  @keyframes smooth-pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.4);
    }
  }

  .janky-box {
    width: 100%;
    height: 100%;
    animation: janky-pulse 800ms ease-in-out infinite;
  }

  .smooth-box {
    width: 100%;
    height: 100%;
    animation: smooth-pulse 800ms ease-in-out infinite;
  }
`;function r(t){return Array.from({length:d},(a,e)=>`<div class="${t}" data-box style="animation-delay: ${e*50}ms; animation-play-state: running"></div>`)}var p=(t)=>{let a=!0;t.innerHTML=Q("gap-4 p-4",I`
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-400">Click &quot;Block Main Thread&quot; to see which animation survives</p>
    <div class="flex flex-wrap items-center justify-center gap-6">
      <div class="flex flex-col items-center gap-2">
        <div class="relative grid h-32 w-32 grid-cols-4 gap-1 overflow-hidden rounded-lg border border-red-200 bg-red-50 p-2 dark:border-red-900 dark:bg-red-950/40">
          ${r("janky-box rounded-sm bg-linear-to-br from-red-400 to-red-600")}
        </div>
        <span class="font-medium text-red-600 text-xs dark:text-red-400">Animates width, height</span>
        <span class="text-neutral-600 dark:text-neutral-400 text-xs">Triggers layout every frame</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <div class="relative grid h-32 w-32 grid-cols-4 gap-1 overflow-hidden rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-900 dark:bg-green-950/40">
          ${r("smooth-box rounded-sm bg-linear-to-br from-green-400 to-green-600")}
        </div>
        <span class="font-medium text-green-600 text-xs dark:text-green-400">Animates transform only</span>
        <span class="text-neutral-600 dark:text-neutral-400 text-xs">GPU handles it</span>
      </div>
    </div>
    <div class="flex gap-3">
      ${g({className:m,label:"Block Main Thread",attrs:'data-ref="block"'})}
      ${g({label:"Pause",attrs:'data-ref="toggle"'})}
    </div>
    <style>${c}</style>
    ${o("When you block the main thread, the left animation freezes because width/height changes require JavaScript. The right animation keeps running because transform is handled entirely by the GPU.",{width:"max-w-sm"})}
  `);let e=A(t,"block",HTMLButtonElement),n=A(t,"toggle",HTMLButtonElement),i=s(t,"[data-box]",HTMLDivElement);e.addEventListener("click",()=>{e.disabled=!0,e.textContent="Blocking for 2s...",NA(2000),e.disabled=!1,e.textContent="Block Main Thread"}),n.addEventListener("click",()=>{a=!a,n.textContent=a?"Pause":"Play";for(let l of i)l.style.animationPlayState=a?"running":"paused"})};export{p as mount};
