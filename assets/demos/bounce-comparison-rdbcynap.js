import{l,s,g,I,C}from"./index.js";import{B}from"./index-apf7fdxr.js";var o=[{label:"No Bounce",description:"Professional, controlled",bounce:0,stiffness:400,damping:30},{label:"Subtle Bounce",description:"Adds life, not distracting",bounce:0.15,stiffness:400,damping:18},{label:"Excessive Bounce",description:"Playful, attention-grabbing",bounce:0.4,stiffness:400,damping:8}];function f({label:e,description:t,bounce:n}){return I`<div class="flex flex-col items-center gap-3">
    <span class="font-mono text-[10px] text-neutral-500 dark:text-neutral-400">bounce: ${n}</span>
    <div class="relative flex h-32 w-32 items-end justify-center rounded-lg bg-neutral-100 pb-4 dark:bg-neutral-800">
      <div data-box class="h-10 w-10 rounded-lg bg-orange-500 shadow-md"></div>
    </div>
    <div class="text-center">
      <p class="font-medium text-neutral-800 text-sm dark:text-neutral-200">${e}</p>
      <p class="text-neutral-600 text-xs dark:text-neutral-300">${t}</p>
    </div>
  </div>`}var v=(e)=>{let t=!1,n=C();e.innerHTML=I`<div class="flex h-full w-full flex-col items-center justify-center gap-6 p-6">
    <div class="flex flex-wrap items-start justify-center gap-6">${o.map(f)}</div>
    ${g({className:"w-32",label:"Animate",attrs:"data-animate"})}
    <p class="max-w-md text-center text-neutral-600 text-xs dark:text-neutral-300">For most UI, subtle or no bounce is appropriate. Reserve high bounce for playful contexts.</p>
  </div>`;let c=s(e,"[data-box]",HTMLDivElement);function r(i){if(i===t)return;t=i,c.forEach((d,u)=>{let a=o[u];if(a)B(d,{y:t?-60:0},{damping:a.damping,mass:1,stiffness:a.stiffness,type:"spring"})})}return l(e,"[data-animate]",HTMLButtonElement).addEventListener("click",()=>{r(!0),n.later(()=>r(!1),800)}),{destroy:n.dispose}};export{v as mount};
