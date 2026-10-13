import{A,o,I,C}from"./index.js";import{B}from"./index-8jvjtsmp.js";var e=48,u={damping:20,mass:1,stiffness:200,type:"spring"},x=(r)=>{let n=C();r.innerHTML=I`<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
    <button
      type="button"
      data-ref="container"
      class="${o({variant:"outline",className:"relative h-64 w-full max-w-md cursor-pointer rounded-lg border-2 border-neutral-300 border-dashed bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900"})}"
    >
      <div
        data-ref="ball"
        class="absolute rounded-full bg-orange-500 shadow-lg"
        style="height: ${e}px; left: 0px; top: 0px; width: ${e}px"
      ></div>
      <span class="absolute bottom-3 left-1/2 -translate-x-1/2 text-neutral-500 dark:text-neutral-400 text-xs">Click anywhere to move</span>
    </button>
    <p class="max-w-sm text-center text-neutral-600 text-xs dark:text-neutral-300">Click rapidly. The ball preserves its velocity when redirected, no abrupt stops or restarts.</p>
  </div>`;let t=A(r,"container",HTMLButtonElement),s=A(r,"ball",HTMLDivElement),a=!1,l=()=>{if(a||t.offsetWidth===0)return;B(s,{x:t.clientWidth/2-e/2,y:t.clientHeight/2-e/2},{duration:0})},i=new ResizeObserver(l);return i.observe(t),n.add(()=>i.disconnect()),l(),t.addEventListener("click",(c)=>{a=!0;let d=t.getBoundingClientRect();B(s,{x:c.clientX-d.left-e/2,y:c.clientY-d.top-e/2},u)}),{destroy:n.dispose}};export{x as mount};
