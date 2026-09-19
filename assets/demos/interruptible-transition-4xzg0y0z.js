import{A,g,I}from"./index.js";import{Q,o}from"./index-9xe00pb0.js";var n="relative h-24 w-32 rounded-lg border-2 border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900",i="rounded px-3 py-1.5 text-xs",f=(e)=>{e.innerHTML=Q("gap-8 p-6",I`
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-300">Hover and unhover quickly. The transition reverses smoothly; the keyframe jumps back.</p>
    <div class="flex flex-wrap items-center justify-center gap-10">
      <div class="flex flex-col items-center gap-3">
        <div class="${n}">
          <div data-ref="transitionDot" class="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full bg-blue-500" style="transform: translateX(0); transition: transform 0.5s ease"></div>
        </div>
        ${g({attrs:'data-ref="transitionTrigger"',className:i,label:"Hover me (transition)",size:"sm",variant:"secondary"})}
      </div>
      <div class="flex flex-col items-center gap-3">
        <div class="${n}">
          <div data-ref="keyframeDot" class="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full bg-amber-500" style="animation: none"></div>
        </div>
        ${g({attrs:'data-ref="keyframeTrigger"',className:i,label:"Hover me (keyframe)",size:"sm",variant:"secondary"})}
      </div>
    </div>
    <style>
      @keyframes slideRight {
        to { transform: translateX(72px); }
      }
    </style>
    ${o("Transitions are interruptible: unhover mid-way and they smoothly reverse. Keyframe animations run to completion.")}
  `);let t=A(e,"transitionDot",HTMLDivElement),r=A(e,"keyframeDot",HTMLDivElement),a=A(e,"transitionTrigger",HTMLButtonElement),s=A(e,"keyframeTrigger",HTMLButtonElement);a.addEventListener("mouseenter",()=>{t.style.transform="translateX(72px)"}),a.addEventListener("mouseleave",()=>{t.style.transform="translateX(0)"}),s.addEventListener("mouseenter",()=>{r.style.animation="slideRight 0.5s ease forwards"}),s.addEventListener("mouseleave",()=>{r.style.animation="none"})};export{f as mount};
