import{A,I,C}from"./index.js";var n=700,l=300;function f(t){return["translateX(0) rotate(0deg)","translateX(60px) rotate(0deg)"][t]??"translateX(60px) rotate(45deg)"}function x(t){return["translateX(0) rotate(0deg)","translateX(0) rotate(45deg)"][t]??"rotate(45deg) translateX(60px)"}function i(){return'<div class="absolute inset-0 flex items-center justify-center"><div class="h-px w-full bg-neutral-300 dark:bg-neutral-700"></div></div><div class="absolute inset-0 flex items-center justify-center"><div class="h-full w-px bg-neutral-300 dark:bg-neutral-700"></div></div>'}var g=(t)=>{t.innerHTML=I`<div class="flex size-full flex-col items-center justify-center gap-6 p-6">
    <div class="flex flex-col gap-6 sm:flex-row sm:gap-12">
      <div class="flex flex-col items-center gap-3">
        <p class="text-center font-medium text-neutral-700 text-xs dark:text-neutral-300">translateX then rotate</p>
        <code class="rounded bg-neutral-100 px-2 py-1 text-[10px] dark:bg-neutral-800">translateX(60px) rotate(45deg)</code>
        <div class="relative h-40 w-40">
          ${i()}
          <div class="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2">
            <div data-ref="a" class="flex size-full items-center justify-center rounded bg-blue-500 font-bold text-sm text-white transition-transform ease-out">A</div>
          </div>
        </div>
        <p class="text-[10px] text-neutral-500 dark:text-neutral-400">Translates first, then rotates in place</p>
      </div>
      <div class="flex flex-col items-center gap-3">
        <p class="text-center font-medium text-neutral-700 text-xs dark:text-neutral-300">rotate then translateX</p>
        <code class="rounded bg-neutral-100 px-2 py-1 text-[10px] dark:bg-neutral-800">rotate(45deg) translateX(60px)</code>
        <div class="relative h-40 w-40">
          ${i()}
          <div class="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2">
            <div data-ref="b" class="flex size-full items-center justify-center rounded bg-rose-500 font-bold text-sm text-white transition-transform ease-out">B</div>
          </div>
        </div>
        <p class="text-[10px] text-neutral-500 dark:text-neutral-400">Rotates first, then translates diagonally</p>
      </div>
    </div>
    <p class="max-w-md text-center text-neutral-500 text-xs dark:text-neutral-400">Transforms apply left-to-right. Same functions, different order, different results.</p>
  </div>`;let o=A(t,"a",HTMLDivElement),d=A(t,"b",HTMLDivElement),e=C();function r(s){let c=[[o,f(s)],[d,x(s)]];for(let[a,u]of c)a.style.transform=u,a.style.transformOrigin="center center",a.style.transitionDuration=`${n}ms`}return r(0),e.later(()=>r(1),l),e.later(()=>r(2),l+n),{destroy:e.dispose}};export{g as mount};
