import{A,e,I,C}from"./index.js";import{B}from"./index-apf7fdxr.js";var r=48,u={damping:20,mass:1,stiffness:200,type:"spring"},x=(n)=>{let s=C();n.innerHTML=I`<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
    <button
      type="button"
      data-ref="container"
      class="${e({variant:"outline",className:"relative h-64 w-full max-w-md cursor-pointer rounded-lg border-2 border-neutral-300 border-dashed bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900"})}"
    >
      <div
        data-ref="ball"
        class="absolute rounded-full bg-orange-500 shadow-lg"
        style="height: ${r}px; left: 0px; top: 0px; width: ${r}px"
      ></div>
      <span class="absolute bottom-3 left-1/2 -translate-x-1/2 text-neutral-500 dark:text-neutral-400 text-xs">Click anywhere to move</span>
    </button>
    <p class="max-w-sm text-center text-neutral-600 text-xs dark:text-neutral-300">Click rapidly. The ball preserves its velocity when redirected, no abrupt stops or restarts.</p>
  </div>`;let t=A(n,"container",HTMLButtonElement),o=A(n,"ball",HTMLDivElement),a=!1,l=()=>{if(a||t.offsetWidth===0)return;B(o,{x:t.clientWidth/2-r/2,y:t.clientHeight/2-r/2},{duration:0})},i=new ResizeObserver(l);return i.observe(t),s.add(()=>i.disconnect()),l(),t.addEventListener("click",(c)=>{a=!0;let d=t.getBoundingClientRect();B(o,{x:c.clientX-d.left-r/2,y:c.clientY-d.top-r/2},u)}),{destroy:s.dispose}};export{x as mount};
