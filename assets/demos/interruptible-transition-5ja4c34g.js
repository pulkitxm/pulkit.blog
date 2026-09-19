import{I,A}from"./index.js";var i="relative h-24 w-32 rounded-lg border-2 border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900",l="rounded px-3 py-1.5 text-xs";function m(t){t.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-8 p-6">
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-300">Hover and unhover quickly. The transition reverses smoothly; the keyframe jumps back.</p>
    <div class="flex flex-wrap items-center justify-center gap-10">
      <div class="flex flex-col items-center gap-3">
        <div class="${i}">
          <div data-ref="transitionDot" class="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full bg-blue-500" style="transform: translateX(0); transition: transform 0.5s ease"></div>
        </div>
        ${I({attrs:'data-ref="transitionTrigger"',className:l,label:"Hover me (transition)",size:"sm",variant:"secondary"})}
      </div>
      <div class="flex flex-col items-center gap-3">
        <div class="${i}">
          <div data-ref="keyframeDot" class="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full bg-amber-500" style="animation: none"></div>
        </div>
        ${I({attrs:'data-ref="keyframeTrigger"',className:l,label:"Hover me (keyframe)",size:"sm",variant:"secondary"})}
      </div>
    </div>
    <style>
      @keyframes slideRight {
        to { transform: translateX(72px); }
      }
    </style>
    <p class="max-w-md text-center text-neutral-500 text-xs dark:text-neutral-400">Transitions are interruptible: unhover mid-way and they smoothly reverse. Keyframe animations run to completion.</p>
  </div>`;let e=(o)=>t.querySelector(`[data-ref="${o}"]`),r=e("transitionDot"),a=e("keyframeDot"),s=e("transitionTrigger"),n=e("keyframeTrigger");s.addEventListener("mouseenter",()=>{r.style.transform="translateX(72px)"}),s.addEventListener("mouseleave",()=>{r.style.transform="translateX(0)"}),n.addEventListener("mouseenter",()=>{a.style.animation="slideRight 0.5s ease forwards"}),n.addEventListener("mouseleave",()=>{a.style.animation="none"})}export{m as mount};
