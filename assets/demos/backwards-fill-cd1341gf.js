import{I,A,g}from"./index.js";function o(n){let a=0;n.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-300">Both boxes have a 1s delay before fading in. Watch what happens during the delay.</p>
    <div class="flex flex-wrap items-center justify-center gap-12">
      <div class="flex flex-col items-center gap-3">
        <div class="flex h-28 w-24 items-center justify-center">
          <div data-ref="plain" class="size-14 rounded-lg bg-violet-500"></div>
        </div>
        <span class="font-medium text-neutral-700 text-xs dark:text-neutral-300">Without backwards</span>
      </div>
      <div class="flex flex-col items-center gap-3">
        <div class="flex h-28 w-24 items-center justify-center">
          <div data-ref="both" class="size-14 rounded-lg bg-amber-500"></div>
        </div>
        <span class="font-medium text-neutral-700 text-xs dark:text-neutral-300">With backwards</span>
      </div>
    </div>
    <style>
      @keyframes demo-delayed-fade {
        0% { opacity: 0; transform: translateY(8px); }
        100% { opacity: 1; transform: translateY(0); }
      }
    </style>
    ${I({size:"sm",label:"Play",attrs:'data-ref="play"'})}
    <p class="max-w-md text-center text-neutral-500 text-xs dark:text-neutral-400">Without backwards, the element is fully visible during the delay, then jumps to opacity 0 when the animation starts. With backwards (using "both" here), it applies the first keyframe immediately.</p>
  </div>`;let l=g(n),{plain:s,both:i}=l;function r(e){let t=e.cloneNode(!1);return t.removeAttribute("style"),e.replaceWith(t),t}function d(e,t){e.style.animation="demo-delayed-fade 0.5s ease",e.style.animationDelay="1s",e.style.animationFillMode=t}return l.play.addEventListener("click",()=>{cancelAnimationFrame(a),s=r(s),i=r(i),a=requestAnimationFrame(()=>{d(s,"forwards"),d(i,"both")})}),{destroy(){cancelAnimationFrame(a)}}}export{o as mount};
