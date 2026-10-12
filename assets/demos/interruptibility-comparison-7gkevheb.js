import{A,g,I}from"./index.js";import{B}from"./index-apf7fdxr.js";import{Q,o}from"./index-9xe00pb0.js";var e=32,x={damping:20,stiffness:200,type:"spring"};function c(t,n){let r=t.getBoundingClientRect();return{x:n.clientX-r.left-e/2,y:n.clientY-r.top-e/2}}var y=(t)=>{t.innerHTML=Q("gap-4 p-4",I`
    <p class="text-center text-neutral-600 text-sm dark:text-neutral-400">Click rapidly in each box and compare how they handle interruptions</p>
    <div class="flex flex-wrap items-center justify-center gap-6">
      <div class="flex flex-col items-center gap-2">
        ${g({variant:"outline",className:"relative h-32 w-48 cursor-pointer rounded-lg border-2 border-red-300 border-dashed bg-red-50 dark:border-red-800 dark:bg-red-950/30",label:`<div data-ref="cssBall" class="absolute rounded-full bg-red-500" style="height: ${e}px; left: 80px; top: 48px; transition: left 400ms ease-out, top 400ms ease-out; width: ${e}px"></div>`,attrs:'data-ref="cssBox"'})}
        <span class="text-neutral-600 dark:text-neutral-400 text-xs">CSS Transition</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        ${g({variant:"outline",className:"relative h-32 w-48 cursor-pointer rounded-lg border-2 border-green-300 border-dashed bg-green-50 dark:border-green-800 dark:bg-green-950/30",label:`<div data-ref="springBall" class="absolute rounded-full bg-green-500" style="height: ${e}px; left: 0px; top: 0px; width: ${e}px"></div>`,attrs:'data-ref="springBox"'})}
        <span class="text-neutral-600 dark:text-neutral-400 text-xs">Spring Animation</span>
      </div>
    </div>
    ${o("CSS transitions restart from scratch when interrupted. Spring animations preserve velocity and curve naturally to the new target.")}
  `);let n=A(t,"cssBox",HTMLButtonElement),r=A(t,"cssBall",HTMLDivElement),l=A(t,"springBox",HTMLButtonElement),d=A(t,"springBall",HTMLDivElement),p=[];return B(d,{x:80,y:48},{duration:0}),n.addEventListener("click",(s)=>{let{x:a,y:i}=c(n,s);r.style.left=`${a}px`,r.style.top=`${i}px`}),l.addEventListener("click",(s)=>{let{x:a,y:i}=c(l,s);p.push(B(d,{x:a,y:i},x))}),{destroy(){for(let s of p)s.stop()}}};export{y as mount};
