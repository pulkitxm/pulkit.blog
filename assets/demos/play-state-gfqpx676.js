import{A,o,Q,I,aA,nA}from"./index.js";import{i,t}from"./index-6zst2n39.js";var p=(n)=>{let e=!1;n.innerHTML=i("gap-6 p-6",I`
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-300">Pause and resume the animation. The element picks up exactly where it left off.</p>
    <div class="relative h-16 w-72 overflow-hidden rounded-lg border-2 border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
      <div
        data-ref="ball"
        class="absolute top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-sky-500"
        style="animation: demo-bounce-x 2s cubic-bezier(0.645, 0.045, 0.355, 1) infinite alternate; animation-play-state: running"
      ></div>
    </div>
    <style>
      @keyframes demo-bounce-x {
        0% { left: 8px; }
        100% { left: calc(100% - 48px); }
      }
    </style>
    <button type="button" data-ref="toggle" class="${o({variant:"secondary",size:"sm"})}"></button>
    ${t("animation-play-state toggles between running and paused. This is something CSS transitions cannot do.",{width:"max-w-sm"})}
  `);let s=A(n,"ball",HTMLDivElement),a=A(n,"toggle",HTMLButtonElement);function r(){s.style.animationPlayState=e?"paused":"running",a.innerHTML=e?`${Q(aA,"mr-1.5 size-3.5")}Resume`:`${Q(nA,"mr-1.5 size-3.5")}Pause`}a.addEventListener("click",()=>{e=!e,r()}),r()};export{p as mount};
