import{I,A,g}from"./index.js";function o(l){let t=0;l.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-300">Both boxes scale from 1 to 2. Watch what happens when the animation ends.</p>
    <div class="flex flex-wrap items-center justify-center gap-12">
      <div class="flex flex-col items-center gap-3">
        <div class="flex h-32 w-24 items-center justify-center">
          <div data-ref="plain" class="size-14 rounded-lg bg-rose-500"></div>
        </div>
        <span class="font-medium text-neutral-700 text-xs dark:text-neutral-300">Default (resets)</span>
      </div>
      <div class="flex flex-col items-center gap-3">
        <div class="flex h-32 w-24 items-center justify-center">
          <div data-ref="forwards" class="size-14 rounded-lg bg-emerald-500"></div>
        </div>
        <span class="font-medium text-neutral-700 text-xs dark:text-neutral-300">fill-mode: forwards</span>
      </div>
    </div>
    <style>
      @keyframes demo-scale-up {
        0% { transform: scale(1); }
        100% { transform: scale(2); }
      }
    </style>
    ${I({size:"sm",label:"Play",attrs:'data-ref="play"'})}
    <p class="max-w-md text-center text-neutral-500 text-xs dark:text-neutral-400">Without fill-mode, the element snaps back to scale(1) once the animation finishes. With forwards, it keeps the final keyframe values.</p>
  </div>`;let n=g(l),{plain:a,forwards:e}=n;function r(i){let s=i.cloneNode(!1);return s.removeAttribute("style"),i.replaceWith(s),s}return n.play.addEventListener("click",()=>{cancelAnimationFrame(t),a=r(a),e=r(e),t=requestAnimationFrame(()=>{a.style.animation="demo-scale-up 0.6s ease",e.style.animation="demo-scale-up 0.6s ease",e.style.animationFillMode="forwards"})}),{destroy(){cancelAnimationFrame(t)}}}export{o as mount};
