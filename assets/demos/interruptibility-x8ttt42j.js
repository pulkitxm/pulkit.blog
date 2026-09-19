import{i,A,g}from"./index.js";import{C}from"./index-0gt3gf92.js";var t=48,c={damping:20,mass:1,stiffness:200,type:"spring"};function u(e){return(JSON.parse(e.getRootNode().host?.dataset.frame??"{}").focusCode??!0)&&window.innerWidth<1024}function m(e){e.innerHTML=A`<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
    <button
      type="button"
      data-ref="container"
      class="${i({variant:"outline",className:"relative h-64 w-full max-w-md cursor-pointer rounded-lg border-2 border-neutral-300 border-dashed bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900"})}"
    >
      <div
        data-ref="ball"
        class="absolute rounded-full bg-orange-500 shadow-lg"
        style="height: ${t}px; left: 0px; top: 0px; width: ${t}px"
      ></div>
      <span class="absolute bottom-3 left-1/2 -translate-x-1/2 text-neutral-400 text-xs">Click anywhere to move</span>
    </button>
    <p class="max-w-sm text-center text-neutral-600 text-xs dark:text-neutral-300">Click rapidly. The ball preserves its velocity when redirected, no abrupt stops or restarts.</p>
  </div>`;let{container:n,ball:r}=g(e),a=u(e),l=a?0:n.offsetWidth,d=a?0:n.offsetHeight;C(r,{x:l/2-t/2,y:d/2-t/2},{duration:0}),n.addEventListener("click",(s)=>{let o=n.getBoundingClientRect();C(r,{x:s.clientX-o.left-t/2,y:s.clientY-o.top-t/2},c)})}export{m as mount};
