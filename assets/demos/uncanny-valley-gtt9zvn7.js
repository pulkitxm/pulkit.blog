import{P,Z}from"./index-54a7b6wm.js";import{I,A,g}from"./index.js";import{C}from"./index-0gt3gf92.js";function w(n){return!(n.pointerType==="touch"||P())}function m(n,s,r={}){let[u,e,x]=Z(n,r);return u.forEach((a)=>{let d=!1,i=!1,o,y=()=>{a.removeEventListener("pointerleave",p)},c=(t)=>{if(o)o(t),o=void 0;y()},l=(t)=>{if(d=!1,window.removeEventListener("pointerup",l),window.removeEventListener("pointercancel",l),i)i=!1,c(t)},h=()=>{d=!0,window.addEventListener("pointerup",l,e),window.addEventListener("pointercancel",l,e)},p=(t)=>{if(t.pointerType==="touch")return;if(d){i=!0;return}c(t)},b=(t)=>{if(!w(t))return;i=!1;let f=s(a,t);if(typeof f!=="function")return;o=f,a.addEventListener("pointerleave",p,e)};a.addEventListener("pointerenter",b,e),a.addEventListener("pointerdown",h,e)}),x}var v={damping:17,stiffness:400,type:"spring"};function T(n){n.innerHTML=A`<div class="mt-6 flex flex-col gap-8 p-6">
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="font-medium text-neutral-900 text-sm dark:text-neutral-100">Zone 1: No Animation (Accepted)</p>
        <span class="font-medium text-neutral-700 text-xs dark:text-neutral-300">✓</span>
      </div>
      ${I({variant:"secondary",label:"Instant Change"})}
      <p class="text-neutral-600 text-xs dark:text-neutral-400">Your brain says: "It's a computer, things change instantly. Normal."</p>
    </div>
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="font-medium text-neutral-900 text-sm dark:text-neutral-100">Zone 2: Linear Animation (Uncanny)</p>
        <span class="font-medium text-neutral-700 text-xs dark:text-neutral-300">⚠️</span>
      </div>
      ${I({variant:"secondary",className:"bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500",label:"Linear Motion",attrs:'data-ref="linear" style="transition: all 300ms linear"'})}
      <p class="text-neutral-600 text-xs dark:text-neutral-400">Your brain says: "Wait... it moved. But something feels mechanical and wrong. Like a robot trying to act human."</p>
    </div>
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="font-medium text-neutral-900 text-sm dark:text-neutral-100">Zone 3: Spring Animation (Natural)</p>
        <span class="font-medium text-neutral-700 text-xs dark:text-neutral-300">✓</span>
      </div>
      <button data-ref="spring" class="inline-flex cursor-pointer items-center gap-2 rounded-md bg-neutral-700 px-4 py-2 font-medium text-sm text-white hover:bg-neutral-800 active:scale-95 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300" type="button">Spring Motion</button>
      <p class="text-neutral-600 text-xs dark:text-neutral-400">Your brain says: "That feels right. It's responsive, has weight, and follows physics. Natural."</p>
    </div>
  </div>`;let{linear:s,spring:r}=g(n);return s.addEventListener("mouseenter",(e)=>{e.target.style.transform="scale(1.05)"}),s.addEventListener("mouseleave",(e)=>{e.target.style.transform="scale(1)"}),{destroy:m(r,()=>(C(r,{scale:1.05},v),()=>C(r,{scale:1},v)))}}export{T as mount};
