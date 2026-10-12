import{A,P,g,I,C}from"./index.js";import{Q,o,X}from"./index-9xe00pb0.js";var d=(e)=>{let a=C(),l=a.slot();e.innerHTML=Q("gap-6 p-6",I`
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-300">Both boxes scale from 1 to 2. Watch what happens when the animation ends.</p>
    <div class="flex flex-wrap items-center justify-center gap-12">
      <div class="flex flex-col items-center gap-3">
        <div class="flex h-32 w-24 items-center justify-center">
          <div data-ref="plain" class="size-14 rounded-lg bg-rose-500"></div>
        </div>
        ${X("Default (resets)")}
      </div>
      <div class="flex flex-col items-center gap-3">
        <div class="flex h-32 w-24 items-center justify-center">
          <div data-ref="forwards" class="size-14 rounded-lg bg-emerald-500"></div>
        </div>
        ${X("fill-mode: forwards")}
      </div>
    </div>
    <style>
      @keyframes demo-scale-up {
        0% { transform: scale(1); }
        100% { transform: scale(2); }
      }
    </style>
    ${g({size:"sm",label:"Play",attrs:'data-ref="play"'})}
    ${o("Without fill-mode, the element snaps back to scale(1) once the animation finishes. With forwards, it keeps the final keyframe values.")}
  `);let s=A(e,"plain",HTMLDivElement),t=A(e,"forwards",HTMLDivElement);return A(e,"play",HTMLButtonElement).addEventListener("click",()=>{l.cancel(),s=P(s,HTMLDivElement),t=P(t,HTMLDivElement),l.frame(()=>{s.style.animation="demo-scale-up 0.6s ease",t.style.animation="demo-scale-up 0.6s ease",t.style.animationFillMode="forwards"})}),{destroy:a.dispose}};export{d as mount};
