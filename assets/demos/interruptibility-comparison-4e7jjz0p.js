import{I,A,g}from"./index.js";import{C}from"./index-0gt3gf92.js";var s=32,p={damping:20,stiffness:200,type:"spring"};function f(n){n.innerHTML=A`<div class="flex size-full flex-col items-center justify-center gap-4 p-4">
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-400">Click rapidly in each box and compare how they handle interruptions</p>
    <div class="flex flex-wrap items-center justify-center gap-6">
      <div class="flex flex-col items-center gap-2">
        ${I({variant:"outline",className:"relative h-32 w-48 cursor-pointer rounded-lg border-2 border-red-300 border-dashed bg-red-50 dark:border-red-800 dark:bg-red-950/30",label:`<div data-ref="cssBall" class="absolute rounded-full bg-red-500" style="height: ${s}px; left: 80px; top: 48px; transition: left 400ms ease-out, top 400ms ease-out; width: ${s}px"></div>`,attrs:'data-ref="cssBox"'})}
        <span class="text-neutral-500 text-xs">CSS Transition</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        ${I({variant:"outline",className:"relative h-32 w-48 cursor-pointer rounded-lg border-2 border-green-300 border-dashed bg-green-50 dark:border-green-800 dark:bg-green-950/30",label:`<div data-ref="springBall" class="absolute rounded-full bg-green-500" style="height: ${s}px; left: 0px; top: 0px; width: ${s}px"></div>`,attrs:'data-ref="springBox"'})}
        <span class="text-neutral-500 text-xs">Spring Animation</span>
      </div>
    </div>
    <p class="max-w-md text-center text-neutral-500 text-xs dark:text-neutral-400">CSS transitions restart from scratch when interrupted. Spring animations preserve velocity and curve naturally to the new target.</p>
  </div>`;let{cssBox:a,cssBall:i,springBox:l,springBall:o}=g(n),d=[];C(o,{x:80,y:48},{duration:0});function c(e,t){let r=e.getBoundingClientRect();return{x:t.clientX-r.left-s/2,y:t.clientY-r.top-s/2}}return a.addEventListener("click",(e)=>{let{x:t,y:r}=c(a,e);i.style.left=`${t}px`,i.style.top=`${r}px`}),l.addEventListener("click",(e)=>{let{x:t,y:r}=c(l,e);d.push(C(o,{x:t,y:r},p))}),{destroy(){for(let e of d)e.stop()}}}export{f as mount};
