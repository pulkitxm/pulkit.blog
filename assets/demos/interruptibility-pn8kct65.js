import{i,A,g}from"./index.js";import{C}from"./index-0gt3gf92.js";var e=48,d={damping:20,mass:1,stiffness:200,type:"spring"};function p(r){r.innerHTML=A`<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
    <button
      type="button"
      data-ref="container"
      class="${i({variant:"outline",className:"relative h-64 w-full max-w-md cursor-pointer rounded-lg border-2 border-neutral-300 border-dashed bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900"})}"
    >
      <div
        data-ref="ball"
        class="absolute rounded-full bg-orange-500 shadow-lg"
        style="height: ${e}px; left: 0px; top: 0px; width: ${e}px"
      ></div>
      <span class="absolute bottom-3 left-1/2 -translate-x-1/2 text-neutral-500 dark:text-neutral-400 text-xs">Click anywhere to move</span>
    </button>
    <p class="max-w-sm text-center text-neutral-600 text-xs dark:text-neutral-300">Click rapidly. The ball preserves its velocity when redirected, no abrupt stops or restarts.</p>
  </div>`;let{container:t,ball:n}=g(r),a=!1,l=()=>{if(a||t.offsetWidth===0)return;C(n,{x:t.clientWidth/2-e/2,y:t.clientHeight/2-e/2},{duration:0})};new ResizeObserver(l).observe(t),l(),t.addEventListener("click",(s)=>{a=!0;let o=t.getBoundingClientRect();C(n,{x:s.clientX-o.left-e/2,y:s.clientY-o.top-e/2},d)})}export{p as mount};
