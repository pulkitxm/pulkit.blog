import{I,A}from"./index.js";import{C}from"./index-0gt3gf92.js";var i=[{label:"No Bounce",description:"Professional, controlled",bounce:0,stiffness:400,damping:30},{label:"Subtle Bounce",description:"Adds life, not distracting",bounce:0.15,stiffness:400,damping:18},{label:"Excessive Bounce",description:"Playful, attention-grabbing",bounce:0.4,stiffness:400,damping:8}];function u({label:t,description:s,bounce:n}){return A`<div class="flex flex-col items-center gap-3">
    <span class="font-mono text-[10px] text-neutral-400">bounce: ${n}</span>
    <div class="relative flex h-32 w-32 items-end justify-center rounded-lg bg-neutral-100 pb-4 dark:bg-neutral-800">
      <div data-box class="h-10 w-10 rounded-lg bg-orange-500 shadow-md"></div>
    </div>
    <div class="text-center">
      <p class="font-medium text-neutral-800 text-sm dark:text-neutral-200">${t}</p>
      <p class="text-neutral-600 text-xs dark:text-neutral-300">${s}</p>
    </div>
  </div>`}function p(t){let s=!1,n=new Set;t.innerHTML=A`<div class="flex h-full w-full flex-col items-center justify-center gap-6 p-6">
    <div class="flex flex-wrap items-start justify-center gap-6">${i.map(u)}</div>
    ${I({className:"w-32",label:"Animate",attrs:"data-animate"})}
    <p class="max-w-md text-center text-neutral-600 text-xs dark:text-neutral-300">For most UI, subtle or no bounce is appropriate. Reserve high bounce for playful contexts.</p>
  </div>`;let r=[...t.querySelectorAll("[data-box]")];function a(e){if(e===s)return;s=e,r.forEach((l,o)=>{let{damping:c,stiffness:d}=i[o];C(l,{y:s?-60:0},{damping:c,mass:1,stiffness:d,type:"spring"})})}return t.querySelector("[data-animate]").addEventListener("click",()=>{a(!0);let e=setTimeout(()=>{n.delete(e),a(!1)},800);n.add(e)}),{destroy(){for(let e of n)clearTimeout(e)}}}export{p as mount};
