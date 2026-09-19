import{A,g}from"./index.js";import{C}from"./index-0gt3gf92.js";var m={damping:15,mass:1,stiffness:200,type:"spring"},p="transform 600ms cubic-bezier(0.16, 1, 0.3, 1)";function b(r){let l="start",a=new Set;r.innerHTML=A`<div class="flex h-full w-full flex-col items-center justify-center gap-8 p-8">
    <div class="flex w-full max-w-md flex-col gap-6">
      <div class="flex items-center gap-4">
        <span class="w-24 font-medium text-neutral-600 text-sm dark:text-neutral-300">Ease-out</span>
        <div data-ref="track" class="relative h-12 flex-1 rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <div
            data-ref="ease"
            class="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full bg-neutral-400 dark:bg-neutral-500"
          ></div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <span class="w-24 font-medium text-neutral-600 text-sm dark:text-neutral-300">Spring</span>
        <div class="relative h-12 flex-1 rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <div
            data-ref="spring"
            class="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full bg-orange-500"
          ></div>
        </div>
      </div>
    </div>
    <p class="max-w-sm text-center text-neutral-600 text-xs dark:text-neutral-300">The spring overshoots and settles naturally. The ease-out follows a fixed curve.</p>
  </div>`;let{track:c,ease:i,spring:d}=g(r);C(d,{x:0},{duration:0});function o(e,s){let t=setTimeout(()=>{a.delete(t),e()},s);a.add(t)}function u(){return c.offsetWidth-32-16}function n(e,s){let t=u();if(t<=0)return;let f=e==="end"?t:0;i.style.transition=p,i.style.transform=e==="end"?`translateX(${t}px)`:"translateX(0)",C(d,{x:f},m),l=s}return o(()=>n("end","end"),100),{destroy(){for(let e of a)clearTimeout(e);a.clear()},replay(){if(l==="end")n("start","start"),o(()=>n("end","end"),700);else n("end","end")}}}export{b as mount};
