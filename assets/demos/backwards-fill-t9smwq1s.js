import{A,v,g,I,C}from"./index.js";import{i,t,j}from"./index-6zst2n39.js";function r(e,a){e.style.animation="demo-delayed-fade 0.5s ease",e.style.animationDelay="1s",e.style.animationFillMode=a}var f=(e)=>{let a=C(),n=a.slot();e.innerHTML=i("gap-6 p-6",I`
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-300">Both boxes have a 1s delay before fading in. Watch what happens during the delay.</p>
    <div class="flex flex-wrap items-center justify-center gap-12">
      <div class="flex flex-col items-center gap-3">
        <div class="flex h-28 w-24 items-center justify-center">
          <div data-ref="plain" class="size-14 rounded-lg bg-violet-500"></div>
        </div>
        ${j("Without backwards")}
      </div>
      <div class="flex flex-col items-center gap-3">
        <div class="flex h-28 w-24 items-center justify-center">
          <div data-ref="both" class="size-14 rounded-lg bg-amber-500"></div>
        </div>
        ${j("With backwards")}
      </div>
    </div>
    <style>
      @keyframes demo-delayed-fade {
        0% { opacity: 0; transform: translateY(8px); }
        100% { opacity: 1; transform: translateY(0); }
      }
    </style>
    ${g({size:"sm",label:"Play",attrs:'data-ref="play"'})}
    ${t('Without backwards, the element is fully visible during the delay, then jumps to opacity 0 when the animation starts. With backwards (using "both" here), it applies the first keyframe immediately.')}
  `);let s=A(e,"plain",HTMLDivElement),l=A(e,"both",HTMLDivElement);return A(e,"play",HTMLButtonElement).addEventListener("click",()=>{n.cancel(),s=v(s,HTMLDivElement),l=v(l,HTMLDivElement),n.frame(()=>{r(s,"forwards"),r(l,"both")})}),{destroy:a.dispose}};export{f as mount};
