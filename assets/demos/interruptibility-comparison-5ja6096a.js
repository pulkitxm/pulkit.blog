import{A,g,I}from"./index.js";import{B}from"./index-8jvjtsmp.js";import{i,t}from"./index-6zst2n39.js";var n=32,u={damping:20,stiffness:200,type:"spring"};function x(e,r){let s=e.getBoundingClientRect();return{x:r.clientX-s.left-n/2,y:r.clientY-s.top-n/2}}var v=(e)=>{e.innerHTML=i("gap-4 p-4",I`
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-400">Click rapidly in each box and compare how they handle interruptions</p>
    <div class="flex flex-wrap items-center justify-center gap-6">
      <div class="flex flex-col items-center gap-2">
        ${g({variant:"outline",className:"relative h-32 w-48 cursor-pointer rounded-lg border-2 border-red-300 border-dashed bg-red-50 dark:border-red-800 dark:bg-red-950/30",label:`<div data-ref="cssBall" class="absolute rounded-full bg-red-500" style="height: ${n}px; left: 80px; top: 48px; transition: left 400ms ease-out, top 400ms ease-out; width: ${n}px"></div>`,attrs:'data-ref="cssBox"'})}
        <span class="text-neutral-600 dark:text-neutral-400 text-xs">CSS Transition</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        ${g({variant:"outline",className:"relative h-32 w-48 cursor-pointer rounded-lg border-2 border-green-300 border-dashed bg-green-50 dark:border-green-800 dark:bg-green-950/30",label:`<div data-ref="springBall" class="absolute rounded-full bg-green-500" style="height: ${n}px; left: 0px; top: 0px; width: ${n}px"></div>`,attrs:'data-ref="springBox"'})}
        <span class="text-neutral-600 dark:text-neutral-400 text-xs">Spring Animation</span>
      </div>
    </div>
    ${t("CSS transitions restart from scratch when interrupted. Spring animations preserve velocity and curve naturally to the new target.")}
  `);let r=A(e,"cssBox",HTMLButtonElement),s=A(e,"cssBall",HTMLDivElement),d=A(e,"springBox",HTMLButtonElement),p=A(e,"springBall",HTMLDivElement),c=[];return B(p,{x:80,y:48},{duration:0}),r.addEventListener("click",(a)=>{let{x:o,y:l}=x(r,a);s.style.left=`${o}px`,s.style.top=`${l}px`}),d.addEventListener("click",(a)=>{let{x:o,y:l}=x(d,a);c.push(B(p,{x:o,y:l},u))}),{destroy(){for(let a of c)a.stop()}}};export{v as mount};
