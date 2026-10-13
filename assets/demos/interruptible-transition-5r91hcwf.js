import{A,g,I}from"./index.js";import{i,t}from"./index-6zst2n39.js";var o="relative h-24 w-32 rounded-lg border-2 border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900",l="rounded px-3 py-1.5 text-xs",u=(e)=>{e.innerHTML=i("gap-8 p-6",I`
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-300">Hover and unhover quickly. The transition reverses smoothly; the keyframe jumps back.</p>
    <div class="flex flex-wrap items-center justify-center gap-10">
      <div class="flex flex-col items-center gap-3">
        <div class="${o}">
          <div data-ref="transitionDot" class="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full bg-blue-500" style="transform: translateX(0); transition: transform 0.5s ease"></div>
        </div>
        ${g({attrs:'data-ref="transitionTrigger"',className:l,label:"Hover me (transition)",size:"sm",variant:"secondary"})}
      </div>
      <div class="flex flex-col items-center gap-3">
        <div class="${o}">
          <div data-ref="keyframeDot" class="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full bg-amber-500" style="animation: none"></div>
        </div>
        ${g({attrs:'data-ref="keyframeTrigger"',className:l,label:"Hover me (keyframe)",size:"sm",variant:"secondary"})}
      </div>
    </div>
    <style>
      @keyframes slideRight {
        to { transform: translateX(72px); }
      }
    </style>
    ${t("Transitions are interruptible: unhover mid-way and they smoothly reverse. Keyframe animations run to completion.")}
  `);let r=A(e,"transitionDot",HTMLDivElement),a=A(e,"keyframeDot",HTMLDivElement),s=A(e,"transitionTrigger",HTMLButtonElement),n=A(e,"keyframeTrigger",HTMLButtonElement);s.addEventListener("mouseenter",()=>{r.style.transform="translateX(72px)"}),s.addEventListener("mouseleave",()=>{r.style.transform="translateX(0)"}),n.addEventListener("mouseenter",()=>{a.style.animation="slideRight 0.5s ease forwards"}),n.addEventListener("mouseleave",()=>{a.style.animation="none"})};export{u as mount};
